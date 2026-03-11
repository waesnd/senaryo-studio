export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  var { senaryo, tip, tur } = req.body;

  var prompt = `Sen profesyonel bir senaryo danışmanısın. Aşağıdaki senaryo için Blake Snyder'ın "Save the Cat" yöntemine göre 15 beat'i Türkçe olarak doldur. Her beat için 2-3 cümle yaz.

Senaryo: ${senaryo.baslik}
Tür: ${tur} ${tip}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış: ${senaryo.acilis_sahnesi}
Büyük Soru: ${senaryo.buyuk_soru}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"opening":"...","theme":"...","setup":"...","catalyst":"...","debate":"...","break1":"...","bstory":"...","fun":"...","midpoint":"...","badguys":"...","alllost":"...","soul":"...","break2":"...","finale":"...","closing":"..."}`;

  try {
    var response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.GROQ_API_KEY },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.8 }),
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
