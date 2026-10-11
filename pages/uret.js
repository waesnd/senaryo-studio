import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import AppShell from "../components/AppShell";
import { Alert, Badge, Button, Card, Dialog, EmptyState, Field, Input, Select, Spinner, Tabs, Textarea } from "../components/ui";
import SceneEditor from "../components/studio/SceneEditor";
import AnalysisResult from "../components/studio/AnalysisResult";
import useStudioDocument from "../components/studio/useStudioDocument";
import styles from "../components/studio/Studio.module.css";
import { useAuth } from "../lib/useAuth";
import { getSupabaseClient } from "../lib/supabase";
import { applyGeneratedScenario, createBlankScenario, createId, hasScenarioContent, inspectScenario, normalizeScenario, normalizeVersion, scenarioSourceFingerprint, scenarioText, scenarioToLegacy, scenarioWordCount } from "../lib/scenario";
import { getDraftStorage, readDraft, readRecoveryDrafts } from "../lib/drafts";
import { requestStudioAI, studioRpc } from "../lib/scenario-client";
import { downloadScenario } from "../lib/exports";

const GENRES = ["Drama", "Gerilim", "Bilim Kurgu", "Komedi", "Romantik", "Korku", "Aksiyon", "Fantastik", "Suç", "Tarihi", "Animasyon", "Belgesel"];
const TOOLS = [
  { id: "dramaturg", label: "Dramaturji", description: "Çatışma, tempo ve karakter gelişimi için gerekçeli bir okuma." },
  { id: "beatsheet", label: "Beat sheet", description: "Hikâyenin dönüm noktalarını görünür hâle getirin." },
  { id: "karakterbible", label: "Karakter dosyası", description: "Karakterlerin motivasyonunu ve geçmişini derinleştirin." },
  { id: "karakter", label: "Karakter analizi", description: "Ana karakterin geçmişi, iç çatışması ve dönüşümünü kaynak metin üzerinden inceleyin." },
  { id: "herosjourney", label: "Kahraman yolculuğu", description: "Dönüşümün hikâye boyunca nasıl ilerlediğini inceleyin." },
  { id: "logline", label: "Logline", description: "Hikâyenizi tek cümlede anlatan üç farklı öneri." },
  { id: "pitch", label: "Yapımcı sunumu", description: "Hedef kitle, hikâyenin farkı ve yapım vizyonu." },
  { id: "puan", label: "Senaryo değerlendirmesi", description: "AI değerlendirmesi öznel bir öneridir; editör kararının yerini tutmaz." },
  { id: "diyalog", label: "Metin düzenleme", description: "Seçtiğiniz aksiyon veya diyaloğu öneri olarak yeniden yazın." },
  { id: "scenes", label: "Sahne yazımı", description: "Mevcut esere uygun, düzenlenebilir kısa sahneler hazırlayın. Öneriler kabulünüzden sonra esere eklenir." },
];
const STATUS = { local: "Bu tarayıcıda taslak", pending: "Bulut kaydı bekleniyor", saving: "Buluta kaydediliyor…", saved: "Buluta kaydedildi", error: "Buluta kaydedilemedi", conflict: "Sürüm çakışması" };
const FEEDBACK_TYPES = { pace: "Tempo", dialogue: "Diyalog", character: "Karakter", structure: "Yapı", continuity: "Tutarlılık" };

function dateLabel(value) { return value ? new Date(value).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""; }

export default function Uret() {
  const router = useRouter();
  const { user, authHazir, configured } = useAuth();
  const accountKey = user?.id || "guest";
  const requestedId = typeof router.query.id === "string" && /^\d+$/.test(router.query.id) ? router.query.id : null;
  const loadKey = `${accountKey}:${requestedId || "new"}`;
  const [loadedKey, setLoadedKey] = useState(null);
  const suspended = !router.isReady || Boolean(requestedId && loadedKey !== loadKey);
  const studio = useStudioDocument({ user, authHazir, configured, suspended });
  const { document, row } = studio;
  const state = useRef(studio);
  state.current = studio;
  const identity = useRef(accountKey);
  identity.current = accountKey;
  const [tab, setTab] = useState("script");
  const [notice, setNotice] = useState(null);
  const [operation, setOperation] = useState(null);
  const [archive, setArchive] = useState(null);
  const [archiveRows, setArchiveRows] = useState([]);
  const [archiveBusy, setArchiveBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [versionLabel, setVersionLabel] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generationMode, setGenerationMode] = useState("new");
  const [generation, setGeneration] = useState({ tip: "Film", tur: "Drama", prompt: "", characters: 3, scenes: 5 });
  const [candidate, setCandidate] = useState(null);
  const [toolId, setToolId] = useState("dramaturg");
  const [selection, setSelection] = useState(null);
  const [selectionText, setSelectionText] = useState("");
  const [sceneBrief, setSceneBrief] = useState("");
  const [sceneCount, setSceneCount] = useState(2);
  const [aiBusy, setAiBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [quota, setQuota] = useState(null);
  const [quotaReset, setQuotaReset] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const abortRef = useRef(null);
  const archiveRequest = useRef(0);
  const countdownActive = countdown > 0;
  const userId = user?.id;
  const tool = TOOLS.find(item => item.id === toolId);
  const analyses = document.metadata.analyses && typeof document.metadata.analyses === "object" ? document.metadata.analyses : {};
  const storedAnalysis = analyses[toolId];
  const analysis = storedAnalysis && typeof storedAnalysis.fingerprint === "string" && typeof storedAnalysis.sourceTitle === "string" && storedAnalysis.value && typeof storedAnalysis.value === "object" ? storedAnalysis : null;
  const stale = analysis && analysis.fingerprint !== scenarioSourceFingerprint(document);
  const consistencyIssues = inspectScenario(document);
  const toolContextReady = toolId === "diyalog" || Boolean(document.synopsis.trim() || document.characters.some(character => character.name.trim() || character.description.trim()) || document.scenes.some(scene => scene.action.trim() || scene.dialogue.some(line => line.text.trim())));

  useEffect(() => {
    abortRef.current?.abort();
    archiveRequest.current += 1;
    setCandidate(null); setSelection(null); setSelectionText(""); setNotice(null); setAiBusy(false); setArchive(null); setArchiveRows([]); setOperation(null); setChallenge(null); setConfirmAction(null); setGenerateOpen(false); setGeneration({ tip: "Film", tur: "Drama", prompt: "", characters: 3, scenes: 5 }); setSceneBrief(""); setVersionLabel(""); setCountdown(0); setQuota(null); setQuotaReset(null);
    return () => abortRef.current?.abort();
  }, [accountKey]);

  useEffect(() => {
    if (!countdownActive) return;
    const timer = setInterval(() => setCountdown(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [countdownActive]);

  useEffect(() => {
    if (quota !== 0 || !quotaReset || !Number.isFinite(new Date(quotaReset).getTime())) return;
    const check = () => { if (Date.now() >= new Date(quotaReset).getTime()) setQuota(null); };
    check();
    const timer = setInterval(check, Math.min(60000, Math.max(1000, new Date(quotaReset).getTime() - Date.now())));
    return () => clearInterval(timer);
  }, [quota, quotaReset]);

  useEffect(() => {
    if (!router.isReady || !authHazir || !studio.ready || !requestedId) return;
    let active = true;
    const owner = accountKey;
    async function load() {
      try {
        const client = getSupabaseClient();
        if (!client || !userId) throw new Error("Buluttaki eserinizi açmak için giriş yapın.");
        const { data, error } = await client.from("senaryolar").select("*").eq("id", requestedId).maybeSingle();
        if (!active || identity.current !== owner) return;
        if (error || !data) throw new Error("Eser bulunamadı veya erişiminiz yok.");
        if (data.user_id !== userId) throw new Error("Bu eserin düzenleme yetkisi size ait değil.");
        if (!(String(state.current.row?.id) === requestedId && state.current.dirty)) state.current.replace(normalizeScenario(data), data, true);
        setLoadedKey(loadKey);
      } catch (error) {
        if (active && identity.current === owner) { setNotice({ tone: "danger", text: error.message }); setLoadedKey(loadKey); }
      }
    }
    load();
    return () => { active = false; };
  }, [requestedId, loadKey, authHazir, studio.ready, accountKey, router.isReady, userId]);

  useEffect(() => {
    if (!router.isReady || !configured) return;
    const value = router.query.challengeId || router.query.challenge;
    if (!value || !/^\d+$/.test(String(value))) return;
    let active = true;
    getSupabaseClient()?.from("challengelar").select("id,konu,aciklama,tur,tip,deadline").eq("id", value).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error || !data) { setNotice({ tone: "warning", text: "Challenge doğrulanamadı. Eserinizi normal taslak olarak sürdürebilirsiniz." }); return; }
      setChallenge(data);
      setGeneration(previous => ({ ...previous, prompt: [data.konu, data.aciklama].filter(Boolean).join("\n"), tip: data.tip || previous.tip, tur: data.tur || previous.tur }));
    });
    return () => { active = false; };
  }, [router.isReady, router.query.challengeId, router.query.challenge, configured]);

  function reportError(error) { if (error.name !== "AbortError") setNotice({ tone: "danger", text: error.message || "İşlem tamamlanamadı. Çalışmanız korundu." }); }
  async function perform(name, action) {
    if (operation) return;
    const owner = accountKey;
    setOperation(name); setNotice(null);
    try { await action(() => identity.current === owner); } catch (error) { if (identity.current === owner) reportError(error); }
    finally { if (identity.current === owner) setOperation(null); }
  }
  function update(key, value) { studio.edit(previous => ({ ...previous, [key]: value })); }
  function editMetadata(key, value) { studio.edit(previous => ({ ...previous, metadata: { ...previous.metadata, [key]: value } })); }
  function editScene(scene) { studio.edit(previous => ({ ...previous, scenes: previous.scenes.map(item => item.id === scene.id ? scene : item) })); }
  function moveScene(index, direction) { studio.edit(previous => { const scenes = [...previous.scenes]; const destination = index + direction; if (destination < 0 || destination >= scenes.length) return previous; [scenes[index], scenes[destination]] = [scenes[destination], scenes[index]]; return { ...previous, scenes }; }); }
  function assist(target) { setSelection({ ...target, fingerprint: scenarioSourceFingerprint(document) }); setSelectionText(target.text); setToolId("diyalog"); window.document.getElementById("studio-tools")?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function openGenerator(mode) { setGenerationMode(mode); setGeneration(previous => ({ ...previous, tip: document.metadata.tip, tur: document.metadata.tur })); setGenerateOpen(true); }
  function preserveThen(action, title, text) { setConfirmAction({ action, title, text }); }

  async function generate() {
    if (aiBusy || countdown || (quota === 0 && (!quotaReset || new Date(quotaReset) > new Date()))) return;
    const owner = accountKey;
    const sourceFingerprint = scenarioSourceFingerprint(document);
    abortRef.current?.abort(); const controller = new AbortController(); abortRef.current = controller;
    setAiBusy(true); setNotice(null);
    try {
      const prompt = generationMode === "revise" ? `Aşağıdaki eseri geliştir. Düzenlenmiş başlık, hikâye, karakterler ve açılış önerisini ver. Yazarın isteği: ${generation.prompt}\n\n${scenarioText(document).slice(0, 50000)}` : generation.prompt;
      const response = await requestStudioAI("generate", { tip: generation.tip, tur: generation.tur, ozelIstek: prompt, karakterSayisi: Number(generation.characters), sahneSayisi: Number(generation.scenes) }, controller.signal);
      if (identity.current !== owner) return;
      const next = applyGeneratedScenario(generationMode === "revise" ? document : null, response.data, { tip: generation.tip, tur: generation.tur, analyses: {}, generation: { prompt: generation.prompt, generatedAt: new Date().toISOString(), requestedScenes: Number(generation.scenes), requestedCharacters: Number(generation.characters) }, ...(challenge ? { challengeId: challenge.id } : {}) });
      setCandidate({ document: next, mode: generationMode, sourceFingerprint }); setGenerateOpen(false);
      updateQuota(response.meta);
    } catch (error) { if (identity.current === owner) { handleAiError(error); } }
    finally { if (identity.current === owner) setAiBusy(false); }
  }
  function updateQuota(meta) { const remaining = meta?.remaining ?? meta?.kalan; if (Number.isFinite(Number(remaining)) && remaining != null) setQuota(Number(remaining)); if (meta?.resetAt || meta?.reset_at) setQuotaReset(meta.resetAt || meta.reset_at); }
  function handleAiError(error) {
    if (error.status === 429) {
      if (/DAILY|BUDGET/i.test(error.code)) { setQuota(0); setQuotaReset(error.resetAt || null); }
      else setCountdown(Math.max(1, error.retryAfter || 60));
    }
    reportError(error);
  }
  async function runTool() {
    if (aiBusy || countdown) return;
    if (toolId === "diyalog" && selection && selection.fingerprint !== scenarioSourceFingerprint(document)) {
      setNotice({ tone: "warning", text: "Seçimden sonra eser değişti. Düzenlemek istediğiniz metni sahnede yeniden seçin." });
      return;
    }
    const owner = accountKey; const fingerprint = scenarioSourceFingerprint(document); const sourceRevision = row?.revision || null;
    abortRef.current?.abort(); const controller = new AbortController(); abortRef.current = controller;
    setAiBusy(true); setNotice(null);
    try {
      const body = toolId === "diyalog" ? { metin: selectionText, tur: document.metadata.tur } : {
        [toolId === "karakter" ? "concept" : "senaryo"]: scenarioToLegacy(document), tip: document.metadata.tip, tur: document.metadata.tur,
        ...(toolId === "scenes" ? { sceneCount: Number(sceneCount), instruction: sceneBrief } : {}),
      };
      const response = await requestStudioAI(toolId, body, controller.signal);
      if (identity.current !== owner) return;
      const result = { value: response.data, fingerprint, sourceRevision, sourceTitle: document.title || "Başlıksız eser", createdAt: new Date().toISOString(), selection };
      studio.edit(previous => ({ ...previous, metadata: { ...previous.metadata, analyses: { ...previous.metadata.analyses, [toolId]: result } } }));
      updateQuota(response.meta);
    } catch (error) { if (identity.current === owner) handleAiError(error); }
    finally { if (identity.current === owner) setAiBusy(false); }
  }
  function applySelection() {
    if (stale || !analysis?.selection) return;
    const text = analysis.value.sonuc;
    if (!text || typeof text !== "string") return;
    const target = analysis.selection;
    studio.edit(previous => ({ ...previous, scenes: previous.scenes.map(scene => scene.id !== target.sceneId ? scene : target.type === "action" ? { ...scene, action: text } : { ...scene, dialogue: scene.dialogue.map(line => line.id === target.lineId ? { ...line, text } : line) }) }));
    setNotice({ tone: "success", text: "Öneri seçili metne uygulandı. Önceki metin bu analizde korunuyor." });
  }
  function appendScenes() {
    if (stale || !Array.isArray(analysis?.value.scenes)) return;
    const scenes = normalizeScenario({ scenes: analysis.value.scenes }).scenes.map(scene => ({ ...scene, id: createId("scene"), dialogue: scene.dialogue.map(line => ({ ...line, id: createId("dialogue") })) }));
    studio.edit(previous => ({ ...previous, scenes: [...previous.scenes, ...scenes] }));
    setNotice({ tone: "success", text: `${scenes.length} düzenlenebilir sahne esere eklendi.` });
  }
  async function loadArchive(kind, scenarioId = state.current.row?.id) {
    const owner = accountKey;
    const request = ++archiveRequest.current;
    const active = () => identity.current === owner && request === archiveRequest.current;
    setArchive(kind); setArchiveBusy(true); setArchiveRows([]); setNotice(null);
    try {
      if (kind === "recovery") { setArchiveRows(readRecoveryDrafts(getDraftStorage(), user?.id)); return; }
      if (!user || !configured) throw new Error("Bulut arşivi için giriş yapın.");
      const client = getSupabaseClient();
      if (kind === "versions" && !scenarioId) throw new Error("Sürüm geçmişi için önce eserinizi kaydedin.");
      let query = kind === "versions" ? client.from("senaryo_versiyonlar").select("*").eq("senaryo_id", scenarioId).order("versiyon", { ascending: false }) : client.from("senaryolar").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      const { data, error } = await query.limit(50);
      if (error) throw new Error("Arşiv yüklenemedi. Yeniden deneyin.");
      if (active()) setArchiveRows(kind === "versions" ? data.map(normalizeVersion) : data);
    } catch (error) { if (active()) { reportError(error); setArchiveRows([]); } }
    finally { if (active()) setArchiveBusy(false); }
  }
  async function snapshot() {
    await perform("version", async isCurrent => { const saved = await studio.retry(); if (!isCurrent()) return; if (!saved) throw new Error("Sürüm oluşturmak için eserinizi buluta kaydedin."); await studioRpc("create_scenario_version", { p_scenario_id: saved.id, p_label: versionLabel.trim() || "Yazar sürümü" }); if (!isCurrent()) return; setVersionLabel(""); await loadArchive("versions", saved.id); });
  }
  async function restoreVersion(version) {
    await perform("restore", async isCurrent => {
      const saved = await studio.retry();
      if (!isCurrent() || !saved) return;
      const restored = await studioRpc("restore_scenario_version", { p_version_id: version.id, p_expected_revision: saved.revision });
      if (!isCurrent()) return;
      studio.replace(normalizeScenario(restored), restored, true); setArchive(null); setNotice({ tone: "success", text: "Sürüm geri yüklendi. Önceki metin kurtarma arşivinde korunur." });
    });
  }
  async function publish() {
    await perform("visibility", async isCurrent => {
      const saved = await studio.retry(); if (!isCurrent()) return; if (!saved) throw new Error("Yayınlamak için giriş yapın ve eserinizi kaydedin.");
      const updated = await studioRpc("set_scenario_visibility", { p_scenario_id: saved.id, p_public: !saved.paylasim_acik }); if (!isCurrent()) return; studio.setRow(updated);
      setNotice({ tone: "success", text: updated.paylasim_acik ? "Eseriniz toplulukta yayımlandı." : "Eseriniz yayından kaldırıldı; yalnız siz erişebilirsiniz." });
    });
  }
  async function submitChallenge() {
    await perform("challenge", async isCurrent => { const saved = await studio.retry(); if (!isCurrent()) return; if (!saved) throw new Error("Challenge başvurusu için giriş yapın."); await studioRpc("submit_challenge", { p_challenge_id: challenge.id, p_scenario_id: saved.id }); if (isCurrent()) setNotice({ tone: "success", text: "Eseriniz challenge için teslim edildi." }); });
  }
  const cloudAvailable = Boolean(user && configured);
  const writingBlocked = !studio.ready || suspended;
  const aiDisabled = aiBusy || !cloudAvailable || countdown > 0 || (quota === 0 && (!quotaReset || new Date(quotaReset) > new Date()));
  const headerActions = <><Button variant="ghost" size="sm" onClick={() => loadArchive("recovery")}>Kurtarma</Button><Button variant="secondary" size="sm" onClick={() => loadArchive("works")} disabled={!cloudAvailable}>Eserlerim</Button><Button size="sm" onClick={() => openGenerator("new")} disabled={writingBlocked}>+ AI ile başla</Button></>;

  return <AppShell title="Yazar stüdyosu" subtitle="Bir fikirden son sahneye. Hikâyenin kontrolü sizde." actions={headerActions} wide>
    {notice && <Alert tone={notice.tone} onDismiss={() => setNotice(null)}>{notice.text}</Alert>}
    {studio.error && <Alert tone="danger" title={studio.status === "conflict" ? "Sürüm çakışması" : "Bulut kaydı başarısız"}>{studio.error}<div className="cluster" style={{ marginTop: 10 }}>{studio.status === "conflict" ? <><Button size="sm" variant="secondary" onClick={() => perform("fork", async () => { studio.replace(document, null); await studio.retry(); })}>Taslağı yeni eser olarak kaydet</Button><Button size="sm" variant="ghost" onClick={() => loadArchive("works")}>Bulut sürümünü incele</Button></> : <Button size="sm" variant="secondary" onClick={() => perform("save", studio.retry)}>Kaydı yeniden dene</Button>}</div></Alert>}
    {!studio.localAvailable && <Alert tone="danger">Tarayıcı taslağı saklayamıyor. Eserinizi şimdi dışa aktarın veya buluta kaydedin.</Alert>}
    {!user && authHazir && <Alert tone="info">Giriş yapmadan yazabilirsiniz; taslağınız bu tarayıcıda saklanır. Bulut kaydı ve AI için <a href="/giris">giriş yapın</a>. Girişten sonra misafir taslağınızı hesabınıza aktarabilirsiniz.</Alert>}
    {user && <Button size="sm" variant="ghost" disabled={studio.status === "saving"} onClick={() => { const guest = readDraft(getDraftStorage(), null); if (!guest || !hasScenarioContent(guest.document)) return setNotice({ tone: "info", text: "Bu tarayıcıda aktarılacak misafir taslağı yok." }); preserveThen(() => { studio.replace(guest.document, null); setNotice({ tone: "success", text: "Misafir taslağı bu hesaba alındı." }); }, "Misafir taslağını aktar", "Bu tarayıcıdaki misafir taslağını hesabınıza aktarın. Hesabınızdaki mevcut çalışma kurtarma arşivinde korunur."); }}>Misafir taslağını aktar</Button>}
    {challenge && <Alert tone="info" title={challenge.konu}>Challenge brief: {challenge.aciklama}<div className="cluster" style={{ marginTop: 10 }}><Button size="sm" disabled={!cloudAvailable || !!operation} onClick={submitChallenge}>Bu eseri teslim et</Button><span className="small muted">Teslim tarihi: {dateLabel(challenge.deadline)}</span></div></Alert>}
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}><span className={styles.status} role="status"><span className={styles.statusDot} />{STATUS[studio.status]}{studio.lastSaved && studio.status === "saved" ? ` · ${dateLabel(studio.lastSaved)}` : ""}</span>{row && <Badge tone={row.paylasim_acik ? "success" : "neutral"}>{row.paylasim_acik ? "Yayında" : "Özel"}</Badge>}</div>
      <div className={styles.toolbarGroup}><Button size="sm" variant="ghost" disabled={studio.status === "saving" || writingBlocked} onClick={() => preserveThen(() => { studio.replace(createBlankScenario({ tip: document.metadata.tip, tur: document.metadata.tur })); router.replace("/uret", undefined, { shallow: true }); }, "Yeni eser", "Mevcut çalışmanız hesabınıza özel kurtarma arşivine alınacak.")}>Yeni eser</Button><Button size="sm" variant="secondary" disabled={!cloudAvailable || !!operation || writingBlocked || !hasScenarioContent(document)} loading={operation === "save"} onClick={() => perform("save", studio.retry)}>Kaydet</Button><Button size="sm" variant={row?.paylasim_acik ? "secondary" : "primary"} disabled={!cloudAvailable || !!operation || writingBlocked || !hasScenarioContent(document)} loading={operation === "visibility"} onClick={publish}>{row?.paylasim_acik ? "Yayından kaldır" : "Yayınla"}</Button></div>
    </div>
    {writingBlocked ? <Card><div className="cluster"><Spinner /><span>Eseriniz hazırlanıyor…</span></div></Card> : <div className={styles.workspace}>
      <div className={styles.main}>
        <div className={styles.toolbar}><Tabs items={[{ id: "script", label: "Senaryo" }, { id: "story", label: "Hikâye & karakterler" }]} value={tab} onChange={setTab} label="Eser bölümleri" /><div className={styles.count}><span>{document.scenes.length} sahne</span><span>{scenarioWordCount(document)} kelime</span></div></div>
        {tab === "script" ? <div id="panel-script" role="region" aria-label="Senaryo editörü" className={styles.paper}>
          <div className={styles.cover}><p className={styles.eyebrow}>SENARYO STUDIO · {document.metadata.tip.toLocaleUpperCase("tr")}</p><label className={styles.paperLabel} htmlFor="scenario-title">Eser başlığı</label><input id="scenario-title" className={styles.title} value={document.title} onChange={event => update("title", event.target.value)} maxLength={300} placeholder="Hikâyenin adı…" /><label className={styles.paperLabel} htmlFor="scenario-tagline">Tagline</label><textarea id="scenario-tagline" className={styles.tagline} value={document.tagline} onChange={event => update("tagline", event.target.value)} maxLength={1000} placeholder="Her hikâye tek bir kıvılcımla başlar." rows={2} /></div>
          {document.scenes.map((scene, index) => <SceneEditor key={scene.id} scene={scene} index={index} characters={document.characters} onChange={editScene} onMove={direction => moveScene(index, direction)} onlyScene={document.scenes.length === 1} onRemove={() => preserveThen(() => studio.edit(previous => ({ ...previous, scenes: previous.scenes.filter(item => item.id !== scene.id) })), "Sahneyi sil", "Bu sahne ve diyalogları eserden kaldırılacak. Önceki sürümü kaydetmek için sürüm geçmişini kullanabilirsiniz.")} onRemoveDialogue={id => preserveThen(() => editScene({ ...scene, dialogue: scene.dialogue.filter(line => line.id !== id) }), "Diyaloğu sil", "Seçili diyalog eserden kaldırılacak.")} onAssist={assist} />)}
          <div className={styles.addScene}><Button variant="secondary" onClick={() => update("scenes", [...document.scenes, { id: createId("scene"), heading: "İÇ. MEKÂN - GÜNDÜZ", action: "", dialogue: [] }])}>+ Yeni sahne</Button></div>
        </div> : <Card className="stack" id="panel-story" role="region" aria-label="Hikâye ve karakterler">
          <Field label="Eser başlığı"><Input value={document.title} maxLength={300} onChange={event => update("title", event.target.value)} /></Field><div className="grid grid-2"><Field label="Format"><Select value={document.metadata.tip} onChange={event => editMetadata("tip", event.target.value)}><option>Film</option><option>Dizi</option></Select></Field><Field label="Tür"><Select value={document.metadata.tur} onChange={event => editMetadata("tur", event.target.value)}>{GENRES.map(genre => <option key={genre}>{genre}</option>)}</Select></Field></div>
          <Field label="Hikâye özeti"><Textarea value={document.synopsis} onChange={event => update("synopsis", event.target.value)} rows={8} placeholder="Kahraman kim? Ne istiyor? Onu ne engelliyor?" /></Field><Field label="Dramatik soru"><Textarea value={document.dramaticQuestion} onChange={event => update("dramaticQuestion", event.target.value)} rows={2} /></Field><fieldset style={{ border: "1px solid var(--border)", padding: 14, borderRadius: 8 }}><legend className="small">Topluluktan hangi alanlarda geri bildirim istiyorsunuz?</legend><div className="cluster">{Object.entries(FEEDBACK_TYPES).map(([value, label]) => <label className="small cluster" key={value}><input type="checkbox" checked={(document.metadata.feedbackPreferences || []).includes(value)} onChange={event => editMetadata("feedbackPreferences", event.target.checked ? [...(document.metadata.feedbackPreferences || []), value] : (document.metadata.feedbackPreferences || []).filter(item => item !== value))} />{label}</label>)}</div></fieldset>
          <div className="cluster" style={{ justifyContent: "space-between" }}><h3>Karakterler</h3><Button size="sm" variant="secondary" onClick={() => update("characters", [...document.characters, { id: createId("character"), name: "", description: "" }])}>+ Karakter</Button></div>
          {document.characters.length === 0 && <p className="muted small">Motivasyonları, korkuları ve çatışmalarıyla karakterlerinizi tanımlayın.</p>}
          {document.characters.map(character => <div className={`${styles.characterCard} stack`} key={character.id}><Field label="Karakter adı"><Input value={character.name} maxLength={150} onChange={event => update("characters", document.characters.map(item => item.id === character.id ? { ...item, name: event.target.value } : item))} /></Field><Field label="Motivasyon, geçmiş ve çatışma"><Textarea value={character.description} onChange={event => update("characters", document.characters.map(item => item.id === character.id ? { ...item, description: event.target.value } : item))} rows={4} /></Field><Button size="sm" variant="ghost" onClick={() => preserveThen(() => update("characters", document.characters.filter(item => item.id !== character.id)), "Karakteri sil", "Karakter notları kaldırılacak; sahnelerdeki mevcut diyaloglar korunacak.")}>Karakteri sil</Button></div>)}
        </Card>}
      </div>
      <aside className={`${styles.inspector} stack`} aria-label="Yazarlık araçları">
        <Card><div className="cluster" style={{ justifyContent: "space-between" }}><h3 style={{ margin: 0 }}>Sahne akışı</h3><Badge>{document.scenes.length}</Badge></div><ol className={styles.outline}>{document.scenes.map((scene, index) => <li key={scene.id}><a href={`#scene-${scene.id}`} onClick={() => setTab("script")}><span>{String(index + 1).padStart(2, "0")}</span>{scene.heading || "Başlıksız sahne"}</a></li>)}</ol></Card>
        <Card className="stack"><h3 style={{ margin: 0 }}>Metin kontrolü</h3><p className="small muted">Karakter adları ve eksik bölümler için metne dayalı yazım kontrolleri.</p>{consistencyIssues.length ? <ul className="stack small" style={{ paddingLeft: 18, margin: 0 }}>{consistencyIssues.slice(0, 8).map(issue => <li key={issue.key}>{issue.sceneId ? <a href={`#scene-${issue.sceneId}`} onClick={() => setTab("script")}>{issue.text}</a> : issue.text}</li>)}</ul> : <p className="small muted">Karakter adları ve temel bölümler tutarlı görünüyor.</p>}{consistencyIssues.length > 8 && <p className="small muted">{consistencyIssues.length - 8} ek kontrol var. Önce bu bölümleri tamamlayın.</p>}</Card><Card id="studio-tools" className="stack"><div className="cluster" style={{ justifyContent: "space-between" }}><h3 style={{ margin: 0 }}>Yazı ortağı</h3><Badge tone="accent">AI</Badge></div><div className={styles.toolgrid}>{TOOLS.map(item => <Button key={item.id} size="sm" variant={toolId === item.id ? "primary" : "ghost"} onClick={() => setToolId(item.id)}>{item.label}</Button>)}</div><p className={styles.notice}>{tool.description}</p>{!toolContextReady && <p className="small muted">Analiz için hikâye özeti, karakter notları veya bir sahne yazın.</p>}{toolId === "diyalog" && <Field label={selection?.type === "action" ? "Seçili aksiyon" : "Düzenlenecek metin"}><Textarea value={selectionText} onChange={event => setSelectionText(event.target.value)} rows={5} maxLength={6000} placeholder="Bir sahnedeki ‘AI ile düzenle’ eylemini kullanın veya metin yazın." /></Field>}{toolId === "scenes" && <><Field label="Yeni sahneler için yönlendirme"><Textarea value={sceneBrief} maxLength={2000} rows={3} onChange={event => setSceneBrief(event.target.value)} placeholder="Örneğin: İki kardeşin yüzleşmesini iki kısa sahnede yaz." /></Field><Field label="Sahne sayısı"><Select value={sceneCount} onChange={event => setSceneCount(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map(count => <option key={count} value={count}>{count} kısa sahne</option>)}</Select></Field></>}<Button loading={aiBusy} disabled={aiDisabled || !toolContextReady || !hasScenarioContent(document) || (toolId === "diyalog" && !selectionText.trim())} onClick={runTool}>{countdown ? `${countdown} sn sonra yeniden deneyin` : aiBusy ? "İnceleniyor…" : "Önerileri getir"}</Button>{quota != null && <p className="small muted">Kalan AI hakkı: {quota}{quota === 0 ? quotaReset ? ` · Yenilenme: ${dateLabel(quotaReset)}` : " · Günlük kota doldu." : ""}</p>}{analysis && <><div className={styles.source}><span>{analysis.sourceTitle} · {analysis.sourceRevision ? `rev. ${analysis.sourceRevision}` : "yerel taslak"}</span><Badge tone={stale ? "warning" : "success"}>{stale ? "Metin değişti" : "Güncel"}</Badge></div>{stale && <p className={styles.notice}>Bu öneri önceki metne ait. Güncel metin için yeniden analiz edin.</p>}{toolId === "diyalog" && analysis.selection && <details className="small muted"><summary>Önceki metni göster</summary><p className={styles.resultText}>{analysis.selection.text}</p></details>}<AnalysisResult value={analysis.value} />{toolId === "diyalog" && analysis.selection && <Button size="sm" variant="secondary" disabled={stale || !analysis.value.sonuc} onClick={applySelection}>Öneriyi seçili metne uygula</Button>}{toolId === "scenes" && Array.isArray(analysis.value.scenes) && <Button size="sm" variant="secondary" disabled={stale} onClick={appendScenes}>Sahneleri esere ekle</Button>}</>}</Card>
        <Card className="stack"><h3 style={{ margin: 0 }}>Sürümler & teslim</h3><div className="cluster"><Button size="sm" variant="secondary" disabled={!row || !!operation} onClick={() => loadArchive("versions")}>Sürüm geçmişi</Button><Button size="sm" variant="ghost" disabled={!cloudAvailable || !!operation} onClick={snapshot}>Sürüm oluştur</Button></div><Field label="Dışa aktar"><Select aria-label="Dışa aktarma biçimi" defaultValue="" onChange={event => { const format = event.target.value; if (format) perform("export", () => downloadScenario(document, format)); event.target.value = ""; }}><option value="" disabled>Biçim seçin…</option><option value="pdf">PDF · Türkçe karakter desteği</option><option value="fdx">Final Draft (.fdx)</option><option value="fountain">Fountain (.fountain)</option><option value="txt">Düz metin (.txt)</option></Select></Field><Button size="sm" variant="ghost" disabled={aiDisabled || !hasScenarioContent(document)} onClick={() => openGenerator("revise")}>Eser için revizyon önerisi</Button>{row && <a className="small" href={`/senaryo/${row.id}`}>Okuma görünümünü aç →</a>}</Card>
      </aside>
    </div>}
    <Dialog open={generateOpen} onClose={() => !aiBusy && setGenerateOpen(false)} title={generationMode === "revise" ? "Revizyon önerisi" : "Yeni bir hikâyenin başlangıcı"} description="AI sonucu önce önizlenir. Kabul edene kadar mevcut eseriniz korunur." actions={<><Button variant="secondary" disabled={aiBusy} onClick={() => setGenerateOpen(false)}>Vazgeç</Button><Button loading={aiBusy} disabled={aiDisabled} onClick={generate}>{aiBusy ? "Hazırlanıyor…" : "Öneri üret"}</Button></>}><div className="stack"><div className="grid grid-2"><Field label="Format"><Select value={generation.tip} onChange={event => setGeneration({ ...generation, tip: event.target.value })}><option>Film</option><option>Dizi</option></Select></Field><Field label="Tür"><Select value={generation.tur} onChange={event => setGeneration({ ...generation, tur: event.target.value })}>{GENRES.map(genre => <option key={genre}>{genre}</option>)}</Select></Field></div><Field label={generationMode === "revise" ? "Neyi geliştirelim?" : "Fikir, dünya veya özel istek"}><Textarea value={generation.prompt} maxLength={generationMode === "revise" ? 1500 : 2000} onChange={event => setGeneration({ ...generation, prompt: event.target.value })} rows={5} placeholder="Örneğin: İstanbul’da geçen, iki kardeşin farklı hatırladığı bir gece…" /></Field><div className="grid grid-2"><Field label="Hedef sahne sayısı"><Input type="number" min={1} max={200} value={generation.scenes} onChange={event => setGeneration({ ...generation, scenes: event.target.value })} /></Field><Field label="Karakter sayısı"><Input type="number" min={1} max={20} value={generation.characters} onChange={event => setGeneration({ ...generation, characters: event.target.value })} /></Field></div><p className="muted small">Bu işlem bir hikâye ve açılış önerisi hazırlar. Sahne sayısı için plan hedefi belirtilir; tamamlanmış uzun senaryo iddiası taşımaz.</p>{!cloudAvailable && <Alert tone="info">AI için hesabınıza giriş yapın.</Alert>}</div></Dialog>
    <Dialog open={Boolean(candidate)} onClose={() => setCandidate(null)} title="Öneriyi inceleyin" description="Metni kabul etmeden önce kontrol edin." actions={<><Button variant="secondary" onClick={() => setCandidate(null)}>Mevcut eserle devam et</Button><Button disabled={studio.status === "saving" || (candidate?.mode === "revise" && candidate.sourceFingerprint !== scenarioSourceFingerprint(document))} onClick={() => { try { studio.replace(candidate.document, candidate.mode === "revise" ? row : null); setCandidate(null); router.replace("/uret", undefined, { shallow: true }); setNotice({ tone: "success", text: "Öneri editöre alındı. Önceki eser kurtarma arşivinde korunur." }); } catch (error) { reportError(error); } }}>Öneriyi editöre al</Button></>}><div className={styles.preview}>{candidate && <><h3>{candidate.document.title}</h3><AnalysisResult value={{ "Hikâye": candidate.document.synopsis, "Karakterler": candidate.document.characters, "Açılış": candidate.document.scenes }} /></>}</div></Dialog>
    <Dialog open={Boolean(confirmAction)} onClose={() => setConfirmAction(null)} title={confirmAction?.title} description={confirmAction?.text} actions={<><Button variant="secondary" onClick={() => setConfirmAction(null)}>Vazgeç</Button><Button onClick={() => { const action = confirmAction?.action; setConfirmAction(null); try { action?.(); } catch (error) { reportError(error); } }}>Devam et</Button></>} />
    <Dialog open={Boolean(archive)} onClose={() => setArchive(null)} title={archive === "versions" ? "Sürüm geçmişi" : archive === "recovery" ? "Kurtarma arşivi" : "Eserlerim"} description={archive === "recovery" ? "Bu hesap için bu tarayıcıda tutulan son 20 çalışma kopyası." : "Son 50 kayıt gösterilir. Her değişiklik güvenli revizyon kontrolüyle kaydedilir."}>{archive === "versions" && <div className="cluster"><Input aria-label="Sürüm etiketi" placeholder="Sürüm etiketi (ör. İkinci perde revizyonu)" value={versionLabel} onChange={event => setVersionLabel(event.target.value)} maxLength={200} /><Button size="sm" onClick={snapshot} disabled={!!operation}>Sürüm oluştur</Button></div>}{archiveBusy ? <Spinner /> : archiveRows.length === 0 ? <EmptyState title="Henüz kayıt yok" description="Yazmaya devam edin; kayıtlarınız burada görünür." /> : archiveRows.map((item, index) => <div className={styles.archiveRow} key={item.id || index}><div><p className={styles.archiveTitle}>{archive === "versions" ? item.label : normalizeScenario(item).title || "Başlıksız eser"}</p><p className="small muted">{dateLabel(item.created_at || item.updatedAt || item.updated_at)}{item.revision ? ` · rev. ${item.revision}` : ""}</p></div><Button variant="secondary" size="sm" disabled={!!operation || studio.status === "saving"} onClick={() => preserveThen(() => { if (archive === "versions") return restoreVersion(item); try { studio.replace(normalizeScenario(item), archive === "works" ? item : null, archive === "works"); if (archive === "recovery") setNotice({ tone: "success", text: "Kurtarma kopyası yeni ve özel bir eser olarak açıldı." }); setArchive(null); router.replace("/uret", undefined, { shallow: true }); } catch (error) { reportError(error); } }, archive === "versions" ? "Sürümü geri yükle" : "Eseri aç", "Mevcut çalışma kurtarma arşivine alınacak. Kaydedilmemiş metninizi koruyoruz.")}>{archive === "versions" ? "Geri yükle" : "Aç"}</Button></div>)}</Dialog>
  </AppShell>;
}
