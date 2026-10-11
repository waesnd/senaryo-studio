import test from "node:test";
import assert from "node:assert/strict";
import { normalizeScenario, normalizeVersion, applyGeneratedScenario, createBlankScenario, documentFingerprint, scenarioSourceFingerprint, scenarioToLegacy, scenarioWordCount, hasScenarioContent, compareScenarioDocuments, inspectScenario } from "../lib/scenario.js";
import { draftStorageKey, readDraft, writeDraft, readRecoveryDrafts, preserveRecoveryDraft } from "../lib/drafts.js";

function memoryStorage() { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }; }
const canonical = { schemaVersion: 1, title: "İki Kardeş", tagline: "Aynı gece, iki hafıza.", synopsis: "Ayşe gerçeği öğrenmek ister.", characters: [{ id: "c1", name: "Ayşe", description: "Kardeşine güvenmek ister." }], scenes: [{ id: "s1", heading: "İÇ. EV - GECE", action: "Ayşe kapıyı açar.", dialogue: [{ id: "d1", character: "Ayşe", text: "Neredeydin?" }] }], dramaticQuestion: "Gerçeği kaldırabilirler mi?", metadata: { tip: "Dizi", tur: "Gerilim", generation: { prompt: "Kardeşler", requestedScenes: 5 }, challengeId: 42 } };

test("canonical normalization preserves Turkish script, IDs, generation and challenge metadata", () => {
  assert.deepEqual(normalizeScenario(canonical), canonical);
  assert.equal(documentFingerprint(normalizeScenario(canonical)), documentFingerprint(canonical));
  assert.equal(scenarioToLegacy(canonical).acilis_sahnesi, "İÇ. EV - GECE\n\nAyşe kapıyı açar.\n\nAyşe\nNeredeydin?");
});

test("legacy text is preserved verbatim and normalization does not invent dialogue", () => {
  const legacy = { baslik: "Çığlık", ana_fikir: "Özgün\n\nözet", karakter: "Ayşe: Çelişkili.\nMurat: İnatçı.", sahne: "İÇ. EV - GECE\n\nMURAT\nGidiyorum.", tip: "Film", tur: "Drama" };
  const document = normalizeScenario(legacy);
  assert.equal(document.characters[0].description, legacy.karakter);
  assert.equal(document.scenes[0].action, legacy.sahne);
  assert.deepEqual(document.scenes[0].dialogue, []);
  assert.equal(document.synopsis, legacy.ana_fikir);
});

test("snapshot and both legacy version formats retain source metadata", () => {
  const modern = normalizeVersion({ id: 1, snapshot: canonical, tip: "Film", tur: "Drama", label: "İlk sürüm" });
  assert.deepEqual(modern.document, canonical);
  const archive = normalizeVersion({ veri: JSON.stringify({ senaryo: { baslik: "Eski eser", acilis_sahnesi: "Eski sahne" }, tip: "Dizi", tur: "Suç" }), versiyon: 2 });
  assert.equal(archive.document.metadata.tip, "Dizi");
  assert.equal(archive.document.metadata.tur, "Suç");
  assert.equal(archive.document.scenes[0].action, "Eski sahne");
  assert.equal(normalizeVersion({ baslik: "Eski", sahne: "Metin", tip: "Film", tur: "Komedi" }).document.metadata.tur, "Komedi");
});

test("failed or empty generation cannot mutate or replace existing work", () => {
  const before = structuredClone(canonical);
  assert.throws(() => applyGeneratedScenario(canonical, { ok: false, error: "Bağlantı hatası" }), /Mevcut çalışmanız korundu/);
  assert.throws(() => applyGeneratedScenario(canonical, { data: { senaryo: {} } }), /geçerli bir senaryo/);
  assert.deepEqual(canonical, before);
  const accepted = applyGeneratedScenario(canonical, { data: { senaryo: { baslik: "Yeni", acilis_sahnesi: "Yeni sahne" } } }, { tip: "Film", tur: "Drama" });
  assert.equal(accepted.title, "Yeni");
  assert.equal(canonical.title, "İki Kardeş");
});

test("blank documents are not treated as saveable content; real dialogue and character notes count", () => {
  assert.equal(hasScenarioContent(createBlankScenario()), false);
  assert.equal(hasScenarioContent({ scenes: [{ heading: "İÇ. EV - GECE", dialogue: [{ character: "Ayşe", text: "Merhaba" }] }] }), true);
  assert.ok(scenarioWordCount(canonical) > 10);
});

test("account draft isolation rejects forged owners and malformed storage", () => {
  const storage = memoryStorage();
  writeDraft(storage, "author-a", { document: canonical, row: { id: 10, revision: 3 } });
  assert.equal(readDraft(storage, "author-b"), null);
  assert.equal(readDraft(storage, null), null);
  assert.deepEqual(readDraft(storage, "author-a").document, canonical);
  storage.setItem(draftStorageKey("author-b"), storage.getItem(draftStorageKey("author-a")));
  assert.equal(readDraft(storage, "author-b"), null);
  storage.setItem(draftStorageKey("author-a"), "{broken");
  assert.equal(readDraft(storage, "author-a"), null);
});

test("recovery archive caps copies, deduplicates and isolates accounts", () => {
  const storage = memoryStorage();
  for (let index = 0; index < 25; index += 1) preserveRecoveryDraft(storage, "a", { document: { ...canonical, title: `Eser ${index}` } });
  preserveRecoveryDraft(storage, "a", { document: { ...canonical, title: "Eser 24" } });
  assert.equal(readRecoveryDrafts(storage, "a").length, 20);
  assert.equal(readRecoveryDrafts(storage, "a")[0].document.title, "Eser 24");
  assert.equal(readRecoveryDrafts(storage, "a").at(-1).document.title, "Eser 5");
  assert.deepEqual(readRecoveryDrafts(storage, "b"), []);
  assert.equal(writeDraft({ setItem() { throw new Error("quota exceeded"); } }, "a", { document: canonical }), false);
});

test("version comparison detects dialogue changes, additions, removals and scene order independently", () => {
  const original = { ...canonical, scenes: [...canonical.scenes, { id: "s2", heading: "DIŞ. EV - SABAH", action: "Güneş doğar.", dialogue: [] }] };
  const edited = structuredClone(original);
  edited.scenes[0].dialogue[0].text = "Geldin mi?";
  edited.scenes.reverse();
  edited.scenes.push({ id: "s3", heading: "İÇ. EV - SABAH", action: "Ayşe uyanır.", dialogue: [] });
  edited.title = "Üç Kardeş";
  edited.characters = [];
  const comparison = compareScenarioDocuments(original, edited);
  assert.deepEqual(comparison.changedFields, ["Başlık"]);
  assert.deepEqual(comparison.scenes.changed.map(scene => scene.id), ["s1"]);
  assert.deepEqual(comparison.scenes.added.map(scene => scene.id), ["s3"]);
  assert.equal(comparison.scenes.orderChanged, true);
  assert.equal(comparison.scenes.removed.length, 0);
  assert.deepEqual(comparison.characters.removed.map(character => character.id), ["c1"]);
});

test("writing checks match Turkish character names and identify missing speakers without model guesses", () => {
  const document = structuredClone(canonical);
  document.characters[0].name = "IŞIK";
  document.scenes[0].dialogue = [{ id: "d1", character: "ışık", text: "Beni duyuyor musun?" }, { id: "d2", character: "", text: "Sözsüz konuşan." }, { id: "d3", character: "İpek", text: "Geldim." }];
  const issues = inspectScenario(document);
  assert.equal(issues.some(issue => issue.text.includes("ışık")), false);
  assert.ok(issues.some(issue => issue.key === "speaker-d2"));
  assert.ok(issues.some(issue => issue.text.includes("İpek") && issue.sceneId === "s1"));
});

test("persisting an analysis never makes its own source stale; screenplay and genre changes do", () => {
  const source = scenarioSourceFingerprint(canonical);
  const document = structuredClone(canonical);
  document.metadata.analyses = { dramaturg: { fingerprint: source, value: { sonuc: "Öneri" } } };
  assert.equal(scenarioSourceFingerprint(document), source);
  assert.notEqual(documentFingerprint(document), documentFingerprint(canonical));
  assert.equal(normalizeVersion({ snapshot: document }).document.metadata.analyses.dramaturg.fingerprint, source);
  document.scenes[0].dialogue[0].text = "Başka bir metin.";
  assert.notEqual(scenarioSourceFingerprint(document), source);
  document.scenes[0].dialogue[0].text = canonical.scenes[0].dialogue[0].text;
  document.metadata.tur = "Komedi";
  assert.notEqual(scenarioSourceFingerprint(document), source);
});
