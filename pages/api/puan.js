import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";

function sendError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function sanitizeText(value, maxLength = 4000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function clampNumber(value, min, max, fallback) {
  var parsed = typeof value === "number" ? value : parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function normalizeResult(result) {
  const safe = result && typeof result === "object" && !Array.isArray(result) ? result : {};
  safe.orijinallik = clampNumber(safe.orijinallik, 0, 25, 0);
  safe.ticari_potansiyel = clampNumber(safe.ticari_potansiyel, 0, 25, 0);
  safe.karakter_derinligi = clampNumber(safe.karakter_derinligi, 0, 25, 0);
  safe.anlatim = clampNumber(safe.anlatim, 0, 25, 0);
  safe.toplam = safe.orijinallik + safe.ticari_potansiyel + safe.karakter_derinligi + safe.anlatim;
  if (typeof safe.netflix_uygun_mu === "string") safe.netflix_uygun_mu = safe.netflix_uygun_mu === "true";
  if (typeof safe.netflix_uygun_mu !== "boolean") safe.netflix_uygun_mu = false;
  if (!Array.isArray(safe.benzer_yapimlar)) safe.benzer_yapimlar = [];
  ["imdb_tahmin","hedef_kitle","yayin_platformu","yapimci_yorumu"].forEach((key)=>{
    if (typeof safe[key] !== "string") safe[key] = safe[key] ? String(safe[key]) : "";
  });
  return safe;
}

async function handler(req, res) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");

  var senaryo = req.body?.senaryo;
  var tip = sanitizeText(req.body?.tip, 100);
  var tur = sanitizeText(req.body?.tur, 100);
  if (!senaryo || typeof senaryo !== "object") return sendError(res, 400, "senaryo zorunlu", "VALIDATION_ERROR");

  var yapimcilar = [
    {isim:"Ay Yapım tarzı yapımcı", ticari_agirlik:true},
    {isim:"Netflix Türkiye içerik alıcısı", ticari_agirlik:false},
    {isim:"bağımsız sinema yapımcısı", ticari_agirlik:false},
    {isim:"Disney+ Türkiye editörü", ticari_agirlik:false},
    {isim:"BluTV içerik direktörü", ticari_agirlik:true},
  ];
  var y = yapimcilar[Math.floor(Math.random()*yapimcilar.length)];

  var prompt = `Sen bir ${y.isim} olarak bu senaryoyu değerlendiriyorsun. Gerçekçi, tarafsız ve bu senaryonun gerçek kalitesini yansıtan puanlar ver. Ortalama bir senaryo 55-65 alır, iyi bir senaryo 70-80, olağanüstü bir senaryo 85+.

Senaryo: ${sanitizeText(senaryo.baslik, 300)} (${tur} — ${tip})
Tagline: ${sanitizeText(senaryo.tagline || "—", 500)}
Ana Fikir: ${sanitizeText(senaryo.ana_fikir, 2500)}
Karakterler: ${sanitizeText(senaryo.karakter, 2500)}
Açılış Sahnesi: ${sanitizeText(senaryo.acilis_sahnesi, 2500)}
Büyük Soru: ${sanitizeText(senaryo.buyuk_soru, 800)}

Puanlama (her biri max 25, toplam 100):
- Orijinallik: Bu hikaye daha önce anlatılmış mı? Ne kadar özgün?
- Ticari Potansiyel: ${y.ticari_agirlik?"İzleyici ve reklam potansiyeli kritik.":"Sanatsal değer ön planda."}
- Karakter Derinliği: Karakterler gerçekçi ve ilgi çekici mi?
- Anlatım: Yapı, tempo ve dramatik akış ne kadar güçlü?

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "toplam": <gerçekçi toplam 40-95 arası>,
  "orijinallik": <0-25>,
  "ticari_potansiyel": <0-25>,
  "karakter_derinligi": <0-25>,
  "anlatim": <0-25>,
  "imdb_tahmin": "<bu senaryonun gerçekçi IMDb tahmini 5.0-9.0 arası>",
  "netflix_uygun_mu": <true/false — gerçekçi değerlendir>,
  "hedef_kitle": "Yaş aralığı, platform, izleyici profili — bu senaryoya özgü",
  "benzer_yapimlar": ["Bu senaryoya gerçekten benzeyen yapım 1", "yapım 2", "yapım 3"],
  "yayin_platformu": "Bu senaryo için en uygun platform ve neden",
  "yapimci_yorumu": "${y.isim} olarak bu senaryoya dair 2-3 cümle özgün yorum"
}`;

  try {
    var sonuc = await callGroq(prompt, {
      temperature: 0.85,
      max_tokens: 1024,
      systemPrompt: "Sadece geçerli JSON üret. Markdown ve açıklama yazma.",
    });
    return res.status(200).json(normalizeResult(sonuc));
  } catch (e) {
    console.error("[puan]", e);
    return sendError(res, 500, "Yapımcı puanı oluşturulamadı.", "PUAN_FAILED");
  }
}

export default withAuth(handler);
