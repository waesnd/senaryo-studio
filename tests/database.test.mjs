import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

const migration = await readFile(new URL('../supabase/migrations/202610110001_platform_foundation.sql', import.meta.url), 'utf8');
const preflight = await readFile(new URL('../supabase/preflight.sql', import.meta.url), 'utf8');
const validation = await readFile(new URL('../supabase/validate.sql', import.meta.url), 'utf8');
const owner = '11111111-1111-4111-8111-111111111111';
const reader = '22222222-2222-4222-8222-222222222222';
const outsider = '33333333-3333-4333-8333-333333333333';
const bootstrap = `
 CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
 CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,raw_user_meta_data jsonb DEFAULT '{}');
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.role',true),'') $$;
 GRANT USAGE ON SCHEMA auth TO anon,authenticated,service_role;
 GRANT EXECUTE ON FUNCTION auth.uid(),auth.role() TO anon,authenticated,service_role;
`;
const document = (title = 'İstanbul’da bir hikâye #ışık') => ({
 schemaVersion: 1, title, tagline: 'Bir yazarın yolculuğu', synopsis: 'Karakter bir karar verir.',
 characters: [{ id: 'character-1', name: 'İpek', description: 'Cesur bir yazar.' }],
 scenes: [{ id: 'scene-1', heading: 'İÇ. EV — GÜNDÜZ', action: 'İpek pencereye yaklaşır.', dialogue: [{ id: 'dialogue-1', character: 'İpek', text: 'Başlayalım.' }] }],
 dramaticQuestion: 'Yeniden başlayabilir mi?', metadata: { tip: 'Film', tur: 'Drama', analyses: { dramaturg: 'test' } },
});
let db;
let scenarioId;
let versionId;
const scalar = async (sql, args = []) => (await db.query(sql, args)).rows[0]?.value;
async function actor(uid, role = 'authenticated') {
 await db.exec('RESET ROLE');
 await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claim.role',$2,false)", [uid || '', role]);
 await db.exec(`SET ROLE ${role}`);
}
async function admin() { await db.exec('RESET ROLE'); await db.query("SELECT set_config('request.jwt.claim.sub','',false),set_config('request.jwt.claim.role','',false)"); }
before(async () => {
 db = new PGlite();
 await db.exec(bootstrap);
 await db.exec(migration);
 await db.exec(preflight);
 await db.exec(validation);
 await db.query('INSERT INTO auth.users(id) VALUES($1),($2),($3)', [owner, reader, outsider]);
});
after(async () => db?.close());

test('fresh migration is idempotent and protects every managed table with RLS', async () => {
 await admin();
 await db.exec("ALTER TABLE profiles ADD COLUMN private_email text; GRANT SELECT(private_email),UPDATE(dogrulandi) ON profiles TO authenticated; GRANT SELECT(private_email) ON profiles TO PUBLIC;");
 await db.exec(migration);
 const managed = (await db.query("SELECT relname,relrowsecurity FROM pg_class WHERE relnamespace='public'::regnamespace AND relkind='r'")).rows;
 assert.ok(managed.length >= 22);
 assert.ok(managed.every((row) => row.relrowsecurity));
 assert.equal(await scalar("SELECT count(*)::int AS value FROM profiles"), 3);
});

test('draft ownership, validation and optimistic revision checks are enforced in PostgreSQL', async () => {
 await actor(owner);
 const saved = await scalar('SELECT save_scenario(NULL,$1,\'Film\',\'Drama\',NULL) AS value', [document()]);
 scenarioId = saved.id;
 assert.equal(saved.revision, 1);
 assert.equal(saved.ozet, document().synopsis);
 assert.ok(saved.etiketler.includes('ışık'));
 const turkish = await scalar('SELECT save_scenario(NULL,$1,\'Film\',\'Drama\',NULL) AS value', [document('Bir şehir #İSTANBUL #IŞIK #ＦİＬＭ')]);
 assert.deepEqual([...turkish.etiketler].sort(), ['film', 'istanbul', 'ışık'].sort());
 await scalar('SELECT delete_scenario($1) AS value', [turkish.id]);
 const untitled = await scalar('SELECT save_scenario(NULL,$1,\'Film\',\'Drama\',NULL) AS value', [document('')]);
 assert.equal(untitled.baslik, 'Başlıksız eser');
 assert.equal(untitled.document.title, '');
 await assert.rejects(db.query('SELECT set_scenario_visibility($1,true)', [untitled.id]), /bir başlık ekleyin/);
 await scalar('SELECT delete_scenario($1) AS value', [untitled.id]);
 await assert.rejects(db.query('SELECT save_scenario($1,$2,\'Film\',\'Drama\',NULL)', [scenarioId, document()]), /REVISION_CONFLICT/);
 await assert.rejects(db.query('SELECT save_scenario(NULL,$1,\'Film\',\'Drama\',NULL)', [{ ...document(), schemaVersion: undefined }]), /INVALID_DOCUMENT/);
 await actor(reader);
 await assert.rejects(db.query('SELECT private_email FROM profiles'), /permission denied/);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM senaryolar WHERE id=$1', [scenarioId]), 0);
 await assert.rejects(db.query('SELECT save_scenario($1,$2,\'Film\',\'Drama\',1)', [scenarioId, document()]), /SCENARIO_NOT_FOUND/);
 await assert.rejects(db.query('UPDATE profiles SET dogrulandi=true WHERE id=$1', [reader]), /permission denied/);
 await assert.rejects(db.query('UPDATE senaryolar SET paylasim_acik=true WHERE id=$1', [scenarioId]), /permission denied/);
 await actor(null, 'anon');
 assert.equal(await scalar('SELECT count(*)::int AS value FROM senaryolar'), 0);
 await assert.rejects(db.query('SELECT delete_scenario($1)', [scenarioId]), /permission denied/);
});

test('version snapshots preserve metadata and restore keeps an automatic previous-state backup', async () => {
 await actor(owner);
 const v = await scalar('SELECT create_scenario_version($1,\'İlk taslak\') AS value', [scenarioId]);
 versionId = v.id;
 assert.deepEqual(v.snapshot.metadata, document().metadata);
 const changed = await scalar('SELECT save_scenario($1,$2,\'Dizi\',\'Gerilim\',1) AS value', [scenarioId, document('İkinci taslak')]);
 assert.equal(changed.revision, 2);
 const restored = await scalar('SELECT restore_scenario_version($1,2) AS value', [versionId]);
 assert.equal(restored.document.title, document().title);
 assert.equal(restored.tip, 'Film');
 assert.equal(restored.revision, 3);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM senaryo_versiyonlar WHERE senaryo_id=$1', [scenarioId]), 2);
 await actor(reader);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM senaryo_versiyonlar'), 0);
 await assert.rejects(db.query('SELECT restore_scenario_version($1,3)', [versionId]), /VERSION_NOT_FOUND/);
});

test('publication, reactions and report moderation share canonical transactional data', async () => {
 await actor(owner);
 await scalar('SELECT set_scenario_visibility($1,true) AS value', [scenarioId]);
 await actor(reader);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM gonderiler WHERE senaryo_id=$1', [scenarioId]), 1);
 assert.deepEqual(await scalar('SELECT toggle_scenario_like($1) AS value', [scenarioId]), { liked: true, count: 1 });
 assert.deepEqual(await scalar('SELECT toggle_scenario_bookmark($1) AS value', [scenarioId]), { saved: true });
 await db.query('INSERT INTO yorumlar(user_id,senaryo_id,metin,scene_id,feedback_type) VALUES($1,$2,$3,$4,$5)', [reader, scenarioId, 'Diyalog güçlü.', 'scene-1', 'dialogue']);
 assert.equal(await scalar('SELECT begeni_sayisi AS value FROM senaryolar WHERE id=$1', [scenarioId]), 1);
 assert.equal(await scalar('SELECT yorum_sayisi AS value FROM senaryolar WHERE id=$1', [scenarioId]), 1);
 assert.equal((await scalar('SELECT submit_report($1,\'İçerik incelemesi\') AS value', [scenarioId])).alreadyReported, false);
 assert.equal((await scalar('SELECT submit_report($1,\'Tekrar denemesi\') AS value', [scenarioId])).alreadyReported, true);
 await assert.rejects(db.query('UPDATE gonderiler SET paylasim_acik=false WHERE senaryo_id=$1', [scenarioId]), /permission denied/);
 await actor(owner);
 await scalar('SELECT set_scenario_visibility($1,false) AS value', [scenarioId]);
 await actor(reader);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM gonderiler WHERE senaryo_id=$1', [scenarioId]), 0);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM yorumlar WHERE senaryo_id=$1', [scenarioId]), 0);
 await actor(owner);
 await scalar('SELECT set_scenario_visibility($1,true) AS value', [scenarioId]);
});

test('private notes, messages, block rules and exact notification IDs isolate accounts', async () => {
 await actor(owner);
 await scalar('SELECT save_private_note($1,$2) AS value', [reader, 'Özel not']);
 assert.equal((await scalar('SELECT save_private_note($1,$2) AS value', [reader, 'Güncellenen özel not'])).metin, 'Güncellenen özel not');
 await db.query('INSERT INTO mesajlar(gonderen,alan,icerik) VALUES($1,$2,$3)', [owner, reader, 'İlk mesaj']);
 await actor(reader);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM ozel_notlar'), 0);
 await scalar('SELECT save_private_note($1,$2) AS value', [owner, 'Farklı hesaba ait not']);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM ozel_notlar'), 1);
 assert.equal((await db.query('SELECT * FROM list_conversations()')).rows[0].unread_count, 1);
 await db.query('INSERT INTO mesajlar(gonderen,alan,icerik) VALUES($1,$2,$3)', [reader, owner, 'Son mesaj']);
 await actor(outsider);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM mesajlar'), 0);
 await actor(owner);
 const notifications = (await db.query('SELECT id FROM bildirimler ORDER BY id')).rows;
 assert.ok(notifications.length >= 2);
 assert.equal(await scalar('SELECT mark_notifications_read($1) AS value', [[notifications[0].id]]), 1);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM bildirimler WHERE NOT okundu'), notifications.length - 1);
 assert.equal((await scalar('SELECT follow_profile($1) AS value', [reader])).following, true);
 assert.equal((await scalar('SELECT block_profile($1) AS value', [reader])).blocked, true);
 await assert.rejects(db.query('INSERT INTO mesajlar(gonderen,alan,icerik) VALUES($1,$2,$3)', [owner, reader, 'Engel sonrası']), /row-level security/);
 await assert.rejects(db.query('SELECT follow_profile($1)', [reader]), /FOLLOW_NOT_ALLOWED/);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM takipler WHERE takip_eden=$1 AND takip_edilen=$2', [owner, reader]), 0);
 await scalar('SELECT block_profile($1) AS value', [reader]);
});

test('media identities cannot be forged and DM assets are participant restricted', async () => {
 const asset = randomUUID();
 await actor(owner);
 await assert.rejects(db.query('INSERT INTO media_assets(id,owner_id,public_id,resource_type,intent) VALUES($1,$2,$3,$4,$5)', [asset, owner, 'foreign-media', 'image', 'avatar']), /permission denied/);
 await actor(null, 'service_role');
 await db.query('INSERT INTO media_assets(id,owner_id,public_id,resource_type,intent,status,delivery_type,format) VALUES($1,$2,$3,$4,$5,$6,$7,$8)', [asset, owner, 'senaryo-studio/owner/image', 'image', 'dm', 'ready', 'authenticated', 'png']);
 await assert.rejects(db.query('UPDATE media_assets SET owner_id=$1 WHERE id=$2', [reader, asset]), /IMMUTABLE_MEDIA_IDENTITY/);
 await actor(owner);
 await db.query('INSERT INTO mesajlar(gonderen,alan,medya_asset_id) VALUES($1,$2,$3)', [owner, reader, asset]);
 await actor(reader);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM media_assets WHERE id=$1', [asset]), 1);
 await assert.rejects(db.query('INSERT INTO mesajlar(gonderen,alan,medya_asset_id) VALUES($1,$2,$3)', [reader, owner, asset]), /INVALID_MESSAGE_ASSET/);
 await actor(outsider);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM media_assets WHERE id=$1', [asset]), 0);
});

test('AI reservations deny duplicates, share budgets and only the server settles', async () => {
 const requestId = randomUUID();
 await actor(reader);
 assert.equal((await scalar('SELECT reserve_ai_usage($1,\'generate\') AS value', [requestId])).allowed, true);
 assert.equal((await scalar('SELECT reserve_ai_usage($1,\'generate\') AS value', [requestId])).code, 'DUPLICATE_REQUEST');
 await assert.rejects(db.query('SELECT settle_ai_usage($1,false)', [requestId]), /permission denied/);
 await actor(null, 'service_role');
 assert.equal((await scalar('SELECT settle_ai_usage($1,false) AS value', [requestId])).status, 'failed');
 assert.equal((await scalar('SELECT settle_ai_usage($1,true) AS value', [requestId])).status, 'failed');
 await actor(reader);
 assert.equal((await scalar('SELECT reserve_ai_usage($1,\'scenes\') AS value', [randomUUID()])).remaining, 49);
 await admin();
 await db.query("INSERT INTO ai_usage_reservations(request_id,user_id,operation,status,created_at) SELECT gen_random_uuid(),$1,'pitch','succeeded',now()-interval '2 minutes' FROM generate_series(1,49)", [reader]);
 await actor(reader);
 assert.equal((await scalar('SELECT reserve_ai_usage($1,\'dramaturg\') AS value', [randomUUID()])).code, 'DAILY_LIMIT');
 await actor(outsider);
 for (let n = 0; n < 20; n++) {
  const id = randomUUID();
  assert.equal((await scalar('SELECT reserve_ai_usage($1,\'logline\') AS value', [id])).allowed, true);
  await actor(null, 'service_role');
  await scalar('SELECT settle_ai_usage($1,false) AS value', [id]);
  await actor(outsider);
 }
 assert.equal((await scalar('SELECT reserve_ai_usage($1,\'logline\') AS value', [randomUUID()])).code, 'RATE_LIMIT');
 await admin();
 await db.query("INSERT INTO ai_usage_reservations(request_id,user_id,operation,status,created_at) SELECT gen_random_uuid(),$1,'pitch','failed',now()-interval '2 minutes' FROM generate_series(1,80)", [outsider]);
 await actor(outsider);
 assert.equal((await scalar('SELECT reserve_ai_usage($1,\'logline\') AS value', [randomUUID()])).code, 'DAILY_ATTEMPT_LIMIT');
});

test('simultaneously submitted quota and media registration calls obey atomic capacity limits', async () => {
 await actor(owner);
 const ids = Array.from({ length: 8 }, () => randomUUID());
 const responses = await Promise.all(ids.map((id) => scalar('SELECT reserve_ai_usage($1,\'scenes\') AS value', [id])));
 assert.equal(responses.filter((row) => row.allowed).length, 3);
 assert.ok(responses.filter((row) => !row.allowed).every((row) => row.code === 'CONCURRENCY_LIMIT'));
 await actor(null, 'service_role');
 for (let i = 0; i < ids.length; i++) if (responses[i].allowed) await scalar('SELECT settle_ai_usage($1,false) AS value', [ids[i]]);
 const assets = Array.from({ length: 14 }, () => randomUUID());
 const uploads = await Promise.all(assets.map((id) => scalar("SELECT register_media_upload($1,$2,$3,'image','avatar','image/png',1024,'upload',now()+interval '10 minutes') AS value", [id, owner, `senaryo-studio/${owner}/${id}`])));
 assert.equal(uploads.filter((row) => row.allowed).length, 10);
 assert.ok(uploads.filter((row) => !row.allowed).every((row) => row.code === 'MEDIA_PENDING_LIMIT'));
 await actor(owner);
 await assert.rejects(db.query("SELECT register_media_upload($1,$2,$3,'image','avatar','image/png',1024,'upload',now()+interval '10 minutes')", [randomUUID(), owner, 'forged']), /permission denied/);
});

test('five distinct reporters hide publication and only database moderators can resolve it', async () => {
 const reporters = Array.from({ length: 4 }, () => randomUUID());
 await admin();
 await db.query('INSERT INTO auth.users(id) SELECT unnest($1::uuid[])', [reporters]);
 for (const reporter of reporters) {
  await actor(reporter);
  await scalar('SELECT submit_report($1,\'Moderasyon incelemesi gerekli\') AS value', [scenarioId]);
 }
 await actor(reader);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM senaryolar WHERE id=$1', [scenarioId]), 0);
 await actor(owner);
 assert.equal((await scalar('SELECT set_scenario_visibility($1,true) AS value', [scenarioId])).moderation_hidden, true);
 await assert.rejects(db.query('SELECT moderate_scenario($1,false,\'reviewed\')', [scenarioId]), /MODERATOR_REQUIRED/);
 await admin();
 await db.query("INSERT INTO platform_roles(user_id,role) VALUES($1,'moderator')", [owner]);
 await actor(owner);
 assert.equal((await scalar('SELECT moderate_scenario($1,false,\'reviewed\') AS value', [scenarioId])).moderation_hidden, false);
 await actor(reader);
 assert.equal(await scalar('SELECT count(*)::int AS value FROM senaryolar WHERE id=$1', [scenarioId]), 1);
});

test('challenge ownership/deadline and atomic scenario cascades prevent partial deletion', async () => {
 await admin();
 const challengeId = (await db.query("INSERT INTO challengelar(konu,deadline) VALUES('Bir günlük hikâye',now()+interval '1 day') RETURNING id")).rows[0].id;
 await actor(reader);
 await assert.rejects(db.query('SELECT submit_challenge($1,$2)', [challengeId, scenarioId]), /SCENARIO_NOT_FOUND/);
 await actor(owner);
 assert.equal((await scalar('SELECT submit_challenge($1,$2) AS value', [challengeId, scenarioId])).senaryo_id, scenarioId);
 assert.equal(await scalar('SELECT katilimci_sayisi AS value FROM challengelar WHERE id=$1', [challengeId]), 1);
 assert.equal(await scalar('SELECT delete_scenario($1) AS value', [scenarioId]), true);
 await admin();
 for (const table of ['gonderiler', 'senaryo_versiyonlar', 'begeniler', 'kaydedilenler', 'yorumlar', 'raporlar', 'challenge_katilimlar']) {
  assert.equal(await scalar(`SELECT count(*)::int AS value FROM ${table} WHERE senaryo_id=$1`, [scenarioId]), 0, table);
 }
});

test('legacy standalone archives are preserved and ambiguous links abort the complete migration', async () => {
 const legacy = new PGlite();
 try {
  await legacy.exec(bootstrap);
  await legacy.exec(`CREATE TABLE profiles(id uuid PRIMARY KEY,username text); INSERT INTO auth.users(id) VALUES('${owner}'); INSERT INTO profiles(id,username) VALUES('${owner}','legacy_writer');
   CREATE TABLE senaryo_versiyonlar(id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,user_id uuid,veri text);`);
  const original = JSON.stringify({ senaryo: { baslik: 'Eski arşiv', acilis_sahnesi: 'Korunan sahne', ana_fikir: 'Eski özet' }, beatler: { opening: 'Legacy analysis' } });
  await legacy.query('INSERT INTO senaryo_versiyonlar(user_id,veri) VALUES($1,$2)', [owner, original]);
  await legacy.exec(preflight);
  await legacy.exec(migration);
  const archive = (await legacy.query('SELECT * FROM senaryo_versiyonlar')).rows[0];
  assert.equal(archive.veri, original);
  assert.equal(archive.snapshot.title, 'Eski arşiv');
  assert.ok(archive.senaryo_id);
  assert.equal((await legacy.query('SELECT paylasim_acik FROM senaryolar')).rows[0].paylasim_acik, false);
 } finally { await legacy.close(); }
 const ambiguous = new PGlite();
 try {
  await ambiguous.exec(bootstrap);
  await ambiguous.exec('CREATE TABLE gonderiler(id bigint PRIMARY KEY,user_id uuid); INSERT INTO gonderiler VALUES(99,NULL)');
  await assert.rejects(ambiguous.exec(migration), /PRECHECK/);
  await ambiguous.exec('ROLLBACK');
  assert.equal((await ambiguous.query('SELECT * FROM gonderiler')).rows.length, 1);
  assert.equal((await ambiguous.query("SELECT to_regclass('public.senaryolar') AS value")).rows[0].value, null);
 } finally { await ambiguous.close(); }
});
