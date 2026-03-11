export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  var { senaryo, tip, tur } = req.body;

  var prompt = `Sen bir film yapımcısı ve yatırımcısın. Bu senaryoyu değerlendir. Her kategori için gerçekçi puan ver.

Senaryo: ${senaryo.baslik} (${tur} ${tip})
Tagline: ${senaryo.tagline}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"toplam":75,"orijinallik":18,"ticari_potansiyel":20,"karakter_derinligi":17,"anlatim":20,"imdb_tahmin":"7.2","netflix_uygun_mu":true,"hedef_kitle":"...","benzer_yapimlar":["Film1","Film2","Film3"],"yapimci_yorumu":"..."}`;

  try {
    var response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.GROQ_API_KEY },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.7 }),
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
