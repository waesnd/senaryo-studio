import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

// ── MIDNIGHT ASSASSIN TEMA ────────────────────────────────────────────────────
var G = {
  black:"#0A0F1E", deep:"#0F172A", surface:"#1E293B", card:"#162032",
  border:"rgba(56,189,248,0.12)", borderHov:"rgba(56,189,248,0.4)",
  blue:"#38BDF8", blueL:"#7DD3FC", blueD:"#0EA5E9",
  blueGrad:"linear-gradient(135deg,#0EA5E9 0%,#38BDF8 40%,#7DD3FC 70%,#0EA5E9 100%)",
  purple:"#8B5CF6", purpleL:"#A78BFA", purpleD:"#7C3AED",
  purpleGrad:"linear-gradient(135deg,#7C3AED 0%,#8B5CF6 50%,#A78BFA 100%)",
  red:"#EF4444", redL:"#F87171",
  text:"#F1F5F9", textMuted:"rgba(241,245,249,0.5)", textDim:"rgba(241,245,249,0.25)",
  shadow:"0 8px 40px rgba(0,0,0,0.7)",
  glowBlue:"0 0 24px rgba(56,189,248,0.25)",
  glowPurple:"0 0 24px rgba(139,92,246,0.25)",
  glowRed:"0 0 16px rgba(239,68,68,0.3)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

var ROZETLER=[
  {label:"Yeni Kalem",    min:0,   color:"#94A3B8", aciklama:"İlk adımı at"},
  {label:"Aday Senarist", min:5,   color:G.blue,    aciklama:"5 senaryo üret"},
  {label:"Senarist",      min:20,  color:G.purple,  aciklama:"20 senaryo üret"},
  {label:"Usta Senarist", min:50,  color:G.blueL,   aciklama:"50 senaryo üret"},
  {label:"Efsane",        min:100, color:G.red,     aciklama:"100 senaryo üret"},
];
function getRozet(n){return[...ROZETLER].reverse().find(r=>(n||0)>=r.min)||ROZETLER[0];}
function getSonraki(n){return ROZETLER.find(r=>r.min>(n||0));}

// ── SVG İKONLAR ──────────────────────────────────────────────────────────────
function Icon({id,size=22,color="currentColor",strokeWidth=1.8,fill="none"}){
  var p={width:size,height:size,fill,stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="edit")return<svg {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  if(id==="logout")return<svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  if(id==="bookmark")return<svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
  if(id==="grid")return<svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
  if(id==="eye")return<svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  if(id==="heart")return<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  if(id==="camera")return<svg {...p}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
  if(id==="bell")return<svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if(id==="search")return<svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if(id==="menu")return<svg {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
  if(id==="x")return<svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  if(id==="check")return<svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
  if(id==="plus")return<svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  if(id==="link")return<svg {...p}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
  if(id==="zap")return<svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  if(id==="award")return<svg {...p}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
  if(id==="trash")return<svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
  if(id==="user-plus")return<svg {...p}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>;
  return null;
}

// ── NEON KÖŞELER ─────────────────────────────────────────────────────────────
function NeonCorners({color=G.blue,size=14,thickness=1.5}){
  var s={position:"absolute",width:size,height:size};
  var l={background:color,position:"absolute",boxShadow:`0 0 6px ${color}80`};
  return(<>
    <div style={{...s,top:0,left:0}}><div style={{...l,top:0,left:0,width:thickness,height:size}}/><div style={{...l,top:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,top:0,right:0}}><div style={{...l,top:0,right:0,width:thickness,height:size}}/><div style={{...l,top:0,right:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,left:0}}><div style={{...l,bottom:0,left:0,width:thickness,height:size}}/><div style={{...l,bottom:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,right:0}}><div style={{...l,bottom:0,right:0,width:thickness,height:size}}/><div style={{...l,bottom:0,right:0,width:size,height:thickness}}/></div>
  </>);
}

// ── AVATAR ────────────────────────────────────────────────────────────────────
function Av({url,size,ring=false,onClick}){
  return(
    <div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${G.deep},${G.surface})`,border:`2px solid ${ring?G.blue:"rgba(56,189,248,0.2)"}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:ring?`0 0 0 3px ${G.blueD}40,${G.glowBlue}`:"none",cursor:onClick?"pointer":"default"}}>
      {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.42} color="rgba(56,189,248,0.4)"/>}
    </div>
  );
}

// ── DRAWER ────────────────────────────────────────────────────────────────────
var DRAWER_ITEMS=[
  {href:"/",        label:"Ana Sayfa",    id:"home"},
  {href:"/uret",    label:"Senaryo Üret", id:"film",    badge:"AI"},
  {href:"/kesfet",  label:"Keşfet",       id:"compass"},
  {href:"/topluluk",label:"Topluluk",     id:"users"},
  {href:"/mesajlar",label:"Mesajlar",     id:"chat"},
];

function Drawer({user,profil,avatarUrl,username,kaydedilenler,senaryolar,onClose,onEditMode}){
  var [exitModal,setExitModal]=useState(false);
  var rozet=getRozet(profil?.senaryo_sayisi);
  var toplamBegeni=senaryolar.reduce((a,s)=>a+(s.begeni_sayisi||0),0);
  var toplamGorunum=senaryolar.reduce((a,s)=>a+(s.goruntuleme_sayisi||0),0);

  return(<>
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,5,20,0.85)",backdropFilter:"blur(8px)"}}/>
    <div style={{position:"fixed",top:0,left:0,bottom:0,zIndex:201,width:300,background:`linear-gradient(180deg,${G.black} 0%,${G.deep} 100%)`,borderRight:`1px solid ${G.border}`,display:"flex",flexDirection:"column",boxShadow:`8px 0 60px rgba(0,0,0,0.9)`}}>
      <div style={{height:2,background:G.blueGrad,flexShrink:0,boxShadow:`0 0 20px rgba(56,189,248,0.5)`}}/>

      {/* Profil başlık */}
      <div style={{padding:"20px 20px 16px",borderBottom:`1px solid ${G.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <Av url={avatarUrl} size={50} ring/>
          <button onClick={onClose} style={{background:`${G.blue}08`,border:`1px solid ${G.border}`,borderRadius:10,padding:"6px 12px",color:G.textMuted,fontSize:12}}>✕</button>
        </div>
        {profil?.nickname&&<p style={{fontSize:16,fontWeight:800,color:G.text,marginBottom:2}}>{profil.nickname}</p>}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <p style={{fontSize:12,color:G.textMuted}}>@{username}</p>
          {profil?.dogrulandi&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:20,background:`${G.blue}20`,color:G.blue,fontWeight:700,boxShadow:`0 0 6px ${G.blue}30`}}>✓</span>}
        </div>
        {/* Aktif rozet */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8,padding:"5px 10px",borderRadius:8,background:`${rozet.color}10`,border:`1px solid ${rozet.color}25`,width:"fit-content"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:rozet.color,boxShadow:`0 0 6px ${rozet.color}`}}/>
          <span style={{fontSize:11,fontWeight:700,color:rozet.color}}>{rozet.label}</span>
        </div>
      </div>

      <nav style={{flex:1,overflowY:"auto",padding:"12px"}}>
        {/* Beğeni & Görüntüleme */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
          {[
            {label:"Beğeni",val:toplamBegeni,color:G.red,icon:"heart"},
            {label:"Görüntüleme",val:toplamGorunum,color:G.blue,icon:"eye"},
          ].map(s=>(
            <div key={s.label} style={{background:`${G.surface}`,border:`1px solid ${G.border}`,borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:8,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 0% 50%,${s.color}08,transparent 70%)`}}/>
              <div style={{width:28,height:28,borderRadius:8,background:`${s.color}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 0 8px ${s.color}20`}}>
                <Icon id={s.icon} size={13} color={s.color}/>
              </div>
              <div>
                <div style={{fontFamily:G.fontDisp,fontSize:18,color:s.color,lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:9,color:G.textDim,letterSpacing:"0.06em"}}>{s.label.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Rozetler */}
        <div style={{marginBottom:10,padding:"12px",background:G.surface,borderRadius:12,border:`1px solid ${G.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
            <Icon id="award" size={13} color={G.blue}/>
            <p style={{fontSize:10,fontWeight:700,color:G.blue,letterSpacing:"0.1em"}}>ROZETLER</p>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {ROZETLER.map(r=>{
              var kazanildi=(profil?.senaryo_sayisi||0)>=r.min;
              return(
                <div key={r.label} title={`${r.label} — ${r.aciklama}`} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",borderRadius:20,background:kazanildi?`${r.color}15`:"rgba(255,255,255,0.03)",border:`1px solid ${kazanildi?r.color+"30":"rgba(255,255,255,0.05)"}`,opacity:kazanildi?1:0.35,boxShadow:kazanildi?`0 0 8px ${r.color}20`:"none",transition:"all 0.2s"}}>
                  {kazanildi?<div style={{width:5,height:5,borderRadius:"50%",background:r.color,boxShadow:`0 0 4px ${r.color}`}}/>:<div style={{width:5,height:5,borderRadius:"50%",background:G.textDim}}/>}
                  <span style={{fontSize:9,fontWeight:700,color:kazanildi?r.color:G.textDim}}>{r.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kaydedilenler */}
        <button onClick={()=>{window.location.href="/kaydedilenler";onClose();}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,marginBottom:2,color:G.textMuted,background:"transparent",border:"none",width:"100%",textAlign:"left",cursor:"pointer",transition:"all 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=`${G.blue}08`}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:32,height:32,borderRadius:8,background:`${G.blue}10`,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon id="bookmark" size={15} color={G.blue}/></div>
          <span style={{fontSize:14,flex:1}}>Kaydedilenler</span>
          <span style={{fontSize:11,color:G.textDim,background:G.surface,padding:"2px 8px",borderRadius:20}}>{kaydedilenler.length}</span>
        </button>

        {/* Profil Düzenle */}
        <button onClick={()=>{onEditMode();onClose();}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,marginBottom:2,color:G.blue,background:"transparent",border:"none",width:"100%",textAlign:"left",cursor:"pointer",transition:"all 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=`${G.blue}08`}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{width:32,height:32,borderRadius:8,background:`${G.blue}10`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:G.glowBlue}}><Icon id="edit" size={15} color={G.blue}/></div>
          <span style={{fontSize:14,flex:1,fontWeight:600}}>Profili Düzenle</span>
        </button>

        <div style={{height:1,background:G.border,margin:"8px 0"}}/>

        {DRAWER_ITEMS.map(item=>{
          var active=typeof window!=="undefined"&&window.location.pathname===item.href;
          return(
            <a key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,marginBottom:2,color:active?G.blue:G.textMuted,background:active?`${G.blue}08`:"transparent",fontWeight:active?700:500,fontSize:14,border:`1px solid ${active?G.border:"transparent"}`,textDecoration:"none",transition:"all 0.15s"}}>
              <Icon id={item.id} size={18} color={active?G.blue:G.textMuted}/>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge&&<span style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,background:G.purple,color:"#fff",boxShadow:G.glowPurple}}>{item.badge}</span>}
            </a>
          );
        })}

        <div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${G.border}`}}>
          {user&&<button onClick={()=>setExitModal(true)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,color:G.red,fontSize:14,background:`${G.red}08`,border:"none",width:"100%",textAlign:"left",cursor:"pointer"}}>
            <div style={{width:32,height:32,borderRadius:8,background:`${G.red}10`,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon id="logout" size={15} color={G.red}/></div>
            <span style={{fontWeight:600}}>Çıkış Yap</span>
          </button>}
        </div>
      </nav>
    </div>

    {exitModal&&<>
      <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:301,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{background:G.surface,border:`1px solid ${G.borderHov}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:300,textAlign:"center",position:"relative",boxShadow:G.glowRed}}>
          <NeonCorners color={G.red}/>
          <h3 style={{fontFamily:G.fontDisp,fontSize:22,color:G.text,marginBottom:8}}>ÇIKIŞ YAP</h3>
          <p style={{fontSize:13,color:G.textMuted,marginBottom:22}}>Hesabından çıkmak istediğine emin misin?</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setExitModal(false)} style={{flex:1,padding:"12px",borderRadius:12,background:"rgba(241,245,249,0.05)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:13,fontWeight:600,cursor:"pointer"}}>İptal</button>
            <button onClick={async()=>{try{await supabase.auth.signOut();}catch(e){console.error("[profil] çıkış hatası:", e?.message||e);}finally{window.location.replace("/");}}} style={{flex:1,padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${G.red},${G.redL})`,border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:G.glowRed}}>Çıkış</button>
          </div>
        </div>
      </div>
    </>}
  </>);
}

// ── ALT NAV ───────────────────────────────────────────────────────────────────
function AltNav({active="/profil"}){
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

// ── BANNER ────────────────────────────────────────────────────────────────────
function ProfileBanner({senaryolar}){
  var turAccent={"Gerilim":G.red,"Drama":G.blue,"Bilim Kurgu":G.blueL,"Komedi":"#FBBF24","Romantik":"#F472B6","Korku":G.purple,"Aksiyon":G.red,"Fantastik":G.purpleL};
  var items=senaryolar.length>0?senaryolar:Array(6).fill(null);
  return(
    <div style={{background:G.black,borderBottom:`1px solid ${G.border}`,overflow:"hidden",position:"relative"}}>
      {/* Arka plan neon ışık */}
      <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 30% 50%,${G.blue}08,transparent 60%),radial-gradient(ellipse at 70% 50%,${G.purple}06,transparent 60%)`,pointerEvents:"none"}}/>
      {/* Üst tarama çizgisi */}
      <div style={{height:14,background:G.deep,borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:5,padding:"0 8px"}}>
        {Array(20).fill(0).map((_,i)=><div key={i} style={{width:7,height:9,borderRadius:2,background:G.surface,border:`1px solid ${G.border}`,flexShrink:0}}/>)}
      </div>
      {/* Film kareleri */}
      <div style={{display:"flex",overflowX:"auto",gap:3,padding:"4px 0",scrollbarWidth:"none",background:`${G.black}`}}>
        {items.map((s,i)=>{
          var accent=s?turAccent[s.tur]||G.blue:G.blue;
          return(
            <div key={i} onClick={()=>s&&(window.location.href=`/senaryo/${s.id}`)}
              style={{width:88,height:60,flexShrink:0,background:s?`linear-gradient(160deg,${G.surface},${G.card})`:G.deep,border:`1px solid ${G.border}`,position:"relative",cursor:s?"pointer":"default",overflow:"hidden",transition:"border-color 0.2s"}}
              onMouseEnter={e=>s&&(e.currentTarget.style.borderColor=accent+"60")}
              onMouseLeave={e=>e.currentTarget.style.borderColor=G.border}
            >
              {s?(
                <>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:accent,opacity:0.7,boxShadow:`0 0 8px ${accent}`}}/>
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"5px",background:"linear-gradient(to top,rgba(0,0,0,0.8),transparent)"}}>
                    <p style={{fontFamily:G.fontDisp,fontSize:9,color:G.text,lineHeight:1.2,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s.baslik}</p>
                  </div>
                  <div style={{position:"absolute",top:4,right:4,fontSize:7,fontWeight:700,padding:"1px 4px",borderRadius:3,background:`${accent}20`,color:accent,letterSpacing:"0.04em",border:`1px solid ${accent}30`}}>{s.tur}</div>
                </>
              ):(
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.12}}>
                  <Icon id="film" size={20} color={G.blue}/>
                </div>
              )}
              <div style={{position:"absolute",bottom:1,left:2,fontSize:6,color:"rgba(255,255,255,0.1)",fontFamily:"monospace"}}>{String(i+1).padStart(3,"0")}</div>
            </div>
          );
        })}
      </div>
      {/* Alt tarama çizgisi */}
      <div style={{height:14,background:G.deep,borderTop:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:5,padding:"0 8px"}}>
        {Array(20).fill(0).map((_,i)=><div key={i} style={{width:7,height:9,borderRadius:2,background:G.surface,border:`1px solid ${G.border}`,flexShrink:0}}/>)}
      </div>
    </div>
  );
}

// ── SENARYO KARTI ─────────────────────────────────────────────────────────────
function SenaryoKarti({s,onDelete}){
  var [hov,setHov]=useState(false);
  var turAccent={"Gerilim":G.red,"Drama":G.blue,"Bilim Kurgu":G.blueL,"Komedi":"#FBBF24","Romantik":"#F472B6","Korku":G.purple,"Aksiyon":G.red,"Fantastik":G.purpleL,"Suç":"#94A3B8","Tarihi":"#D97706"};
  var accent=turAccent[s.tur]||G.blue;
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>window.location.href=`/senaryo/${s.id}`}
      style={{background:`linear-gradient(160deg,${G.card},${G.surface})`,border:`1px solid ${hov?accent+"50":G.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"all 0.25s",boxShadow:hov?`0 0 20px ${accent}15`:G.shadow,position:"relative"}}
    >
      <NeonCorners color={hov?accent:G.blue} size={10}/>
      {/* Tür rengi üst şerit */}
      <div style={{height:2,background:accent,opacity:hov?1:0.4,boxShadow:hov?`0 0 8px ${accent}`:"none",transition:"all 0.25s"}}/>
      <div style={{padding:"10px 10px 8px"}}>
        <h3 style={{fontFamily:G.fontDisp,fontSize:16,color:G.text,lineHeight:1.2,marginBottom:6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s.baslik}</h3>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
          <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,background:`${accent}15`,color:accent,border:`1px solid ${accent}25`,letterSpacing:"0.05em",textTransform:"uppercase"}}>{s.tur}</span>
          <span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:"rgba(241,245,249,0.05)",color:G.textDim,border:`1px solid ${G.border}`}}>{s.tip}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,borderTop:`1px solid ${G.border}`,paddingTop:6}}>
          <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:G.textDim}}>
            <Icon id="heart" size={10} color={G.red}/>{s.begeni_sayisi||0}
          </span>
          <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:G.textDim}}>
            <Icon id="eye" size={10} color={G.blue}/>{s.goruntuleme_sayisi||0}
          </span>
          {onDelete&&<button onClick={(e)=>{e.stopPropagation();onDelete(s.id);}} style={{marginLeft:"auto",background:"none",border:"none",color:G.red,fontSize:10,fontWeight:700,padding:"2px 6px",cursor:"pointer"}}>sil</button>}
        </div>
      </div>
    </div>
  );
}

// ── ANA SAYFA ─────────────────────────────────────────────────────────────────
export default function Profil(){
  var {user, profil: authProfil, authHazir, setProfil, okunmayanBildirim=0} = useAuth();
  var [profil, setProfilLokal] = useState(null);
  var [senaryolar,setSenaryolar]=useState([]);
  var [kaydedilenler,setKaydedilenler]=useState([]);
  var [yukleniyor,setYukleniyor]=useState(true);
  var [drawer,setDrawer]=useState(false);
  var [editMode,setEditMode]=useState(false);
  var [editData,setEditData]=useState({});
  var [avatarModal,setAvatarModal]=useState(false);
  var [avatarYukleniyor,setAvatarYukleniyor]=useState(false);
  var [bannerYukleniyor,setBannerYukleniyor]=useState(false);
  var [bannerModal,setBannerModal]=useState(false);
  var fileRef=useRef();
  var bannerRef=useRef();

  var avatarUrl=profil?.avatar_url||null;
  var username=profil?.username||(user?user.email?.split("@")[0]:"");
  var rozet=getRozet(profil?.senaryo_sayisi);
  var sonraki=getSonraki(profil?.senaryo_sayisi);
  var ilerleme=sonraki?Math.min(100,Math.round(((profil?.senaryo_sayisi||0)-rozet.min)/(sonraki.min-rozet.min)*100)):100;

  // authProfil hazır olunca local state'i doldur
  useEffect(()=>{
    var aktif = true;

    async function init(){
      if(!authHazir) return;

      if(!user){
        window.location.href="/";
        return;
      }

      try{
        if(authProfil && aktif){
          setProfilLokal(authProfil);
          setEditData({
            bio: authProfil.bio || "",
            website: authProfil.website || "",
            nickname: authProfil.nickname || "",
          });
        }

        await Promise.all([
          loadSenaryolar(user.id),
          loadKaydedilenler(user.id),
        ]);
      }finally{
        if(aktif) setYukleniyor(false);
      }
    }

    init();

    return ()=>{ aktif = false; };
  },[authHazir, user, authProfil]);
  async function loadProfil(u){
    var{data}=await supabase.from("profiles").select("*").eq("id",u.id).single();
    if(data){ setProfilLokal(data); setProfil(data); setEditData({bio:data.bio||"",website:data.website||"",nickname:data.nickname||""}); }
  }
  async function loadSenaryolar(uid){
    try{
      var{data,error}=await supabase
        .from("senaryolar")
        .select("*")
        .eq("user_id",uid)
        .order("created_at",{ascending:false});

      if(error){
        console.error("[profil] senaryolar yüklenemedi:", error.message);
        setSenaryolar([]);
        return;
      }

      if(data)setSenaryolar(data);
    }catch(err){
      console.error("[profil] loadSenaryolar beklenmeyen hata:", err);
      setSenaryolar([]);
    }
  }
  async function loadKaydedilenler(uid){
    try{
      var { data: kayitlar, error } = await supabase
        .from("kaydedilenler")
        .select("*")
        .eq("user_id",uid)
        .order("created_at",{ascending:false});

      if(error){
        console.error("[profil] kaydedilenler yüklenemedi:", error.message);
        setKaydedilenler([]);
        return;
      }

      var ids = Array.from(new Set((kayitlar || []).map(function(k){ return k.senaryo_id || k.gonderi_id; }).filter(Boolean)));
      if(ids.length === 0){
        setKaydedilenler([]);
        return;
      }

      var { data: savedSenaryolar, error: sErr } = await supabase
        .from("senaryolar")
        .select("*")
        .in("id", ids);

      if(sErr){
        console.error("[profil] kaydedilen senaryolar yüklenemedi:", sErr.message);
        setKaydedilenler([]);
        return;
      }

      setKaydedilenler(savedSenaryolar || []);
    }catch(err){
      console.error("[profil] loadKaydedilenler beklenmeyen hata:", err);
      setKaydedilenler([]);
    }
  }
  async function avatarDegistir(e){
    var file=e.target.files?.[0];
    if(!file||!user)return;
    setAvatarYukleniyor(true);
    var fd=new FormData();
    fd.append("file",file);fd.append("upload_preset","scriptify_avatars");
    var uploadRes=await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload",{method:"POST",body:fd});
    var uploadData=await uploadRes.json();
    if(uploadData.secure_url){
      // Cache buster ekle — tarayıcı eski görseli göstermesin
      var url=uploadData.secure_url+"?v="+Date.now();
      var {data:updated, error}=await supabase
        .from("profiles")
        .update({avatar_url:url})
        .eq("id",user.id)
        .select()
        .maybeSingle();
      console.log("[avatar] DB update:", {updated, error});
      if(error){
        alert("Fotoğraf kaydedilemedi: "+error.message);
      }else if(updated){
        setProfilLokal(p=>({...p,avatar_url:updated.avatar_url}));
        setProfil(p=>p?({...p,avatar_url:updated.avatar_url}):p);
      }
    }else{
      alert("Fotoğraf yüklenemedi: "+(uploadData.error?.message||"Cloudinary hatası"));
    }
    setAvatarYukleniyor(false);
  }
  async function bannerDegistir(e){
    var file = e.target.files?.[0];
    if(!file || !user) return;

    setBannerYukleniyor(true);

    try{
      var fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "scriptify_avatars");

      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", {
        method:"POST",
        body:fd
      });

      var data = await res.json();

      if(!data.secure_url){
        throw new Error(data.error?.message || "Banner yüklenemedi");
      }

      var bannerUrl = data.secure_url + "?v=" + Date.now();

      var { data: updated, error } = await supabase
        .from("profiles")
        .update({ banner_url: bannerUrl })
        .eq("id", user.id)
        .select()
        .maybeSingle();

      if(error) throw new Error(error.message);

      if(updated){
        setProfilLokal(p => p ? ({ ...p, banner_url: updated.banner_url }) : p);
        setProfil(p => p ? ({ ...p, banner_url: updated.banner_url }) : p);
      }

      setBannerModal(false);
    }catch(err){
      alert("Banner kaydedilemedi: " + err.message);
    }finally{
      setBannerYukleniyor(false);
      if(e.target) e.target.value = "";
    }
  }
  async function bannerSil(){
    if(!user) return;

    try{
      var { error } = await supabase
        .from("profiles")
        .update({ banner_url: null })
        .eq("id", user.id);

      if(error) throw new Error(error.message);

      setProfilLokal(p => p ? ({ ...p, banner_url: null }) : p);
      setProfil(p => p ? ({ ...p, banner_url: null }) : p);
      setBannerModal(false);
    }catch(err){
      alert("Banner silinemedi: " + err.message);
    }
  }
  // URL güvenlik kontrolü — sadece http/https kabul et
  function guvenliUrl(url){
    if(!url) return null;
    try{
      var u = new URL(url);
      if(u.protocol !== "http:" && u.protocol !== "https:") return null;
      return u.href;
    }catch(e){
      // protokol yoksa https ekleyip tekrar dene
      try{
        var u2 = new URL("https://" + url);
        return u2.href;
      }catch(e2){ return null; }
    }
  }

  async function profilKaydet(){
    if(!user) return;

    try{
      var temizWebsite = editData.website ? guvenliUrl(editData.website) : null;

      var payload = {
        bio: editData.bio || "",
        website: temizWebsite,
        nickname: editData.nickname || "",
      };

      var { data: updated, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id)
        .select()
        .maybeSingle();

      if(error) throw new Error(error.message);

      if(updated){
        setProfilLokal(updated);
        setProfil(updated);
        setEditData({
          bio: updated.bio || "",
          website: updated.website || "",
          nickname: updated.nickname || "",
        });
      }

      setEditMode(false);
    }catch(err){
      alert("Profil kaydedilemedi: " + err.message);
    }
  }


  async function senaryoSil(senaryoId){
    if(!user || !senaryoId) return;
    var onay = true;
    try{
      if(typeof window !== "undefined") onay = window.confirm("Bu senaryoyu silmek istediğine emin misin?");
    }catch(_){}
    if(!onay) return;

    try{
      await Promise.allSettled([
        supabase.from("gonderiler").delete().eq("senaryo_id", senaryoId).eq("user_id", user.id),
        supabase.from("kaydedilenler").delete().eq("senaryo_id", senaryoId),
        supabase.from("begeniler").delete().eq("senaryo_id", senaryoId),
        supabase.from("yorumlar").delete().eq("senaryo_id", senaryoId),
        supabase.from("senaryo_versiyonlar").delete().eq("senaryo_id", senaryoId),
      ]);

      var { error } = await supabase
        .from("senaryolar")
        .delete()
        .eq("id", senaryoId)
        .eq("user_id", user.id);

      if(error){
        throw error;
      }

      var yeniListe = senaryolar.filter(function(s){ return s.id !== senaryoId; });
      setSenaryolar(yeniListe);
      if(profil){
        var yeniProfil = { ...profil, senaryo_sayisi: Math.max(0, yeniListe.length) };
        setProfilLokal(yeniProfil);
        if(setProfil) setProfil(yeniProfil);
      }
    }catch(err){
      console.error("[profil] senaryoSil hatası:", err?.message || err);
      alert("Senaryo silinemedi.");
    }
  }

  if(yukleniyor)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:32,height:32,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite",boxShadow:G.glowBlue}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .skeleton{background:linear-gradient(90deg,#1E293B 25%,#243048 50%,#1E293B 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.blueD};border-radius:2px;}
        ::selection{background:rgba(56,189,248,0.2);color:${G.blueL};}
        input,textarea{background:${G.surface};border:1px solid ${G.border};border-radius:10px;padding:10px 12px;color:${G.text};font-size:13px;outline:none;width:100%;font-family:'DM Sans',sans-serif;}
        input:focus,textarea:focus{border-color:${G.blueD};box-shadow:0 0 0 2px ${G.blue}20;}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:`rgba(10,15,30,0.95)`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}18,transparent)`,pointerEvents:"none"}}/>
        <a href="/" style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",padding:0}}>
          <img src="/logo.png" alt="Scriptify" style={{height:40,objectFit:"contain",maxWidth:120}}/>
        </a>
        <button onClick={()=>setDrawer(true)} style={{width:34,height:34,borderRadius:10,background:`${G.blue}08`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Icon id="menu" size={16} color={G.blue}/>
        </button>
      </div>

      {/* BANNER */}
      <div style={{position:"relative",height:140,overflow:"hidden",cursor:"pointer"}} onClick={()=>setBannerModal(true)}>
        {profil?.banner_url
          ?<img src={profil.banner_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
          :<div style={{height:"100%",background:`linear-gradient(135deg,${G.deep},${G.surface})`,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${G.blue}05 1px,transparent 1px),linear-gradient(90deg,${G.blue}05 1px,transparent 1px)`,backgroundSize:"30px 30px"}}/>
            <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 30% 50%,${G.blue}08,transparent 60%)`}}/>
            <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 80% 30%,${G.purple}06,transparent 50%)`}}/>
          </div>
        }
        {/* Banner düzenle butonu */}
        <div style={{position:"absolute",bottom:10,right:12,display:"flex",gap:6}}>
          <button onClick={e=>{e.stopPropagation();setBannerModal(true);}}
            style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:20,background:"rgba(10,15,30,0.75)",backdropFilter:"blur(8px)",border:`1px solid ${G.border}`,color:G.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {bannerYukleniyor
              ?<div style={{width:10,height:10,border:`1.5px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
              :<Icon id="camera" size={11} color={G.blue}/>
            }
            Banner
          </button>
        </div>
        <input ref={bannerRef} type="file" accept="image/*" onChange={bannerDegistir} style={{display:"none"}}/>
      </div>

      {/* PROFİL ALANI */}
      <div style={{padding:"20px 16px 0",maxWidth:640,margin:"0 auto"}}>

        {/* Avatar + Bilgi */}
        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:20}}>
          {/* Avatar */}
          <div style={{position:"relative",flexShrink:0}} onClick={()=>setAvatarModal(true)}>
            <Av url={avatarUrl} size={82} ring/>
            <div style={{position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:G.blueGrad,border:`2px solid ${G.black}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:G.glowBlue}}>
              {avatarYukleniyor
                ?<div style={{width:11,height:11,border:"1.5px solid rgba(0,0,0,0.3)",borderTopColor:"#000",borderRadius:"50%",animation:"spin 0.6s linear infinite"}}/>
                :<Icon id="camera" size={11} color="#0A0F1E" strokeWidth={2.5}/>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={avatarDegistir} style={{display:"none"}}/>
          </div>

          {/* İsim & rozet */}
          <div style={{flex:1,minWidth:0}}>
            {profil?.nickname&&<h1 style={{fontFamily:G.fontDisp,fontSize:26,letterSpacing:"0.04em",color:G.text,lineHeight:1.1,marginBottom:2}}>{profil.nickname}</h1>}
            <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:6}}>
              <span style={{fontSize:profil?.nickname?12:20,color:profil?.nickname?G.textMuted:G.text,fontFamily:profil?.nickname?G.fontBody:G.fontDisp,fontWeight:profil?.nickname?500:800,letterSpacing:profil?.nickname?"0":"0.05em"}}>@{username}</span>
              {profil?.dogrulandi&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${G.blue}15`,color:G.blue,fontWeight:700,boxShadow:`0 0 8px ${G.blue}30`}}>✓ Doğrulandı</span>}
            </div>
            {/* Rozet pill */}
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:20,background:`${rozet.color}10`,border:`1px solid ${rozet.color}25`,width:"fit-content",marginBottom:8}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:rozet.color,boxShadow:`0 0 6px ${rozet.color}`}}/>
              <span style={{fontSize:11,fontWeight:700,color:rozet.color}}>{rozet.label}</span>
            </div>
            {profil?.bio&&!editMode&&<p style={{fontSize:13,color:G.textMuted,lineHeight:1.6}}>{profil.bio}</p>}
            {profil?.website&&!editMode&&guvenliUrl(profil.website)&&(
              <a href={guvenliUrl(profil.website)} target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",gap:5,marginTop:6,fontSize:12,color:G.blue}}>
                <Icon id="link" size={12} color={G.blue}/>
                {guvenliUrl(profil.website).replace(/https?:\/\//,"")}
              </a>
            )}
          </div>
        </div>

        {/* Düzenleme formu */}
        {editMode&&(
          <div style={{background:G.surface,border:`1px solid ${G.borderHov}`,borderRadius:16,padding:"18px",marginBottom:16,position:"relative",animation:"fadeUp 0.3s ease",boxShadow:G.glowBlue}}>
            <NeonCorners color={G.blue}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <span style={{fontFamily:G.fontDisp,fontSize:16,color:G.blue,letterSpacing:"0.08em"}}>PROFİL DÜZENLE</span>
              <button onClick={()=>setEditMode(false)} style={{background:"none",border:"none",color:G.textMuted,cursor:"pointer"}}><Icon id="x" size={16} color={G.textMuted}/></button>
            </div>
            {[
              {key:"nickname",label:"Takma Ad",ph:"Görünen adın..."},
              {key:"bio",label:"Bio",ph:"Kendini tanıt...",ta:true},
              {key:"website",label:"Website",ph:"https://..."},
            ].map(f=>(
              <div key={f.key} style={{marginBottom:12}}>
                <label style={{fontSize:10,fontWeight:700,color:G.blue,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>{f.label}</label>
                {f.ta
                  ?<textarea value={editData[f.key]||""} onChange={e=>setEditData(p=>({...p,[f.key]:e.target.value}))} rows={3} placeholder={f.ph} style={{resize:"vertical"}}/>
                  :<input value={editData[f.key]||""} onChange={e=>setEditData(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}/>
                }
              </div>
            ))}
            <button onClick={profilKaydet} style={{width:"100%",padding:"12px",borderRadius:12,background:G.blueGrad,border:"none",color:G.black,fontSize:13,fontWeight:800,letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:G.glowBlue}}>Kaydet</button>
          </div>
        )}

        {/* İlerleme çubuğu */}
        {sonraki&&(
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:14,padding:"12px 14px",marginBottom:16,position:"relative"}}>
            <NeonCorners color={rozet.color} size={8}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:11,color:G.textMuted}}><b style={{color:rozet.color}}>{rozet.label}</b> → {sonraki.label}</span>
              <span style={{fontSize:11,color:G.textDim}}>{profil?.senaryo_sayisi||0}/{sonraki.min}</span>
            </div>
            <div style={{height:4,borderRadius:2,background:`${G.border}`,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:2,background:G.blueGrad,width:`${ilerleme}%`,transition:"width 1s ease",boxShadow:`0 0 8px ${G.blue}50`}}/>
            </div>
          </div>
        )}

        {/* İSTATİSTİKLER — Senaryo / Takipçi / Takip */}
        <div style={{display:"flex",gap:8,marginBottom:20,animation:"fadeUp 0.4s ease"}}>
          {[
            {label:"SENARYO", val:profil?.senaryo_sayisi||senaryolar.length, color:G.blue,   icon:"film"},
            {label:"TAKİPÇİ", val:profil?.takipci_sayisi||0,                 color:G.blue,   icon:"users"},
            {label:"TAKİP",   val:profil?.takip_sayisi||0,                   color:G.purple, icon:"user-plus"},
          ].map(s=>(
            <div key={s.label} style={{flex:1,background:G.surface,border:`1px solid ${G.border}`,borderRadius:14,padding:"14px 10px",textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 0%,${s.color}08,transparent 60%)`}}/>
              <div style={{display:"flex",justifyContent:"center",marginBottom:6}}>
                <div style={{width:32,height:32,borderRadius:8,background:`${s.color}12`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 10px ${s.color}20`}}>
                  <Icon id={s.icon} size={16} color={s.color}/>
                </div>
              </div>
              <div style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.05em",color:s.color,lineHeight:1,boxShadow:"none"}}>{s.val}</div>
              <div style={{fontSize:9,color:G.textDim,marginTop:4,letterSpacing:"0.08em"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* SENARYOLARIM başlık */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${G.border}`}}>
          <div style={{width:28,height:28,borderRadius:8,background:`${G.blue}12`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:G.glowBlue}}>
            <Icon id="grid" size={13} color={G.blue}/>
          </div>
          <span style={{fontFamily:G.fontDisp,fontSize:15,letterSpacing:"0.1em",color:G.blue}}>SENARYOLARIM</span>
          <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${G.blue}15`,color:G.blue,border:`1px solid ${G.blue}25`}}>{senaryolar.length}</span>
        </div>

        {/* SENARYO GRID */}
        {senaryolar.length>0?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,paddingBottom:20}}>
            {senaryolar.map(s=><SenaryoKarti key={s.id} s={s} onDelete={senaryoSil}/>)}
          </div>
        ):(
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:`${G.blue}10`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:G.glowBlue}}>
              <Icon id="film" size={24} color={G.blue}/>
            </div>
            <div style={{fontFamily:G.fontDisp,fontSize:32,color:G.textDim,marginBottom:8,letterSpacing:"0.1em"}}>BOŞ SAHNE</div>
            <div style={{display:"flex",justifyContent:"center"}}>
              <a href="/uret" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:12,background:G.blueGrad,color:G.black,fontSize:13,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase",boxShadow:G.glowBlue}}>
                <Icon id="zap" size={14} color={G.black}/>Üret
              </a>
            </div>
          </div>
        )}
      </div>

      {/* AVATAR MODAL */}
      {/* BANNER MODAL */}
      {bannerModal&&<>
        <div onClick={()=>setBannerModal(false)} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,5,20,0.9)",backdropFilter:"blur(10px)"}}/>
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:401,background:`linear-gradient(180deg,${G.surface},${G.deep})`,border:`1px solid ${G.borderHov}`,borderRadius:"24px 24px 0 0",padding:"20px 20px env(safe-area-inset-bottom,24px)",boxShadow:`0 -20px 60px rgba(0,0,0,0.8),${G.glowBlue}`}}>
          <div style={{width:36,height:3,borderRadius:2,background:G.border,margin:"0 auto 16px"}}/>
          <h3 style={{fontFamily:G.fontDisp,fontSize:18,letterSpacing:"0.08em",color:G.text,marginBottom:6}}>BANNER</h3>
          <p style={{fontSize:12,color:G.textMuted,marginBottom:18}}>1500×500 önerilen boyut · JPG veya PNG</p>
          <button onClick={()=>{setBannerModal(false);bannerRef.current?.click();}}
            style={{display:"flex",alignItems:"center",gap:14,width:"100%",padding:"14px 16px",marginBottom:10,borderRadius:14,background:`${G.blue}08`,border:`1px solid ${G.blue}20`,color:G.text,fontSize:14,cursor:"pointer",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${G.blue}14`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${G.blue}08`;}}>
            <div style={{width:40,height:40,borderRadius:12,background:G.blueGrad,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:G.glowBlue}}>
              <Icon id="camera" size={18} color={G.black}/>
            </div>
            <div><p style={{fontSize:14,fontWeight:700,color:G.text}}>Fotoğraf Yükle</p><p style={{fontSize:11,color:G.textMuted,marginTop:2}}>Galeriden seç</p></div>
          </button>
          {profil?.banner_url&&(
            <button onClick={bannerSil}
              style={{display:"flex",alignItems:"center",gap:14,width:"100%",padding:"14px 16px",borderRadius:14,background:`${G.red}08`,border:`1px solid ${G.red}20`,color:G.red,fontSize:14,cursor:"pointer",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${G.red}14`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${G.red}08`;}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${G.red}15`,border:`1px solid ${G.red}25`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon id="trash" size={18} color={G.red}/>
              </div>
              <div><p style={{fontSize:14,fontWeight:700}}>Fotoğrafı Sil</p><p style={{fontSize:11,color:G.textMuted,marginTop:2}}>Banner kaldırılır</p></div>
            </button>
          )}
        </div>
      </>}

            {avatarModal&&<>
        <div onClick={()=>setAvatarModal(false)} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,5,20,0.9)",backdropFilter:"blur(12px)"}}/>
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:401,background:G.deep,border:`1px solid ${G.borderHov}`,borderRadius:"24px 24px 0 0",padding:"24px 20px env(safe-area-inset-bottom,24px)",boxShadow:`0 -20px 60px rgba(0,0,0,0.8),${G.glowBlue}`}}>
          <div style={{width:36,height:3,borderRadius:2,background:G.border,margin:"0 auto 20px"}}/>
          {/* Önizleme */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <div style={{width:96,height:96,borderRadius:"50%",background:G.surface,border:`3px solid ${G.blue}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:G.glowBlue}}>
              {avatarUrl?<img src={avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={40} color="rgba(56,189,248,0.4)"/>}
            </div>
          </div>
          {/* Yükle */}
          <button onClick={()=>{setAvatarModal(false);fileRef.current?.click();}} style={{display:"flex",alignItems:"center",gap:14,width:"100%",padding:"14px 16px",marginBottom:10,borderRadius:14,background:`${G.blue}08`,border:`1px solid ${G.blue}20`,color:G.text,fontSize:14,cursor:"pointer",transition:"all 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.background=`${G.blue}15`}
            onMouseLeave={e=>e.currentTarget.style.background=`${G.blue}08`}>
            <div style={{width:40,height:40,borderRadius:12,background:`${G.blue}15`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:G.glowBlue}}>
              <Icon id="camera" size={18} color={G.blue}/>
            </div>
            <div>
              <div style={{fontWeight:700,marginBottom:2}}>Fotoğraf Yükle</div>
              <div style={{fontSize:11,color:G.textMuted}}>Galerinden bir fotoğraf seç</div>
            </div>
          </button>
          {/* Sil */}
          {avatarUrl&&<button onClick={async()=>{
            try{
              var { error } = await supabase.from("profiles").update({avatar_url:null}).eq("id",user.id);
              if(error) throw new Error(error.message);
              setProfilLokal(p => p ? ({...p, avatar_url:null}) : p);
              setProfil(p => p ? ({...p, avatar_url:null}) : p);
              setAvatarModal(false);
            }catch(err){
              alert("Fotoğraf silinemedi: " + err.message);
            }
          }}
            style={{display:"flex",alignItems:"center",gap:14,width:"100%",padding:"14px 16px",borderRadius:14,background:`${G.red}08`,border:`1px solid ${G.red}20`,color:G.red,fontSize:14,cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.background=`${G.red}15`}
            onMouseLeave={e=>e.currentTarget.style.background=`${G.red}08`}>
            <div style={{width:40,height:40,borderRadius:12,background:`${G.red}15`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:G.glowRed}}>
              <Icon id="trash" size={18} color={G.red}/>
            </div>
            <div>
              <div style={{fontWeight:700,marginBottom:2}}>Fotoğrafı Sil</div>
              <div style={{fontSize:11,color:"rgba(239,68,68,0.6)"}}>Profil fotoğrafı kaldırılır</div>
            </div>
          </button>}
        </div>
      </>}

      <AltNav active="/profil"/>
      {drawer&&<Drawer user={user} profil={profil} avatarUrl={avatarUrl} username={username} kaydedilenler={kaydedilenler} senaryolar={senaryolar} onClose={()=>setDrawer(false)} onEditMode={()=>setEditMode(true)}/>}
    </div>
  );
}
