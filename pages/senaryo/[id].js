import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import AppShell from "../../components/AppShell";
import { Alert, Badge, Button, Card, Dialog, EmptyState, Field, Input, Select, Spinner, Textarea } from "../../components/ui";
import styles from "../../components/studio/Studio.module.css";
import { useAuth } from "../../lib/useAuth";
import { getSupabaseClient } from "../../lib/supabase";
import { compareScenarioDocuments, normalizeScenario, normalizeVersion, scenarioText, scenarioWordCount } from "../../lib/scenario";
import { studioRpc } from "../../lib/scenario-client";
import { downloadScenario } from "../../lib/exports";
import { getDraftStorage, readDraft, removeDraft } from "../../lib/drafts";

const FEEDBACK = { general: "Genel", pace: "Tempo", dialogue: "Diyalog", character: "Karakter", structure: "Yapı", continuity: "Tutarlılık" };
const PROFILE_COLUMNS = "id,username,nickname,avatar_url";
function date(value) { return value ? new Date(value).toLocaleString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : ""; }

export default function ScenarioDetail() {
  const router = useRouter();
  const { user, authHazir, configured } = useAuth();
  const userId = user?.id;
  const id = /^\d+$/.test(String(router.query.id || "")) ? String(router.query.id) : null;
  const contextKey = `${id}:${user?.id || "guest"}`;
  const identity = useRef(contextKey); identity.current = contextKey;
  const [loadedKey, setLoadedKey] = useState(null);
  const [row, setRow] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState(null);
  const [operation, setOperation] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentError, setCommentError] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [feedbackType, setFeedbackType] = useState("general");
  const [sceneId, setSceneId] = useState("");
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sourceChallenge, setSourceChallenge] = useState(null);
  const owner = Boolean(user && row?.user_id === user.id);
  const document = normalizeScenario(row || {});
  const available = Boolean(configured && id && authHazir);

  const loadComments = useCallback(async (after = null) => {
    const requestKey = contextKey;
    setCommentsLoading(true); setCommentError("");
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error("Topluluk bağlantısı yapılandırılmadı.");
      let query = client.from("yorumlar").select("id,user_id,senaryo_id,metin,scene_id,feedback_type,created_at").eq("senaryo_id", id).order("id", { ascending: true }).limit(30);
      if (after) query = query.gt("id", after);
      const { data, error } = await query;
      if (error) throw new Error("Geri bildirimler yüklenemedi. Yeniden deneyin.");
      const ids = [...new Set(data.map(comment => comment.user_id))];
      const profiles = ids.length ? await client.from("profiles").select(PROFILE_COLUMNS).in("id", ids) : { data: [] };
      if (identity.current !== requestKey) return;
      const authors = new Map((profiles.data || []).map(profile => [profile.id, profile]));
      const mapped = data.map(comment => ({ ...comment, author: authors.get(comment.user_id) }));
      setComments(previous => after ? [...previous, ...mapped.filter(comment => !previous.some(item => item.id === comment.id))] : mapped);
      setHasMore(data.length === 30);
    } catch (error) { if (identity.current === requestKey) setCommentError(error.message); }
    finally { if (identity.current === requestKey) setCommentsLoading(false); }
  }, [contextKey, id]);

  const load = useCallback(async () => {
    if (!available) return;
    const requestKey = contextKey;
    setLoadedKey(null); setLoadError(""); setNotice(null); setRow(null); setAuthor(null); setComments([]); setLiked(false); setBookmarked(false); setCommentText(""); setVersionsOpen(false); setSelectedVersion(null); setReportOpen(false); setDeleteOpen(false); setOperation(null); setSourceChallenge(null);
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.from("senaryolar").select("*").eq("id", id).maybeSingle();
      if (identity.current !== requestKey) return;
      if (error) throw new Error("Eser yüklenemedi. Bağlantınızı kontrol edip yeniden deneyin.");
      if (!data) throw new Error("Eser bulunamadı, yayından kaldırılmış veya erişiminiz yok.");
      setRow(data);
      const tasks = [client.from("profiles").select(PROFILE_COLUMNS).eq("id", data.user_id).maybeSingle(),
        userId ? client.from("begeniler").select("id").eq("user_id", userId).eq("senaryo_id", id).maybeSingle() : Promise.resolve({ data: null }),
        userId ? client.from("kaydedilenler").select("id").eq("user_id", userId).eq("senaryo_id", id).maybeSingle() : Promise.resolve({ data: null })];
      const results = await Promise.all(tasks);
      if (identity.current !== requestKey) return;
      setAuthor(results[0].data || null); setLiked(Boolean(results[1].data)); setBookmarked(Boolean(results[2].data));
      if (results[1].error || results[2].error) setNotice({ tone: "warning", text: "Beğeni veya kaydetme durumunuz doğrulanamadı. İşlem yapmadan önce sayfayı yenileyin." });
      const participation = await client.from("challenge_katilimlar").select("challenge_id,status,score,feedback").eq("senaryo_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (identity.current !== requestKey) return;
      const challengeId = participation.data?.challenge_id || data.document?.metadata?.challengeId;
      if (challengeId && /^\d+$/.test(String(challengeId))) {
        const challengeResult = await client.from("challengelar").select("id,konu,deadline").eq("id", challengeId).maybeSingle();
        if (identity.current === requestKey) setSourceChallenge(challengeResult.data ? { ...challengeResult.data, entry: participation.data || null } : null);
      }
      if (identity.current !== requestKey) return;
      setLoadedKey(requestKey); loadComments();
    } catch (error) { if (identity.current === requestKey) { setLoadError(error.message); setLoadedKey(requestKey); } }
  }, [available, contextKey, id, userId, loadComments]);

  useEffect(() => { load(); }, [load]);

  async function perform(name, action) {
    if (operation) return;
    const requestKey = contextKey;
    setOperation(name); setNotice(null);
    try { await action(requestKey); }
    catch (error) { if (identity.current === requestKey) setNotice({ tone: "danger", text: error.message || "İşlem tamamlanamadı. Yeniden deneyin." }); }
    finally { if (identity.current === requestKey) setOperation(null); }
  }
  function requireUser() { if (!user) throw new Error("Bu işlem için giriş yapın."); }
  function toggleLike() { perform("like", async key => { requireUser(); const result = await studioRpc("toggle_scenario_like", { p_scenario_id: Number(id) }); if (identity.current === key) { setLiked(result.liked); setRow(previous => ({ ...previous, begeni_sayisi: result.count })); } }); }
  function toggleBookmark() { perform("bookmark", async key => { requireUser(); const result = await studioRpc("toggle_scenario_bookmark", { p_scenario_id: Number(id) }); if (identity.current === key) setBookmarked(result.saved); }); }
  function changeVisibility() { perform("visibility", async key => { const result = await studioRpc("set_scenario_visibility", { p_scenario_id: Number(id), p_public: !row.paylasim_acik }); if (identity.current === key) { setRow(result); setNotice({ tone: "success", text: result.paylasim_acik ? "Eser toplulukta yayımlandı." : "Eser yayından kaldırıldı." }); } }); }
  function sendComment(event) {
    event.preventDefault();
    if (!commentText.trim()) return;
    const text = commentText.trim();
    perform("comment", async key => {
      requireUser(); const client = getSupabaseClient();
      const { error } = await client.from("yorumlar").insert({ user_id: user.id, senaryo_id: Number(id), metin: text, scene_id: sceneId || null, feedback_type: feedbackType });
      if (error) throw new Error("Geri bildiriminiz kaydedilemedi. Yazdığınız metin korundu.");
      if (identity.current !== key) return;
      setCommentText(""); setNotice({ tone: "success", text: "Geri bildiriminiz eklendi." }); await loadComments();
    });
  }
  function deleteComment(comment) { perform(`comment-${comment.id}`, async key => { const { error } = await getSupabaseClient().from("yorumlar").delete().eq("id", comment.id).eq("user_id", user.id); if (error) throw new Error("Geri bildirim silinemedi."); if (identity.current === key) setComments(previous => previous.filter(item => item.id !== comment.id)); }); }
  async function loadVersions() {
    const key = contextKey;
    setVersionsOpen(true); setVersionsLoading(true);
    try {
      const { data, error } = await getSupabaseClient().from("senaryo_versiyonlar").select("*").eq("senaryo_id", id).order("versiyon", { ascending: false }).limit(50);
      if (error) throw new Error("Sürüm geçmişi yüklenemedi.");
      if (identity.current === key) setVersions(data.map(normalizeVersion));
    } catch (error) { if (identity.current === key) setNotice({ tone: "danger", text: error.message }); }
    finally { if (identity.current === key) setVersionsLoading(false); }
  }
  function snapshot() { perform("version", async key => { await studioRpc("create_scenario_version", { p_scenario_id: Number(id), p_label: versionLabel || "Yazar sürümü" }); if (identity.current === key) { setVersionLabel(""); await loadVersions(); } }); }
  function restore() { perform("restore", async key => { const restored = await studioRpc("restore_scenario_version", { p_version_id: selectedVersion.id, p_expected_revision: row.revision }); if (identity.current === key) { setRow(restored); setSelectedVersion(null); setNotice({ tone: "success", text: "Sürüm geri yüklendi. Önceki metin otomatik yedek sürümünde korunur." }); await loadVersions(); } }); }
  function report() { perform("report", async key => { requireUser(); const result = await studioRpc("submit_report", { p_scenario_id: Number(id), p_reason: reportReason }); if (identity.current === key) { setReportOpen(false); setReportReason(""); setNotice({ tone: "success", text: result.alreadyReported ? "Bu eser için raporunuz zaten alındı." : "Raporunuz değerlendirmeye alındı." }); } }); }
  function remove() { perform("delete", async key => { await studioRpc("delete_scenario", { p_scenario_id: Number(id) }); if (identity.current === key) { const storage = getDraftStorage(); const draft = readDraft(storage, userId); if (String(draft?.row?.id) === id) removeDraft(storage, userId); router.push("/profil"); } }); }
  const loading = available && loadedKey !== contextKey;
  const feedbackPreferences = Array.isArray(document.metadata.feedbackPreferences) ? document.metadata.feedbackPreferences : [];
  const versionComparison = selectedVersion ? compareScenarioDocuments(document, selectedVersion.document) : null;
  const actions = owner && row && loadedKey === contextKey ? <><Button size="sm" variant="secondary" onClick={loadVersions}>Sürümler</Button><Button size="sm" href={`/uret?id=${row.id}`}>Editörde aç</Button></> : <Button size="sm" variant="secondary" href="/uret">Kendi hikâyeni yaz</Button>;

  return <AppShell title={row && loadedKey === contextKey ? document.title || "Başlıksız eser" : "Senaryo"} subtitle="Hikâyeyi okuyun, yazarın sonraki revizyonuna katkıda bulunun." actions={actions} wide>
    {notice && <Alert tone={notice.tone} onDismiss={() => setNotice(null)}>{notice.text}</Alert>}
    {!configured ? <EmptyState title="Bulut bağlantısı yapılandırılmadı" description="Yerel stüdyoda yazmaya başlayabilirsiniz." action={<Button href="/uret">Stüdyoyu aç</Button>} /> : !authHazir || loading ? <Card><div className="cluster"><Spinner /><span>Eser yükleniyor…</span></div></Card> : !id || loadError ? <EmptyState title="Eser açılamadı" description={loadError || "Geçerli bir senaryo bağlantısı kullanın."} action={<div className="cluster"><Button variant="secondary" onClick={load}>Yeniden dene</Button><Button href="/kesfet">Keşfet</Button></div>} /> : row && loadedKey === contextKey && <div className={styles.workspace}>
      <div className={`${styles.main} stack`}>
        <article className={styles.paper}>
          <header className={styles.cover}><div className="cluster" style={{ marginBottom: 18 }}><Badge>{document.metadata.tip}</Badge><Badge>{document.metadata.tur}</Badge>{owner && <Badge tone={row.paylasim_acik ? "success" : "neutral"}>{row.paylasim_acik ? "Yayında" : "Özel eser"}</Badge>}</div><h2 style={{ font: "36px/1.2 Georgia,serif", color: "#233a2e", margin: "0 0 18px" }}>{document.title || "Başlıksız eser"}</h2>{document.tagline && <p style={{ font: "italic 16px/1.7 Georgia,serif", color: "#637266" }}>{document.tagline}</p>}<p className={styles.paperLabel}>{author?.username ? <a href={`/@${author.username}`}>@{author.username}</a> : "Yazar"} · {date(row.created_at)} · {scenarioWordCount(document)} kelime</p></header>
          {document.synopsis && <section className={styles.scene}><h3 className={styles.eyebrow}>HİKÂYE</h3><p className={styles.readScene}>{document.synopsis}</p></section>}
          {document.characters.length > 0 && <section className={styles.scene}><h3 className={styles.eyebrow}>KARAKTERLER</h3>{document.characters.map(character => <div key={character.id} style={{ marginBottom: 20 }}><h4 className={styles.readHeading}>{character.name}</h4><p className={styles.readScene}>{character.description}</p></div>)}</section>}
          {document.scenes.map((scene, index) => <section key={scene.id} id={`scene-${scene.id}`} className={styles.scene}><p className={styles.sceneNumber}>SAHNE {String(index + 1).padStart(2, "0")}</p><h3 className={styles.readHeading}>{scene.heading}</h3><p className={styles.readScene}>{scene.action}</p>{scene.dialogue.map(line => <div className={`${styles.readScene} ${styles.readDialogue}`} key={line.id}><p className={styles.readCharacter}>{line.character}</p><p>{line.text}</p></div>)}</section>)}
          {document.dramaticQuestion && <section className={styles.scene}><h3 className={styles.eyebrow}>DRAMATİK SORU</h3><p className={styles.readScene}>{document.dramaticQuestion}</p></section>}
        </article>
        <Card className="stack"><h2 style={{ font: "25px Georgia,serif", margin: 0 }}>Geri bildirim</h2>{feedbackPreferences.length > 0 && <p className="muted small">Yazar özellikle şu alanlarda görüş istiyor: {feedbackPreferences.map(value => FEEDBACK[value] || value).join(", ")}</p>}{user ? <form onSubmit={sendComment} className="stack"><div className="grid grid-2"><Field label="Geri bildirim alanı"><Select value={feedbackType} onChange={event => setFeedbackType(event.target.value)}>{Object.entries(FEEDBACK).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field><Field label="İlgili sahne"><Select value={sceneId} onChange={event => setSceneId(event.target.value)}><option value="">Eserin bütünü</option>{document.scenes.map((scene, index) => <option key={scene.id} value={scene.id}>{index + 1}. {scene.heading}</option>)}</Select></Field></div><Field label="Görüşünüz" hint="Somut örneklerle, saygılı ve uygulanabilir öneriler yazın."><Textarea value={commentText} onChange={event => setCommentText(event.target.value)} rows={4} maxLength={10000} placeholder="Hangi sahne güçlüydü? Nerede tempo veya motivasyon geliştirilebilir?" /></Field><div className="cluster"><Button type="submit" size="sm" loading={operation === "comment"} disabled={!commentText.trim() || !!operation}>Geri bildirim gönder</Button><span className="small muted">{commentText.length}/10000</span></div></form> : <p className="muted">Geri bildirim paylaşmak için <a href="/giris">giriş yapın</a>.</p>}{commentError && <Alert tone="danger">{commentError}<Button size="sm" variant="ghost" onClick={() => loadComments()}>Yeniden dene</Button></Alert>}{commentsLoading && comments.length === 0 ? <Spinner /> : comments.length === 0 && !commentError ? <p className="small muted">İlk yapıcı geri bildirimi siz paylaşın.</p> : comments.map(comment => <article className={styles.comment} key={comment.id}><div className={styles.commentHead}><div className="cluster">{comment.author?.username ? <a href={`/@${comment.author.username}`} className="small">@{comment.author.username}</a> : <span className="small">Yazar</span>}<Badge>{FEEDBACK[comment.feedback_type] || "Genel"}</Badge><span className="small muted">{date(comment.created_at)}</span></div>{comment.user_id === user?.id && <Button size="sm" variant="ghost" disabled={!!operation} onClick={() => deleteComment(comment)}>Sil</Button>}</div>{comment.scene_id && <a className="small muted" href={`#scene-${comment.scene_id}`}>İlgili sahneye git →</a>}<p className={styles.commentBody}>{comment.metin}</p></article>)}{hasMore && <Button variant="secondary" size="sm" loading={commentsLoading} onClick={() => loadComments(comments.at(-1)?.id)}>Daha fazla geri bildirim</Button>}</Card>
      </div>
      <aside className={`${styles.inspector} stack`}>
        <Card className="stack"><p className="section-label">OKUMA NOTLARI</p><div className="cluster"><Button size="sm" variant={liked ? "primary" : "secondary"} disabled={!!operation || !user} loading={operation === "like"} onClick={toggleLike}>{liked ? "Beğenildi" : "Beğen"} · {row.begeni_sayisi || 0}</Button><Button size="sm" variant={bookmarked ? "primary" : "secondary"} disabled={!!operation || !user} onClick={toggleBookmark}>{bookmarked ? "Okuma listesinde" : "Okuma listesine al"}</Button></div><ol className={styles.outline}>{document.scenes.map((scene, index) => <li key={scene.id}><a href={`#scene-${scene.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{scene.heading}</a></li>)}</ol><Field label="Dışa aktar"><Select defaultValue="" onChange={event => { if (event.target.value) perform("export", () => downloadScenario(document, event.target.value)); event.target.value = ""; }}><option value="" disabled>Biçim seçin…</option><option value="pdf">PDF</option><option value="fdx">Final Draft</option><option value="fountain">Fountain</option><option value="txt">Düz metin</option></Select></Field></Card>
        {sourceChallenge && <Card className="stack"><Badge tone="accent">{sourceChallenge.entry ? "Challenge başvurusu" : "Challenge brief"}</Badge><h3>{sourceChallenge.konu}</h3>{sourceChallenge.entry && <p className="small muted">{sourceChallenge.entry.status === "reviewed" ? "Değerlendirildi" : "Teslim edildi"}{sourceChallenge.entry.score != null ? ` · ${sourceChallenge.entry.score}/100` : ""}</p>}{sourceChallenge.entry?.feedback && <p className="small">{sourceChallenge.entry.feedback}</p>}<p className="small muted">Teslim tarihi: {date(sourceChallenge.deadline)}</p><Button size="sm" variant="ghost" href="/topluluk">Challenge’ları incele</Button></Card>}
        {owner ? <Card className="stack"><h3 style={{ margin: 0 }}>Eser yönetimi</h3><p className="small muted">Revizyon {row.revision} · {date(row.updated_at)}</p><Button size="sm" variant="secondary" disabled={!!operation} onClick={changeVisibility}>{row.paylasim_acik ? "Yayından kaldır" : "Toplulukta yayınla"}</Button><Button size="sm" variant="secondary" onClick={loadVersions}>Sürüm geçmişi</Button><Button size="sm" variant="danger" disabled={!!operation} onClick={() => setDeleteOpen(true)}>Eseri sil</Button></Card> : user && row.paylasim_acik ? <Button size="sm" variant="ghost" onClick={() => setReportOpen(true)}>İçeriği raporla</Button> : null}
      </aside>
    </div>}
    <Dialog open={versionsOpen} onClose={() => setVersionsOpen(false)} title="Sürüm geçmişi" description="Sürüm geri yüklerken mevcut metin otomatik olarak yedeklenir."><div className="cluster"><Input aria-label="Sürüm etiketi" value={versionLabel} maxLength={200} onChange={event => setVersionLabel(event.target.value)} placeholder="Örneğin: İlk okuma sonrası" /><Button size="sm" disabled={!!operation} onClick={snapshot}>Sürüm oluştur</Button></div>{versionsLoading ? <Spinner /> : versions.length === 0 ? <EmptyState title="Henüz sürüm yok" description="Önemli revizyonlardan önce bir sürüm oluşturun." /> : versions.map(version => <div className={styles.archiveRow} key={version.id}><div><p className={styles.archiveTitle}>{version.label}</p><p className="small muted">{date(version.created_at)} · {scenarioWordCount(version.document)} kelime</p></div><Button size="sm" variant="secondary" onClick={() => { setVersionsOpen(false); setSelectedVersion(version); }}>İncele</Button></div>)}</Dialog>
    <Dialog open={Boolean(selectedVersion)} onClose={() => setSelectedVersion(null)} title={selectedVersion?.label || "Sürüm"} description="Geri yükleme mevcut metni yedekler; başka bir oturumda değişiklik varsa işlem durdurulur." actions={<><Button variant="secondary" onClick={() => { setSelectedVersion(null); setVersionsOpen(true); }}>Vazgeç</Button><Button loading={operation === "restore"} disabled={!!operation} onClick={restore}>Bu sürümü geri yükle</Button></>}><div className="grid grid-2"><div><p className="section-label">MEVCUT</p><p className="small">{document.title} · {scenarioWordCount(document)} kelime · {document.scenes.length} sahne</p></div><div><p className="section-label">SEÇİLİ SÜRÜM</p><p className="small">{selectedVersion?.document.title} · {selectedVersion ? scenarioWordCount(selectedVersion.document) : 0} kelime · {selectedVersion?.document.scenes.length} sahne</p></div></div>{versionComparison && <Card className="stack"><p className="section-label">GERİ YÜKLEMEYLE DEĞİŞECEKLER</p><p className="small">{versionComparison.changedFields.length ? versionComparison.changedFields.join(", ") : "Ana hikâye alanları aynı"}{versionComparison.metadataChanged ? " · Eser ayarları değişecek" : ""}</p><p className="small">Sahneler: {versionComparison.scenes.added.length} eklenecek, {versionComparison.scenes.removed.length} kaldırılacak, {versionComparison.scenes.changed.length} değişecek{versionComparison.scenes.orderChanged ? "; sahne sırası değişecek" : ""}.</p><p className="small">Karakterler: {versionComparison.characters.added.length} eklenecek, {versionComparison.characters.removed.length} kaldırılacak, {versionComparison.characters.changed.length} değişecek.</p></Card>}<div className={styles.preview}>{selectedVersion && scenarioText(selectedVersion.document)}</div></Dialog>
    <Dialog open={reportOpen} onClose={() => !operation && setReportOpen(false)} title="İçeriği raporla" description="Rapor yalnız yetkili moderasyon akışında değerlendirilir." actions={<><Button variant="secondary" onClick={() => setReportOpen(false)}>Vazgeç</Button><Button disabled={reportReason.trim().length < 3 || !!operation} loading={operation === "report"} onClick={report}>Raporu gönder</Button></>}><Field label="Rapor nedeni"><Textarea value={reportReason} onChange={event => setReportReason(event.target.value)} rows={4} maxLength={2000} placeholder="İhlali somut olarak açıklayın." /></Field></Dialog>
    <Dialog open={deleteOpen} onClose={() => !operation && setDeleteOpen(false)} title="Eseri kalıcı olarak sil" description="Senaryo, sürümleri, yorumları ve topluluk ilişkileri birlikte silinecek. Devam etmeden önce dışa aktarma yapabilirsiniz." actions={<><Button variant="secondary" onClick={() => setDeleteOpen(false)}>Vazgeç</Button><Button variant="danger" loading={operation === "delete"} disabled={!!operation} onClick={remove}>Eseri sil</Button></>} />
  </AppShell>;
}
