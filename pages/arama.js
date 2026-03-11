import { useState, useEffect, useRef } from "react";
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

var TABS=[{id:"hepsi",label:"Tümü"},{id:"kullanici",label:"Kullanıcı"},{id:"senaryo",label:"Senaryo"},{id:"gonderi",label:"Gönderi"}];

var TURLER_RENK={"Gerilim":"#C0392B","Drama":"#2980B9","Komedi":"#F39C12","Aksiyon":"#E74C3C","Korku":"#8E44AD","Romantik":"#E91E8C","Bilim Kurgu":"#1ABC9C","Fantastik":"#9B59B6","Suç":"#7F8C8D","Tarihi":"#D4AF37"};

function Icon({id,size=22,color="currentColor",strokeWidth=1.8}){
  var p={width:size,height:size,fill:"none",stroke:color,strokeWidth,viewBox:"0 0 24 24"};
  if(id==="home")return<svg {...p}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
  if(id==="compass")return<svg {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>;
  if(id==="users")return<svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
  if(id==="chat")return<svg {...p}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
  if(id==="user")return<svg {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  if(id==="search")return<svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
  if(id==="x")return<svg {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  if(id==="film")return<svg {...p}><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>;
  if(id==="heart")return<svg {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  if(id==="trending")return<svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
  if(id==="zap")return<svg {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
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
    <div style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#1a1500,#2a2000)",border:`1.5px solid rgba(212,175,55,0.2)`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
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
  return Math.floor(d/86400)+"g";
}

export default function Arama(){
  var [user,setUser]=useState(null);
  var [profil,setProfil]=useState(null);
  var [ara,setAra]=useState("");
  var [tab,setTab]=useState("hepsi");
  var [sonuclar,setSonuclar]=useState({kullanici:[],senaryo:[],gonderi:[]});
  var [yukleniyor,setYukleniyor]=useState(false);
  var [aramaYapildi,setAramaYapildi]=useState(false);
  var [populer,setPopuler]=useState([]);
  var inputRef=useRef(null);
  var timerRef=useRef(null);

  var avatarUrl=profil?.avatar_url||null;
  var username=profil?.username||user?.email?.split("@")[0]||"";

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      setTimeout(()=>inputRef.current?.focus(),50);
      if(data?.session){setUser(data.session.user);loadProfil(data.session.user);}
    });
    supabase.auth.onAuthStateChange((_,s)=>{if(s){setUser(s.user);loadProfil(s.user);}else{setUser(null);setProfil(null);}});
    supabase.from("senaryolar").select("baslik,tur,begeni_sayisi").eq("paylasim_acik",true).order("begeni_sayisi",{ascending:false}).limit(6).then(({data})=>{if(data)setPopuler(data);});
  },[]);

  function loadProfil(u){supabase.from("profiles").select("*").eq("id",u.id).single().then(({data})=>{if(data)setProfil(data);});}

  function aramaYap(kelime){
    if(!kelime.trim()){setSonuclar({kullanici:[],senaryo:[],gonderi:[]});setAramaYapildi(false);return;}
    clearTimeout(timerRef.current);
    timerRef.current=setTimeout(async()=>{
      setYukleniyor(true);
      var q="%"+kelime+"%";
      var[k,s,g]=await Promise.all([
        supabase.from("profiles").select("id,username,bio,avatar_url,dogrulandi").ilike("username",q).limit(8),
        supabase.from("senaryolar").select("id,baslik,tagline,tur,tip,begeni_sayisi,profiles(username)").eq("paylasim_acik",true).or("baslik.ilike."+q+",tur.ilike."+q).limit(10),
        supabase.from("gonderiler").select("id,metin,begeni_sayisi,created_at,profiles(username,avatar_url)").ilike("metin",q).limit(10),
      ]);
      setSonuclar({kullanici:k.data||[],senaryo:s.data||[],gonderi:g.data||[]});
      setAramaYapildi(true);
      setYukleniyor(false);
    },350);
  }

  var toplamSonuc=sonuclar.kullanici.length+sonuclar.senaryo.length+sonuclar.gonderi.length;
  var gosterKullanici=tab==="hepsi"||tab==="kullanici";
  var gosterSenaryo=tab==="hepsi"||tab==="senaryo";
  var gosterGonderi=tab==="hepsi"||tab==="gonderi";

  return(
    <div style={{minHeight:"100vh",background:G.black,color:G.text,fontFamily:G.fontBody,paddingBottom:90}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;color:inherit;} button{font-family:inherit;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:2px;} ::-webkit-scrollbar-thumb{background:${G.goldD};border-radius:2px;}
        ::selection{background:rgba(212,175,55,0.2);color:${G.goldL};}
        input::placeholder{color:${G.textDim};}
        .ara-satir{transition:background 0.12s;} .ara-satir:hover{background:rgba(245,240,232,0.03)!important;}
      `}</style>

      {/* TOPBAR — Arama kutusu sabit */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(8,8,8,0.97)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${G.border}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold}18,transparent)`}}/>
        <button onClick={()=>window.location.href="/profil"} style={{background:"none",border:"none",padding:0,cursor:"pointer",flexShrink:0}}>
          <Av url={avatarUrl} size={34}/>
        </button>
        <div style={{flex:1,position:"relative"}}>
          <div style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
            {yukleniyor
              ?<div style={{width:14,height:14,border:`2px solid ${G.border}`,borderTopColor:G.gold,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
              :<Icon id="search" size={15} color={G.textDim}/>}
          </div>
          <input
            ref={inputRef}
            value={ara}
            onChange={e=>{setAra(e.target.value);aramaYap(e.target.value);}}
            placeholder="Kullanıcı, senaryo veya gönderi ara..."
            style={{width:"100%",background:"rgba(245,240,232,0.05)",border:`1px solid ${G.border}`,borderRadius:22,padding:"10px 38px 10px 38px",color:G.text,fontSize:13,outline:"none",fontFamily:G.fontBody,transition:"border-color 0.2s"}}
            onFocus={e=>e.target.style.borderColor=G.goldD}
            onBlur={e=>e.target.style.borderColor=G.border}
          />
          {ara&&(
            <button onClick={()=>{setAra("");setSonuclar({kullanici:[],senaryo:[],gonderi:[]});setAramaYapildi(false);inputRef.current?.focus();}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",padding:4,cursor:"pointer",display:"flex"}}>
              <Icon id="x" size={14} color={G.textDim}/>
            </button>
          )}
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto"}}>
        {!aramaYapildi?(
          /* ── KEŞFET MODU ── */
          <div style={{padding:"20px 16px"}}>
            {/* Popüler senaryolar */}
            <div style={{marginBottom:28}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <Icon id="trending" size={14} color={G.gold}/>
                <p style={{fontFamily:G.fontDisp,fontSize:14,letterSpacing:"0.12em",color:G.gold}}>POPÜLER SENARYOLAR</p>
              </div>
              {populer.length===0?(
                <p style={{fontSize:13,color:G.textMuted,textAlign:"center",padding:"30px 0"}}>Henüz senaryo yok.</p>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {populer.map((s,i)=>{
                    var turRenk=TURLER_RENK[s.tur]||G.gold;
                    return(
                      <a key={i} href="/kesfet" className="ara-satir" style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:14,background:G.card,border:`1px solid ${G.border}`,position:"relative",transition:"all 0.2s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=G.borderHov;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;}}>
                        <FilmCorners color={G.goldD} size={7}/>
                        <div style={{width:36,height:36,borderRadius:10,background:`${turRenk}18`,border:`1px solid ${turRenk}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <Icon id="film" size={16} color={turRenk}/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:13,fontWeight:700,color:G.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.baslik}</p>
                          <p style={{fontSize:11,color:G.textMuted,marginTop:2}}>{s.tur} · <Icon id="heart" size={9} color={G.red} style={{verticalAlign:"middle"}}/> {s.begeni_sayisi||0}</p>
                        </div>
                        <span style={{fontFamily:G.fontDisp,fontSize:18,color:`${G.gold}30`}}>#{i+1}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hızlı Git */}
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <Icon id="zap" size={14} color={G.gold}/>
                <p style={{fontFamily:G.fontDisp,fontSize:14,letterSpacing:"0.12em",color:G.gold}}>HIZLI GİT</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[{href:"/kesfet",icon:"compass",label:"Keşfet"},{href:"/topluluk",icon:"users",label:"Topluluk"},{href:"/uret",icon:"film",label:"Senaryo Üret"},{href:"/mesajlar",icon:"chat",label:"Mesajlar"}].map(item=>(
                  <a key={item.href} href={item.href}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"13px 14px",borderRadius:14,background:G.card,border:`1px solid ${G.border}`,transition:"all 0.2s",position:"relative"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=G.borderHov;e.currentTarget.style.boxShadow=G.glow;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.boxShadow="none";}}>
                    <FilmCorners color={G.goldD} size={7}/>
                    <Icon id={item.icon} size={16} color={G.gold}/>
                    <span style={{fontSize:12,fontWeight:600,color:G.text}}>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ):(
          /* ── SONUÇLAR ── */
          <div>
            {/* Tab bar */}
            <div style={{display:"flex",borderBottom:`1px solid ${G.border}`,background:"rgba(8,8,8,0.5)",overflowX:"auto",scrollbarWidth:"none"}}>
              {TABS.map(t=>{
                var sayi=t.id==="hepsi"?toplamSonuc:sonuclar[t.id]?.length||0;
                var isActive=tab===t.id;
                return(
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{flexShrink:0,padding:"12px 16px",background:"none",border:"none",borderBottom:`2px solid ${isActive?G.gold:"transparent"}`,color:isActive?G.gold:G.textMuted,fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",marginBottom:-1,display:"flex",alignItems:"center",gap:5,letterSpacing:"0.02em",transition:"all 0.2s"}}>
                    {t.label}
                    {sayi>0&&<span style={{fontSize:10,fontWeight:800,padding:"1px 6px",borderRadius:10,background:isActive?`${G.gold}15`:"rgba(245,240,232,0.05)",color:isActive?G.gold:G.textDim}}>{sayi}</span>}
                  </button>
                );
              })}
            </div>

            {toplamSonuc===0?(
              <div style={{textAlign:"center",padding:"70px 20px",animation:"fadeUp 0.4s ease"}}>
                <div style={{fontFamily:G.fontDisp,fontSize:52,color:G.textDim,letterSpacing:"0.1em",marginBottom:12}}>SONUÇ YOK</div>
                <p style={{fontSize:13,color:G.textMuted}}>"{ara}" için eşleşme bulunamadı</p>
              </div>
            ):(
              <div style={{padding:"4px 0"}}>

                {/* KULLANICILAR */}
                {gosterKullanici&&sonuclar.kullanici.length>0&&(
                  <div>
                    {tab==="hepsi"&&<p style={{fontFamily:G.fontDisp,fontSize:12,letterSpacing:"0.12em",color:G.textDim,padding:"14px 20px 8px"}}>KULLANICILAR</p>}
                    {sonuclar.kullanici.map((u,i)=>(
                      <a key={u.id} href={`/@${u.username}`} className="ara-satir" style={{display:"flex",alignItems:"center",gap:13,padding:"12px 20px",borderBottom:`1px solid ${G.border}`,background:"transparent",animation:`fadeUp 0.25s ${i*0.04}s both ease`,textDecoration:"none"}}>
                        <Av url={u.avatar_url} size={46}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <p style={{fontSize:14,fontWeight:700,color:G.text}}>@{u.username}</p>
                            {u.dogrulandi&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:20,background:`${G.gold}15`,color:G.gold,fontWeight:800}}>✓</span>}
                          </div>
                          {u.bio&&<p style={{fontSize:12,color:G.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:2}}>{u.bio}</p>}
                        </div>
                        <button style={{flexShrink:0,padding:"6px 14px",borderRadius:20,background:`${G.gold}10`,border:`1px solid ${G.gold}25`,color:G.gold,fontSize:11,fontWeight:700,cursor:"pointer"}}>Takip</button>
                      </a>
                    ))}
                  </div>
                )}

                {/* SENARYOLAR */}
                {gosterSenaryo&&sonuclar.senaryo.length>0&&(
                  <div>
                    {tab==="hepsi"&&<p style={{fontFamily:G.fontDisp,fontSize:12,letterSpacing:"0.12em",color:G.textDim,padding:"14px 20px 8px"}}>SENARYOLAR</p>}
                    {sonuclar.senaryo.map((s,i)=>{
                      var turRenk=TURLER_RENK[s.tur]||G.gold;
                      return(
                        <a key={s.id} href={`/senaryo/${s.id}`} className="ara-satir" style={{display:"flex",alignItems:"center",gap:13,padding:"12px 20px",borderBottom:`1px solid ${G.border}`,background:"transparent",animation:`fadeUp 0.25s ${i*0.04}s both ease`,textDecoration:"none"}}>
                          <div style={{width:46,height:46,borderRadius:12,background:`${turRenk}12`,border:`1px solid ${turRenk}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <Icon id="film" size={20} color={turRenk}/>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <p style={{fontSize:13,fontWeight:700,color:G.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.baslik}</p>
                            <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                              <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:`${G.gold}10`,color:G.gold,border:`1px solid ${G.gold}20`}}>{s.tip}</span>
                              <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,background:`${turRenk}10`,color:turRenk,border:`1px solid ${turRenk}20`}}>{s.tur}</span>
                              <span style={{fontSize:11,color:G.textDim}}>@{s.profiles?.username}</span>
                            </div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                            <Icon id="heart" size={11} color={G.red}/>
                            <span style={{fontSize:11,color:G.textMuted}}>{s.begeni_sayisi||0}</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}

                {/* GÖNDERİLER */}
                {gosterGonderi&&sonuclar.gonderi.length>0&&(
                  <div>
                    {tab==="hepsi"&&<p style={{fontFamily:G.fontDisp,fontSize:12,letterSpacing:"0.12em",color:G.textDim,padding:"14px 20px 8px"}}>GÖNDERİLER</p>}
                    {sonuclar.gonderi.map((g,i)=>(
                      <div key={g.id} className="ara-satir" style={{display:"flex",gap:12,padding:"12px 20px",borderBottom:`1px solid ${G.border}`,animation:`fadeUp 0.25s ${i*0.04}s both ease`}}>
                        <Av url={g.profiles?.avatar_url} size={38}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
                            <span style={{fontSize:13,fontWeight:700,color:G.text}}>@{g.profiles?.username||"anonim"}</span>
                            <span style={{fontSize:10,color:G.textDim}}>· {zaman(g.created_at)}</span>
                          </div>
                          <p style={{fontSize:13,color:G.textMuted,lineHeight:1.55,wordBreak:"break-word"}}>{g.metin?.slice(0,140)}{g.metin?.length>140?"...":""}</p>
                          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:6}}>
                            <Icon id="heart" size={11} color={G.red}/>
                            <span style={{fontSize:11,color:G.textDim}}>{g.begeni_sayisi||0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AltNav/>
    </div>
  );
}
