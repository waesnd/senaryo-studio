const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const demo = fs.readFileSync(path.join(__dirname, "../pages/demo.js"), "utf8");
const editor = fs.readFileSync(path.join(__dirname, "../pages/editor.js"), "utf8");

test("guest editor access offers visible branded local demo without login", () => {
  assert.match(editor, /href="\/demo"/);
  assert.match(editor, /Ücretsiz demoyu başlat/);
  assert.match(editor, /#063B32/);
  assert.doesNotMatch(editor, /<div className="loading">Yazarlık editörüne erişmek için giriş yapmalısınız/);
});

test("guest demo does not send personal writing to Supabase or network", () => {
  assert.doesNotMatch(demo, /supabase|fetch\(|XMLHttpRequest|\/api\//i);
  assert.match(demo, /localStorage\.setItem/);
  assert.match(demo, /fabularc:guest:demo:v1/);
  assert.match(demo, /Denemek|Hesapsız deneyebilirsin/);
});

test("guest demo offers editable scenes and text plus TXT and FDX export", () => {
  assert.match(demo, /onChange=\{e=>update\("text",e\.target\.value\)\}/);
  assert.match(demo, /function addScene/);
  assert.match(demo, /function exportFdx/);
  assert.match(demo, /function exportText/);
  assert.match(demo, /escapeXml/);
});

test("guest demo has a functional narrow-screen layout", () => {
  assert.match(demo, /@media\(max-width:760px\)/);
  assert.match(demo, /mobile-nav/);
  assert.match(demo, /panel==="scenes"/);
  assert.match(demo, /panel==="editor"/);
});
