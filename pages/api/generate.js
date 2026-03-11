export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  var { tip, tur, ozelIstek } = req.body;

  var prompt = `Sen Türk bir senaryo yazarısın. ${tip} formatında, ${tur} türünde özgün bir senaryo fikri üret.

ÖNEMLİ KURALLAR:
- Tüm karakter isimleri MUTLAKA Türkçe/Türk ismi olmalı (örn: Ayşe, Kemal, Zeynep, Tarık, Defne, Murat, Hira, Serdar, Leyla, Caner)
- Mekanlar Türkiye'de olsun (aksi belirtilmedikçe)
- Dil tamamen Türkçe olsun, yazım hataları olmasın
- Karakterler gerçekçi ve derinlikli olsun
${ozelIstek ? `\nKullanıcının özel isteği: ${ozelIstek}` : ""}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "baslik": "Etkileyici Türkçe başlık",
  "tagline": "Tek cümlelik çarpıcı tagline",
  "ana_fikir": "2-3 paragraf detaylı ana fikir ve hikaye özeti",
  "karakter": "Ana karakterler — Türkçe isimlerle, her biri 1-2 cümle tanıtım",
  "acilis_sahnesi": "Güçlü açılış sahnesi detaylı anlatım",
  "buyuk_soru": "Seyirciyi ekrana bağlayacak büyük dramatik soru"
}`;

  try {
    var response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GROQ_API_KEY,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
      }),
    });
    var data = await response.json();
    var text = data.choices?.[0]?.message?.content || "";
    var match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("JSON bulunamadı");
    var parsed = JSON.parse(match[0]);
    res.status(200).json({ senaryo: parsed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
