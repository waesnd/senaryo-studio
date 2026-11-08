const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function uploadFunction() {
  const source = fs.readFileSync(path.join(__dirname, "../lib/cloudinaryUpload.js"), "utf8")
    .replace("export async function uploadProfileMedia", "globalThis.uploadProfileMedia = async function uploadProfileMedia");
  const sandbox = { FormData, Blob, Error };
  vm.runInNewContext(source, sandbox, { filename: "lib/cloudinaryUpload.js" });
  return sandbox.uploadProfileMedia;
}

const image = new Blob(["example image"], { type: "image/png" });
const auth = { auth: { getSession: async () => ({ data: { session: { access_token: "test-token" } }, error: null }) } };

test("signed profile upload obtains a user-scoped signature before Cloudinary", async () => {
  const upload = uploadFunction();
  const calls = [];
  const result = await upload({
    supabase: auth,
    file: image,
    kind: "avatar",
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      if (calls.length === 1) return {
        ok: true,
        json: async () => ({
          api_key: "public-key", cloud_name: "demo", timestamp: 100,
          public_id: "fabularc/users/user-1/avatar-random", signature: "signature",
        }),
      };
      return {
        ok: true,
        json: async () => ({
          public_id: "fabularc/users/user-1/avatar-random",
          secure_url: "https://res.cloudinary.com/demo/image/upload/v123/fabularc/users/user-1/avatar-random.png",
        }),
      };
    },
  });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "/api/medya-imza");
  assert.equal(calls[0].options.headers.Authorization, "Bearer test-token");
  assert.match(calls[1].url, /https:\/\/api\.cloudinary\.com\/v1_1\/demo\/image\/upload/);
  assert.equal(result.public_id, "fabularc/users/user-1/avatar-random");
});

test("signed upload refuses missing login and unsupported media", async () => {
  const upload = uploadFunction();
  const noSession = { auth: { getSession: async () => ({ data: { session: null } }) } };
  await assert.rejects(upload({ supabase: noSession, file: image, kind: "avatar", fetchImpl: () => { throw Error("never"); } }));
  await assert.rejects(upload({ supabase: auth, file: new Blob(["x"], { type: "text/html" }), kind: "avatar", fetchImpl: () => { throw Error("never"); } }));
});

test("profile page uses signed upload helper, not hardcoded unsigned upload presets", () => {
  const source = fs.readFileSync(path.join(__dirname, "../pages/profil.js"), "utf8");
  assert.match(source, /uploadProfileMedia/);
  assert.doesNotMatch(source, /scriptify_avatars|upload_preset|api\.cloudinary\.com\/v1_1\/duuebxmro/);
});
