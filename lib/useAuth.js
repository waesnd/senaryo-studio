import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { supabase } from "./supabase";

const defaultContext = {
  user: null,
  profil: null,
  authHazir: false,
  setProfil: () => {},
  okunmayanBildirim: 0,
  setOkunmayanBildirim: () => {},
  profilYenile: async () => {},
};

export const AuthContext = createContext(defaultContext);

export function useAuth() {
  return useContext(AuthContext);
}

function fallbackProfile(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.email ? user.email.split("@")[0] : "",
    nickname: user.user_metadata?.full_name || "",
    avatar_url: user.user_metadata?.avatar_url || null,
    dogrulandi: false,
    senaryo_sayisi: 0,
    takipci_sayisi: 0,
    takip_sayisi: 0,
    bio: "",
    website: "",
    banner_url: null,
  };
}

function withTimeout(promise, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("PROFILE_FETCH_TIMEOUT")), ms)
    ),
  ]);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profil, setProfil] = useState(null);
  const [authHazir, setAuthHazir] = useState(false);
  const [okunmayanBildirim, setOkunmayanBildirim] = useState(0);

  const profilYukle = useCallback(async (activeUser) => {
    if (!activeUser?.id) {
      setProfil(null);
      return null;
    }

    try {
      const query = supabase
        .from("profiles")
        .select("*")
        .eq("id", activeUser.id)
        .maybeSingle();

      const { data, error } = await withTimeout(query, 5000);

      if (error && error.code !== "PGRST116") {
        console.error("[useAuth] profil yüklenemedi:", error.message);
        const fb = fallbackProfile(activeUser);
        setProfil(fb);
        return fb;
      }

      if (data) {
        setProfil(data);
        return data;
      }

      const fb = fallbackProfile(activeUser);
      setProfil(fb);
      return fb;
    } catch (err) {
      console.error("[useAuth] profil fetch timeout/hata:", err?.message || err);
      const fb = fallbackProfile(activeUser);
      setProfil(fb);
      return fb;
    }
  }, []);

  const profilYenile = useCallback(async () => {
    if (!user?.id) return null;
    return await profilYukle(user);
  }, [user, profilYukle]);

  useEffect(() => {
    let isActive = true;

    async function initAuth() {
      if (!supabase) {
        if (isActive) {
          setUser(null);
          setProfil(null);
          setAuthHazir(true);
        }
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isActive) return;

        if (error) {
          console.error("[useAuth] getSession hatası:", error.message);
          setAuthHazir(true);
          return;
        }

        const mevcutUser = data?.session?.user || null;
        setUser(mevcutUser);

        // Uygulamayı profile bağlı bloke etme
        setAuthHazir(true);

        if (mevcutUser?.id) {
          profilYukle(mevcutUser);
        } else {
          setProfil(null);
        }
      } catch (err) {
        if (isActive) {
          console.error("[useAuth] initAuth beklenmeyen hata:", err);
          setAuthHazir(true);
        }
      }
    }

    initAuth();

    if (!supabase) {
      return () => {
        isActive = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isActive) return;
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;

      const yeniUser = session?.user || null;
      setUser(yeniUser);

      // Yine auth akışını profile bağlama
      setAuthHazir(true);

      if (yeniUser?.id) {
        profilYukle(yeniUser);
      } else {
        setProfil(null);
        setOkunmayanBildirim(0);
      }
    });

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, [profilYukle]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profil,
        authHazir,
        setProfil,
        okunmayanBildirim,
        setOkunmayanBildirim,
        profilYenile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
