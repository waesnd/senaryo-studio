import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";

function sendError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function sanitizeText(value, maxLength = 4000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeResult(sonuc, perspektif) {
  var safe = sonuc && typeof sonuc === "object" && !Array.isArray(sonuc) ? sonuc : {};
  if (typeof safe.genel_puan === "string") safe.genel_puan = parseInt(safe.genel_puan, 10) || 70;
  if (!Array.isArray(safe.guc_noktalari)) safe.guc_noktalari = [];
  if (!Array.isArray(safe.zayif_noktalar)) safe.zayif_noktalar = [];
  if (!safe.perspektif) safe.perspektif = perspektif;
  ["turk_dizi_uyumu","gerilim_analizi","karakter_motivasyon","oneri_1","oneri_2","oneri_3","sonuc"].forEach((key)=>{
    if (typeof safe[key] !== "string") safe[key] = safe[key] ? String(safe[key]) : "";
  });
  return safe;
}

async function handler(req, res) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");

  var senaryo = req.body?.senaryo;
  var tip = sanitizeText(req.body?.tip, 100);
  var tur = sanitizeText(req.body?.tur, 100);

  if (!senaryo || typeof senaryo !== "object") {
    return sendError(res, 400, "senaryo zorunlu", "VALIDATION_ERROR");
  }

  var perspektifler = [
    "Bir Yeşilçam ustası",
    "Netflix Türkiye içerik direktörü",
    "Uluslararası festival jürisi üyesi",
    "TRT drama editörü",
    "Cannes ödüllü Fransız yapımcı",
  ];
  var perspektif = perspektifler[Math.floor(Math.random()*perspektifler.length)];

  var prompt = `Sen ${perspektif} gözüyle değerlendirme yapıyorsun. Aşağıdaki senaryoyu bu perspektiften, eleştirel ve özgün biçimde analiz et. Klişe yorumlardan kaçın, bu senaryoya özel tespitler yap.

Senaryo: ${sanitizeText(senaryo.baslik, 300)} (${tur} — ${tip})
Tagline: ${sanitizeText(senaryo.tagline, 500)}
Ana Fikir: ${sanitizeText(senaryo.ana_fikir, 2500)}
Karakterler: ${sanitizeText(senaryo.karakter, 2500)}
Açılış Sahnesi: ${sanitizeText(senaryo.acilis_sahnesi, 2500)}
Büyük Dramatik Soru: ${sanitizeText(senaryo.buyuk_soru, 800)}

Değerlendirirken şunlara bak:
- Bu spesifik senaryo için benzersiz güçlü yanlar neler?
- Hangi spesifik sahneler/karakterler sorunlu?
- ${tur} türüne özgü beklentiler karşılanıyor mu?
- Gerilim eğrisi nerede zirve yapıyor, nerede düşüyor?
- Puan 60-95 arasında olsun ve gerçekten bu senaryonun kalitesini yansıtsın.

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "genel_puan": <60-95 arası gerçekçi puan>,
  "perspektif": "${perspektif}",
  "guc_noktalari": ["bu senaryoya özgü güçlü yön 1", "güçlü yön 2", "güçlü yön 3"],
  "zayif_noktalar": ["bu senaryoya özgü zayıf nokta 1", "zayıf nokta 2"],
  "turk_dizi_uyumu": "Bu spesifik senaryonun Türk TV formatıyla uyumu — somut referanslarla",
  "gerilim_analizi": "Bu senaryonun gerilim eğrisi analizi — hangi beat'lerde ne oluyor",
  "karakter_motivasyon": "Bu senaryodaki karakterlerin motivasyon analizi — isim isim",
  "oneri_1": "Bu senaryoya özgü en kritik geliştirme önerisi",
  "oneri_2": "İkinci spesifik öneri",
  "oneri_3": "Üçüncü spesifik öneri",
  "sonuc": "Bu senaryoya özel final karar — 1-2 cümle"
}`;

  try {
    var sonuc = await callGroq(prompt, {
      temperature: 0.88,
      max_tokens: 1500,
      systemPrompt: "Sadece geçerli JSON üret. Markdown ve açıklama yazma.",
    });
    return res.status(200).json(normalizeResult(sonuc, perspektif));
  } catch (e) {
    console.error("[dramaturg]", e);
    return sendError(res, 500, "Dramaturg analizi oluşturulamadı.", "DRAMATURG_FAILED");
  }
}

export default withAuth(handler);
