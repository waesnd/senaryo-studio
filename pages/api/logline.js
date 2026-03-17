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
  ["logline1","logline2","logline3"].forEach((key)=>{
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

  var prompt = `Sen Hollywood'un en iyi logline yazarısın. Aşağıdaki senaryo için 3 farklı güçlü logline yaz. Her biri tek cümle, max 40 kelime, protagonist + hedef + engel yapısında, Türkçe.

Senaryo: ${sanitizeText(senaryo.baslik, 300)}
Tür: ${tur} ${tip}
Ana Fikir: ${sanitizeText(senaryo.ana_fikir, 2500)}
Karakterler: ${sanitizeText(senaryo.karakter, 2500)}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"logline1":"...","logline2":"...","logline3":"..."}`;

  try {
    var sonuc = await callGroq(prompt, {
      temperature: 0.8,
      max_tokens: 512,
      systemPrompt: "Sadece geçerli JSON üret. Markdown ve açıklama yazma.",
    });
    return res.status(200).json(normalizeResult(sonuc));
  } catch (e) {
    console.error("[logline]", e);
    return sendError(res, 500, "Logline oluşturulamadı.", "LOGLINE_FAILED");
  }
}

export default withAuth(handler);
