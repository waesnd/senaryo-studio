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
  const sandbox = { ...mocks, crypto, process: { env: mocks.env || {} }, URL, URLSearchParams, console: { log() {}, error() {} } };
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
  const handler = handlerFrom("pages/api/generate.js", {
    withAuth: fn => fn,
    callGroq: async () => { providerCalls++; return {}; },
  });
  const res = response();
  await handler({ method: "POST", user: { id: "user-1" }, supabase: { rpc: async () => ({ data: null, error: new Error("database unavailable") }) }, body: { tip: "film", tur: "dram" } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.code, "USAGE_CHECK_UNAVAILABLE");
  assert.equal(providerCalls, 0);
});

test("AI provider is not called when quota is exhausted", async () => {
  let providerCalls = 0;
  const handler = handlerFrom("pages/api/generate.js", {
    withAuth: fn => fn,
    callGroq: async () => { providerCalls++; return {}; },
  });
  const res = response();
  await handler({ method: "POST", user: { id: "user-1" }, supabase: { rpc: async () => ({ data: { allowed: false, kalan: 0, limit: 50 }, error: null }) }, body: { tip: "film", tur: "dram" } }, res);
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

test("Cloudinary deletion allows exact media on authenticated profile", async () => {
  let deletes = 0;
  const query = {
    select() { return this; },
    eq() { return this; },
    single() {
      return Promise.resolve({
        data: {
          avatar_url: "https://res.cloudinary.com/demo/image/upload/v123456/avatar-own.png",
          banner_url: null,
        },
      });
    },
  };
  const handler = handlerFrom("pages/api/medya-sil.js", {
    withAuth: fn => fn,
    env: {
      CLOUDINARY_CLOUD_NAME: "demo",
      CLOUDINARY_API_KEY: "fake-test-key",
      CLOUDINARY_API_SECRET: "fake-test-secret",
    },
    fetch: async () => { deletes++; return { ok: true, json: async () => ({ result: "ok" }) }; },
  });
  const res = response();
  await handler({
    method: "POST",
    body: { public_id: "avatar-own", resource_type: "image" },
    user: { id: "owner-123" },
    supabase: { from: () => query },
  }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(deletes, 1);
});

test("AI generation respects explicit story language and country", async () => {
  let sentPrompt = "";
  const handler = handlerFrom("pages/api/generate.js", {
    withAuth: fn => fn,
    callGroq: async (prompt) => {
      sentPrompt = prompt;
      return {
        baslik: "Title", tagline: "Tagline", ana_fikir: "Plot",
        karakter: "Characters", acilis_sahnesi: "Opening", buyuk_soru: "Question",
      };
    },
  });
  const res = response();
  await handler({
    method: "POST",
    user: { id: "writer-1" },
    supabase: { rpc: async () => ({ data: { allowed: true, kalan: 49, limit: 50 }, error: null }) },
    body: { tip: "feature film", tur: "thriller", dil: "en", ulke: "US" },
  }, res);
  assert.equal(res.statusCode, 200);
  assert.match(sentPrompt, /en/i);
  assert.match(sentPrompt, /US/);
  assert.doesNotMatch(sentPrompt, /MUTLAKA Türkçe\/Türk ismi/);
  assert.doesNotMatch(sentPrompt, /Dil tamamen Türkçe/);
});

test("AI generation preserves Turkish default for existing clients", async () => {
  let sentPrompt = "";
  const handler = handlerFrom("pages/api/generate.js", {
    withAuth: fn => fn,
    callGroq: async (prompt) => {
      sentPrompt = prompt;
      return {
        baslik: "Başlık", tagline: "Kısa söz", ana_fikir: "Hikâye",
        karakter: "Karakterler", acilis_sahnesi: "Açılış", buyuk_soru: "Soru",
      };
    },
  });
  const res = response();
  await handler({
    method: "POST", user: { id: "writer-2" },
    supabase: { rpc: async () => ({ data: { allowed: true, kalan: 49, limit: 50 }, error: null }) },
    body: { tip: "film", tur: "dram" },
  }, res);
  assert.equal(res.statusCode, 200);
  assert.match(sentPrompt, /Eser dili: tr/);
  assert.match(sentPrompt, /hikâye ülkesi: TR/);
});

test("AI generation rejects invalid locale before quota or provider calls", async () => {
  let clientCalls = 0;
  let providerCalls = 0;
  const handler = handlerFrom("pages/api/generate.js", {
    withAuth: fn => fn,
    createClient: () => { clientCalls++; return {}; },
    callGroq: async () => { providerCalls++; return {}; },
  });
  const res = response();
  await handler({
    method: "POST", user: { id: "writer-3" },
    body: { tip: "film", tur: "dram", dil: "english", ulke: "USA" },
  }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.code, "INVALID_LOCALE");
  assert.equal(clientCalls, 0);
  assert.equal(providerCalls, 0);
});

test("AI quota reservation uses the authenticated atomic RPC before provider call", async () => {
  let rpcCalls = 0;
  let providerCalls = 0;
  const handler = handlerFrom("pages/api/generate.js", {
    withAuth: fn => fn,
    createClient: () => { throw new Error("Legacy count-and-insert must not run"); },
    callGroq: async () => {
      providerCalls++;
      return {
        baslik: "Başlık", tagline: "Etiket", ana_fikir: "Özet",
        karakter: "Kişiler", acilis_sahnesi: "Açılış", buyuk_soru: "Soru",
      };
    },
  });
  const res = response();
  await handler({
    method: "POST", user: { id: "writer-atomic" },
    supabase: {
      rpc(name, params) {
        rpcCalls++;
        assert.equal(name, "reserve_generate_quota");
        assert.equal(params.p_meta.tip, "film");
        return Promise.resolve({ data: { allowed: true, kalan: 49, limit: 50 }, error: null });
      },
    },
    body: { tip: "film", tur: "dram" },
  }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(rpcCalls, 1);
  assert.equal(providerCalls, 1);
});

test("Cloudinary upload signatures are bound to the authenticated user and never reveal secrets", async () => {
  const handler = handlerFrom("pages/api/medya-imza.js", {
    withAuth: fn => fn,
    env: {
      CLOUDINARY_CLOUD_NAME: "demo",
      CLOUDINARY_API_KEY: "public-key",
      CLOUDINARY_API_SECRET: "never-expose-this-secret",
    },
  });
  const userId = "11111111-1111-4111-8111-111111111111";
  const res = response();
  await handler({ method: "POST", user: { id: userId }, body: { kind: "avatar" } }, res);
  assert.equal(res.statusCode, 200);
  assert.match(res.body.public_id, /^fabularc\/users\/11111111-1111-4111-8111-111111111111\/avatar-[0-9a-f]{24}$/);
  assert.equal(res.body.api_key, "public-key");
  assert.equal(res.body.cloud_name, "demo");
  assert.doesNotMatch(JSON.stringify(res.body), /never-expose-this-secret/);
  const expected = crypto.createHash("sha1")
    .update("public_id=" + res.body.public_id + "&timestamp=" + res.body.timestamp + "never-expose-this-secret")
    .digest("hex");
  assert.equal(res.body.signature, expected);
});

test("Cloudinary upload signature endpoint rejects invalid kind and missing identity", async () => {
  const handler = handlerFrom("pages/api/medya-imza.js", {
    withAuth: fn => fn,
    env: { CLOUDINARY_CLOUD_NAME: "demo", CLOUDINARY_API_KEY: "key", CLOUDINARY_API_SECRET: "secret" },
  });
  let res = response();
  await handler({ method: "POST", user: { id: "11111111-1111-4111-8111-111111111111" }, body: { kind: "video" } }, res);
  assert.equal(res.statusCode, 400);
  res = response();
  await handler({ method: "POST", body: { kind: "avatar" } }, res);
  assert.equal(res.statusCode, 401);
});
