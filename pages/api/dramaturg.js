export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  var { senaryo, tip, tur } = req.body;

  var prompt = `Sen deneyimli bir dramaturg ve senaryo editörüsün. Aşağıdaki senaryoyu analiz et. Türk televizyon sektörüne özel değerlendirme yap.

Senaryo: ${senaryo.baslik} (${tur} ${tip})
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış: ${senaryo.acilis_sahnesi}
Büyük Soru: ${senaryo.buyuk_soru}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"genel_puan":75,"guc_noktalari":["madde1","madde2","madde3"],"zayif_noktalar":["madde1","madde2"],"turk_dizi_uyumu":"...","gerilim_analizi":"...","karakter_motivasyon":"...","oneri_1":"...","oneri_2":"...","oneri_3":"...","sonuc":"..."}`;

  try {
    var response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.GROQ_API_KEY },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.75 }),
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
