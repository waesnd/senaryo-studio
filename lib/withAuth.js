// lib/withAuth.js
// Tüm API route'larda kullanılacak auth middleware
// Kullanım: export default withAuth(handler)
// veya:     export default withAuth(handler, { requireAuth: false }) — opsiyonel auth

import { createClient } from "@supabase/supabase-js";

// Rate limiting için basit in-memory store (serverless'ta her instance ayrı — üretimde Redis kullan)
var rateLimitMap = new Map();
var RATE_LIMIT    = 20;  // max istek
var RATE_WINDOW   = 60 * 1000; // 1 dakika (ms)

function checkRateLimit(key){
  var now    = Date.now();
  var record = rateLimitMap.get(key);

  if(!record || now - record.start > RATE_WINDOW){
    rateLimitMap.set(key, { count: 1, start: now });
    return true;
  }

  if(record.count >= RATE_LIMIT){
    return false; // limit aşıldı
  }

  record.count++;
  return true;
}

// Küçük map temizliği — memory leak önlemi
setInterval(()=>{
  var now = Date.now();
  for(var [key, val] of rateLimitMap){
    if(now - val.start > RATE_WINDOW * 2) rateLimitMap.delete(key);
  }
}, RATE_WINDOW * 5);


export function withAuth(handler, options = {}){
  var { requireAuth = true } = options;

  return async function(req, res){

    // 1. Method kontrolü gerekiyorsa handler içinde yapılır — burada sadece auth

    // 2. Rate limiting — IP veya user bazlı
    var ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
          || req.socket?.remoteAddress
          || "unknown";

    if(!checkRateLimit(ip)){
      return res.status(429).json({
        error: "Çok fazla istek. Lütfen 1 dakika bekleyin.",
        code:  "RATE_LIMIT_EXCEEDED"
      });
    }

    // 3. Auth token kontrolü
    var token = req.headers.authorization?.replace("Bearer ", "")?.trim();

    // requireAuth=false ise ve token yoksa — geç
    if(!requireAuth && !token){
      req.user = null;
      return handler(req, res);
    }

    // requireAuth=true ise ve token yoksa — reddet
    if(requireAuth && !token){
      return res.status(401).json({
        error: "Giriş yapmanız gerekiyor.",
        code:  "UNAUTHORIZED"
      });
    }

    // 4. Token'ı Supabase ile doğrula
    if(token){
      try{
        var supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          { global: { headers: { Authorization: "Bearer " + token } } }
        );

        var { data: { user }, error } = await supabase.auth.getUser(token);

        if(error || !user){
          if(requireAuth){
            return res.status(401).json({
              error: "Geçersiz veya süresi dolmuş oturum.",
              code:  "INVALID_TOKEN"
            });
          }
          req.user = null;
        }else{
          req.user    = user;
          req.supabase = supabase; // handler içinde kullanabilmek için
        }
      }catch(e){
        console.error("[withAuth] token doğrulama hatası:", e.message);
        if(requireAuth){
          return res.status(500).json({ error: "Auth servisi hatası." });
        }
        req.user = null;
      }
    }

    // 5. Handler'a geç
    return handler(req, res);
  };
}

// Kolaylık: sadece rate limit, auth olmadan
export function withRateLimit(handler){
  return withAuth(handler, { requireAuth: false });
}
