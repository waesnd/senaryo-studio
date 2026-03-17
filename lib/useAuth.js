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
  authDebug: { step: "init", detail: "" },
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
  const [authDebug, setAuthDebug] = useState({ step: "init", detail: "provider başlatıldı" });

  const profilYukle = useCallback(async (userId) => {
    setAuthDebug({ step: "profil", detail: userId ? "profil yükleniyor" : "profil userId yok" });
    if (!userId) {
      setProfil(null);
      setAuthDebug({ step: "profil", detail: "userId olmadığı için profil boş" });
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("[useAuth] profil yüklenemedi:", error.message);
      setAuthDebug({ step: "profil-hata", detail: error.message || "profil yüklenemedi" });
      return null;
    }

    setProfil(data || null);
    setAuthDebug({ step: "profil-ok", detail: data ? "profil bulundu" : "profil kaydı yok" });
    return data || null;
  }, []);

  const profilYenile = useCallback(async () => {
    if (!user?.id) return null;
    return await profilYukle(user.id);
  }, [user, profilYukle]);

  useEffect(() => {
    let isActive = true;

    async function initAuth() {
      setAuthDebug({ step: "session", detail: "getSession çağrılıyor" });
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isActive) return;

        if (error) {
          console.error("[useAuth] getSession hatası:", error.message);
          setAuthDebug({ step: "session-hata", detail: error.message || "getSession hatası" });
          setAuthDebug((prev) => ({ ...prev, ready: true }));
          setAuthHazir(true);
          return;
        }

        const mevcutUser = data?.session?.user || null;
        setAuthDebug({ step: "session-ok", detail: mevcutUser?.id ? "session user bulundu" : "session boş" });
        setUser(mevcutUser);

        if (mevcutUser?.id) {
          await profilYukle(mevcutUser.id);
        } else {
          setProfil(null);
          setAuthDebug({ step: "session-ok", detail: "oturum yok" });
        }
      } catch (err) {
        if (isActive) {
          console.error("[useAuth] initAuth beklenmeyen hata:", err);
          setAuthDebug({ step: "init-hata", detail: err?.message || "beklenmeyen hata" });
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
      setAuthDebug({ step: "auth-event", detail: event || "auth olayı" });
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;

      const yeniUser = session?.user || null;
      setUser(yeniUser);

      if (yeniUser?.id) {
        setAuthDebug({ step: "auth-user", detail: "auth olayı sonrası profil yükleniyor" });
        await profilYukle(yeniUser.id);
      } else {
        setProfil(null);
        setOkunmayanBildirim(0);
        setAuthDebug({ step: "auth-user", detail: "auth olayı sonrası kullanıcı yok" });
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
        authDebug,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
