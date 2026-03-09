import { useState, useEffect } from "react";

export default function Home() {
  var [loaded, setLoaded] = useState(false);
  var [tema, setTema] = useState("light");

  useEffect(function () {
    try {
      var t = localStorage.getItem("sf_tema") || "light";
      setTema(t);
    } catch (e) {}
    setLoaded(true);
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", background: tema === "dark" ? "#111" : "#fff", minHeight: "100vh" }}>
      <h1 style={{ color: tema === "dark" ? "#fff" : "#000" }}>
        {loaded ? "✅ Yüklendi - tema: " + tema : "Yükleniyor..."}
      </h1>
      <button onClick={function () {
        var t = tema === "dark" ? "light" : "dark";
        setTema(t);
        localStorage.setItem("sf_tema", t);
      }}>Tema Değiştir</button>
    </div>
  );
}
