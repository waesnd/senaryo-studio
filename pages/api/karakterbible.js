export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  var { senaryo, tur } = req.body;

  var prompt = `Sen Türk bir karakter yazarısın. Aşağıdaki senaryodaki ana karakterler için detaylı Character Bible oluştur. Maksimum 3 karakter için profil yaz. Karakter isimleri zaten Türkçe olmalı, yabancı isim kullanma.

Senaryo: ${senaryo.baslik}
Karakterler: ${senaryo.karakter}
Ana Fikir: ${senaryo.ana_fikir}
Tür: ${tur}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"karakterler":[{"ad":"","yas":"","meslek":"","hedef":"","korku":"","sir":"","guc":"","zayiflik":"","arc":"","diyalog_tonu":""}]}`;

  try {
    var response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.GROQ_API_KEY },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.85 }),
    });
    var data = await response.json();
    var text = data.choices?.[0]?.message?.content || "";
    var match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSON bulunamadı");
    res.status(200).json(JSON.parse(match[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
