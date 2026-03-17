// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

export default function AuthCallback(){
  var router = useRouter();

  useEffect(()=>{
    if(!router.isReady) return;

    async function run(){
      var code = router.query.code;

      if(code){
        // PKCE flow — code'u session'a çevir
        var { error } = await supabase.auth.exchangeCodeForSession(String(code));
        if(!error){
          router.replace("/");
        }else{
          console.error("[callback] hatası:", error.message);
          router.replace("/");
        }
      }else{
        // Implicit flow — direkt ana sayfaya
        router.replace("/");
      }
    }

    run();
  },[router.isReady, router.query.code]);

  return(
    <div style={{minHeight:"100vh",background:"#0A0F1E",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <div style={{width:36,height:36,border:"2px solid rgba(56,189,248,0.15)",borderTopColor:"#38BDF8",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <p style={{color:"rgba(241,245,249,0.4)",fontSize:13,fontFamily:"DM Sans,sans-serif",letterSpacing:"0.1em"}}>Giriş yapılıyor...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
