const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const editor = fs.readFileSync(path.join(__dirname, "../pages/uret.js"), "utf8");
const migration = fs.readFileSync(path.join(__dirname, "../supabase/migrations/202611080003_private_writing_archive.sql"), "utf8");

test("editor archive uses dedicated private storage, not scenario revision table", () => {
  const start = editor.indexOf("// Kişisel arşivi yükle");
  const end = editor.indexOf("async function profilKaydet()", start);
  assert.ok(start > -1 && end > start);
  const archiveCode = editor.slice(start, end);
  assert.match(archiveCode, /from\("yazar_arsivi"\)/);
  assert.doesNotMatch(archiveCode, /from\("senaryo_versiyonlar"\)/);
});

test("archive save and delete check server errors, preserving records on failure", () => {
  assert.match(editor, /\{error\} = await supabase\.from\("yazar_arsivi"\)\.insert/);
  assert.match(editor, /if\(error\) throw error;/);
  assert.match(editor, /\.delete\(\)\.eq\("id", id\)\.eq\("user_id", user\.id\)/);
});

test("archive restores JSONB objects and accepts old serialized payloads", () => {
  assert.match(editor, /typeof versiyon\.veri === "string"/);
  assert.match(editor, /JSON\.parse\(versiyon\.veri\)/);
});

test("migration preserves existing scenario version history", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.yazar_arsivi/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.doesNotMatch(migration, /DROP TABLE|TRUNCATE|DELETE FROM/);
  assert.doesNotMatch(migration, /ALTER TABLE public\.senaryo_versiyonlar/);
});

test("story generation has independently configurable language and country", () => {
  assert.match(editor, /\[eserDili,setEserDili\]=useState\("tr"\)/);
  assert.match(editor, /\[hikayeUlkesi,setHikayeUlkesi\]=useState\("TR"\)/);
  assert.match(editor, /dil:eserDili,ulke:hikayeUlkesi/);
  assert.match(editor, /aria-label="Eser dili"/);
  assert.match(editor, /aria-label="Hikâye ülkesi"/);
});
