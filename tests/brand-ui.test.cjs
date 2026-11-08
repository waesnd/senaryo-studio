const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const pages = ["index.js", "uret.js", "profil.js", "mesajlar.js", "topluluk.js"];

test("all critical screens use approved Fabularc logo rather than stale raster logo", () => {
  assert.ok(fs.existsSync(path.join(root, "public/brand/fabularc-primary.svg")));
  for (const file of pages) {
    const source = fs.readFileSync(path.join(root, "pages", file), "utf8");
    assert.doesNotMatch(source, /src="\/logo\.png"/);
    assert.doesNotMatch(source, /alt="Scriptify"/);
    assert.match(source, /Fabularc|FABULARC|fabularc-primary/);
  }
});

test("exports show Fabularc branding and do not advertise an unverified domain", () => {
  const source = fs.readFileSync(path.join(root, "pages/uret.js"), "utf8");
  assert.doesNotMatch(source, /SCRIPTIFY —/);
  assert.doesNotMatch(source, /scriptify\.app/);
  assert.match(source, /FABULARC —/);
});

test("brand naming preserves existing browser data while removing unsigned chat upload presets", () => {
  const source = fs.readFileSync(path.join(root, "pages/mesajlar.js"), "utf8");
  assert.match(source, /scriptify_last_chat/);
  assert.doesNotMatch(source, /scriptify_posts|upload_preset/);
  assert.match(source, /uploadChatMedia/);
});
