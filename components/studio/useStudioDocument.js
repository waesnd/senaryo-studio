import { useCallback, useEffect, useRef, useState } from "react";
import { createBlankScenario, createId, documentFingerprint, hasScenarioContent, normalizeScenario } from "../../lib/scenario";
import { getDraftStorage, readDraft, writeDraft, preserveRecoveryDraft } from "../../lib/drafts";
import { studioRpc } from "../../lib/scenario-client";

export default function useStudioDocument({ user, authHazir, configured, suspended = false }) {
  const [document, setDocument] = useState(() => createBlankScenario());
  const [row, setRow] = useState(null);
  const [ready, setReady] = useState(false);
  const [ownerKey, setOwnerKey] = useState(null);
  const [status, setStatus] = useState("local");
  const [error, setError] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [localAvailable, setLocalAvailable] = useState(true);
  const current = useRef({ document, row, user, ready, status });
  const epoch = useRef(0);
  const inFlight = useRef(null);
  const savedFingerprint = useRef(null);
  const blocked = useRef(false);
  const draftSessionId = useRef(createId("session"));
  const userId = user?.id;
  const accountReady = ready && ownerKey === (userId || "guest");
  current.current = { document, row, user, ready: accountReady, status };

  useEffect(() => {
    if (!authHazir) return;
    epoch.current += 1;
    inFlight.current = null;
    blocked.current = false;
    draftSessionId.current = createId("session");
    const draft = readDraft(getDraftStorage(), userId);
    const next = draft ? normalizeScenario(draft.document) : createBlankScenario();
    setDocument(next);
    setRow(draft?.row || null);
    savedFingerprint.current = draft?.savedFingerprint || null;
    setLastSaved(draft?.lastSaved || null);
    setError("");
    const fingerprint = documentFingerprint(next);
    setStatus(userId && draft?.row && fingerprint === savedFingerprint.current ? "saved" : userId && hasScenarioContent(next) ? "pending" : "local");
    setReady(true);
    setOwnerKey(userId || "guest");
  }, [authHazir, userId]);

  useEffect(() => {
    if (!accountReady || !authHazir) return;
    const success = writeDraft(getDraftStorage(), userId, { document, row, savedFingerprint: savedFingerprint.current, lastSaved, sessionId: draftSessionId.current });
    setLocalAvailable(success);
  }, [document, row, accountReady, userId, authHazir, lastSaved]);

  const save = useCallback(async () => {
    if (inFlight.current) {
      await inFlight.current.promise;
      return save();
    }
    const snapshot = current.current;
    if (!snapshot.user || !configured || !snapshot.ready) {
      setStatus("local");
      return null;
    }
    const fingerprint = documentFingerprint(snapshot.document);
    if (!hasScenarioContent(snapshot.document)) return null;
    if (fingerprint === savedFingerprint.current && snapshot.row) return snapshot.row;
    const operationEpoch = epoch.current;
    setStatus("saving");
    setError("");
    const operation = { sessionId: draftSessionId.current };
    operation.promise = (async () => {
      try {
        const next = await studioRpc("save_scenario", {
          p_id: snapshot.row?.id || null, p_document: snapshot.document,
          p_tip: snapshot.document.metadata.tip, p_tur: snapshot.document.metadata.tur,
          p_expected_revision: snapshot.row?.revision ?? null,
        });
        if (!next?.id || !Number.isInteger(Number(next.revision))) throw new Error("Kayıt sonucu doğrulanamadı. Taslağınız bu tarayıcıda korunur.");
        const timestamp = new Date().toISOString();
        if (epoch.current !== operationEpoch) {
          const storage = getDraftStorage();
          const priorDraft = readDraft(storage, snapshot.user.id);
          if (priorDraft?.sessionId === operation.sessionId) {
            writeDraft(storage, snapshot.user.id, { ...priorDraft, row: next, savedFingerprint: fingerprint, lastSaved: timestamp });
          } else {
            // The account opened a new draft meanwhile; keep its current work and
            // retain this completed cloud save in its own recovery archive.
            preserveRecoveryDraft(storage, snapshot.user.id, { document: snapshot.document, row: next });
          }
          return null;
        }
        setRow(next);
        current.current.row = next;
        savedFingerprint.current = fingerprint;
        setLastSaved(timestamp);
        blocked.current = false;
        setStatus(documentFingerprint(current.current.document) === fingerprint ? "saved" : "pending");
        // Persist the returned revision synchronously so account changes do not lose it.
        writeDraft(getDraftStorage(), snapshot.user.id, { document: current.current.document, row: next, savedFingerprint: fingerprint, lastSaved: timestamp, sessionId: operation.sessionId });
        return next;
      } catch (failure) {
        if (epoch.current === operationEpoch) {
          blocked.current = true;
          setStatus(failure.code === "REVISION_CONFLICT" ? "conflict" : "error");
          setError(failure.message || "Kaydedilemedi. Taslağınız korundu.");
        }
        throw failure;
      } finally {
        if (inFlight.current === operation) inFlight.current = null;
      }
    })();
    inFlight.current = operation;
    return operation.promise;
  }, [configured]);

  useEffect(() => {
    if (suspended || !accountReady || !userId || !configured || blocked.current || !hasScenarioContent(document)) return;
    if (documentFingerprint(document) === savedFingerprint.current) return;
    if (current.current.status !== "saving") setStatus("pending");
    const timer = setTimeout(() => { save().catch(() => {}); }, 1600);
    return () => clearTimeout(timer);
  }, [document, row?.revision, accountReady, userId, configured, save, suspended]);

  const edit = useCallback((update) => {
    setDocument(previous => typeof update === "function" ? update(previous) : update);
    if (current.current.status !== "conflict" && current.current.status !== "error") setStatus(current.current.user ? "pending" : "local");
  }, []);

  const replace = useCallback((nextDocument, nextRow = null, isSaved = false) => {
    if (inFlight.current) throw new Error("Bulut kaydı tamamlanınca bu işlemi yeniden deneyin.");
    const snapshot = current.current;
    if (hasScenarioContent(snapshot.document)) {
      const preserved = preserveRecoveryDraft(getDraftStorage(), snapshot.user?.id, { document: snapshot.document, row: snapshot.row });
      if (!preserved) throw new Error("Tarayıcı kurtarma kopyası oluşturulamadı. Önce eserinizi dışa aktarın.");
    }
    epoch.current += 1;
    blocked.current = false;
    const normalized = normalizeScenario(nextDocument);
    savedFingerprint.current = isSaved ? documentFingerprint(normalized) : null;
    setDocument(normalized);
    setRow(nextRow);
    current.current.document = normalized;
    current.current.row = nextRow;
    setError("");
    setLastSaved(isSaved ? nextRow?.updated_at || null : null);
    setStatus(isSaved ? "saved" : snapshot.user ? "pending" : "local");
  }, []);

  const retry = useCallback(async () => {
    blocked.current = false;
    return save();
  }, [save]);

  return { document, row, ready: accountReady, status, error, lastSaved, localAvailable, edit, replace, save, retry, setRow,
    dirty: documentFingerprint(document) !== savedFingerprint.current };
}
