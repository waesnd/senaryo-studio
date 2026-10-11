export const DRAFT_SCHEMA_VERSION = 1;

export function getDraftStorage() {
  try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
}

export function draftStorageKey(userId) {
  return `senaryo-studio:draft:v1:${userId || "guest"}`;
}

export function writeDraft(storage, userId, value) {
  if (!storage) return false;
  try {
    storage.setItem(draftStorageKey(userId), JSON.stringify({ ...value, draftSchemaVersion: DRAFT_SCHEMA_VERSION, ownerId: userId || "guest", updatedAt: new Date().toISOString() }));
    return true;
  } catch { return false; }
}

export function readDraft(storage, userId) {
  if (!storage) return null;
  try {
    const value = JSON.parse(storage.getItem(draftStorageKey(userId)) || "null");
    if (!value || value.draftSchemaVersion !== DRAFT_SCHEMA_VERSION || value.ownerId !== (userId || "guest") || !value.document) return null;
    return value;
  } catch { return null; }
}

export function removeDraft(storage, userId) {
  try { storage?.removeItem(draftStorageKey(userId)); } catch { /* storage unavailable */ }
}

export function readRecoveryDrafts(storage, userId) {
  try {
    const values = JSON.parse(storage?.getItem(`${draftStorageKey(userId)}:recovery`) || "[]");
    return Array.isArray(values) ? values.filter(value => value.ownerId === (userId || "guest") && value.document).slice(0, 20) : [];
  } catch { return []; }
}

export function preserveRecoveryDraft(storage, userId, value) {
  try {
    const values = readRecoveryDrafts(storage, userId);
    if (values[0]?.document && JSON.stringify(values[0].document) === JSON.stringify(value.document)) return true;
    storage.setItem(`${draftStorageKey(userId)}:recovery`, JSON.stringify([
      { ...value, ownerId: userId || "guest", updatedAt: new Date().toISOString() }, ...values,
    ].slice(0, 20)));
    return true;
  } catch { return false; }
}
