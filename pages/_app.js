import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function App({ Component, pageProps }) {
  var s1 = useState(false); var ready = s1[0]; var setReady = s1[1];

  useEffect(function() {
    supabase.auth.getSession().then(function() {
      setReady(true);
    });

    var sub = supabase.auth.onAuthStateChange(function(event, session) {
      // session değişince sayfayı bilgilendir
    });

    return function() {
      sub.data && sub.data.subscription && sub.data.subscription.unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: "3px solid rgba(232,35,10,0.2)",
          borderTopColor: "#e8230a",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <Component {...pageProps} />;
}
