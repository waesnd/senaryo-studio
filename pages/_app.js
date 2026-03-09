import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function App({ Component, pageProps }) {
  var s = useState(false);
  var ready = s[0];
  var setReady = s[1];

  useEffect(function() {
    supabase.auth.getSession().then(function() {
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#f4f4f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif"
      }}>
        <div style={{
          textAlign: "center"
        }}>
          <div style={{
            width: 36,
            height: 36,
            border: "3px solid rgba(232,35,10,0.2)",
            borderTopColor: "#e8230a",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px"
          }} />
          <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
          <p style={{ fontSize: 13, color: "#999" }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} />;
}
