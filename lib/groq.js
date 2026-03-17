const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_TIMEOUT = 30000;

function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractJsonCandidate(text) {
  if (!text) return null;

  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  const direct = safeJsonParse(cleaned);
  if (direct !== null) return direct;

  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    const parsedObject = safeJsonParse(objectMatch[0]);
    if (parsedObject !== null) return parsedObject;
  }

  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    const parsedArray = safeJsonParse(arrayMatch[0]);
    if (parsedArray !== null) return parsedArray;
  }

  return null;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function callGroq(prompt, options = {}) {
  const {
    temperature = 0.8,
    max_tokens = 2048,
    raw = false,
    model = DEFAULT_MODEL,
    timeoutMs = DEFAULT_TIMEOUT,
    systemPrompt = "Verilen talimatlara tam uyan, tutarlı ve temiz çıktı üret.",
    retries = 1,
  } = options;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY env eksik");
  }

  const finalPrompt = sanitizeText(prompt);
  if (!finalPrompt) {
    throw new Error("Prompt boş olamaz");
  }

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        GROQ_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: finalPrompt },
            ],
            temperature,
            max_tokens,
          }),
        },
        timeoutMs
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `Groq API hatası: ${response.status} - ${errorText.slice(0, 300)}`
        );
      }

      const data = await response.json();
      const text = sanitizeText(data?.choices?.[0]?.message?.content || "");

      if (!text) {
        throw new Error("Groq boş yanıt döndürdü");
      }

      if (raw) {
        return text;
      }

      const parsed = extractJsonCandidate(text);
      if (parsed === null) {
        throw new Error(`Geçerli JSON bulunamadı. Model yanıtı: ${text.slice(0, 400)}`);
      }

      return parsed;
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === retries;
      if (isLastAttempt) break;

      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error("Groq isteği zaman aşımına uğradı");
  }

  throw lastError || new Error("Bilinmeyen Groq hatası");
}
