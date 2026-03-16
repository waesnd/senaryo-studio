// pages/api/medya-sil.js
import crypto from "crypto";
import { withAuth } from "../../lib/withAuth";

async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  var { public_id, url } = req.body;

  // URL'den public_id çıkar
  if(!public_id && url){
    try{
      var match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
      if(match) public_id = match[1];
    }catch(e){}
  }

  if(!public_id) return res.status(400).json({error:"public_id gerekli"});

  // ── OWNER KONTROLÜ ───────────────────────────────────────────────────────
  // public_id içinde user id'si olmalı (örn: "scriptify_avatars/user_id/filename")
  // ya da Supabase'den kontrol et
  var userId = req.user.id;

  // Cloudinary public_id'nin bu kullanıcıya ait olup olmadığını doğrula
  // Kural: public_id içinde userId geçmiyorsa reddet
  // (Cloudinary upload'da preset'e göre klasör yapısı: "scriptify_avatars/USER_ID/...")
  var isOwner = public_id.includes(userId);

  // Ek kontrol: Supabase'den profil avatar/banner URL'ini kontrol et
  if(!isOwner){
    try{
      var { data: profil } = await req.supabase
        .from("profiles")
        .select("avatar_url, banner_url")
        .eq("id", userId)
        .single();

      if(profil){
        var isAvatar = profil.avatar_url && profil.avatar_url.includes(public_id);
        var isBanner = profil.banner_url && profil.banner_url.includes(public_id);
        isOwner = isAvatar || isBanner;
      }
    }catch(e){
      console.error("[medya-sil] owner kontrolü hatası:", e.message);
    }
  }

  if(!isOwner){
    return res.status(403).json({
      error: "Bu medyayı silme yetkiniz yok.",
      code: "FORBIDDEN"
    });
  }
  // ─────────────────────────────────────────────────────────────────────────

  var cloud_name  = process.env.CLOUDINARY_CLOUD_NAME;
  var api_key     = process.env.CLOUDINARY_API_KEY;
  var api_secret  = process.env.CLOUDINARY_API_SECRET;

  if(!cloud_name || !api_key || !api_secret){
    return res.status(500).json({error:"Cloudinary env eksik"});
  }

  var timestamp = Math.round(Date.now() / 1000);
  var str       = "public_id=" + public_id + "&timestamp=" + timestamp + api_secret;
  var signature = crypto.createHash("sha1").update(str).digest("hex");

  try{
    var fd = new URLSearchParams();
    fd.append("public_id", public_id);
    fd.append("timestamp", String(timestamp));
    fd.append("api_key",   api_key);
    fd.append("signature", signature);

    var r    = await fetch("https://api.cloudinary.com/v1_1/" + cloud_name + "/image/destroy",{
      method:  "POST",
      headers: {"Content-Type":"application/x-www-form-urlencoded"},
      body:    fd.toString(),
    });
    var data = await r.json();
    return res.status(200).json({...data, public_id});
  }catch(e){
    console.error("[medya-sil] Cloudinary hatası:", e.message);
    return res.status(500).json({error: e.message});
  }
}

// withAuth zorunlu — giriş yapmayanlar erişemez
export default withAuth(handler);
