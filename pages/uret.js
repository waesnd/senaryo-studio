import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

var G = {
  black:"#080808",deep:"#0d0d0d",surface:"#111",card:"#141414",
  border:"rgba(212,175,55,0.12)",borderHov:"rgba(212,175,55,0.35)",
  gold:"#D4AF37",goldL:"#F2D46F",goldD:"#A8892A",
  goldGrad:"linear-gradient(135deg,#D4AF37 0%,#F2D46F 40%,#A8892A 70%,#D4AF37 100%)",
  red:"#C0392B",redL:"#E74C3C",
  green:"#27AE60",greenL:"#2ECC71",
  purple:"#8E44AD",purpleL:"#9B59B6",
  amber:"#D4AC0D",
  silver:"#A8A9AD",
  text:"#F5F0E8",textMuted:"rgba(245,240,232,0.42)",textDim:"rgba(245,240,232,0.2)",
  shadow:"0 8px 40px rgba(0,0,0,0.85)",glow:"0 0 30px rgba(212,175,55,0.18)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

var TURLER=["Gerilim","Drama","Bilim Kurgu","Komedi","Romantik","Korku","Aksiyon","Fantastik","Suç","Tarihi","Animasyon","Belgesel"];
var TIPLER=[{val:"Dizi",icon:"📺"},{val:"Film",icon:"🎬"}];

var BEAT_SHEET=[
  {id:"opening",  no:1,  label:"Açılış Görüntüsü",    aciklama:"Filmin tonu ve dünyası",  act:1},
  {id:"theme",    no:2,  label:"Tema Sunumu",          aciklama:"Hikayenin ana mesajı",    act:1},
  {id:"setup",    no:3,  label:"Kurulum",              aciklama:"Karakterler ve statüko",  act:1},
  {id:"catalyst", no:4,  label:"Katalizör",            aciklama:"Her şeyi değiştiren olay",act:1},
  {id:"debate",   no:5,  label:"Tartışma",             aciklama:"Kahraman tereddüt eder", act:1},
  {id:"break1",   no:6,  label:"2. Perde Geçişi",      aciklama:"Yeni dünyaya adım",      act:1},
  {id:"bstory",   no:7,  label:"B Hikayesi",           aciklama:"Alt hikaye / romantik",  act:2},
  {id:"fun",      no:8,  label:"Eğlence & Oyun",       aciklama:"Yeni dünyanın keşfi",    act:2},
  {id:"midpoint", no:9,  label:"Orta Nokta",           aciklama:"Sahte zafer ya da ölüm", act:2},
  {id:"badguys",  no:10, label:"Kötüler Geri Döner",   aciklama:"Baskı artıyor",          act:2},
  {id:"alllost",  no:11, label:"Her Şey Kayıp",        aciklama:"En karanlık an",         act:2},
  {id:"soul",     no:12, label:"Ruhun Karanlık Gecesi",aciklama:"Kahraman yıkılır",       act:2},
  {id:"break2",   no:13, label:"3. Perde Geçişi",      aciklama:"Yeni karar, yeni güç",   act:3},
  {id:"finale",   no:14, label:"Final",                aciklama:"Son çatışma ve çözüm",   act:3},
  {id:"closing",  no:15, label:"Kapanış Görüntüsü",    aciklama:"Dönüşüm tamamlandı",    act:3},
];

// ── İKONLAR ───────────────────────────────────────────────────────────────────
function Icon({id,size=22,color="currentColor",strokeWidth=1.8}){
  var p={width:size,height:size,fill:"none",stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="logout")return<svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  if(id==="menu")return<svg {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
  if(id==="download")return<svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
  if(id==="share")return<svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
  if(id==="save")return<svg {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
  if(id==="check")return<svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
  if(id==="star")return<svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  if(id==="zap")return<svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  if(id==="bell")return<svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if(id==="plus")return<svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  return null;
}

function FilmCorners({color=G.gold,size=12,thickness=2}){
  var s={position:"absolute",width:size,height:size};
  var l={background:color,position:"absolute"};
  return(<>
    <div style={{...s,top:0,left:0}}><div style={{...l,top:0,left:0,width:thickness,height:size}}/><div style={{...l,top:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,top:0,right:0}}><div style={{...l,top:0,right:0,width:thickness,height:size}}/><div style={{...l,top:0,right:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,left:0}}><div style={{...l,bottom:0,left:0,width:thickness,height:size}}/><div style={{...l,bottom:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,right:0}}><div style={{...l,bottom:0,right:0,width:thickness,height:size}}/><div style={{...l,bottom:0,right:0,width:size,height:thickness}}/></div>
  </>);
}

function Av({url,size}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#1a1500,#2a2000)",border:`1.5px solid rgba(212,175,55,0.3)`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.42} color="rgba(212,175,55,0.4)"/>}
    </div>
  );
}

// ── DRAWER ────────────────────────────────────────────────────────────────────
var DRAWER_ITEMS=[
  {href:"/",label:"Ana Sayfa",id:"home"},
  {href:"/uret",label:"Senaryo Üret",id:"film",badge:"AI"},
  {href:"/kesfet",label:"Keşfet",id:"compass"},
  {href:"/topluluk",label:"Topluluk",id:"users"},
  {href:"/mesajlar",label:"Mesajlar",id:"chat"},
];
function Drawer({user,username,avatarUrl,onClose}){
  var [exitModal,setExitModal]=useState(false);
  return(<>
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)"}}/>
    <div style={{position:"fixed",top:0,left:0,bottom:0,zIndex:201,width:290,background:"#0a0a0a",borderRight:`1px solid ${G.border}`,display:"flex",flexDirection:"column",boxShadow:"8px 0 60px rgba(0,0,0,0.9)"}}>
      <div style={{height:3,background:G.goldGrad,flexShrink:0}}/>
      <div style={{padding:"20px 20px 16px",borderBottom:`1px solid ${G.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <Av url={avatarUrl} size={48}/>
          <button onClick={onClose} style={{background:"rgba(245,240,232,0.05)",border:`1px solid ${G.border}`,borderRadius:10,padding:"6px 12px",color:G.textMuted,fontSize:12}}>ESC</button>
        </div>
        {user?<p style={{fontSize:15,fontWeight:800,color:G.text}}>@{username}</p>
          :<button onClick={()=>{onClose();window.location.href="/";}} style={{width:"100%",padding:"10px",borderRadius:12,background:G.goldGrad,border:"none",color:"#0d0d0d",fontSize:13,fontWeight:800,textTransform:"uppercase"}}>Giriş Yap</button>}
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"12px"}}>
        {DRAWER_ITEMS.map(item=>{
          var active=typeof window!=="undefined"&&window.location.pathname===item.href;
          return(
            <a key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,marginBottom:2,color:active?G.gold:G.textMuted,background:active?`${G.gold}08`:"transparent",fontWeight:active?700:500,fontSize:14,border:`1px solid ${active?G.border:"transparent"}`,textDecoration:"none"}}>
              <Icon id={item.id} size={18} color={active?G.gold:G.textMuted}/>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge&&<span style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,background:G.red,color:"#fff"}}>{item.badge}</span>}
            </a>
          );
        })}
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${G.border}`}}>
          <a href="/profil" style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,color:G.textMuted,fontSize:14,textDecoration:"none"}}><Icon id="user" size={18} color={G.textMuted}/><span>Profil</span></a>
          {user&&<button onClick={()=>setExitModal(true)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,color:G.red,fontSize:14,background:`${G.red}08`,border:"none",width:"100%",textAlign:"left"}}><Icon id="logout" size={18} color={G.red}/><span style={{fontWeight:600}}>Çıkış Yap</span></button>}
        </div>
      </nav>
    </div>
    {exitModal&&<>
      <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:301,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{background:"#111",border:`1px solid ${G.border}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:300,textAlign:"center",position:"relative"}}>
          <FilmCorners/>
          <h3 style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.05em",color:G.text,marginBottom:8}}>ÇIKIŞ YAP</h3>
          <p style={{fontSize:13,color:G.textMuted,marginBottom:22}}>Emin misin?</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setExitModal(false)} style={{flex:1,padding:"12px",borderRadius:12,background:"rgba(245,240,232,0.05)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:13,fontWeight:600}}>İptal</button>
            <button onClick={()=>{supabase.auth.signOut();onClose();window.location.href="/";}} style={{flex:1,padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${G.red},#e74c3c)`,border:"none",color:"#fff",fontSize:13,fontWeight:700}}>Çıkış</button>
          </div>
        </div>
      </div>
    </>}
  </>);
}

// ── ALT NAV ───────────────────────────────────────────────────────────────────
function AltNav(){
  var items=[{href:"/",id:"home"},{href:"/kesfet",id:"compass"},{href:"/topluluk",id:"users"},{href:"/mesajlar",id:"chat"},{href:"/profil",id:"user"}];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(8,8,8,0.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"8px 0 env(safe-area-inset-bottom,10px)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold}25,transparent)`}}/>
      {items.map(item=>(
        <a key={item.href} href={item.href} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px",borderRadius:12,opacity:0.4}}>
          <Icon id={item.id} size={22} color={G.silver}/>
        </a>
      ))}
    </div>
  );
}

// ── SEÇENEK BUTONU ────────────────────────────────────────────────────────────
function SecBtn({aktif,onClick,children,color=G.gold}){
  return(
    <button onClick={onClick} style={{padding:"8px 16px",borderRadius:20,border:`1.5px solid ${aktif?color:G.border}`,background:aktif?color+"15":"transparent",color:aktif?color:G.textMuted,fontSize:13,fontWeight:aktif?700:500,cursor:"pointer",transition:"all 0.15s",letterSpacing:"0.02em",whiteSpace:"nowrap"}}>
      {children}
    </button>
  );
}

// ── BÖLÜM BAŞLIĞI ─────────────────────────────────────────────────────────────
function SecBaslik({label,info}){
  return(
    <div style={{marginBottom:10}}>
      <p style={{fontSize:11,fontWeight:700,color:G.textDim,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</p>
      {info&&<p style={{fontSize:11,color:G.textDim,marginTop:2}}>{info}</p>}
    </div>
  );
}

// ── PUAN ÇUBUĞU ───────────────────────────────────────────────────────────────
function PuanCubugu({val,max,color}){
  return(
    <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden",marginTop:8}}>
      <div style={{height:"100%",width:(val/max*100)+"%",background:color,borderRadius:2,transition:"width 1s ease"}}/>
    </div>
  );
}

// ── ANA SAYFA ─────────────────────────────────────────────────────────────────
export default function Uret(){
  var [user,setUser]=useState(null);
  var [profil,setProfil]=useState(null);
  var [tip,setTip]=useState("Dizi");
  var [tur,setTur]=useState("Gerilim");
  var [ozelIstek,setOzelIstek]=useState("");
  var [yukleniyor,setYukleniyor]=useState(false);
  var [senaryo,setSenaryo]=useState(null);
  var [kaydedildi,setKaydedildi]=useState(false);
  var [paylasimAcik,setPaylasimAcik]=useState(false);
  var [sekme,setSekme]=useState("senaryo");
  var [beatler,setBeatler]=useState({});
  var [beatYukleniyor,setBeatYukleniyor]=useState(false);
  var [karakterBible,setKarakterBible]=useState(null);
  var [bibleYukleniyor,setBibleYukleniyor]=useState(false);
  var [dramaturgAnaliz,setDraturagAnaliz]=useState(null);
  var [dramaturgYukleniyor,setDraturagYukleniyor]=useState(false);
  var [puan,setPuan]=useState(null);
  var [puanYukleniyor,setPuanYukleniyor]=useState(false);
  var [sequel,setSequel]=useState(null);
  var [sequelYukleniyor,setSequelYukleniyor]=useState(false);
  var [kartModal,setKartModal]=useState(false);
  var [pdfYukleniyor,setPdfYukleniyor]=useState(false);
  var [drawer,setDrawer]=useState(false);

  var avatarUrl=profil?.avatar_url||null;
  var username=profil?.username||(user?user.email.split("@")[0]:"");

  useEffect(()=>{
    try{
      var params=new URLSearchParams(window.location.search);
      var ch=params.get("challenge"),chTur=params.get("tur"),chTip=params.get("tip");
      if(ch)setOzelIstek("Challenge: "+ch);
      if(chTur)setTur(chTur);
      if(chTip)setTip(chTip);
    }catch(e){}
    supabase.auth.getSession().then(r=>{if(r.data?.session){setUser(r.data.session.user);loadProfil(r.data.session.user);}});
    supabase.auth.onAuthStateChange((_,s)=>{if(s){setUser(s.user);loadProfil(s.user);}else{setUser(null);setProfil(null);}});
  },[]);

  function loadProfil(u){supabase.from("profiles").select("*").eq("id",u.id).single().then(r=>{if(r.data)setProfil(r.data);});}

  async function senaryoUret(){
    setYukleniyor(true);setSenaryo(null);setBeatler({});setKarakterBible(null);setDraturagAnaliz(null);setPuan(null);setSequel(null);setSekme("senaryo");
    try{
      var res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tip,tur,ozelIstek})});
      var data=await res.json();
      if(data.senaryo)setSenaryo(data.senaryo);
      else alert("Senaryo oluşturulamadı, tekrar dene.");
    }catch(e){alert("Hata: "+e.message);}
    setYukleniyor(false);
  }

  async function beatUret(){
    if(!senaryo)return;setBeatYukleniyor(true);
    try{var res=await fetch("/api/beatsheet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({senaryo,tip,tur})});var parsed=await res.json();setBeatler(parsed);}
    catch(e){alert("Beat Sheet oluşturulamadı.");}
    setBeatYukleniyor(false);
  }

  async function karakterBibleUret(){
    if(!senaryo)return;setBibleYukleniyor(true);
    try{var res=await fetch("/api/karakterbible",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({senaryo,tur})});var parsed=await res.json();setKarakterBible(parsed);}
    catch(e){alert("Character Bible oluşturulamadı.");}
    setBibleYukleniyor(false);
  }

  async function dramaturgCalistir(){
    if(!senaryo)return;setDraturagYukleniyor(true);
    try{var res=await fetch("/api/dramaturg",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({senaryo,tip,tur})});var parsed=await res.json();setDraturagAnaliz(parsed);}
    catch(e){alert("Dramaturg analizi yapılamadı.");}
    setDraturagYukleniyor(false);
  }

  async function puanHesapla(){
    if(!senaryo)return;setPuanYukleniyor(true);
    try{var res=await fetch("/api/puan",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({senaryo,tip,tur})});var parsed=await res.json();setPuan(parsed);}
    catch(e){alert("Puanlama yapılamadı.");}
    setPuanYukleniyor(false);
  }

  async function sequelUret(){
    if(!senaryo)return;setSequelYukleniyor(true);setSequel(null);
    try{
      var res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tip,tur,ozelIstek:`Bu senaryonun devamını yaz: "${senaryo.baslik}". Tagline: ${senaryo.tagline}. Ana fikir: ${senaryo.ana_fikir?.slice(0,200)}`})});
      var data=await res.json();if(data.senaryo)setSequel(data.senaryo);
    }catch(e){}
    setSequelYukleniyor(false);
  }

  async function profilKaydet(){
    if(!user||!senaryo)return;
    await supabase.from("senaryolar").insert([{user_id:user.id,tip,tur,baslik:senaryo.baslik,tagline:senaryo.tagline,ana_fikir:senaryo.ana_fikir,karakter:senaryo.karakter,sahne:senaryo.acilis_sahnesi,soru:senaryo.buyuk_soru,paylasim_acik:paylasimAcik,begeni_sayisi:0}]);
    setKaydedildi(true);
  }

  async function txtIndir(){
    if(!senaryo)return;setPdfYukleniyor(true);
    var icerik=`SCRIPTIFY — SENARYO\n${"=".repeat(50)}\n\nBaşlık: ${senaryo.baslik}\nTür: ${tur} | Format: ${tip}\n${senaryo.tagline?`Tagline: "${senaryo.tagline}"\n`:""}\n${"─".repeat(40)}\n\n`+
      (senaryo.ana_fikir?`💡 ANA FİKİR\n${senaryo.ana_fikir}\n\n`:"")+
      (senaryo.karakter?`👥 KARAKTERLER\n${senaryo.karakter}\n\n`:"")+
      (senaryo.acilis_sahnesi?`🎭 AÇILIŞ SAHNESİ\n${senaryo.acilis_sahnesi}\n\n`:"")+
      (senaryo.buyuk_soru?`❓ BÜYÜK SORU\n${senaryo.buyuk_soru}\n\n`:"")+
      (Object.keys(beatler).length>0?`\n${"─".repeat(40)}\n📋 BEAT SHEET (Save the Cat)\n`+BEAT_SHEET.map(b=>`\n${b.no}. ${b.label}\n${beatler[b.id]||"-"}`).join("\n")+"\n":"")+
      `\n${"─".repeat(40)}\nOluşturulma: ${new Date().toLocaleDateString("tr-TR")}\nScriptify — AI Senaryo Platformu\n`;
    var blob=new Blob(["\uFEFF"+icerik],{type:"text/plain;charset=utf-8"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download=(senaryo.baslik||"senaryo").replace(/\s+/g,"_")+".txt";a.click();URL.revokeObjectURL(url);
    setPdfYukleniyor(false);
  }

  // ── Paylaşım kartı modal ──────────────────────────────────────────────────
  function KartModal(){
    useEffect(()=>{
      var canvas=document.getElementById("paylasim-karti");
      if(!canvas||!senaryo)return;
      var ctx=canvas.getContext("2d");var W=1080,H=1080;canvas.width=W;canvas.height=H;
      // Arkaplan
      var grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,"#080808");grad.addColorStop(0.5,"#0d0d0d");grad.addColorStop(1,"#111");
      ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
      // Altın çizgiler
      var lg=ctx.createLinearGradient(60,0,W-60,0);lg.addColorStop(0,"#D4AF37");lg.addColorStop(0.5,"#F2D46F");lg.addColorStop(1,"#A8892A");
      ctx.fillStyle=lg;ctx.fillRect(60,70,W-120,4);ctx.fillRect(60,H-90,W-120,4);
      // Film sprocket delikleri
      for(var i=0;i<8;i++){ctx.fillStyle="#1a1a1a";ctx.beginPath();ctx.roundRect(20+i*30,80,18,24,4);ctx.fill();ctx.strokeStyle="#2a2a2a";ctx.stroke();}
      for(var i=0;i<8;i++){ctx.fillStyle="#1a1a1a";ctx.beginPath();ctx.roundRect(20+i*30,H-110,18,24,4);ctx.fill();}
      // Logo
      ctx.font="bold 28px 'Arial Narrow',sans-serif";
      var lgText=ctx.createLinearGradient(60,0,400,0);lgText.addColorStop(0,"#D4AF37");lgText.addColorStop(0.5,"#F2D46F");lgText.addColorStop(1,"#A8892A");
      ctx.fillStyle=lgText;ctx.fillText("SCRIPTIFY",60,145);
      // Badge
      ctx.fillStyle=G.red;ctx.beginPath();ctx.roundRect(300,115,60,30,15);ctx.fill();
      ctx.font="bold 14px sans-serif";ctx.fillStyle="#fff";ctx.fillText("AI",325,135);
      // Tür badge
      ctx.fillStyle="rgba(212,175,55,0.2)";ctx.beginPath();ctx.roundRect(60,175,150,36,18);ctx.fill();
      ctx.fillStyle=G.gold;ctx.font="bold 17px sans-serif";ctx.fillText(tip+" · "+tur,80,200);
      // IMDb
      if(puan){ctx.font="bold 22px sans-serif";ctx.fillStyle=G.amber;ctx.fillText("⭐ "+puan.imdb_tahmin+" · "+puan.toplam+"/100",60,250);}
      // Başlık
      ctx.fillStyle=G.text;ctx.font="bold 76px 'Arial Narrow',sans-serif";
      var words=(senaryo.baslik||"").split(" ");var lines=[];var line="";
      words.forEach(w=>{var t=line+(line?" ":"")+w;if(ctx.measureText(t).width>W-120){lines.push(line);line=w;}else line=t;});lines.push(line);
      lines.slice(0,3).forEach((l,i)=>ctx.fillText(l,60,(puan?300:320)+i*90));
      // Tagline
      if(senaryo.tagline){ctx.font="italic 34px sans-serif";ctx.fillStyle=G.gold;ctx.fillText('"'+(senaryo.tagline.slice(0,80))+(senaryo.tagline.length>80?"...":"")+'"',60,600);}
      // Ana fikir
      if(senaryo.ana_fikir){
        ctx.font="26px sans-serif";ctx.fillStyle="rgba(245,240,232,0.6)";
        var af=senaryo.ana_fikir.slice(0,160)+(senaryo.ana_fikir.length>160?"...":"");
        var aw=af.split(" ");var al="";var ay=680;
        aw.forEach(w=>{var t=al+(al?" ":"")+w;if(ctx.measureText(t).width>W-120){ctx.fillText(al,60,ay);ay+=40;al=w;}else al=t;});ctx.fillText(al,60,ay);
      }
      // Alt
      ctx.font="bold 24px sans-serif";ctx.fillStyle="rgba(212,175,55,0.4)";ctx.fillText("scriptify.app",60,H-45);
      if(username){ctx.fillStyle="rgba(212,175,55,0.6)";ctx.textAlign="right";ctx.fillText("@"+username,W-60,H-45);ctx.textAlign="left";}
    },[]);
    function indir(){var c=document.getElementById("paylasim-karti");if(!c)return;var a=document.createElement("a");a.download=(senaryo.baslik||"senaryo").replace(/\s+/g,"_")+"_scriptify.png";a.href=c.toDataURL("image/png");a.click();}
    return(<>
      <div onClick={()=>setKartModal(false)} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.9)",backdropFilter:"blur(16px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:501,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,gap:16}}>
        <canvas id="paylasim-karti" style={{maxWidth:"100%",maxHeight:"62vh",borderRadius:16,boxShadow:`0 20px 60px rgba(0,0,0,0.8),${G.glow}`}}/>
        <div style={{display:"flex",gap:10}}>
          <button onClick={indir} style={{padding:"13px 24px",borderRadius:14,background:G.goldGrad,border:"none",color:"#0d0d0d",fontSize:14,fontWeight:800}}>📥 İndir</button>
          <button onClick={()=>{var c=document.getElementById("paylasim-karti");if(!c)return;c.toBlob(b=>{var f=new File([b],"scriptify.png",{type:"image/png"});if(navigator.share&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:senaryo.baslik,text:"Scriptify'da ürettiğim senaryo 🎬"});}else{alert("Önce indir, sonra paylaş!");}});}} style={{padding:"13px 24px",borderRadius:14,background:`linear-gradient(135deg,${G.red},#e74c3c)`,border:"none",color:"#fff",fontSize:14,fontWeight:800}}>📤 Paylaş</button>
          <button onClick={()=>setKartModal(false)} style={{padding:"13px 18px",borderRadius:14,background:"rgba(245,240,232,0.08)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:14}}>✕</button>
        </div>
      </div>
    </>);
  }

  // ── Yükleniyor spinner ────────────────────────────────────────────────────
  function Spinner({label}){
    return(
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"40px 0",color:G.textMuted,fontSize:13}}>
        <div style={{width:20,height:20,border:`2px solid ${G.border}`,borderTopColor:G.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
        {label}
      </div>
    );
  }

  // ── AI butonu ─────────────────────────────────────────────────────────────
  function AIBtn({onClick,loading,loadLabel,label,color=G.goldGrad}){
    return(
      <button onClick={onClick} disabled={loading} style={{padding:"10px 20px",borderRadius:12,background:loading?"rgba(245,240,232,0.05)":color,border:`1px solid ${loading?G.border:"transparent"}`,color:loading?G.textMuted:"#0d0d0d",fontSize:13,fontWeight:800,cursor:loading?"default":"pointer",letterSpacing:"0.04em",transition:"all 0.2s",display:"flex",alignItems:"center",gap:8,textTransform:"uppercase"}}>
        {loading?<><div style={{width:14,height:14,border:"2px solid rgba(245,240,232,0.2)",borderTopColor:G.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>{loadLabel}</>:label}
      </button>
    );
  }

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:90}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.goldD};border-radius:2px;}
        ::selection{background:rgba(212,175,55,0.2);color:${G.goldL};}
        textarea,input{background:rgba(245,240,232,0.04);border:1px solid ${G.border};border-radius:12px;padding:10px 14px;color:${G.text};font-size:13px;outline:none;font-family:'DM Sans',sans-serif;width:100%;}
        textarea:focus,input:focus{border-color:${G.goldD};}
        textarea::placeholder,input::placeholder{color:${G.textDim};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(8,8,8,0.95)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold}18,transparent)`}}/>
        <button onClick={()=>setDrawer(true)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",padding:0,cursor:"pointer"}}>
          <Av url={avatarUrl} size={34}/>
          <img src="/logo.png" alt="Scriptify" style={{height:24,objectFit:"contain",maxWidth:100}}/>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontFamily:G.fontDisp,fontSize:13,letterSpacing:"0.12em",color:G.gold,background:`${G.gold}12`,border:`1px solid ${G.gold}25`,borderRadius:20,padding:"4px 12px"}}>AI STÜDYO</span>
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"20px 16px"}}>

        {/* ── FORM KARTI ─────────────────────────────────────────────────────── */}
        <div style={{background:"linear-gradient(145deg,#161616,#111)",border:`1px solid ${G.border}`,borderRadius:20,padding:"22px",marginBottom:20,boxShadow:G.shadow,position:"relative",animation:"fadeUp 0.4s ease"}}>
          <FilmCorners/>
          {/* Üst şerit */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:G.goldGrad,borderRadius:"20px 20px 0 0"}}/>

          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,paddingTop:8}}>
            <div style={{width:44,height:44,borderRadius:14,background:`linear-gradient(135deg,${G.red},${G.redL})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🎬</div>
            <div>
              <h1 style={{fontFamily:G.fontDisp,fontSize:24,letterSpacing:"0.08em",color:G.text}}>SENARYO ÜRET</h1>
              <p style={{fontSize:11,color:G.textMuted}}>AI Senaryo Stüdyosu · Beat Sheet · Character Bible · Dramaturg</p>
            </div>
          </div>

          {/* Format */}
          <SecBaslik label="Format"/>
          <div style={{display:"flex",gap:10,marginBottom:20}}>
            {TIPLER.map(t=>(
              <button key={t.val} onClick={()=>setTip(t.val)} style={{flex:1,padding:"12px",borderRadius:14,border:`2px solid ${tip===t.val?G.gold:G.border}`,background:tip===t.val?`${G.gold}12`:"transparent",color:tip===t.val?G.gold:G.textMuted,fontSize:14,fontWeight:tip===t.val?800:500,cursor:"pointer",transition:"all 0.15s"}}>
                {t.icon} {t.val}
              </button>
            ))}
          </div>

          {/* Tür */}
          <SecBaslik label="Tür"/>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            {TURLER.map(t=><SecBtn key={t} aktif={tur===t} onClick={()=>setTur(t)} color={G.red}>{t}</SecBtn>)}
          </div>

          {/* Özel istek */}
          <SecBaslik label="Özel İstek" info="İstanbul'da geçsin, güçlü kadın karakter..."/>
          <textarea value={ozelIstek} onChange={e=>setOzelIstek(e.target.value)} rows={3} placeholder="İstanbul geceleri, karanlık atmosfer, twist ending..." style={{marginBottom:20,resize:"none",lineHeight:1.6}}/>

          {/* Üret butonu */}
          <button onClick={senaryoUret} disabled={yukleniyor} style={{width:"100%",padding:"15px",borderRadius:14,background:yukleniyor?"rgba(245,240,232,0.05)":`linear-gradient(135deg,${G.red},${G.redL})`,border:"none",color:yukleniyor?G.textMuted:"#fff",fontSize:15,fontWeight:800,cursor:yukleniyor?"default":"pointer",transition:"all 0.2s",letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:yukleniyor?"none":`0 4px 20px rgba(192,57,43,0.4)`}}>
            {yukleniyor?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><span style={{display:"inline-block",width:18,height:18,border:`2px solid rgba(245,240,232,0.2)`,borderTopColor:G.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Üretiliyor...</span>:"✨ SENARYO ÜRET"}
          </button>
        </div>

        {/* ── SONUÇ ───────────────────────────────────────────────────────────── */}
        {senaryo&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>

            {/* Sekmeler */}
            <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
              {[{id:"senaryo",label:"📝 Senaryo"},{id:"beatsheet",label:"📋 Beat Sheet"},{id:"karakterler",label:"👥 Karakterler"},{id:"dramaturg",label:"🎭 Dramaturg"},{id:"puan",label:"⭐ Puan"}].map(s=>(
                <button key={s.id} onClick={()=>setSekme(s.id)} style={{flexShrink:0,padding:"8px 16px",borderRadius:20,border:`1.5px solid ${sekme===s.id?G.gold:G.border}`,background:sekme===s.id?`${G.gold}12`:"transparent",color:sekme===s.id?G.gold:G.textMuted,fontSize:12,fontWeight:sekme===s.id?700:500,cursor:"pointer",whiteSpace:"nowrap",letterSpacing:"0.02em",transition:"all 0.2s"}}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* ── Senaryo sekmesi ── */}
            {sekme==="senaryo"&&(
              <div style={{background:"linear-gradient(145deg,#161616,#111)",border:`1px solid ${G.border}`,borderRadius:20,padding:"22px",marginBottom:16,position:"relative"}}>
                <FilmCorners/>
                <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:G.goldGrad,borderRadius:"20px 20px 0 0"}}/>

                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,paddingTop:6}}>
                  <span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,background:`${G.gold}12`,color:G.gold,border:`1px solid ${G.gold}25`}}>{tip}</span>
                  <span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,background:`${G.red}10`,color:G.red,border:`1px solid ${G.red}20`}}>{tur}</span>
                </div>
                <h2 style={{fontFamily:G.fontDisp,fontSize:28,letterSpacing:"0.05em",color:G.text,marginBottom:6,lineHeight:1.1}}>{senaryo.baslik}</h2>
                {senaryo.tagline&&<p style={{fontSize:13,fontStyle:"italic",color:G.gold,marginBottom:16,lineHeight:1.5,borderLeft:`2px solid ${G.goldD}`,paddingLeft:12}}>"{senaryo.tagline}"</p>}

                {[{label:"💡 ANA FİKİR",val:senaryo.ana_fikir},{label:"👥 KARAKTERLER",val:senaryo.karakter},{label:"🎭 AÇILIŞ SAHNESİ",val:senaryo.acilis_sahnesi},{label:"❓ BÜYÜK SORU",val:senaryo.buyuk_soru}].map(item=>!item.val?null:(
                  <div key={item.label} style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${G.border}`}}>
                    <p style={{fontSize:10,fontWeight:700,color:G.textDim,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{item.label}</p>
                    <p style={{fontSize:13,color:G.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{item.val}</p>
                  </div>
                ))}

                {/* Sequel */}
                <button onClick={sequelUret} disabled={sequelYukleniyor} style={{width:"100%",padding:"12px",borderRadius:14,background:sequelYukleniyor?"rgba(245,240,232,0.05)":`linear-gradient(135deg,${G.purple},${G.purpleL})`,border:"none",color:sequelYukleniyor?G.textMuted:"#fff",fontSize:13,fontWeight:700,cursor:sequelYukleniyor?"default":"pointer",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                  {sequelYukleniyor?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,0.2)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Devam yazılıyor...</span>:"🔮 Devam Ettir (Sequel)"}
                </button>

                {sequel&&(
                  <div style={{background:`${G.purple}08`,border:`1px solid ${G.purple}25`,borderRadius:16,padding:16,marginBottom:12}}>
                    <p style={{fontSize:10,fontWeight:700,color:G.purple,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>🔮 SEQUEL</p>
                    <p style={{fontFamily:G.fontDisp,fontSize:20,letterSpacing:"0.03em",color:G.text,marginBottom:4}}>{sequel.baslik}</p>
                    {sequel.tagline&&<p style={{fontSize:12,fontStyle:"italic",color:G.gold,marginBottom:8}}>"{sequel.tagline}"</p>}
                    {sequel.ana_fikir&&<p style={{fontSize:12,color:G.textMuted,lineHeight:1.6}}>{sequel.ana_fikir}</p>}
                  </div>
                )}

                {/* Alt butonlar */}
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <button onClick={txtIndir} disabled={pdfYukleniyor} style={{flex:1,padding:"11px 8px",borderRadius:12,background:"rgba(245,240,232,0.04)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <Icon id="download" size={13} color={G.textMuted}/>İndir
                  </button>
                  <button onClick={()=>setKartModal(true)} style={{flex:1,padding:"11px 8px",borderRadius:12,background:"rgba(245,240,232,0.04)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <Icon id="share" size={13} color={G.textMuted}/>Paylaş
                  </button>
                  {!kaydedildi
                    ?<button onClick={profilKaydet} style={{flex:2,padding:"11px 8px",borderRadius:12,background:G.goldGrad,border:"none",color:"#0d0d0d",fontSize:12,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                      <Icon id="save" size={13} color="#0d0d0d"/>{user?"Kaydet":"Giriş Yap"}
                    </button>
                    :<div style={{flex:2,padding:"11px 8px",borderRadius:12,background:`${G.green}12`,border:`1px solid ${G.green}30`,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                      <Icon id="check" size={13} color={G.green}/><span style={{fontSize:12,color:G.green,fontWeight:700}}>Kaydedildi</span>
                    </div>
                  }
                </div>

                {/* Paylaşım toggle */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"rgba(245,240,232,0.03)",borderRadius:12,border:`1px solid ${G.border}`}}>
                  <div><p style={{fontSize:13,fontWeight:600,color:G.text}}>Topluluğa Paylaş</p><p style={{fontSize:11,color:G.textMuted,marginTop:1}}>Herkes görebilsin</p></div>
                  <div onClick={()=>setPaylasimAcik(!paylasimAcik)} style={{width:44,height:24,borderRadius:12,background:paylasimAcik?G.gold:G.border,position:"relative",transition:"background 0.2s",cursor:"pointer",flexShrink:0}}>
                    <div style={{position:"absolute",top:3,left:paylasimAcik?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
                  </div>
                </div>
              </div>
            )}

            {/* ── Beat Sheet sekmesi ── */}
            {sekme==="beatsheet"&&(
              <div style={{background:"linear-gradient(145deg,#161616,#111)",border:`1px solid ${G.border}`,borderRadius:20,padding:"22px",marginBottom:16,position:"relative"}}>
                <FilmCorners/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                  <div><h3 style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.08em",color:G.text}}>BEAT SHEET</h3><p style={{fontSize:11,color:G.textMuted}}>Save the Cat — 15 Adım</p></div>
                  <AIBtn onClick={beatUret} loading={beatYukleniyor} loadLabel="Oluşturuluyor" label="✨ Oluştur"/>
                </div>

                {/* 3 Perde */}
                <div style={{display:"flex",gap:6,marginBottom:20}}>
                  {[{label:"1. PERDE",color:G.gold,acts:1},{label:"2. PERDE",color:G.purple,acts:2},{label:"3. PERDE",color:G.red,acts:3}].map(p=>(
                    <div key={p.label} style={{flex:1,padding:"8px 10px",borderRadius:10,background:`${p.color}12`,border:`1px solid ${p.color}25`,textAlign:"center"}}>
                      <p style={{fontFamily:G.fontDisp,fontSize:12,color:p.color,letterSpacing:"0.08em"}}>{p.label}</p>
                      <p style={{fontSize:9,color:G.textDim,marginTop:2}}>{BEAT_SHEET.filter(b=>b.act===p.acts).length} beat</p>
                    </div>
                  ))}
                </div>

                {Object.keys(beatler).length===0&&!beatYukleniyor&&(
                  <div style={{textAlign:"center",padding:"40px 0",color:G.textMuted}}>
                    <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:10,letterSpacing:"0.1em"}}>BEAT SHEET</div>
                    <p style={{fontSize:13}}>Save the Cat yöntemiyle 15 adımlık yapı</p>
                  </div>
                )}
                {beatYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}

                {BEAT_SHEET.map(beat=>{
                  var actColors={1:G.gold,2:G.purple,3:G.red};
                  var col=actColors[beat.act];
                  return(
                    <div key={beat.id} style={{marginBottom:10,padding:"14px 16px",background:"rgba(245,240,232,0.03)",borderRadius:14,border:`1px solid ${G.border}`,borderLeft:`3px solid ${col}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:beatler[beat.id]?8:0}}>
                        <span style={{width:22,height:22,borderRadius:"50%",background:`${col}20`,color:col,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:G.fontDisp}}>{beat.no}</span>
                        <div style={{flex:1}}>
                          <p style={{fontSize:13,fontWeight:700,color:G.text}}>{beat.label}</p>
                          <p style={{fontSize:11,color:G.textDim}}>{beat.aciklama}</p>
                        </div>
                        {beatler[beat.id]&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:`${col}15`,color:col,fontWeight:700}}>✓</span>}
                      </div>
                      {beatler[beat.id]&&<p style={{fontSize:13,color:G.textMuted,lineHeight:1.65,paddingLeft:30}}>{beatler[beat.id]}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Karakterler sekmesi ── */}
            {sekme==="karakterler"&&(
              <div style={{background:"linear-gradient(145deg,#161616,#111)",border:`1px solid ${G.border}`,borderRadius:20,padding:"22px",marginBottom:16,position:"relative"}}>
                <FilmCorners/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                  <div><h3 style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.08em",color:G.text}}>CHARACTER BIBLE</h3><p style={{fontSize:11,color:G.textMuted}}>Karakter profilleri & psikoloji</p></div>
                  <AIBtn onClick={karakterBibleUret} loading={bibleYukleniyor} loadLabel="Oluşturuluyor" label="✨ Oluştur" color={`linear-gradient(135deg,${G.purple},${G.purpleL})`}/>
                </div>

                {!karakterBible&&!bibleYukleniyor&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:10,letterSpacing:"0.1em"}}>KARAKTERLER</div><p style={{fontSize:13,color:G.textMuted}}>Karakter profillerini oluştur</p></div>}
                {bibleYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.purple,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}

                {karakterBible?.karakterler?.map((k,i)=>(
                  <div key={i} style={{marginBottom:16,padding:"18px",background:`${G.purple}06`,border:`1px solid ${G.purple}20`,borderRadius:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${G.purple},${G.purpleL})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:G.fontDisp,fontSize:20,fontWeight:800,flexShrink:0}}>{(k.ad||"?")[0]}</div>
                      <div><p style={{fontSize:16,fontWeight:800,color:G.text}}>{k.ad}</p><p style={{fontSize:12,color:G.textMuted}}>{k.yas} · {k.meslek}</p></div>
                    </div>
                    {[{icon:"🎯",label:"Hedef",val:k.hedef},{icon:"😨",label:"Korku",val:k.korku},{icon:"🤫",label:"Sır",val:k.sir},{icon:"💪",label:"Güç",val:k.guc},{icon:"⚠️",label:"Zayıflık",val:k.zayiflik},{icon:"🌱",label:"Karakter Yayı",val:k.arc},{icon:"💬",label:"Diyalog Tonu",val:k.diyalog_tonu}].map(item=>!item.val?null:(
                      <div key={item.label} style={{display:"flex",gap:10,marginBottom:8,padding:"8px 10px",background:"rgba(245,240,232,0.03)",borderRadius:10}}>
                        <span style={{fontSize:14,flexShrink:0}}>{item.icon}</span>
                        <div><p style={{fontSize:10,fontWeight:700,color:G.purple,textTransform:"uppercase",letterSpacing:"0.06em"}}>{item.label}</p><p style={{fontSize:13,color:G.text,lineHeight:1.5,marginTop:1}}>{item.val}</p></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* ── AI Dramaturg sekmesi ── */}
            {sekme==="dramaturg"&&(
              <div style={{background:"linear-gradient(145deg,#161616,#111)",border:`1px solid ${G.border}`,borderRadius:20,padding:"22px",marginBottom:16,position:"relative"}}>
                <FilmCorners/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                  <div><h3 style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.08em",color:G.text}}>AI DRAMATURG</h3><p style={{fontSize:11,color:G.textMuted}}>Türk TV sektörüne özel analiz</p></div>
                  <AIBtn onClick={dramaturgCalistir} loading={dramaturgYukleniyor} loadLabel="Analiz ediliyor" label="✨ Analiz" color={`linear-gradient(135deg,${G.amber},#b7950b)`}/>
                </div>

                {!dramaturgAnaliz&&!dramaturgYukleniyor&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:10,letterSpacing:"0.1em"}}>DRAMATURG</div><p style={{fontSize:13,color:G.textMuted}}>Gerilim, karakter motivasyonu, Türk izleyici uyumu</p></div>}
                {dramaturgYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.amber,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}

                {dramaturgAnaliz&&(
                  <div>
                    <div style={{textAlign:"center",marginBottom:20,padding:"20px",background:`${G.amber}10`,borderRadius:16,border:`1px solid ${G.amber}25`}}>
                      <div style={{fontFamily:G.fontDisp,fontSize:56,color:G.amber,lineHeight:1}}>{dramaturgAnaliz.genel_puan}</div>
                      <p style={{fontSize:12,color:G.textMuted,marginTop:4}}>Genel Dramaturg Puanı</p>
                    </div>
                    {dramaturgAnaliz.turk_dizi_uyumu&&<div style={{marginBottom:12,padding:"14px",background:`${G.gold}08`,border:`1px solid ${G.gold}20`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>🇹🇷 Türk Dizisi Uyumu</p><p style={{fontSize:13,color:G.text,lineHeight:1.6}}>{dramaturgAnaliz.turk_dizi_uyumu}</p></div>}
                    {dramaturgAnaliz.gerilim_analizi&&<div style={{marginBottom:12,padding:"14px",background:"rgba(245,240,232,0.03)",border:`1px solid ${G.border}`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.textDim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>⚡ Gerilim Analizi</p><p style={{fontSize:13,color:G.text,lineHeight:1.6}}>{dramaturgAnaliz.gerilim_analizi}</p></div>}
                    {dramaturgAnaliz.guc_noktalari?.length>0&&<div style={{marginBottom:12,padding:"14px",background:`${G.green}08`,border:`1px solid ${G.green}20`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.green,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>✅ Güçlü Noktalar</p>{dramaturgAnaliz.guc_noktalari.map((g,i)=><p key={i} style={{fontSize:13,color:G.text,lineHeight:1.5,marginBottom:4}}>• {g}</p>)}</div>}
                    {dramaturgAnaliz.zayif_noktalar?.length>0&&<div style={{marginBottom:12,padding:"14px",background:`${G.red}08`,border:`1px solid ${G.red}20`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.red,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>⚠️ Zayıf Noktalar</p>{dramaturgAnaliz.zayif_noktalar.map((z,i)=><p key={i} style={{fontSize:13,color:G.text,lineHeight:1.5,marginBottom:4}}>• {z}</p>)}</div>}
                    {[dramaturgAnaliz.oneri_1,dramaturgAnaliz.oneri_2,dramaturgAnaliz.oneri_3].filter(Boolean).length>0&&<div style={{padding:"14px",background:`${G.purple}08`,border:`1px solid ${G.purple}20`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.purple,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>💡 Öneriler</p>{[dramaturgAnaliz.oneri_1,dramaturgAnaliz.oneri_2,dramaturgAnaliz.oneri_3].filter(Boolean).map((o,i)=><p key={i} style={{fontSize:13,color:G.text,lineHeight:1.5,marginBottom:6}}>{i+1}. {o}</p>)}</div>}
                  </div>
                )}
              </div>
            )}

            {/* ── AI Puan sekmesi ── */}
            {sekme==="puan"&&(
              <div style={{background:"linear-gradient(145deg,#161616,#111)",border:`1px solid ${G.border}`,borderRadius:20,padding:"22px",marginBottom:16,position:"relative"}}>
                <FilmCorners/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                  <div><h3 style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.08em",color:G.text}}>AI PUAN</h3><p style={{fontSize:11,color:G.textMuted}}>Yapımcı gözüyle değerlendir</p></div>
                  <AIBtn onClick={puanHesapla} loading={puanYukleniyor} loadLabel="Hesaplanıyor" label="⭐ Değerlendir" color={`linear-gradient(135deg,${G.amber},#b7950b)`}/>
                </div>

                {!puan&&!puanYukleniyor&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:10,letterSpacing:"0.1em"}}>PUAN</div><p style={{fontSize:13,color:G.textMuted}}>IMDb tahmini, ticari potansiyel, Netflix uyumu</p></div>}
                {puanYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.amber,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}

                {puan&&(
                  <div>
                    <div style={{textAlign:"center",marginBottom:20,padding:"24px",background:`linear-gradient(135deg,${G.amber}15,${G.red}08)`,borderRadius:18,border:`1px solid ${G.amber}30`}}>
                      <div style={{fontFamily:G.fontDisp,fontSize:72,color:G.amber,lineHeight:1}}>{puan.toplam}</div>
                      <p style={{fontSize:13,color:G.textMuted,marginTop:4}}>/ 100 Toplam Puan</p>
                      <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:16}}>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontFamily:G.fontDisp,fontSize:26,color:G.text}}>{puan.imdb_tahmin}</div>
                          <p style={{fontSize:10,color:G.textDim}}>IMDb Tahmini</p>
                        </div>
                        <div style={{width:1,background:G.border}}/>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontFamily:G.fontDisp,fontSize:22,color:puan.netflix_uygun_mu?G.green:G.red}}>{puan.netflix_uygun_mu?"✓ UYGUN":"✗ UYGUN DEĞİL"}</div>
                          <p style={{fontSize:10,color:G.textDim}}>Netflix</p>
                        </div>
                      </div>
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                      {[{label:"Orijinallik",val:puan.orijinallik,max:25,color:G.purple},{label:"Ticari Potansiyel",val:puan.ticari_potansiyel,max:25,color:G.gold},{label:"Karakter Derinliği",val:puan.karakter_derinligi,max:25,color:G.green},{label:"Anlatım",val:puan.anlatim,max:25,color:G.amber}].map(k=>(
                        <div key={k.label} style={{padding:"14px",background:"rgba(245,240,232,0.03)",borderRadius:14,border:`1px solid ${G.border}`}}>
                          <p style={{fontSize:10,color:G.textDim,marginBottom:4}}>{k.label}</p>
                          <div style={{fontFamily:G.fontDisp,fontSize:26,color:k.color}}>{k.val}<span style={{fontSize:11,color:G.textDim}}>/{k.max}</span></div>
                          <PuanCubugu val={k.val} max={k.max} color={k.color}/>
                        </div>
                      ))}
                    </div>

                    {puan.benzer_yapimlar?.length>0&&<div style={{marginBottom:10,padding:"12px 14px",background:"rgba(245,240,232,0.03)",borderRadius:12,border:`1px solid ${G.border}`}}><p style={{fontSize:10,fontWeight:700,color:G.textDim,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>🎬 Benzer Yapımlar</p><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{puan.benzer_yapimlar.map((y,i)=><span key={i} style={{fontSize:11,padding:"4px 12px",borderRadius:20,background:`${G.gold}12`,color:G.gold,fontWeight:600}}>{y}</span>)}</div></div>}
                    {puan.yapimci_yorumu&&<div style={{padding:"14px",background:`linear-gradient(135deg,${G.amber}08,${G.red}05)`,border:`1px solid ${G.amber}20`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.amber,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>💼 Yapımcı Yorumu</p><p style={{fontSize:13,color:G.text,lineHeight:1.7,fontStyle:"italic"}}>"{puan.yapimci_yorumu}"</p></div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AltNav/>
      {drawer&&<Drawer user={user} username={username} avatarUrl={avatarUrl} onClose={()=>setDrawer(false)}/>}
      {kartModal&&<KartModal/>}
    </div>
  );
}
