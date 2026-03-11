import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var G = {
  black:"#080808",deep:"#0d0d0d",surface:"#111",card:"#141414",
  border:"rgba(212,175,55,0.12)",borderHov:"rgba(212,175,55,0.35)",
  gold:"#D4AF37",goldL:"#F2D46F",goldD:"#A8892A",
  goldGrad:"linear-gradient(135deg,#D4AF37 0%,#F2D46F 40%,#A8892A 70%,#D4AF37 100%)",
  goldMetal:"linear-gradient(135deg,#BFA340 0%,#F5E27A 35%,#C9A227 65%,#E8CC5A 100%)",
  red:"#C0392B",redL:"#E74C3C",
  silver:"#A8A9AD",silverL:"#D4D5D9",
  text:"#F5F0E8",textMuted:"rgba(245,240,232,0.42)",textDim:"rgba(245,240,232,0.2)",
  shadow:"0 8px 40px rgba(0,0,0,0.85)",
  glow:"0 0 30px rgba(212,175,55,0.18)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

var ROZETLER=[
  {label:"Yeni Kalem",min:0,color:G.silver,icon:"✏️"},
  {label:"Aday Senarist",min:5,color:"#A8A9AD",icon:"📝"},
  {label:"Senarist",min:20,color:G.gold,icon:"🎬"},
  {label:"Usta Senarist",min:50,color:G.goldL,icon:"🏆"},
  {label:"Efsane",min:100,color:G.red,icon:"👑"},
];
function getRozet(n){return[...ROZETLER].reverse().find(r=>(n||0)>=r.min)||ROZETLER[0];}

var DRAWER_ITEMS=[
  {href:"/",label:"Ana Sayfa",svgId:"home"},
  {href:"/uret",label:"Senaryo Üret",svgId:"film",badge:"AI"},
  {href:"/kesfet",label:"Keşfet",svgId:"compass"},
  {href:"/topluluk",label:"Topluluk",svgId:"users"},
  {href:"/mesajlar",label:"Mesajlar",svgId:"chat"},
];

function Icon({id,size=22,color="currentColor",strokeWidth=1.8,fill="none"}){
  var p={width:size,height:size,fill:fill,stroke:color,strokeWidth:strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="sun")return<svg {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
  if(id==="moon")return<svg {...p}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
  if(id==="logout")return<svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  if(id==="heart")return<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  if(id==="comment")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="bookmark")return<svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
  if(id==="share")return<svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
  if(id==="eye")return<svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  if(id==="bell")return<svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if(id==="search")return<svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if(id==="plus")return<svg {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  return null;
}

function FilmCorners({color=G.gold,size=14,thickness=2}){
  var s={position:"absolute",width:size,height:size};
  var l={background:color,position:"absolute"};
  return(<>
    <div style={{...s,top:0,left:0}}><div style={{...l,top:0,left:0,width:thickness,height:size}}/><div style={{...l,top:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,top:0,right:0}}><div style={{...l,top:0,right:0,width:thickness,height:size}}/><div style={{...l,top:0,right:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,left:0}}><div style={{...l,bottom:0,left:0,width:thickness,height:size}}/><div style={{...l,bottom:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,right:0}}><div style={{...l,bottom:0,right:0,width:thickness,height:size}}/><div style={{...l,bottom:0,right:0,width:size,height:thickness}}/></div>
  </>);
}

function Av({url,size,ring=false}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#1a1500,#2a2000)",border:`1.5px solid ${ring?G.gold:"rgba(212,175,55,0.25)"}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:ring?`0 0 0 2px ${G.goldD},0 0 16px rgba(212,175,55,0.2)`:"none"}}>
      {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.42} color="rgba(212,175,55,0.4)"/>}
    </div>
  );
}

function Drawer({user,profil,avatarUrl,username,onClose}){
  var [exitModal,setExitModal]=useState(false);
  var rozet=getRozet(profil?.senaryo_sayisi);
  return(<>
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)"}}/>
    <div style={{position:"fixed",top:0,left:0,bottom:0,zIndex:201,width:290,background:"#0a0a0a",borderRight:`1px solid ${G.border}`,display:"flex",flexDirection:"column",boxShadow:"8px 0 60px rgba(0,0,0,0.9)"}}>
      <div style={{height:3,background:G.goldGrad,flexShrink:0}}/>
      <div style={{padding:"20px 20px 16px",borderBottom:`1px solid ${G.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <Av url={avatarUrl} size={52} ring/>
          <button onClick={onClose} style={{background:"rgba(245,240,232,0.05)",border:`1px solid ${G.border}`,borderRadius:10,padding:"6px 12px",color:G.textMuted,fontSize:12,letterSpacing:"0.05em"}}>ESC</button>
        </div>
        {user?(<>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <p style={{fontSize:16,fontWeight:800,color:G.text}}>@{username}</p>
            {profil?.dogrulandi&&<span style={{fontSize:11,padding:"2px 7px",borderRadius:20,background:`${G.gold}20`,color:G.gold,fontWeight:700}}>✓</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
            <span style={{fontSize:12}}>{rozet.icon}</span>
            <span style={{fontSize:11,fontWeight:700,color:rozet.color}}>{rozet.label}</span>
          </div>
        </>):(
          <button onClick={()=>{onClose();window.location.href="/";}} style={{width:"100%",padding:"10px",borderRadius:12,background:G.goldGrad,border:"none",color:"#0d0d0d",fontSize:13,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase"}}>Giriş Yap</button>
        )}
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"12px"}}>
        {DRAWER_ITEMS.map(item=>{
          var active=typeof window!=="undefined"&&window.location.pathname===item.href;
          return(
            <a key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,marginBottom:2,color:active?G.gold:G.textMuted,background:active?`${G.gold}08`:"transparent",fontWeight:active?700:500,fontSize:14,border:`1px solid ${active?G.border:"transparent"}`,textDecoration:"none",transition:"all 0.15s"}}>
              <Icon id={item.svgId} size={18} color={active?G.gold:G.textMuted}/>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge&&<span style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:20,background:G.red,color:"#fff",letterSpacing:"0.06em"}}>{item.badge}</span>}
            </a>
          );
        })}
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${G.border}`}}>
          <a href="/profil" style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,marginBottom:2,color:G.textMuted,fontSize:14,textDecoration:"none"}}>
            <Icon id="user" size={18} color={G.textMuted}/><span>Profil & Ayarlar</span>
          </a>
          {user&&<button onClick={()=>setExitModal(true)} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderRadius:12,color:G.red,fontSize:14,background:`${G.red}08`,border:"none",width:"100%",textAlign:"left"}}>
            <Icon id="logout" size={18} color={G.red}/><span style={{fontWeight:600}}>Çıkış Yap</span>
          </button>}
        </div>
      </nav>
      <div style={{padding:"12px 20px",borderTop:`1px solid ${G.border}`,textAlign:"center"}}>
        <p style={{fontSize:10,color:G.textDim,letterSpacing:"0.1em",textTransform:"uppercase"}}>© 2025 Scriptify</p>
      </div>
    </div>
    {exitModal&&<>
      <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:301,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{background:"#111",border:`1px solid ${G.border}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:300,textAlign:"center",position:"relative"}}>
          <FilmCorners/>
          <div style={{width:48,height:48,borderRadius:"50%",background:`${G.red}15`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <Icon id="logout" size={22} color={G.red}/>
          </div>
          <h3 style={{fontSize:18,fontWeight:800,color:G.text,marginBottom:8,fontFamily:G.fontDisp,letterSpacing:"0.05em"}}>ÇIKIŞ YAP</h3>
          <p style={{fontSize:13,color:G.textMuted,lineHeight:1.6,marginBottom:22}}>Hesabından çıkmak istediğine emin misin?</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setExitModal(false)} style={{flex:1,padding:"12px",borderRadius:12,background:"rgba(245,240,232,0.05)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:13,fontWeight:600}}>İptal</button>
            <button onClick={()=>{supabase.auth.signOut();onClose();window.location.href="/";}} style={{flex:1,padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${G.red},#e74c3c)`,border:"none",color:"#fff",fontSize:13,fontWeight:700}}>Çıkış</button>
          </div>
        </div>
      </div>
    </>}
  </>);
}

function FilmCard({gonderi,user,onBegen,onYorum,onKaydet}){
  var [hovered,setHovered]=useState(false);
  var [liked,setLiked]=useState(gonderi._liked||false);
  var [likeCount,setLikeCount]=useState(gonderi.begeni_sayisi||0);
  var [saved,setSaved]=useState(gonderi._saved||false);
  var [showYorum,setShowYorum]=useState(false);
  var [yorumText,setYorumText]=useState("");
  var rozet=getRozet(gonderi.profiles?.senaryo_sayisi);
  var turColors={"Gerilim":"#1a0a0a","Drama":"#0a0a1a","Bilim Kurgu":"#0a1a1a","Komedi":"#1a1a0a","Romantik":"#1a0a10","Korku":"#150505","Aksiyon":"#1a0800","Fantastik":"#0f0a1a","Suç":"#111010","Tarihi":"#1a1500","Animasyon":"#0a1500","Belgesel":"#0a1010"};
  var cardBg=turColors[gonderi.tur]||G.card;

  function handleBegen(e){
    e.stopPropagation();
    if(!user)return;
    var n=!liked;
    setLiked(n);
    setLikeCount(c=>n?c+1:c-1);
    onBegen&&onBegen(gonderi.id,n);
  }
  async function handleYorumGonder(e){
    e.stopPropagation();
    if(!yorumText.trim()||!user)return;
    onYorum&&await onYorum(gonderi.id,yorumText);
    setYorumText("");setShowYorum(false);
  }

  return(
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{position:"relative",marginBottom:20,animation:"fadeUp 0.4s ease both",cursor:"pointer"}} onClick={()=>window.location.href=`/senaryo/${gonderi.id}`}>
      {/* Sprocket sol */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:20,display:"flex",flexDirection:"column",justifyContent:"space-around",padding:"8px 0",zIndex:2,pointerEvents:"none"}}>
        {Array(8).fill(0).map((_,i)=><div key={i} style={{width:10,height:14,borderRadius:3,background:"#050505",border:"1px solid #1a1a1a",marginLeft:5}}/>)}
      </div>
      {/* Sprocket sağ */}
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:20,display:"flex",flexDirection:"column",justifyContent:"space-around",padding:"8px 0",zIndex:2,pointerEvents:"none"}}>
        {Array(8).fill(0).map((_,i)=><div key={i} style={{width:10,height:14,borderRadius:3,background:"#050505",border:"1px solid #1a1a1a",marginRight:5}}/>)}
      </div>
      {/* Kart */}
      <div style={{marginLeft:20,marginRight:20,background:`linear-gradient(160deg,${cardBg} 0%,#111 60%,#0d0d0d 100%)`,border:`1px solid ${hovered?G.borderHov:G.border}`,borderRadius:12,overflow:"hidden",boxShadow:hovered?`${G.glow},${G.shadow}`:G.shadow,transition:"border-color 0.3s,box-shadow 0.3s",position:"relative"}}>
        <FilmCorners color={hovered?G.goldL:G.goldD} size={12}/>
        {/* Üst şerit */}
        <div style={{height:22,background:"rgba(0,0,0,0.6)",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 12px"}}>
          <span style={{fontFamily:G.fontDisp,fontSize:10,color:G.goldD,letterSpacing:"0.2em"}}>SCRIPTIFY</span>
          <div style={{display:"flex",gap:4}}>
            {Array(8).fill(0).map((_,i)=><div key={i} style={{width:6,height:10,borderRadius:1,background:i===3?"rgba(212,175,55,0.3)":"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)"}}/>)}
          </div>
          <span style={{fontFamily:G.fontDisp,fontSize:10,color:G.textDim,letterSpacing:"0.15em"}}>{gonderi.tip||"DİZİ"} · {gonderi.tur||""}</span>
        </div>
        <div style={{padding:"16px 14px 12px"}}>
          {/* Profil */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}} onClick={e=>{e.stopPropagation();window.location.href=`/@${gonderi.profiles?.username}`;}}>
            <Av url={gonderi.profiles?.avatar_url} size={36}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:13,fontWeight:700,color:G.text}}>@{gonderi.profiles?.username||"kullanici"}</span>
                {gonderi.profiles?.dogrulandi&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:20,background:`${G.gold}18`,color:G.gold,fontWeight:700}}>✓</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                <span style={{fontSize:10}}>{rozet.icon}</span>
                <span style={{fontSize:10,fontWeight:600,color:rozet.color}}>{rozet.label}</span>
                <span style={{fontSize:10,color:G.textDim}}>·</span>
                <span style={{fontSize:10,color:G.textDim}}>{new Date(gonderi.created_at).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}</span>
              </div>
            </div>
          </div>
          {/* Başlık */}
          <h2 style={{fontFamily:G.fontDisp,fontSize:26,letterSpacing:"0.04em",color:G.text,lineHeight:1.1,marginBottom:6}}>{gonderi.baslik}</h2>
          {gonderi.tagline&&<p style={{fontSize:13,fontStyle:"italic",color:G.gold,marginBottom:10,lineHeight:1.5,borderLeft:`2px solid ${G.goldD}`,paddingLeft:10}}>"{gonderi.tagline}"</p>}
          {gonderi.ana_fikir&&<p style={{fontSize:13,color:G.textMuted,lineHeight:1.65,marginBottom:12,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{gonderi.ana_fikir}</p>}
          {/* Badge */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
            <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:`${G.gold}12`,color:G.gold,border:`1px solid ${G.gold}25`,letterSpacing:"0.06em",textTransform:"uppercase"}}>{gonderi.tur}</span>
            <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:"rgba(245,240,232,0.05)",color:G.textMuted,border:"1px solid rgba(245,240,232,0.08)",letterSpacing:"0.06em"}}>{gonderi.tip}</span>
            {gonderi.goruntuleme_sayisi>0&&<span style={{fontSize:10,color:G.textDim,padding:"3px 10px",display:"flex",alignItems:"center",gap:4}}><Icon id="eye" size={10} color={G.textDim}/>{gonderi.goruntuleme_sayisi}</span>}
          </div>
          {/* Aksiyon */}
          <div style={{display:"flex",alignItems:"center",borderTop:`1px solid ${G.border}`,paddingTop:10,gap:4}} onClick={e=>e.stopPropagation()}>
            <button onClick={handleBegen} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,background:liked?`${G.red}15`:"transparent",border:`1px solid ${liked?G.red+"30":"transparent"}`,color:liked?G.red:G.textMuted,fontSize:12,fontWeight:liked?700:500,transition:"all 0.2s"}}>
              <Icon id="heart" size={14} color={liked?G.red:G.textMuted} fill={liked?G.red:"none"}/>{likeCount>0&&likeCount}
            </button>
            <button onClick={e=>{e.stopPropagation();setShowYorum(!showYorum);}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,background:"transparent",border:"1px solid transparent",color:G.textMuted,fontSize:12}}>
              <Icon id="comment" size={14} color={G.textMuted}/>{gonderi.yorum_sayisi>0&&gonderi.yorum_sayisi}
            </button>
            <button onClick={e=>{e.stopPropagation();setSaved(!saved);onKaydet&&onKaydet(gonderi.id,!saved);}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,background:saved?`${G.gold}10`:"transparent",border:`1px solid ${saved?G.gold+"25":"transparent"}`,color:saved?G.gold:G.textMuted,fontSize:12,transition:"all 0.2s"}}>
              <Icon id="bookmark" size={14} color={saved?G.gold:G.textMuted}/>
            </button>
            <div style={{flex:1}}/>
            <button onClick={e=>{e.stopPropagation();if(navigator.share)navigator.share({title:gonderi.baslik,url:`${window.location.origin}/senaryo/${gonderi.id}`});}} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:10,background:"transparent",border:"1px solid transparent",color:G.textMuted,fontSize:12}}>
              <Icon id="share" size={14} color={G.textMuted}/>
            </button>
          </div>
          {showYorum&&(
            <div style={{marginTop:10,display:"flex",gap:8}} onClick={e=>e.stopPropagation()}>
              <input value={yorumText} onChange={e=>setYorumText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleYorumGonder(e)} placeholder="Yorum yaz..." style={{flex:1,background:"rgba(245,240,232,0.04)",border:`1px solid ${G.border}`,borderRadius:10,padding:"9px 12px",color:G.text,fontSize:13,outline:"none"}}/>
              <button onClick={handleYorumGonder} style={{padding:"9px 16px",borderRadius:10,background:G.goldGrad,border:"none",color:"#0d0d0d",fontSize:12,fontWeight:800}}>Gönder</button>
            </div>
          )}
        </div>
        {/* Alt şerit */}
        <div style={{height:20,background:"rgba(0,0,0,0.5)",borderTop:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"flex-end",padding:"0 12px",gap:4}}>
          {Array(10).fill(0).map((_,i)=><div key={i} style={{width:6,height:10,borderRadius:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)"}}/>)}
        </div>
      </div>
    </div>
  );
}

function FilmCardSkeleton(){
  return(
    <div style={{marginBottom:20,position:"relative"}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:20,display:"flex",flexDirection:"column",justifyContent:"space-around",padding:"8px 0"}}>
        {Array(8).fill(0).map((_,i)=><div key={i} style={{width:10,height:14,borderRadius:3,background:"#111",marginLeft:5}}/>)}
      </div>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:20,display:"flex",flexDirection:"column",justifyContent:"space-around",padding:"8px 0"}}>
        {Array(8).fill(0).map((_,i)=><div key={i} style={{width:10,height:14,borderRadius:3,background:"#111",marginRight:5}}/>)}
      </div>
      <div style={{marginLeft:20,marginRight:20,background:G.card,border:`1px solid ${G.border}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{height:22,background:"rgba(0,0,0,0.6)"}}/>
        <div style={{padding:"16px 14px 12px"}}>
          <div style={{display:"flex",gap:10,marginBottom:14}}><div className="skeleton" style={{width:36,height:36,borderRadius:"50%",flexShrink:0}}/><div style={{flex:1}}><div className="skeleton" style={{height:13,width:"40%",marginBottom:6}}/><div className="skeleton" style={{height:10,width:"60%"}}/></div></div>
          <div className="skeleton" style={{height:26,width:"70%",marginBottom:8}}/>
          <div className="skeleton" style={{height:13,width:"45%",marginBottom:10}}/>
          <div className="skeleton" style={{height:52,marginBottom:12}}/>
          <div style={{display:"flex",gap:6}}><div className="skeleton" style={{height:22,width:60,borderRadius:20}}/><div className="skeleton" style={{height:22,width:40,borderRadius:20}}/></div>
        </div>
        <div style={{height:20,background:"rgba(0,0,0,0.5)"}}/>
      </div>
    </div>
  );
}

function StoryBar({storyler,user,avatarUrl}){
  return(
    <div style={{display:"flex",gap:12,overflowX:"auto",padding:"14px 16px 8px",scrollbarWidth:"none"}}>
      <style>{`.story-scroll::-webkit-scrollbar{display:none}`}</style>
      {user&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0,cursor:"pointer"}} onClick={()=>window.location.href="/profil"}>
          <div style={{position:"relative"}}>
            <Av url={avatarUrl} size={50} ring/>
            <div style={{position:"absolute",bottom:0,right:0,width:17,height:17,borderRadius:"50%",background:G.goldGrad,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #080808"}}>
              <Icon id="plus" size={9} color="#0d0d0d" strokeWidth={3}/>
            </div>
          </div>
          <span style={{fontSize:10,color:G.textMuted,maxWidth:50,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Sen</span>
        </div>
      )}
      {storyler.map(s=>(
        <div key={s.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0,cursor:"pointer"}} onClick={()=>window.location.href=`/@${s.profiles?.username}`}>
          <div style={{width:50,height:50,borderRadius:"50%",background:`linear-gradient(135deg,${G.gold},${G.red})`,padding:2,boxShadow:`0 0 12px rgba(212,175,55,0.2)`}}>
            <div style={{width:"100%",height:"100%",borderRadius:"50%",border:"2px solid #080808",overflow:"hidden",background:G.deep}}>
              {s.profiles?.avatar_url?<img src={s.profiles.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={22} color="rgba(212,175,55,0.3)"/>}
            </div>
          </div>
          <span style={{fontSize:10,color:G.textMuted,maxWidth:50,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{s.profiles?.username}</span>
        </div>
      ))}
    </div>
  );
}

function AltNav({active="/"}){
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

export default function Index(){
  var [user,setUser]=useState(null);
  var [profil,setProfil]=useState(null);
  var [gonderiler,setGonderiler]=useState([]);
  var [storyler,setStoryler]=useState([]);
  var [yukleniyor,setYukleniyor]=useState(true);
  var [sekme,setSekme]=useState("kesfet");
  var [drawer,setDrawer]=useState(false);
  var [sayfa,setSayfa]=useState(0);
  var [bitti,setBitti]=useState(false);
  var loaderRef=useRef(null);
  var LIMIT=10;

  var avatarUrl=profil?.avatar_url||null;
  var username=profil?.username||(user?user.email.split("@")[0]:"");

  useEffect(()=>{
    supabase.auth.getSession().then(r=>{
      if(r.data?.session){setUser(r.data.session.user);loadProfil(r.data.session.user);}
      else setYukleniyor(false);
    });
    supabase.auth.onAuthStateChange((_,s)=>{
      if(s){setUser(s.user);loadProfil(s.user);}
      else{setUser(null);setProfil(null);setYukleniyor(false);}
    });
    loadStoryler();
  },[]);

  useEffect(()=>{setSayfa(0);setBitti(false);loadGonderiler(0,true);},[sekme]);

  function loadProfil(u){
    supabase.from("profiles").select("*").eq("id",u.id).single().then(r=>{if(r.data)setProfil(r.data);setYukleniyor(false);});
  }
  async function loadStoryler(){
    var{data}=await supabase.from("storyler").select("*,profiles(username,avatar_url)").order("created_at",{ascending:false}).limit(15);
    if(data)setStoryler(data);
  }
  async function loadGonderiler(page=0,reset=false){
    setYukleniyor(true);
    var{data}=await supabase.from("gonderiler").select("*,profiles(username,avatar_url,dogrulandi,senaryo_sayisi)").eq("paylasim_acik",true).order("created_at",{ascending:false}).range(page*LIMIT,(page+1)*LIMIT-1);
    if(data){
      if(reset)setGonderiler(data);
      else setGonderiler(p=>[...p,...data]);
      if(data.length<LIMIT)setBitti(true);
      else setBitti(false);
    }
    setYukleniyor(false);
  }

  useEffect(()=>{
    if(!loaderRef.current)return;
    var obs=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting&&!yukleniyor&&!bitti){
        var next=sayfa+1;setSayfa(next);loadGonderiler(next);
      }
    },{threshold:0.1});
    obs.observe(loaderRef.current);
    return()=>obs.disconnect();
  },[yukleniyor,bitti,sayfa]);

  async function handleBegen(id,liked){
    if(!user)return;
    if(liked){await supabase.from("begeniler").insert([{gonderi_id:id,user_id:user.id}]);}
    else{await supabase.from("begeniler").delete().eq("gonderi_id",id).eq("user_id",user.id);}
  }
  async function handleYorum(id,text){if(!user)return;await supabase.from("yorumlar").insert([{gonderi_id:id,user_id:user.id,icerik:text}]);}
  async function handleKaydet(id,saved){
    if(!user)return;
    if(saved)await supabase.from("kaydedilenler").insert([{gonderi_id:id,user_id:user.id}]);
    else await supabase.from("kaydedilenler").delete().eq("gonderi_id",id).eq("user_id",user.id);
  }

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .skeleton{background:linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.goldD};border-radius:2px;}
        ::selection{background:rgba(212,175,55,0.2);color:${G.goldL};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(8,8,8,0.95)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold}18,transparent)`}}/>
        <button onClick={()=>setDrawer(true)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",padding:0,cursor:"pointer"}}>
          <Av url={avatarUrl} size={34} ring={!!user}/>
          <img src="/logo.png" alt="Scriptify" style={{height:24,objectFit:"contain",maxWidth:100}}/>
        </button>
        <div style={{display:"flex",gap:8}}>
          <a href="/bildirimler" style={{width:36,height:36,borderRadius:10,background:"rgba(245,240,232,0.04)",border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon id="bell" size={16} color={G.textMuted}/>
          </a>
          <a href="/uret" style={{height:36,padding:"0 14px",borderRadius:10,background:G.goldGrad,display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:800,color:"#0d0d0d",letterSpacing:"0.06em",textTransform:"uppercase"}}>
            <Icon id="plus" size={12} color="#0d0d0d" strokeWidth={3}/>Üret
          </a>
        </div>
      </div>

      {/* STORY */}
      <StoryBar storyler={storyler} user={user} avatarUrl={avatarUrl}/>
      <div style={{height:1,background:`linear-gradient(90deg,transparent,${G.gold}18,transparent)`,margin:"0 16px 4px"}}/>

      {/* SEKME */}
      <div style={{display:"flex",gap:4,padding:"10px 16px 8px",borderBottom:`1px solid ${G.border}`}}>
        {[{id:"kesfet",label:"Keşfet"},{id:"takip",label:"Takip"}].map(s=>(
          <button key={s.id} onClick={()=>setSekme(s.id)} style={{padding:"7px 20px",borderRadius:20,border:`1.5px solid ${sekme===s.id?G.gold:G.border}`,background:sekme===s.id?`${G.gold}12`:"transparent",color:sekme===s.id?G.gold:G.textMuted,fontSize:12,fontWeight:sekme===s.id?700:500,letterSpacing:"0.05em",cursor:"pointer",transition:"all 0.2s"}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* FEED */}
      <div style={{maxWidth:640,margin:"0 auto",padding:"12px 0"}}>
        {yukleniyor&&gonderiler.length===0
          ?Array(4).fill(0).map((_,i)=><FilmCardSkeleton key={i}/>)
          :gonderiler.map(g=><FilmCard key={g.id} gonderi={g} user={user} onBegen={handleBegen} onYorum={handleYorum} onKaydet={handleKaydet}/>)
        }
        {!bitti&&<div ref={loaderRef} style={{height:40,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {yukleniyor&&gonderiler.length>0&&<div style={{width:24,height:24,border:`2px solid ${G.border}`,borderTopColor:G.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>}
        </div>}
        {bitti&&gonderiler.length>0&&(
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",padding:"0 20px"}}>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${G.border})`}}/>
              <span style={{fontFamily:G.fontDisp,fontSize:11,letterSpacing:"0.18em",color:G.textDim}}>SON KARE</span>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,${G.border},transparent)`}}/>
            </div>
          </div>
        )}
        {!yukleniyor&&gonderiler.length===0&&(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontFamily:G.fontDisp,fontSize:52,color:G.textDim,marginBottom:12,letterSpacing:"0.1em"}}>BOŞLUK</div>
            <p style={{fontSize:14,color:G.textMuted,marginBottom:20}}>Henüz paylaşılmış senaryo yok.</p>
            <a href="/uret" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 24px",borderRadius:12,background:G.goldGrad,color:"#0d0d0d",fontSize:13,fontWeight:800,letterSpacing:"0.05em",textTransform:"uppercase"}}>✨ İlk Senaryoyu Üret</a>
          </div>
        )}
      </div>

      <AltNav active="/"/>
      {drawer&&<Drawer user={user} profil={profil} avatarUrl={avatarUrl} username={username} onClose={()=>setDrawer(false)}/>}
    </div>
  );
}
