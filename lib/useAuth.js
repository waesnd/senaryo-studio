import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "./supabase";

export var AuthContext = createContext({ user: null, profil: null, authHazir: false });
export function useAuth(){ return useContext(AuthContext); }

export function AuthProvider({ children }){
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [authHazir, setAuthHazir] = useState(false);

  useEffect(()=>{
    var mounted = true;

    supabase.auth.getSession().then(({ data })=>{
      if(!mounted) return;
      var u = data?.session?.user || null;
      setUser(u);
      if(u) loadProfil(u);
      else setAuthHazir(true);
    });

    var { data: { subscription } } = supabase.auth.onAuthStateChange((event, session)=>{
      // Sessiz event'leri atla
      if(event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;
      if(!mounted) return;
      var u = session?.user || null;
      setUser(prev => {
        if(prev?.id === u?.id) return prev; // aynı kullanıcı — re-render yok
        if(u) loadProfil(u);
        else { setProfil(null); setAuthHazir(true); }
        return u;
      });
    });

    return ()=>{ mounted = false; subscription?.unsubscribe(); };
  },[]);

  function loadProfil(u){
    supabase.from("profiles").select("*").eq("id", u.id).single()
      .then(({ data })=>{ if(data) setProfil(data); setAuthHazir(true); });
  }

  return(
    <AuthContext.Provider value={{ user, profil, authHazir, setProfil }}>
      {children}
    </AuthContext.Provider>
  );
}
