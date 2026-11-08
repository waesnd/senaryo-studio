const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const crypto = require("node:crypto");

const base = path.join(__dirname, "..");
const userId = "11111111-1111-4111-8111-111111111111";
const nonce = "a".repeat(24);

function chatUpload() {
  const src = fs.readFileSync(path.join(base, "lib/cloudinaryUpload.js"), "utf8")
    .replace("export async function uploadProfileMedia", "async function uploadProfileMedia")
    .replace("export async function uploadChatMedia", "globalThis.chatUpload = async function uploadChatMedia");
  const sandbox = { FormData, Blob, Error };
  vm.runInNewContext(src, sandbox);
  return sandbox.chatUpload;
}

const session = { auth: { getSession: async () => ({
  data: { session: { access_token: "synthetic-test-token" } }, error: null,
}) } };

function fakeApi(kind) {
  const type = kind === "message-image" ? "image" : "video";
  const public_id = `fabularc/users/${userId}/${kind}-${nonce}`;
  const calls = [];
  return {
    calls,
    fetch: async (url, init) => {
      calls.push({ url, init });
      if (calls.length === 1) {
        return { ok: true, json: async () => ({
          api_key: "fake-public", signature: "fake-signature", timestamp: 123456,
          cloud_name: "demo", resource_type: type, public_id,
        }) };
      }
      return { ok: true, json: async () => ({
        public_id,
        secure_url: `https://res.cloudinary.com/demo/${type}/upload/v123/${public_id}.webm`,
      }) };
    },
  };
}

test("signed chat image sends bearer auth and validates upload destination", async () => {
  const api = fakeApi("message-image");
  const file = new Blob(["fake image"], { type: "image/png" });
  const result = await chatUpload()({
    supabase: session, file, kind: "message-image", fetchImpl: api.fetch,
  });
  assert.equal(api.calls.length, 2);
  assert.equal(api.calls[0].url, "/api/medya-imza");
  assert.equal(api.calls[0].init.headers.Authorization, "Bearer synthetic-test-token");
  assert.match(api.calls[1].url, /\/image\/upload$/);
  assert.equal(result.public_id.includes(userId), true);
  assert.ok(!api.calls[1].init.body.has("upload_preset"));
});

test("signed voice recordings use Cloudinary video upload and never unsigned presets", async () => {
  const api = fakeApi("message-audio");
  const file = new Blob(["fake audio"], { type: "audio/webm" });
  await chatUpload()({
    supabase: session, file, kind: "message-audio", fetchImpl: api.fetch,
  });
  assert.match(api.calls[1].url, /\/video\/upload$/);
  assert.ok(!api.calls[1].init.body.has("upload_preset"));
});

test("invalid chat files are rejected before network access", async () => {
  let calls = 0;
  const api = async () => { calls++; throw Error("Should not call"); };
  await assert.rejects(chatUpload()({
    supabase: session,
    file: new Blob(["not an image"], { type: "text/plain" }),
    kind: "message-image", fetchImpl: api,
  }));
  assert.equal(calls, 0);
});

test("signer only allows authenticated image and audio message kinds", async () => {
  const source = fs.readFileSync(path.join(base, "pages/api/medya-imza.js"), "utf8")
    .replace(/^import .*;\s*$/gm, "")
    .replace(/export default withAuth\(handler\);?/g, "globalThis.handler = handler;");
  const sandbox = {
    crypto, process: {env: {
      CLOUDINARY_CLOUD_NAME: "demo",
      CLOUDINARY_API_KEY: "fake-public",
      CLOUDINARY_API_SECRET: "fake-secret",
    }},
    console, withAuth: fn=>fn,
  };
  vm.runInNewContext(source, sandbox);
  const response = () => ({
    headers:{}, statusCode:200,
    setHeader(k,v){ this.headers[k]=v; return this; },
    status(code){ this.statusCode=code; return this; },
    json(body){ this.body=body; return this; },
  });
  const r = response();
  await sandbox.handler({method:"POST",user:{id:userId},body:{kind:"message-audio"}},r);
  assert.equal(r.statusCode,200);
  assert.equal(r.body.resource_type,"video");
  assert.match(r.body.public_id,/message-audio-/);
  assert.equal(r.headers["Cache-Control"],"no-store");
  const invalid = response();
  await sandbox.handler({method:"POST",user:{id:userId},body:{kind:"evil"}},invalid);
  assert.equal(invalid.statusCode,400);
});

test("chat page never uses legacy unsigned direct Cloudinary upload URLs", () => {
  const source = fs.readFileSync(path.join(base, "pages/mesajlar.js"), "utf8");
  assert.doesNotMatch(source, /scriptify_posts|upload_preset|api\.cloudinary\.com\/v1_1\/duuebxmro/);
  assert.match(source, /uploadChatMedia/);
});
