import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

var G = {
  black:"#0A0F1E", deep:"#0F172A", surface:"#1E293B", card:"#162032",
  border:"rgba(56,189,248,0.12)", borderHov:"rgba(56,189,248,0.4)",
  blue:"#38BDF8", blueL:"#7DD3FC", blueD:"#0EA5E9",
  blueGrad:"linear-gradient(135deg,#0EA5E9 0%,#38BDF8 40%,#7DD3FC 70%,#0EA5E9 100%)",
  purple:"#8B5CF6", purpleL:"#A78BFA",
  red:"#EF4444", redL:"#F87171",
  text:"#F1F5F9", textMuted:"rgba(241,245,249,0.5)", textDim:"rgba(241,245,249,0.25)",
  shadow:"0 8px 40px rgba(0,0,0,0.7)",
  glowBlue:"0 0 24px rgba(56,189,248,0.25)",
  glowPurple:"0 0 24px rgba(139,92,246,0.25)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

var TURLER=["Hepsi","Gerilim","Drama","Komedi","Aksiyon","Korku","Romantik","Bilim Kurgu","Fantastik","Suç","Tarihi"];
var TURLER_RENK={
  "Gerilim":G.red,"Drama":G.blue,"Komedi":"#FBBF24","Aksiyon":G.red,
  "Korku":G.purple,"Romantik":"#F472B6","Bilim Kurgu":G.blueL,
  "Fantastik":G.purpleL,"Suç":"#94A3B8","Tarihi":"#D97706",
};

function Icon({id,size=22,color="currentColor",strokeWidth=1.8}){
  var p={width:size,height:size,fill:"none",stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="search")return<svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="heart")return<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  if(id==="eye")return<svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  if(id==="bookmark")return<svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
  if(id==="hash")return<svg {...p}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;
  if(id==="x")return<svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  if(id==="bell")return<svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if(id==="zap")return<svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  return null;
}

function NeonCorners({color=G.blue,size=10,thickness=1.5}){
  var s={position:"absolute",width:size,height:size};
  var l={background:color,position:"absolute",boxShadow:`0 0 5px ${color}80`};
  return(<>
    <div style={{...s,top:0,left:0}}><div style={{...l,top:0,left:0,width:thickness,height:size}}/><div style={{...l,top:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,top:0,right:0}}><div style={{...l,top:0,right:0,width:thickness,height:size}}/><div style={{...l,top:0,right:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,left:0}}><div style={{...l,bottom:0,left:0,width:thickness,height:size}}/><div style={{...l,bottom:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,right:0}}><div style={{...l,bottom:0,right:0,width:thickness,height:size}}/><div style={{...l,bottom:0,right:0,width:size,height:thickness}}/></div>
  </>);
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
      <div style={{height:2,background:G.blueGrad,flexShrink:0,boxShadow:"0 0 20px rgba(56,189,248,0.5)"}}/>
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
        <div style={{background:G.surface,border:`1px solid ${G.borderHov}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:300,textAlign:"center",position:"relative"}}>
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

function AltNav({active="/kesfet"}){
  var items=[{href:"/",id:"home"},{href:"/kesfet",id:"search"},{href:"/topluluk",id:"users"},{href:"/mesajlar",id:"chat"},{href:"/profil",id:"user"}];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"8px 0 env(safe-area-inset-bottom,10px)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}30,${G.purple}20,transparent)`,pointerEvents:"none"}}/>
      {items.map(item=>{
        var isActive=active===item.href;
        return(
          <a key={item.href} href={item.href} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px",borderRadius:12,position:"relative",opacity:isActive?1:0.35,transition:"all 0.2s"}}>
            <Icon id={item.id} size={22} color={isActive?G.blue:"#94A3B8"}/>
            {isActive&&<>
              <div style={{position:"absolute",bottom:0,width:20,height:2,borderRadius:1,background:G.blueGrad,boxShadow:`0 0 8px ${G.blue}`}}/>
              <div style={{position:"absolute",inset:0,borderRadius:12,background:`radial-gradient(circle at 50% 100%,${G.blue}12,transparent 70%)`}}/>
            </>}
          </a>
        );
      })}
    </div>
  );
}

function FilmCard({g,onBegen,onKaydet,user}){
  var [hov,setHov]=useState(false);
  var [liked,setLiked]=useState(g._liked||false);
  var [lc,setLc]=useState(g.begeni_sayisi||0);
  var [saved,setSaved]=useState(g._saved||false);
  var accent=TURLER_RENK[g.tur]||G.blue;
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>window.location.href=`/senaryo/${g.id}`}
      style={{position:"relative",marginBottom:10,cursor:"pointer",animation:"fadeUp 0.3s ease both"}}>
      <div style={{
        background:`linear-gradient(160deg,${G.deep},${G.card})`,
        border:`1px solid ${hov?accent+"50":G.border}`,
        borderRadius:14,overflow:"hidden",
        boxShadow:hov?`0 0 24px ${accent}15,${G.shadow}`:G.shadow,
        transition:"all 0.25s",position:"relative"
      }}>
        <NeonCorners color={hov?accent:G.blue}/>
        {/* Tür rengi şerit */}
        <div style={{height:2,background:accent,opacity:hov?0.9:0.4,boxShadow:hov?`0 0 10px ${accent}`:"none",transition:"all 0.25s"}}/>
        {/* Üst bar */}
        <div style={{height:18,background:"rgba(0,0,0,0.5)",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px"}}>
          <span style={{fontFamily:G.fontDisp,fontSize:9,color:G.blueD,letterSpacing:"0.15em"}}>SCRIPTIFY</span>
          <span style={{fontFamily:G.fontDisp,fontSize:9,color:G.textDim,letterSpacing:"0.1em"}}>{g.tip||"DİZİ"} · {g.tur||""}</span>
        </div>
        <div style={{padding:"12px 12px 10px"}}>
          {/* Profil */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}} onClick={e=>{e.stopPropagation();window.location.href=`/@${g.profiles?.username}`;}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${G.deep},${G.surface})`,border:`1px solid rgba(56,189,248,0.2)`,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {g.profiles?.avatar_url?<img src={g.profiles.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={14} color="rgba(56,189,248,0.4)"/>}
            </div>
            <span style={{fontSize:12,fontWeight:700,color:G.text}}>@{g.profiles?.username||"kullanici"}</span>
            {g.profiles?.dogrulandi&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:`${G.blue}18`,color:G.blue,fontWeight:700,boxShadow:`0 0 6px ${G.blue}25`}}>✓</span>}
          </div>
          {/* Başlık */}
          <h3 style={{fontFamily:G.fontDisp,fontSize:20,letterSpacing:"0.03em",color:G.text,lineHeight:1.15,marginBottom:6}}>{g.baslik}</h3>
          {g.tagline&&<p style={{fontSize:12,fontStyle:"italic",color:accent,marginBottom:8,borderLeft:`2px solid ${accent}`,paddingLeft:8,lineHeight:1.4}}>"{g.tagline}"</p>}
          {g.ana_fikir&&<p style={{fontSize:12,color:G.textMuted,lineHeight:1.6,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{g.ana_fikir}</p>}
          {/* Aksiyonlar */}
          <div style={{display:"flex",alignItems:"center",gap:4,borderTop:`1px solid ${G.border}`,paddingTop:8}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>{if(!user)return;var n=!liked;setLiked(n);setLc(c=>n?c+1:c-1);onBegen&&onBegen(g.id,n);}}
              style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:8,background:liked?`${G.red}15`:"transparent",border:`1px solid ${liked?G.red+"30":"transparent"}`,color:liked?G.red:G.textMuted,fontSize:11,transition:"all 0.2s",cursor:"pointer"}}>
              <Icon id="heart" size={12} color={liked?G.red:G.textMuted}/>{lc>0&&lc}
            </button>
            <button onClick={()=>{if(!user)return;var n=!saved;setSaved(n);onKaydet&&onKaydet(g.id,n);}}
              style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:8,background:saved?`${G.blue}12`:"transparent",border:`1px solid ${saved?G.blue+"25":"transparent"}`,color:saved?G.blue:G.textMuted,fontSize:11,transition:"all 0.2s",cursor:"pointer"}}>
              <Icon id="bookmark" size={12} color={saved?G.blue:G.textMuted}/>
            </button>
            <div style={{flex:1}}/>
            {g.goruntuleme_sayisi>0&&<span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:G.textDim}}><Icon id="eye" size={10} color={G.textDim}/>{g.goruntuleme_sayisi}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function KisiKarti({profil}){
  var [hov,setHov]=useState(false);
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>window.location.href=`/@${profil.username}`}
      style={{background:`linear-gradient(145deg,${G.card},${G.surface})`,border:`1px solid ${hov?G.borderHov:G.border}`,borderRadius:14,padding:"16px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all 0.2s",boxShadow:hov?G.glowBlue:"none",position:"relative"}}>
      <NeonCorners color={hov?G.blue:G.blueD} size={8}/>
      <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${G.deep},${G.surface})`,border:`1.5px solid rgba(56,189,248,0.25)`,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {profil.avatar_url?<img src={profil.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={22} color="rgba(56,189,248,0.4)"/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:13,fontWeight:700,color:G.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{profil.username}</span>
          {profil.dogrulandi&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:`${G.blue}18`,color:G.blue,fontWeight:700,flexShrink:0,boxShadow:`0 0 6px ${G.blue}25`}}>✓</span>}
        </div>
        {profil.bio&&<p style={{fontSize:11,color:G.textMuted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profil.bio}</p>}
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <span style={{fontSize:10,color:G.blue,fontWeight:600}}>{profil.senaryo_sayisi||0} senaryo</span>
          <span style={{fontSize:10,color:G.textDim}}>{profil.takipci_sayisi||0} takipçi</span>
        </div>
      </div>
    </div>
  );
}

export default function Kesfet(){
  var {user, profil, authHazir} = useAuth();
  var [gonderiler,setGonderiler]=useState([]);
  var [kisiler,setKisiler]=useState([]);
  var [hashtagler,setHashtagler]=useState([]);
  var [sekme,setSekme]=useState("senaryolar");
  var [filtre,setFiltre]=useState("Hepsi");
  var [arama,setArama]=useState("");
  var [yukleniyor,setYukleniyor]=useState(true);
  var [drawer,setDrawer]=useState(false);
  var avatarUrl=profil?.avatar_url||null;
  var username=profil?.username||(user?user.email?.split("@")[0]:"");

  useEffect(()=>{    loadVeriler();
  },[]);

  async function loadVeriler(){
    setYukleniyor(true);
    var[{data:g},{data:p},{data:h}]=await Promise.all([
      supabase.from("gonderiler").select("*,profiles(username,avatar_url,dogrulandi)").eq("paylasim_acik",true).order("created_at",{ascending:false}).limit(30),
      supabase.from("profiles").select("*").order("senaryo_sayisi",{ascending:false}).limit(20),
      supabase.from("hashtagler").select("*").order("kullanim_sayisi",{ascending:false}).limit(20),
    ]);
    if(g)setGonderiler(g);
    if(p)setKisiler(p);
    if(h)setHashtagler(h);
    setYukleniyor(false);
  }

  async function handleBegen(id,liked){
    if(!user)return;
    if(liked)await supabase.from("begeniler").insert([{gonderi_id:id,user_id:user.id}]);
    else await supabase.from("begeniler").delete().eq("gonderi_id",id).eq("user_id",user.id);
  }
  async function handleKaydet(id,saved){
    if(!user)return;
    if(saved)await supabase.from("kaydedilenler").insert([{gonderi_id:id,user_id:user.id}]);
    else await supabase.from("kaydedilenler").delete().eq("gonderi_id",id).eq("user_id",user.id);
  }

  var filtreliGonderiler=gonderiler.filter(g=>{
    var turOk=filtre==="Hepsi"||g.tur===filtre;
    var aramaOk=!arama.trim()||(g.baslik||"").toLowerCase().includes(arama.toLowerCase())||(g.ana_fikir||"").toLowerCase().includes(arama.toLowerCase());
    return turOk&&aramaOk;
  });
  var filtreliKisiler=kisiler.filter(p=>!arama.trim()||(p.username||"").toLowerCase().includes(arama.toLowerCase())||(p.bio||"").toLowerCase().includes(arama.toLowerCase()));

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .skeleton{background:linear-gradient(90deg,#1E293B 25%,#243048 50%,#1E293B 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.blueD};border-radius:2px;}
        ::selection{background:rgba(56,189,248,0.2);color:${G.blueL};}
        input{background:${G.surface};border:1px solid ${G.border};border-radius:12px;padding:9px 12px 9px 36px;color:${G.text};font-size:13px;outline:none;font-family:'DM Sans',sans-serif;width:100%;}
        input:focus{border-color:${G.blueD};box-shadow:0 0 0 2px ${G.blue}12;}
        input::placeholder{color:${G.textDim};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:`rgba(10,15,30,0.96)`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}18,transparent)`,pointerEvents:"none"}}/>

        {/* Başlık + butonlar */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <button onClick={()=>setDrawer(true)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",padding:0,cursor:"pointer"}}>
            <Av url={avatarUrl} size={34}/>
            <img src="/logo.png" alt="Scriptify" style={{height:44,objectFit:"contain",maxWidth:150}}/>
          </button>
          <div style={{flex:1}}/>
          <a href="/bildirimler" style={{width:34,height:34,borderRadius:10,background:`${G.blue}08`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon id="bell" size={15} color={G.textMuted}/>
          </a>
          <a href="/uret" style={{height:34,padding:"0 14px",borderRadius:10,background:G.blueGrad,display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:800,color:G.black,letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:G.glowBlue}}>
            <Icon id="zap" size={11} color={G.black} strokeWidth={2.5}/>Üret
          </a>
        </div>

        {/* Arama */}
        <div style={{position:"relative",marginBottom:10}}>
          <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
            <Icon id="search" size={15} color={G.textDim}/>
          </div>
          <input value={arama} onChange={e=>setArama(e.target.value)} placeholder="Senaryo, kişi veya hashtag ara..."
            onFocus={e=>e.target.style.borderColor=G.blueD} onBlur={e=>e.target.style.borderColor=G.border}/>
          {arama&&<button onClick={()=>setArama("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",padding:4,cursor:"pointer"}}>
            <Icon id="x" size={13} color={G.textDim}/>
          </button>}
        </div>

        {/* Sekmeler */}
        <div style={{display:"flex",gap:4,position:"relative",zIndex:10}}>
          {[{id:"senaryolar",label:"Senaryolar",icon:"film"},{id:"kisiler",label:"Kişiler",icon:"users"},{id:"hashtagler",label:"Hashtagler",icon:"hash"}].map(s=>(
            <button key={s.id} onClick={e=>{e.stopPropagation();setSekme(s.id);}}
              style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:20,border:`1.5px solid ${sekme===s.id?G.blue:G.border}`,background:sekme===s.id?`${G.blue}12`:"transparent",color:sekme===s.id?G.blue:G.textMuted,fontSize:11,fontWeight:sekme===s.id?700:500,letterSpacing:"0.04em",transition:"all 0.2s",boxShadow:sekme===s.id?G.glowBlue:"none"}}>
              <Icon id={s.icon} size={12} color={sekme===s.id?G.blue:G.textMuted}/>{s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"12px 0"}}>

        {/* TÜR FİLTRELERİ */}
        {sekme==="senaryolar"&&(
          <div style={{display:"flex",gap:6,overflowX:"auto",padding:"6px 16px 12px",scrollbarWidth:"none"}}>
            {TURLER.map(t=>{
              var aktif=filtre===t;
              var renk=TURLER_RENK[t]||G.blue;
              return(
                <button key={t} onClick={()=>setFiltre(t)}
                  style={{flexShrink:0,padding:"5px 14px",borderRadius:20,border:`1.5px solid ${aktif?renk+"60":G.border}`,background:aktif?renk+"15":"transparent",color:aktif?renk:G.textMuted,fontSize:11,fontWeight:aktif?700:500,letterSpacing:"0.04em",transition:"all 0.2s",whiteSpace:"nowrap",boxShadow:aktif?`0 0 10px ${renk}20`:"none"}}>
                  {t}
                </button>
              );
            })}
          </div>
        )}

        {/* İÇERİK */}
        {yukleniyor?(
          <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}>
            <div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite",boxShadow:G.glowBlue}}/>
          </div>
        ):sekme==="senaryolar"?(
          <div style={{padding:"0 16px"}}>
            {filtreliGonderiler.length>0
              ?filtreliGonderiler.map(g=><FilmCard key={g.id} g={g} user={user} onBegen={handleBegen} onKaydet={handleKaydet}/>)
              :<div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{width:56,height:56,borderRadius:"50%",background:`${G.blue}10`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:G.glowBlue}}>
                  <Icon id="film" size={24} color={G.blue}/>
                </div>
                <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:8,letterSpacing:"0.1em"}}>SONUÇ YOK</div>
                <p style={{fontSize:13,color:G.textMuted}}>Bu filtre için senaryo bulunamadı.</p>
              </div>
            }
          </div>
        ):sekme==="kisiler"?(
          <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:8}}>
            {filtreliKisiler.length>0
              ?filtreliKisiler.map(p=><KisiKarti key={p.id} profil={p}/>)
              :<div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:8}}>KİŞİ YOK</div>
                <p style={{fontSize:13,color:G.textMuted}}>Arama sonucu bulunamadı.</p>
              </div>
            }
          </div>
        ):(
          /* HASHTAGLER */
          <div style={{padding:"0 16px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {hashtagler.filter(h=>!arama||h.etiket?.toLowerCase().includes(arama.toLowerCase())).map((h,i)=>{
                var renk=Object.values(TURLER_RENK)[i%Object.values(TURLER_RENK).length];
                return(
                  <div key={h.id} onClick={()=>window.location.href=`/hashtag/${h.etiket}`}
                    style={{background:`linear-gradient(145deg,${G.card},${G.surface})`,border:`1px solid ${G.border}`,borderRadius:14,padding:"14px",cursor:"pointer",position:"relative",transition:"all 0.2s",overflow:"hidden"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=renk+"50";e.currentTarget.style.boxShadow=`0 0 20px ${renk}15`;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                    <NeonCorners color={renk} size={8}/>
                    {/* Arka plan glow */}
                    <div style={{position:"absolute",top:0,right:0,width:60,height:60,background:`radial-gradient(circle,${renk}10,transparent 70%)`,pointerEvents:"none"}}/>
                    <div style={{fontFamily:G.fontDisp,fontSize:22,color:renk,letterSpacing:"0.05em",marginBottom:4,textShadow:`0 0 12px ${renk}30`}}>#{h.etiket}</div>
                    <div style={{fontSize:11,color:G.textMuted}}>{h.kullanim_sayisi||0} senaryo</div>
                    <div style={{position:"absolute",bottom:8,right:12,fontFamily:G.fontDisp,fontSize:28,color:`${renk}08`,letterSpacing:"0"}}>{String(i+1).padStart(2,"0")}</div>
                  </div>
                );
              })}
            </div>
            {hashtagler.length===0&&(
              <div style={{textAlign:"center",padding:"48px 0"}}>
                <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,letterSpacing:"0.1em",marginBottom:8}}>BOŞ</div>
                <p style={{fontSize:13,color:G.textMuted}}>Henüz hashtag yok.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AltNav active="/kesfet"/>
      {drawer&&<Drawer user={user} username={username} avatarUrl={avatarUrl} onClose={()=>setDrawer(false)}/>}
    </div>
  );
}
