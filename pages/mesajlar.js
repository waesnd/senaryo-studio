import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
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

function Icon({id,size=22,color="currentColor",strokeWidth=1.8}){
  var p={width:size,height:size,fill:"none",stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="arrow-left")return<svg {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
  if(id==="pencil")return<svg {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
  if(id==="pin")return<svg {...p}><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 00-1.11 1.79l-1.78.9A2 2 0 005 15.24V17z"/></svg>;
  if(id==="image")return<svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
  if(id==="mic")return<svg {...p}><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"/></svg>;
  if(id==="send")return<svg {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
  if(id==="x")return<svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  if(id==="search")return<svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
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

function Av({url,size,online=false}){
  return(
    <div style={{position:"relative",flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${G.deep},${G.surface})`,border:`1.5px solid rgba(56,189,248,0.2)`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.4} color="rgba(56,189,248,0.35)"/>}
      </div>
      {online&&<div style={{position:"absolute",bottom:1,right:1,width:size/4,height:size/4,borderRadius:"50%",background:G.green,border:`2px solid ${G.black}`,boxShadow:`0 0 6px ${G.green}`}}/>}
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

function AltNav(){
  var items=[{href:"/",id:"home"},{href:"/kesfet",id:"compass"},{href:"/topluluk",id:"users"},{href:"/mesajlar",id:"chat"},{href:"/profil",id:"user"}];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:90,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"8px 0 env(safe-area-inset-bottom,10px)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}30,transparent)`}}/>
      {items.map(item=>{
        var active=item.href==="/mesajlar";
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

function zaman(ts){
  var d=Math.floor((Date.now()-new Date(ts))/1000);
  if(d<60)return"az önce";
  if(d<3600)return Math.floor(d/60)+"dk";
  if(d<86400)return Math.floor(d/3600)+"sa";
  return Math.floor(d/86400)+"g";
}

export default function Mesajlar(){
  var router = useRouter();
  var {user, profil, authHazir, okunmayanBildirim=0} = useAuth();
  var [konusmalar,setKonusmalar]=useState([]);
  var [aktif,setAktif]=useState(null);
  var [mesajlar,setMesajlar]=useState([]);
  var [yeniMesaj,setYeniMesaj]=useState("");
  var [yeniSohbet,setYeniSohbet]=useState(false);
  var [aramaKullanici,setAramaKullanici]=useState("");
  var [kullaniciSonuc,setKullaniciSonuc]=useState([]);
  var [gorselYukleniyor,setGorselYukleniyor]=useState(false);
  var [sesKayd,setSesKayd]=useState(false);
  var [mediaRec,setMediaRec]=useState(null);
  var [notAcik,setNotAcik]=useState(false);
  var [notMetin,setNotMetin]=useState("");
  var [notKaydedildi,setNotKaydedildi]=useState(false);
  var [drawer,setDrawer]=useState(false);
  var mesajSonuRef=useRef(null);
  var dosyaRef=useRef(null);

  var avatarUrl=profil?.avatar_url||null;
  var username=profil?.username||user?.email?.split("@")[0]||"";

  useEffect(()=>{
    if(!authHazir || !user) return;
    yukle(user);
  },[authHazir, user]);

  // ?dm=username ile gelinince o kullanıcıyla sohbet aç
  useEffect(()=>{
    if(!authHazir || !user || !router.isReady) return;
    var dm = router.query.dm;
    if(!dm) return;
    // yukle tamamlanmasını bekle
    setTimeout(()=>{
      supabase.from("profiles").select("id,username,avatar_url").eq("username",dm).single()
        .then(({data})=>{
          if(data) sohbetAc({id:data.id, diger:data});
        });
    }, 500);
  },[authHazir, user, router.isReady, router.query.dm]);

  useEffect(()=>{
    if(mesajSonuRef.current)mesajSonuRef.current.scrollIntoView({behavior:"smooth"});
  },[mesajlar]);

  useEffect(()=>{
    if(!aktif||!user)return;
    var kanal=supabase.channel("mesajlar_"+aktif.id)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"mesajlar",filter:"alan.eq."+user.id},(payload)=>{
        var m=payload.new;
        // Sadece bu sohbete ait mesajları ekle
        if(m.gonderen===aktif.id||m.alan===aktif.id){
          setMesajlar(p=>[...p,m]);
          supabase.from("mesajlar").update({okundu:true}).eq("id",m.id);
        }
      }).subscribe();
    return()=>supabase.removeChannel(kanal);
  },[aktif,user]);

  function yukle(u){
    supabase.from("profiles").select("*").eq("id",u.id).single().then(({data})=>{if(data)setProfil(data);});
    supabase.from("mesajlar")
      .select("*, gonderen_profil:profiles!gonderen(id,username,avatar_url), alici_profil:profiles!alan(id,username,avatar_url)")
      .or("gonderen.eq."+u.id+",alan.eq."+u.id)
      .order("created_at",{ascending:false})
      .then(({data, error})=>{
        if(error){ console.error("[mesajlar] yukle hatası:", error.message); return; }
        if(!data||data.length===0){ setKonusmalar([]); return; }
        var grup={};
        data.forEach(m=>{
          var digerId=m.gonderen===u.id?m.alan:m.gonderen;
          var diger=m.gonderen===u.id?m.alici_profil:m.gonderen_profil;
          if(!grup[digerId])grup[digerId]={id:digerId,diger,mesajlar:[],okunmayan:0};
          grup[digerId].mesajlar.push(m);
          if(!m.okundu&&m.alan===u.id)grup[digerId].okunmayan++;
        });
        setKonusmalar(Object.values(grup));
      });
  }

  async function sohbetAc(k){
    setAktif(k);setYeniSohbet(false);
    try{var kayitliNot=localStorage.getItem("sf_not_"+k.id);setNotMetin(kayitliNot||"");}catch(e){setNotMetin("");}
    setNotAcik(false);
    // İki kullanıcı arasındaki mesajları çek
    var{data,error}=await supabase.from("mesajlar").select("*")
      .or("and(gonderen.eq."+user.id+",alan.eq."+k.id+"),and(gonderen.eq."+k.id+",alan.eq."+user.id+")")
      .order("created_at",{ascending:true});
    if(error) console.error("[sohbetAc]", error.message);
    if(data) setMesajlar(data);
    await supabase.from("mesajlar").update({okundu:true}).eq("alan",user.id).eq("gonderen",k.id);
    setKonusmalar(p=>p.map(kn=>kn.id===k.id?{...kn,okunmayan:0}:kn));
  }

  async function mesajGonder(medyaUrl,medyaTip,sesUrl){
    if(!user||!aktif)return;
    if(!yeniMesaj.trim()&&!medyaUrl&&!sesUrl)return;
    var icerik=yeniMesaj.trim();
    if(!icerik&&!medyaUrl&&!sesUrl)return;
    var yeni={gonderen:user.id,alan:aktif.id,icerik:icerik||null,medya_url:medyaUrl||null,ses_url:sesUrl||null,okundu:false};
    var{data}=await supabase.from("mesajlar").insert([yeni]).select().single();
    if(data)setMesajlar(p=>[...p,data]);
    setYeniMesaj("");
    setKonusmalar(p=>{var v=p.find(k=>k.id===aktif.id);if(v)return[{...v,mesajlar:[...v.mesajlar,data]},...p.filter(k=>k.id!==aktif.id)];return p;});
  }

  async function gorselGonder(e){
    var file=e.target.files[0];if(!file)return;
    setGorselYukleniyor(true);
    try{
      var fd=new FormData();fd.append("file",file);fd.append("upload_preset","scriptify_posts");
      var res=await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload",{method:"POST",body:fd});
      var data=await res.json();
      if(data.secure_url)await mesajGonder(data.secure_url,"gorsel",null);
    }catch(e){}
    setGorselYukleniyor(false);
  }

  async function sesBaslat(){
    try{
      var stream=await navigator.mediaDevices.getUserMedia({audio:true});
      var rec=new MediaRecorder(stream);var chunks=[];
      rec.ondataavailable=e=>chunks.push(e.data);
      rec.onstop=async()=>{
        var blob=new Blob(chunks,{type:"audio/webm"});
        var fd=new FormData();fd.append("file",blob,"ses.webm");fd.append("upload_preset","scriptify_posts");
        var res=await fetch("https://api.cloudinary.com/v1_1/duuebxmro/video/upload",{method:"POST",body:fd});
        var data=await res.json();
        if(data.secure_url)await mesajGonder(null,null,data.secure_url);
        stream.getTracks().forEach(t=>t.stop());
      };
      rec.start();setMediaRec(rec);setSesKayd(true);
    }catch(e){alert("Mikrofon izni gerekli");}
  }

  function sesDur(){if(mediaRec){mediaRec.stop();setMediaRec(null);setSesKayd(false);}}

  async function kullaniciAra(q){
    setAramaKullanici(q);
    if(!q.trim()){setKullaniciSonuc([]);return;}
    var{data}=await supabase.from("profiles").select("id,username,avatar_url").ilike("username","%"+q+"%").neq("id",user.id).limit(8);
    if(data)setKullaniciSonuc(data);
  }

  if(!authHazir)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite",boxShadow:G.glowBlue}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(!user)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:G.fontBody}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontFamily:G.fontDisp,fontSize:48,color:G.textDim,letterSpacing:"0.1em"}}>MESAJLAR</div>
      <p style={{color:G.textMuted,fontSize:14}}>Mesajlaşmak için giriş yap</p>
      <a href="/" style={{padding:"12px 28px",borderRadius:14,background:G.blueGrad,color:G.black,fontWeight:800,fontSize:13,textDecoration:"none",letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:G.glowBlue}}>Giriş Yap</a>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:${G.blueD};border-radius:2px;}
        ::selection{background:rgba(56,189,248,0.2);color:${G.blueL};}
        input::placeholder{color:${G.textDim};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}18,transparent)`,pointerEvents:"none"}}/>
        {aktif?(
          <>
            <button onClick={()=>{setAktif(null);setMesajlar([]);}} style={{background:"none",border:"none",padding:4,cursor:"pointer",display:"flex"}}>
              <Icon id="arrow-left" size={20} color={G.blue}/>
            </button>
            <Av url={aktif.diger?.avatar_url} size={36} online={true}/>
            <div style={{flex:1}}>
              <p style={{fontSize:14,fontWeight:800,color:G.text}}>@{aktif.diger?.username}</p>
              <p style={{fontSize:11,color:G.green,fontWeight:600}}>● çevrimiçi</p>
            </div>
            <button onClick={()=>setNotAcik(p=>!p)} style={{width:34,height:34,borderRadius:10,background:notMetin?`${G.blue}12`:`${G.blue}05`,border:`1px solid ${notMetin?G.blue+"40":G.border}`,color:notMetin?G.blue:G.textMuted,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:notMetin?G.glowBlue:"none"}}>
              <Icon id="pin" size={14} color={notMetin?G.blue:G.textMuted}/>
            </button>
          </>
        ):(
          <>
            <button onClick={()=>setDrawer(true)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",padding:0,cursor:"pointer"}}>
              <Av url={avatarUrl} size={34}/>
              <img src="/logo.png" alt="Scriptify" style={{height:44,objectFit:"contain",maxWidth:150}}/>
            </button>
            <div style={{flex:1}}>
              <span style={{fontFamily:G.fontDisp,fontSize:20,letterSpacing:"0.1em",color:G.text}}>MESAJLAR</span>
              {konusmalar.reduce((a,k)=>a+k.okunmayan,0)>0&&<span style={{marginLeft:8,fontSize:11,color:G.red,fontWeight:700}}>{konusmalar.reduce((a,k)=>a+k.okunmayan,0)} okunmamış</span>}
            </div>
            <button onClick={()=>setYeniSohbet(true)} style={{width:34,height:34,borderRadius:10,background:G.blueGrad,border:"none",color:G.black,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:G.glowBlue}}>
              <Icon id="pencil" size={14} color={G.black} strokeWidth={2.5}/>
            </button>
          </>
        )}
      </div>

      {/* YENİ SOHBET MODAL */}
      {yeniSohbet&&(
        <>
          <div onClick={()=>{setYeniSohbet(false);setAramaKullanici("");setKullaniciSonuc([]);}} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,5,20,0.9)",backdropFilter:"blur(8px)"}}/>
          <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:201,background:`linear-gradient(180deg,${G.surface},${G.deep})`,borderTop:`1px solid ${G.borderHov}`,borderRadius:"24px 24px 0 0",padding:"20px 20px env(safe-area-inset-bottom,20px)",maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:`0 -20px 60px rgba(0,0,0,0.8),${G.glowBlue}`}}>
            <div style={{width:36,height:3,borderRadius:2,background:G.border,margin:"0 auto 16px",flexShrink:0}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexShrink:0}}>
              <span style={{fontFamily:G.fontDisp,fontSize:18,letterSpacing:"0.08em",color:G.text}}>YENİ MESAJ</span>
              <button onClick={()=>{setYeniSohbet(false);setAramaKullanici("");setKullaniciSonuc([]);}} style={{background:`${G.blue}08`,border:`1px solid ${G.border}`,borderRadius:8,padding:"5px 10px",color:G.textMuted,cursor:"pointer"}}>ESC</button>
            </div>
            <div style={{position:"relative",marginBottom:14,flexShrink:0}}>
              <div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}><Icon id="search" size={14} color={G.textDim}/></div>
              <input value={aramaKullanici} onChange={e=>kullaniciAra(e.target.value)} placeholder="Kullanıcı ara..." autoFocus
                style={{width:"100%",background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"9px 12px 9px 34px",color:G.text,fontSize:13,outline:"none",fontFamily:G.fontBody}}
                onFocus={e=>e.target.style.borderColor=G.blueD} onBlur={e=>e.target.style.borderColor=G.border}/>
            </div>
            <div style={{overflowY:"auto",flex:1}}>
              {kullaniciSonuc.length===0&&aramaKullanici&&<p style={{textAlign:"center",color:G.textMuted,padding:"20px",fontSize:13}}>Kullanıcı bulunamadı</p>}
              {kullaniciSonuc.map(u=>(
                <button key={u.id} onClick={()=>{sohbetAc({id:u.id,diger:u});setYeniSohbet(false);setAramaKullanici("");setKullaniciSonuc([]);}}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px",borderRadius:14,background:"none",border:"1px solid transparent",cursor:"pointer",textAlign:"left",marginBottom:4,transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.background=`${G.blue}06`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="transparent";e.currentTarget.style.background="none";}}>
                  <Av url={u.avatar_url} size={44}/>
                  <p style={{fontSize:14,fontWeight:700,color:G.text}}>@{u.username}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* KONUŞMALAR LİSTESİ */}
      {!aktif&&(
        <div style={{flex:1,maxWidth:680,width:"100%",margin:"0 auto",paddingBottom:90}}>
          {konusmalar.length===0?(
            <div style={{textAlign:"center",padding:"80px 20px"}}>
              <div style={{width:64,height:64,borderRadius:"50%",background:`${G.blue}10`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:G.glowBlue}}>
                <Icon id="chat" size={28} color={G.blue}/>
              </div>
              <div style={{fontFamily:G.fontDisp,fontSize:40,color:G.textDim,letterSpacing:"0.1em",marginBottom:10}}>MESAJ YOK</div>
              <p style={{fontSize:14,color:G.textMuted,marginBottom:24}}>İlk mesajı sen gönder.</p>
              <button onClick={()=>setYeniSohbet(true)} style={{padding:"12px 28px",borderRadius:14,background:G.blueGrad,border:"none",color:G.black,fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:G.glowBlue}}>
                ✉️ Yeni Mesaj Başlat
              </button>
            </div>
          ):konusmalar.map((k,i)=>{
            var sonMesaj=k.mesajlar[k.mesajlar.length-1];
            return(
              <button key={k.id} onClick={()=>sohbetAc(k)}
                style={{width:"100%",display:"flex",alignItems:"center",gap:13,padding:"14px 20px",borderBottom:`1px solid ${G.border}`,background:k.okunmayan>0?`${G.blue}06`:"transparent",border:"none",cursor:"pointer",textAlign:"left",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${G.blue}08`}
                onMouseLeave={e=>e.currentTarget.style.background=k.okunmayan>0?`${G.blue}06`:"transparent"}>
                <Av url={k.diger?.avatar_url} size={50} online={i<2}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <p style={{fontSize:14,fontWeight:k.okunmayan>0?800:600,color:G.text}}>@{k.diger?.username}</p>
                    <p style={{fontSize:10,color:G.textDim}}>{sonMesaj?zaman(sonMesaj.created_at):""}</p>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <p style={{fontSize:12,color:k.okunmayan>0?G.textMuted:G.textDim,fontWeight:k.okunmayan>0?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80%"}}>
                      {sonMesaj?.ses_url?"🎤 Sesli mesaj":sonMesaj?.medya_url?"🖼️ Görsel":sonMesaj?.metin||""}
                    </p>
                    {k.okunmayan>0&&<span style={{minWidth:20,height:20,borderRadius:10,background:G.red,color:"#fff",fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px",flexShrink:0,boxShadow:`0 0 8px ${G.red}60`}}>{k.okunmayan}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* SOHBET EKRANI */}
      {aktif&&(
        <div style={{flex:1,display:"flex",flexDirection:"column",maxWidth:680,width:"100%",margin:"0 auto"}}>

          {/* SABİT NOT */}
          {notAcik&&(
            <div style={{background:`${G.blue}06`,borderBottom:`1px solid ${G.blue}20`,padding:"12px 16px",flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <p style={{fontSize:11,fontWeight:800,color:G.blue,textTransform:"uppercase",letterSpacing:"0.08em"}}>📌 Özel Not — sadece sen görürsün</p>
                <button onClick={()=>setNotAcik(false)} style={{background:"none",border:"none",cursor:"pointer",display:"flex"}}><Icon id="x" size={14} color={G.textMuted}/></button>
              </div>
              <textarea value={notMetin} onChange={e=>setNotMetin(e.target.value)} placeholder="Bu sohbet hakkında not al..." rows={3}
                style={{width:"100%",background:"transparent",border:"none",color:G.text,fontSize:13,outline:"none",resize:"none",fontFamily:G.fontBody,lineHeight:1.6,marginBottom:8}}/>
              <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
                <button onClick={()=>{try{localStorage.removeItem("sf_not_"+aktif.id);}catch(e){}setNotMetin("");setNotKaydedildi(false);}} style={{padding:"5px 12px",borderRadius:8,background:"none",border:`1px solid ${G.blue}30`,color:G.blue,fontSize:11,cursor:"pointer"}}>Temizle</button>
                <button onClick={()=>{try{localStorage.setItem("sf_not_"+aktif.id,notMetin);}catch(e){}setNotKaydedildi(true);setTimeout(()=>setNotKaydedildi(false),1500);setNotAcik(false);}} style={{padding:"5px 14px",borderRadius:8,background:G.blueGrad,border:"none",color:G.black,fontSize:11,fontWeight:800,cursor:"pointer",boxShadow:G.glowBlue}}>
                  {notKaydedildi?"✓ Kaydedildi":"Kaydet"}
                </button>
              </div>
            </div>
          )}
          {!notAcik&&notMetin&&(
            <div onClick={()=>setNotAcik(true)} style={{background:`${G.blue}04`,borderBottom:`1px solid ${G.blue}15`,padding:"8px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              <Icon id="pin" size={11} color={G.blue}/><p style={{fontSize:12,color:G.blue,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{notMetin}</p>
              <span style={{fontSize:10,color:G.textDim}}>düzenle</span>
            </div>
          )}

          {/* MESAJLAR */}
          <div style={{flex:1,overflowY:"auto",padding:"16px 16px 100px"}}>
            {mesajlar.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:G.textMuted,fontSize:13}}>Konuşmayı sen başlat 👋</div>}
            {mesajlar.map((m,i)=>{
              var benim=m.gonderen_profil===user.id;
              var oncekiBenim=i>0&&mesajlar[i-1].gonderen===m.gonderen_profil;
              return(
                <div key={m.id||i} style={{display:"flex",flexDirection:benim?"row-reverse":"row",gap:8,marginBottom:oncekiBenim?4:12,animation:"fadeUp 0.2s ease"}}>
                  {!benim&&!oncekiBenim&&<Av url={aktif.diger?.avatar_url} size={28}/>}
                  {!benim&&oncekiBenim&&<div style={{width:28}}/>}
                  <div style={{maxWidth:"72%"}}>
                    {m.ses_url?(
                      <div style={{background:benim?G.blueGrad:`${G.surface}`,border:`1px solid ${benim?G.blue+"40":G.border}`,borderRadius:benim?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",boxShadow:benim?G.glowBlue:"none"}}>
                        <audio controls src={m.ses_url} style={{height:32,maxWidth:200}}/>
                      </div>
                    ):m.medya_url?(
                      <img src={m.medya_url} style={{maxWidth:220,borderRadius:14,display:"block",border:`1px solid ${G.border}`}} alt=""/>
                    ):(
                      <div style={{background:benim?G.blueGrad:`rgba(241,245,249,0.06)`,border:`1px solid ${benim?G.blue+"30":G.border}`,borderRadius:benim?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 14px",boxShadow:benim?G.glowBlue:"none"}}>
                        <p style={{fontSize:14,color:benim?G.black:G.text,lineHeight:1.5}}>{m.icerik}</p>
                      </div>
                    )}
                    <div style={{display:"flex",justifyContent:benim?"flex-end":"flex-start",gap:4,marginTop:3}}>
                      <p style={{fontSize:10,color:G.textDim}}>{zaman(m.created_at)}</p>
                      {benim&&<p style={{fontSize:10,color:m.okundu?G.blue:G.textDim}}>{m.okundu?"✓✓":"✓"}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={mesajSonuRef}/>
          </div>

          {/* MESAJ YAZMA */}
          <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"10px 12px env(safe-area-inset-bottom,10px)"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}18,transparent)`,pointerEvents:"none"}}/>
            <div style={{display:"flex",gap:8,alignItems:"center",maxWidth:680,margin:"0 auto"}}>
              <button onClick={()=>dosyaRef.current?.click()} style={{width:36,height:36,borderRadius:"50%",background:G.surface,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                {gorselYukleniyor?<div style={{width:12,height:12,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>:<Icon id="image" size={15} color={G.textMuted}/>}
              </button>
              <input ref={dosyaRef} type="file" accept="image/*" onChange={gorselGonder} style={{display:"none"}}/>
              <input value={yeniMesaj} onChange={e=>setYeniMesaj(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();mesajGonder();}}}
                placeholder="Mesaj yaz..."
                style={{flex:1,background:G.surface,border:`1px solid ${G.border}`,borderRadius:22,padding:"10px 16px",color:G.text,fontSize:13,outline:"none",fontFamily:G.fontBody}}
                onFocus={e=>e.target.style.borderColor=G.blueD} onBlur={e=>e.target.style.borderColor=G.border}/>
              {yeniMesaj.trim()?(
                <button onClick={()=>mesajGonder()} style={{width:36,height:36,borderRadius:"50%",background:G.blueGrad,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,boxShadow:G.glowBlue}}>
                  <Icon id="send" size={14} color={G.black} strokeWidth={2.5}/>
                </button>
              ):(
                <button onClick={sesKayd?sesDur:sesBaslat} style={{width:36,height:36,borderRadius:"50%",background:sesKayd?`linear-gradient(135deg,${G.red},${G.redL})`:G.surface,border:`1px solid ${sesKayd?G.red:G.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,animation:sesKayd?"pulse 1s infinite":"none",boxShadow:sesKayd?`0 0 12px ${G.red}60`:"none"}}>
                  <Icon id={sesKayd?"x":"mic"} size={15} color={sesKayd?"#fff":G.textMuted}/>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!aktif&&<AltNav/>}
      {drawer&&<Drawer user={user} username={username} avatarUrl={avatarUrl} onClose={()=>setDrawer(false)}/>}
    </div>
  );
}
