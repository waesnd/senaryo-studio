// pages/api/generate.js
import { withAuth } from "../../lib/withAuth";
import { callGroq }  from "../../lib/groq";
import { createClient } from "@supabase/supabase-js";

var GUNLUK_LIMIT = 50; // 24 saatte max üretim sayısı

async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  var {tip, tur, ozelIstek, sahneSayisi, karakterSayisi} = req.body;
  if(!tip || !tur) return res.status(400).json({error:"tip ve tur zorunlu"});

  var userId = req.user.id;

  // ── ABUSE KORUMASI ────────────────────────────────────────────────────────
  try{
    var supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Son 24 saatteki üretim sayısını kontrol et
    var sinir = new Date(Date.now() - 24*60*60*1000).toISOString();
    var { count } = await supabaseAdmin
      .from("kullanim_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("islem", "generate")
      .gte("created_at", sinir);

    if(count >= GUNLUK_LIMIT){
      return res.status(429).json({
        error: "Günlük üretim limitine ulaştınız.",
        code: "DAILY_LIMIT_EXCEEDED",
        limit: GUNLUK_LIMIT,
        kalan: 0,
        reset_at: new Date(Date.now() + 24*60*60*1000).toISOString(),
      });
    }

    // Kullanımı logla
    await supabaseAdmin.from("kullanim_log").insert({
      user_id: userId,
      islem: "generate",
      meta: { tip, tur },
    });

    // Kalan hakkı response'a ekle
    var kalan = GUNLUK_LIMIT - (count + 1);
    res.setHeader("X-Kalan-Uretim", String(kalan));
    res.setHeader("X-Uretim-Limit", String(GUNLUK_LIMIT));

  }catch(logErr){
    // Log tablosu yoksa veya hata varsa — engelleme, sadece logla
    console.error("[generate] kullanim_log hatası:", logErr.message);
  }
  // ─────────────────────────────────────────────────────────────────────────

  var temizIstek = ozelIstek || "";

  var prompt = `Sen Türkiye'nin en iyi senaryo yazarısın. ${tip} formatında, ${tur} türünde özgün ve çarpıcı bir senaryo fikri üret.

ZORUNLU KURALLAR:
- Tüm karakter isimleri MUTLAKA Türkçe/Türk ismi olmalı (Ayşe, Kemal, Zeynep, Tarık, Defne, Murat, Hira, Serdar, Leyla, Caner, Bora, Naz, Ece, Selim, Melis gibi)
- Mekanlar Türkiye'de geçsin (aksi belirtilmedikçe)
- Dil tamamen Türkçe, akıcı ve etkileyici olsun
- Karakterler psikolojik olarak derinlikli ve tutarlı olsun
- Açılış sahnesi seyirciyi anında içine çekecek güçte olsun
- Tagline akılda kalıcı, film postere yazılabilecek nitelikte olsun
- Ana fikir somut çatışma ve dramatik gerilim içersin
${sahneSayisi ? `\nSahne sayısı: yaklaşık ${sahneSayisi} sahne olsun` : ""}
${karakterSayisi ? `Karakter sayısı: tam olarak ${karakterSayisi} ana karakter olsun` : ""}
${temizIstek ? `Kullanıcının özel isteği (kesinlikle uygula): ${temizIstek}\nÖNEMLİ: Özel istekte gerçek kişi adları varsa, bunları kurgusal karakter isimleri olarak kullan.` : ""}

SADECE aşağıdaki JSON formatında yanıt ver, hiçbir açıklama veya markdown ekleme:
{
  "baslik": "Güçlü ve akılda kalıcı Türkçe başlık",
  "tagline": "Tek cümlelik çarpıcı tagline — film posterinde duracak güçte",
  "ana_fikir": "3-4 paragraf: hikayenin özeti, ana çatışma, tematik derinlik, duygusal yolculuk",
  "karakter": "Ana karakterler — her biri Türkçe isimle, mesleği, kısa psikolojik profili (2-3 cümle her karakter)",
  "acilis_sahnesi": "Seyirciyi ekrana yapıştıracak güçlü açılış sahnesi — ayrıntılı, sinematik, duygusal",
  "buyuk_soru": "Seyirciyi 8 bölüm/2 saat ekranda tutacak temel dramatik soru"
}`;

  try{
    var parsed = await callGroq(prompt, { temperature: 0.92, max_tokens: 2048 });
    var required = ["baslik","tagline","ana_fikir","karakter","acilis_sahnesi","buyuk_soru"];
    for(var field of required){
      if(!parsed[field]) parsed[field] = "";
    }
    res.status(200).json({ senaryo: parsed });
  }catch(e){
    console.error("[generate]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
