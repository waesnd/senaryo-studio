export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  
  const { tip, tur, ozelIstek } = req.body;
  
  const prompt = `Sen bir senaryo danışmanısın. Yaratıcı ve özgün bir ${tip.toLowerCase()} konusu üret. Tür: ${tur}.${ozelIstek ? " Özel istek: " + ozelIstek : ""} 

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma, markdown kullanma:
{"baslik":"başlık","tagline":"etkileyici slogan","ana_fikir":"2-3 cümle özet","karakter":"ana karakterlerin kısa tanıtımı","sahne":"açılış sahnesi tasviri","soru":"izleyiciyi merak ettiren ana soru"}`;

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
    
    // senaryo objesi olarak dön — uret.js data.senaryo bekliyor
    res.status(200).json({ senaryo: parsed });
    
  } catch (e) {
    console.error("Generate hatası:", e.message);
    res.status(500).json({ error: e.message });
  }
}
