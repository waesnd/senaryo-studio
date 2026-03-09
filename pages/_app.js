import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  var router = useRouter();
  var [display, setDisplay] = useState(true);
  var [opacity, setOpacity] = useState(1);

  useEffect(function () {
    function handleStart() {
      setOpacity(0);
      setTimeout(function () { setDisplay(false); }, 180);
    }
    function handleDone() {
      setDisplay(true);
      setTimeout(function () { setOpacity(1); }, 20);
    }
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
    <div style={{ opacity: opacity, transition: "opacity 0.18s ease", minHeight: "100vh" }}>
      {display && <Component {...pageProps} />}
    </div>
  );
}
