import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

var G = {
  black:"#0A0F1E", deep:"#0F172A", surface:"#1E293B", card:"#162032",
  border:"rgba(56,189,248,0.12)", borderHov:"rgba(56,189,248,0.4)",
  blue:"#38BDF8", blueL:"#7DD3FC", blueD:"#0EA5E9",
  blueGrad:"linear-gradient(135deg,#0EA5E9 0%,#38BDF8 40%,#7DD3FC 70%,#0EA5E9 100%)",
  purple:"#8B5CF6", purpleL:"#A78BFA", purpleD:"#7C3AED",
  purpleGrad:"linear-gradient(135deg,#7C3AED 0%,#8B5CF6 50%,#A78BFA 100%)",
  red:"#EF4444", redL:"#F87171",
  green:"#22C55E", greenL:"#4ADE80",
  amber:"#F59E0B", amberL:"#FCD34D",
  text:"#F1F5F9", textMuted:"rgba(241,245,249,0.5)", textDim:"rgba(241,245,249,0.25)",
  shadow:"0 8px 40px rgba(0,0,0,0.7)",
  glowBlue:"0 0 24px rgba(56,189,248,0.25)",
  glowPurple:"0 0 24px rgba(139,92,246,0.25)",
  glowRed:"0 0 16px rgba(239,68,68,0.3)",
  glowGreen:"0 0 16px rgba(34,197,94,0.3)",
  glowAmber:"0 0 16px rgba(245,158,11,0.3)",
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

function Icon({id,size=22,color="currentColor",strokeWidth=1.8}){
  var p={width:size,height:size,fill:"none",stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="logout")return<svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  if(id==="download")return<svg {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
  if(id==="share")return<svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
  if(id==="save")return<svg {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
  if(id==="check")return<svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
  if(id==="zap")return<svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  if(id==="arrow-left")return<svg {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
  if(id==="cpu")return<svg {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
  return null;
}

function NeonCorners({color=G.blue,size=12,thickness=1.5}){
  var s={position:"absolute",width:size,height:size};
  var l={background:color,position:"absolute",boxShadow:`0 0 6px ${color}80`};
  return(<>
    <div style={{...s,top:0,left:0}}><div style={{...l,top:0,left:0,width:thickness,height:size}}/><div style={{...l,top:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,top:0,right:0}}><div style={{...l,top:0,right:0,width:thickness,height:size}}/><div style={{...l,top:0,right:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,left:0}}><div style={{...l,bottom:0,left:0,width:thickness,height:size}}/><div style={{...l,bottom:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,right:0}}><div style={{...l,bottom:0,right:0,width:thickness,height:size}}/><div style={{...l,bottom:0,right:0,width:size,height:thickness}}/></div>
  </>);
}

function Av({url,size}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${G.deep},${G.surface})`,border:`1.5px solid rgba(56,189,248,0.25)`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.42} color="rgba(56,189,248,0.4)"/>}
    </div>
  );
}

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
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,5,20,0.85)",backdropFilter:"blur(8px)"}}/>
    <div style={{position:"fixed",top:0,left:0,bottom:0,zIndex:201,width:290,background:`linear-gradient(180deg,${G.black},${G.deep})`,borderRight:`1px solid ${G.border}`,display:"flex",flexDirection:"column",boxShadow:"8px 0 60px rgba(0,0,0,0.9)"}}>
      <div style={{height:2,background:G.blueGrad,flexShrink:0,boxShadow:`0 0 20px rgba(56,189,248,0.5)`}}/>
      <div style={{padding:"20px 20px 16px",borderBottom:`1px solid ${G.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <Av url={avatarUrl} size={48}/>
          <button onClick={onClose} style={{background:`${G.blue}08`,border:`1px solid ${G.border}`,borderRadius:10,padding:"6px 12px",color:G.textMuted,fontSize:12,cursor:"pointer"}}>ESC</button>
        </div>
        {user?<p style={{fontSize:15,fontWeight:800,color:G.text}}>@{username}</p>
          :<button onClick={()=>{onClose();window.location.href="/";}} style={{width:"100%",padding:"10px",borderRadius:12,background:G.blueGrad,border:"none",color:G.black,fontSize:13,fontWeight:800,textTransform:"uppercase",cursor:"pointer"}}>Giriş Yap</button>}
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"12px"}}>
        {DRAWER_ITEMS.map(item=>{
          var active=typeof window!=="undefined"&&window.location.pathname===item.href;
          return(
            <a key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,marginBottom:2,color:active?G.blue:G.textMuted,background:active?`${G.blue}08`:"transparent",fontWeight:active?700:500,fontSize:14,border:`1px solid ${active?G.border:"transparent"}`,textDecoration:"none"}}>
              <Icon id={item.id} size={18} color={active?G.blue:G.textMuted}/>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge&&<span style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,background:G.purple,color:"#fff"}}>{item.badge}</span>}
            </a>
          );
        })}
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${G.border}`}}>
          <a href="/profil" style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,color:G.textMuted,fontSize:14,textDecoration:"none"}}><Icon id="user" size={18} color={G.textMuted}/><span>Profil</span></a>
          {user&&<button onClick={()=>setExitModal(true)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,color:G.red,fontSize:14,background:`${G.red}08`,border:"none",width:"100%",textAlign:"left",cursor:"pointer"}}><Icon id="logout" size={18} color={G.red}/><span style={{fontWeight:600}}>Çıkış Yap</span></button>}
        </div>
      </nav>
    </div>
    {exitModal&&<>
      <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:301,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{background:G.surface,border:`1px solid ${G.borderHov}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:300,textAlign:"center",position:"relative",boxShadow:G.glowRed}}>
          <NeonCorners color={G.red}/>
          <h3 style={{fontFamily:G.fontDisp,fontSize:22,color:G.text,marginBottom:8}}>ÇIKIŞ YAP</h3>
          <p style={{fontSize:13,color:G.textMuted,marginBottom:22}}>Emin misin?</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setExitModal(false)} style={{flex:1,padding:"12px",borderRadius:12,background:"rgba(241,245,249,0.05)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:13,fontWeight:600,cursor:"pointer"}}>İptal</button>
            <button onClick={()=>{supabase.auth.signOut();onClose();window.location.href="/";}} style={{flex:1,padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${G.red},${G.redL})`,border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Çıkış</button>
          </div>
        </div>
      </div>
    </>}
  </>);
}

function AltNav(){
  var items=[{href:"/",id:"home"},{href:"/kesfet",id:"compass"},{href:"/topluluk",id:"users"},{href:"/mesajlar",id:"chat"},{href:"/profil",id:"user"}];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"8px 0 env(safe-area-inset-bottom,10px)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}30,transparent)`}}/>
      {items.map(item=>(
        <a key={item.href} href={item.href} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px",borderRadius:12,opacity:0.35}}>
          <Icon id={item.id} size={22} color="#94A3B8"/>
        </a>
      ))}
    </div>
  );
}

function SecBtn({aktif,onClick,children,color=G.blue}){
  return(
    <button onClick={onClick} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${aktif?color:G.border}`,background:aktif?color+"15":"transparent",color:aktif?color:G.textMuted,fontSize:12,fontWeight:aktif?700:500,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap",boxShadow:aktif?`0 0 10px ${color}20`:"none"}}>
      {children}
    </button>
  );
}

function SecBaslik({label,info}){
  return(
    <div style={{marginBottom:10}}>
      <p style={{fontSize:10,fontWeight:700,color:G.blue,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</p>
      {info&&<p style={{fontSize:11,color:G.textDim,marginTop:2}}>{info}</p>}
    </div>
  );
}

function PuanCubugu({val,max,color}){
  return(
    <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden",marginTop:8}}>
      <div style={{height:"100%",width:(val/max*100)+"%",background:color,borderRadius:2,transition:"width 1s ease",boxShadow:`0 0 6px ${color}60`}}/>
    </div>
  );
}

function AIBtn({onClick,loading,loadLabel,label,color=G.blueGrad,glow=G.glowBlue}){
  return(
    <button onClick={onClick} disabled={loading} style={{padding:"9px 18px",borderRadius:12,background:loading?G.surface:color,border:`1px solid ${loading?G.border:"transparent"}`,color:loading?G.textMuted:"#0A0F1E",fontSize:12,fontWeight:800,cursor:loading?"default":"pointer",letterSpacing:"0.04em",transition:"all 0.2s",display:"flex",alignItems:"center",gap:8,textTransform:"uppercase",boxShadow:loading?"none":glow}}>
      {loading?<><div style={{width:14,height:14,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>{loadLabel}</>:label}
    </button>
  );
}

var KART={background:`linear-gradient(145deg,#1E293B,#162032)`,border:`1px solid rgba(56,189,248,0.12)`,borderRadius:20,padding:"22px",marginBottom:16,position:"relative"};

export default function Uret(){
  var {user, profil, authHazir, okunmayanBildirim} = useAuth();
  var [tip,setTip]=useState("Dizi");
  var [tur,setTur]=useState("Gerilim");
  var [ozelIstek,setOzelIstek]=useState("");
  var [yukleniyor,setYukleniyor]=useState(false);
  var [senaryo,setSenaryo]=useState(null);
  var [kaydedildi,setKaydedildi]=useState(false);
  var [arsivAcik,setArsivAcik]=useState(false);
  var [arsiv,setArsiv]=useState([]);
  var [arsivYukleniyor,setArsivYukleniyor]=useState(false);
  var [arsivKaydediliyor,setArsivKaydediliyor]=useState(false);
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
  var [drawer,setDrawer]=useState(false);
  var [kalanUretim,setKalanUretim]=useState(null); // null = bilinmiyor, sayı = kalan hak
  var [limitDoldu,setLimitDoldu]=useState(false);
  var [sahneSayisi,setSahneSayisi]=useState(5);
  var [karakterSayisi,setKarakterSayisi]=useState(3);
  var [revizeYukleniyor,setRevizeYukleniyor]=useState(false);
  var [diyalogYukleniyor,setDiyalogYukleniyor]=useState(false);
  var [diyalogSonuc,setDiyalogSonuc]=useState(null);
  var [diyalogMetin,setDiyalogMetin]=useState("");
  var [logline,setLogline]=useState(null);
  var [loglineYukleniyor,setLoglineYukleniyor]=useState(false);
  var [pitchDeck,setPitchDeck]=useState(null);
  var [pitchYukleniyor,setPitchYukleniyor]=useState(false);
  var [heroJourney,setHeroJourney]=useState(null);
  var [heroYukleniyor,setHeroYukleniyor]=useState(false);

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
  },[]);

  // Supabase session token'ını al — API çağrıları için
  async function getToken(){
    try{
      var { data } = await supabase.auth.getSession();
      return data?.session?.access_token || null;
    }catch(e){ return null; }
  }

  // Auth header'lı fetch yardımcısı
  async function authFetch(url, body){
    var token = await getToken();
    var headers = {"Content-Type":"application/json"};
    if(token) headers["Authorization"] = "Bearer " + token;
    return fetch(url, {method:"POST", headers, body:JSON.stringify(body)});
  }

  async function senaryoUret(){
    if(limitDoldu) return;
    setYukleniyor(true);setSenaryo(null);setBeatler({});setKarakterBible(null);setDraturagAnaliz(null);setPuan(null);setSequel(null);setSekme("senaryo");setLogline(null);setPitchDeck(null);setDiyalogSonuc(null);setHeroJourney(null);
    try{
      var res=await authFetch("/api/generate", {tip,tur,ozelIstek,sahneSayisi,karakterSayisi});
      // Kalan üretim hakkını header'dan oku
      var kalan=res.headers.get("X-Kalan-Uretim");
      if(kalan!==null) setKalanUretim(parseInt(kalan));
      var data=await res.json();
      if(res.status===429){
        setLimitDoldu(true);
        setKalanUretim(0);
      }else if(data.senaryo){
        setSenaryo(data.senaryo);
      }else{
        alert("Senaryo oluşturulamadı.");
      }
    }catch(e){alert("Hata: "+e.message);}
    setYukleniyor(false);
  }
  async function beatUret(){if(!senaryo)return;setBeatYukleniyor(true);try{var res=await authFetch("/api/beatsheet", {senaryo,tip,tur}));setBeatler(await res.json());}catch(e){}setBeatYukleniyor(false);}
  async function karakterBibleUret(){if(!senaryo)return;setBibleYukleniyor(true);try{var res=await authFetch("/api/karakterbible", {senaryo,tur}));setKarakterBible(await res.json());}catch(e){}setBibleYukleniyor(false);}
  async function dramaturgCalistir(){if(!senaryo)return;setDraturagYukleniyor(true);try{var res=await authFetch("/api/dramaturg", {senaryo,tip,tur}));setDraturagAnaliz(await res.json());}catch(e){}setDraturagYukleniyor(false);}
  async function puanHesapla(){if(!senaryo)return;setPuanYukleniyor(true);try{var res=await authFetch("/api/puan", {senaryo,tip,tur}));setPuan(await res.json());}catch(e){}setPuanYukleniyor(false);}
  async function sequelUret(){
    if(!senaryo)return;setSequelYukleniyor(true);setSequel(null);
    try{var res=await authFetch("/api/generate", {tip,tur,ozelIstek:`Bu senaryonun devamını yaz: "${senaryo.baslik}". Tagline: ${senaryo.tagline}. Ana fikir: ${senaryo.ana_fikir?.slice(0,200)`})});var data=await res.json();if(data.senaryo)setSequel(data.senaryo);}catch(e){}
    setSequelYukleniyor(false);
  }
  // Revize — senaryoyu yeniden yaz
  async function revizeEt(){
    if(!senaryo)return;
    setRevizeYukleniyor(true);
    try{
      var res=await authFetch("/api/generate", {tip,tur,ozelIstek:`Şu senaryoyu tamamen revize et, daha güçlü, daha özgün ve daha çarpıcı yap. Aynı temayı koru ama tüm unsurları yenile: "${senaryo.baslik}" — ${senaryo.ana_fikir?.slice(0,200)`})});
      var data=await res.json();
      if(data.senaryo)setSenaryo(data.senaryo);
    }catch(e){}
    setRevizeYukleniyor(false);
  }

  // Diyalog güçlendirici
  async function diyalogGuclendir(){
    if(!diyalogMetin.trim())return;
    setDiyalogYukleniyor(true);
    try{
      var res=await authFetch("/api/diyalog", {metin:diyalogMetin,tur}));
      var data=await res.json();
      setDiyalogSonuc(data.sonuc||"");
    }catch(e){alert("Hata: "+e.message);}
    setDiyalogYukleniyor(false);
  }

  // Logline üretici
  async function loglineUret(){
    if(!senaryo)return;
    setLoglineYukleniyor(true);
    try{
      var res=await authFetch("/api/logline", {senaryo,tur,tip}));
      var data=await res.json();
      if(data.logline1)setLogline(data);
    }catch(e){}
    setLoglineYukleniyor(false);
  }

  // Pitch deck üretici
  async function pitchDeckUret(){
    if(!senaryo)return;
    setPitchYukleniyor(true);
    try{
      var res=await authFetch("/api/pitch", {senaryo,tur,tip}));
      var data=await res.json();
      if(data.one_liner)setPitchDeck(data);
    }catch(e){}
    setPitchYukleniyor(false);
  }

  async function heroJourneyUret(){
    if(!senaryo)return;
    setHeroYukleniyor(true);
    try{
      var res=await authFetch("/api/herosjourney", {senaryo,tur,tip}));
      var data=await res.json();
      if(data.olagan_dunya)setHeroJourney(data);
    }catch(e){}
    setHeroYukleniyor(false);
  }


  // Arşivi yükle
  async function arsivYukle(){
    if(!user) return;
    setArsivYukleniyor(true);
    var {data} = await supabase.from("senaryo_versiyonlar")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {ascending:false})
      .limit(50);
    if(data) setArsiv(data);
    setArsivYukleniyor(false);
  }

  // Versiyonu arşive kaydet
  async function versiyonKaydet(){
    if(!user||!senaryo||arsivKaydediliyor) return;
    setArsivKaydediliyor(true);
    await supabase.from("senaryo_versiyonlar").insert({
      user_id:    user.id,
      tip,
      tur,
      baslik:     senaryo.baslik,
      tagline:    senaryo.tagline,
      veri:       JSON.stringify({
        senaryo,
        beatler:        Object.keys(beatler).length>0 ? beatler : null,
        karakterBible:  karakterBible || null,
        heroJourney:    heroJourney || null,
        logline:        logline || null,
        pitchDeck:      pitchDeck || null,
        dramaturgAnaliz:dramaturgAnaliz || null,
        puan:           puan || null,
      }),
    });
    // Arşivi güncelle
    await arsivYukle();
    setArsivKaydediliyor(false);
  }

  // Versiyonu geri yükle
  function versiyonYukle(versiyon){
    try{
      var veri = JSON.parse(versiyon.veri);
      setSenaryo(veri.senaryo || null);
      setBeatler(veri.beatler || {});
      setKarakterBible(veri.karakterBible || null);
      setHeroJourney(veri.heroJourney || null);
      setLogline(veri.logline || null);
      setPitchDeck(veri.pitchDeck || null);
      setDraturagAnaliz(veri.dramaturgAnaliz || null);
      setPuan(veri.puan || null);
      setSekme("senaryo");
      setArsivAcik(false);
    }catch(e){
      alert("Versiyon yüklenemedi: " + e.message);
    }
  }

  // Versiyonu sil
  async function versiyonSil(id){
    if(!confirm("Bu versiyonu silmek istediğine emin misin?")) return;
    await supabase.from("senaryo_versiyonlar").delete().eq("id", id).eq("user_id", user.id);
    setArsiv(prev => prev.filter(v => v.id !== id));
  }

  async function profilKaydet(){
    if(!user||!senaryo)return;
    await supabase.from("senaryolar").insert([{user_id:user.id,tip,tur,baslik:senaryo.baslik,tagline:senaryo.tagline,ana_fikir:senaryo.ana_fikir,karakter:senaryo.karakter,sahne:senaryo.acilis_sahnesi,soru:senaryo.buyuk_soru,paylasim_acik:paylasimAcik,begeni_sayisi:0}]);
    setKaydedildi(true);
  }

  function fdxIndir(){
    if(!senaryo)return;
    var baslik=(senaryo.baslik||"Senaryo").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

    function fdxParagraph(tip,metin){
      var temiz=(metin||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      return `<Paragraph Type="${tip}"><Text>${temiz}</Text></Paragraph>\n`;
    }

    var icerik=`<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="2">
<Content>
${fdxParagraph("Title Page","SCRIPTIFY — AI SENARYO PLATFORMU")}
${fdxParagraph("Title Page",baslik)}
${senaryo.tagline?fdxParagraph("Title Page",`"${senaryo.tagline.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}"`):""}
${fdxParagraph("Scene Heading","FADE IN:")}
${senaryo.acilis_sahnesi?fdxParagraph("Action",senaryo.acilis_sahnesi):""}
${senaryo.ana_fikir?fdxParagraph("Action",senaryo.ana_fikir):""}
${senaryo.karakter?fdxParagraph("Action","KARAKTERLER:\n"+senaryo.karakter):""}
${senaryo.buyuk_soru?fdxParagraph("Action","BÜYÜK SORU: "+senaryo.buyuk_soru):""}
${Object.keys(beatler).length>0?BEAT_SHEET.filter(b=>beatler[b.id]).map(b=>
  fdxParagraph("Scene Heading",b.no+". "+b.label.toUpperCase())+
  fdxParagraph("Action",beatler[b.id])
).join(""):""}
${fdxParagraph("Scene Heading","FADE OUT.")}
${fdxParagraph("Title Page","Oluşturulma: "+new Date().toLocaleDateString("tr-TR")+" | Scriptify AI Senaryo Platformu")}
</Content>
</FinalDraft>`;

    var blob=new Blob([icerik],{type:"text/xml;charset=utf-8"});
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");
    a.href=url;
    a.download=(senaryo.baslik||"senaryo").replace(/\s+/g,"_")+".fdx";
    a.click();
    URL.revokeObjectURL(url);
  }


  async function pdfIndir(){
    if(!senaryo)return;
    // jsPDF CDN'den yükle
    if(typeof window.jspdf === "undefined"){
      await new Promise((res,rej)=>{
        var s=document.createElement("script");
        s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        s.onload=res; s.onerror=rej;
        document.head.appendChild(s);
      });
    }
    var {jsPDF}=window.jspdf;
    var doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
    var W=210; var margin=20; var x=margin; var y=30;
    var lineH=6; var maxW=W-margin*2;

    function addText(text,size,color,bold,italic){
      doc.setFontSize(size||11);
      doc.setTextColor(...(color||[241,245,249]));
      doc.setFont("helvetica", bold?"bold":italic?"italic":"normal");
      if(y>270){doc.addPage();y=20;drawBg();}
      var lines=doc.splitTextToSize(String(text||""),maxW);
      lines.forEach(line=>{
        if(y>270){doc.addPage();y=20;drawBg();}
        doc.text(line,x,y);
        y+=lineH;
      });
      y+=2;
    }

    function drawBg(){
      doc.setFillColor(10,15,30);
      doc.rect(0,0,210,297,"F");
      // Neon üst çizgi
      doc.setDrawColor(56,189,248);
      doc.setLineWidth(0.5);
      doc.line(margin,12,W-margin,12);
      doc.line(margin,285,W-margin,285);
    }

    function addSection(label,val,col){
      if(!val)return;
      y+=3;
      doc.setFillColor(...(col||[56,189,248]),20);
      doc.roundedRect(margin-2,y-4,maxW+4,8,2,2,"F");
      doc.setFontSize(8); doc.setTextColor(...(col||[56,189,248]));
      doc.setFont("helvetica","bold");
      doc.text(label,x,y+1);
      y+=8;
      addText(val,11,[200,220,240]);
    }

    // Arkaplan
    drawBg();

    // SCRIPTIFY logo
    doc.setFontSize(9); doc.setTextColor(56,189,248);
    doc.setFont("helvetica","bold");
    doc.text("SCRIPTIFY — AI SENARYO PLATFORMU",x,10);

    // Başlık
    addText(senaryo.baslik,24,[56,189,248],true);
    y-=2;

    // Badge'ler
    doc.setFontSize(8); doc.setTextColor(139,92,246);
    doc.text(tip+" · "+tur,x,y); y+=8;

    // Tagline
    if(senaryo.tagline){ doc.setFontSize(11); doc.setTextColor(125,211,252); doc.setFont("helvetica","italic"); doc.text('"'+senaryo.tagline+'"',x,y); y+=10; }

    // İçerik bölümleri
    addSection("ANA FİKİR",senaryo.ana_fikir,[56,189,248]);
    addSection("KARAKTERLER",senaryo.karakter,[139,92,246]);
    addSection("AÇILIŞ SAHNESİ",senaryo.acilis_sahnesi,[56,189,248]);
    addSection("BÜYÜK SORU",senaryo.buyuk_soru,[245,158,11]);

    // Beat Sheet
    if(Object.keys(beatler).length>0){
      y+=6;
      addText("SAHNE PLANI — SAVE THE CAT",13,[56,189,248],true);
      var actCol={1:[56,189,248],2:[139,92,246],3:[239,68,68]};
      BEAT_SHEET.forEach(b=>{
        if(beatler[b.id]){
          y+=2;
          doc.setFontSize(9); doc.setTextColor(...actCol[b.act]); doc.setFont("helvetica","bold");
          doc.text(b.no+". "+b.label.toUpperCase(),x,y); y+=5;
          addText(beatler[b.id],10,[180,200,220]);
        }
      });
    }

    // Karakter Dosyası
    if(karakterBible?.karakterler?.length>0){
      if(y>200){doc.addPage();y=20;drawBg();}
      addText("KARAKTER DOSYASI",13,[139,92,246],true);
      karakterBible.karakterler.forEach(k=>{
        y+=2;
        doc.setFontSize(11); doc.setTextColor(167,139,250); doc.setFont("helvetica","bold");
        doc.text(k.ad+(k.yas?" · "+k.yas:"")+(k.meslek?" · "+k.meslek:""),x,y); y+=6;
        if(k.hedef)addText("Hedef: "+k.hedef,9,[180,200,220]);
        if(k.korku)addText("Korku: "+k.korku,9,[180,200,220]);
        if(k.arc)addText("Karakter Yayı: "+k.arc,9,[180,200,220]);
        y+=2;
      });
    }

    // Alt bilgi
    var pageCount=doc.internal.getNumberOfPages();
    for(var i=1;i<=pageCount;i++){
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(56,189,248,0.4);
      doc.text("scriptify.app",margin,291);
      doc.text(new Date().toLocaleDateString("tr-TR"),W-margin,291,{align:"right"});
      doc.text("Sayfa "+i+"/"+pageCount,W/2,291,{align:"center"});
    }

    doc.save((senaryo.baslik||"senaryo").replace(/\s+/g,"_")+".pdf");
  }

  async function txtIndir(){
    if(!senaryo)return;
    var icerik=`SCRIPTIFY — SENARYO\n${"=".repeat(50)}\n\nBaşlık: ${senaryo.baslik}\nTür: ${tur} | Format: ${tip}\n${senaryo.tagline?`Tagline: "${senaryo.tagline}"\n`:""}\n${"─".repeat(40)}\n\n`+
      (senaryo.ana_fikir?`ANA FİKİR\n${senaryo.ana_fikir}\n\n`:"")+
      (senaryo.karakter?`KARAKTERLER\n${senaryo.karakter}\n\n`:"")+
      (senaryo.acilis_sahnesi?`AÇILIŞ SAHNESİ\n${senaryo.acilis_sahnesi}\n\n`:"")+
      (senaryo.buyuk_soru?`BÜYÜK SORU\n${senaryo.buyuk_soru}\n\n`:"")+
      (Object.keys(beatler).length>0?`\n${"─".repeat(40)}\nSAHNE PLANI\n`+BEAT_SHEET.map(b=>`\n${b.no}. ${b.label}\n${beatler[b.id]||"-"}`).join("\n")+"\n":"")+
      `\nOluşturulma: ${new Date().toLocaleDateString("tr-TR")}\nScriptify\n`;
    var blob=new Blob(["\uFEFF"+icerik],{type:"text/plain;charset=utf-8"});
    var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download=(senaryo.baslik||"senaryo").replace(/\s+/g,"_")+".txt";a.click();URL.revokeObjectURL(url);
  }

  function KartModal(){
    useEffect(()=>{
      var canvas=document.getElementById("paylasim-karti");if(!canvas||!senaryo)return;
      var ctx=canvas.getContext("2d");var W=1080,H=1080;canvas.width=W;canvas.height=H;
      var grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,"#0A0F1E");grad.addColorStop(0.5,"#0F172A");grad.addColorStop(1,"#1E293B");
      ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(56,189,248,0.04)";ctx.lineWidth=1;
      for(var i=0;i<W;i+=60){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}
      for(var j=0;j<H;j+=60){ctx.beginPath();ctx.moveTo(0,j);ctx.lineTo(W,j);ctx.stroke();}
      var lg=ctx.createLinearGradient(60,0,W-60,0);lg.addColorStop(0,"#0EA5E9");lg.addColorStop(0.5,"#38BDF8");lg.addColorStop(1,"#7DD3FC");
      ctx.fillStyle=lg;ctx.fillRect(60,70,W-120,3);ctx.fillRect(60,H-80,W-120,3);
      ctx.font="bold 28px 'Arial Narrow',sans-serif";ctx.fillStyle="#38BDF8";ctx.fillText("SCRIPTIFY",60,140);
      ctx.fillStyle="rgba(56,189,248,0.15)";ctx.beginPath();ctx.roundRect(60,165,160,34,17);ctx.fill();
      ctx.fillStyle="#38BDF8";ctx.font="bold 16px sans-serif";ctx.fillText(tip+" · "+tur,80,188);
      if(puan){ctx.font="bold 22px sans-serif";ctx.fillStyle="#F59E0B";ctx.fillText("⭐ "+puan.imdb_tahmin+" · "+puan.toplam+"/100",60,240);}
      ctx.fillStyle="#F1F5F9";ctx.font="bold 76px 'Arial Narrow',sans-serif";
      var words=(senaryo.baslik||"").split(" ");var lines=[];var line="";
      words.forEach(w=>{var t=line+(line?" ":"")+w;if(ctx.measureText(t).width>W-120){lines.push(line);line=w;}else line=t;});lines.push(line);
      lines.slice(0,3).forEach((l,i)=>ctx.fillText(l,60,(puan?290:310)+i*90));
      if(senaryo.tagline){ctx.font="italic 32px sans-serif";ctx.fillStyle="#38BDF8";ctx.fillText('"'+(senaryo.tagline.slice(0,80))+(senaryo.tagline.length>80?"...":"")+'"',60,590);}
      if(senaryo.ana_fikir){
        ctx.font="26px sans-serif";ctx.fillStyle="rgba(241,245,249,0.5)";
        var af=senaryo.ana_fikir.slice(0,160)+(senaryo.ana_fikir.length>160?"...":"");
        var aw=af.split(" ");var al="";var ay=660;
        aw.forEach(w=>{var t=al+(al?" ":"")+w;if(ctx.measureText(t).width>W-120){ctx.fillText(al,60,ay);ay+=38;al=w;}else al=t;});ctx.fillText(al,60,ay);
      }
      ctx.font="bold 22px sans-serif";ctx.fillStyle="rgba(56,189,248,0.4)";ctx.fillText("scriptify.app",60,H-38);
      if(username){ctx.fillStyle="rgba(56,189,248,0.6)";ctx.textAlign="right";ctx.fillText("@"+username,W-60,H-38);ctx.textAlign="left";}
    },[]);
    function indir(){var c=document.getElementById("paylasim-karti");if(!c)return;var a=document.createElement("a");a.download=(senaryo.baslik||"senaryo").replace(/\s+/g,"_")+"_scriptify.png";a.href=c.toDataURL("image/png");a.click();}
    return(<>
      <div onClick={()=>setKartModal(false)} style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.95)",backdropFilter:"blur(16px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:501,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,gap:16}}>
        <canvas id="paylasim-karti" style={{maxWidth:"100%",maxHeight:"62vh",borderRadius:16,boxShadow:`0 20px 60px rgba(0,0,0,0.8),${G.glowBlue}`}}/>
        <div style={{display:"flex",gap:10}}>
          <button onClick={indir} style={{padding:"13px 24px",borderRadius:14,background:G.blueGrad,border:"none",color:G.black,fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:G.glowBlue}}>📥 İndir</button>
          <button onClick={()=>{var c=document.getElementById("paylasim-karti");if(!c)return;c.toBlob(b=>{var f=new File([b],"scriptify.png",{type:"image/png"});if(navigator.share&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:senaryo.baslik,text:"Scriptify'da ürettiğim senaryo 🎬"});}else{alert("Önce indir!");}});}} style={{padding:"13px 24px",borderRadius:14,background:G.purpleGrad,border:"none",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",boxShadow:G.glowPurple}}>📤 Paylaş</button>
          <button onClick={()=>setKartModal(false)} style={{padding:"13px 18px",borderRadius:14,background:G.surface,border:`1px solid ${G.border}`,color:G.textMuted,fontSize:14,cursor:"pointer"}}>✕</button>
        </div>
      </div>
    </>);
  }

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:90}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.blueD};border-radius:2px;}
        ::selection{background:rgba(56,189,248,0.2);color:${G.blueL};}
        textarea,input{background:${G.surface};border:1px solid ${G.border};border-radius:12px;padding:10px 14px;color:${G.text};font-size:13px;outline:none;font-family:'DM Sans',sans-serif;width:100%;}
        textarea:focus,input:focus{border-color:${G.blueD};box-shadow:0 0 0 2px ${G.blue}15;}
        textarea::placeholder,input::placeholder{color:${G.textDim};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:`rgba(10,15,30,0.95)`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}18,transparent)`,pointerEvents:"none"}}/>
        <button onClick={()=>setDrawer(true)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",padding:0,cursor:"pointer"}}>
          <Av url={avatarUrl} size={34}/>
          <img src="/logo.png" alt="Scriptify" style={{height:44,objectFit:"contain",maxWidth:150}}/>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <a href="/" style={{width:34,height:34,borderRadius:10,background:`${G.blue}08`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon id="arrow-left" size={16} color={G.blue}/>
          </a>
          <span style={{fontFamily:G.fontDisp,fontSize:13,letterSpacing:"0.1em",color:G.blue,background:`${G.blue}12`,border:`1px solid ${G.blue}25`,borderRadius:20,padding:"4px 12px",boxShadow:G.glowBlue}}>AI STÜDYO</span>
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"20px 16px"}}>

        {/* FORM */}
        <div style={{...KART,animation:"fadeUp 0.4s ease",boxShadow:G.glowBlue}}>
          <NeonCorners color={G.blue}/>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:G.blueGrad,borderRadius:"20px 20px 0 0",boxShadow:`0 0 16px rgba(56,189,248,0.4)`}}/>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,paddingTop:8}}>
            <div style={{width:46,height:46,borderRadius:14,background:G.blueGrad,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:G.glowBlue}}>
              <Icon id="cpu" size={24} color={G.black} strokeWidth={1.5}/>
            </div>
            <div>
              <h1 style={{fontFamily:G.fontDisp,fontSize:24,letterSpacing:"0.08em",color:G.text}}>SENARYO ÜRET</h1>
              <p style={{fontSize:11,color:G.textMuted}}>AI Stüdyo · Sahne Planı · Karakter Dosyası · Dramaturg</p>
            </div>
          </div>

          <SecBaslik label="Format"/>
          <div style={{display:"flex",gap:10,marginBottom:20}}>
            {TIPLER.map(t=>(
              <button key={t.val} onClick={()=>setTip(t.val)} style={{flex:1,padding:"12px",borderRadius:14,border:`2px solid ${tip===t.val?G.blue:G.border}`,background:tip===t.val?`${G.blue}12`:"transparent",color:tip===t.val?G.blue:G.textMuted,fontSize:14,fontWeight:tip===t.val?800:500,cursor:"pointer",transition:"all 0.15s",boxShadow:tip===t.val?G.glowBlue:"none"}}>
                {t.icon} {t.val}
              </button>
            ))}
          </div>

          <SecBaslik label="Tür"/>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            {TURLER.map(t=><SecBtn key={t} aktif={tur===t} onClick={()=>setTur(t)} color={G.purple}>{t}</SecBtn>)}
          </div>

          <SecBaslik label="Özel İstek" info="İstanbul'da geçsin, güçlü kadın karakter..."/>
          <textarea value={ozelIstek} onChange={e=>setOzelIstek(e.target.value)} rows={3} placeholder="İstanbul geceleri, karanlık atmosfer, twist ending..." style={{marginBottom:20,resize:"none",lineHeight:1.6}}/>

          {/* Kalan üretim hakkı göstergesi */}
          {kalanUretim!==null&&kalanUretim<=10&&!limitDoldu&&(
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:10,background:`${kalanUretim<=3?G.red:G.amber}10`,border:`1px solid ${kalanUretim<=3?G.red:G.amber}25`,marginBottom:10}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={kalanUretim<=3?G.red:G.amber} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{fontSize:11,color:kalanUretim<=3?G.red:G.amber,fontWeight:700}}>Bugün {kalanUretim} üretim hakkın kaldı</span>
            </div>
          )}
          {limitDoldu&&(
            <div style={{padding:"12px 16px",borderRadius:12,background:`${G.red}10`,border:`1px solid ${G.red}25`,marginBottom:10,textAlign:"center"}}>
              <p style={{fontSize:13,fontWeight:700,color:G.red,marginBottom:4}}>🎬 Günlük limit doldu</p>
              <p style={{fontSize:11,color:G.textMuted}}>24 saat sonra yeniden üretebilirsin.</p>
            </div>
          )}
          <button onClick={senaryoUret} disabled={yukleniyor||limitDoldu} style={{width:"100%",padding:"15px",borderRadius:14,background:yukleniyor||limitDoldu?G.surface:G.blueGrad,border:`1px solid ${yukleniyor||limitDoldu?G.border:"transparent"}`,color:yukleniyor||limitDoldu?G.textMuted:G.black,fontSize:15,fontWeight:800,cursor:yukleniyor||limitDoldu?"not-allowed":"pointer",transition:"all 0.2s",letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:yukleniyor||limitDoldu?"none":G.glowBlue}}>
            {yukleniyor
              ?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><span style={{display:"inline-block",width:18,height:18,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Üretiliyor...</span>
              :<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Icon id="zap" size={16} color={G.black} strokeWidth={2}/>SENARYO ÜRET</span>
            }
          </button>
        </div>

        {/* SONUÇ */}
        {senaryo&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>
            {/* Sekmeler */}
            <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
              {[
                {id:"senaryo",label:"Senaryo",col:G.blue},
                {id:"beatsheet",label:"Sahne Planı",col:G.blue},
                {id:"karakterler",label:"Karakter Dosyası",col:G.purple},
                {id:"dramaturg",label:"Dramaturg",col:G.amber},
                {id:"puan",label:"Puan",col:G.amber},
              ].map(s=>(
                <button key={s.id} onClick={()=>setSekme(s.id)} style={{flexShrink:0,padding:"7px 16px",borderRadius:20,border:`1.5px solid ${sekme===s.id?s.col:G.border}`,background:sekme===s.id?`${s.col}12`:"transparent",color:sekme===s.id?s.col:G.textMuted,fontSize:12,fontWeight:sekme===s.id?700:500,cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.2s",boxShadow:sekme===s.id?`0 0 10px ${s.col}20`:"none"}}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* SENARYO SEKMESİ */}
            {sekme==="senaryo"&&(
              <div style={KART}>
                <NeonCorners color={G.blue}/>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:G.blueGrad,borderRadius:"20px 20px 0 0"}}/>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,paddingTop:6}}>
                  <span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,background:`${G.blue}12`,color:G.blue,border:`1px solid ${G.blue}25`}}>{tip}</span>
                  <span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,background:`${G.purple}10`,color:G.purple,border:`1px solid ${G.purple}20`}}>{tur}</span>
                </div>
                <h2 style={{fontFamily:G.fontDisp,fontSize:28,letterSpacing:"0.05em",color:G.text,marginBottom:6,lineHeight:1.1}}>{senaryo.baslik}</h2>
                {senaryo.tagline&&<p style={{fontSize:13,fontStyle:"italic",color:G.blue,marginBottom:16,lineHeight:1.5,borderLeft:`2px solid ${G.blue}`,paddingLeft:12}}>"{senaryo.tagline}"</p>}
                {[{label:"ANA FİKİR",val:senaryo.ana_fikir,col:G.blue},{label:"KARAKTERLER",val:senaryo.karakter,col:G.purple},{label:"AÇILIŞ SAHNESİ",val:senaryo.acilis_sahnesi,col:G.blueL},{label:"BÜYÜK SORU",val:senaryo.buyuk_soru,col:G.amber}].map(item=>!item.val?null:(
                  <div key={item.label} style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${G.border}`}}>
                    <p style={{fontSize:10,fontWeight:700,color:item.col,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{item.label}</p>
                    <p style={{fontSize:13,color:G.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{item.val}</p>
                  </div>
                ))}

                {/* Revize butonu */}
                <button onClick={revizeEt} disabled={revizeYukleniyor}
                  style={{width:"100%",padding:"11px",borderRadius:14,background:revizeYukleniyor?G.surface:`${G.blue}10`,border:`1.5px solid ${revizeYukleniyor?G.border:G.blue}`,color:revizeYukleniyor?G.textMuted:G.blue,fontSize:13,fontWeight:700,marginBottom:10,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {revizeYukleniyor?<><div style={{width:14,height:14,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><span>Revize ediliyor...</span></>:<><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>Revize Et — Yeniden Yaz</>}
                </button>

                <button onClick={sequelUret} disabled={sequelYukleniyor} style={{width:"100%",padding:"12px",borderRadius:14,background:sequelYukleniyor?G.surface:G.purpleGrad,border:`1px solid ${sequelYukleniyor?G.border:"transparent"}`,color:sequelYukleniyor?G.textMuted:"#fff",fontSize:13,fontWeight:700,cursor:sequelYukleniyor?"default":"pointer",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em",boxShadow:sequelYukleniyor?"none":G.glowPurple}}>
                  {sequelYukleniyor?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><span style={{display:"inline-block",width:14,height:14,border:`2px solid ${G.border}`,borderTopColor:G.purple,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Devam yazılıyor...</span>:"🔮 Devam Ettir (Sequel)"}
                </button>
                {sequel&&(
                  <div style={{background:`${G.purple}08`,border:`1px solid ${G.purple}25`,borderRadius:16,padding:16,marginBottom:12}}>
                    <p style={{fontSize:10,fontWeight:700,color:G.purple,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>SEQUEL</p>
                    <p style={{fontFamily:G.fontDisp,fontSize:20,color:G.text,marginBottom:4}}>{sequel.baslik}</p>
                    {sequel.tagline&&<p style={{fontSize:12,fontStyle:"italic",color:G.blue,marginBottom:8}}>"{sequel.tagline}"</p>}
                    {sequel.ana_fikir&&<p style={{fontSize:12,color:G.textMuted,lineHeight:1.6}}>{sequel.ana_fikir}</p>}
                  </div>
                )}

                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  <div style={{flex:1,position:"relative",display:"flex",gap:3}}>
                    <button onClick={txtIndir} style={{flex:1,padding:"11px 6px",borderRadius:"12px 0 0 12px",background:G.surface,border:`1px solid ${G.border}`,color:G.textMuted,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><Icon id="download" size={12} color={G.textMuted}/>TXT</button>
                    <button onClick={fdxIndir} style={{padding:"11px 8px",borderRadius:"0",background:G.surface,border:`1px solid ${G.border}`,borderLeft:"none",color:G.purple,fontSize:11,fontWeight:700,cursor:"pointer"}} title="Final Draft">FDX</button>
                    <button onClick={pdfIndir} style={{padding:"11px 8px",borderRadius:"0 12px 12px 0",background:G.surface,border:`1px solid ${G.border}`,borderLeft:"none",color:G.red,fontSize:11,fontWeight:700,cursor:"pointer"}} title="PDF olarak indir">PDF</button>
                  </div>
                  <button onClick={()=>setKartModal(true)} style={{flex:1,padding:"11px 8px",borderRadius:12,background:G.surface,border:`1px solid ${G.border}`,color:G.textMuted,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Icon id="share" size={13} color={G.textMuted}/>Paylaş</button>
                  {!kaydedildi
                    ?<div style={{flex:2,display:"flex",gap:4}}>
                      <button onClick={profilKaydet} style={{flex:1,padding:"11px 8px",borderRadius:"12px 0 0 12px",background:G.blueGrad,border:"none",color:G.black,fontSize:12,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,boxShadow:G.glowBlue}}>
                        <Icon id="save" size={12} color={G.black}/>{user?"Kaydet":"Giriş Yap"}
                      </button>
                      <button onClick={versiyonKaydet} disabled={arsivKaydediliyor}
                        title="Arşive ekle — tüm analiz verileriyle"
                        style={{padding:"11px 10px",borderRadius:"0 12px 12px 0",background:`${G.purple}15`,border:`1px solid ${G.purple}30`,borderLeft:"none",color:G.purple,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}>
                        {arsivKaydediliyor
                          ?<div style={{width:10,height:10,border:`1.5px solid ${G.purple}30`,borderTopColor:G.purple,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
                          :<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/></svg>
                        }
                      </button>
                    </div>
                    :<div style={{flex:2,padding:"11px 8px",borderRadius:12,background:`${G.green}12`,border:`1px solid ${G.green}30`,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Icon id="check" size={13} color={G.green}/><span style={{fontSize:12,color:G.green,fontWeight:700}}>Kaydedildi</span></div>
                  }
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:G.surface,borderRadius:12,border:`1px solid ${G.border}`}}>
                  <div><p style={{fontSize:13,fontWeight:600,color:G.text}}>Topluluğa Paylaş</p><p style={{fontSize:11,color:G.textMuted,marginTop:1}}>Herkes görebilsin</p></div>
                  <div onClick={()=>setPaylasimAcik(!paylasimAcik)} style={{width:44,height:24,borderRadius:12,background:paylasimAcik?G.blue:G.border,position:"relative",transition:"background 0.2s",cursor:"pointer",flexShrink:0,boxShadow:paylasimAcik?G.glowBlue:"none"}}>
                    <div style={{position:"absolute",top:3,left:paylasimAcik?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                  </div>
                </div>
              </div>
            )}

            {/* SAHNE PLANI */}
            {sekme==="beatsheet"&&(
              <div style={KART}>
                <NeonCorners color={G.blue}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                  <div><h3 style={{fontFamily:G.fontDisp,fontSize:22,color:G.text}}>SAHNE PLANI</h3><p style={{fontSize:11,color:G.textMuted}}>Save the Cat — 15 Adım</p></div>
                  <AIBtn onClick={beatUret} loading={beatYukleniyor} loadLabel="Oluşturuluyor" label="⚡ Oluştur"/>
                </div>
                <div style={{display:"flex",gap:6,marginBottom:20}}>
                  {[{label:"1. PERDE",color:G.blue,acts:1},{label:"2. PERDE",color:G.purple,acts:2},{label:"3. PERDE",color:G.red,acts:3}].map(p=>(
                    <div key={p.label} style={{flex:1,padding:"8px 10px",borderRadius:10,background:`${p.color}10`,border:`1px solid ${p.color}20`,textAlign:"center"}}>
                      <p style={{fontFamily:G.fontDisp,fontSize:12,color:p.color}}>{p.label}</p>
                      <p style={{fontSize:9,color:G.textDim,marginTop:2}}>{BEAT_SHEET.filter(b=>b.act===p.acts).length} beat</p>
                    </div>
                  ))}
                </div>
                {Object.keys(beatler).length===0&&!beatYukleniyor&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:10}}>SAHNE PLANI</div><p style={{fontSize:13,color:G.textMuted}}>Save the Cat yöntemiyle 15 adımlık yapı</p></div>}
                {beatYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}
                {BEAT_SHEET.map(beat=>{
                  var col={1:G.blue,2:G.purple,3:G.red}[beat.act];
                  return(
                    <div key={beat.id} style={{marginBottom:10,padding:"14px 16px",background:G.surface,borderRadius:14,border:`1px solid ${G.border}`,borderLeft:`3px solid ${col}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:beatler[beat.id]?8:0}}>
                        <span style={{width:22,height:22,borderRadius:"50%",background:`${col}15`,color:col,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:G.fontDisp}}>{beat.no}</span>
                        <div style={{flex:1}}><p style={{fontSize:13,fontWeight:700,color:G.text}}>{beat.label}</p><p style={{fontSize:11,color:G.textDim}}>{beat.aciklama}</p></div>
                        {beatler[beat.id]&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:`${col}15`,color:col,fontWeight:700}}>✓</span>}
                      </div>
                      {beatler[beat.id]&&<p style={{fontSize:13,color:G.textMuted,lineHeight:1.65,paddingLeft:30}}>{beatler[beat.id]}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* KARAKTER DOSYASI */}
            {sekme==="karakterler"&&(
              <div style={{...KART,border:`1px solid ${G.borderPurple||"rgba(139,92,246,0.2)"}`}}>
                <NeonCorners color={G.purple}/>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:G.purpleGrad,borderRadius:"20px 20px 0 0"}}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,paddingTop:6}}>
                  <div><h3 style={{fontFamily:G.fontDisp,fontSize:22,color:G.text}}>KARAKTER DOSYASI</h3><p style={{fontSize:11,color:G.textMuted}}>Karakter profilleri & psikoloji</p></div>
                  <AIBtn onClick={karakterBibleUret} loading={bibleYukleniyor} loadLabel="Oluşturuluyor" label="⚡ Oluştur" color={G.purpleGrad} glow={G.glowPurple}/>
                </div>
                {!karakterBible&&!bibleYukleniyor&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:10}}>KARAKTERLER</div><p style={{fontSize:13,color:G.textMuted}}>Karakter profillerini oluştur</p></div>}
                {bibleYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.purple,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}
                {karakterBible?.karakterler?.map((k,i)=>(
                  <div key={i} style={{marginBottom:16,padding:"18px",background:`${G.purple}06`,border:`1px solid ${G.purple}20`,borderRadius:16}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:G.purpleGrad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:G.fontDisp,fontSize:20,flexShrink:0}}>{(k.ad||"?")[0]}</div>
                      <div><p style={{fontSize:16,fontWeight:800,color:G.text}}>{k.ad}</p><p style={{fontSize:12,color:G.textMuted}}>{k.yas} · {k.meslek}</p></div>
                    </div>
                    {[{icon:"🎯",label:"Hedef",val:k.hedef,col:G.blue},{icon:"😨",label:"Korku",val:k.korku,col:G.red},{icon:"🤫",label:"Sır",val:k.sir,col:G.purple},{icon:"💪",label:"Güç",val:k.guc,col:G.green},{icon:"⚠️",label:"Zayıflık",val:k.zayiflik,col:G.amber},{icon:"🌱",label:"Karakter Yayı",val:k.arc,col:G.blueL},{icon:"💬",label:"Diyalog Tonu",val:k.diyalog_tonu,col:G.purpleL}].map(item=>!item.val?null:(
                      <div key={item.label} style={{display:"flex",gap:10,marginBottom:8,padding:"8px 10px",background:G.surface,borderRadius:10}}>
                        <span style={{fontSize:14,flexShrink:0}}>{item.icon}</span>
                        <div><p style={{fontSize:10,fontWeight:700,color:item.col,textTransform:"uppercase",letterSpacing:"0.06em"}}>{item.label}</p><p style={{fontSize:13,color:G.text,lineHeight:1.5,marginTop:1}}>{item.val}</p></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* DRAMATURG */}
            {sekme==="dramaturg"&&(
              <div style={KART}>
                <NeonCorners color={G.amber}/>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${G.amber},${G.amberL})`,borderRadius:"20px 20px 0 0"}}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,paddingTop:6}}>
                  <div><h3 style={{fontFamily:G.fontDisp,fontSize:22,color:G.text}}>AI DRAMATURG</h3><p style={{fontSize:11,color:G.textMuted}}>Türk TV sektörüne özel analiz</p></div>
                  <AIBtn onClick={dramaturgCalistir} loading={dramaturgYukleniyor} loadLabel="Analiz ediliyor" label="⚡ Analiz" color={`linear-gradient(135deg,${G.amber},${G.amberL})`} glow={G.glowAmber}/>
                </div>
                {!dramaturgAnaliz&&!dramaturgYukleniyor&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:10}}>DRAMATURG</div><p style={{fontSize:13,color:G.textMuted}}>Gerilim, karakter motivasyonu, Türk izleyici uyumu</p></div>}
                {dramaturgYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.amber,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}
                {dramaturgAnaliz&&(
                  <div>
                    <div style={{textAlign:"center",marginBottom:20,padding:"20px",background:`${G.amber}10`,borderRadius:16,border:`1px solid ${G.amber}25`}}>
                      <div style={{fontFamily:G.fontDisp,fontSize:56,color:G.amber,lineHeight:1}}>{dramaturgAnaliz.genel_puan}</div>
                      <p style={{fontSize:12,color:G.textMuted,marginTop:4}}>Genel Dramaturg Puanı</p>
                    </div>
                    {dramaturgAnaliz.turk_dizi_uyumu&&<div style={{marginBottom:12,padding:"14px",background:`${G.amber}08`,border:`1px solid ${G.amber}20`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.amber,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>🇹🇷 Türk Dizisi Uyumu</p><p style={{fontSize:13,color:G.text,lineHeight:1.6}}>{dramaturgAnaliz.turk_dizi_uyumu}</p></div>}
                    {dramaturgAnaliz.gerilim_analizi&&<div style={{marginBottom:12,padding:"14px",background:G.surface,border:`1px solid ${G.border}`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.blue,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>⚡ Gerilim Analizi</p><p style={{fontSize:13,color:G.text,lineHeight:1.6}}>{dramaturgAnaliz.gerilim_analizi}</p></div>}
                    {dramaturgAnaliz.guc_noktalari?.length>0&&<div style={{marginBottom:12,padding:"14px",background:`${G.green}08`,border:`1px solid ${G.green}20`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.green,textTransform:"uppercase",marginBottom:8}}>✅ Güçlü Noktalar</p>{dramaturgAnaliz.guc_noktalari.map((g,i)=><p key={i} style={{fontSize:13,color:G.text,lineHeight:1.5,marginBottom:4}}>• {g}</p>)}</div>}
                    {dramaturgAnaliz.zayif_noktalar?.length>0&&<div style={{marginBottom:12,padding:"14px",background:`${G.red}08`,border:`1px solid ${G.red}20`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.red,textTransform:"uppercase",marginBottom:8}}>⚠️ Zayıf Noktalar</p>{dramaturgAnaliz.zayif_noktalar.map((z,i)=><p key={i} style={{fontSize:13,color:G.text,lineHeight:1.5,marginBottom:4}}>• {z}</p>)}</div>}
                    {[dramaturgAnaliz.oneri_1,dramaturgAnaliz.oneri_2,dramaturgAnaliz.oneri_3].filter(Boolean).length>0&&<div style={{padding:"14px",background:`${G.purple}08`,border:`1px solid ${G.purple}20`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.purple,textTransform:"uppercase",marginBottom:8}}>💡 Öneriler</p>{[dramaturgAnaliz.oneri_1,dramaturgAnaliz.oneri_2,dramaturgAnaliz.oneri_3].filter(Boolean).map((o,i)=><p key={i} style={{fontSize:13,color:G.text,lineHeight:1.5,marginBottom:6}}>{i+1}. {o}</p>)}</div>}
                  </div>
                )}
              </div>
            )}

            {/* PUAN */}
            {sekme==="puan"&&(
              <div style={KART}>
                <NeonCorners color={G.amber}/>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${G.amber},${G.amberL})`,borderRadius:"20px 20px 0 0"}}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,paddingTop:6}}>
                  <div><h3 style={{fontFamily:G.fontDisp,fontSize:22,color:G.text}}>AI PUAN</h3><p style={{fontSize:11,color:G.textMuted}}>Yapımcı gözüyle değerlendir</p></div>
                  <AIBtn onClick={puanHesapla} loading={puanYukleniyor} loadLabel="Hesaplanıyor" label="⭐ Değerlendir" color={`linear-gradient(135deg,${G.amber},${G.amberL})`} glow={G.glowAmber}/>
                </div>
                {!puan&&!puanYukleniyor&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:10}}>PUAN</div><p style={{fontSize:13,color:G.textMuted}}>IMDb tahmini, ticari potansiyel, Netflix uyumu</p></div>}
                {puanYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.amber,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}
                {puan&&(
                  <div>
                    <div style={{textAlign:"center",marginBottom:20,padding:"24px",background:`linear-gradient(135deg,${G.amber}12,${G.purple}08)`,borderRadius:18,border:`1px solid ${G.amber}25`}}>
                      <div style={{fontFamily:G.fontDisp,fontSize:72,color:G.amber,lineHeight:1}}>{puan.toplam}</div>
                      <p style={{fontSize:13,color:G.textMuted,marginTop:4}}>/ 100 Toplam Puan</p>
                      <div style={{display:"flex",justifyContent:"center",gap:20,marginTop:16}}>
                        <div style={{textAlign:"center"}}><div style={{fontFamily:G.fontDisp,fontSize:26,color:G.text}}>{puan.imdb_tahmin}</div><p style={{fontSize:10,color:G.textDim}}>IMDb Tahmini</p></div>
                        <div style={{width:1,background:G.border}}/>
                        <div style={{textAlign:"center"}}><div style={{fontFamily:G.fontDisp,fontSize:20,color:puan.netflix_uygun_mu?G.green:G.red}}>{puan.netflix_uygun_mu?"✓ UYGUN":"✗ UYGUN DEĞİL"}</div><p style={{fontSize:10,color:G.textDim}}>Netflix</p></div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                      {[{label:"Orijinallik",val:puan.orijinallik,max:25,color:G.purple},{label:"Ticari Potansiyel",val:puan.ticari_potansiyel,max:25,color:G.blue},{label:"Karakter Derinliği",val:puan.karakter_derinligi,max:25,color:G.green},{label:"Anlatım",val:puan.anlatim,max:25,color:G.amber}].map(k=>(
                        <div key={k.label} style={{padding:"14px",background:G.surface,borderRadius:14,border:`1px solid ${G.border}`}}>
                          <p style={{fontSize:10,color:G.textDim,marginBottom:4}}>{k.label}</p>
                          <div style={{fontFamily:G.fontDisp,fontSize:26,color:k.color}}>{k.val}<span style={{fontSize:11,color:G.textDim}}>/{k.max}</span></div>
                          <PuanCubugu val={k.val} max={k.max} color={k.color}/>
                        </div>
                      ))}
                    </div>
                    {puan.benzer_yapimlar?.length>0&&<div style={{marginBottom:10,padding:"12px 14px",background:G.surface,borderRadius:12,border:`1px solid ${G.border}`}}><p style={{fontSize:10,fontWeight:700,color:G.textDim,textTransform:"uppercase",marginBottom:8}}>🎬 Benzer Yapımlar</p><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{puan.benzer_yapimlar.map((y,i)=><span key={i} style={{fontSize:11,padding:"4px 12px",borderRadius:20,background:`${G.blue}12`,color:G.blue,border:`1px solid ${G.blue}20`}}>{y}</span>)}</div></div>}
                    {puan.yapimci_yorumu&&<div style={{padding:"14px",background:`${G.amber}08`,border:`1px solid ${G.amber}20`,borderRadius:14}}><p style={{fontSize:10,fontWeight:700,color:G.amber,textTransform:"uppercase",marginBottom:8}}>💼 Yapımcı Yorumu</p><p style={{fontSize:13,color:G.text,lineHeight:1.7,fontStyle:"italic"}}>"{puan.yapimci_yorumu}"</p></div>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

            {/* DİYALOG GÜÇLENDİRİCİ */}
            {sekme==="diyalog"&&(
              <div style={{...KART,border:`1px solid rgba(45,212,191,0.2)`}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#2DD4BF,#0EA5E9)",borderRadius:"20px 20px 0 0"}}/>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,paddingTop:4}}>
                  <div style={{width:28,height:28,borderRadius:8,background:"rgba(45,212,191,0.15)",border:"1px solid rgba(45,212,191,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                  <div><h3 style={{fontFamily:G.fontDisp,fontSize:20,color:G.text}}>DİYALOG GÜÇLENDİRİCİ</h3><p style={{fontSize:11,color:G.textMuted}}>Zayıf diyaloğu sinematik seviyeye taşı</p></div>
                </div>
                <p style={{fontSize:11,color:G.textDim,marginBottom:8,letterSpacing:"0.06em",textTransform:"uppercase"}}>Güçlendirilecek Diyalog</p>
                <textarea value={diyalogMetin} onChange={e=>setDiyalogMetin(e.target.value)} rows={5}
                  placeholder={"AHMET\nSeni seviyorum.\n\nNAZ\nBen de seni..."}
                  style={{marginBottom:12,resize:"none",lineHeight:1.7,fontFamily:"monospace",fontSize:13,background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"10px 14px",color:G.text,width:"100%",outline:"none"}}/>
                <button onClick={diyalogGuclendir} disabled={diyalogYukleniyor||!diyalogMetin.trim()}
                  style={{width:"100%",padding:"12px",borderRadius:14,background:diyalogYukleniyor?"rgba(45,212,191,0.08)":"linear-gradient(135deg,#0891b2,#2DD4BF)",border:"none",color:diyalogYukleniyor?G.textMuted:"#0A0F1E",fontSize:13,fontWeight:800,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {diyalogYukleniyor?<><div style={{width:14,height:14,border:`2px solid ${G.border}`,borderTopColor:"#2DD4BF",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Güçlendiriliyor...</>:"⚡ Diyaloğu Güçlendir"}
                </button>
                {diyalogSonuc&&(
                  <div style={{background:"rgba(45,212,191,0.06)",border:"1px solid rgba(45,212,191,0.2)",borderRadius:14,padding:16}}>
                    <p style={{fontSize:10,fontWeight:700,color:"#2DD4BF",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>✓ GÜÇLENDİRİLMİŞ DİYALOG</p>
                    <pre style={{fontSize:13,color:G.text,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"monospace"}}>{diyalogSonuc}</pre>
                    <button onClick={()=>navigator.clipboard?.writeText(diyalogSonuc)}
                      style={{marginTop:10,padding:"7px 16px",borderRadius:10,background:"rgba(45,212,191,0.1)",border:"1px solid rgba(45,212,191,0.25)",color:"#2DD4BF",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                      📋 Kopyala
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* LOGLINE ÜRETİCİ */}
            {sekme==="logline"&&(
              <div style={{...KART,border:`1px solid ${G.green}20`}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${G.green},#4ADE80)`,borderRadius:"20px 20px 0 0"}}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,paddingTop:4}}>
                  <div>
                    <h3 style={{fontFamily:G.fontDisp,fontSize:20,color:G.text}}>LOGLINE ÜRETİCİ</h3>
                    <p style={{fontSize:11,color:G.textMuted}}>3 farklı güçlü logline seçeneği</p>
                  </div>
                  <button onClick={loglineUret} disabled={loglineYukleniyor}
                    style={{padding:"9px 18px",borderRadius:12,background:loglineYukleniyor?G.surface:`linear-gradient(135deg,${G.green},#4ADE80)`,border:"none",color:loglineYukleniyor?G.textMuted:"#0A0F1E",fontSize:12,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                    {loglineYukleniyor?<><div style={{width:14,height:14,border:`2px solid ${G.border}`,borderTopColor:G.green,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Üretiliyor</>:"⚡ Üret"}
                  </button>
                </div>
                {!logline&&!loglineYukleniyor&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontFamily:G.fontDisp,fontSize:32,color:G.textDim,marginBottom:8}}>LOGLINE</div><p style={{fontSize:13,color:G.textMuted}}>Senaryondan 3 güçlü logline üret</p></div>}
                {loglineYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.green,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}
                {logline&&[logline.logline1,logline.logline2,logline.logline3].filter(Boolean).map((l,i)=>(
                  <div key={i} style={{marginBottom:12,padding:"16px",background:`${G.green}06`,border:`1px solid ${G.green}20`,borderRadius:14,position:"relative"}}>
                    <span style={{position:"absolute",top:12,left:14,fontFamily:G.fontDisp,fontSize:11,color:G.green,letterSpacing:"0.1em"}}>#{i+1}</span>
                    <p style={{fontSize:14,color:G.text,lineHeight:1.7,paddingLeft:28,fontStyle:"italic"}}>"{l}"</p>
                    <button onClick={()=>navigator.clipboard?.writeText(l)}
                      style={{marginTop:8,marginLeft:28,padding:"5px 12px",borderRadius:8,background:`${G.green}10`,border:`1px solid ${G.green}25`,color:G.green,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                      📋 Kopyala
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* PİTCH DECK */}
            {sekme==="pitch"&&(
              <div style={{...KART,border:`1px solid ${G.red}20`}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${G.red},${G.redL})`,borderRadius:"20px 20px 0 0"}}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,paddingTop:4}}>
                  <div>
                    <h3 style={{fontFamily:G.fontDisp,fontSize:20,color:G.text}}>PİTCH DECK</h3>
                    <p style={{fontSize:11,color:G.textMuted}}>Yapımcılara sunum için pitch içeriği</p>
                  </div>
                  <button onClick={pitchDeckUret} disabled={pitchYukleniyor}
                    style={{padding:"9px 18px",borderRadius:12,background:pitchYukleniyor?G.surface:`linear-gradient(135deg,${G.red},${G.redL})`,border:"none",color:pitchYukleniyor?G.textMuted:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                    {pitchYukleniyor?<><div style={{width:14,height:14,border:`2px solid ${G.border}`,borderTopColor:G.red,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Hazırlanıyor</>:"⚡ Üret"}
                  </button>
                </div>
                {!pitchDeck&&!pitchYukleniyor&&<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontFamily:G.fontDisp,fontSize:32,color:G.textDim,marginBottom:8}}>PİTCH DECK</div><p style={{fontSize:13,color:G.textMuted}}>Yapımcı sunumuna hazır pitch içeriği</p></div>}
                {pitchYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.red,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}
                {pitchDeck&&[
                  {key:"one_liner",label:"ONE LINER",col:G.red,icon:"🎯"},
                  {key:"problem",label:"PROBLEM",col:G.amber,icon:"⚡"},
                  {key:"cozum",label:"ÇÖZÜM",col:G.blue,icon:"💡"},
                  {key:"hedef_kitle",label:"HEDEF KİTLE",col:G.purple,icon:"👥"},
                  {key:"rekabet",label:"REKABET & FARK",col:G.blueL,icon:"🏆"},
                  {key:"neden_simdi",label:"NEDEN ŞİMDİ?",col:"#F472B6",icon:"⏰"},
                  {key:"vizyon",label:"VİZYON",col:G.purple,icon:"🔭"},
                  {key:"cagri",label:"NEDEN YATIRIN?",col:G.green,icon:"💰"},
                ].map(item=>pitchDeck[item.key]?(
                  <div key={item.key} style={{marginBottom:10,padding:"14px 16px",background:`${item.col}06`,border:`1px solid ${item.col}20`,borderRadius:14}}>
                    <p style={{fontSize:10,fontWeight:700,color:item.col,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{item.icon} {item.label}</p>
                    <p style={{fontSize:13,color:G.text,lineHeight:1.65}}>{pitchDeck[item.key]}</p>
                  </div>
                ):null)}
              </div>
            )}

            {/* HERO'S JOURNEY */}
            {sekme==="hero"&&(
              <div style={{...KART,border:"1px solid rgba(245,158,11,0.2)"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#F59E0B,#FCD34D)",borderRadius:"20px 20px 0 0"}}/>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,paddingTop:4}}>
                  <div>
                    <h3 style={{fontFamily:G.fontDisp,fontSize:20,color:G.text}}>HERO'S JOURNEY</h3>
                    <p style={{fontSize:11,color:G.textMuted}}>Joseph Campbell — 12 Aşamalı Kahramanın Yolculuğu</p>
                  </div>
                  <button onClick={heroJourneyUret} disabled={heroYukleniyor}
                    style={{padding:"9px 18px",borderRadius:12,background:heroYukleniyor?G.surface:"linear-gradient(135deg,#F59E0B,#FCD34D)",border:"none",color:heroYukleniyor?G.textMuted:"#0A0F1E",fontSize:12,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                    {heroYukleniyor?<><div style={{width:14,height:14,border:"2px solid rgba(245,158,11,0.3)",borderTopColor:"#F59E0B",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Analiz ediliyor</>:"⚡ Analiz Et"}
                  </button>
                </div>

                {/* Karşılaştırma görseli */}
                <div style={{display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
                  {[
                    {no:1,label:"Olağan Dünya",col:"#94A3B8"},
                    {no:2,label:"Çağrı",col:"#38BDF8"},
                    {no:3,label:"Red",col:"#EF4444"},
                    {no:4,label:"Akıl Hoca",col:"#8B5CF6"},
                    {no:5,label:"Eşik",col:"#F59E0B"},
                    {no:6,label:"Testler",col:"#EF4444"},
                    {no:7,label:"Mağara",col:"#7C3AED"},
                    {no:8,label:"Sınav",col:"#EF4444"},
                    {no:9,label:"Ödül",col:"#22C55E"},
                    {no:10,label:"Dönüş",col:"#38BDF8"},
                    {no:11,label:"Diriliş",col:"#F59E0B"},
                    {no:12,label:"Elixir",col:"#22C55E"},
                  ].map(s=>(
                    <div key={s.no} style={{flexShrink:0,textAlign:"center",width:52}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:`${s.col}15`,border:`1px solid ${s.col}30`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px",fontSize:11,fontWeight:800,color:s.col,fontFamily:G.fontDisp}}>{s.no}</div>
                      <p style={{fontSize:8,color:G.textDim,lineHeight:1.2}}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {!heroJourney&&!heroYukleniyor&&(
                  <div style={{textAlign:"center",padding:"40px 0"}}>
                    <div style={{fontFamily:G.fontDisp,fontSize:32,color:G.textDim,marginBottom:8}}>KAHRAMANIN YOLCULUĞU</div>
                    <p style={{fontSize:13,color:G.textMuted}}>Campbell'ın 12 aşaması bu senaryoya göre doldurulacak</p>
                  </div>
                )}
                {heroYukleniyor&&<div style={{textAlign:"center",padding:"30px 0"}}><div style={{width:28,height:28,border:"2px solid rgba(245,158,11,0.2)",borderTopColor:"#F59E0B",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/></div>}

                {heroJourney&&[
                  {key:"olagan_dunya",no:1,label:"Olağan Dünya",sub:"Ordinary World",col:"#94A3B8"},
                  {key:"macera_cagrisi",no:2,label:"Maceranın Çağrısı",sub:"Call to Adventure",col:"#38BDF8"},
                  {key:"cagriya_ret",no:3,label:"Çağrıyı Reddetme",sub:"Refusal of the Call",col:"#EF4444"},
                  {key:"akil_hoca",no:4,label:"Akıl Hocasıyla Karşılaşma",sub:"Meeting the Mentor",col:"#8B5CF6"},
                  {key:"esigi_gecmek",no:5,label:"Eşiği Geçmek",sub:"Crossing the Threshold",col:"#F59E0B"},
                  {key:"testler",no:6,label:"Testler, Müttefikler, Düşmanlar",sub:"Tests, Allies, Enemies",col:"#EF4444"},
                  {key:"derin_magara",no:7,label:"En Derin Mağaraya Yaklaşmak",sub:"Approach to the Inmost Cave",col:"#7C3AED"},
                  {key:"buyuk_sinav",no:8,label:"Büyük Sınav",sub:"The Ordeal",col:"#EF4444"},
                  {key:"odulu_almak",no:9,label:"Ödülü Almak",sub:"Reward / Seizing the Sword",col:"#22C55E"},
                  {key:"donus_yolu",no:10,label:"Geri Dönüş Yolu",sub:"The Road Back",col:"#38BDF8"},
                  {key:"dirilis",no:11,label:"Diriliş",sub:"Resurrection",col:"#F59E0B"},
                  {key:"eliksirle_donus",no:12,label:"Eliksirle Dönüş",sub:"Return with the Elixir",col:"#22C55E"},
                ].map(asama=>heroJourney[asama.key]?(
                  <div key={asama.key} style={{marginBottom:10,padding:"14px 16px",background:G.surface,borderRadius:14,border:`1px solid ${G.border}`,borderLeft:`3px solid ${asama.col}`,boxShadow:`-4px 0 12px ${asama.col}10`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{width:24,height:24,borderRadius:"50%",background:`${asama.col}15`,color:asama.col,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:G.fontDisp}}>{asama.no}</span>
                      <div>
                        <p style={{fontSize:13,fontWeight:700,color:G.text}}>{asama.label}</p>
                        <p style={{fontSize:10,color:G.textDim,fontStyle:"italic"}}>{asama.sub}</p>
                      </div>
                    </div>
                    <p style={{fontSize:13,color:G.textMuted,lineHeight:1.65,paddingLeft:32}}>{heroJourney[asama.key]}</p>
                  </div>
                ):null)}
              </div>
            )}


      {/* ── ARŞİV DRAWER ─────────────────────────────────────────────────── */}
      {arsivAcik&&<>
        <div onClick={()=>setArsivAcik(false)} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,5,20,0.85)",backdropFilter:"blur(10px)"}}/>
        <div style={{position:"fixed",top:0,right:0,bottom:0,zIndex:301,width:Math.min(360,window.innerWidth),background:`linear-gradient(180deg,${G.black},${G.deep})`,borderLeft:`1px solid ${G.border}`,display:"flex",flexDirection:"column",boxShadow:"-8px 0 60px rgba(0,0,0,0.9)"}}>
          {/* Başlık */}
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div>
              <p style={{fontFamily:G.fontDisp,fontSize:20,letterSpacing:"0.08em",color:G.text}}>ARŞİVLERİM</p>
              <p style={{fontSize:11,color:G.textMuted,marginTop:2}}>{arsiv.length} versiyon kaydedilmiş</p>
            </div>
            <button onClick={()=>setArsivAcik(false)} style={{width:32,height:32,borderRadius:8,background:`${G.blue}08`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G.textMuted} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Liste */}
          <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
            {arsivYukleniyor&&(
              <div style={{textAlign:"center",padding:"40px 0"}}>
                <div style={{width:24,height:24,border:`2px solid ${G.border}`,borderTopColor:G.purple,borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}/>
              </div>
            )}
            {!arsivYukleniyor&&arsiv.length===0&&(
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontFamily:G.fontDisp,fontSize:24,color:G.textDim,marginBottom:8}}>BOŞ ARŞİV</div>
                <p style={{fontSize:12,color:G.textMuted}}>Senaryo ürettikten sonra arşiv butonuna basarak kaydet.</p>
              </div>
            )}
            {arsiv.map((v,i)=>{
              var tarih=new Date(v.created_at).toLocaleDateString("tr-TR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
              return(
                <div key={v.id} style={{marginBottom:10,padding:"14px",background:`linear-gradient(135deg,${G.surface},${G.card})`,border:`1px solid ${G.border}`,borderRadius:14,position:"relative",animation:`fadeUp 0.2s ${i*0.03}s both ease`}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${G.purple}40`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;}}>
                  {/* Tür etiketi */}
                  <div style={{display:"flex",gap:5,marginBottom:8}}>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:`${G.blue}10`,color:G.blue,border:`1px solid ${G.blue}20`}}>{v.tip}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:`${G.purple}10`,color:G.purple,border:`1px solid ${G.purple}20`}}>{v.tur}</span>
                  </div>
                  {/* Başlık */}
                  <p style={{fontSize:14,fontWeight:700,color:G.text,marginBottom:4,lineHeight:1.3}}>{v.baslik}</p>
                  {v.tagline&&<p style={{fontSize:11,color:G.textMuted,fontStyle:"italic",marginBottom:8}}>"{v.tagline}"</p>}
                  <p style={{fontSize:10,color:G.textDim,marginBottom:12}}>{tarih}</p>
                  {/* Butonlar */}
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>versiyonYukle(v)}
                      style={{flex:1,padding:"8px",borderRadius:10,background:`${G.blue}10`,border:`1px solid ${G.blue}25`,color:G.blue,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Yükle
                    </button>
                    <button onClick={()=>versiyonSil(v.id)}
                      style={{padding:"8px 12px",borderRadius:10,background:`${G.red}08`,border:`1px solid ${G.red}20`,color:G.red,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>}

      <AltNav/>
      {drawer&&<Drawer user={user} username={username} avatarUrl={avatarUrl} onClose={()=>setDrawer(false)}/>}
      {kartModal&&<KartModal/>}
    </div>
  );
}
