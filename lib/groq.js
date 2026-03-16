// lib/groq.js
// Tüm API route'larında ortak Groq çağrısı
// Kullanım:
//   import { callGroq } from "../../lib/groq";
//   var sonuc = await callGroq(prompt, { temperature: 0.8 });

const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Groq API'ye istek atar, JSON yanıtı parse edip döndürür.
 * @param {string} prompt       - Kullanıcıya gönderilecek prompt
 * @param {object} options      - Opsiyonel ayarlar
 * @param {number} options.temperature  - 0-1 arası (varsayılan: 0.8)
 * @param {number} options.max_tokens   - Maksimum token (varsayılan: 2048)
 * @param {boolean} options.raw         - true ise JSON parse etmeden düz metin döndür
 * @returns {object|string}     - Parse edilmiş JSON veya düz metin
 * @throws {Error}              - API hatası veya JSON parse hatası
 */
export async function callGroq(prompt, options = {}){
  var {
    temperature = 0.8,
    max_tokens  = 2048,
    raw         = false,
  } = options;

  var apiKey = process.env.GROQ_API_KEY;
  if(!apiKey) throw new Error("GROQ_API_KEY env eksik");

  // ── API isteği ────────────────────────────────────────────────────────────
  var res = await fetch(GROQ_URL, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      messages:    [{ role: "user", content: prompt }],
      temperature,
      max_tokens,
    }),
  });

  if(!res.ok){
    var errText = await res.text().catch(()=>"");
    throw new Error(`Groq API hatası: ${res.status} — ${errText.slice(0, 200)}`);
  }

  var data = await res.json();
  var text = data.choices?.[0]?.message?.content || "";

  // raw mod — düz metin döndür (diyalog güçlendirici gibi)
  if(raw) return text.trim();

  // ── JSON parse ───────────────────────────────────────────────────────────
  // Kod bloğu varsa temizle
  text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // JSON objesini ayıkla
  var match = text.match(/\{[\s\S]*\}/);
  if(!match){
    // Dizi formatı da olabilir
    var arrMatch = text.match(/\[[\s\S]*\]/);
    if(arrMatch) return JSON.parse(arrMatch[0]);
    throw new Error("Geçerli JSON bulunamadı. Model yanıtı: " + text.slice(0, 300));
  }

  return JSON.parse(match[0]);
}
