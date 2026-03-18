import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

var G = {
  black:"#0A0F1E", deep:"#0F172A", surface:"#1E293B", card:"#162032",
  border:"rgba(56,189,248,0.12)", borderHov:"rgba(56,189,248,0.4)",
  blue:"#38BDF8", blueL:"#7DD3FC", blueD:"#0EA5E9",
  blueGrad:"linear-gradient(135deg,#0EA5E9 0%,#38BDF8 40%,#7DD3FC 70%,#0EA5E9 100%)",
  purple:"#8B5CF6", purpleL:"#A78BFA",
  red:"#EF4444", redL:"#F87171",
  green:"#22C55E",
  amber:"#F59E0B",
  teal:"#2DD4BF",
  text:"#F1F5F9", textMuted:"rgba(241,245,249,0.5)", textDim:"rgba(241,245,249,0.25)",
  shadow:"0 8px 40px rgba(0,0,0,0.7)",
  glowBlue:"0 0 24px rgba(56,189,248,0.25)",
  glowPurple:"0 0 24px rgba(139,92,246,0.25)",
  glowRed:"0 0 16px rgba(239,68,68,0.3)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

var BILDIRIM={
  begeni:    {ikon:"❤️", metin:"gönderini beğendi",          renk:G.red},
  yorum:     {ikon:"💬", metin:"yorum yaptı",                renk:G.teal},
  takip:     {ikon:"👤", metin:"seni takip etmeye başladı",  renk:G.purple},
  challenge: {ikon:"🎯", metin:"senaryona challenge yaptı",  renk:G.amber},
  paylasim:  {ikon:"🔗", metin:"senaryonu paylaştı",         renk:G.blue},
  default:   {ikon:"🔔", metin:"bildirim gönderdi",          renk:G.blue},
};

function Icon({id,size=22,color="currentColor",strokeWidth=1.8}){
  var p={width:size,height:size,fill:"none",stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="bell")return<svg {...p}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
  if(id==="trash")return<svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
  if(id==="arrow-left")return<svg {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
  if(id==="logout")return<svg {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
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
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${G.border}`}}>
          {user&&<button onClick={async()=>{try{await supabase.auth.signOut();}catch(e){console.error("[bildirimler] çıkış hatası:", e?.message||e);}finally{onClose();window.location.replace("/");}}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",borderRadius:10,color:G.red,background:`${G.red}08`,border:"none",width:"100%",textAlign:"left",fontSize:13,fontWeight:700,cursor:"pointer"}}><Icon id="logout" size={16} color={G.red}/><span>Çıkış Yap</span></button>}
        </div>
      </nav>
    </div>
  </>);
}

function AltNav(){
  var items=[{href:"/",id:"home"},{href:"/kesfet",id:"compass"},{href:"/topluluk",id:"users"},{href:"/mesajlar",id:"chat"},{href:"/profil",id:"user"}];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"8px 0 env(safe-area-inset-bottom,10px)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}30,transparent)`,pointerEvents:"none"}}/>
      {items.map(item=>{
        var active=item.href==="/bildirimler" ? false : item.href==="/mesajlar" ? false : false;
        return(
          <a key={item.href} href={item.href} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px",borderRadius:12,opacity:0.35}}>
            <Icon id={item.id} size={22} color="#94A3B8"/>
          </a>
        );
      })}
    </div>
  );
}

function zaman(ts){
  var d=Math.floor((Date.now()-new Date(ts))/1000);
  if(d<60)return"az önce";
  if(d<3600)return Math.floor(d/60)+"dk önce";
  if(d<86400)return Math.floor(d/3600)+"sa önce";
  if(d<604800)return Math.floor(d/86400)+"g önce";
  return new Date(ts).toLocaleDateString("tr-TR");
}

export default function Bildirimler(){
  var [drawer,setDrawer]=useState(false);
  var {user, profil, authHazir} = useAuth();
  var [bildirimler,setBildirimler]=useState([]);
  var [tab,setTab]=useState("hepsi");
  var [silOnay,setSilOnay]=useState(false);
  var [yukleniyor,setYukleniyor]=useState(true);
  var [hata,setHata]=useState("");
  var temizlemeRef=useRef(null);

  useEffect(()=>{
    if(!authHazir){
      setYukleniyor(true);
      return;
    }
    if(!user){
      setYukleniyor(false);
      return;
    }

    var aktif = true;
    var kanal = null;

    async function init(){
      setYukleniyor(true);
      setHata("");
      try{
        kanal = await yukle(user, aktif);
      }catch(err){
        console.error("[bildirimler] init hatası:", err);
        if(aktif) setHata("Bildirimler yüklenemedi.");
      }finally{
        if(aktif) setYukleniyor(false);
      }
    }

    init();

    return ()=>{
      aktif = false;
      if(temizlemeRef.current){
        clearTimeout(temizlemeRef.current);
        temizlemeRef.current = null;
      }
      if(kanal) supabase.removeChannel(kanal);
    };
  },[authHazir, user]);

  async function yukle(u, aktif){
    var {data, error} = await supabase.from("bildirimler")
      .select("*, gonderen:profiles!gonderen_id(username,avatar_url,dogrulandi)")
      .eq("alici_id",u.id)
      .order("created_at",{ascending:false})
      .limit(80);

    if(error){
      throw new Error(error.message);
    }

    if(aktif && data) setBildirimler(data);

    var yeniKanal = supabase.channel("bildirimleri_"+u.id)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"bildirimler",filter:"alici_id=eq."+u.id},
        async payload=>{
          try{
            var {data:gnd} = await supabase.from("profiles")
              .select("username,avatar_url,dogrulandi")
              .eq("id", payload.new.gonderen_id)
              .single();
            var yeni = {...payload.new, gonderen: gnd||null};
            setBildirimler(prev=>[yeni,...prev]);
          }catch(err){
            console.error("[bildirimler] realtime profil hatası:", err);
            setBildirimler(prev=>[payload.new,...prev]);
          }
        })
      .subscribe();

    temizlemeRef.current = setTimeout(async ()=>{
      try{
        await supabase.from("bildirimler")
          .update({okundu:true})
          .eq("alici_id",u.id)
          .eq("okundu",false);
        if(aktif){
          setBildirimler(prev=>prev.map(b=>({...b,okundu:true})));
        }
      }catch(err){
        console.error("[bildirimler] okundu güncelleme hatası:", err);
      }
    }, 1500);

    return yeniKanal;
  }

  async function tumunuSil(){
    if(!user) return;
    try{
      var { error } = await supabase.from("bildirimler").delete().eq("alici_id",user.id);
      if(error) throw new Error(error.message);
      setBildirimler([]);
      setSilOnay(false);
    }catch(err){
      console.error("[bildirimler] tumunuSil:", err);
      alert("Bildirimler silinemedi.");
    }
  }

  var okunmayanSayi=bildirimler.filter(b=>!b.okundu).length;
  var goruntu=tab==="hepsi"?bildirimler:bildirimler.filter(b=>!b.okundu);

  if(!authHazir || yukleniyor)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite",boxShadow:G.glowBlue}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(!user)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:G.fontBody}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontFamily:G.fontDisp,fontSize:48,color:G.textDim,letterSpacing:"0.1em"}}>BİLDİRİMLER</div>
      <p style={{color:G.textMuted,fontSize:14}}>Bildirimleri görmek için giriş yap</p>
      <a href="/" style={{padding:"12px 28px",borderRadius:14,background:G.blueGrad,color:G.black,fontWeight:800,fontSize:13,textDecoration:"none",letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:G.glowBlue}}>Giriş Yap</a>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:90}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:${G.blueD};border-radius:2px;}
        ::selection{background:rgba(56,189,248,0.2);color:${G.blueL};}
      `}</style>

      <div style={{position:"sticky",top:0,zIndex:50,background:`rgba(10,15,30,0.97)`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}18,transparent)`,pointerEvents:"none"}}/>
        <button onClick={()=>setDrawer(true)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",padding:0,cursor:"pointer"}}>
          <Av url={profil?.avatar_url||null} size={34}/>
          <img src="/logo.png" alt="Scriptify" style={{height:44,objectFit:"contain",maxWidth:140}}/>
        </button>
        <div style={{flex:1}}>
          <span style={{fontFamily:G.fontDisp,fontSize:20,letterSpacing:"0.1em",color:G.text}}>BİLDİRİMLER</span>
          {okunmayanSayi>0&&<span style={{marginLeft:8,fontSize:11,color:G.red,fontWeight:700,textShadow:`0 0 8px ${G.red}60`}}>{okunmayanSayi} yeni</span>}
        </div>
        {bildirimler.length>0&&(
          <button onClick={()=>setSilOnay(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:10,background:`${G.red}10`,border:`1px solid ${G.red}20`,color:G.red,fontSize:11,fontWeight:700,cursor:"pointer"}}>
            <Icon id="trash" size={12} color={G.red}/>Temizle
          </button>
        )}
      </div>

      <div style={{maxWidth:680,margin:"0 auto",borderBottom:`1px solid ${G.border}`,display:"flex",background:`rgba(10,15,30,0.5)`}}>
        {[{id:"hepsi",label:"Hepsi",count:bildirimler.length},{id:"okunmayan",label:"Okunmamış",count:okunmayanSayi}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"14px 8px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?G.blue:"transparent"}`,color:tab===t.id?G.blue:G.textMuted,fontSize:13,fontWeight:tab===t.id?700:500,marginBottom:-1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,cursor:"pointer",transition:"all 0.2s",letterSpacing:"0.02em",boxShadow:tab===t.id?`0 2px 8px ${G.blue}20`:"none"}}>
            {t.label}
            {t.count>0&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:tab===t.id?`${G.blue}15`:`rgba(241,245,249,0.05)`,color:tab===t.id?G.blue:G.textDim}}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div style={{maxWidth:680,margin:"0 auto"}}>
        {hata?(
          <div style={{textAlign:"center",padding:"70px 20px"}}>
            <div style={{fontFamily:G.fontDisp,fontSize:34,color:G.red,letterSpacing:"0.08em",marginBottom:10}}>HATA</div>
            <p style={{fontSize:14,color:G.textMuted}}>{hata}</p>
          </div>
        ):goruntu.length===0?(
          <div style={{textAlign:"center",padding:"80px 20px"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:`${G.blue}10`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:G.glowBlue}}>
              <Icon id="bell" size={28} color={G.blue}/>
            </div>
            <div style={{fontFamily:G.fontDisp,fontSize:40,color:G.textDim,letterSpacing:"0.12em",marginBottom:12}}>
              {tab==="okunmayan"?"TEMİZ":"BOŞ"}
            </div>
            <p style={{fontSize:14,color:G.textMuted}}>{tab==="okunmayan"?"Okunmamış bildirim yok.":"Henüz bildirim yok."}</p>
          </div>
        ):goruntu.map((b,i)=>{
          var info=BILDIRIM[b.tip]||BILDIRIM.default;
          var link=b.senaryo_id?"/senaryo/"+b.senaryo_id:b.gonderen?.username?"/@"+b.gonderen.username:"#";
          return(
            <a key={b.id} href={link}
              style={{display:"flex",alignItems:"center",gap:13,padding:"14px 20px",borderBottom:`1px solid ${G.border}`,background:!b.okundu?`${info.renk}06`:"transparent",animation:i<10?`fadeUp 0.2s ${i*0.02}s both`:"none",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${info.renk}09`}
              onMouseLeave={e=>e.currentTarget.style.background=!b.okundu?`${info.renk}06`:"transparent"}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:46,height:46,borderRadius:"50%",overflow:"hidden",background:`linear-gradient(135deg,${G.deep},${G.surface})`,border:`1.5px solid rgba(56,189,248,0.15)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {b.gonderen?.avatar_url
                    ?<img src={b.gonderen.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                    :<Icon id="user" size={20} color="rgba(56,189,248,0.3)"/>}
                </div>
                <div style={{position:"absolute",bottom:-2,right:-2,width:22,height:22,borderRadius:"50%",background:G.card,border:`2px solid ${G.black}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,boxShadow:`0 0 6px ${info.renk}40`}}>
                  {info.ikon}
                </div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,color:G.text,lineHeight:1.5}}>
                  <strong style={{color:G.text,fontWeight:800}}>@{b.gonderen?.username||"Birisi"}</strong>
                  {b.gonderen?.dogrulandi&&<span style={{marginLeft:4,fontSize:10,padding:"1px 5px",borderRadius:20,background:`${G.blue}15`,color:G.blue,fontWeight:700,verticalAlign:"middle",boxShadow:`0 0 6px ${G.blue}20`}}>✓</span>}
                  {" "}<span style={{color:G.textMuted}}>{info.metin}</span>
                </p>
                {b.icerik&&<p style={{fontSize:12,color:G.textDim,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{b.icerik}"</p>}
                <p style={{fontSize:11,color:G.textDim,marginTop:4}}>{zaman(b.created_at)}</p>
              </div>
              {!b.okundu&&<div style={{width:8,height:8,borderRadius:"50%",background:info.renk,flexShrink:0,boxShadow:`0 0 8px ${info.renk}80`}}/>}
            </a>
          );
        })}
      </div>

      {silOnay&&<>
        <div onClick={()=>setSilOnay(false)} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)"}}/>
        <div style={{position:"fixed",inset:0,zIndex:301,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{background:G.surface,border:`1px solid ${G.borderHov}`,borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:300,textAlign:"center",position:"relative",boxShadow:G.glowRed}}>
            <NeonCorners color={G.red}/>
            <div style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.05em",color:G.text,marginBottom:8}}>TEMİZLE</div>
            <p style={{fontSize:13,color:G.textMuted,marginBottom:24}}>Tüm bildirimler silinsin mi? Bu işlem geri alınamaz.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setSilOnay(false)} style={{flex:1,padding:"12px",borderRadius:12,background:"rgba(241,245,249,0.05)",border:`1px solid ${G.border}`,color:G.textMuted,fontSize:13,fontWeight:600,cursor:"pointer"}}>İptal</button>
              <button onClick={tumunuSil} style={{flex:1,padding:"12px",borderRadius:12,background:`linear-gradient(135deg,${G.red},${G.redL})`,border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:G.glowRed}}>Sil</button>
            </div>
          </div>
        </div>
      </>}

      <AltNav/>
      {drawer&&<SimpleDrawer user={user} username={profil?.username||(user?.email?.split("@")[0]||"")} avatarUrl={profil?.avatar_url||null} onClose={()=>setDrawer(false)}/>} 
    </div>
  );
}
