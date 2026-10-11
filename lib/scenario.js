// The same document travels through the editor, snapshots and export adapters.
export const SCENARIO_SCHEMA_VERSION = 1;

export function createId(prefix = "item") {
  return `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`}`;
}

function text(value) {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function legacyCharacters(value) {
  if (Array.isArray(value)) return value;
  const description = text(value);
  // Preserve unstructured descriptions verbatim; guessing names can destroy text.
  return description ? [{ id: "character_legacy", name: "Karakter notları", description }] : [];
}

export function normalizeScenario(input = {}) {
  let source = input?.document || input?.snapshot || input?.senaryo || input;
  if (typeof source === "string") {
    try { source = JSON.parse(source); } catch { source = { acilis_sahnesi: source }; }
  }
  if (!source || typeof source !== "object" || Array.isArray(source)) source = {};
  const characters = Array.isArray(source.characters) ? source.characters : legacyCharacters(source.karakter);
  const scenes = Array.isArray(source.scenes) ? source.scenes : text(source.acilis_sahnesi || source.sahne)
    ? [{ id: "scene_legacy", heading: "AÇILIŞ SAHNESİ", action: text(source.acilis_sahnesi || source.sahne), dialogue: [] }] : [];
  return {
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    title: text(source.title ?? source.baslik),
    tagline: text(source.tagline),
    synopsis: text(source.synopsis ?? source.ana_fikir),
    characters: characters.map((item, index) => ({
      id: text(item?.id) || `character_${index + 1}`,
      name: text(item?.name ?? item?.isim ?? item?.ad),
      description: text(item?.description ?? item?.aciklama ?? item?.profil ?? (typeof item === "string" ? item : "")),
    })),
    scenes: scenes.map((item, index) => ({
      id: text(item?.id) || `scene_${index + 1}`,
      heading: text(item?.heading ?? item?.baslik) || `SAHNE ${index + 1}`,
      action: text(item?.action ?? item?.aksiyon ?? (typeof item === "string" ? item : "")),
      dialogue: (Array.isArray(item?.dialogue) ? item.dialogue : []).map((line, lineIndex) => ({
        id: text(line?.id) || `dialogue_${index + 1}_${lineIndex + 1}`,
        character: text(line?.character ?? line?.karakter),
        text: text(line?.text ?? line?.metin),
      })),
    })),
    dramaticQuestion: text(source.dramaticQuestion ?? source.buyuk_soru ?? source.soru),
    metadata: {
      ...(source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {}),
      tip: text(source.metadata?.tip ?? input.tip ?? source.tip) || "Film",
      tur: text(source.metadata?.tur ?? input.tur ?? source.tur) || "Drama",
    },
  };
}

export function createBlankScenario(metadata = {}) {
  const document = normalizeScenario({ metadata });
  document.scenes = [{ id: createId("scene"), heading: "İÇ. MEKÂN - GÜNDÜZ", action: "", dialogue: [] }];
  return document;
}

export function sceneText(scene) {
  return [scene.heading, scene.action, ...scene.dialogue.map(line => `${line.character}\n${line.text}`)].filter(Boolean).join("\n\n");
}

export function scenarioText(input) {
  const document = normalizeScenario(input);
  return [document.title, document.tagline, document.synopsis, ...document.characters.map(item => `${item.name}\n${item.description}`), ...document.scenes.map(sceneText), document.dramaticQuestion].filter(Boolean).join("\n\n");
}

export function scenarioToLegacy(input) {
  const document = normalizeScenario(input);
  return {
    baslik: document.title, tagline: document.tagline, ana_fikir: document.synopsis,
    karakter: document.characters.map(item => `${item.name}: ${item.description}`).join("\n\n"),
    acilis_sahnesi: document.scenes.map(sceneText).join("\n\n"),
    buyuk_soru: document.dramaticQuestion,
  };
}

export function scenarioWordCount(document) {
  return scenarioText(document).trim().split(/\s+/u).filter(Boolean).length;
}

export function documentFingerprint(document) {
  return JSON.stringify(normalizeScenario(document));
}

export function scenarioSourceFingerprint(input) {
  const document = normalizeScenario(input);
  // Editorial staleness identifier, never used as an authorization credential.
  // Review metadata is excluded because it is not part of the model's source.
  const source = JSON.stringify({ ...document, metadata: { tip: document.metadata.tip, tur: document.metadata.tur } });
  let first = 1779033703, second = 3144134277, third = 1013904242, fourth = 2773480762;
  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    first = second ^ Math.imul(first ^ code, 597399067);
    second = third ^ Math.imul(second ^ code, 2869860233);
    third = fourth ^ Math.imul(third ^ code, 951274213);
    fourth = first ^ Math.imul(fourth ^ code, 2716044179);
  }
  first = Math.imul(third ^ (first >>> 18), 597399067);
  second = Math.imul(fourth ^ (second >>> 22), 2869860233);
  third = Math.imul(first ^ (third >>> 17), 951274213);
  fourth = Math.imul(second ^ (fourth >>> 19), 2716044179);
  return `v1:${source.length}:${[first ^ second ^ third ^ fourth, second ^ first, third ^ first, fourth ^ first].map(value => (value >>> 0).toString(16).padStart(8, "0")).join("")}`;
}

export function normalizeVersion(row = {}) {
  let legacy = row;
  if (!row.document && !row.snapshot && row.veri) {
    try { legacy = typeof row.veri === "string" ? JSON.parse(row.veri) : row.veri; } catch { legacy = row; }
  }
  const source = row.document || row.snapshot || legacy.senaryo || legacy;
  return {
    ...row,
    label: row.label || row.etiket || `Sürüm ${row.versiyon || row.revision || ""}`.trim(),
    document: normalizeScenario({ ...legacy, ...row, document: source, tip: legacy.tip || row.tip, tur: legacy.tur || row.tur }),
  };
}

export function hasScenarioContent(document) {
  const source = normalizeScenario(document);
  return Boolean([source.title, source.synopsis, source.tagline, source.dramaticQuestion,
    ...source.characters.flatMap(item => [item.name, item.description]),
    ...source.scenes.flatMap(scene => [scene.action, ...scene.dialogue.flatMap(line => [line.character, line.text])])].some(value => value.trim()));
}

export function applyGeneratedScenario(current, response, metadata = {}) {
  const candidate = response?.data?.senaryo || response?.senaryo || response?.data || response;
  if (!candidate || typeof candidate !== "object" || (!candidate.title && !candidate.baslik)) {
    throw new Error("Üretim yanıtında geçerli bir senaryo bulunamadı. Mevcut çalışmanız korundu.");
  }
  return normalizeScenario({ document: { ...candidate, metadata: { ...current?.metadata, ...metadata } } });
}

export function inspectScenario(input) {
  const document = normalizeScenario(input);
  const issues = [];
  const names = new Set(document.characters.map(character => character.name.trim().toLocaleLowerCase("tr")));
  if (!document.synopsis.trim()) issues.push({ key: "synopsis", text: "Hikâye özetini ekleyerek karakterin hedefini ve temel çatışmayı netleştirin." });
  if (!document.dramaticQuestion.trim()) issues.push({ key: "question", text: "Eserin sonuna kadar izleyiciyi taşıyan dramatik soruyu tanımlayın." });
  const missing = new Map();
  document.scenes.forEach((scene, index) => {
    if (!scene.action.trim() && !scene.dialogue.some(line => line.text.trim())) issues.push({ key: `empty-${scene.id}`, sceneId: scene.id, text: `${index + 1}. sahne henüz boş.` });
    scene.dialogue.forEach(line => {
      const name = line.character.trim();
      if (name && !names.has(name.toLocaleLowerCase("tr"))) missing.set(name.toLocaleLowerCase("tr"), { name, sceneId: scene.id });
      if (!name && line.text.trim()) issues.push({ key: `speaker-${line.id}`, sceneId: scene.id, text: `${index + 1}. sahnede bir diyaloğun konuşanı tanımlanmamış.` });
    });
  });
  for (const { name, sceneId } of missing.values()) issues.push({ key: `character-${name}`, sceneId, text: `“${name}” diyalogda geçiyor; karakter dosyasında bir tanım bulunmuyor.` });
  return issues;
}

export function compareScenarioDocuments(before, after) {
  const original = normalizeScenario(before);
  const updated = normalizeScenario(after);
  const fields = [["title", "Başlık"], ["tagline", "Tagline"], ["synopsis", "Hikâye özeti"], ["dramaticQuestion", "Dramatik soru"]];
  function compareItems(first, second) {
    const firstMap = new Map(first.map(item => [item.id, item]));
    const secondMap = new Map(second.map(item => [item.id, item]));
    return {
      added: second.filter(item => !firstMap.has(item.id)),
      removed: first.filter(item => !secondMap.has(item.id)),
      changed: second.filter(item => firstMap.has(item.id) && JSON.stringify(firstMap.get(item.id)) !== JSON.stringify(item)),
      orderChanged: first.filter(item => secondMap.has(item.id)).map(item => item.id).join("|") !== second.filter(item => firstMap.has(item.id)).map(item => item.id).join("|"),
    };
  }
  return { changedFields: fields.filter(([key]) => original[key] !== updated[key]).map(([, label]) => label),
    scenes: compareItems(original.scenes, updated.scenes), characters: compareItems(original.characters, updated.characters),
    metadataChanged: JSON.stringify(original.metadata) !== JSON.stringify(updated.metadata) };
}
