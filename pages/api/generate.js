export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { tip, tur } = req.body;
  const prompt = `Sen bir senaryo danışmanısın. Kısa ve çarpıcı bir ${tip.toLowerCase()} konusu üret. Tür: ${tur}. SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma: {"baslik":"başlık","tagline":"tagline","ana_fikir":"ana fikir","karakter":"karakter","sahne":"sahne","soru":"soru"}`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9 }
        }),
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSON bulunamadı");
    const parsed = JSON.parse(match[0]);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
