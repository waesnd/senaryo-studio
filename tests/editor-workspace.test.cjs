const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const editor=fs.readFileSync(path.join(root,"pages/editor.js"),"utf8");
const sql=fs.readFileSync(path.join(root,"supabase/migrations/202611080006_private_editor_projects.sql"),"utf8");

test("new editor has private project and scene workflows",()=>{
 assert.match(editor,/from\("yazarlik_projeleri"\)/);
 assert.match(editor,/from\("yazarlik_sahneleri"\)/);
 assert.match(editor,/const \{ user, authHazir \} = useAuth\(\)/);
 assert.match(editor,/selectProject/);
 assert.match(editor,/addScene/);
});
test("optimistic concurrency requires exact previous scene version",()=>{
 assert.match(editor,/\.eq\("versiyon",scene\.versiyon\)/);
 assert.match(editor,/Sürüm çakışması/);
 assert.match(editor,/setConflict\(true\)/);
 assert.match(sql,/NEW\.versiyon := OLD\.versiyon\+1/);
});
test("local draft snapshot precedes remote autosave",()=>{
 assert.match(editor,/localStorage\.setItem\(draftKey/);
 assert.match(editor,/setTimeout\(\(\) => \{ void saveScene\(\); \}, 1300\)/);
 assert.match(editor,/navigator\.onLine/);
 assert.match(editor,/localStorage\.removeItem\(draftKey/);
});
test("exports escape screenplay XML and include unsaved current scene",()=>{
 assert.match(editor,/function escapeXml/);
 assert.match(editor,/function exportProject/);
 assert.match(editor,/application\/xml;charset=utf-8/);
 assert.match(editor,/s\.id===activeScene\?\.id/);
});
test("editor has branded responsive styling",()=>{
 assert.match(editor,/fabularc-primary\.svg/);
 assert.match(editor,/#063B32/);
 assert.match(editor,/#C8F33B/);
 assert.match(editor,/@media\(max-width:800px\)/);
});
test("schema is additive with owner-only RLS and no destructive migration",()=>{
 assert.match(sql,/ENABLE ROW LEVEL SECURITY/g);
 assert.match(sql,/fabularc_scene_insert_own/);
 assert.doesNotMatch(sql,/DROP TABLE|TRUNCATE|DELETE FROM/);
});
