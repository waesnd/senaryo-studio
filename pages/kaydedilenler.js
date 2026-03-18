import { useState, useEffect } from "react";
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
  text:"#F1F5F9", textMuted:"rgba(241,245,249,0.5)", textDim:"rgba(241,245,249,0.25)",
  glowBlue:"0 0 24px rgba(56,189,248,0.25)",
  shadow:"0 8px 40px rgba(0,0,0,0.7)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

var TURLER_RENK = {
  "Gerilim":G.red,"Drama":G.blue,"Komedi":"#FBBF24","Aksiyon":G.red,
  "Korku":G.purple,"Romantik":"#F472B6","Bilim Kurgu":G.blueL,
  "Fantastik":G.purpleL,"Suç":"#94A3B8","Tarihi":"#D97706",
};

function Icon({id,size=20,color="currentColor",strokeWidth=1.8}){
  var p={width:size,height:size,fill:"none",stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="bookmark")return<svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>;
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="trash")return<svg {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="arrow-left")return<svg {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
  if(id==="heart")return<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  return null;
}

function AltNav(){
  var items=[
    {href:"/",id:"home"},{href:"/kesfet",id:"compass"},
    {href:"/topluluk",id:"users"},{href:"/mesajlar",id:"chat"},
    {href:"/profil",id:"user"},
  ];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(10,15,30,0.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"8px 0 env(safe-area-inset-bottom,10px)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.blue}30,transparent)`}}/>
      {items.map(item=>(
        <a key={item.href} href={item.href} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px",borderRadius:12,opacity:0.35}}>
          <Icon id={item.id} size={22} color="#94A3B8"/>
        </a>
      ))}
    </div>
  );
}

export default function Kaydedilenler(){
  var {user, authHazir} = useAuth();
  var [gonderi, setGonderi] = useState([]);
  var [senaryolar, setSenaryolar] = useState([]);
  var [tab, setTab] = useState("gonderiler");
  var [yukleniyor, setYukleniyor] = useState(false);

  useEffect(()=>{
    let aktif = true;

    async function init(){
      if(!authHazir || !user) return;
      await yukle(aktif);
    }

    init();

    return ()=>{
      aktif = false;
    };
  },[authHazir, user]);

  async function yukle(aktif = true){
    if(!user?.id) return;

    try{
      if(aktif) setYukleniyor(true);

      var { data: kayitlar, error: kayitError } = await supabase
        .from("kaydedilenler")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at",{ascending:false})
        .limit(50);

      if(kayitError){
        console.error("[kaydedilenler] kayıtlar yüklenemedi:", kayitError.message);
        if(aktif){
          setGonderi([]);
          setSenaryolar([]);
        }
        return;
      }

      var savedRows = kayitlar || [];
      var senaryoIds = Array.from(new Set(savedRows.map(k => k.senaryo_id).filter(Boolean)));

      var senaryoMap = {};
      if(senaryoIds.length > 0){
        var { data: senaryoRows, error: senaryoError } = await supabase
          .from("senaryolar")
          .select("*")
          .in("id", senaryoIds);

        if(senaryoError){
          console.error("[kaydedilenler] kaydedilen senaryolar yüklenemedi:", senaryoError.message);
        }else{
          (senaryoRows || []).forEach(function(s){ senaryoMap[s.id] = s; });
        }
      }

      var userIds = Array.from(new Set(Object.values(senaryoMap).map(s => s.user_id).filter(Boolean)));
      var profileMap = {};
      if(userIds.length > 0){
        var { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id,username,avatar_url,dogrulandi")
          .in("id", userIds);

        if(profileError){
          console.error("[kaydedilenler] profil bilgileri yüklenemedi:", profileError.message);
        }else{
          (profileRows || []).forEach(function(p){ profileMap[p.id] = p; });
        }
      }

      var savedSenaryolar = savedRows
        .map(function(k){
          var s = senaryoMap[k.senaryo_id];
          if(!s) return null;
          return {
            ...k,
            senaryo: {
              ...s,
              profiles: profileMap[s.user_id] || null
            }
          };
        })
        .filter(Boolean);

      var benimPaylasilanlar = Object.values(senaryoMap)
        .filter(function(s){ return s.user_id === user.id && s.paylasim_acik; })
        .sort(function(a,b){ return String(b.created_at||"").localeCompare(String(a.created_at||"")); });

      if(aktif){
        setGonderi(savedSenaryolar);
        setSenaryolar(benimPaylasilanlar);
      }
    }catch(err){
      console.error("[kaydedilenler] yukle beklenmeyen hata:", err);
      if(aktif){
        setGonderi([]);
        setSenaryolar([]);
      }
    }finally{
      if(aktif) setYukleniyor(false);
    }
  }

  async function kaydettenCikar(senaryoId){
    if(!user?.id) return;

    try{
      var { error } = await supabase
        .from("kaydedilenler")
        .delete()
        .eq("senaryo_id",senaryoId)
        .eq("user_id",user.id);

      if(error){
        console.error("[kaydedilenler] kayıt silinemedi:", error.message);
        return;
      }

      setGonderi(prev=>prev.filter(k=>k.senaryo_id!==senaryoId));
    }catch(err){
      console.error("[kaydedilenler] kaydettenCikar beklenmeyen hata:", err);
    }
  }

  function zaman(ts){
    var d=Math.floor((Date.now()-new Date(ts))/1000);
    if(d<60)return"az önce";
    if(d<3600)return Math.floor(d/60)+"dk";
    if(d<86400)return Math.floor(d/3600)+"sa";
    return Math.floor(d/86400)+"g";
  }

  if(!authHazir)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(!user)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:G.fontBody}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontFamily:G.fontDisp,fontSize:44,color:G.textDim,letterSpacing:"0.1em"}}>KAYDEDİLENLER</div>
      <p style={{color:G.textMuted,fontSize:14}}>Görüntülemek için giriş yap</p>
      <a href="/" style={{padding:"12px 28px",borderRadius:14,background:G.blueGrad,color:G.black,fontWeight:800,fontSize:13,textDecoration:"none",boxShadow:G.glowBlue}}>Giriş Yap</a>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;}button{font-family:inherit;cursor:pointer;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:2px;}::-webkit-scrollbar-thumb{background:${G.blueD};border-radius:2px;}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(10,15,30,0.97)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px"}}>
        <div style={{height:2,background:G.blueGrad,position:"absolute",top:0,left:0,right:0}}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:2}}>
          <a href="/profil" style={{width:34,height:34,borderRadius:10,background:`${G.blue}08`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon id="arrow-left" size={16} color={G.blue}/>
          </a>
          <img src="/logo.png" alt="Scriptify" style={{height:40,objectFit:"contain",maxWidth:120}}/>
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Icon id="bookmark" size={16} color={G.blue}/>
            <span style={{fontFamily:G.fontDisp,fontSize:16,letterSpacing:"0.08em",color:G.blue}}>KAYDEDİLENLER</span>
          </div>
        </div>
      </div>

      {/* SEKMELER */}
      <div style={{display:"flex",borderBottom:`1px solid ${G.border}`,background:"rgba(10,15,30,0.5)"}}>
        {[{id:"gonderiler",label:"GÖNDERİLER",count:gonderi.length},{id:"senaryolar",label:"SENARYOLARIM",count:senaryolar.length}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{flex:1,padding:"13px 8px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?G.blue:"transparent"}`,color:tab===t.id?G.blue:G.textDim,fontSize:11,fontWeight:800,cursor:"pointer",marginBottom:-1,letterSpacing:"0.1em",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {t.label}
            {t.count>0&&<span style={{fontSize:10,padding:"1px 7px",borderRadius:10,background:tab===t.id?`${G.blue}20`:"rgba(241,245,249,0.05)",color:tab===t.id?G.blue:G.textDim}}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div style={{maxWidth:680,margin:"0 auto"}}>

        {yukleniyor&&(
          <div style={{display:"flex",justifyContent:"center",padding:"60px 0"}}>
            <div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.blue,borderRadius:"50%",animation:"spin 0.8s linear infinite",boxShadow:G.glowBlue}}/>
          </div>
        )}

        {/* GÖNDERİLER */}
        {!yukleniyor&&tab==="gonderiler"&&(
          gonderi.length===0?(
            <div style={{textAlign:"center",padding:"80px 20px"}}>
              <div style={{width:60,height:60,borderRadius:"50%",background:`${G.blue}10`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:G.glowBlue}}>
                <Icon id="bookmark" size={26} color={G.blue}/>
              </div>
              <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:8}}>BOŞ</div>
              <p style={{fontSize:13,color:G.textMuted}}>Henüz kaydedilen gönderi yok.</p>
            </div>
          ):gonderi.map((k,i)=>{
            var g = k.senaryo || k.gonderiler;
            var turRenk = TURLER_RENK[g.tur] || G.blue;
            return(
              <a key={k.id} href={`/senaryo/${g.id || k.senaryo_id}`} style={{display:"block",borderBottom:`1px solid ${G.border}`,padding:"16px 20px",animation:`fadeUp 0.2s ${i*0.04}s both ease`,position:"relative"}}
                onMouseEnter={e=>e.currentTarget.style.background=`${G.blue}03`}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{position:"absolute",left:0,top:"10%",bottom:"10%",width:2,background:turRenk,opacity:0.4,borderRadius:1}}/>
                <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                  <a href={g.profiles?.username?`/@${g.profiles.username}`:"#"} style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:G.surface,border:`1px solid ${G.border}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {g.profiles?.avatar_url?<img src={g.profiles.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={14} color={G.textDim}/>}
                    </div>
                    <div>
                      <p style={{fontSize:13,fontWeight:700,color:G.text}}>@{g.profiles?.username}</p>
                      <p style={{fontSize:10,color:G.textDim}}>{zaman(k.created_at)}</p>
                    </div>
                  </a>
                  <button onClick={()=>kaydettenCikar(k.senaryo_id || g.id)}
                    style={{padding:"5px 10px",borderRadius:8,background:`${G.red}08`,border:`1px solid ${G.red}20`,color:G.red,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                    <Icon id="trash" size={10} color={G.red}/>Kaldır
                  </button>
                </div>
                {g.baslik&&<p style={{fontSize:14,fontWeight:700,color:G.text,marginBottom:4}}>{g.baslik}</p>}
                {(g.metin || g.ana_fikir)&&<p style={{fontSize:13,color:G.textMuted,lineHeight:1.65}}>{g.metin || g.ana_fikir}</p>}
                {(g.fotograf_url || g.kapak_url || g.medya_url)&&<img src={g.fotograf_url || g.kapak_url || g.medya_url} style={{width:"100%",borderRadius:12,marginTop:8,maxHeight:280,objectFit:"cover",border:`1px solid ${G.border}`}} alt=""/>}
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
                  <Icon id="heart" size={11} color={G.red}/>
                  <span style={{fontSize:11,color:G.textDim}}>{g.begeni_sayisi||0}</span>
                  <a href={`/senaryo/${g.id}`} style={{marginLeft:"auto",fontSize:11,color:G.blue,fontWeight:600}}>Görüntüle →</a>
                </div>
              </a>
            );
          })
        )}

        {/* SENARYOLARIM */}
        {!yukleniyor&&tab==="senaryolar"&&(
          senaryolar.length===0?(
            <div style={{textAlign:"center",padding:"80px 20px"}}>
              <div style={{width:60,height:60,borderRadius:"50%",background:`${G.purple}10`,border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                <Icon id="film" size={26} color={G.purple}/>
              </div>
              <div style={{fontFamily:G.fontDisp,fontSize:36,color:G.textDim,marginBottom:8}}>BOŞ</div>
              <p style={{fontSize:13,color:G.textMuted}}>Henüz kaydedilen senaryo yok.</p>
              <a href="/uret" style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:20,padding:"11px 22px",borderRadius:12,background:G.blueGrad,color:G.black,fontSize:13,fontWeight:800,boxShadow:G.glowBlue}}>Senaryo Üret</a>
            </div>
          ):senaryolar.map((s,i)=>{
            var turRenk = TURLER_RENK[s.tur] || G.blue;
            return(
              <a key={s.id} href={`/senaryo/${s.id}`}
                style={{display:"block",margin:"10px 16px",background:`linear-gradient(135deg,${G.card},${G.surface})`,border:`1px solid ${G.border}`,borderRadius:16,padding:"16px",textDecoration:"none",position:"relative",overflow:"hidden",animation:`fadeUp 0.2s ${i*0.04}s both ease`,transition:"all 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=turRenk+"50";e.currentTarget.style.boxShadow=`0 0 20px ${turRenk}12`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:turRenk,borderRadius:"16px 0 0 16px"}}/>
                <div style={{paddingLeft:8}}>
                  <div style={{display:"flex",gap:6,marginBottom:8}}>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:`${G.blue}10`,color:G.blue,border:`1px solid ${G.blue}20`}}>{s.tip}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:`${turRenk}10`,color:turRenk,border:`1px solid ${turRenk}20`}}>{s.tur}</span>
                  </div>
                  <p style={{fontSize:15,fontWeight:800,color:G.text,marginBottom:4}}>{s.baslik}</p>
                  {s.tagline&&<p style={{fontSize:11,fontStyle:"italic",color:turRenk,marginBottom:8,opacity:0.85}}>"{s.tagline}"</p>}
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Icon id="heart" size={11} color={G.red}/>
                    <span style={{fontSize:11,color:G.textDim}}>{s.begeni_sayisi||0}</span>
                    <span style={{fontSize:10,color:G.textDim,marginLeft:"auto"}}>{zaman(s.created_at)}</span>
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>

      <AltNav/>
    </div>
  );
}
