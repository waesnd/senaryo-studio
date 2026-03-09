export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  
  const { concept, tip, tur } = req.body;
  
  const prompt = `Sen bir karakter analistisin. Şu ${tip} konusu için ana karakteri derinlemesine analiz et:
Başlık: ${concept.baslik}
Karakter: ${concept.karakter}
Ana Fikir: ${concept.ana_fikir}
Tür: ${tur}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma, markdown kullanma:
{"gecmis":"karakterin geçmişi ve kökeni 2-3 cümle","motivasyon":"karakterin temel motivasyonu 2-3 cümle","guclu":"güçlü yönleri 2-3 cümle","zayif":"zayıf yönleri ve çatışması 2-3 cümle","arc":"karakter yayı — hikaye boyunca nasıl değişecek 2-3 cümle"}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error("Groq yanıt vermedi: " + JSON.stringify(data));
    }

    const text = data.choices[0].message.content || "";
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) throw new Error("JSON bulunamadı: " + text);

    const parsed = JSON.parse(match[0]);

    // analiz objesi olarak dön
    res.status(200).json({ analiz: parsed });

  } catch (e) {
    console.error("Karakter hatası:", e.message);
    res.status(500).json({ error: e.message });
  }
}
