import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function App({ Component, pageProps }) {
  useEffect(function() {
    supabase.auth.getSession();
  }, []);

  return <Component {...pageProps} />;
}
