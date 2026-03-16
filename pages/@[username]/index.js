import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/useAuth";

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

var TURLER_RENK={
  "Gerilim":G.red,"Drama":G.blue,"Komedi":"#FBBF24","Aksiyon":G.red,
  "Korku":G.purple,"Romantik":"#F472B6","Bilim Kurgu":G.blueL,
  "Fantastik":G.purpleL,"Suç":"#94A3B8","Tarihi":"#D97706",
};

function Icon({id,size=22,color="currentColor",strokeWidth=1.8}){
  var p={width:size,height:size,fill:"none",stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="arrow-left")return<svg {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
  if(id==="more")return<svg {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="heart")return<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  if(id==="ban")return<svg {...p}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>;
  if(id==="flag")return<svg {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
  if(id==="check")return<svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
  if(id==="link")return<svg {...p}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>;
  if(id==="grid")return<svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
  if(id==="list")return<svg {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
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

function Av({url,size,ring=G.blue}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${G.deep},${G.surface})`,border:`2px solid ${ring}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 0 16px ${ring}30`}}>
      {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.4} color={ring+"60"}/>}
    </div>
  );
}


function SimpleDrawer({user,username,avatarUrl,onClose}){
  var LINKS=[
    {href:"/",label:"Ana Sayfa",icon:"home"},
    {href:"/uret",label:"Senaryo Üret",icon:"film",badge:"AI"},
    {href:"/kesfet",label:"Keşfet",icon:"compass"},
    {href:"/topluluk",label:"Topluluk",icon:"users"},
    {href:"/mesajlar",label:"Mesajlar",icon:"chat"},
    {href:"/profil",label:"Profil",icon:"user"},
  ];
  return(<>
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,5,20,0.85)",backdropFilter:"blur(8px)"}}/>
    <div style={{position:"fixed",top:0,left:0,bottom:0,zIndex:201,width:280,background:`linear-gradient(180deg,${G.black},${G.deep})`,borderRight:`1px solid ${G.border}`,display:"flex",flexDirection:"column"}}>
      <div style={{height:2,background:G.blueGrad,boxShadow:"0 0 20px rgba(56,189,248,0.5)"}}/>
      <div style={{padding:"18px 18px 14px",borderBottom:`1px solid ${G.border}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <Av url={avatarUrl} size={44}/>
          <button onClick={onClose} style={{background:`${G.blue}08`,border:`1px solid ${G.border}`,borderRadius:8,padding:"5px 10px",color:G.textMuted,fontSize:12,cursor:"pointer"}}>ESC</button>
        </div>
        {user?<p style={{fontSize:14,fontWeight:800,color:G.text}}>@{username}</p>
          :<a href="/" style={{display:"block",padding:"9px",borderRadius:10,background:G.blueGrad,color:G.black,fontSize:13,fontWeight:800,textTransform:"uppercase",textAlign:"center",textDecoration:"none"}}>Giriş Yap</a>}
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"10px"}}>
        {LINKS.map(item=>{
          var active=typeof window!=="undefined"&&window.location.pathname===item.href;
          return(
            <a key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",borderRadius:10,marginBottom:2,color:active?G.blue:G.textMuted,background:active?`${G.blue}08`:"transparent",fontWeight:active?700:500,fontSize:13,textDecoration:"none"}}>
              <Icon id={item.icon} size={16} color={active?G.blue:G.textMuted}/>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge&&<span style={{fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:20,background:G.purple,color:"#fff"}}>{item.badge}</span>}
            </a>
          );
        })}
      </nav>
    </div>
  </>);
}

function AltNav(){
  var items=[{href:"/",id:"home"},{href:"/kesfet",id:"compass"},{href:"/topluluk",id:"users"},{href:"/mesajlar",id:"chat"},{href:"/profil",id:"user"}];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"8px 0 env(safe-area-inset-bottom,10px)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}30,transparent)`,pointerEvents:"none"}}/>
      {items.map(item=>(
        <a key={item.href} href={item.href} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px",borderRadius:12,opacity:0.35}}>
          <Icon id={item.id} size={22} color="#94A3B8"/>
        </a>
      ))}
    </div>
  );
}

function zaman(ts){
  var d=Math.floor((Date.now()-new Date(ts))/1000);
  if(d<60)return"az önce";
  if(d<3600)return Math.floor(d/60)+"dk";
  if(d<86400)return Math.floor(d/3600)+"sa";
  return Math.floor(d/86400)+"g";
}

export default function KullaniciProfil(){
  var [drawer,setDrawer]=useState(false);
  var router=useRouter();
  var {username}=router.query;
  var {user, profil: authProfil, authHazir} = useAuth();
  var [profil,setProfil]=useState(null);
  var [senaryolar,setSenaryolar]=useState([]);
  var [gonderiler,setGonderiler]=useState([]);
  var [tab,setTab]=useState("gonderiler");
  var [gorunu,setGorunu]=useState("liste"); // liste | grid
  var [takipci,setTakipci]=useState(0);
  var [takip,setTakip]=useState(0);
  var [takipEdiyorum,setTakipEdiyorum]=useState(false);
  var [engelledim,setEngelledim]=useState(false);
  var [yukleniyor,setYukleniyor]=useState(true);
  var loaded=authHazir;
  var [menu,setMenu]=useState(false);

  var benimProfil=user&&profil&&user.id===profil.id;
  var rozet=getRozet(profil?.senaryo_sayisi||0);


  useEffect(()=>{
    if(!username)return;
    var temiz=username.startsWith("@")?username.slice(1):username;
    yukle(temiz);
  },[username]);

  async function yukle(un){
    setYukleniyor(true);
    var{data:p}=await supabase.from("profiles").select("*").eq("username",un).single();
    if(!p){setYukleniyor(false);return;}
    setProfil(p);
    var[s,g,tc,tp]=await Promise.all([
      supabase.from("senaryolar").select("*").eq("user_id",p.id).eq("paylasim_acik",true).order("created_at",{ascending:false}),
      supabase.from("gonderiler").select("*").eq("user_id",p.id).order("created_at",{ascending:false}),
      supabase.from("takipler").select("*",{count:"exact"}).eq("takip_edilen",p.id),
      supabase.from("takipler").select("*",{count:"exact"}).eq("takip_eden",p.id),
    ]);
    if(s.data)setSenaryolar(s.data);
    if(g.data)setGonderiler(g.data);
    setTakipci(tc.count||0);
    setTakip(tp.count||0);
    setYukleniyor(false);
  }

  useEffect(()=>{
    if(!user||!profil)return;
    supabase.from("takipler").select("*").eq("takip_eden",user.id).eq("takip_edilen",profil.id).single().then(({data})=>setTakipEdiyorum(!!data));
    supabase.from("engellemeler").select("*").eq("engelleyen",user.id).eq("engellened",profil.id).single().then(({data})=>setEngelledim(!!data));
  },[user,profil]);

  async function takipToggle(){
    if(!user){window.location.href="/";return;}
    if(takipEdiyorum){
      await supabase.from("takipler").delete().eq("takip_eden",user.id).eq("takip_edilen",profil.id);
      setTakipEdiyorum(false);setTakipci(p=>p-1);
    }else{
      await supabase.from("takipler").insert([{takip_eden:user.id,takip_edilen:profil.id}]);
      setTakipEdiyorum(true);setTakipci(p=>p+1);
      await supabase.from("bildirimler").insert([{alici_id:profil.id,gonderen_id:user.id,tip:"takip"}]);
    }
  }

  async function engelToggle(){
    if(!user)return;
    if(engelledim){
      await supabase.from("engellemeler").delete().eq("engelleyen",user.id).eq("engellened",profil.id);
      setEngelledim(false);
    }else{
      await supabase.from("engellemeler").insert([{engelleyen:user.id,engellened:profil.id}]);
      setEngelledim(true);
      if(takipEdiyorum){
        await supabase.from("takipler").delete().eq("takip_eden",user.id).eq("takip_edilen",profil.id);
        setTakipEdiyorum(false);setTakipci(p=>p-1);
      }
    }
    setMenu(false);
  }

  if(!loaded||yukleniyor)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{width:32,height:32,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite",boxShadow:G.glowBlue}}/>
      <p style={{fontFamily:G.fontDisp,fontSize:14,color:G.textDim,letterSpacing:"0.1em"}}>YÜKLENİYOR</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(!profil)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:G.fontBody}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:80,height:80,borderRadius:"50%",background:`${G.red}10`,border:`1px solid ${G.red}30`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:G.glowRed}}>
        <Icon id="user" size={32} color={G.red}/>
      </div>
      <div style={{fontFamily:G.fontDisp,fontSize:48,color:G.textDim,letterSpacing:"0.1em"}}>404</div>
      <p style={{color:G.textMuted,fontSize:14}}>Kullanıcı bulunamadı</p>
      <a href="/" style={{padding:"10px 24px",borderRadius:12,background:G.blueGrad,color:G.black,fontWeight:800,fontSize:13,textDecoration:"none",boxShadow:G.glowBlue}}>← Ana Sayfaya Dön</a>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes cyberScan{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:${G.blueD};border-radius:2px;}
        ::selection{background:rgba(56,189,248,0.2);color:${G.blueL};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}18,transparent)`,pointerEvents:"none"}}/>
        <button onClick={()=>router.back()} style={{background:`${G.blue}08`,border:`1px solid ${G.border}`,borderRadius:10,padding:"7px",display:"flex",flexShrink:0}}>
          <Icon id="arrow-left" size={18} color={G.blue}/>
        </button>
        <img src="/logo.png" alt="Scriptify" style={{height:40,objectFit:"contain",maxWidth:130}}/>
        <p style={{flex:1,fontFamily:G.fontDisp,fontSize:16,letterSpacing:"0.06em",color:G.text}}>@{profil.username}</p>
        {!benimProfil&&(
          <div style={{position:"relative"}}>
            <button onClick={()=>setMenu(!menu)} style={{width:34,height:34,borderRadius:10,background:`${G.blue}08`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon id="more" size={16} color={G.textMuted}/>
            </button>
            {menu&&(
              <div style={{position:"absolute",right:0,top:42,background:G.surface,border:`1px solid ${G.borderHov}`,borderRadius:14,padding:"6px",minWidth:170,boxShadow:`${G.shadow},${G.glowBlue}`,zIndex:10,animation:"fadeUp 0.15s ease"}}>
                <button onClick={engelToggle} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:"none",border:"none",color:engelledim?G.blue:G.red,fontSize:13,textAlign:"left",borderRadius:10}}>
                  <Icon id={engelledim?"check":"ban"} size={13} color={engelledim?G.blue:G.red}/>
                  {engelledim?"Engel Kaldır":"Engelle"}
                </button>
                <button onClick={()=>setMenu(false)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:"none",border:"none",color:G.textMuted,fontSize:13,textAlign:"left",borderRadius:10}}>
                  <Icon id="flag" size={13} color={G.textMuted}/>Raporla
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{maxWidth:680,margin:"0 auto"}}>

        {/* ── BANNER ── */}
        <div style={{height:140,position:"relative",overflow:"hidden"}}>
          {profil.banner_url
            ?<img src={profil.banner_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
            :<div style={{height:"100%",background:`linear-gradient(135deg,${G.deep},${G.surface})`,position:"relative",overflow:"hidden"}}>
              {/* Siber grid arka plan */}
              <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${G.blue}08 1px,transparent 1px),linear-gradient(90deg,${G.blue}08 1px,transparent 1px)`,backgroundSize:"40px 40px"}}/>
              {/* Köşegen neon çizgiler */}
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:G.blueGrad,boxShadow:`0 0 20px rgba(56,189,248,0.5)`}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.purple},transparent)`,opacity:0.4}}/>
              {/* Radyal ışıma */}
              <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 30% 50%,${G.blue}10,transparent 60%)`,pointerEvents:"none"}}/>
              <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 80% 30%,${G.purple}08,transparent 50%)`,pointerEvents:"none"}}/>
              {/* Username watermark */}
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                <span style={{fontFamily:G.fontDisp,fontSize:52,letterSpacing:"0.15em",color:"rgba(56,189,248,0.04)",userSelect:"none"}}>@{profil.username}</span>
              </div>
            </div>
          }
        </div>

        <div style={{padding:"0 16px"}}>

          {/* ── AVATAR + BUTONLAR ── */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:-52,marginBottom:16}}>
            <div style={{position:"relative"}}>
              <Av url={profil.avatar_url} size={96} ring={rozet.color}/>
              {/* Online nokta */}
              <div style={{position:"absolute",bottom:4,right:4,width:18,height:18,borderRadius:"50%",background:G.green,border:`3px solid ${G.black}`,boxShadow:`0 0 8px ${G.green}`}}/>
            </div>
            <div style={{display:"flex",gap:8,paddingBottom:4}}>
              {benimProfil?(
                <a href="/profil" style={{padding:"8px 18px",borderRadius:20,border:`1.5px solid ${G.border}`,color:G.text,fontSize:12,fontWeight:700,textDecoration:"none",background:G.surface,letterSpacing:"0.04em"}}>Profili Düzenle</a>
              ):(
                <>
                  <button onClick={()=>window.location.href="/mesajlar"}
                    style={{width:38,height:38,borderRadius:12,background:G.surface,border:`1.5px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=G.blue;e.currentTarget.style.boxShadow=G.glowBlue;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                    <Icon id="chat" size={16} color={G.textMuted}/>
                  </button>
                  <button onClick={takipToggle}
                    style={{padding:"8px 20px",borderRadius:20,background:takipEdiyorum?G.surface:G.blueGrad,border:`1.5px solid ${takipEdiyorum?G.border:"transparent"}`,color:takipEdiyorum?G.text:G.black,fontSize:12,fontWeight:800,letterSpacing:"0.04em",transition:"all 0.2s",boxShadow:takipEdiyorum?"none":G.glowBlue}}>
                    {takipEdiyorum?"Takiptesin ✓":"+ Takip Et"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── PROFİL BİLGİLERİ ── */}
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
              <h1 style={{fontFamily:G.fontDisp,fontSize:24,letterSpacing:"0.04em",color:G.text}}>@{profil.username}</h1>
              {profil.dogrulandi&&(
                <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,background:`${G.blue}15`,border:`1px solid ${G.blue}25`,boxShadow:G.glowBlue}}>
                  <Icon id="check" size={10} color={G.blue} strokeWidth={3}/>
                  <span style={{fontSize:9,color:G.blue,fontWeight:800,letterSpacing:"0.08em"}}>DOĞRULANMIŞ</span>
                </div>
              )}
            </div>

            {/* Rozet */}
            <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:20,background:`${rozet.color}12`,border:`1px solid ${rozet.color}25`,marginBottom:10,boxShadow:`0 0 10px ${rozet.color}15`}}>
              <span style={{fontSize:13}}>{rozet.icon}</span>
              <span style={{fontSize:11,fontWeight:700,color:rozet.color}}>{rozet.label}</span>
            </div>

            {profil.bio&&<p style={{fontSize:13,color:G.textMuted,lineHeight:1.7,marginBottom:8}}>{profil.bio}</p>}
            {profil.website&&(
              <a href={profil.website} target="_blank"
                style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,color:G.blue,fontWeight:600,padding:"4px 10px",borderRadius:20,background:`${G.blue}10`,border:`1px solid ${G.blue}20`}}>
                <Icon id="link" size={11} color={G.blue}/>
                {profil.website.replace(/https?:\/\//,"")}
              </a>
            )}
          </div>

          {/* ── İSTATİSTİK GRİD ── */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
            {[
              {val:profil.senaryo_sayisi||senaryolar.length,label:"Senaryo",color:G.blue},
              {val:gonderiler.length,label:"Gönderi",color:G.purple},
              {val:takipci,label:"Takipçi",color:G.blueL},
              {val:takip,label:"Takip",color:G.textMuted},
            ].map((s,i)=>(
              <div key={s.label} style={{background:G.surface,borderRadius:14,padding:"12px 8px",textAlign:"center",border:`1px solid ${G.border}`,position:"relative",overflow:"hidden",transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=s.color+"40";e.currentTarget.style.boxShadow=`0 0 14px ${s.color}12`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${s.color}40,transparent)`,pointerEvents:"none"}}/>
                <div style={{fontFamily:G.fontDisp,fontSize:20,color:s.color,textShadow:`0 0 10px ${s.color}30`}}>{s.val}</div>
                <p style={{fontSize:9,color:G.textDim,letterSpacing:"0.08em",marginTop:2}}>{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>

          {/* Engellendi uyarısı */}
          {engelledim&&(
            <div style={{background:`${G.red}08`,border:`1px solid ${G.red}25`,borderRadius:14,padding:"12px 16px",marginBottom:16,textAlign:"center",position:"relative"}}>
              <NeonCorners color={G.red} size={8}/>
              <p style={{fontSize:12,color:G.red,fontWeight:600}}>Bu kullanıcıyı engellediniz. İçerikleri gizlendi.</p>
            </div>
          )}

          {/* ── TABS ── */}
          {!engelledim&&(
            <>
              <div style={{display:"flex",marginBottom:0,borderBottom:`1px solid ${G.border}`,position:"relative"}}>
                {[{id:"gonderiler",label:"GÖNDERİLER"},{id:"senaryolar",label:"SENARYOLAR"}].map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)}
                    style={{flex:1,padding:"12px 8px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?G.blue:"transparent"}`,color:tab===t.id?G.blue:G.textDim,fontSize:11,fontWeight:800,marginBottom:-1,letterSpacing:"0.1em",transition:"all 0.2s",boxShadow:tab===t.id?`0 2px 10px ${G.blue}25`:"none"}}>
                    {t.label}
                  </button>
                ))}
                {/* Görünüm toggle — sadece senaryolar */}
                {tab==="senaryolar"&&(
                  <div style={{position:"absolute",right:0,bottom:8,display:"flex",gap:4}}>
                    <button onClick={()=>setGorunu("liste")} style={{width:28,height:28,borderRadius:8,background:gorunu==="liste"?`${G.blue}15`:G.surface,border:`1px solid ${gorunu==="liste"?G.blue:G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Icon id="list" size={13} color={gorunu==="liste"?G.blue:G.textDim}/>
                    </button>
                    <button onClick={()=>setGorunu("grid")} style={{width:28,height:28,borderRadius:8,background:gorunu==="grid"?`${G.blue}15`:G.surface,border:`1px solid ${gorunu==="grid"?G.blue:G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <Icon id="grid" size={13} color={gorunu==="grid"?G.blue:G.textDim}/>
                    </button>
                  </div>
                )}
              </div>

              {/* ── GÖNDERİLER ── */}
              {tab==="gonderiler"&&(
                gonderiler.length===0?(
                  <div style={{textAlign:"center",padding:"60px 0"}}>
                    <div style={{width:56,height:56,borderRadius:"50%",background:`${G.blue}10`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:G.glowBlue}}>
                      <Icon id="film" size={24} color={G.blue}/>
                    </div>
                    <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:8}}>BOŞ</div>
                    <p style={{fontSize:13,color:G.textMuted}}>Henüz gönderi yok.</p>
                  </div>
                ):gonderiler.map((g,i)=>(
                  <div key={g.id} style={{borderBottom:`1px solid ${G.border}`,padding:"16px 0",animation:`fadeUp 0.25s ${i*0.04}s both ease`}}>
                    <div style={{display:"flex",gap:10}}>
                      <Av url={profil.avatar_url} size={36} ring={G.blue}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <span style={{fontSize:13,fontWeight:700,color:G.blue}}>@{profil.username}</span>
                          <span style={{fontSize:10,color:G.textDim}}>{zaman(g.created_at)}</span>
                        </div>
                        {g.metin&&<p style={{fontSize:14,color:G.textMuted,lineHeight:1.7,marginBottom:g.fotograf_url?10:0}}>{g.metin}</p>}
                        {g.fotograf_url&&<img src={g.fotograf_url} style={{width:"100%",borderRadius:14,maxHeight:320,objectFit:"cover",border:`1px solid ${G.border}`}} alt=""/>}
                        <div style={{display:"flex",alignItems:"center",gap:4,marginTop:10}}>
                          <Icon id="heart" size={11} color={G.red}/>
                          <span style={{fontSize:11,color:G.textDim}}>{g.begeni_sayisi||0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* ── SENARYOLAR ── */}
              {tab==="senaryolar"&&(
                senaryolar.length===0?(
                  <div style={{textAlign:"center",padding:"60px 0"}}>
                    <div style={{width:56,height:56,borderRadius:"50%",background:`${G.purple}10`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:G.glowPurple}}>
                      <Icon id="film" size={24} color={G.purple}/>
                    </div>
                    <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:8}}>BOŞ</div>
                    <p style={{fontSize:13,color:G.textMuted}}>Paylaşılan senaryo yok.</p>
                  </div>
                ):gorunu==="grid"?(
                  /* GRID görünüm */
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,paddingTop:12}}>
                    {senaryolar.map((s,i)=>{
                      var turRenk=TURLER_RENK[s.tur]||G.blue;
                      return(
                        <a key={s.id} href={"/senaryo/"+s.id}
                          style={{display:"block",background:`linear-gradient(145deg,${G.card},${G.surface})`,border:`1px solid ${G.border}`,borderRadius:16,overflow:"hidden",textDecoration:"none",transition:"all 0.2s",position:"relative",animation:`fadeUp 0.25s ${i*0.04}s both ease`}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=turRenk+"50";e.currentTarget.style.boxShadow=`0 0 20px ${turRenk}12`;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                          <NeonCorners color={turRenk} size={7}/>
                          <div style={{height:3,background:turRenk,opacity:0.6,boxShadow:`0 0 8px ${turRenk}`}}/>
                          <div style={{padding:"12px"}}>
                            <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:`${turRenk}15`,color:turRenk,border:`1px solid ${turRenk}20`,display:"inline-block",marginBottom:8}}>{s.tur}</span>
                            <p style={{fontSize:13,fontWeight:800,color:G.text,lineHeight:1.3,marginBottom:6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{s.baslik}</p>
                            <div style={{display:"flex",alignItems:"center",gap:3}}>
                              <Icon id="heart" size={10} color={G.red}/>
                              <span style={{fontSize:10,color:G.textDim}}>{s.begeni_sayisi||0}</span>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ):(
                  /* LİSTE görünüm */
                  <div style={{paddingTop:12}}>
                    {senaryolar.map((s,i)=>{
                      var turRenk=TURLER_RENK[s.tur]||G.blue;
                      return(
                        <a key={s.id} href={"/senaryo/"+s.id}
                          style={{display:"block",background:`linear-gradient(135deg,${G.card},${G.surface})`,border:`1px solid ${G.border}`,borderRadius:16,padding:"16px 18px",marginBottom:10,textDecoration:"none",position:"relative",overflow:"hidden",transition:"all 0.2s",animation:`fadeUp 0.25s ${i*0.04}s both ease`}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=turRenk+"40";e.currentTarget.style.boxShadow=`0 0 20px ${turRenk}10`;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                          <NeonCorners color={turRenk} size={8}/>
                          {/* Sol tür çizgisi */}
                          <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:`linear-gradient(180deg,${turRenk},${turRenk}50)`,borderRadius:"16px 0 0 16px",boxShadow:`4px 0 12px ${turRenk}20`}}/>
                          <div style={{paddingLeft:8}}>
                            <div style={{display:"flex",gap:6,marginBottom:8}}>
                              <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:`${G.blue}10`,color:G.blue,border:`1px solid ${G.blue}20`}}>{s.tip}</span>
                              <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:`${turRenk}10`,color:turRenk,border:`1px solid ${turRenk}20`}}>{s.tur}</span>
                            </div>
                            <p style={{fontSize:15,fontWeight:800,color:G.text,marginBottom:4}}>{s.baslik}</p>
                            {s.tagline&&<p style={{fontSize:11,fontStyle:"italic",color:turRenk,marginBottom:8,opacity:0.85}}>"{s.tagline}"</p>}
                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                              <div style={{display:"flex",alignItems:"center",gap:3}}>
                                <Icon id="heart" size={11} color={G.red}/>
                                <span style={{fontSize:11,color:G.textDim}}>{s.begeni_sayisi||0}</span>
                              </div>
                              <span style={{fontSize:10,color:G.textDim}}>{zaman(s.created_at)}</span>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      <AltNav/>
      {drawer&&<SimpleDrawer user={user} username={profil?.username||(user?.email?.split("@")[0]||"")} avatarUrl={profil?.avatar_url||null} onClose={()=>setDrawer(false)}/>}
    </div>
  );
}
