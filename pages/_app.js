import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// SW kaydı
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(reg => {
      // Push notification izni iste (sessizce)
      if ("Notification" in window && Notification.permission === "default") {
        // Kullanıcı giriş yaptıktan 3sn sonra sor
        setTimeout(() => {
          Notification.requestPermission().then(perm => {
            if (perm === "granted") {
              reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: null,
              }).catch(() => {});
            }
          });
        }, 3000);
      }
    });
  });
}

// Karanlık mod: telefon ayarına göre otomatik (localStorage yoksa)
function getInitialTema() {
  if (typeof window === "undefined") return "light";
  try {
    var stored = localStorage.getItem("sf_tema");
    if (stored) return stored;
  } catch (e) {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App({ Component, pageProps }) {
  var router = useRouter();
  var [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Sistem teması değişince güncelle (sadece localStorage'da set edilmemişse)
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onSystemTema(e) {
      try {
        if (!localStorage.getItem("sf_tema")) {
          // Sayfalar kendi tema state'ini useEffect'te okur, sadece event yayınlıyoruz
          window.dispatchEvent(new CustomEvent("sf_tema_change", { detail: e.matches ? "dark" : "light" }));
        }
      } catch (err) {}
    }
    mq.addEventListener("change", onSystemTema);

    // Sayfa geçiş animasyonu
    function onStart() { setOpacity(0.4); }
    function onDone() { setOpacity(1); }
    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onDone);
    router.events.on("routeChangeError", onDone);

    return () => {
      mq.removeEventListener("change", onSystemTema);
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onDone);
      router.events.off("routeChangeError", onDone);
    };
  }, [router]);

  return (
    <div style={{ opacity, transition: "opacity 0.15s ease", minHeight: "100vh" }}>
      <Component {...pageProps} />
    </div>
  );
}

export { getInitialTema };
