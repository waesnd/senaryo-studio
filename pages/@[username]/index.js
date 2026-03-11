import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

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

var ROZETLER=[
  {label:"Yeni Kalem",   icon:"✏️",color:G.silver,min:0},
  {label:"Aday Senarist",icon:"📝",color:"#A8A9AD",min:5},
  {label:"Senarist",     icon:"🎬",color:G.gold,  min:20},
  {label:"Usta Senarist",icon:"🏆",color:G.goldL, min:50},
  {label:"Efsane",       icon:"👑",color:G.red,   min:100},
];
function getRozet(n){return[...ROZETLER].reverse().find(r=>(n||0)>=r.min)||ROZETLER[0];}

var TURLER_RENK={"Gerilim":"#C0392B","Drama":"#2980B9","Komedi":"#F39C12","Aksiyon":"#E74C3C","Korku":"#8E44AD","Romantik":"#E91E8C","Bilim Kurgu":"#1ABC9C","Fantastik":"#9B59B6","Suç":"#7F8C8D","Tarihi":"#D4AF37"};

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
  return null;
}

function FilmCorners({color=G.goldD,size=10,thickness=2}){
  var s={position:"absolute",width:size,height:size};
  var l={background:color,position:"absolute"};
  return(<>
    <div style={{...s,top:0,left:0}}><div style={{...l,top:0,left:0,width:thickness,height:size}}/><div style={{...l,top:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,top:0,right:0}}><div style={{...l,top:0,right:0,width:thickness,height:size}}/><div style={{...l,top:0,right:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,left:0}}><div style={{...l,bottom:0,left:0,width:thickness,height:size}}/><div style={{...l,bottom:0,left:0,width:size,height:thickness}}/></div>
    <div style={{...s,bottom:0,right:0}}><div style={{...l,bottom:0,right:0,width:thickness,height:size}}/><div style={{...l,bottom:0,right:0,width:size,height:thickness}}/></div>
  </>);
}

function Av({url,size}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#1a1500,#2a2000)",border:`1.5px solid rgba(212,175,55,0.25)`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {url?<img src={url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={size*0.4} color="rgba(212,175,55,0.35)"/>}
    </div>
  );
}

function AltNav(){
  var items=[{href:"/",id:"home"},{href:"/kesfet",id:"compass"},{href:"/topluluk",id:"users"},{href:"/mesajlar",id:"chat"},{href:"/profil",id:"user"}];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(8,8,8,0.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${G.border}`,padding:"8px 0 env(safe-area-inset-bottom,10px)",display:"flex",justifyContent:"space-around",alignItems:"center"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold}25,transparent)`}}/>
      {items.map(item=>(
        <a key={item.href} href={item.href} style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 16px",borderRadius:12,opacity:0.4}}>
          <Icon id={item.id} size={22} color={G.silver}/>
        </a>
      ))}
    </div>
  );
}

function zaman(ts){
  var d=Math.floor((Date.now()-new Date(ts))/1000);
  if(d<3600)return Math.floor(d/60)+"dk";
  if(d<86400)return Math.floor(d/3600)+"sa";
  return Math.floor(d/86400)+"g önce";
}

export default function KullaniciProfil(){
  var router=useRouter();
  var {username}=router.query;
  var [user,setUser]=useState(null);
  var [profil,setProfil]=useState(null);
  var [senaryolar,setSenaryolar]=useState([]);
  var [gonderiler,setGonderiler]=useState([]);
  var [tab,setTab]=useState("gonderiler");
  var [takipci,setTakipci]=useState(0);
  var [takip,setTakip]=useState(0);
  var [takipEdiyorum,setTakipEdiyorum]=useState(false);
  var [engelledim,setEngelledim]=useState(false);
  var [yukleniyor,setYukleniyor]=useState(true);
  var [loaded,setLoaded]=useState(false);
  var [menu,setMenu]=useState(false);

  var benimProfil=user&&profil&&user.id===profil.id;
  var rozet=getRozet(profil?.senaryo_sayisi||0);

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      if(data?.session)setUser(data.session.user);
      setLoaded(true);
    });
  },[]);

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
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:28,height:28,border:`2px solid ${G.border}`,borderTopColor:G.gold,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(!profil)return(
    <div style={{minHeight:"100vh",background:G.black,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:G.fontBody}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontFamily:G.fontDisp,fontSize:48,color:G.textDim,letterSpacing:"0.1em"}}>404</div>
      <p style={{color:G.textMuted,fontSize:14}}>Kullanıcı bulunamadı</p>
      <a href="/" style={{color:G.gold,fontWeight:700,fontSize:13}}>← Ana Sayfaya Dön</a>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:80}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes filmRoll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:${G.goldD};border-radius:2px;}
        ::selection{background:rgba(212,175,55,0.2);color:${G.goldL};}
      `}</style>

      {/* TOPBAR */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(8,8,8,0.97)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold}18,transparent)`}}/>
        <button onClick={()=>router.back()} style={{background:"none",border:"none",padding:4,cursor:"pointer",display:"flex",flexShrink:0}}>
          <Icon id="arrow-left" size={20} color={G.gold}/>
        </button>
        <p style={{flex:1,fontFamily:G.fontDisp,fontSize:16,letterSpacing:"0.06em",color:G.text}}>@{profil.username}</p>
        {!benimProfil&&(
          <div style={{position:"relative"}}>
            <button onClick={()=>setMenu(!menu)} style={{width:34,height:34,borderRadius:10,background:"rgba(245,240,232,0.04)",border:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <Icon id="more" size={16} color={G.textMuted}/>
            </button>
            {menu&&(
              <div style={{position:"absolute",right:0,top:40,background:"#111",border:`1px solid ${G.border}`,borderRadius:14,padding:"6px",minWidth:170,boxShadow:G.shadow,zIndex:10}}>
                <button onClick={engelToggle} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:"none",border:"none",color:engelledim?G.gold:G.red,fontSize:13,textAlign:"left",cursor:"pointer",borderRadius:10}}>
                  <Icon id={engelledim?"check":"ban"} size={13} color={engelledim?G.gold:G.red}/>
                  {engelledim?"Engel Kaldır":"Engelle"}
                </button>
                <button onClick={()=>{setMenu(false);}} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 14px",background:"none",border:"none",color:G.textMuted,fontSize:13,textAlign:"left",cursor:"pointer",borderRadius:10}}>
                  <Icon id="flag" size={13} color={G.textMuted}/>Raporla
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{maxWidth:680,margin:"0 auto"}}>
        {/* BANNER */}
        <div style={{height:120,position:"relative",overflow:"hidden"}}>
          {profil.banner_url
            ?<img src={profil.banner_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
            :<div style={{height:"100%",background:`linear-gradient(135deg,${G.gold}12,${G.red}08)`,position:"relative",overflow:"hidden"}}>
              {/* Film şeridi animasyonu */}
              <div style={{position:"absolute",bottom:0,left:0,right:0,overflow:"hidden",height:18}}>
                <div style={{display:"flex",animation:"filmRoll 5s linear infinite",width:"200%"}}>
                  {[...Array(60)].map((_,i)=><div key={i} style={{width:12,height:10,margin:"4px 4px",border:`1px solid rgba(212,175,55,0.1)`,borderRadius:1,flexShrink:0}}/>)}
                </div>
              </div>
              <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 30% 50%,${G.gold}08,transparent 60%)`}}/>
            </div>}
        </div>

        <div style={{padding:"0 20px"}}>
          {/* Avatar + butonlar */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginTop:-44,marginBottom:14}}>
            <div style={{width:88,height:88,borderRadius:"50%",background:G.black,border:`3px solid ${G.gold}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {profil.avatar_url?<img src={profil.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<Icon id="user" size={36} color="rgba(212,175,55,0.4)"/>}
            </div>
            <div style={{display:"flex",gap:8,paddingBottom:4}}>
              {benimProfil?(
                <a href="/profil" style={{padding:"8px 18px",borderRadius:20,border:`1.5px solid ${G.border}`,color:G.text,fontSize:12,fontWeight:700,textDecoration:"none",letterSpacing:"0.04em"}}>Düzenle</a>
              ):(
                <>
                  <button onClick={()=>window.location.href="/mesajlar"} style={{width:36,height:36,borderRadius:"50%",background:"rgba(245,240,232,0.05)",border:`1.5px solid ${G.border}`,color:G.textMuted,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    <Icon id="chat" size={16} color={G.textMuted}/>
                  </button>
                  <button onClick={takipToggle} style={{padding:"8px 18px",borderRadius:20,background:takipEdiyorum?"rgba(245,240,232,0.05)":G.goldGrad,border:`1.5px solid ${takipEdiyorum?G.border:"transparent"}`,color:takipEdiyorum?G.text:"#0d0d0d",fontSize:12,fontWeight:800,cursor:"pointer",letterSpacing:"0.04em",transition:"all 0.2s"}}>
                    {takipEdiyorum?"Takipte ✓":"+ Takip Et"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bilgiler */}
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
              <h1 style={{fontFamily:G.fontDisp,fontSize:22,letterSpacing:"0.04em",color:G.text}}>@{profil.username}</h1>
              {profil.dogrulandi&&(
                <div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:20,background:`${G.gold}12`,border:`1px solid ${G.gold}25`}}>
                  <Icon id="check" size={10} color={G.gold} strokeWidth={3}/>
                  <span style={{fontSize:9,color:G.gold,fontWeight:800,letterSpacing:"0.06em"}}>DOĞRULANMIŞ</span>
                </div>
              )}
            </div>
            {/* Rozet */}
            <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:`${rozet.color}12`,border:`1px solid ${rozet.color}22`,marginBottom:8}}>
              <span style={{fontSize:11}}>{rozet.icon}</span>
              <span style={{fontSize:10,fontWeight:700,color:rozet.color}}>{rozet.label}</span>
            </div>
            {profil.bio&&<p style={{fontSize:13,color:G.textMuted,lineHeight:1.65,marginBottom:6}}>{profil.bio}</p>}
            {profil.website&&<a href={profil.website} target="_blank" style={{fontSize:11,color:G.gold,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>🔗 {profil.website.replace(/https?:\/\//,"")}</a>}
          </div>

          {/* İstatistikler */}
          <div style={{display:"flex",marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${G.border}`,borderTop:`1px solid ${G.border}`,paddingTop:14}}>
            {[{val:profil.senaryo_sayisi||senaryolar.length,label:"Senaryo"},{val:gonderiler.length,label:"Gönderi"},{val:takipci,label:"Takipçi"},{val:takip,label:"Takip"}].map((s,i)=>(
              <div key={s.label} style={{flex:1,textAlign:"center",borderRight:i<3?`1px solid ${G.border}`:"none"}}>
                <div style={{fontFamily:G.fontDisp,fontSize:22,color:G.gold}}>{s.val}</div>
                <p style={{fontSize:9,color:G.textDim,letterSpacing:"0.08em",marginTop:2}}>{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>

          {/* Engellendi uyarısı */}
          {engelledim&&(
            <div style={{background:`${G.red}08`,border:`1px solid ${G.red}20`,borderRadius:14,padding:"12px 16px",marginBottom:16,textAlign:"center"}}>
              <p style={{fontSize:12,color:G.red,fontWeight:600}}>Bu kullanıcıyı engellediniz. İçerikleri gizlendi.</p>
            </div>
          )}

          {/* TABS */}
          {!engelledim&&(
            <>
              <div style={{display:"flex",marginBottom:16,borderBottom:`1px solid ${G.border}`}}>
                {[{id:"gonderiler",label:"GÖNDERİLER"},{id:"senaryolar",label:"SENARYOLAR"}].map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"12px 8px",background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?G.gold:"transparent"}`,color:tab===t.id?G.gold:G.textDim,fontSize:11,fontWeight:800,cursor:"pointer",marginBottom:-1,letterSpacing:"0.1em",transition:"all 0.2s"}}>{t.label}</button>
                ))}
              </div>

              {/* GÖNDERİLER */}
              {tab==="gonderiler"&&(
                gonderiler.length===0?(
                  <div style={{textAlign:"center",padding:"60px 0"}}>
                    <div style={{fontFamily:G.fontDisp,fontSize:44,color:G.textDim,letterSpacing:"0.1em",marginBottom:10}}>BOŞ</div>
                    <p style={{fontSize:13,color:G.textMuted}}>Henüz gönderi yok.</p>
                  </div>
                ):gonderiler.map((g,i)=>(
                  <div key={g.id} style={{borderBottom:`1px solid ${G.border}`,padding:"14px 0",animation:`fadeUp 0.25s ${i*0.04}s both ease`}}>
                    <p style={{fontSize:10,color:G.textDim,marginBottom:6,letterSpacing:"0.04em"}}>{zaman(g.created_at)}</p>
                    {g.metin&&<p style={{fontSize:14,color:G.textMuted,lineHeight:1.65,marginBottom:g.fotograf_url?10:0}}>{g.metin}</p>}
                    {g.fotograf_url&&<img src={g.fotograf_url} style={{width:"100%",borderRadius:14,maxHeight:300,objectFit:"cover",border:`1px solid ${G.border}`}} alt=""/>}
                    <div style={{display:"flex",alignItems:"center",gap:4,marginTop:8}}>
                      <Icon id="heart" size={11} color={G.red}/>
                      <span style={{fontSize:11,color:G.textDim}}>{g.begeni_sayisi||0}</span>
                    </div>
                  </div>
                ))
              )}

              {/* SENARYOLAR */}
              {tab==="senaryolar"&&(
                senaryolar.length===0?(
                  <div style={{textAlign:"center",padding:"60px 0"}}>
                    <div style={{fontFamily:G.fontDisp,fontSize:44,color:G.textDim,letterSpacing:"0.1em",marginBottom:10}}>BOŞ</div>
                    <p style={{fontSize:13,color:G.textMuted}}>Paylaşılan senaryo yok.</p>
                  </div>
                ):senaryolar.map((s,i)=>{
                  var turRenk=TURLER_RENK[s.tur]||G.gold;
                  return(
                    <a key={s.id} href={"/senaryo/"+s.id}
                      style={{display:"block",background:`linear-gradient(135deg,${G.card},${G.surface})`,border:`1px solid ${G.border}`,borderRadius:16,padding:"16px 18px",marginBottom:10,animation:`fadeUp 0.25s ${i*0.04}s both ease`,textDecoration:"none",position:"relative",transition:"all 0.2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=turRenk+"40";e.currentTarget.style.boxShadow=`0 0 20px ${turRenk}10`;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                      <FilmCorners color={turRenk} size={8}/>
                      <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:turRenk,borderRadius:"16px 0 0 16px"}}/>
                      <div style={{display:"flex",gap:6,marginBottom:8,paddingLeft:8}}>
                        <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:`${G.gold}10`,color:G.gold,border:`1px solid ${G.gold}20`}}>{s.tip}</span>
                        <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:`${turRenk}10`,color:turRenk,border:`1px solid ${turRenk}20`}}>{s.tur}</span>
                      </div>
                      <p style={{fontSize:15,fontWeight:800,color:G.text,marginBottom:4,paddingLeft:8}}>{s.baslik}</p>
                      {s.tagline&&<p style={{fontSize:11,fontStyle:"italic",color:turRenk,paddingLeft:8,opacity:0.85}}>{s.tagline}</p>}
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:10,paddingLeft:8}}>
                        <Icon id="heart" size={11} color={G.red}/>
                        <span style={{fontSize:11,color:G.textDim}}>{s.begeni_sayisi||0}</span>
                        <span style={{fontSize:10,color:G.textDim,marginLeft:6}}>{zaman(s.created_at)}</span>
                      </div>
                    </a>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      <AltNav/>
    </div>
  );
}
