// pages/auth/callback.js
// Supabase OAuth callback — token işle, ana sayfaya yönlendir
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthCallback(){
  useEffect(()=>{
    supabase.auth.getSession().then(({ data })=>{
      if(data?.session){
        window.location.href = "/";
      }else{
        // Session yoksa hash'ten al (PKCE flow)
        supabase.auth.onAuthStateChange((event, session)=>{
          if(event === "SIGNED_IN" && session){
            window.location.href = "/";
          }
        });
      }
    });
  },[]);

  return(
    <div style={{minHeight:"100vh",background:"#0A0F1E",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,fontFamily:"DM Sans,sans-serif"}}>
      <div style={{width:36,height:36,border:"2px solid rgba(56,189,248,0.15)",borderTopColor:"#38BDF8",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <p style={{color:"rgba(241,245,249,0.4)",fontSize:13,letterSpacing:"0.1em"}}>Giriş yapılıyor...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
