const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname,"..");
const feed = fs.readFileSync(path.join(root,"pages/index.js"),"utf8");
const migration = fs.readFileSync(path.join(root,"supabase/migrations/202611080005_post_privacy_and_reports.sql"),"utf8");

test("reports rely on server moderation and do not grant clients power to hide arbitrary posts", () => {
  assert.doesNotMatch(feed, /from\("gonderiler"\)\.update\(\{paylasim_acik:false\}\)/);
  assert.match(feed, /from\("raporlar"\)\.insert/);
  assert.match(feed, /if\(error\)/);
});

test("post security migration protects drafts and does not destroy user content", () => {
  assert.match(migration, /fabularc_posts_public_or_owner/);
  assert.match(migration, /fabularc_posts_owner_update/);
  assert.match(migration, /COUNT\(DISTINCT rapor_eden\)/);
  assert.doesNotMatch(migration,/TRUNCATE\b|DROP TABLE\b|DELETE FROM\b/);
});
