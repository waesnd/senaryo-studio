import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

// ── MIDNIGHT ASSASSIN TEMA ────────────────────────────────────────────────────
var G = {
  // Zeminler
  black:"#0A0F1E",
  deep:"#0F172A",
  surface:"#1E293B",
  card:"#162032",
  cardHov:"#1a2840",

  // Kenarlıklar
  border:"rgba(56,189,248,0.12)",
  borderHov:"rgba(56,189,248,0.4)",
  borderPurple:"rgba(139,92,246,0.2)",

  // Vurgular
  blue:"#38BDF8",
  blueL:"#7DD3FC",
  blueD:"#0EA5E9",
  blueGrad:"linear-gradient(135deg,#0EA5E9 0%,#38BDF8 40%,#7DD3FC 70%,#0EA5E9 100%)",

  purple:"#8B5CF6",
  purpleL:"#A78BFA",
  purpleD:"#7C3AED",
  purpleGrad:"linear-gradient(135deg,#7C3AED 0%,#8B5CF6 50%,#A78BFA 100%)",

  // Aksiyon renkleri
  red:"#EF4444",
  redL:"#F87171",

  // Metin
  text:"#F1F5F9",
  textMuted:"rgba(241,245,249,0.5)",
  textDim:"rgba(241,245,249,0.25)",

  // Efektler
  shadow:"0 8px 40px rgba(0,0,0,0.7)",
  glowBlue:"0 0 24px rgba(56,189,248,0.25)",
  glowPurple:"0 0 24px rgba(139,92,246,0.25)",
  glowRed:"0 0 16px rgba(239,68,68,0.3)",

  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

var ROZETLER=[
  {label:"Yeni Kalem",   min:0,   color:"#94A3B8", aciklama:"İlk adımı at"},
  {label:"Aday Senarist",min:5,   color:G.blue,    aciklama:"5 senaryo üret"},
  {label:"Senarist",     min:20,  color:G.purple,  aciklama:"20 senaryo üret"},
  {label:"Usta Senarist",min:50,  color:G.blueL,   aciklama:"50 senaryo üret"},
  {label:"Efsane",       min:100, color:G.red,     aciklama:"100 senaryo üret"},
];
function getRozet(n){return[...ROZETLER].reverse().find(r=>(n||0)>=r.min)||ROZETLER[0];}

var DRAWER_ITEMS=[
  {href:"/",        label:"Ana Sayfa",    svgId:"home"},
  {href:"/uret",    label:"Senaryo Üret", svgId:"film",    badge:"AI"},
  {href:"/kesfet",  label:"Keşfet",       svgId:"compass"},
  {href:"/topluluk",label:"Topluluk",     svgId:"users"},
  {href:"/mesajlar",label:"Mesajlar",     svgId:"chat"},
];

// ── SVG İKONLAR ──────────────────────────────────────────────────────────────
function Icon({id,size=22,color="currentColor",strokeWidth=1.8,fill="none"}){
  var p={width:size,height:size,fill:fill,stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="logout")return<svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  if(id==="heart")return<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  if(id==="comment")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="bookmark")return<svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
  if(id==="share")return<svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
  if(id==="eye")return<svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  if(id==="bell")return<svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if(id==="search")return<svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if(id==="plus")return<svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  if(id==="zap")return<svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  if(id==="star")return<svg {...p} fill={fill}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  return null;
}

// ── NEON KÖŞE SÜSLEMESİ ──────────────────────────────────────────────────────
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
function Av({url,size,ring=false}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${G.deep},${G.surface})`,border:`1.5px solid ${ring?G.blue:"rgba(56,189,248,0.2)"}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:ring?`0 0 0 2px ${G.blueD},${G.glowBlue}`:"none"}}>
      {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.42} color="rgba(56,189,248,0.4)"/>}
    </div>
  );
}

// ── DRAWER ────────────────────────────────────────────────────────────────────
function Drawer({user,profil,avatarUrl,username,onClose}){
  var [exitModal,setExitModal]=useState(false);
  var rozet=getRozet(profil?.senaryo_sayisi);
  return(<>
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,5,20,0.8)",backdropFilter:"blur(8px)"}}/>
    <div style={{position:"fixed",top:0,left:0,bottom:0,zIndex:201,width:300,background:"linear-gradient(180deg,#0A0F1E 0%,#0F172A 100%)",borderRight:`1px solid ${G.border}`,display:"flex",flexDirection:"column",boxShadow:`8px 0 60px rgba(0,0,0,0.9),inset -1px 0 0 rgba(56,189,248,0.05)`}}>
      {/* Üst neon çizgi */}
      <div style={{height:2,background:G.blueGrad,flexShrink:0,boxShadow:`0 0 20px rgba(56,189,248,0.5)`}}/>

      {/* Profil başlık */}
      <div style={{padding:"20px 20px 16px",borderBottom:`1px solid ${G.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <Av url={avatarUrl} size={52} ring/>
          <button onClick={onClose} style={{background:"rgba(56,189,248,0.05)",border:`1px solid ${G.border}`,borderRadius:10,padding:"6px 12px",color:G.textMuted,fontSize:12,letterSpacing:"0.05em"}}>ESC</button>
        </div>
        {user?(<>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <p style={{fontSize:15,fontWeight:800,color:G.text}}>@{username}</p>
            {profil?.dogrulandi&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:20,background:`${G.blue}20`,color:G.blue,fontWeight:700,boxShadow:`0 0 8px ${G.blue}30`}}>✓</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6,padding:"5px 10px",borderRadius:8,background:`${rozet.color}12`,border:`1px solid ${rozet.color}20`,width:"fit-content"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:rozet.color,boxShadow:`0 0 6px ${rozet.color}`}}/>
            <span style={{fontSize:11,fontWeight:700,color:rozet.color}}>{rozet.label}</span>
          </div>
        </>):(
          <button onClick={()=>{onClose();window.location.href="/";}} style={{width:"100%",padding:"10px",borderRadius:12,background:G.blueGrad,border:"none",color:"#0A0F1E",fontSize:13,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase"}}>Giriş Yap</button>
        )}
      </div>

      <nav style={{flex:1,overflowY:"auto",padding:"12px"}}>
        {DRAWER_ITEMS.map(item=>{
          var active=typeof window!=="undefined"&&window.location.pathname===item.href;
          return(
            <a key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,marginBottom:2,color:active?G.blue:G.textMuted,background:active?`${G.blue}08`:"transparent",fontWeight:active?700:500,fontSize:14,border:`1px solid ${active?G.border:"transparent"}`,textDecoration:"none",transition:"all 0.15s",boxShadow:active?`inset 0 0 20px ${G.blue}05`:"none"}}>
              <Icon id={item.svgId} size={18} color={active?G.blue:G.textMuted}/>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge&&<span style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,background:G.purple,color:"#fff",boxShadow:G.glowPurple}}>{item.badge}</span>}
            </a>
          );
        })}
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${G.border}`}}>
          <a href="/profil" style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,marginBottom:2,color:G.textMuted,fontSize:14,textDecoration:"none"}}>
            <Icon id="user" size={18} color={G.textMuted}/><span>Profil & Ayarlar</span>
          </a>
          {user&&<button onClick={()=>setExitModal(true)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,color:G.red,fontSize:14,background:`${G.red}08`,border:"none",width:"100%",textAlign:"left",cursor:"pointer"}}>
            <Icon id="logout" size={18} color={G.red}/><span style={{fontWeight:600}}>Çıkış Yap</span>
          </button>}
        </div>
      </nav>
      <div style={{padding:"12px 20px",borderTop:`1px solid ${G.border}`,textAlign:"center"}}>
        <p style={{fontSize:10,color:G.textDim,letterSpacing:"0.1em"}}>© 2025 SCRIPTIFY</p>
      </div>
    </div>

    {exitModal&&<>
      <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:301,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{background:G.surface,border:`1px solid ${G.borderHov}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:300,textAlign:"center",position:"relative",boxShadow:G.glowBlue}}>
          <NeonCorners color={G.red}/>
          <div style={{width:48,height:48,borderRadius:"50%",background:`${G.red}15`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:G.glowRed}}>
            <Icon id="logout" size={22} color={G.red}/>
          </div>
          <h3 style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.05em",color:G.text,marginBottom:8}}>ÇIKIŞ YAP</h3>
          <p style={{fontSize:13,color:G.textMuted,lineHeight:1.6,marginBottom:22}}>Hesabından çıkmak istediğine emin misin?</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setExitModal(false)} style={{flex:1,padding:"12px",borderRadius:12,background:"rgba(241,245,249,0.05)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:13,fontWeight:600}}>İptal</button>
            <button onClick={()=>{supabase.auth.signOut();onClose();window.location.href="/";}} style={{flex:1,padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${G.red},${G.redL})`,border:"none",color:"#fff",fontSize:13,fontWeight:700,boxShadow:G.glowRed}}>Çıkış</button>
          </div>
        </div>
      </div>
    </>}
  </>);
}

// ── KART BİLEŞENİ ────────────────────────────────────────────────────────────
function FilmCard({gonderi,user,onBegen,onYorum,onKaydet}){
  var [hovered,setHovered]=useState(false);
  var [liked,setLiked]=useState(gonderi._liked||false);
  var [likeCount,setLikeCount]=useState(gonderi.begeni_sayisi||0);
  var [saved,setSaved]=useState(gonderi._saved||false);
  var [showYorum,setShowYorum]=useState(false);
  var [yorumText,setYorumText]=useState("");
  var rozet=getRozet(gonderi.profiles?.senaryo_sayisi);

  // Türe göre soluk neon renk tonu
  var turAccent={
    "Gerilim":G.red,"Drama":G.blue,"Bilim Kurgu":G.blueL,
    "Komedi":"#FBBF24","Romantik":"#F472B6","Korku":G.purple,
    "Aksiyon":G.red,"Fantastik":G.purpleL,"Suç":"#94A3B8","Tarihi":"#D97706"
  };
  var accent=turAccent[gonderi.tur]||G.blue;

  function handleBegen(e){
    e.stopPropagation();
    if(!user)return;
    var n=!liked;setLiked(n);setLikeCount(c=>n?c+1:c-1);
    onBegen&&onBegen(gonderi.id,n);
  }
  async function handleYorumGonder(e){
    e.stopPropagation();
    if(!yorumText.trim()||!user)return;
    onYorum&&await onYorum(gonderi.id,yorumText);
    setYorumText("");setShowYorum(false);
  }

  return(
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      onClick={()=>window.location.href=`/senaryo/${gonderi.id}`}
      style={{position:"relative",marginBottom:16,animation:"fadeUp 0.4s ease both",cursor:"pointer"}}
    >
      <div style={{
        background:`linear-gradient(160deg,${G.deep} 0%,${G.card} 60%,${G.surface} 100%)`,
        border:`1px solid ${hovered?accent+"60":G.border}`,
        borderRadius:16,overflow:"hidden",
        boxShadow:hovered?`0 0 30px ${accent}20,${G.shadow}`:G.shadow,
        transition:"all 0.3s",position:"relative"
      }}>
        <NeonCorners color={hovered?accent:G.blue} size={12}/>

        {/* Üst renk şeridi — türe göre */}
        <div style={{height:3,background:`linear-gradient(90deg,${accent}80,${accent}20,transparent)`,boxShadow:`0 0 12px ${accent}40`}}/>

        {/* Üst bar */}
        <div style={{height:22,background:"rgba(0,0,0,0.4)",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px"}}>
          <span style={{fontFamily:G.fontDisp,fontSize:10,color:G.blueD,letterSpacing:"0.2em"}}>SCRIPTIFY</span>
          <div style={{display:"flex",gap:3}}>
            {[1,0,0,1,0,0,1].map((on,i)=><div key={i} style={{width:5,height:8,borderRadius:1,background:on?`${G.blue}40`:"rgba(255,255,255,0.04)",border:`1px solid rgba(255,255,255,0.06)`}}/>)}
          </div>
          <span style={{fontFamily:G.fontDisp,fontSize:10,color:G.textDim,letterSpacing:"0.1em"}}>{gonderi.tip||"DİZİ"} · {gonderi.tur||""}</span>
        </div>

        <div style={{padding:"16px 16px 12px"}}>
          {/* Profil */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}} onClick={e=>{e.stopPropagation();window.location.href=`/@${gonderi.profiles?.username}`;}}>
            <Av url={gonderi.profiles?.avatar_url} size={36}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13,fontWeight:700,color:G.text}}>@{gonderi.profiles?.username||"kullanici"}</span>
                {gonderi.profiles?.dogrulandi&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:20,background:`${G.blue}18`,color:G.blue,fontWeight:700,boxShadow:`0 0 6px ${G.blue}30`}}>✓</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:rozet.color,boxShadow:`0 0 4px ${rozet.color}`}}/>
                <span style={{fontSize:10,fontWeight:600,color:rozet.color}}>{rozet.label}</span>
                <span style={{fontSize:10,color:G.textDim}}>·</span>
                <span style={{fontSize:10,color:G.textDim}}>{new Date(gonderi.created_at).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}</span>
              </div>
            </div>
          </div>

          {/* Başlık */}
          <h2 style={{fontFamily:G.fontDisp,fontSize:26,letterSpacing:"0.04em",color:G.text,lineHeight:1.1,marginBottom:6}}>{gonderi.baslik}</h2>

          {/* Tagline */}
          {gonderi.tagline&&(
            <p style={{fontSize:13,fontStyle:"italic",color:accent,marginBottom:10,lineHeight:1.5,borderLeft:`2px solid ${accent}`,paddingLeft:10,boxShadow:`-4px 0 10px ${accent}15`}}>
              "{gonderi.tagline}"
            </p>
          )}

          {gonderi.ana_fikir&&<p style={{fontSize:13,color:G.textMuted,lineHeight:1.65,marginBottom:12,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{gonderi.ana_fikir}</p>}

          {/* Badge'ler */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:`${accent}15`,color:accent,border:`1px solid ${accent}30`,letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:`0 0 8px ${accent}15`}}>{gonderi.tur}</span>
            <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:"rgba(241,245,249,0.05)",color:G.textMuted,border:`1px solid ${G.border}`,letterSpacing:"0.06em"}}>{gonderi.tip}</span>
            {gonderi.goruntuleme_sayisi>0&&(
              <span style={{fontSize:10,color:G.textDim,padding:"3px 10px",display:"flex",alignItems:"center",gap:4}}>
                <Icon id="eye" size={10} color={G.textDim}/>{gonderi.goruntuleme_sayisi}
              </span>
            )}
          </div>

          {/* Aksiyonlar */}
          <div style={{display:"flex",alignItems:"center",borderTop:`1px solid ${G.border}`,paddingTop:10,gap:4}} onClick={e=>e.stopPropagation()}>
            <button onClick={handleBegen} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,background:liked?`${G.red}15`:"transparent",border:`1px solid ${liked?G.red+"40":"transparent"}`,color:liked?G.red:G.textMuted,fontSize:12,fontWeight:liked?700:500,transition:"all 0.2s",boxShadow:liked?G.glowRed:"none"}}>
              <Icon id="heart" size={14} color={liked?G.red:G.textMuted} fill={liked?G.red:"none"}/>{likeCount>0&&likeCount}
            </button>
            <button onClick={e=>{e.stopPropagation();setShowYorum(!showYorum);}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,background:"transparent",border:"1px solid transparent",color:G.textMuted,fontSize:12}}>
              <Icon id="comment" size={14} color={G.textMuted}/>{gonderi.yorum_sayisi>0&&gonderi.yorum_sayisi}
            </button>
            <button onClick={e=>{e.stopPropagation();setSaved(!saved);onKaydet&&onKaydet(gonderi.id,!saved);}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,background:saved?`${G.blue}12`:"transparent",border:`1px solid ${saved?G.blue+"30":"transparent"}`,color:saved?G.blue:G.textMuted,fontSize:12,transition:"all 0.2s",boxShadow:saved?G.glowBlue:"none"}}>
              <Icon id="bookmark" size={14} color={saved?G.blue:G.textMuted}/>
            </button>
            <div style={{flex:1}}/>
            <button onClick={e=>{e.stopPropagation();if(navigator.share)navigator.share({title:gonderi.baslik,url:`${window.location.origin}/senaryo/${gonderi.id}`});}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,background:"transparent",border:"1px solid transparent",color:G.textMuted,fontSize:12}}>
              <Icon id="share" size={14} color={G.textMuted}/>
            </button>
          </div>

          {showYorum&&(
            <div style={{marginTop:10,display:"flex",gap:8}} onClick={e=>e.stopPropagation()}>
              <input value={yorumText} onChange={e=>setYorumText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleYorumGonder(e)} placeholder="Yorum yaz..." style={{flex:1,background:`${G.surface}`,border:`1px solid ${G.border}`,borderRadius:10,padding:"9px 12px",color:G.text,fontSize:13,outline:"none",fontFamily:G.fontBody}}/>
              <button onClick={handleYorumGonder} style={{padding:"9px 16px",borderRadius:10,background:G.blueGrad,border:"none",color:"#0A0F1E",fontSize:12,fontWeight:800,boxShadow:G.glowBlue}}>Gönder</button>
            </div>
          )}
        </div>

        {/* Alt şerit */}
        <div style={{height:4,background:`linear-gradient(90deg,transparent,${accent}15,transparent)`}}/>
      </div>
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────────
function FilmCardSkeleton(){
  return(
    <div style={{marginBottom:16,borderRadius:16,overflow:"hidden",border:`1px solid ${G.border}`,background:G.card}}>
      <div style={{height:3,background:`linear-gradient(90deg,${G.border},${G.blue}20,${G.border})`}}/>
      <div style={{height:22,background:"rgba(0,0,0,0.3)"}}/>
      <div style={{padding:"16px"}}>
        <div style={{display:"flex",gap:10,marginBottom:14}}><div className="skeleton" style={{width:36,height:36,borderRadius:"50%",flexShrink:0}}/><div style={{flex:1}}><div className="skeleton" style={{height:13,width:"40%",marginBottom:6}}/><div className="skeleton" style={{height:10,width:"60%"}}/></div></div>
        <div className="skeleton" style={{height:26,width:"70%",marginBottom:8}}/>
        <div className="skeleton" style={{height:13,width:"45%",marginBottom:10}}/>
        <div className="skeleton" style={{height:52,marginBottom:12}}/>
        <div style={{display:"flex",gap:6}}><div className="skeleton" style={{height:22,width:60,borderRadius:20}}/><div className="skeleton" style={{height:22,width:40,borderRadius:20}}/></div>
      </div>
    </div>
  );
}

// ── STORY BAR ─────────────────────────────────────────────────────────────────
function StoryBar({storyler,user,avatarUrl,onSil}){
  return(
    <div style={{display:"flex",gap:12,overflowX:"auto",padding:"14px 16px 10px",scrollbarWidth:"none"}}>
      {user&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0,cursor:"pointer"}} onClick={()=>window.location.href="/profil"}>
          <div style={{position:"relative"}}>
            <Av url={avatarUrl} size={50} ring/>
            <div style={{position:"absolute",bottom:0,right:0,width:18,height:18,borderRadius:"50%",background:G.blueGrad,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${G.black}`,boxShadow:G.glowBlue}}>
              <Icon id="plus" size={9} color="#0A0F1E" strokeWidth={3}/>
            </div>
          </div>
          <span style={{fontSize:10,color:G.textMuted,maxWidth:52,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Sen</span>
        </div>
      )}
      {storyler.map(s=>{
        var benimStory=user&&s.user_id===user.id;
        return(
          <div key={s.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0}}>
            <div style={{position:"relative"}}>
              <div style={{width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,${G.blue},${G.purple})`,padding:2,boxShadow:G.glowBlue,cursor:"pointer"}}
                onClick={()=>window.location.href=`/@${s.profiles?.username}`}>
                <div style={{width:"100%",height:"100%",borderRadius:"50%",border:`2px solid ${G.black}`,overflow:"hidden",background:G.deep}}>
                  {s.profiles?.avatar_url?<img src={s.profiles.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={22} color="rgba(56,189,248,0.4)"/>}
                </div>
              </div>
              {/* Kendi story'inde sil butonu */}
              {benimStory&&(
                <button onClick={e=>{e.stopPropagation();onSil&&onSil(s.id);}}
                  style={{position:"absolute",top:-4,right:-4,width:18,height:18,borderRadius:"50%",background:G.red,border:`2px solid ${G.black}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 0 6px ${G.red}80`,zIndex:1}}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            <span style={{fontSize:10,color:benimStory?G.blue:G.textMuted,maxWidth:52,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:benimStory?700:400}}>
              {benimStory?"Senin":("@"+s.profiles?.username)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── ALT NAV ───────────────────────────────────────────────────────────────────
function AltNav({active="/"}){
  var items=[
    {href:"/",id:"home"},
    {href:"/kesfet",id:"search"},
    {href:"/topluluk",id:"users"},
    {href:"/mesajlar",id:"chat"},
    {href:"/profil",id:"user"},
  ];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"8px 0 env(safe-area-inset-bottom,10px)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}30,${G.purple}30,transparent)`}}/>
      {items.map(item=>{
        var isActive=active===item.href;
        return(
          <a key={item.href} href={item.href} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px",borderRadius:12,position:"relative",opacity:isActive?1:0.35,transition:"all 0.2s"}}>
            <Icon id={item.id} size={22} color={isActive?G.blue:"#94A3B8"}/>
            {isActive&&(
              <>
                <div style={{position:"absolute",bottom:0,width:20,height:2,borderRadius:1,background:G.blueGrad,boxShadow:`0 0 8px ${G.blue}`}}/>
                <div style={{position:"absolute",inset:0,borderRadius:12,background:`radial-gradient(circle at 50% 100%,${G.blue}10,transparent 70%)`}}/>
              </>
            )}
          </a>
        );
      })}
    </div>
  );
}

// ── ANA SAYFA ─────────────────────────────────────────────────────────────────
export default function Index(){
  var {user, profil, authHazir} = useAuth();
  var avatarUrl=profil?.avatar_url||null;
  var username=profil?.username||(user?user.email.split("@")[0]:"");
  var [kesfetGonderiler,setKesfetGonderiler]=useState([]);
  var [takipGonderiler,setTakipGonderiler]=useState([]);
  var [storyler,setStoryler]=useState([]);
  var [yukleniyor,setYukleniyor]=useState(false);

  var [sekme,setSekme]=useState("kesfet");
  var [drawer,setDrawer]=useState(false);
  var [sayfa,setSayfa]=useState(0);
  var [bitti,setBitti]=useState(false);
  var loaderRef=useRef(null);
  var LIMIT=10;

  var avatarUrl=profil?.avatar_url||null;
  var username=profil?.username||(user?user.email.split("@")[0]:"");

  useEffect(()=>{
    loadStoryler();
  },[]);

  // authHazir olunca kesfet feed'ini yükle
  useEffect(()=>{
    if(!authHazir) return;
    if(kesfetGonderiler.length===0) loadGonderiler(0,true,"kesfet");
  },[authHazir]);

  useEffect(()=>{
    if(!authHazir) return;
    setSayfa(0);setBitti(false);
    loadGonderiler(0,true,sekme);
  },[sekme]);


  async function loadStoryler(){
    var{data}=await supabase.from("storyler").select("*,profiles(username,avatar_url)").order("created_at",{ascending:false}).limit(15);
    if(data)setStoryler(data);
  }
  async function storySil(id){
    await supabase.from("storyler").delete().eq("id",id).eq("user_id",user.id);
    setStoryler(p=>p.filter(s=>s.id!==id));
  }
  async function loadGonderiler(page=0,reset=false,aktivSekme){
    var hedefSekme=aktivSekme||sekme;
    setYukleniyor(true);
    var data=null;

    if(hedefSekme==="takip"&&!user){
      // Giriş yapmamış — keşfet gibi yükle
      hedefSekme="kesfet";
    }
    if(hedefSekme==="takip"&&user){
      var{data:takipler}=await supabase.from("takipler").select("takip_edilen").eq("takip_eden",user.id);
      var takipIDs=(takipler||[]).map(t=>t.takip_edilen);
      if(takipIDs.length===0){
        if(reset)setTakipGonderiler([]);
        setBitti(true);setYukleniyor(false);return;
      }
      var res=await supabase.from("gonderiler")
        .select("*,profiles(username,avatar_url,dogrulandi,senaryo_sayisi)")
        .eq("paylasim_acik",true).in("user_id",takipIDs)
        .order("created_at",{ascending:false}).range(page*LIMIT,(page+1)*LIMIT-1);
      data=res.data;
    }else{
      var res=await supabase.from("gonderiler")
        .select("*,profiles(username,avatar_url,dogrulandi,senaryo_sayisi)")
        .eq("paylasim_acik",true)
        .order("created_at",{ascending:false}).range(page*LIMIT,(page+1)*LIMIT-1);
      data=res.data;
    }

    if(data){
      if(hedefSekme==="takip"){
        if(reset)setTakipGonderiler(data);
        else setTakipGonderiler(p=>[...p,...data]);
      }else{
        if(reset)setKesfetGonderiler(data);
        else setKesfetGonderiler(p=>[...p,...data]);
      }
      setBitti(data.length<LIMIT);
    }
    setYukleniyor(false);
  }

  useEffect(()=>{
    if(!loaderRef.current)return;
    var obs=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting&&!yukleniyor&&!bitti){
        var next=sayfa+1;setSayfa(next);loadGonderiler(next,false,sekme);
      }
    },{threshold:0.1});
    obs.observe(loaderRef.current);
    return()=>obs.disconnect();
  },[yukleniyor,bitti,sayfa]);

  async function handleBegen(id,liked){
    if(!user)return;
    if(liked)await supabase.from("begeniler").insert([{gonderi_id:id,user_id:user.id}]);
    else await supabase.from("begeniler").delete().eq("gonderi_id",id).eq("user_id",user.id);
  }
  async function handleYorum(id,text){if(!user)return;await supabase.from("yorumlar").insert([{gonderi_id:id,user_id:user.id,icerik:text}]);}
  async function handleKaydet(id,saved){
    if(!user)return;
    if(saved)await supabase.from("kaydedilenler").insert([{gonderi_id:id,user_id:user.id}]);
    else await supabase.from("kaydedilenler").delete().eq("gonderi_id",id).eq("user_id",user.id);
  }

  var gonderiler=sekme==="takip"?takipGonderiler:kesfetGonderiler;

  if(!authHazir)return(<div style={{minHeight:"100vh",background:"#0A0F1E",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}><div style={{width:36,height:36,border:"2px solid rgba(56,189,248,0.15)",borderTopColor:"#38BDF8",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><p style={{fontFamily:"Bebas Neue,sans-serif",fontSize:14,letterSpacing:"0.15em",color:"rgba(241,245,249,0.25)"}}>SCRİPTİFY</p><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);

  // Giriş yapmamış kullanıcıya landing page göster
  if(!user)return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:50,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(10,15,30,0.8)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`}}>
        <img src="/logo.png" alt="Scriptify" style={{height:32,objectFit:"contain"}}/>
        <div style={{display:"flex",gap:10}}>
          <a href="/kesfet" style={{padding:"8px 18px",borderRadius:20,border:`1px solid ${G.border}`,color:G.textMuted,fontSize:13,fontWeight:600}}>Keşfet</a>
          <a href="/api/auth/google" style={{padding:"8px 20px",borderRadius:20,background:G.blueGrad,color:G.black,fontSize:13,fontWeight:800,boxShadow:G.glowBlue}}>Giriş Yap</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 24px 40px",position:"relative",overflow:"hidden"}}>
        {/* Arka plan ışımaları */}
        <div style={{position:"absolute",top:"20%",left:"10%",width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${G.blue}08,transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:"20%",right:"10%",width:300,height:300,borderRadius:"50%",background:`radial-gradient(circle,${G.purple}08,transparent 70%)`,pointerEvents:"none"}}/>
        {/* Grid */}
        <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${G.blue}04 1px,transparent 1px),linear-gradient(90deg,${G.blue}04 1px,transparent 1px)`,backgroundSize:"40px 40px",pointerEvents:"none"}}/>

        {/* Badge */}
        <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 16px",borderRadius:20,background:`${G.blue}10`,border:`1px solid ${G.blue}25`,marginBottom:24,animation:"fadeUp 0.5s ease both"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:G.green,boxShadow:`0 0 6px ${G.green}`}}/>
          <span style={{fontSize:12,fontWeight:700,color:G.blue,letterSpacing:"0.08em"}}>AI SENARYO PLATFORMU</span>
        </div>

        {/* Başlık */}
        <h1 style={{fontFamily:G.fontDisp,fontSize:"clamp(42px,8vw,88px)",letterSpacing:"0.04em",textAlign:"center",lineHeight:1.05,marginBottom:20,animation:"fadeUp 0.5s 0.1s ease both"}}>
          <span style={{color:G.text}}>SENARYO </span>
          <span style={{background:G.blueGrad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>YAZMAK</span>
          <br/>
          <span style={{color:G.text}}>BU KADAR </span>
          <span style={{background:`linear-gradient(135deg,${G.purple},${G.purpleL})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>KOLAY</span>
        </h1>

        {/* Alt başlık */}
        <p style={{fontSize:"clamp(15px,2.5vw,19px)",color:G.textMuted,textAlign:"center",maxWidth:560,lineHeight:1.7,marginBottom:36,animation:"fadeUp 0.5s 0.2s ease both"}}>
          AI ile saniyeler içinde senaryo üret. Beat sheet, karakter dosyası, dramaturg analizi — hepsi dahil. Topluluğa paylaş, yapımcılar keşfetsin.
        </p>

        {/* CTA butonları */}
        <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginBottom:60,animation:"fadeUp 0.5s 0.3s ease both"}}>
          <a href="/uret" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 32px",borderRadius:14,background:G.blueGrad,color:G.black,fontSize:15,fontWeight:800,letterSpacing:"0.04em",boxShadow:G.glowBlue,transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Ücretsiz Başla
          </a>
          <a href="/kesfet" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"14px 28px",borderRadius:14,background:`${G.purple}12`,border:`1.5px solid ${G.purple}30`,color:G.purple,fontSize:15,fontWeight:700,transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            Senaryoları Keşfet →
          </a>
        </div>

        {/* Özellik kartları */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,maxWidth:900,width:"100%",animation:"fadeUp 0.5s 0.4s ease both"}}>
          {[
            {icon:"⚡",title:"Anında Üret",desc:"Tür ve format seç, AI saniyeler içinde profesyonel senaryo üretir.",col:G.blue},
            {icon:"🎭",title:"Beat Sheet",desc:"Save the Cat yöntemiyle 15 adımlı sahne planı otomatik oluşturulur.",col:G.purple},
            {icon:"👥",title:"Karakter Dosyası",desc:"Psikolojik derinlikte karakter profilleri, motivasyonlar, karakter yayı.",col:G.blue},
            {icon:"🎬",title:"Topluluk",desc:"Senaryonu paylaş, diğer yazarları takip et, yapımcıların radarına gir.",col:G.purple},
          ].map((f,i)=>(
            <div key={i} style={{padding:"20px",background:`linear-gradient(135deg,${G.surface},${G.card})`,border:`1px solid ${G.border}`,borderRadius:16,transition:"all 0.2s",position:"relative",overflow:"hidden"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=f.col+"40";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 12px 32px ${f.col}12`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${f.col},transparent)`,opacity:0.6}}/>
              <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
              <h3 style={{fontFamily:G.fontDisp,fontSize:18,letterSpacing:"0.05em",color:G.text,marginBottom:6}}>{f.title}</h3>
              <p style={{fontSize:13,color:G.textMuted,lineHeight:1.6}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div style={{borderTop:`1px solid ${G.border}`,borderBottom:`1px solid ${G.border}`,padding:"32px 24px",display:"flex",justifyContent:"center",gap:"clamp(24px,6vw,80px)",flexWrap:"wrap",background:`${G.blue}03`}}>
        {[{val:"10+",label:"AI Araç"},{val:"∞",label:"Senaryo Üretimi"},{val:"15",label:"Beat Adımı"},{val:"3",label:"Export Formatı"}].map(s=>(
          <div key={s.label} style={{textAlign:"center"}}>
            <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.blue,letterSpacing:"0.05em",textShadow:G.glowBlue}}>{s.val}</div>
            <p style={{fontSize:12,color:G.textMuted,marginTop:4,letterSpacing:"0.06em"}}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer style={{padding:"24px",textAlign:"center",borderTop:`1px solid ${G.border}`}}>
        <p style={{fontSize:12,color:G.textDim}}>© 2025 Scriptify — AI Senaryo Platformu</p>
      </footer>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .skeleton{background:linear-gradient(90deg,#1E293B 25%,#243048 50%,#1E293B 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.blueD};border-radius:2px;}
        ::selection{background:rgba(56,189,248,0.25);color:${G.blueL};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:`rgba(10,15,30,0.95)`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}20,${G.purple}15,transparent)`,pointerEvents:"none"}}/>
        <button onClick={()=>setDrawer(true)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",padding:0,cursor:"pointer"}}>
          <Av url={avatarUrl} size={34} ring={!!user}/>
          <img src="/logo.png" alt="Scriptify" style={{height:44,objectFit:"contain",maxWidth:150}}/>
        </button>
        <div style={{display:"flex",gap:8}}>
          <a href="/bildirimler" style={{width:36,height:36,borderRadius:10,background:`${G.blue}08`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon id="bell" size={16} color={G.textMuted}/>
          </a>
          <a href="/uret" style={{height:36,padding:"0 14px",borderRadius:10,background:G.blueGrad,display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:800,color:"#0A0F1E",letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:G.glowBlue}}>
            <Icon id="zap" size={12} color="#0A0F1E" strokeWidth={2.5}/>Üret
          </a>
        </div>
      </div>

      {/* STORY */}
      <StoryBar storyler={storyler} user={user} avatarUrl={avatarUrl} onSil={storySil}/>
      <div style={{height:1,background:`linear-gradient(90deg,transparent,${G.blue}15,transparent)`,margin:"0 16px 4px"}}/>

      {/* SEKME */}
      <div style={{display:"flex",gap:6,padding:"10px 16px 8px",borderBottom:`1px solid ${G.border}`}}>
        {[{id:"kesfet",label:"Keşfet"},{id:"takip",label:"Takip"}].map(s=>(
          <button key={s.id} onClick={()=>setSekme(s.id)} style={{padding:"7px 20px",borderRadius:20,border:`1.5px solid ${sekme===s.id?G.blue:G.border}`,background:sekme===s.id?`${G.blue}12`:"transparent",color:sekme===s.id?G.blue:G.textMuted,fontSize:12,fontWeight:sekme===s.id?700:500,letterSpacing:"0.05em",transition:"all 0.2s",boxShadow:sekme===s.id?G.glowBlue:"none"}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* FEED */}
      <div style={{maxWidth:640,margin:"0 auto",padding:"12px 16px"}}>
        {yukleniyor&&gonderiler.length===0
          ?Array(4).fill(0).map((_,i)=><FilmCardSkeleton key={i}/>)
          :gonderiler.map(g=><FilmCard key={g.id} gonderi={g} user={user} onBegen={handleBegen} onYorum={handleYorum} onKaydet={handleKaydet}/>)
        }
        {!bitti&&<div ref={loaderRef} style={{height:40,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {yukleniyor&&gonderiler.length>0&&<div style={{width:24,height:24,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite",boxShadow:G.glowBlue}}/>}
        </div>}
        {bitti&&gonderiler.length>0&&(
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center"}}>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${G.border})`}}/>
              <span style={{fontFamily:G.fontDisp,fontSize:11,letterSpacing:"0.18em",color:G.textDim}}>SON KARE</span>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,${G.border},transparent)`}}/>
            </div>
          </div>
        )}
        {!yukleniyor&&gonderiler.length===0&&(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:`${G.blue}10`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:G.glowBlue}}>
              <Icon id={sekme==="takip"?"users":"film"} size={28} color={G.blue}/>
            </div>
            {sekme==="takip"?(
              <>
                <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:8,letterSpacing:"0.1em"}}>KİMSEYİ TAKİP ETMİYORSUN</div>
                <p style={{fontSize:14,color:G.textMuted,marginBottom:20}}>Takip ettiğin kişilerin senaryoları burada görünür.</p>
                <a href="/kesfet" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,background:G.blueGrad,color:"#0A0F1E",fontSize:13,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase",boxShadow:G.glowBlue}}>
                  <Icon id="compass" size={14} color="#0A0F1E"/>Senarist Keşfet
                </a>
              </>
            ):(
              <>
                <div style={{fontFamily:G.fontDisp,fontSize:40,color:G.textDim,marginBottom:8,letterSpacing:"0.1em"}}>BOŞ SAHNE</div>
                <p style={{fontSize:14,color:G.textMuted,marginBottom:20}}>Henüz paylaşılmış senaryo yok.</p>
                <a href="/uret" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,background:G.blueGrad,color:"#0A0F1E",fontSize:13,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase",boxShadow:G.glowBlue}}>
                  <Icon id="zap" size={14} color="#0A0F1E"/>İlk Senaryoyu Üret
                </a>
              </>
            )}
          </div>
        )}
      </div>

      <AltNav active="/"/>
      {drawer&&<Drawer user={user} profil={profil} avatarUrl={avatarUrl} username={username} onClose={()=>setDrawer(false)}/>}
    </div>
  );
}
