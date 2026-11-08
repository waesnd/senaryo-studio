import Head from "next/head";
import { useEffect, useState } from "react";

const DEMO_STORAGE = "fabularc:guest:demo:v1";
const INITIAL = [
  { id: 1, title: "INT. TREN KOMPARTIMANI - GECE", text: "Yağmur, pencerenin dışında ince çizgiler bırakır.\n\nDENİZ (32), avucundaki eski fotoğrafa bakar. Karşı koltuktaki yabancı sessizce konuşur.\n\nYABANCI\nBu yolculuğun sonunda gerçeği öğrenmeye hazır mısın?"},
  { id: 2, title: "EXT. TREN İSTASYONU - ŞAFAK", text: "Perondaki saat 05.42'yi gösterir. Kalabalığın arasından tek bir kırmızı şemsiye geçer." },
];

function escapeXml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function saveFile(filename, data, type) {
  const url = URL.createObjectURL(new Blob([data], {type}));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function FabularcDemo() {
  const [scenes, setScenes] = useState(INITIAL);
  const [selected, setSelected] = useState(1);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Bu çalışma yalnızca cihazında tutulur.");
  const [panel, setPanel] = useState("scenes");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DEMO_STORAGE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length && parsed.length < 200 &&
            parsed.every(x => typeof x.id === "number" && typeof x.title === "string" && typeof x.text === "string")) {
          setScenes(parsed);
          setSelected(parsed[0].id);
        }
      }
    } catch (_) {
      setMessage("Yerel taslak okunamadı; örnek sahneler yüklendi.");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(DEMO_STORAGE, JSON.stringify(scenes));
      setMessage("Taslak cihazına kaydedildi.");
    } catch (_) {
      setMessage("Cihazın yerel depolaması kullanılamıyor. Metnini dışa aktar.");
    }
  }, [scenes, ready]);

  const active = scenes.find(s => s.id === selected) || scenes[0];
  function update(field, value) {
    setScenes(prev => prev.map(s => s.id === active.id ? {...s, [field]: value} : s));
  }
  function addScene() {
    const id = Math.max(...scenes.map(s => s.id), 0) + 1;
    setScenes(prev => [...prev, {id, title:"INT. YENİ SAHNE - GÜN", text:""}]);
    setSelected(id);
    setPanel("editor");
  }
  function exportText() {
    const full = scenes.map((s,i) => `SAHNE ${i+1} — ${s.title}\n\n${s.text}`).join("\n\n" + "—".repeat(35) + "\n\n");
    saveFile("fabularc-demo.txt", full, "text/plain;charset=utf-8");
  }
  function exportFdx() {
    const lines = scenes.flatMap(s => [
      '<Paragraph Type="Scene Heading"><Text>' + escapeXml(s.title) + '</Text></Paragraph>',
      ...s.text.split(/\n\n+/).filter(Boolean).map(p => '<Paragraph Type="Action"><Text>' + escapeXml(p) + '</Text></Paragraph>')
    ]).join("");
    const xml = '<?xml version="1.0" encoding="UTF-8"?><FinalDraft DocumentType="Script" Template="No" Version="2"><Content>' + lines + '</Content></FinalDraft>';
    saveFile("fabularc-demo.fdx", xml, "application/xml;charset=utf-8");
  }
  function resetDemo() {
    if (!window.confirm("Yalnızca bu cihazdaki demo taslağı silinsin mi?")) return;
    localStorage.removeItem(DEMO_STORAGE);
    setScenes(INITIAL);
    setSelected(1);
    setPanel("scenes");
  }
  return (
    <div className="demo">
      <Head><title>Fabularc — Senaryo Editörü Demo</title><meta name="description" content="Fabularc senaryo editörünü kayıt olmadan dene." /></Head>
      <header className="header">
        <a href="/" aria-label="Fabularc ana sayfa" className="logo"><img src="/brand/fabularc-primary.svg" alt="Fabularc" /></a>
        <span className="pill">DENEME MODU</span>
      </header>
      <div className="notice" role="status">
        <strong>Hesapsız deneyebilirsin.</strong> Bu demo gerçek projelerine bağlanmaz. Metinler yalnızca bu tarayıcıda saklanır.
      </div>
      <div className="mobile-nav">
        <button type="button" className={panel==="scenes"?"active":""} onClick={()=>setPanel("scenes")}>Sahneler</button>
        <button type="button" className={panel==="editor"?"active":""} onClick={()=>setPanel("editor")}>Editör</button>
      </div>
      <div className="grid">
        <aside className={panel==="scenes"?"sidebar shown":"sidebar"}>
          <div className="sidebar-top"><span>HİKÂYEM</span><small>{scenes.length} sahne</small></div>
          <h2>Gece Yolculuğu</h2>
          <p className="sidebar-desc">Örnek projeyi değiştir, yeni sahneler ekle ve metnini dışa aktar.</p>
          <nav aria-label="Sahneler">
            {scenes.map((s,i)=>(
              <button type="button" key={s.id} className={s.id===active?.id?"scene selected":"scene"} onClick={()=>{setSelected(s.id);setPanel("editor")}}>
                <span className="scene-number">{String(i+1).padStart(2,"0")}</span><span>{s.title}</span>
              </button>
            ))}
          </nav>
          <button className="add" type="button" onClick={addScene}>+ Yeni sahne ekle</button>
        </aside>
        <main className={panel==="editor"?"workspace shown":"workspace"}>
          <div className="toolbar">
            <div><div className="eyebrow">FABULARC / YAZARLIK STÜDYOSU</div><h1>Senaryo Editörü</h1></div>
            <div className="actions">
              <button type="button" onClick={exportText}>TXT indir</button>
              <button type="button" onClick={exportFdx}>FDX indir</button>
            </div>
          </div>
          <div className="paper">
            <label htmlFor="demo-heading">SAHNE BAŞLIĞI</label>
            <input id="demo-heading" value={active?.title || ""} maxLength={400} onChange={e=>update("title",e.target.value)} />
            <label htmlFor="demo-content">SENARYO METNİ</label>
            <textarea id="demo-content" value={active?.text || ""} onChange={e=>update("text",e.target.value)} placeholder="Sahneni burada yaz..." spellCheck rows={17} />
            <div className="paper-footer"><span>{(active?.text||"").trim().split(/\s+/).filter(Boolean).length} kelime</span><span>{message}</span></div>
          </div>
          <div className="below"><a href="/">Ana sayfaya dön</a><button type="button" onClick={resetDemo}>Demo taslağını sıfırla</button></div>
        </main>
      </div>
      <style jsx>{`
        .demo{min-height:100vh;background:#063B32;color:#F7F4ED;font:15px/1.5 system-ui,-apple-system,sans-serif}
        .header{min-height:72px;padding:12px clamp(18px,4vw,42px);display:flex;align-items:center;justify-content:space-between;gap:12px;background:#F7F4ED}
        .logo img{width:150px;max-height:46px;display:block}
        .pill{background:#063B32;color:#C8F33B;border-radius:100px;padding:7px 12px;font-size:10px;font-weight:850;letter-spacing:.08em}
        .notice{padding:14px clamp(18px,4vw,42px);background:#C8F33B;color:#063B32;font-size:13px}
        .grid{display:grid;grid-template-columns:290px minmax(0,1fr);min-height:calc(100vh - 119px)}
        .sidebar{background:#092820;border-right:1px solid #24453e;padding:26px 18px}
        .sidebar-top,.paper-footer{display:flex;align-items:center;justify-content:space-between;gap:10px}
        .sidebar-top{font-size:11px;color:#C8F33B;letter-spacing:.1em;font-weight:800}
        .sidebar-top small{color:#b2c3bd}.sidebar h2{font-size:21px;line-height:1.2;margin:14px 0 8px}
        .sidebar-desc{font-size:12px;color:#bacdc4;margin:0 0 25px}
        nav{display:grid;gap:8px}.scene{display:flex;text-align:left;gap:10px;align-items:flex-start;width:100%;padding:12px;background:transparent;color:#F7F4ED;border:1px solid #2a5046;border-radius:10px;font:inherit;font-size:12px;overflow-wrap:anywhere}
        .scene.selected{border-color:#C8F33B;background:#163f34}.scene-number{color:#C8F33B;font-weight:850}
        .add{width:100%;margin-top:16px;border:1px dashed #C8F33B;background:transparent;color:#C8F33B;padding:12px;border-radius:10px;font-weight:750}
        .workspace{padding:clamp(18px,4vw,45px);min-width:0}
        .toolbar{max-width:920px;margin:0 auto 22px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
        .eyebrow{font-size:10px;letter-spacing:.12em;color:#C8F33B;font-weight:800}
        h1{font-size:clamp(22px,3vw,32px);margin:6px 0 0;line-height:1.2}
        .actions{display:flex;gap:9px;flex-wrap:wrap}
        .actions button{border:1px solid #6d9186;border-radius:9px;padding:10px 13px;background:transparent;color:#F7F4ED;font-weight:750}
        .paper{max-width:920px;margin:auto;background:#F7F4ED;color:#063B32;padding:clamp(19px,5vw,50px);border-radius:12px;box-shadow:0 18px 55px #0004}
        .paper label{display:block;margin:5px 0 9px;font-size:11px;font-weight:850;letter-spacing:.08em}
        .paper input,.paper textarea{width:100%;border:1px solid #cad6ce;border-radius:9px;color:#15392f;background:#fff;min-width:0;font:inherit}
        .paper input{padding:13px;font-weight:800;margin-bottom:25px}
        .paper textarea{resize:vertical;padding:18px;font:15px/1.8 "Courier New",monospace;min-height:350px}
        .paper-footer{color:#567368;font-size:11px;flex-wrap:wrap;margin-top:13px}
        .below{max-width:920px;margin:18px auto;display:flex;align-items:center;justify-content:space-between;gap:15px;font-size:12px}
        .below a{color:#C8F33B}.below button{color:#F7F4ED;background:transparent;border:0;text-decoration:underline}
        button{cursor:pointer}button:focus-visible,input:focus-visible,textarea:focus-visible,a:focus-visible{outline:3px solid #C8F33B;outline-offset:3px}
        .mobile-nav{display:none}
        @media(max-width:760px){
          .header{min-height:64px}.logo img{width:125px}.pill{font-size:9px}
          .mobile-nav{display:grid;grid-template-columns:1fr 1fr;padding:9px 15px;gap:9px;background:#092820}
          .mobile-nav button{border:1px solid #44675b;color:#F7F4ED;background:transparent;padding:12px;border-radius:8px;font-weight:750}
          .mobile-nav button.active{background:#C8F33B;color:#063B32;border-color:#C8F33B}
          .grid{display:block;min-height:70vh}
          .sidebar,.workspace{display:none}
          .sidebar.shown,.workspace.shown{display:block}
          .sidebar{border-right:0;padding:22px 17px;min-height:60vh}
          .workspace{padding:20px 14px}
          .toolbar{margin-bottom:17px}
          .paper{padding:21px 15px}
          .paper textarea{min-height:300px}
          .below{padding:3px 2px}
        }
      `}</style>
    </div>
  );
}
