import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var G = {
  black:"#080808",deep:"#0d0d0d",surface:"#111",card:"#141414",
  border:"rgba(212,175,55,0.12)",borderHov:"rgba(212,175,55,0.35)",
  gold:"#D4AF37",goldL:"#F2D46F",goldD:"#A8892A",
  goldGrad:"linear-gradient(135deg,#D4AF37 0%,#F2D46F 40%,#A8892A 70%,#D4AF37 100%)",
  red:"#C0392B",redL:"#E74C3C",
  silver:"#A8A9AD",
  text:"#F5F0E8",textMuted:"rgba(245,240,232,0.42)",textDim:"rgba(245,240,232,0.2)",
  shadow:"0 8px 40px rgba(0,0,0,0.85)",
  glow:"0 0 30px rgba(212,175,55,0.18)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

var ROZETLER=[
  {label:"Yeni Kalem",   min:0,  color:G.silver, icon:"✏️", aciklama:"İlk adımı at"},
  {label:"Aday Senarist",min:5,  color:"#A8A9AD", icon:"📝", aciklama:"5 senaryo üret"},
  {label:"Senarist",     min:20, color:G.gold,   icon:"🎬", aciklama:"20 senaryo üret"},
  {label:"Usta Senarist",min:50, color:G.goldL,  icon:"🏆", aciklama:"50 senaryo üret"},
  {label:"Efsane",       min:100,color:G.red,    icon:"👑", aciklama:"100 senaryo üret"},
];
function getRozet(n){return[...ROZETLER].reverse().find(r=>(n||0)>=r.min)||ROZETLER[0];}
function getSonraki(n){return ROZETLER.find(r=>r.min>(n||0));}

function Icon({id,size=22,color="currentColor",strokeWidth=1.8,fill="none"}){
  var p={width:size,height:size,fill:fill,stroke:color,strokeWidth:strokeWidth,viewBox:"0 0 24 24"};
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
  if(id==="star")return<svg {...p} fill={fill}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
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

function Av({url,size,ring=false,onClick}){
  return(
    <div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#1a1500,#2a2000)",border:`2px solid ${ring?G.gold:"rgba(212,175,55,0.25)"}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:ring?`0 0 0 3px ${G.goldD},0 0 20px rgba(212,175,55,0.25)`:"none",cursor:onClick?"pointer":"default"}}>
      {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.42} color="rgba(212,175,55,0.4)"/>}
    </div>
  );
}

// ── HAMBURGER DRAWER ──────────────────────────────────────────────────────────
var DRAWER_ITEMS=[
  {href:"/",        label:"Ana Sayfa",    id:"home"},
  {href:"/uret",    label:"Senaryo Üret", id:"film",    badge:"AI"},
  {href:"/kesfet",  label:"Keşfet",       id:"compass"},
  {href:"/topluluk",label:"Topluluk",     id:"users"},
  {href:"/mesajlar",label:"Mesajlar",     id:"chat"},
];

function Drawer({user,profil,avatarUrl,username,onClose}){
  var [exitModal,setExitModal]=useState(false);
  var rozet=getRozet(profil?.senaryo_sayisi);
  return(<>
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)"}}/>
    <div style={{position:"fixed",top:0,left:0,bottom:0,zIndex:201,width:290,background:"#0a0a0a",borderRight:`1px solid ${G.border}`,display:"flex",flexDirection:"column",boxShadow:"8px 0 60px rgba(0,0,0,0.9)"}}>
      <div style={{height:3,background:G.goldGrad,flexShrink:0}}/>
      <div style={{padding:"20px 20px 16px",borderBottom:`1px solid ${G.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <Av url={avatarUrl} size={48} ring/>
          <button onClick={onClose} style={{background:"rgba(245,240,232,0.05)",border:`1px solid ${G.border}`,borderRadius:10,padding:"6px 12px",color:G.textMuted,fontSize:12}}>ESC</button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <p style={{fontSize:15,fontWeight:800,color:G.text}}>@{username}</p>
          {profil?.dogrulandi&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:`${G.gold}20`,color:G.gold,fontWeight:700}}>✓</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5}}>
          <span>{rozet.icon}</span>
          <span style={{fontSize:11,fontWeight:700,color:rozet.color}}>{rozet.label}</span>
        </div>
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
          {user&&<button onClick={()=>setExitModal(true)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,color:G.red,fontSize:14,background:`${G.red}08`,border:"none",width:"100%",textAlign:"left"}}>
            <Icon id="logout" size={18} color={G.red}/><span style={{fontWeight:600}}>Çıkış Yap</span>
          </button>}
        </div>
      </nav>
    </div>
    {exitModal&&<>
      <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:301,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{background:"#111",border:`1px solid ${G.border}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:300,textAlign:"center",position:"relative"}}>
          <FilmCorners/>
          <h3 style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.05em",color:G.text,marginBottom:8}}>ÇIKIŞ YAP</h3>
          <p style={{fontSize:13,color:G.textMuted,marginBottom:22}}>Hesabından çıkmak istediğine emin misin?</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setExitModal(false)} style={{flex:1,padding:"12px",borderRadius:12,background:"rgba(245,240,232,0.05)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:13,fontWeight:600}}>İptal</button>
            <button onClick={()=>{supabase.auth.signOut();window.location.href="/";}} style={{flex:1,padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${G.red},#e74c3c)`,border:"none",color:"#fff",fontSize:13,fontWeight:700}}>Çıkış</button>
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
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(8,8,8,0.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"8px 0 env(safe-area-inset-bottom,10px)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold}25,transparent)`}}/>
      {items.map(item=>{
        var isActive=active===item.href;
        return(
          <a key={item.href} href={item.href} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px",borderRadius:12,position:"relative",opacity:isActive?1:0.4,transition:"opacity 0.2s"}}>
            <Icon id={item.id} size={22} color={isActive?G.gold:G.silver}/>
            {isActive&&<div style={{position:"absolute",bottom:2,width:20,height:2,borderRadius:1,background:G.goldGrad}}/>}
          </a>
        );
      })}
    </div>
  );
}

// ── FİLM ŞERİDİ BANNER ────────────────────────────────────────────────────────
function FilmBanner({senaryolar}){
  var items = senaryolar.length > 0 ? senaryolar : Array(5).fill(null);
  return(
    <div style={{position:"relative",background:"#000",borderBottom:`1px solid ${G.border}`,overflow:"hidden"}}>
      {/* Üst sprocket */}
      <div style={{height:16,background:"#000",display:"flex",alignItems:"center",gap:6,padding:"0 8px",borderBottom:"1px solid #1a1a1a"}}>
        {Array(24).fill(0).map((_,i)=><div key={i} style={{width:8,height:10,borderRadius:2,background:"#111",border:"1px solid #1e1e1e",flexShrink:0}}/>)}
      </div>

      {/* Yatay scroll film kareleri */}
      <div style={{display:"flex",overflowX:"auto",gap:3,padding:"4px 0",scrollbarWidth:"none",background:"#050505"}}>
        <style>{`.film-banner::-webkit-scrollbar{display:none}`}</style>
        {items.map((s,i)=>(
          <div key={i} onClick={()=>s&&(window.location.href=`/senaryo/${s.id}`)} style={{width:90,height:64,flexShrink:0,background:s?"linear-gradient(135deg,#1a1200,#111)":"#0a0a0a",border:"1px solid #1a1a1a",position:"relative",cursor:s?"pointer":"default",overflow:"hidden",transition:"border-color 0.2s"}}
            onMouseEnter={e=>s&&(e.currentTarget.style.borderColor=G.goldD)}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#1a1a1a"}
          >
            {s?(
              <>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"6px 5px",background:"linear-gradient(to top,rgba(0,0,0,0.85),transparent)"}}>
                  <p style={{fontFamily:G.fontDisp,fontSize:9,letterSpacing:"0.05em",color:G.goldL,lineHeight:1.2,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s.baslik}</p>
                </div>
                <div style={{position:"absolute",top:4,right:4,fontSize:7,fontWeight:700,padding:"1px 4px",borderRadius:4,background:`${G.gold}20`,color:G.gold,letterSpacing:"0.05em"}}>{s.tur}</div>
              </>
            ):(
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.15}}>
                <Icon id="film" size={20} color={G.gold}/>
              </div>
            )}
            {/* Kare numarası */}
            <div style={{position:"absolute",bottom:1,left:2,fontSize:6,color:"rgba(255,255,255,0.12)",fontFamily:"monospace"}}>{String(i+1).padStart(3,"0")}</div>
          </div>
        ))}
      </div>

      {/* Alt sprocket */}
      <div style={{height:16,background:"#000",display:"flex",alignItems:"center",gap:6,padding:"0 8px",borderTop:"1px solid #1a1a1a"}}>
        {Array(24).fill(0).map((_,i)=><div key={i} style={{width:8,height:10,borderRadius:2,background:"#111",border:"1px solid #1e1e1e",flexShrink:0}}/>)}
      </div>
    </div>
  );
}

// ── İSTATİSTİK KARTI ─────────────────────────────────────────────────────────
function StatCard({label,value,icon,color=G.gold}){
  return(
    <div style={{flex:1,background:"linear-gradient(145deg,#141414,#0f0f0f)",border:`1px solid ${G.border}`,borderRadius:14,padding:"14px 10px",textAlign:"center",position:"relative"}}>
      <FilmCorners size={8} color={G.goldD}/>
      <div style={{fontSize:18,marginBottom:4}}>{icon}</div>
      <div style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.05em",color:color,lineHeight:1}}>{value||0}</div>
      <div style={{fontSize:10,color:G.textDim,marginTop:4,letterSpacing:"0.08em",textTransform:"uppercase"}}>{label}</div>
    </div>
  );
}

// ── ROZET KARTI ───────────────────────────────────────────────────────────────
function RozetKarti({rozet,kazanildi,mevcut}){
  var aktif=kazanildi||(mevcut&&(mevcut||0)>=rozet.min);
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"16px 10px",background:aktif?"linear-gradient(145deg,#1a1500,#111)":"linear-gradient(145deg,#0f0f0f,#0a0a0a)",border:`1px solid ${aktif?G.goldD+"50":G.border}`,borderRadius:14,position:"relative",opacity:aktif?1:0.5,transition:"all 0.3s"}}>
      {aktif&&<FilmCorners size={8} color={G.goldD}/>}
      <div style={{fontSize:28,filter:aktif?"none":"grayscale(1)"}}>{rozet.icon}</div>
      <div style={{fontSize:11,fontWeight:700,color:aktif?rozet.color:G.textDim,textAlign:"center",lineHeight:1.3}}>{rozet.label}</div>
      <div style={{fontSize:9,color:G.textDim,textAlign:"center"}}>{rozet.aciklama}</div>
      {aktif&&<div style={{position:"absolute",top:6,right:6,width:14,height:14,borderRadius:"50%",background:`${G.gold}20`,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon id="check" size={8} color={G.gold} strokeWidth={3}/></div>}
    </div>
  );
}

// ── SENARYO GRID KARTI ────────────────────────────────────────────────────────
function SenaryoKarti({s}){
  var [hov,setHov]=useState(false);
  var turColors={"Gerilim":"#1a0a0a","Drama":"#0a0a1a","Bilim Kurgu":"#0a1a1a","Komedi":"#1a1a0a","Romantik":"#1a0a10","Korku":"#150505","Aksiyon":"#1a0800","Fantastik":"#0f0a1a","Suç":"#111010","Tarihi":"#1a1500"};
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>window.location.href=`/senaryo/${s.id}`}
      style={{background:`linear-gradient(160deg,${turColors[s.tur]||G.card},#111)`,border:`1px solid ${hov?G.borderHov:G.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"border-color 0.2s,box-shadow 0.2s",boxShadow:hov?G.glow:"none",position:"relative"}}>
      <FilmCorners size={8} color={hov?G.goldL:G.goldD}/>
      {/* Üst şerit */}
      <div style={{height:16,background:"rgba(0,0,0,0.6)",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 8px"}}>
        <span style={{fontFamily:G.fontDisp,fontSize:8,color:G.goldD,letterSpacing:"0.15em"}}>SCR</span>
        <div style={{display:"flex",gap:2}}>{Array(4).fill(0).map((_,i)=><div key={i} style={{width:4,height:7,borderRadius:1,background:i===1?"rgba(212,175,55,0.25)":"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.05)"}}/>)}</div>
      </div>
      <div style={{padding:"10px 10px 8px"}}>
        <h3 style={{fontFamily:G.fontDisp,fontSize:16,letterSpacing:"0.03em",color:G.text,lineHeight:1.2,marginBottom:6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{s.baslik}</h3>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
          <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,background:`${G.gold}12`,color:G.gold,border:`1px solid ${G.gold}20`,letterSpacing:"0.05em",textTransform:"uppercase"}}>{s.tur}</span>
          <span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:"rgba(245,240,232,0.05)",color:G.textDim,border:"1px solid rgba(245,240,232,0.07)"}}>{s.tip}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,borderTop:`1px solid ${G.border}`,paddingTop:6}}>
          <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:G.textDim}}><Icon id="heart" size={10} color={G.textDim}/>{s.begeni_sayisi||0}</span>
          <span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:G.textDim}}><Icon id="eye" size={10} color={G.textDim}/>{s.goruntuleme_sayisi||0}</span>
        </div>
      </div>
    </div>
  );
}

// ── ANA SAYFA ─────────────────────────────────────────────────────────────────
export default function Profil(){
  var [user,setUser]=useState(null);
  var [profil,setProfil]=useState(null);
  var [senaryolar,setSenaryolar]=useState([]);
  var [kaydedilenler,setKaydedilenler]=useState([]);
  var [yukleniyor,setYukleniyor]=useState(true);
  var [sekme,setSekme]=useState("senaryolar");
  var [drawer,setDrawer]=useState(false);
  var [editMode,setEditMode]=useState(false);
  var [editData,setEditData]=useState({});
  var [avatarYukleniyor,setAvatarYukleniyor]=useState(false);
  var fileRef=useRef();

  var avatarUrl=profil?.avatar_url||null;
  var username=profil?.username||(user?user.email?.split("@")[0]:"");
  var rozet=getRozet(profil?.senaryo_sayisi);
  var sonraki=getSonraki(profil?.senaryo_sayisi);
  var ilerleme=sonraki?Math.min(100,Math.round(((profil?.senaryo_sayisi||0)-rozet.min)/(sonraki.min-rozet.min)*100)):100;

  useEffect(()=>{
    supabase.auth.getSession().then(r=>{
      if(r.data?.session){setUser(r.data.session.user);loadProfil(r.data.session.user);}
      else{setYukleniyor(false);window.location.href="/";}
    });
  },[]);

  async function loadProfil(u){
    var{data}=await supabase.from("profiles").select("*").eq("id",u.id).single();
    if(data){setProfil(data);setEditData({bio:data.bio||"",website:data.website||""});}
    await loadSenaryolar(u.id);
    await loadKaydedilenler(u.id);
    setYukleniyor(false);
  }
  async function loadSenaryolar(uid){
    var{data}=await supabase.from("gonderiler").select("*").eq("user_id",uid).order("created_at",{ascending:false});
    if(data)setSenaryolar(data);
  }
  async function loadKaydedilenler(uid){
    var{data}=await supabase.from("kaydedilenler").select("*,gonderiler(*)").eq("user_id",uid).order("created_at",{ascending:false});
    if(data)setKaydedilenler(data.map(k=>k.gonderiler).filter(Boolean));
  }

  async function avatarDegistir(e){
    var file=e.target.files?.[0];
    if(!file||!user)return;
    setAvatarYukleniyor(true);
    var fd=new FormData();
    fd.append("file",file);
    fd.append("upload_preset","scriptify_avatars");
    var res=await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload",{method:"POST",body:fd});
    var data=await res.json();
    if(data.secure_url){
      await supabase.from("profiles").update({avatar_url:data.secure_url}).eq("id",user.id);
      setProfil(p=>({...p,avatar_url:data.secure_url}));
    }
    setAvatarYukleniyor(false);
  }

  async function profilKaydet(){
    if(!user)return;
    await supabase.from("profiles").update({bio:editData.bio,website:editData.website}).eq("id",user.id);
    setProfil(p=>({...p,...editData}));
    setEditMode(false);
  }

  if(yukleniyor)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  var aktifSenaryolar=sekme==="senaryolar"?senaryolar:kaydedilenler;

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes progressFill{from{width:0}to{width:var(--w)}}
        .skeleton{background:linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.goldD};border-radius:2px;}
        ::selection{background:rgba(212,175,55,0.2);color:${G.goldL};}
        input,textarea{background:rgba(245,240,232,0.04);border:1px solid ${G.border};border-radius:10px;padding:10px 12px;color:${G.text};font-size:13px;outline:none;width:100%;font-family:'DM Sans',sans-serif;}
        input:focus,textarea:focus{border-color:${G.goldD};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(8,8,8,0.95)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold}18,transparent)`}}/>
        <a href="/" style={{opacity:0.5,display:"flex",alignItems:"center"}}><Icon id="home" size={18} color={G.silver}/></a>
        <span style={{fontFamily:G.fontDisp,fontSize:18,letterSpacing:"0.12em",color:G.text}}>PROFİL</span>
        <button onClick={()=>setDrawer(true)} style={{background:"rgba(245,240,232,0.05)",border:`1px solid ${G.border}`,borderRadius:10,padding:"7px 10px",display:"flex",alignItems:"center",gap:6,color:G.textMuted}}>
          <Icon id="menu" size={16} color={G.textMuted}/>
        </button>
      </div>

      {/* FİLM ŞERİDİ BANNER */}
      <FilmBanner senaryolar={senaryolar}/>

      {/* PROFİL ALANI */}
      <div style={{padding:"20px 16px 0",maxWidth:640,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}>
          {/* Avatar */}
          <div style={{position:"relative",flexShrink:0}}>
            <Av url={avatarUrl} size={80} ring/>
            <button onClick={()=>fileRef.current?.click()} style={{position:"absolute",bottom:0,right:0,width:24,height:24,borderRadius:"50%",background:G.goldGrad,border:"2px solid #080808",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              {avatarYukleniyor?<div style={{width:10,height:10,border:"1.5px solid rgba(0,0,0,0.3)",borderTopColor:"#000",borderRadius:"50%",animation:"spin 0.6s linear infinite"}}/>:<Icon id="camera" size={10} color="#0d0d0d" strokeWidth={2.5}/>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={avatarDegistir} style={{display:"none"}}/>
          </div>

          {/* Bilgi */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <h1 style={{fontFamily:G.fontDisp,fontSize:24,letterSpacing:"0.05em",color:G.text}}>@{username}</h1>
              {profil?.dogrulandi&&<span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:`${G.gold}18`,color:G.gold,fontWeight:700}}>✓ Doğrulandı</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
              <span style={{fontSize:14}}>{rozet.icon}</span>
              <span style={{fontSize:12,fontWeight:700,color:rozet.color}}>{rozet.label}</span>
            </div>
            {profil?.bio&&!editMode&&<p style={{fontSize:13,color:G.textMuted,marginTop:8,lineHeight:1.6}}>{profil.bio}</p>}
            {profil?.website&&!editMode&&(
              <a href={profil.website} target="_blank" style={{display:"flex",alignItems:"center",gap:5,marginTop:6,fontSize:12,color:G.gold}}>
                <Icon id="link" size={12} color={G.gold}/>{profil.website.replace(/https?:\/\//,"")}
              </a>
            )}
          </div>

          {/* Düzenle butonu */}
          <button onClick={()=>setEditMode(!editMode)} style={{flexShrink:0,padding:"8px 14px",borderRadius:10,background:editMode?G.goldGrad:"rgba(212,175,55,0.08)",border:`1px solid ${editMode?"transparent":G.border}`,color:editMode?"#0d0d0d":G.gold,fontSize:12,fontWeight:700,letterSpacing:"0.05em",display:"flex",alignItems:"center",gap:6}}>
            <Icon id={editMode?"x":"edit"} size={13} color={editMode?"#0d0d0d":G.gold}/>{editMode?"İptal":"Düzenle"}
          </button>
        </div>

        {/* Düzenleme formu */}
        {editMode&&(
          <div style={{background:"linear-gradient(145deg,#141414,#0f0f0f)",border:`1px solid ${G.border}`,borderRadius:16,padding:"16px",marginBottom:16,position:"relative",animation:"fadeUp 0.3s ease"}}>
            <FilmCorners/>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:700,color:G.textDim,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>Bio</label>
              <textarea value={editData.bio} onChange={e=>setEditData(p=>({...p,bio:e.target.value}))} rows={3} placeholder="Kendini tanıt..." style={{resize:"vertical"}}/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,fontWeight:700,color:G.textDim,letterSpacing:"0.1em",textTransform:"uppercase",display:"block",marginBottom:6}}>Website</label>
              <input value={editData.website} onChange={e=>setEditData(p=>({...p,website:e.target.value}))} placeholder="https://..."/>
            </div>
            <button onClick={profilKaydet} style={{width:"100%",padding:"12px",borderRadius:12,background:G.goldGrad,border:"none",color:"#0d0d0d",fontSize:13,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase"}}>Kaydet</button>
          </div>
        )}

        {/* İlerleme çubuğu */}
        {sonraki&&(
          <div style={{background:"linear-gradient(145deg,#141414,#0f0f0f)",border:`1px solid ${G.border}`,borderRadius:14,padding:"12px 14px",marginBottom:16,position:"relative"}}>
            <FilmCorners size={8} color={G.goldD}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:11,color:G.textMuted}}><b style={{color:G.gold}}>{rozet.label}</b> → {sonraki.label} {sonraki.icon}</span>
              <span style={{fontSize:11,color:G.textDim}}>{profil?.senaryo_sayisi||0}/{sonraki.min}</span>
            </div>
            <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:2,background:G.goldGrad,width:`${ilerleme}%`,transition:"width 1s ease"}}/>
            </div>
          </div>
        )}

        {/* İSTATİSTİKLER */}
        <div style={{display:"flex",gap:8,marginBottom:20,animation:"fadeUp 0.4s ease"}}>
          <StatCard label="Senaryo" value={profil?.senaryo_sayisi||senaryolar.length} icon="🎬"/>
          <StatCard label="Takipçi" value={profil?.takipci_sayisi||0} icon="👥"/>
          <StatCard label="Beğeni" value={senaryolar.reduce((a,s)=>a+(s.begeni_sayisi||0),0)} icon="❤️" color={G.red}/>
          <StatCard label="Görüntü" value={senaryolar.reduce((a,s)=>a+(s.goruntuleme_sayisi||0),0)} icon="👁️" color={G.silver}/>
        </div>

        {/* ROZETLER */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{flex:1,height:1,background:`linear-gradient(90deg,${G.border},transparent)`}}/>
            <span style={{fontFamily:G.fontDisp,fontSize:13,letterSpacing:"0.15em",color:G.textDim}}>ROZETLER</span>
            <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${G.border})`}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
            {ROZETLER.map(r=><RozetKarti key={r.label} rozet={r} mevcut={profil?.senaryo_sayisi}/>)}
          </div>
        </div>

        {/* SEKME */}
        <div style={{display:"flex",gap:4,marginBottom:16,borderBottom:`1px solid ${G.border}`,paddingBottom:10}}>
          {[{id:"senaryolar",label:"Senaryolarım",icon:"grid"},{id:"kaydedilenler",label:"Kaydedilenler",icon:"bookmark"}].map(s=>(
            <button key={s.id} onClick={()=>setSekme(s.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:20,border:`1.5px solid ${sekme===s.id?G.gold:G.border}`,background:sekme===s.id?`${G.gold}12`:"transparent",color:sekme===s.id?G.gold:G.textMuted,fontSize:12,fontWeight:sekme===s.id?700:500,letterSpacing:"0.04em",cursor:"pointer",transition:"all 0.2s"}}>
              <Icon id={s.icon} size={13} color={sekme===s.id?G.gold:G.textMuted}/>{s.label}
              <span style={{fontSize:10,padding:"1px 6px",borderRadius:20,background:sekme===s.id?`${G.gold}20`:"rgba(255,255,255,0.05)",color:sekme===s.id?G.gold:G.textDim}}>{s.id==="senaryolar"?senaryolar.length:kaydedilenler.length}</span>
            </button>
          ))}
        </div>

        {/* SENARYO GRİD */}
        {aktifSenaryolar.length>0?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,paddingBottom:20}}>
            {aktifSenaryolar.map(s=><SenaryoKarti key={s.id} s={s}/>)}
          </div>
        ):(
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontFamily:G.fontDisp,fontSize:40,color:G.textDim,marginBottom:10,letterSpacing:"0.1em"}}>BOŞLUK</div>
            <p style={{fontSize:13,color:G.textMuted,marginBottom:18}}>{sekme==="senaryolar"?"Henüz senaryo üretmedin.":"Henüz senaryo kaydetmedin."}</p>
            {sekme==="senaryolar"&&<a href="/uret" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"11px 22px",borderRadius:12,background:G.goldGrad,color:"#0d0d0d",fontSize:13,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase"}}>✨ Üret</a>}
          </div>
        )}
      </div>

      <AltNav active="/profil"/>
      {drawer&&<Drawer user={user} profil={profil} avatarUrl={avatarUrl} username={username} onClose={()=>setDrawer(false)}/>}
    </div>
  );
}
