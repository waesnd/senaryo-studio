import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

var G = {
  black:"#0A0F1E", deep:"#0F172A", surface:"#1E293B", card:"#162032",
  border:"rgba(56,189,248,0.12)", borderHov:"rgba(56,189,248,0.4)",
  blue:"#38BDF8", blueL:"#7DD3FC", blueD:"#0EA5E9",
  blueGrad:"linear-gradient(135deg,#0EA5E9 0%,#38BDF8 40%,#7DD3FC 70%,#0EA5E9 100%)",
  purple:"#8B5CF6", purpleL:"#A78BFA",
  purpleGrad:"linear-gradient(135deg,#7C3AED 0%,#8B5CF6 50%,#A78BFA 100%)",
  red:"#EF4444", redL:"#F87171",
  green:"#22C55E",
  amber:"#F59E0B",
  text:"#F1F5F9", textMuted:"rgba(241,245,249,0.5)", textDim:"rgba(241,245,249,0.25)",
  shadow:"0 8px 40px rgba(0,0,0,0.7)",
  glowBlue:"0 0 24px rgba(56,189,248,0.25)",
  glowPurple:"0 0 24px rgba(139,92,246,0.25)",
  glowRed:"0 0 16px rgba(239,68,68,0.3)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

var ROZETLER=[
  {label:"Yeni Kalem",    icon:"✏️", color:"#94A3B8", min:0},
  {label:"Aday Senarist", icon:"📝", color:G.blue,    min:5},
  {label:"Senarist",      icon:"🎬", color:G.purple,  min:20},
  {label:"Usta Senarist", icon:"🏆", color:G.blueL,   min:50},
  {label:"Efsane",        icon:"👑", color:G.red,      min:100},
];
function getRozet(n){return[...ROZETLER].reverse().find(r=>(n||0)>=r.min)||ROZETLER[0];}

function Icon({id,size=22,color="currentColor",strokeWidth=1.8}){
  var p={width:size,height:size,fill:"none",stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="logout")return<svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  if(id==="target")return<svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  if(id==="trophy")return<svg {...p}><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4H4a2 2 0 000 4h2.5M17 4h3a2 2 0 010 4h-2.5M7 4l2 7h6l2-7"/></svg>;
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

function Av({url,size}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${G.deep},${G.surface})`,border:`1.5px solid rgba(56,189,248,0.25)`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.4} color="rgba(56,189,248,0.4)"/>}
    </div>
  );
}

function Skeleton({w,h,r}){
  return<div style={{width:w||"100%",height:h||16,borderRadius:r||8,background:`linear-gradient(90deg,${G.surface} 25%,${G.card} 50%,${G.surface} 75%)`,backgroundSize:"200% 100%",animation:"skeletonAnim 1.5s infinite"}}/>;
}

function Drawer({onClose,user,username,avatarUrl}){
  var [cikisOnay,setCikisOnay]=useState(false);
  var LINKS=[
    {href:"/",label:"Ana Sayfa",id:"home"},
    {href:"/uret",label:"Senaryo Üret",id:"film",badge:"AI"},
    {href:"/kesfet",label:"Keşfet",id:"compass"},
    {href:"/topluluk",label:"Topluluk",id:"users"},
    {href:"/mesajlar",label:"Mesajlar",id:"chat"},
  ];
  return(<>
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,5,20,0.85)",backdropFilter:"blur(8px)"}}/>
    <div style={{position:"fixed",top:0,left:0,bottom:0,zIndex:201,width:290,background:`linear-gradient(180deg,${G.black},${G.deep})`,borderRight:`1px solid ${G.border}`,display:"flex",flexDirection:"column",boxShadow:"12px 0 80px rgba(0,0,0,0.9)"}}>
      <div style={{height:2,background:G.blueGrad,flexShrink:0,boxShadow:`0 0 20px rgba(56,189,248,0.5)`}}/>
      <div style={{padding:"22px 18px 16px",borderBottom:`1px solid ${G.border}`,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <Av url={avatarUrl} size={50}/>
          <button onClick={onClose} style={{background:`${G.blue}08`,border:`1px solid ${G.border}`,borderRadius:10,padding:"6px 11px",color:G.textMuted,fontSize:12,cursor:"pointer"}}>ESC</button>
        </div>
        {user?<><p style={{fontSize:15,fontWeight:800,color:G.text}}>@{username}</p><p style={{fontSize:11,color:G.textDim,marginTop:3}}>{user.email}</p></>
          :<button onClick={()=>{onClose();window.location.href="/";}} style={{width:"100%",padding:"10px",borderRadius:12,background:G.blueGrad,border:"none",color:G.black,fontSize:13,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em",cursor:"pointer",boxShadow:G.glowBlue}}>Giriş Yap</button>}
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"10px"}}>
        {LINKS.map(item=>{
          var active=typeof window!=="undefined"&&window.location.pathname===item.href;
          return(
            <a key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:13,padding:"11px 12px",borderRadius:11,marginBottom:2,color:active?G.blue:G.textMuted,background:active?`${G.blue}08`:"transparent",border:`1px solid ${active?G.border:"transparent"}`,fontWeight:active?700:500,fontSize:14,textDecoration:"none"}}>
              <Icon id={item.id} size={18} color={active?G.blue:G.textDim}/>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge&&<span style={{fontSize:8,fontWeight:800,padding:"2px 7px",borderRadius:20,background:G.purple,color:"#fff"}}>{item.badge}</span>}
            </a>
          );
        })}
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${G.border}`}}>
          <a href="/profil" style={{display:"flex",alignItems:"center",gap:13,padding:"11px 12px",borderRadius:11,color:G.textMuted,fontSize:14,textDecoration:"none"}}><Icon id="user" size={18} color={G.textDim}/>Profil</a>
          {user&&<button onClick={()=>setCikisOnay(true)} style={{display:"flex",alignItems:"center",gap:13,padding:"11px 12px",borderRadius:11,width:"100%",textAlign:"left",color:G.red,background:`${G.red}07`,border:`1px solid ${G.red}15`,fontSize:14,fontWeight:600,cursor:"pointer"}}><Icon id="logout" size={18} color={G.red}/>Çıkış Yap</button>}
        </div>
      </nav>
      <div style={{padding:"12px 18px",borderTop:`1px solid ${G.border}`,textAlign:"center",flexShrink:0}}>
        <p style={{fontSize:9,color:G.textDim,letterSpacing:"0.18em"}}>© 2025 SCRIPTIFY</p>
      </div>
    </div>
    {cikisOnay&&<>
      <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:301,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        <div style={{background:G.surface,border:`1px solid ${G.borderHov}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:300,textAlign:"center",position:"relative",boxShadow:G.glowRed}}>
          <NeonCorners color={G.red}/>
          <div style={{fontFamily:G.fontDisp,fontSize:22,color:G.text,marginBottom:8}}>ÇIKIŞ YAP</div>
          <p style={{fontSize:13,color:G.textMuted,marginBottom:22}}>Emin misin?</p>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setCikisOnay(false)} style={{flex:1,padding:"12px",borderRadius:12,background:"rgba(241,245,249,0.05)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:13,fontWeight:600,cursor:"pointer"}}>İptal</button>
            <button onClick={()=>{supabase.auth.signOut();window.location.href="/";}} style={{flex:1,padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${G.red},${G.redL})`,border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Çıkış</button>
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
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}30,transparent)`,pointerEvents:"none"}}/>
      {items.map(item=>{
        var active=item.href==="/topluluk";
        return(
          <a key={item.href} href={item.href} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px",borderRadius:12,position:"relative",opacity:active?1:0.35,transition:"all 0.2s"}}>
            <Icon id={item.id} size={22} color={active?G.blue:"#94A3B8"}/>
            {active&&<>
              <div style={{position:"absolute",bottom:0,width:20,height:2,borderRadius:1,background:G.blueGrad,boxShadow:`0 0 8px ${G.blue}`}}/>
              <div style={{position:"absolute",inset:0,borderRadius:12,background:`radial-gradient(circle at 50% 100%,${G.blue}12,transparent 70%)`}}/>
            </>}
          </a>
        );
      })}
    </div>
  );
}

export default function Topluluk(){
  var {user, profil, authHazir, okunmayanBildirim} = useAuth();
  var [challengelar,setChallenglar]=useState([]);
  var [topSenaristler,setTopSenaristler]=useState([]);
  var [yukleniyorC,setYukleniyorC]=useState(false);
  var [yukleniyorS,setYukleniyorS]=useState(false);
  var [drawer,setDrawer]=useState(false);
  var [sekme,setSekme]=useState("challenge");

  var avatarUrl=profil?.avatar_url||null;
  var username=profil?.username||(user?user.email.split("@")[0]:"");

  useEffect(()=>{
    loadChallenglar();
    loadTopSenaristler();
  },[]);

  async function loadChallenglar(){
    setYukleniyorC(true);
    var{data}=await supabase.from("challengelar").select("*").eq("aktif",true).order("olusturulma_tarihi",{ascending:false}).limit(10);
    setChallenglar(data||[]);
    setYukleniyorC(false);
  }

  async function loadTopSenaristler(){
    setYukleniyorS(true);
    var{data}=await supabase.from("profiles").select("*").order("senaryo_sayisi",{ascending:false}).limit(10);
    setTopSenaristler(data||[]);
    setYukleniyorS(false);
  }

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:90}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes skeletonAnim{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes neonPulse{0%,100%{opacity:0.6}50%{opacity:1}}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:${G.blueD};border-radius:2px;}
        ::selection{background:rgba(56,189,248,0.2);color:${G.blueL};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(24px)",borderBottom:`1px solid ${G.border}`}}>
        {/* Siber üst çizgi */}
        <div style={{height:2,background:G.blueGrad,boxShadow:`0 0 12px rgba(56,189,248,0.4)`}}/>
        <div style={{padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button onClick={()=>setDrawer(true)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",padding:0,cursor:"pointer"}}>
            <Av url={avatarUrl} size={34}/>
            <img src="/logo.png" alt="Scriptify" style={{height:44,objectFit:"contain",maxWidth:150}}/>
          </button>
          <span style={{fontFamily:G.fontDisp,fontSize:13,letterSpacing:"0.12em",color:G.blue,background:`${G.blue}12`,border:`1px solid ${G.blue}25`,borderRadius:20,padding:"4px 12px",boxShadow:G.glowBlue}}>TOPLULUK</span>
        </div>
        {/* Sekmeler */}
        <div style={{display:"flex",borderTop:`1px solid ${G.border}`,padding:"0 16px"}}>
          {[{id:"challenge",label:"CHALLENGELAR",icon:"target"},{id:"senaristler",label:"TOP SENARİSTLER",icon:"trophy"}].map(s=>(
            <button key={s.id} onClick={()=>setSekme(s.id)} style={{flex:1,padding:"11px 0",fontSize:11,fontWeight:800,letterSpacing:"0.1em",color:sekme===s.id?G.blue:G.textDim,background:"none",border:"none",position:"relative",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"color 0.2s"}}>
              <Icon id={s.icon} size={12} color={sekme===s.id?G.blue:G.textDim}/>
              {s.label}
              {sekme===s.id&&<div style={{position:"absolute",bottom:0,left:"20%",right:"20%",height:2,background:G.blueGrad,borderRadius:1,boxShadow:`0 0 8px ${G.blue}`}}/>}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"16px 12px 0"}}>

        {/* ── CHALLENGELAR ── */}
        {sekme==="challenge"&&(
          <div style={{animation:"fadeUp 0.35s ease"}}>
            {/* Banner */}
            <div style={{background:`linear-gradient(135deg,${G.blue}08,${G.purple}06)`,border:`1px solid ${G.blue}18`,borderRadius:16,padding:"18px",marginBottom:16,position:"relative",overflow:"hidden"}}>
              <NeonCorners color={G.blue}/>
              <div style={{position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:"50%",background:`radial-gradient(circle,${G.blue}08,transparent)`,pointerEvents:"none"}}/>
              <p style={{fontSize:11,fontWeight:800,color:G.textDim,letterSpacing:"0.15em",marginBottom:6}}>HAFTALIK</p>
              <h2 style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.06em",color:G.text,marginBottom:4}}>SENARYO CHALLENGELARı</h2>
              <p style={{fontSize:12,color:G.textMuted}}>Konuya katıl, senaryo üret, topluluğu şaşırt</p>
            </div>

            {yukleniyorC?(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[...Array(4)].map((_,i)=>(
                  <div key={i} style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:14,padding:16}}>
                    <Skeleton w="70%" h={16} r={6}/><div style={{marginTop:8}}><Skeleton w="90%" h={12} r={5}/></div>
                  </div>
                ))}
              </div>
            ):challengelar.length===0?(
              <div style={{textAlign:"center",padding:"60px 0"}}>
                <div style={{fontFamily:G.fontDisp,fontSize:44,color:G.textDim,letterSpacing:"0.1em",marginBottom:10}}>YAKINDA</div>
                <p style={{fontSize:13,color:G.textMuted}}>Yeni challenge geliyor!</p>
              </div>
            ):challengelar.map((ch,i)=>(
              <div key={ch.id} style={{background:`linear-gradient(135deg,${G.card},${G.surface})`,border:`1px solid ${G.border}`,borderRadius:14,padding:"16px",marginBottom:10,animation:"fadeUp 0.3s ease",animationDelay:`${i*0.05}s`,animationFillMode:"both",position:"relative",overflow:"hidden",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=G.borderHov;e.currentTarget.style.boxShadow=G.glowBlue;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                <NeonCorners color={G.blue} size={8}/>
                {/* Sıra numarası */}
                <div style={{position:"absolute",top:12,right:12,width:30,height:30,borderRadius:"50%",background:`${G.blue}08`,border:`1px solid ${G.blue}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontFamily:G.fontDisp,fontSize:12,color:G.textDim}}>#{i+1}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:`${G.purple}12`,color:G.purple,border:`1px solid ${G.purple}25`,letterSpacing:"0.06em"}}>
                    {ch.tur||"DRAMA"} · {ch.tip||"DİZİ"}
                  </span>
                  {ch.katilimci_sayisi>0&&<span style={{fontSize:10,color:G.textDim}}>👥 {ch.katilimci_sayisi} katılımcı</span>}
                </div>
                <h3 style={{fontSize:15,fontWeight:800,color:G.text,marginBottom:6,lineHeight:1.3}}>{ch.konu}</h3>
                {ch.aciklama&&<p style={{fontSize:12,color:G.textMuted,lineHeight:1.55,marginBottom:12}}>{ch.aciklama}</p>}
                <a href={`/uret?challenge=${encodeURIComponent(ch.konu)}&tur=${ch.tur||""}&tip=${ch.tip||""}`}
                  style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:G.blueGrad,border:"none",color:G.black,fontSize:11,fontWeight:800,letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:G.glowBlue}}>
                  <Icon id="zap" size={11} color={G.black} strokeWidth={2.5}/>
                  Katıl & Üret
                </a>
              </div>
            ))}
          </div>
        )}

        {/* ── TOP SENARİSTLER ── */}
        {sekme==="senaristler"&&(
          <div style={{animation:"fadeUp 0.35s ease"}}>
            {/* Banner */}
            <div style={{background:`linear-gradient(135deg,${G.purple}08,${G.blue}06)`,border:`1px solid ${G.purple}18`,borderRadius:16,padding:"18px",marginBottom:16,position:"relative"}}>
              <NeonCorners color={G.purple}/>
              <p style={{fontSize:11,fontWeight:800,color:G.textDim,letterSpacing:"0.15em",marginBottom:6}}>LIDERBOARD</p>
              <h2 style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.06em",color:G.text}}>EN İYİ SENARİSTLER</h2>
            </div>

            {yukleniyorS?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[...Array(5)].map((_,i)=>(
                  <div key={i} style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:14,padding:14,display:"flex",gap:12,alignItems:"center"}}>
                    <Skeleton w={44} h={44} r={22}/><div style={{flex:1}}><Skeleton w="50%" h={14} r={6}/><div style={{marginTop:6}}><Skeleton w="35%" h={11} r={5}/></div></div>
                  </div>
                ))}
              </div>
            ):topSenaristler.map((p,i)=>{
              var rozet=getRozet(p.senaryo_sayisi||0);
              var madalyaRenk=["#F2D46F","#C0C0C0","#cd7f32"];
              var madalyaNeon=[G.glowBlue,`0 0 16px rgba(192,192,192,0.3)`,`0 0 16px rgba(205,127,50,0.3)`];
              return(
                <a key={p.id} href={`/@${p.username||p.id}`}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"14px",background:`linear-gradient(135deg,${G.card},${G.surface})`,border:`1px solid ${G.border}`,borderRadius:14,marginBottom:8,animation:"fadeUp 0.3s ease",animationDelay:`${i*0.04}s`,animationFillMode:"both",textDecoration:"none",transition:"all 0.2s",position:"relative"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=G.borderHov;e.currentTarget.style.boxShadow=G.glowBlue;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                  {i<3&&<NeonCorners color={madalyaRenk[i]} size={8}/>}
                  {/* Sıra */}
                  <div style={{width:32,textAlign:"center",flexShrink:0}}>
                    {i<3?<span style={{fontSize:18}}>{["🥇","🥈","🥉"][i]}</span>:<span style={{fontFamily:G.fontDisp,fontSize:14,color:G.textDim}}>#{i+1}</span>}
                  </div>
                  <Av url={p.avatar_url} size={44}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <p style={{fontSize:14,fontWeight:700,color:G.text}}>@{p.username||"kullanıcı"}</p>
                      {p.dogrulandi&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:`${G.blue}15`,color:G.blue,fontWeight:800,boxShadow:`0 0 6px ${G.blue}25`}}>✓</span>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                      <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:`${rozet.color}15`,color:rozet.color,border:`1px solid ${rozet.color}22`,fontWeight:700}}>{rozet.icon} {rozet.label}</span>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontFamily:G.fontDisp,fontSize:20,color:i===0?G.blueL:i===1?"#C0C0C0":i===2?"#cd7f32":G.blue,textShadow:i<3?madalyaNeon[i]:"none"}}>{p.senaryo_sayisi||0}</div>
                    <p style={{fontSize:9,color:G.textDim,letterSpacing:"0.08em"}}>SENARYO</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      <AltNav/>
      {drawer&&<Drawer onClose={()=>setDrawer(false)} user={user} username={username} avatarUrl={avatarUrl}/>}
    </div>
  );
}
