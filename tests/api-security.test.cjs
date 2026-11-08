const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const crypto = require("node:crypto");

function handlerFrom(relativePath, mocks) {
  const source = fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8")
    .replace(/^import .*;\s*$/gm, "")
    .replace(/export default withAuth\(handler\);?/g, "globalThis.testHandler = handler;");
  const sandbox = { ...mocks, crypto, process: { env: {} }, URL, URLSearchParams, console: { log() {}, error() {} } };
  vm.runInNewContext(source, sandbox, { filename: relativePath });
  return sandbox.testHandler;
}

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    setHeader() { return this; },
  };
}

test("AI provider is not called when quota verification fails", async () => {
  let providerCalls = 0;
  const query = {
    select() { return this; },
    eq() { return this; },
    gte() { return Promise.resolve({ count: null, error: new Error("database unavailable") }); },
  };
  const handler = handlerFrom("pages/api/generate.js", {
    withAuth: fn => fn,
    createClient: () => ({ from: () => query }),
    callGroq: async () => { providerCalls++; return {}; },
  });
  const res = response();
  await handler({ method: "POST", user: { id: "user-1" }, body: { tip: "film", tur: "dram" } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.code, "USAGE_CHECK_UNAVAILABLE");
  assert.equal(providerCalls, 0);
});

test("AI provider is not called when quota is exhausted", async () => {
  let providerCalls = 0;
  const query = {
    select() { return this; },
    eq() { return this; },
    gte() { return Promise.resolve({ count: 50, error: null }); },
  };
  const handler = handlerFrom("pages/api/generate.js", {
    withAuth: fn => fn,
    createClient: () => ({ from: () => query }),
    callGroq: async () => { providerCalls++; return {}; },
  });
  const res = response();
  await handler({ method: "POST", user: { id: "user-1" }, body: { tip: "film", tur: "dram" } }, res);
  assert.equal(res.statusCode, 429);
  assert.equal(providerCalls, 0);
});

test("Cloudinary deletion rejects substring-based ownership", async () => {
  let deletes = 0;
  const query = {
    select() { return this; },
    eq() { return this; },
    single() { return Promise.resolve({ data: { avatar_url: null, banner_url: null } }); },
  };
  const handler = handlerFrom("pages/api/medya-sil.js", {
    withAuth: fn => fn,
    fetch: async () => { deletes++; return { ok: true, json: async () => ({ result: "ok" }) }; },
  });
  const res = response();
  await handler({
    method: "POST",
    body: { public_id: "prefix-user-123-suffix" },
    user: { id: "user-123" },
    supabase: { from: () => query },
  }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(deletes, 0);
});

test("Cloudinary deletion rejects forged owner folder without DB ownership proof", async () => {
  let deletes = 0;
  const query = {
    select() { return this; },
    eq() { return this; },
    single() { return Promise.resolve({ data: { avatar_url: null, banner_url: null } }); },
  };
  const handler = handlerFrom("pages/api/medya-sil.js", {
    withAuth: fn => fn,
    fetch: async () => { deletes++; return { ok: true, json: async () => ({ result: "ok" }) }; },
  });
  const res = response();
  await handler({
    method: "POST",
    body: { public_id: "user-123/foreign-asset" },
    user: { id: "user-123" },
    supabase: { from: () => query },
  }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(deletes, 0);
});
