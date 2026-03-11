import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

var G = {
  black:"#080808",deep:"#0d0d0d",surface:"#111",card:"#141414",
  border:"rgba(212,175,55,0.12)",borderHov:"rgba(212,175,55,0.35)",
  gold:"#D4AF37",goldL:"#F2D46F",goldD:"#A8892A",
  goldGrad:"linear-gradient(135deg,#D4AF37 0%,#F2D46F 40%,#A8892A 70%,#D4AF37 100%)",
  red:"#C0392B",redL:"#E74C3C",
  silver:"#A8A9AD",
  text:"#F5F0E8",textMuted:"rgba(245,240,232,0.42)",textDim:"rgba(245,240,232,0.2)",
  shadow:"0 8px 40px rgba(0,0,0,0.85)",glow:"0 0 30px rgba(212,175,55,0.18)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

var TURLER=["Hepsi","Gerilim","Drama","Komedi","Aksiyon","Korku","Romantik","Bilim Kurgu","Fantastik","Suç","Tarihi"];
var TURLER_RENK={"Gerilim":"#C0392B","Drama":"#2980B9","Komedi":"#F39C12","Aksiyon":"#E74C3C","Korku":"#8E44AD","Romantik":"#E91E8C","Bilim Kurgu":"#1ABC9C","Fantastik":"#9B59B6","Suç":"#7F8C8D","Tarihi":"#D4AF37"};

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
  if(id==="trending")return<svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
  if(id==="hash")return<svg {...p}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>;
  if(id==="x")return<svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
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

function AltNav({active="/kesfet"}){
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

function FilmCard({g,onBegen,onKaydet,user}){
  var [hov,setHov]=useState(false);
  var [liked,setLiked]=useState(g._liked||false);
  var [lc,setLc]=useState(g.begeni_sayisi||0);
  var [saved,setSaved]=useState(g._saved||false);
  var turBg={"Gerilim":"#1a0a0a","Drama":"#0a0a1a","Bilim Kurgu":"#0a1a1a","Komedi":"#1a1a0a","Romantik":"#1a0a10","Korku":"#150505","Aksiyon":"#1a0800","Fantastik":"#0f0a1a","Suç":"#111010","Tarihi":"#1a1500"};
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>window.location.href=`/senaryo/${g.id}`}
      style={{position:"relative",marginBottom:3,cursor:"pointer"}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:16,display:"flex",flexDirection:"column",justifyContent:"space-around",padding:"6px 0",zIndex:2,pointerEvents:"none"}}>
        {Array(6).fill(0).map((_,i)=><div key={i} style={{width:8,height:11,borderRadius:2,background:"#050505",border:"1px solid #1a1a1a",marginLeft:4}}/>)}
      </div>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:16,display:"flex",flexDirection:"column",justifyContent:"space-around",padding:"6px 0",zIndex:2,pointerEvents:"none"}}>
        {Array(6).fill(0).map((_,i)=><div key={i} style={{width:8,height:11,borderRadius:2,background:"#050505",border:"1px solid #1a1a1a",marginRight:4}}/>)}
      </div>
      <div style={{marginLeft:16,marginRight:16,background:`linear-gradient(160deg,${turBg[g.tur]||G.card},#111)`,border:`1px solid ${hov?G.borderHov:G.border}`,borderRadius:10,overflow:"hidden",boxShadow:hov?G.glow:G.shadow,transition:"all 0.2s",position:"relative"}}>
        <FilmCorners color={hov?G.goldL:G.goldD} size={10}/>
        <div style={{height:18,background:"rgba(0,0,0,0.6)",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px"}}>
          <span style={{fontFamily:G.fontDisp,fontSize:9,color:G.goldD,letterSpacing:"0.15em"}}>SCRIPTIFY</span>
          <span style={{fontFamily:G.fontDisp,fontSize:9,color:G.textDim,letterSpacing:"0.1em"}}>{g.tip||"DİZİ"} · {g.tur||""}</span>
        </div>
        <div style={{padding:"12px 12px 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}} onClick={e=>{e.stopPropagation();window.location.href=`/@${g.profiles?.username}`;}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#1a1500,#2a2000)",border:`1px solid rgba(212,175,55,0.25)`,overflow:"hidden",flexShrink:0}}>
              {g.profiles?.avatar_url?<img src={g.profiles.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={14} color="rgba(212,175,55,0.4)"/>}
            </div>
            <span style={{fontSize:12,fontWeight:700,color:G.text}}>@{g.profiles?.username||"kullanici"}</span>
            {g.profiles?.dogrulandi&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:`${G.gold}18`,color:G.gold,fontWeight:700}}>✓</span>}
          </div>
          <h3 style={{fontFamily:G.fontDisp,fontSize:20,letterSpacing:"0.03em",color:G.text,lineHeight:1.15,marginBottom:6}}>{g.baslik}</h3>
          {g.ana_fikir&&<p style={{fontSize:12,color:G.textMuted,lineHeight:1.6,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{g.ana_fikir}</p>}
          <div style={{display:"flex",alignItems:"center",gap:4,borderTop:`1px solid ${G.border}`,paddingTop:8}} onClick={e=>e.stopPropagation()}>
            <button onClick={()=>{if(!user)return;var n=!liked;setLiked(n);setLc(c=>n?c+1:c-1);onBegen&&onBegen(g.id,n);}} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:8,background:liked?`${G.red}15`:"transparent",border:`1px solid ${liked?G.red+"30":"transparent"}`,color:liked?G.red:G.textMuted,fontSize:11}}>
              <Icon id="heart" size={12} color={liked?G.red:G.textMuted}/>{lc>0&&lc}
            </button>
            <button onClick={()=>{if(!user)return;var n=!saved;setSaved(n);onKaydet&&onKaydet(g.id,n);}} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:8,background:saved?`${G.gold}10`:"transparent",border:`1px solid ${saved?G.gold+"25":"transparent"}`,color:saved?G.gold:G.textMuted,fontSize:11}}>
              <Icon id="bookmark" size={12} color={saved?G.gold:G.textMuted}/>
            </button>
            <div style={{flex:1}}/>
            {g.goruntuleme_sayisi>0&&<span style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:G.textDim}}><Icon id="eye" size={10} color={G.textDim}/>{g.goruntuleme_sayisi}</span>}
          </div>
        </div>
        <div style={{height:16,background:"rgba(0,0,0,0.5)",borderTop:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"flex-end",padding:"0 10px",gap:3}}>
          {Array(8).fill(0).map((_,i)=><div key={i} style={{width:5,height:8,borderRadius:1,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.04)"}}/>)}
        </div>
      </div>
    </div>
  );
}

function KisiKarti({profil}){
  var [hov,setHov]=useState(false);
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>window.location.href=`/@${profil.username}`}
      style={{background:"linear-gradient(145deg,#141414,#0f0f0f)",border:`1px solid ${hov?G.borderHov:G.border}`,borderRadius:14,padding:"16px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",transition:"all 0.2s",boxShadow:hov?G.glow:"none",position:"relative"}}>
      <FilmCorners size={8} color={G.goldD}/>
      <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#1a1500,#2a2000)",border:`1.5px solid rgba(212,175,55,0.25)`,overflow:"hidden",flexShrink:0}}>
        {profil.avatar_url?<img src={profil.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={22} color="rgba(212,175,55,0.4)"/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:13,fontWeight:700,color:G.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{profil.username}</span>
          {profil.dogrulandi&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:`${G.gold}18`,color:G.gold,fontWeight:700,flexShrink:0}}>✓</span>}
        </div>
        {profil.bio&&<p style={{fontSize:11,color:G.textMuted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profil.bio}</p>}
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <span style={{fontSize:10,color:G.textDim}}>{profil.senaryo_sayisi||0} senaryo</span>
          <span style={{fontSize:10,color:G.textDim}}>{profil.takipci_sayisi||0} takipçi</span>
        </div>
      </div>
    </div>
  );
}

export default function Kesfet(){
  var [user,setUser]=useState(null);
  var [gonderiler,setGonderiler]=useState([]);
  var [kisiler,setKisiler]=useState([]);
  var [hashtagler,setHashtagler]=useState([]);
  var [sekme,setSekme]=useState("senaryolar");
  var [filtre,setFiltre]=useState("Hepsi");
  var [arama,setArama]=useState("");
  var [yukleniyor,setYukleniyor]=useState(true);

  useEffect(()=>{
    supabase.auth.getSession().then(r=>{if(r.data?.session)setUser(r.data.session.user);});
    loadVeriler();
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
        a{text-decoration:none;color:inherit;} button{font-family:inherit;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .skeleton{background:linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${G.goldD};border-radius:2px;}
        ::selection{background:rgba(212,175,55,0.2);color:${G.goldL};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(8,8,8,0.95)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold}18,transparent)`}}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <span style={{fontFamily:G.fontDisp,fontSize:20,letterSpacing:"0.12em",color:G.text,flex:1}}>KEŞFET</span>
          <a href="/bildirimler" style={{width:34,height:34,borderRadius:10,background:"rgba(245,240,232,0.04)",border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon id="bell" size={15} color={G.textMuted}/>
          </a>
          <a href="/uret" style={{height:34,padding:"0 12px",borderRadius:10,background:G.goldGrad,display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:800,color:"#0d0d0d",letterSpacing:"0.06em",textTransform:"uppercase"}}>
            <Icon id="plus" size={11} color="#0d0d0d" strokeWidth={3}/>Üret
          </a>
        </div>
        {/* Arama */}
        <div style={{position:"relative",marginBottom:10}}>
          <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
            <Icon id="search" size={15} color={G.textDim}/>
          </div>
          <input value={arama} onChange={e=>setArama(e.target.value)} placeholder="Senaryo, kişi veya hashtag ara..." style={{width:"100%",background:"rgba(245,240,232,0.05)",border:`1px solid ${G.border}`,borderRadius:12,padding:"9px 12px 9px 36px",color:G.text,fontSize:13,outline:"none",fontFamily:G.fontBody}}
            onFocus={e=>e.target.style.borderColor=G.goldD} onBlur={e=>e.target.style.borderColor=G.border}/>
          {arama&&<button onClick={()=>setArama("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",padding:4,cursor:"pointer"}}>
            <Icon id="x" size={13} color={G.textDim}/>
          </button>}
        </div>
        {/* Sekmeler */}
        <div style={{display:"flex",gap:4}}>
          {[{id:"senaryolar",label:"Senaryolar",icon:"film"},{id:"kisiler",label:"Kişiler",icon:"users"},{id:"hashtagler",label:"Hashtagler",icon:"hash"}].map(s=>(
            <button key={s.id} onClick={()=>setSekme(s.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:20,border:`1.5px solid ${sekme===s.id?G.gold:G.border}`,background:sekme===s.id?`${G.gold}12`:"transparent",color:sekme===s.id?G.gold:G.textMuted,fontSize:11,fontWeight:sekme===s.id?700:500,letterSpacing:"0.04em",cursor:"pointer",transition:"all 0.2s"}}>
              <Icon id={s.icon} size={12} color={sekme===s.id?G.gold:G.textMuted}/>{s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"12px 0"}}>
        {/* TÜR FİLTRELERİ — sadece senaryolar sekmesinde */}
        {sekme==="senaryolar"&&(
          <div style={{display:"flex",gap:6,overflowX:"auto",padding:"4px 16px 12px",scrollbarWidth:"none"}}>
            <style>{`.tur-scroll::-webkit-scrollbar{display:none}`}</style>
            {TURLER.map(t=>{
              var aktif=filtre===t;
              var renk=TURLER_RENK[t];
              return(
                <button key={t} onClick={()=>setFiltre(t)} style={{flexShrink:0,padding:"5px 14px",borderRadius:20,border:`1.5px solid ${aktif?(renk||G.gold)+"60":G.border}`,background:aktif?(renk||G.gold)+"15":"transparent",color:aktif?(renk||G.gold):G.textMuted,fontSize:11,fontWeight:aktif?700:500,letterSpacing:"0.04em",cursor:"pointer",transition:"all 0.2s",whiteSpace:"nowrap"}}>
                  {t}
                </button>
              );
            })}
          </div>
        )}

        {yukleniyor?(
          <div style={{display:"flex",justifyContent:"center",padding:"40px 0"}}>
            <div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
          </div>
        ):sekme==="senaryolar"?(
          filtreliGonderiler.length>0
            ?filtreliGonderiler.map(g=><FilmCard key={g.id} g={g} user={user} onBegen={handleBegen} onKaydet={handleKaydet}/>)
            :<div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{fontFamily:G.fontDisp,fontSize:40,color:G.textDim,marginBottom:10,letterSpacing:"0.1em"}}>SONUÇ YOK</div>
              <p style={{fontSize:13,color:G.textMuted}}>Bu filtre için senaryo bulunamadı.</p>
            </div>
        ):sekme==="kisiler"?(
          <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:8}}>
            {filtreliKisiler.map(p=><KisiKarti key={p.id} profil={p}/>)}
          </div>
        ):(
          /* HASHTAGLER */
          <div style={{padding:"0 16px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {hashtagler.filter(h=>!arama||h.etiket?.toLowerCase().includes(arama.toLowerCase())).map((h,i)=>(
                <div key={h.id} onClick={()=>window.location.href=`/hashtag/${h.etiket}`}
                  style={{background:"linear-gradient(145deg,#141414,#0f0f0f)",border:`1px solid ${G.border}`,borderRadius:14,padding:"14px 14px",cursor:"pointer",position:"relative",transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=G.borderHov;e.currentTarget.style.boxShadow=G.glow;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                  <FilmCorners size={8} color={G.goldD}/>
                  <div style={{fontFamily:G.fontDisp,fontSize:22,color:G.gold,letterSpacing:"0.05em",marginBottom:4}}>#{h.etiket}</div>
                  <div style={{fontSize:11,color:G.textDim}}>{h.kullanim_sayisi||0} senaryo</div>
                  <div style={{position:"absolute",top:10,right:12,fontFamily:G.fontDisp,fontSize:28,color:"rgba(212,175,55,0.06)",letterSpacing:"0"}}>{String(i+1).padStart(2,"0")}</div>
                </div>
              ))}
            </div>
            {hashtagler.length===0&&<div style={{textAlign:"center",padding:"48px 0"}}>
              <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,letterSpacing:"0.1em",marginBottom:8}}>BOŞ</div>
              <p style={{fontSize:13,color:G.textMuted}}>Henüz hashtag yok.</p>
            </div>}
          </div>
        )}
      </div>
      <AltNav active="/kesfet"/>
    </div>
  );
}
