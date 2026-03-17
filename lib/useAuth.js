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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profil, setProfil] = useState(null);
  const [authHazir, setAuthHazir] = useState(false);
  const [okunmayanBildirim, setOkunmayanBildirim] = useState(0);

  const profilYukle = useCallback(async (userId) => {
    if (!userId) {
      setProfil(null);
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("[useAuth] profil yüklenemedi:", error.message);
      return null;
    }

    setProfil(data || null);
    return data || null;
  }, []);

  const profilYenile = useCallback(async () => {
    if (!user?.id) return null;
    return await profilYukle(user.id);
  }, [user, profilYukle]);

  useEffect(() => {
    let isActive = true;

    async function initAuth() {
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

        if (mevcutUser?.id) {
          await profilYukle(mevcutUser.id);
        } else {
          setProfil(null);
        }
      } catch (err) {
        if (isActive) {
          console.error("[useAuth] initAuth beklenmeyen hata:", err);
        }
      } finally {
        if (isActive) {
          setAuthHazir(true);
        }
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isActive) return;
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;

      const yeniUser = session?.user || null;
      setUser(yeniUser);

      if (yeniUser?.id) {
        await profilYukle(yeniUser.id);
      } else {
        setProfil(null);
        setOkunmayanBildirim(0);
      }

      setAuthHazir(true);
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
