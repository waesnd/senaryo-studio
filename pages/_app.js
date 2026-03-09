import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// Service Worker kaydı
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker.register("/sw.js");
  });
}

export default function App({ Component, pageProps }) {
  var router = useRouter();
  var [opacity, setOpacity] = useState(1);

  useEffect(function () {
    function handleStart() { setOpacity(0.3); }
    function handleDone() { setOpacity(1); }
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleDone);
    router.events.on("routeChangeError", handleDone);
    return function () {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleDone);
      router.events.off("routeChangeError", handleDone);
    };
  }, [router]);

  return (
    <div style={{ opacity: opacity, transition: "opacity 0.15s ease", minHeight: "100vh" }}>
      <Component {...pageProps} />
    </div>
  );
}
