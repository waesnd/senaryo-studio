import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "./supabase";

export var AuthContext = createContext({ user: null, profil: null, authHazir: false, setProfil: ()=>{}, okunmayanBildirim: 0 });
export function useAuth(){ return useContext(AuthContext); }

export function AuthProvider({ children }){
  var [user, setUser]               = useState(null);
  var [profil, setProfil]           = useState(null);
  var [authHazir, setAuthHazir]     = useState(false);
  var [okunmayanBildirim, setOkunmayanBildirim] = useState(0);

  useEffect(()=>{
    var mounted = true;

    // İlk session kontrolü
    supabase.auth.getSession().then(({ data, error })=>{
      if(!mounted) return;
      if(error){
        console.error("[useAuth] getSession hatası:", error.message);
        setAuthHazir(true);
        return;
      }
      var u = data?.session?.user || null;
      setUser(u);
      if(u) loadProfil(u, mounted);
      else   setAuthHazir(true);
    });

    // Auth değişikliklerini dinle
    var { data: { subscription } } = supabase.auth.onAuthStateChange((event, session)=>{
      // Sessiz event'leri atla — gereksiz re-render engeli
      if(event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;
      if(!mounted) return;

      var u = session?.user || null;
      setUser(prev => {
        if(prev?.id === u?.id) return prev; // aynı kullanıcı — state değiştirme
        if(u) loadProfil(u, mounted);
        else { setProfil(null); setAuthHazir(true); }
        return u;
      });
    });

    var bildirimKanal;
    // loadProfil'den dönen kanalı sakla
    var origLoadProfil = loadProfil;

    return ()=>{
      mounted = false;
      subscription?.unsubscribe();
      if(bildirimKanal) supabase.removeChannel(bildirimKanal);
    };
  },[]);

  function loadProfil(u, mounted){
    // Her çağrı için benzersiz id — geç gelen eski response state'i ezmesin
    var requestId = Date.now();
    loadProfil._lastId = requestId;

    supabase.from("profiles")
      .select("*")
      .eq("id", u.id)
      .single()
      .then(({ data, error })=>{
        if(!mounted) return;
        if(loadProfil._lastId !== requestId) return; // Eski istek — yoksay
        if(error && error.code !== "PGRST116"){
          console.error("[useAuth] profil yüklenemedi:", error.message);
        }
        if(data) setProfil(data);
        setAuthHazir(true);
      });
  }

  return(
    <AuthContext.Provider value={{ user, profil, authHazir, setProfil, okunmayanBildirim, setOkunmayanBildirim }}>
      {children}
    </AuthContext.Provider>
  );
}
