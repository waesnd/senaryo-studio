import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { withAuth, createSupabaseUserClient } from "../lib/withAuth.js";
import { withAI, resolveRequestId } from "../lib/server/withAI.js";
import { aiOperations, generationInput } from "../lib/server/aiOperations.js";
import { callGroq, fetchJsonWithDeadline } from "../lib/groq.js";
import { createMediaHandlers, signCloudinary, MEDIA_MAX_BYTES } from "../lib/server/media.js";
import { createBoundedServerFetch } from "../lib/server/network.js";
import { readMultipartFile } from "../lib/server/multipart.js";

const owner = "00000000-0000-4000-8000-000000000001";
const other = "00000000-0000-4000-8000-000000000002";
const assetId = "00000000-0000-4000-8000-000000000003";
const scenario = { baslik: "Kıyı", tagline: "Son vapur", ana_fikir: "Kardeşler kayıp babalarının izini arar.", karakter: "Ayşe ve Kemal", acilis_sahnesi: "DIŞ — KIYI — GECE", buyuk_soru: "Bir arada kalabilirler mi?" };
function response() {
  return { statusCode: null, body: null, headers: {}, setHeader(name, value) { this.headers[name] = value; }, status(status) { this.statusCode = status; return this; }, json(body) { this.body = body; return this; } };
}
function request(body, headers = {}) { return { method: "POST", headers: { authorization: "Bearer verified-token", ...headers }, body }; }
function userClient(rpc = async () => ({ data: { allowed: true, remaining: 49 } }), extra = {}) { return { auth: { getUser: async () => ({ data: { user: { id: owner } }, error: null }) }, rpc, ...extra }; }
function aiHarness(operation = "generate", overrides = {}) {
  const calls = [];
  const client = userClient(overrides.reserve || (async (name, args) => { calls.push({ name, args }); return { data: { allowed: true, remaining: 49 } }; }));
  const settlement = { rpc: overrides.settle || (async (name, args) => { calls.push({ name, args }); return { data: { ok: true } }; }) };
  let modelCalls = 0;
  const handler = withAI(operation, aiOperations[operation], { authOptions: { clientFactory: () => client, enableRateLimit: false }, settlementClientFactory: () => settlement, callModel: async (...args) => { modelCalls += 1; return overrides.model ? overrides.model(...args) : scenario; } });
  return { handler, calls, modelCalls: () => modelCalls };
}

test("authenticated routes fail closed when token or config is missing", async () => {
  let called = false;
  const handler = withAuth(async () => { called = true; });
  const noToken = response();
  await handler(request({}, { authorization: "" }), noToken);
  assert.equal(noToken.statusCode, 401);
  assert.equal(called, false);
  const saved = process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    assert.throws(() => createSupabaseUserClient("x"), error => error.code === "AUTH_NOT_CONFIGURED");
    const missingConfig = response();
    await handler(request({}), missingConfig);
    assert.equal(missingConfig.statusCode, 503);
    assert.equal(missingConfig.body.code, "AUTH_NOT_CONFIGURED");
  } finally { if (saved === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = saved; }
});

test("only a verified JWT creates request user and token-bound database client", async () => {
  const client = userClient();
  let supplied;
  const handler = withAuth((req, res) => res.status(200).json({ uid: req.user.id, bound: req.supabase === client }), { clientFactory: token => { supplied = token; return client; }, enableRateLimit: false });
  const res = response();
  await handler(request({}), res);
  assert.equal(supplied, "verified-token");
  assert.deepEqual(res.body, { uid: owner, bound: true });
});

test("zero, fractional, negative and malformed scene counts are rejected rather than ignored", () => {
  for (const value of [0, -1, 1.5, "nope", 201]) assert.equal(generationInput.safeParse({ tip: "Film", tur: "Drama", sahneSayisi: value }).success, false);
  assert.equal(generationInput.parse({ tip: "Film", tur: "Drama", sahneSayisi: "5" }).sahneSayisi, 5);
  assert.equal(generationInput.parse({ tip: "Film", tur: "Drama", sahneSayisi: "" }).sahneSayisi, undefined);
});

test("quota outage prevents provider call", async () => {
  const h = aiHarness("generate", { reserve: async () => ({ error: { message: "DB unavailable" } }) });
  const res = response();
  await h.handler(request({ tip: "Film", tur: "Drama" }), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.code, "QUOTA_UNAVAILABLE");
  assert.equal(h.modelCalls(), 0);
});

test("parallel last-slot reservation allows only the database-authorized request", async () => {
  let slots = 1;
  const h = aiHarness("generate", { reserve: async () => ({ data: slots-- > 0 ? { allowed: true, remaining: 0 } : { allowed: false, code: "DAILY_LIMIT_EXCEEDED", remaining: 0, retryAfterMs: 1000, resetAt: "2026-10-12T00:00:00Z" } }) });
  const results = [response(), response()];
  await Promise.all(results.map(res => h.handler(request({ tip: "Film", tur: "Drama" }), res)));
  assert.deepEqual(results.map(res => res.statusCode).sort(), [200, 429]);
  assert.equal(h.modelCalls(), 1);
  assert.equal(results.find(res => res.statusCode === 429).body.resetAt, "2026-10-12T00:00:00Z");
});

test("duplicate request UUID never generates again", async () => {
  const h = aiHarness("generate", { reserve: async () => ({ data: { allowed: false, code: "DUPLICATE_REQUEST" } }) });
  const id = randomUUID();
  const res = response();
  await h.handler(request({ tip: "Film", tur: "Drama" }, { "x-request-id": id }), res);
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.requestId, id);
  assert.equal(h.modelCalls(), 0);
  assert.throws(() => resolveRequestId(request({}, { "x-request-id": "spoofed" })), error => error.code === "INVALID_REQUEST_ID");
});

test("invalid model output returns explicit error and server refunds failed operation", async () => {
  const h = aiHarness("generate", { model: () => ({ baslik: "Only title" }) });
  const res = response();
  await h.handler(request({ tip: "Film", tur: "Drama" }), res);
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.code, "MODEL_OUTPUT_INVALID");
  assert.deepEqual(h.calls.map(call => [call.name, call.args.p_success]), [["reserve_ai_usage", undefined], ["settle_ai_usage", false]]);
  assert.equal("senaryo" in res.body, false);
});

test("settlement outage cannot report successful save or release a completed paid operation", async () => {
  const settlements = [];
  const h = aiHarness("generate", { settle: async (_, args) => { settlements.push(args.p_success); return { error: { message: "unavailable" } }; } });
  const res = response();
  await h.handler(request({ tip: "Film", tur: "Drama" }), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.code, "USAGE_SETTLEMENT_FAILED");
  assert.deepEqual(settlements, [true]);
});

test("valid generation retains legacy response shape after server settlement", async () => {
  const h = aiHarness();
  const res = response();
  await h.handler(request({ tip: "Film", tur: "Drama" }), res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data.senaryo, scenario);
  assert.equal(res.body.meta.kalan, 49);
  assert.equal(h.calls[1].args.p_success, true);
});

test("structured scene tool rejects incorrect scene count", async () => {
  const h = aiHarness("scenes", { model: () => ({ scenes: [{ heading: "İÇ — EV — GÜNDÜZ", action: "Ayşe bekler.", dialogue: [] }] }) });
  const res = response();
  await h.handler(request({ senaryo: scenario, sceneCount: 2 }), res);
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.code, "MODEL_OUTPUT_INVALID");
});

test("every AI operation validates substantive model fields", () => {
  for (const [operation, definition] of Object.entries(aiOperations)) assert.equal(definition.outputSchema.safeParse({}).success, false, operation);
});

test("manual screenplay can be analysed without separately completed synopsis or character metadata", () => {
  assert.equal(aiOperations.dramaturg.inputSchema.safeParse({ senaryo: { acilis_sahnesi: "İÇ — EV — GECE\nAyşe kapıyı kapatır." } }).success, true);
  assert.equal(aiOperations.dramaturg.inputSchema.safeParse({ senaryo: {} }).success, false);
});

test("server database fetch retains an abort deadline throughout body consumption", async () => {
  const bounded = createBoundedServerFetch(10, async (_, init) => ({ text: () => new Promise((_, reject) => { init.signal.addEventListener("abort", () => reject(init.signal.reason), { once: true }); }) }));
  const result = await bounded("https://test.invalid");
  // AbortSignal.timeout is unref'd; keep only this test alive until it fires.
  const keepAlive = setTimeout(() => {}, 100);
  try { await assert.rejects(result.text(), error => error.name === "TimeoutError"); } finally { clearTimeout(keepAlive); }
});

function upstream(body, status = 200, headers = {}) { return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body), headers: { get: key => headers[key] ?? null } }; }
test("deadline includes slow response body even when transport ignores abort", { timeout: 500 }, async () => {
  const fetchImpl = async () => ({ text: () => new Promise(() => {}) });
  await assert.rejects(fetchJsonWithDeadline("https://test.invalid", {}, 10, fetchImpl), error => error.code === "UPSTREAM_TIMEOUT");
});

test("Groq respects configured model and never retries permanent 400", async () => {
  const oldKey = process.env.GROQ_API_KEY;
  const oldModel = process.env.GROQ_MODEL;
  process.env.GROQ_API_KEY = "test-only-key";
  process.env.GROQ_MODEL = "configured-test-model";
  let calls = 0;
  try {
    await assert.rejects(callGroq("story", { fetchImpl: async (_, init) => { calls += 1; assert.equal(JSON.parse(init.body).model, "configured-test-model"); return upstream({ error: "private model content" }, 400); } }), error => error.code === "AI_SERVICE_ERROR" && !error.message.includes("private"));
    assert.equal(calls, 1);
    const parsed = await callGroq("story", { fetchImpl: async () => upstream({ choices: [{ message: { content: '{"title":"Kıyı"}' }, finish_reason: "stop" }] }) });
    assert.deepEqual(parsed, { title: "Kıyı" });
  } finally {
    if (oldKey === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = oldKey;
    if (oldModel === undefined) delete process.env.GROQ_MODEL; else process.env.GROQ_MODEL = oldModel;
  }
});

function tableClient(tables, auth = false) {
  const writes = [];
  return { ...(auth ? userClient() : {}), writes, from(table) {
    const query = { select() { return this; }, eq() { return this; }, gt() { return this; }, is() { return this; }, or() { return this; }, limit() { return this; }, update(data) { writes.push({ table, data }); return this; }, insert(data) { writes.push({ table, data }); return this; }, maybeSingle() { return Promise.resolve(tables[table] || { data: null }); }, then(resolve, reject) { return Promise.resolve(tables[table] || { data: null }).then(resolve, reject); } };
    return query;
  } };
}
function mediaHarness(asset, options = {}) {
  const user = tableClient({ media_assets: { data: asset }, mesajlar: options.messages || { data: [] } }, true);
  const admin = tableClient({ media_assets: options.adminAsset || { data: asset, count: 0 }, engellemeler: options.blocks || { data: [] } });
  let upstreamCalls = 0;
  const config = { cloudName: "test-cloud", apiKey: "public-test-key", apiSecret: "private-test-secret" };
  admin.rpc = options.reserveMedia || (async (name, args) => { admin.writes.push({ table: "media_assets", data: { owner_id: args.p_owner_id, status: "pending" } }); return { data: { allowed: true } }; });
  const handlers = createMediaHandlers({ getConfig: () => config, getAdmin: () => admin, authOptions: { clientFactory: () => user, enableRateLimit: false }, requestJson: async (...args) => { upstreamCalls += 1; return options.upstream ? options.upstream(...args) : { response: { ok: true }, data: { result: "ok" } }; } });
  return { ...handlers, admin, config, upstreamCalls: () => upstreamCalls };
}
const asset = { id: assetId, owner_id: owner, public_id: `senaryo-studio/${owner}/${assetId}`, resource_type: "image", intent: "dm", status: "ready", mime_type: "image/png", format: "png", bytes: 100, delivery_type: "authenticated", secure_url: "https://res.cloudinary.com/test-cloud/image/authenticated/v1/image.png" };

test("media deletion uses exact registry ownership, never user ID substring or profile URL", async () => {
  const h = mediaHarness({ ...asset, owner_id: other, public_id: `forged/${owner}/victim` });
  const res = response();
  await h.remove(request({ public_id: `forged/${owner}/victim` }), res);
  assert.equal(res.statusCode, 403);
  assert.equal(h.upstreamCalls(), 0);
});

test("private upload reserves user-scoped registry and never exposes provider upload credentials", async () => {
  const h = mediaHarness(asset);
  const res = response();
  await h.sign(request({ intent: "dm", mimeType: "audio/webm", size: 100 }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.upload.url, `/api/media/upload?assetId=${res.body.assetId}`);
  assert.deepEqual(res.body.upload.fields, {});
  assert.equal(res.body.upload.signature, undefined);
  assert.equal(JSON.stringify(res.body).includes("public-test-key"), false);
  assert.equal(h.admin.writes[0].data.owner_id, owner);
  assert.equal(h.admin.writes[0].data.status, "pending");
});

test("files above the 3 MiB server limit cannot reserve provider upload rights", async () => {
  const h = mediaHarness(asset);
  const res = response();
  await h.sign(request({ intent: "dm", mimeType: "image/png", size: MEDIA_MAX_BYTES + 1 }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(h.admin.writes.length, 0);
  assert.equal(h.upstreamCalls(), 0);
});

test("atomic media reservation refusal never releases an upload signature", async () => {
  const h = mediaHarness(asset, { reserveMedia: async () => ({ data: { allowed: false, code: "MEDIA_PENDING_LIMIT", retryAfterMs: 5000 } }) });
  const res = response();
  await h.sign(request({ intent: "dm", mimeType: "image/png", size: 100 }), res);
  assert.equal(res.statusCode, 429);
  assert.equal(res.body.code, "MEDIA_PENDING_LIMIT");
  assert.equal(res.body.upload, undefined);
});

test("media registration rejects tampered response signatures before provider request", async () => {
  const h = mediaHarness({ ...asset, status: "pending", expires_at: new Date(Date.now() + 60_000).toISOString() });
  const res = response();
  await h.complete(request({ assetId, public_id: asset.public_id, version: 1, signature: "a".repeat(40) }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, "MEDIA_SIGNATURE_INVALID");
  assert.equal(h.upstreamCalls(), 0);
});

test("media registration verifies provider bytes and cannot trust client upload claims", async () => {
  const pending = { ...asset, status: "pending", expires_at: new Date(Date.now() + 60_000).toISOString() };
  const h = mediaHarness(pending, { upstream: async () => ({ response: { ok: true }, data: { public_id: asset.public_id, resource_type: "image", type: "authenticated", version: 1, bytes: 101, format: "png", asset_id: "cloud-id", secure_url: asset.secure_url } }) });
  const res = response();
  await h.complete(request({ assetId, public_id: asset.public_id, version: 1, signature: signCloudinary({ public_id: asset.public_id, version: 1 }, h.config.apiSecret) }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, "MEDIA_VERIFY_FAILED");
  assert.equal(h.admin.writes.length, 0);
});

test("private media URL requires a message participant and rejects blocked relationships", async () => {
  const unauthorized = mediaHarness({ ...asset, owner_id: other });
  const noParticipant = response();
  await unauthorized.access(request({ assetId }), noParticipant);
  assert.equal(noParticipant.statusCode, 403);
  const blocked = mediaHarness({ ...asset, owner_id: other }, { messages: { data: [{ gonderen: other, alan: owner }] }, blocks: { data: [{ id: "block" }] } });
  const blockRes = response();
  await blocked.access(request({ assetId }), blockRes);
  assert.equal(blockRes.statusCode, 403);
});

test("authorized private media delivery expires in five minutes", async () => {
  const h = mediaHarness({ ...asset, owner_id: other }, { messages: { data: [{ gonderen: other, alan: owner }] } });
  const res = response();
  await h.access(request({ assetId }), res);
  assert.equal(res.statusCode, 200);
  const url = new URL(res.body.url);
  assert.equal(url.pathname, "/v1_1/test-cloud/image/download");
  assert.equal(url.searchParams.get("type"), "authenticated");
  assert.equal(Number(url.searchParams.get("expires_at")) - Number(url.searchParams.get("timestamp")), 300);
  assert.ok(url.searchParams.get("signature"));
});

async function multipartRequest(bytes, type = "image/png") {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(bytes)], { type }), "media.png");
  const native = new Request("https://test.invalid", { method: "POST", body: form });
  const body = Buffer.from(await native.arrayBuffer());
  const req = Readable.from([body]);
  req.headers = { authorization: "Bearer verified-token", "content-type": native.headers.get("content-type"), "content-length": String(body.length) };
  req.method = "POST";
  req.query = { assetId };
  return req;
}
const pendingAsset = { ...asset, status: "pending", expires_at: new Date(Date.now() + 600_000).toISOString(), upload_started_at: null };

test("server upload rejects foreign pending asset before reading file or contacting provider", async () => {
  const h = mediaHarness({ ...pendingAsset, owner_id: other });
  const res = response();
  await h.upload(await multipartRequest(100), res);
  assert.equal(res.statusCode, 403);
  assert.equal(h.upstreamCalls(), 0);
});

test("actual multipart bytes cannot exceed reserved size or mismatch MIME", async () => {
  const h = mediaHarness(pendingAsset);
  const oversize = response();
  await h.upload(await multipartRequest(101), oversize);
  assert.equal(oversize.statusCode, 413);
  const wrongType = response();
  await h.upload(await multipartRequest(100, "audio/webm"), wrongType);
  assert.equal(wrongType.statusCode, 400);
  assert.equal(h.upstreamCalls(), 0);
  assert.equal(h.admin.writes.length, 0);
});

test("multipart body and slow client are bounded before any paid upload", async () => {
  const oversized = Readable.from([Buffer.alloc(300_000)]);
  oversized.headers = { "content-type": "multipart/form-data; boundary=test" };
  await assert.rejects(readMultipartFile(oversized, 100), error => error.status === 413);
  const slow = new Readable({ read() {} });
  slow.headers = { "content-type": "multipart/form-data; boundary=test" };
  try { await assert.rejects(readMultipartFile(slow, 100, 10), error => error.status === 408); } finally { slow.destroy(); }
});

test("server signs only a verified bounded file and returns a upload receipt", async () => {
  let providerParams;
  const h = mediaHarness(pendingAsset, { upstream: async (url, init) => {
    assert.ok(url.endsWith("/image/upload"));
    providerParams = Object.fromEntries(init.body.entries());
    return { response: { ok: true }, data: { public_id: asset.public_id, version: 1, signature: signCloudinary({ public_id: asset.public_id, version: 1 }, "private-test-secret") } };
  } });
  const res = response();
  await h.upload(await multipartRequest(100), res);
  assert.equal(res.statusCode, 200);
  assert.equal(providerParams.file.size, 100);
  assert.equal(providerParams.type, "authenticated");
  assert.equal(providerParams.overwrite, "false");
  assert.equal(providerParams.public_id, asset.public_id);
  assert.equal(typeof providerParams.signature, "string");
  assert.equal(res.body.public_id, asset.public_id);
  assert.equal(res.body.version, 1);
  assert.equal(res.body.api_key, undefined);
});

test("atomic upload claim prevents duplicate provider calls", async () => {
  const h = mediaHarness(pendingAsset, { adminAsset: { data: null } });
  const res = response();
  await h.upload(await multipartRequest(100), res);
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, "MEDIA_UPLOAD_ALREADY_STARTED");
  assert.equal(h.upstreamCalls(), 0);
});

test("valid provider-confirmed upload completes private registry without public URL", async () => {
  const h = mediaHarness(pendingAsset, { adminAsset: { data: { ...asset, version: 1 } }, upstream: async () => ({ response: { ok: true }, data: { public_id: asset.public_id, resource_type: "image", type: "authenticated", version: 1, bytes: 100, format: "png", asset_id: "cloud-id", secure_url: asset.secure_url } }) });
  const res = response();
  await h.complete(request({ assetId, public_id: asset.public_id, version: 1, signature: signCloudinary({ public_id: asset.public_id, version: 1 }, h.config.apiSecret) }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.asset.id, assetId);
  assert.equal(res.body.asset.url, null);
  assert.equal(h.admin.writes[0].data.status, "ready");
});
