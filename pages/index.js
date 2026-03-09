import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  var [loaded, setLoaded] = useState(false);
  var [user, setUser] = useState(null);

  useEffect(function () {
    setLoaded(true);
    supabase.auth.getSession().then(function (r) {
      if (r.data && r.data.session) {
        setUser(r.data.session.user);
      }
    });
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>{loaded ? "✅ Supabase bağlı" : "Yükleniyor..."}</h1>
      <p>{user ? "Giriş yapıldı: " + user.email : "Giriş yapılmadı"}</p>
    </div>
  );
}
