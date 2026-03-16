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
  glowGreen:"0 0 12px rgba(34,197,94,0.3)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

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
  if(id==="heart-fill")return<svg {...p} fill={color} stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  if(id==="heart")return<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  if(id==="bookmark")return<svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
  if(id==="bookmark-fill")return<svg {...p} fill={color} stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
  if(id==="target")return<svg {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  if(id==="share")return<svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
  if(id==="clock")return<svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  if(id==="eye")return<svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="send")return<svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
  if(id==="flag")return<svg {...p}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
  if(id==="zap")return<svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  if(id==="save")return<svg {...p}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
  if(id==="layers")return<svg {...p}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
  if(id==="copy")return<svg {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>;
  if(id==="check")return<svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
  return null;
}

function NeonCorners({color=G.blue,size=12,thickness=1.5}){
  var s={position:"absolute",width:size,height:size};
  var l={background:color,position:"absolute",boxShadow:`0 0 6px ${color}90`};
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
      {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.4} color="rgba(56,189,248,0.35)"/>}
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

// İçerik bölüm kartı
function IcerikKart({label,val,icon,accent}){
  if(!val)return null;
  return(
    <div style={{marginBottom:12,background:`linear-gradient(135deg,${G.surface},${G.card})`,border:`1px solid ${G.border}`,borderRadius:16,overflow:"hidden",position:"relative",transition:"border-color 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.borderColor=accent+"40"}
      onMouseLeave={e=>e.currentTarget.style.borderColor=G.border}>
      <NeonCorners color={accent} size={8}/>
      {/* Üst şerit */}
      <div style={{height:2,background:`linear-gradient(90deg,${accent},transparent)`,opacity:0.6}}/>
      <div style={{padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
          <div style={{width:28,height:28,borderRadius:8,background:`${accent}15`,border:`1px solid ${accent}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Icon id={icon} size={13} color={accent}/>
          </div>
          <p style={{fontFamily:G.fontDisp,fontSize:12,letterSpacing:"0.12em",color:accent}}>{label.toUpperCase()}</p>
        </div>
        <p style={{fontSize:13,color:G.textMuted,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{val}</p>
      </div>
    </div>
  );
}

export default function SenaryoDetay(){
  var [drawer,setDrawer]=useState(false);
  var router=useRouter();
  var {id}=router.query;
  var {user, profil, authHazir} = useAuth();
  var [senaryo,setSenaryo]=useState(null);
  var [versiyonlar,setVersiyonlar]=useState([]);
  var [yorumlar,setYorumlar]=useState([]);
  var [yeniYorum,setYeniYorum]=useState("");
  var [begendi,setBegendi]=useState(false);
  var [kaydetti,setKaydetti]=useState(false);
  var [paylasModal,setPaylasModal]=useState(false);
  var [versiyonModal,setVersiyonModal]=useState(false);
  var [raporModal,setRaporModal]=useState(false);
  var [menu,setMenu]=useState(false);
  var [yorumGonderiyor,setYorumGonderiyor]=useState(false);
  var [kopyalandi,setKopyalandi]=useState(false);

  var benim=user&&senaryo&&user.id===senaryo.user_id;
  var turRenk=TURLER_RENK[senaryo?.tur]||G.blue;

  useEffect(()=>{if(id)yukle();},[id,user]);

  async function yukle(){
    var{data:s}=await supabase.from("senaryolar").select("*, profiles(id,username,avatar_url,bio,dogrulandi)").eq("id",id).single();
    if(!s)return;
    setSenaryo(s);
    // Throttle: aynı senaryo için 1 saat içinde tekrar sayma
    try{
      var viewKey="sf_view_"+id;
      var lastView=localStorage.getItem(viewKey);
      var now=Date.now();
      if(!lastView||now-parseInt(lastView)>3600000){
        // Kendi senaryosunu sayma
        if(!u||u.id!==s.user_id){
          supabase.from("senaryolar").update({goruntuleme_sayisi:(s.goruntuleme_sayisi||0)+1}).eq("id",id);
          localStorage.setItem(viewKey,String(now));
        }
      }
    }catch(e){}
    var[y,v]=await Promise.all([
      supabase.from("yorumlar").select("*, profiles(username,avatar_url)").eq("senaryo_id",id).order("created_at",{ascending:true}),
      supabase.from("senaryo_versiyonlar").select("*").eq("senaryo_id",id).order("versiyon",{ascending:false}),
    ]);
    if(y.data)setYorumlar(y.data);
    if(v.data)setVersiyonlar(v.data);
    if(user){
      supabase.from("begeniler").select("*").eq("user_id",user.id).eq("senaryo_id",id).single().then(({data})=>setBegendi(!!data));
      supabase.from("kaydedilenler").select("*").eq("user_id",user.id).eq("senaryo_id",id).single().then(({data})=>setKaydetti(!!data));
    }
  }

  async function begeniToggle(){
    if(!user)return;
    if(begendi){
      await supabase.from("begeniler").delete().eq("user_id",user.id).eq("senaryo_id",id);
      await supabase.from("senaryolar").update({begeni_sayisi:Math.max(0,(senaryo.begeni_sayisi||0)-1)}).eq("id",id);
      setSenaryo(p=>({...p,begeni_sayisi:Math.max(0,(p.begeni_sayisi||0)-1)}));
      setBegendi(false);
    }else{
      await supabase.from("begeniler").insert([{user_id:user.id,senaryo_id:id}]);
      await supabase.from("senaryolar").update({begeni_sayisi:(senaryo.begeni_sayisi||0)+1}).eq("id",id);
      setSenaryo(p=>({...p,begeni_sayisi:(p.begeni_sayisi||0)+1}));
      setBegendi(true);
      if(senaryo.profiles?.id&&senaryo.profiles.id!==user.id)
        supabase.from("bildirimler").insert([{alici_id:senaryo.profiles.id,gonderen_id:user.id,tip:"begeni",senaryo_id:parseInt(id)}]);
    }
  }

  async function kaydetToggle(){
    if(!user)return;
    if(kaydetti){await supabase.from("kaydedilenler").delete().eq("user_id",user.id).eq("senaryo_id",id);setKaydetti(false);}
    else{await supabase.from("kaydedilenler").insert([{user_id:user.id,senaryo_id:id}]);setKaydetti(true);}
  }

  async function yorumGonderFn(){
    if(!user||!yeniYorum.trim()||yorumGonderiyor)return;
    setYorumGonderiyor(true);
    var{data}=await supabase.from("yorumlar").insert([{user_id:user.id,senaryo_id:parseInt(id),metin:yeniYorum}]).select("*, profiles(username,avatar_url)").single();
    if(data){
      setYorumlar(p=>[...p,data]);setYeniYorum("");
      if(senaryo.profiles?.id&&senaryo.profiles.id!==user.id)
        supabase.from("bildirimler").insert([{alici_id:senaryo.profiles.id,gonderen_id:user.id,tip:"yorum",senaryo_id:parseInt(id),icerik:yeniYorum.slice(0,80)}]);
    }
    setYorumGonderiyor(false);
  }

  async function yorumSil(yorumId){
    await supabase.from("yorumlar").delete().eq("id",yorumId);
    setYorumlar(p=>p.filter(y=>y.id!==yorumId));
  }

  async function versiyonKaydet(){
    if(!user||!senaryo)return;
    var sonVersiyon=versiyonlar.length>0?versiyonlar[0].versiyon:0;
    await supabase.from("senaryo_versiyonlar").insert([{senaryo_id:parseInt(id),user_id:user.id,versiyon:sonVersiyon+1,baslik:senaryo.baslik,ana_fikir:senaryo.ana_fikir,karakter:senaryo.karakter,sahne:senaryo.sahne}]);
    var{data:v}=await supabase.from("senaryo_versiyonlar").select("*").eq("senaryo_id",id).order("versiyon",{ascending:false});
    if(v)setVersiyonlar(v);
  }

  async function raporGonder(sebep){
    if(!user)return;
    await supabase.from("raporlar").insert([{rapor_eden:user.id,senaryo_id:parseInt(id),sebep}]);
    setRaporModal(false);
  }

  function paylas(platform){
    var url=typeof window!=="undefined"?window.location.href:"";
    var metin="🎬 "+senaryo?.baslik+" — Scriptify'da oku!";
    if(platform==="whatsapp")window.open("https://wa.me/?text="+encodeURIComponent(metin+" "+url));
    if(platform==="twitter")window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(metin)+"&url="+encodeURIComponent(url));
    if(platform==="kopyala"){
      navigator.clipboard?.writeText(url);
      setKopyalandi(true);
      setTimeout(()=>setKopyalandi(false),2000);
    }
    if(platform!=="kopyala")setPaylasModal(false);
  }

  if(!authHazir||!senaryo)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{width:32,height:32,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite",boxShadow:G.glowBlue}}/>
      <p style={{fontFamily:G.fontDisp,fontSize:14,color:G.textDim,letterSpacing:"0.1em"}}>YÜKLENİYOR</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:100}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes glowPulse{0%,100%{opacity:0.6}50%{opacity:1}}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:${G.blueD};border-radius:2px;}
        ::selection{background:rgba(56,189,248,0.2);color:${G.blueL};}
        textarea::placeholder,input::placeholder{color:${G.textDim};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${turRenk}25,transparent)`,pointerEvents:"none"}}/>
        <button onClick={()=>router.back()} style={{background:`${G.blue}08`,border:`1px solid ${G.border}`,borderRadius:10,padding:"7px",cursor:"pointer",display:"flex",flexShrink:0}}>
          <Icon id="arrow-left" size={18} color={G.blue}/>
        </button>
        <img src="/logo.png" alt="Scriptify" style={{height:40,objectFit:"contain",maxWidth:130}}/>
        <p style={{flex:1,fontFamily:G.fontDisp,fontSize:16,letterSpacing:"0.06em",color:G.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{senaryo.baslik}</p>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {benim&&(
            <button onClick={versiyonKaydet} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:10,background:`${G.purple}10`,border:`1px solid ${G.purple}25`,color:G.purple,fontSize:11,fontWeight:700}}>
              <Icon id="layers" size={11} color={G.purple}/>v{versiyonlar.length+1}
            </button>
          )}
          <div style={{position:"relative"}}>
            <button onClick={()=>setMenu(!menu)} style={{width:34,height:34,borderRadius:10,background:`${G.blue}08`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon id="more" size={16} color={G.textMuted}/>
            </button>
            {menu&&(
              <div style={{position:"absolute",right:0,top:42,background:G.surface,border:`1px solid ${G.borderHov}`,borderRadius:14,padding:"6px",minWidth:200,boxShadow:`${G.shadow},${G.glowBlue}`,zIndex:10,animation:"fadeUp 0.15s ease"}}>
                {versiyonlar.length>0&&<button onClick={()=>{setVersiyonModal(true);setMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:"none",border:"none",color:G.text,fontSize:13,textAlign:"left",borderRadius:10}}>
                  <Icon id="clock" size={13} color={G.purple}/>Versiyon Geçmişi ({versiyonlar.length})
                </button>}
                <button onClick={()=>{setPaylasModal(true);setMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:"none",border:"none",color:G.text,fontSize:13,textAlign:"left",borderRadius:10}}>
                  <Icon id="share" size={13} color={G.blue}/>Paylaş
                </button>
                {!benim&&<button onClick={()=>{setRaporModal(true);setMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:"none",border:"none",color:G.red,fontSize:13,textAlign:"left",borderRadius:10}}>
                  <Icon id="flag" size={13} color={G.red}/>Raporla
                </button>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"16px 16px 0"}}>

        {/* ── BAŞLIK KARTI ── */}
        <div style={{marginBottom:16,background:`linear-gradient(145deg,${G.deep},${G.card})`,border:`1px solid ${turRenk}30`,borderRadius:20,overflow:"hidden",position:"relative",boxShadow:`0 0 40px ${turRenk}10`}}>
          <NeonCorners color={turRenk} size={14}/>
          {/* Tür gradient üst bant */}
          <div style={{height:3,background:`linear-gradient(90deg,${turRenk},${turRenk}80,transparent)`,boxShadow:`0 0 20px ${turRenk}60`}}/>
          {/* Arkaplan ışıma */}
          <div style={{position:"absolute",top:0,right:0,width:200,height:200,background:`radial-gradient(circle,${turRenk}08,transparent 70%)`,pointerEvents:"none"}}/>

          <div style={{padding:"20px"}}>
            {/* Badge'ler */}
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              <span style={{fontSize:10,fontWeight:700,padding:"3px 12px",borderRadius:20,background:`${G.blue}15`,color:G.blue,border:`1px solid ${G.blue}25`,boxShadow:G.glowBlue}}>{senaryo.tip}</span>
              <span style={{fontSize:10,fontWeight:700,padding:"3px 12px",borderRadius:20,background:`${turRenk}15`,color:turRenk,border:`1px solid ${turRenk}25`,boxShadow:`0 0 10px ${turRenk}20`}}>{senaryo.tur}</span>
              {versiyonlar.length>0&&<span style={{fontSize:10,fontWeight:700,padding:"3px 12px",borderRadius:20,background:`${G.purple}10`,color:G.purple,border:`1px solid ${G.purple}20`}}>v{versiyonlar[0].versiyon}</span>}
            </div>

            <h1 style={{fontFamily:G.fontDisp,fontSize:30,letterSpacing:"0.05em",color:G.text,lineHeight:1.15,marginBottom:8}}>{senaryo.baslik}</h1>
            {senaryo.tagline&&(
              <p style={{fontSize:14,fontStyle:"italic",color:turRenk,marginBottom:16,borderLeft:`3px solid ${turRenk}`,paddingLeft:12,lineHeight:1.5,boxShadow:`-4px 0 16px ${turRenk}15`}}>
                "{senaryo.tagline}"
              </p>
            )}

            {/* Yazar satırı */}
            <a href={"/@"+senaryo.profiles?.username} style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,padding:"10px 12px",borderRadius:12,background:`${G.blue}06`,border:`1px solid ${G.border}`,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${G.blue}10`;e.currentTarget.style.borderColor=G.borderHov;}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${G.blue}06`;e.currentTarget.style.borderColor=G.border;}}>
              <Av url={senaryo.profiles?.avatar_url} size={38}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <p style={{fontSize:13,fontWeight:700,color:G.text}}>@{senaryo.profiles?.username}</p>
                  {senaryo.profiles?.dogrulandi&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:`${G.blue}15`,color:G.blue,fontWeight:800,boxShadow:`0 0 6px ${G.blue}25`}}>✓</span>}
                </div>
                <p style={{fontSize:10,color:G.textDim}}>{zaman(senaryo.created_at)} önce</p>
              </div>
              <Icon id="arrow-left" size={14} color={G.textDim} strokeWidth={1.5} style={{transform:"rotate(180deg)"}}/>
            </a>

            {/* İstatistik grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[
                {icon:"heart",val:senaryo.begeni_sayisi||0,label:"Beğeni",color:G.red},
                {icon:"eye",val:senaryo.goruntuleme_sayisi||0,label:"Görünüm",color:G.blue},
                {icon:"chat",val:yorumlar.length,label:"Yorum",color:G.purple},
                {icon:"target",val:senaryo.challenge_sayisi||0,label:"Challenge",color:G.amber},
              ].map(s=>(
                <div key={s.label} style={{background:G.surface,borderRadius:12,padding:"10px 6px",textAlign:"center",border:`1px solid ${G.border}`,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 100%,${s.color}08,transparent 70%)`,pointerEvents:"none"}}/>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:4}}>
                    <Icon id={s.icon} size={14} color={s.color}/>
                  </div>
                  <div style={{fontFamily:G.fontDisp,fontSize:16,color:s.color,textShadow:`0 0 10px ${s.color}40`}}>{s.val}</div>
                  <p style={{fontSize:8,color:G.textDim,letterSpacing:"0.06em",marginTop:2}}>{s.label.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── İÇERİK BÖLÜMLERİ ── */}
        <IcerikKart label="Ana Fikir" val={senaryo.ana_fikir} icon="zap" accent={G.blue}/>
        <IcerikKart label="Karakterler" val={senaryo.karakter} icon="users" accent={G.purple}/>
        <IcerikKart label="Açılış Sahnesi" val={senaryo.sahne} icon="film" accent={turRenk}/>
        <IcerikKart label="Büyük Soru" val={senaryo.soru} icon="target" accent={G.amber}/>

        {/* ── AKSİYON BUTONLARI ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,margin:"16px 0"}}>
          {/* Beğen */}
          <button onClick={begeniToggle}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"16px 0",borderRadius:16,border:`1.5px solid ${begendi?G.red+"60":G.border}`,background:begendi?`${G.red}10`:G.surface,transition:"all 0.25s",boxShadow:begendi?G.glowRed:"none"}}>
            <div style={{width:36,height:36,borderRadius:10,background:begendi?`${G.red}20`:G.surface,border:`1px solid ${begendi?G.red+"40":G.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s"}}>
              <Icon id={begendi?"heart-fill":"heart"} size={18} color={begendi?G.red:G.textMuted}/>
            </div>
            <div>
              <div style={{fontFamily:G.fontDisp,fontSize:16,color:begendi?G.red:G.textMuted,textAlign:"center"}}>{senaryo.begeni_sayisi||0}</div>
              <p style={{fontSize:9,color:begendi?G.red:G.textDim,letterSpacing:"0.06em",textAlign:"center"}}>{begendi?"BEĞENİLDİ":"BEĞEN"}</p>
            </div>
          </button>

          {/* Kaydet */}
          <button onClick={kaydetToggle}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"16px 0",borderRadius:16,border:`1.5px solid ${kaydetti?G.blue+"60":G.border}`,background:kaydetti?`${G.blue}10`:G.surface,transition:"all 0.25s",boxShadow:kaydetti?G.glowBlue:"none"}}>
            <div style={{width:36,height:36,borderRadius:10,background:kaydetti?`${G.blue}20`:G.surface,border:`1px solid ${kaydetti?G.blue+"40":G.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.25s"}}>
              <Icon id={kaydetti?"bookmark-fill":"bookmark"} size={18} color={kaydetti?G.blue:G.textMuted}/>
            </div>
            <p style={{fontSize:9,color:kaydetti?G.blue:G.textDim,letterSpacing:"0.06em",fontWeight:700}}>{kaydetti?"KAYDEDİLDİ":"KAYDET"}</p>
          </button>

          {/* Challenge */}
          <a href={"/uret?challenge="+id}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"16px 0",borderRadius:16,border:`1.5px solid ${G.border}`,background:G.surface,textDecoration:"none",transition:"all 0.25s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=G.purple+"60";e.currentTarget.style.background=`${G.purple}10`;e.currentTarget.style.boxShadow=G.glowPurple;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.background=G.surface;e.currentTarget.style.boxShadow="none";}}>
            <div style={{width:36,height:36,borderRadius:10,background:G.surface,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon id="target" size={18} color={G.textMuted}/>
            </div>
            <p style={{fontSize:9,color:G.textDim,letterSpacing:"0.06em",fontWeight:700}}>CHALLENGE</p>
          </a>
        </div>

        {/* ── YORUMLAR ── */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,paddingBottom:12,borderBottom:`1px solid ${G.border}`}}>
            <div style={{width:28,height:28,borderRadius:8,background:`${G.purple}15`,border:`1px solid ${G.purple}25`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon id="chat" size={13} color={G.purple}/>
            </div>
            <p style={{fontFamily:G.fontDisp,fontSize:14,letterSpacing:"0.1em",color:G.purple}}>YORUMLAR</p>
            <span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:`${G.purple}10`,color:G.purple,border:`1px solid ${G.purple}20`,fontWeight:700}}>{yorumlar.length}</span>
          </div>

          {yorumlar.length===0&&(
            <div style={{textAlign:"center",padding:"32px 0",color:G.textDim}}>
              <Icon id="chat" size={28} color={G.textDim}/>
              <p style={{fontSize:13,marginTop:8}}>İlk yorumu sen yaz</p>
            </div>
          )}

          {yorumlar.map((y,i)=>(
            <div key={y.id||i} style={{display:"flex",gap:10,marginBottom:12,animation:`fadeUp 0.2s ${i*0.03}s both ease`}}>
              <Av url={y.profiles?.avatar_url} size={34}/>
              <div style={{flex:1}}>
                <div style={{background:`linear-gradient(135deg,${G.surface},${G.card})`,border:`1px solid ${G.border}`,borderRadius:"4px 14px 14px 14px",padding:"10px 14px",position:"relative"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,fontWeight:700,color:G.blue}}>@{y.profiles?.username}</span>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:10,color:G.textDim}}>{zaman(y.created_at)}</span>
                      {user&&y.user_id===user.id&&(
                        <button onClick={()=>yorumSil(y.id)} style={{background:"none",border:"none",color:G.red,fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:6,cursor:"pointer"}}>sil</button>
                      )}
                    </div>
                  </div>
                  <p style={{fontSize:13,color:G.textMuted,lineHeight:1.6}}>{y.metin}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Yorum yaz */}
          {user?(
            <div style={{display:"flex",gap:10,marginTop:16,padding:"12px",background:G.surface,borderRadius:16,border:`1px solid ${G.border}`}}>
              <Av url={null} size={34}/>
              <div style={{flex:1,display:"flex",gap:8,alignItems:"center"}}>
                <input
                  value={yeniYorum}
                  onChange={e=>setYeniYorum(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&yorumGonderFn()}
                  placeholder="Yorum yaz..."
                  style={{flex:1,background:"transparent",border:"none",color:G.text,fontSize:13,outline:"none",fontFamily:G.fontBody}}
                />
                <button onClick={yorumGonderFn} disabled={!yeniYorum.trim()||yorumGonderiyor}
                  style={{width:34,height:34,borderRadius:"50%",background:yeniYorum.trim()?G.blueGrad:`${G.blue}08`,border:`1px solid ${yeniYorum.trim()?G.blue:G.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s",boxShadow:yeniYorum.trim()?G.glowBlue:"none"}}>
                  {yorumGonderiyor
                    ?<div style={{width:12,height:12,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
                    :<Icon id="send" size={13} color={yeniYorum.trim()?G.black:G.textDim} strokeWidth={2.5}/>
                  }
                </button>
              </div>
            </div>
          ):(
            <div style={{textAlign:"center",padding:"16px",background:G.surface,borderRadius:14,border:`1px solid ${G.border}`}}>
              <p style={{fontSize:13,color:G.textMuted}}>Yorum yazmak için <a href="/" style={{color:G.blue,fontWeight:700}}>giriş yap</a></p>
            </div>
          )}
        </div>
      </div>

      {/* ── PAYLAŞ MODAL ── */}
      {paylasModal&&<>
        <div onClick={()=>setPaylasModal(false)} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,5,20,0.9)",backdropFilter:"blur(10px)"}}/>
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:401,background:`linear-gradient(180deg,${G.surface},${G.deep})`,border:`1px solid ${G.borderHov}`,borderRadius:"24px 24px 0 0",padding:"20px 20px env(safe-area-inset-bottom,24px)",boxShadow:`0 -20px 60px rgba(0,0,0,0.8),${G.glowBlue}`}}>
          <div style={{width:36,height:3,borderRadius:2,background:G.border,margin:"0 auto 16px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <Icon id="share" size={14} color={G.blue}/>
            <p style={{fontFamily:G.fontDisp,fontSize:18,letterSpacing:"0.06em",color:G.text}}>PAYLAŞ</p>
          </div>
          {[
            {id:"whatsapp",label:"WhatsApp",col:"#25D366",icon:"share"},
            {id:"twitter",label:"Twitter / X",col:"#1DA1F2",icon:"share"},
            {id:"kopyala",label:kopyalandi?"✓ Kopyalandı!":"Linki Kopyala",col:kopyalandi?G.green:G.blue,icon:kopyalandi?"check":"copy"},
          ].map(pl=>(
            <button key={pl.id} onClick={()=>paylas(pl.id)}
              style={{display:"flex",alignItems:"center",gap:14,width:"100%",padding:"14px 16px",marginBottom:8,borderRadius:14,background:`${pl.col}08`,border:`1px solid ${pl.col}${kopyalandi&&pl.id==="kopyala"?"60":"20"}`,color:G.text,fontSize:13,textAlign:"left",boxShadow:kopyalandi&&pl.id==="kopyala"?G.glowGreen:"none",transition:"all 0.2s"}}>
              <div style={{width:38,height:38,borderRadius:11,background:`${pl.col}15`,border:`1px solid ${pl.col}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon id={pl.icon} size={16} color={pl.col}/>
              </div>
              <span style={{fontWeight:600,color:kopyalandi&&pl.id==="kopyala"?G.green:G.text}}>{pl.label}</span>
            </button>
          ))}
        </div>
      </>}

      {/* ── VERSİYON GEÇMİŞİ ── */}
      {versiyonModal&&<>
        <div onClick={()=>setVersiyonModal(false)} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,5,20,0.9)",backdropFilter:"blur(10px)"}}/>
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:401,background:`linear-gradient(180deg,${G.surface},${G.deep})`,border:`1px solid ${G.borderHov}`,borderRadius:"24px 24px 0 0",padding:"20px 20px env(safe-area-inset-bottom,24px)",maxHeight:"70vh",overflowY:"auto",boxShadow:`0 -20px 60px rgba(0,0,0,0.8),${G.glowPurple}`}}>
          <div style={{width:36,height:3,borderRadius:2,background:G.border,margin:"0 auto 16px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <Icon id="layers" size={14} color={G.purple}/>
            <p style={{fontFamily:G.fontDisp,fontSize:18,letterSpacing:"0.06em",color:G.text}}>VERSİYON GEÇMİŞİ</p>
          </div>
          {versiyonlar.map((v,i)=>(
            <div key={v.id} style={{background:`linear-gradient(135deg,${G.surface},${G.card})`,border:`1px solid ${G.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10,position:"relative",animation:`fadeUp 0.2s ${i*0.05}s both ease`}}>
              <NeonCorners color={G.purple} size={8}/>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontFamily:G.fontDisp,fontSize:18,color:G.purple,letterSpacing:"0.05em",textShadow:G.glowPurple}}>v{v.versiyon}</span>
                <span style={{fontSize:10,color:G.textDim}}>{zaman(v.created_at)}</span>
              </div>
              <p style={{fontSize:13,fontWeight:700,color:G.text,marginBottom:4}}>{v.baslik}</p>
              {v.ana_fikir&&<p style={{fontSize:11,color:G.textMuted,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{v.ana_fikir}</p>}
            </div>
          ))}
        </div>
      </>}

      {/* ── RAPOR MODAL ── */}
      {raporModal&&<>
        <div onClick={()=>setRaporModal(false)} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,5,20,0.9)",backdropFilter:"blur(10px)"}}/>
        <div style={{position:"fixed",inset:"auto 16px 20px",zIndex:401,background:G.surface,border:`1px solid ${G.red}30`,borderRadius:20,padding:"20px",boxShadow:`${G.shadow},${G.glowRed}`,animation:"fadeUp 0.2s ease"}}>
          <NeonCorners color={G.red}/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <Icon id="flag" size={14} color={G.red}/>
            <p style={{fontFamily:G.fontDisp,fontSize:16,letterSpacing:"0.05em",color:G.text}}>RAPORLA</p>
          </div>
          {["Uygunsuz içerik","Spam","Yanlış bilgi","Nefret söylemi","Diğer"].map(s=>(
            <button key={s} onClick={()=>raporGonder(s)}
              style={{display:"block",width:"100%",padding:"12px 16px",marginBottom:8,borderRadius:12,border:`1px solid ${G.border}`,background:G.card,color:G.textMuted,fontSize:13,textAlign:"left",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=G.red+"40";e.currentTarget.style.color=G.red;e.currentTarget.style.background=`${G.red}08`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.color=G.textMuted;e.currentTarget.style.background=G.card;}}>{s}</button>
          ))}
        </div>
      </>}

      <AltNav/>
      {drawer&&<SimpleDrawer user={user} username={profil?.username||(user?.email?.split("@")[0]||"")} avatarUrl={profil?.avatar_url||null} onClose={()=>setDrawer(false)}/>}
    </div>
  );
}
