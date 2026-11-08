import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

const C = {
  forest: "#063B32",
  lime: "#C8F33B",
  ivory: "#F7F4ED",
  dark: "#092820",
  border: "rgba(247,244,237,.16)",
  muted: "rgba(247,244,237,.67)",
};

function downloadText(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
function draftKey(userId, sceneId) {
  return `fabularc:editor:draft:${userId}:${sceneId}`;
}
function sortedScenes(list) {
  return [...list].sort((a,b) => a.sira-b.sira || a.created_at.localeCompare(b.created_at));
}

export default function FabularcEditor() {
  const { user, authHazir } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [activeScene, setActiveScene] = useState(null);
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [format, setFormat] = useState("screenplay");
  const [language, setLanguage] = useState("tr");
  const [busy, setBusy] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Hazır");
  const [conflict, setConflict] = useState(false);
  const savingRef = useRef(false);
  const activeSceneRef = useRef(null);
  const headingRef = useRef("");
  const bodyRef = useRef("");

  useEffect(() => { activeSceneRef.current = activeScene; }, [activeScene]);
  useEffect(() => { headingRef.current = heading; }, [heading]);
  useEffect(() => { bodyRef.current = body; }, [body]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from("yazarlik_projeleri")
        .select("*").eq("user_id", user.id)
        .order("updated_at", { ascending: false }).limit(100);
      if (cancelled) return;
      if (error) setSaveStatus("Proje listesi alınamadı: " + error.message);
      else setProjects(data || []);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  function selectScene(scene) {
    setActiveScene(scene);
    setConflict(false);
    let nextHeading = scene?.baslik || "";
    let nextBody = scene?.icerik || "";
    if (scene && user?.id && typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem(draftKey(user.id, scene.id)) || "null");
        if (stored && stored.versiyon === scene.versiyon &&
            (stored.baslik !== scene.baslik || stored.icerik !== scene.icerik)) {
          if (window.confirm("Bu sahnenin cihazdaki kaydedilmemiş taslağı var. Geri yüklensin mi?")) {
            nextHeading = stored.baslik;
            nextBody = stored.icerik;
          }
        }
      } catch (_) {}
    }
    setHeading(nextHeading);
    setBody(nextBody);
    setSaveStatus(scene ? "Hazır" : "Önce sahne oluştur");
  }

  async function selectProject(project) {
    setBusy(true);
    setActiveProject(project);
    setActiveScene(null);
    setHeading("");
    setBody("");
    try {
      const { data, error } = await supabase.from("yazarlik_sahneleri")
        .select("*").eq("user_id", user.id).eq("proje_id", project.id)
        .order("sira", { ascending: true }).limit(500);
      if (error) throw error;
      const ordered = sortedScenes(data || []);
      setScenes(ordered);
      if (ordered.length > 0) selectScene(ordered[0]);
      else setSaveStatus("İlk sahneyi oluştur");
    } catch (error) {
      setSaveStatus("Sahneler açılamadı: " + error.message);
      setScenes([]);
    } finally {
      setBusy(false);
    }
  }

  async function createProject(e) {
    e.preventDefault();
    if (!user || !newTitle.trim() || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.from("yazarlik_projeleri").insert({
        user_id: user.id, baslik: newTitle.trim().slice(0,200),
        format, dil: language,
      }).select("*").single();
      if (error) throw error;
      setProjects(prev => [data, ...prev]);
      setNewTitle("");
      await selectProject(data);
    } catch (error) {
      setSaveStatus("Proje oluşturulamadı: " + error.message);
    } finally { setBusy(false); }
  }

  async function addScene() {
    if (!activeProject || !user || busy) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.from("yazarlik_sahneleri").insert({
        user_id: user.id, proje_id: activeProject.id,
        sira: scenes.length ? Math.max(...scenes.map(s=>s.sira))+1 : 0,
        baslik: activeProject.format === "screenplay" ? "INT. MEKÂN - GÜN" : "Yeni Bölüm",
        icerik: "",
      }).select("*").single();
      if (error) throw error;
      setScenes(prev => sortedScenes([...prev,data]));
      selectScene(data);
    } catch (error) {
      setSaveStatus("Sahne oluşturulamadı: " + error.message);
    } finally { setBusy(false); }
  }

  async function saveScene() {
    const scene = activeSceneRef.current;
    if (!scene || !user || savingRef.current || conflict) return;
    const currentHeading = headingRef.current;
    const currentBody = bodyRef.current;
    if (currentHeading === scene.baslik && currentBody === scene.icerik) return;
    savingRef.current = true;
    setSaveStatus("Kaydediliyor");
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setSaveStatus("Çevrimdışı — cihazda saklandı");
        return;
      }
      const { data, error } = await supabase.from("yazarlik_sahneleri")
        .update({baslik:currentHeading,icerik:currentBody})
        .eq("id",scene.id).eq("user_id",user.id)
        .eq("versiyon",scene.versiyon).select("*").maybeSingle();
      if (error) throw error;
      if (!data) {
        setConflict(true);
        setSaveStatus("Sürüm çakışması — yerel taslak korundu");
        return;
      }
      activeSceneRef.current = data;
      setActiveScene(data);
      setScenes(prev => prev.map(item => item.id === data.id ? data : item));
      if (headingRef.current === currentHeading && bodyRef.current === currentBody) {
        try { localStorage.removeItem(draftKey(user.id,scene.id)); } catch (_) {}
        setSaveStatus("Kaydedildi");
      } else {
        setSaveStatus("Yeni değişiklikler kaydediliyor");
      }
    } catch (error) {
      setSaveStatus("Bağlantı hatası — yerel taslak korundu");
      console.error("[editor] save failed:", error);
    } finally { savingRef.current = false; }
  }

  useEffect(() => {
    if (!activeScene || !user?.id || conflict) return;
    if (heading === activeScene.baslik && body === activeScene.icerik) return;
    try {
      localStorage.setItem(draftKey(user.id, activeScene.id), JSON.stringify({
        baslik:heading,icerik:body,versiyon:activeScene.versiyon,updated_at:Date.now(),
      }));
    } catch (_) { setSaveStatus("Cihaz taslağı depolanamadı"); }
    const timer = setTimeout(() => { void saveScene(); }, 1300);
    return () => clearTimeout(timer);
  }, [heading,body,activeScene?.id,activeScene?.versiyon,conflict,user?.id]);

  async function reloadConflict() {
    if (!activeScene || !user) return;
    if (!window.confirm("Sunucu sürümüne dönersen cihazdaki değişikliklerin editördeki görüntüsü kaybolacak. Devam edilsin mi?")) return;
    const {data,error} = await supabase.from("yazarlik_sahneleri").select("*")
      .eq("id",activeScene.id).eq("user_id",user.id).single();
    if (error || !data) { setSaveStatus("Sunucu sürümü yüklenemedi"); return; }
    setConflict(false);
    setActiveScene(data);
    setHeading(data.baslik);
    setBody(data.icerik);
    setScenes(prev=>prev.map(item=>item.id===data.id?data:item));
    setSaveStatus("Sunucu sürümü yüklendi");
  }

  async function removeScene() {
    if (!activeScene || !user || !window.confirm("Bu sahne kalıcı olarak silinsin mi?")) return;
    const {error}=await supabase.from("yazarlik_sahneleri").delete()
      .eq("id",activeScene.id).eq("user_id",user.id);
    if (error) { setSaveStatus("Sahne silinemedi: "+error.message); return; }
    const remaining=scenes.filter(s=>s.id!==activeScene.id);
    try { localStorage.removeItem(draftKey(user.id,activeScene.id)); } catch (_) {}
    setScenes(remaining);
    selectScene(remaining[0] || null);
  }

  async function removeProject() {
    if (!activeProject || !user || !window.confirm("Bu proje ve tüm sahneleri kalıcı olarak silinsin mi?")) return;
    const {error}=await supabase.from("yazarlik_projeleri").delete()
      .eq("id",activeProject.id).eq("user_id",user.id);
    if (error) { setSaveStatus("Proje silinemedi: "+error.message); return; }
    setProjects(prev=>prev.filter(p=>p.id!==activeProject.id));
    setActiveProject(null);setActiveScene(null);setScenes([]);
    setSaveStatus("Proje silindi");
  }

  function exportProject(type) {
    if (!activeProject) return;
    const items=sortedScenes(scenes).map(s=>s.id===activeScene?.id
      ? {...s,baslik:heading,icerik:body}:s);
    const title=activeProject.baslik;
    const filename=title.replace(/[^a-z0-9ğüşıöç _-]/gi,"").slice(0,64)||"fabularc";
    if (type === "txt") {
      const output=title+"\n"+Array(40).join("=")+"\n\n"+
        items.map(s=>s.baslik+"\n\n"+s.icerik).join("\n\n");
      downloadText(filename+".txt",output,"text/plain;charset=utf-8");
      return;
    }
    const paragraphs=items.map(s=>
      '<Paragraph Type="Scene Heading"><Text>'+escapeXml(s.baslik)+'</Text></Paragraph>'+
      '<Paragraph Type="Action"><Text>'+escapeXml(s.icerik)+'</Text></Paragraph>'
    ).join("");
    const xml='<?xml version="1.0" encoding="UTF-8"?>'+
      '<FinalDraft DocumentType="Script" Template="No" Version="2">'+
      '<Content>'+paragraphs+'</Content></FinalDraft>';
    downloadText(filename+".fdx",xml,"application/xml;charset=utf-8");
  }

  if (!authHazir) return <div className="loading">Editör hazırlanıyor...</div>;
  if (!user) return <div className="loading">Yazarlık editörüne erişmek için giriş yapmalısınız. <a href="/">Ana sayfa</a></div>;

  return (
    <>
      <Head>
        <title>Yazarlık Editörü — Fabularc</title>
        <meta name="description" content="Sahne tabanlı profesyonel yazarlık editörü." />
      </Head>
      <div className="shell">
        <header className="top">
          <a href="/" aria-label="Fabularc ana sayfa" className="brand">
            <img src="/brand/fabularc-primary.svg" alt="Fabularc" />
          </a>
          <div className="header-right"><span>Yazarlık Editörü</span><a href="/uret">AI Stüdyo</a></div>
        </header>
        <div className="layout">
          <aside className="sidebar" aria-label="Projeler ve sahneler">
            <h2>Projeler</h2>
            <form onSubmit={createProject} className="newProject">
              <label htmlFor="new-title">Yeni proje adı</label>
              <input id="new-title" maxLength={200} value={newTitle}
                onChange={e=>setNewTitle(e.target.value)} placeholder="Projenin adı" required/>
              <div className="settings">
                <select aria-label="Eser biçimi" value={format} onChange={e=>setFormat(e.target.value)}>
                  <option value="screenplay">Senaryo</option><option value="novel">Roman</option>
                  <option value="story">Öykü</option><option value="poetry">Şiir</option>
                </select>
                <select aria-label="Eser dili" value={language} onChange={e=>setLanguage(e.target.value)}>
                  <option value="tr">Türkçe</option><option value="en">English</option>
                  <option value="fr">Français</option><option value="de">Deutsch</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <button type="submit" className="primary" disabled={busy}>Proje oluştur</button>
            </form>
            <div className="projectList">
              {projects.map(p=>(
                <button key={p.id} className={p.id===activeProject?.id?"item active":"item"}
                  onClick={()=>selectProject(p)} disabled={busy}>{p.baslik}</button>
              ))}
            </div>
            {activeProject&&(
              <div className="scenes">
                <div className="between"><h3>Sahneler / Bölümler</h3><button onClick={addScene} disabled={busy} aria-label="Yeni sahne oluştur">+</button></div>
                {scenes.map((s,i)=>(
                  <button key={s.id} className={s.id===activeScene?.id?"item active":"item"}
                    onClick={()=>selectScene(s)}><small>{String(i+1).padStart(2,"0")}</small> {s.baslik||"Başlıksız sahne"}</button>
                ))}
              </div>
            )}
          </aside>
          <main className="workspace">
            {activeProject ? (
              <>
                <div className="toolbar">
                  <div><h1>{activeProject.baslik}</h1><p>{saveStatus}</p></div>
                  <div className="actions">
                    <button onClick={()=>void saveScene()} disabled={!activeScene||busy||conflict}>Kaydet</button>
                    <button onClick={()=>exportProject("txt")} disabled={!scenes.length}>TXT</button>
                    <button onClick={()=>exportProject("fdx")} disabled={!scenes.length}>FDX</button>
                    <button onClick={removeProject} className="danger">Projeyi sil</button>
                  </div>
                </div>
                {conflict&&(
                  <div className="warning" role="alert">
                    Bu sahne başka bir oturumda güncellendi. Cihazdaki taslak korunuyor.
                    <button onClick={reloadConflict}>Sunucu sürümünü yükle</button>
                  </div>
                )}
                {activeScene?(
                  <div className="paper">
                    <div className="between">
                      <label htmlFor="scene-heading">Sahne başlığı</label>
                      <button className="danger" onClick={removeScene}>Sahneyi sil</button>
                    </div>
                    <input id="scene-heading" maxLength={400} value={heading}
                      onChange={e=>setHeading(e.target.value)} placeholder="INT. SALON - GECE"/>
                    <label htmlFor="scene-body">Metin</label>
                    <textarea id="scene-body" maxLength={200000} value={body}
                      onChange={e=>setBody(e.target.value)} placeholder="Sahneni burada yaz..."
                      spellCheck rows={20}/>
                    <div className="stats">{body.trim()?body.trim().split(/\s+/).length:0} kelime · Sürüm {activeScene.versiyon}</div>
                  </div>
                ):(
                  <div className="empty"><h2>İlk sahneni oluştur</h2><p>Projen hazır. Sahne ekleyerek yazmaya başlayabilirsin.</p>
                    <button className="primary" onClick={addScene}>Sahne oluştur</button></div>
                )}
              </>
            ):(
              <div className="empty"><h1>Hikâyenin çalışma alanı.</h1>
                <p>Sol bölümden yeni bir proje oluştur veya mevcut projenin üzerine git.</p></div>
            )}
          </main>
        </div>
      </div>
      <style jsx>{`
        .shell{min-height:100vh;background:${C.forest};color:${C.ivory};font-family:Inter,system-ui,-apple-system,sans-serif}
        .top{height:76px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px 28px;border-bottom:1px solid ${C.border};background:${C.ivory}}
        .brand img{display:block;width:175px;max-height:48px;object-fit:contain}
        .header-right{display:flex;align-items:center;gap:22px;color:${C.forest};font-weight:600;font-size:13px}
        .header-right a{color:${C.forest};text-decoration:underline;text-underline-offset:4px}
        .layout{display:grid;grid-template-columns:305px minmax(0,1fr);min-height:calc(100vh - 76px)}
        .sidebar{background:${C.dark};border-right:1px solid ${C.border};padding:26px 17px;overflow-y:auto}
        h1,h2,h3,p{margin:0}h2{font-size:17px;margin-bottom:20px}h3{font-size:12px;color:${C.muted};letter-spacing:.05em}
        label{font-size:12px;font-weight:650;color:${C.muted}}
        .newProject{display:flex;flex-direction:column;gap:9px;border-bottom:1px solid ${C.border};padding-bottom:23px}
        input,select,textarea{font:inherit;box-sizing:border-box;min-width:0}
        .newProject input,.newProject select{padding:11px;border:1px solid ${C.border};border-radius:8px;background:${C.forest};color:${C.ivory};font-size:13px}
        .settings{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        button{font:inherit;cursor:pointer;transition:background .16s}button:disabled{opacity:.5;cursor:not-allowed}
        button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid ${C.lime};outline-offset:2px}
        .primary{background:${C.lime};color:${C.forest};font-size:13px;font-weight:800;border:0;border-radius:8px;padding:12px}
        .projectList,.scenes{display:flex;flex-direction:column;gap:5px;margin-top:18px}
        .between{display:flex;justify-content:space-between;align-items:center;gap:12px}
        .scenes{border-top:1px solid ${C.border};padding-top:20px}
        .between button{border:1px solid ${C.border};border-radius:8px;padding:7px 12px;color:${C.ivory};background:transparent}
        .item{background:transparent;text-align:left;color:${C.ivory};padding:12px;border:1px solid transparent;border-radius:8px;font-size:13px;white-space:normal;overflow-wrap:anywhere}
        .item:hover{background:rgba(255,255,255,.08)}.item.active{border-color:${C.lime};background:rgba(200,243,59,.1)}
        .item small{color:${C.lime};font-weight:700;margin-right:7px}
        .workspace{padding:30px 36px;min-width:0}
        .toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px}
        .toolbar h1{font-size:24px;font-weight:700}.toolbar p{font-size:12px;color:${C.muted};margin-top:7px}
        .actions{display:flex;gap:8px;flex-wrap:wrap}.actions button{border:1px solid ${C.border};background:rgba(255,255,255,.05);color:${C.ivory};border-radius:8px;padding:9px 13px;font-size:12px}
        button.danger{color:#ffb8a8}.paper{max-width:840px;margin:auto;background:${C.ivory};color:${C.forest};padding:44px 54px 24px;border-radius:9px;box-shadow:0 22px 65px rgba(0,0,0,.19)}
        .paper label{color:#4a665e;display:block;margin:12px 0 8px}
        .paper input{width:100%;font-size:16px;font-weight:750;padding:12px;border:1px solid #d5ddd8;border-radius:6px;color:${C.forest};background:#fff}
        .paper textarea{width:100%;resize:vertical;min-height:410px;font-family:"Courier New",monospace;font-size:15px;line-height:1.7;border:1px solid #d5ddd8;border-radius:6px;padding:20px;color:#1b2b26;background:#fff}
        .paper .danger{background:transparent;border:0;padding:8px;color:#9f3f31}.stats{font-size:12px;color:#697a74;text-align:right;margin-top:13px}
        .empty{text-align:center;max-width:420px;margin:15vh auto}.empty h1{font-size:31px}.empty p{font-size:14px;line-height:1.7;color:${C.muted};margin:16px 0 22px}
        .empty .primary{padding:12px 24px}.warning{background:#fff0da;color:#633900;padding:14px;border-radius:8px;margin-bottom:18px;font-size:13px}
        .warning button{margin-left:14px;border:1px solid #633900;border-radius:7px;background:transparent;padding:8px}
        @media(max-width:800px){.top{padding:12px 18px}.header-right{gap:12px}.layout{display:flex;flex-direction:column}.sidebar{border-right:0;border-bottom:1px solid ${C.border};max-height:42vh;padding:18px}.workspace{padding:18px}.paper{padding:25px 19px}.toolbar h1{font-size:20px}.paper textarea{min-height:320px}}
      `}</style>
      <style jsx global>{`body{margin:0}.loading{min-height:100vh;display:flex;align-items:center;justify-content:center;gap:10px;background:#063B32;color:#F7F4ED;font:15px system-ui}.loading a{color:#C8F33B}`}</style>
    </>
  );
}
