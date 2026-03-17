import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";

function sendError(res, status, error, code) {
  return res.status(status).json({ error, code });
}

function sanitizeText(value, maxLength = 4000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeResult(result) {
  const safe = result && typeof result === "object" && !Array.isArray(result) ? result : {};
  ["one_liner","problem","cozum","hedef_kitle","rekabet","neden_simdi","vizyon","cagri"].forEach((key)=>{
    if (typeof safe[key] !== "string") safe[key] = safe[key] ? String(safe[key]) : "";
  });
  return safe;
}

async function handler(req, res) {
  if (req.method !== "POST") return sendError(res, 405, "Method not allowed", "METHOD_NOT_ALLOWED");
  var senaryo = req.body?.senaryo;
  var tur = sanitizeText(req.body?.tur, 100);
  var tip = sanitizeText(req.body?.tip, 100);
  if (!senaryo || typeof senaryo !== "object") return sendError(res, 400, "senaryo zorunlu", "VALIDATION_ERROR");

  var prompt = `Sen Türkiye'nin en iyi yapımcılarına pitch sunan bir senaryo temsilcisisin. Aşağıdaki senaryo için profesyonel bir pitch deck içeriği oluştur.

Senaryo: ${sanitizeText(senaryo.baslik, 300)} (${tur} ${tip})
Tagline: ${sanitizeText(senaryo.tagline, 500)}
Ana Fikir: ${sanitizeText(senaryo.ana_fikir, 2500)}
Karakterler: ${sanitizeText(senaryo.karakter, 2500)}
Açılış: ${sanitizeText(senaryo.acilis_sahnesi, 2500)}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "one_liner":"Tek cümlelik en güçlü pitch",
  "problem":"Hangi insani sorunu ele alıyor",
  "cozum":"Senaryo bunu nasıl çözüyor",
  "hedef_kitle":"Hedef kitle ve platform önerisi",
  "rekabet":"Benzer yapımlar ve bu senaryonun farkı",
  "neden_simdi":"Bu hikaye neden şimdi anlatılmalı",
  "vizyon":"Franchise veya sezon genişleme potansiyeli",
  "cagri":"Yapımcıya yatırım çağrısı"
}`;

  try {
    var sonuc = await callGroq(prompt, {
      temperature: 0.75,
      max_tokens: 1500,
      systemPrompt: "Sadece geçerli JSON üret. Markdown ve açıklama yazma.",
    });
    return res.status(200).json(normalizeResult(sonuc));
  } catch (e) {
    console.error("[pitch]", e);
    return sendError(res, 500, "Pitch deck oluşturulamadı.", "PITCH_FAILED");
  }
}

export default withAuth(handler);
