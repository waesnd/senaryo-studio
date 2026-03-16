// pages/api/puan.js
export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  var {senaryo, tip, tur} = req.body;
  if(!senaryo) return res.status(400).json({error:"senaryo zorunlu"});

  var prompt = `Sen Netflix Türkiye, Disney+ ve yerli yapımcı şirketler için senaryo değerlendirmesi yapan deneyimli bir yapımcı ve yatırımcısın. Bu senaryoyu gerçekçi ve tarafsız şekilde puanla.

Senaryo: ${senaryo.baslik} (${tur} — ${tip})
Tagline: ${senaryo.tagline || "—"}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış: ${senaryo.acilis_sahnesi}

Puanlama kriterleri (her biri max 25 puan, toplam 100):
- Orijinallik: Özgünlük, yenilikçilik, klişelerden uzaklık
- Ticari Potansiyel: Gişe/izleyici çekme gücü, sponsorabilirlik
- Karakter Derinliği: Psikolojik derinlik, empatik bağ kurulabilirlik
- Anlatım: Hikaye akışı, dramatik yapı, tempo

SADECE aşağıdaki JSON formatında yanıt ver, hiçbir açıklama ekleme:
{
  "toplam": 75,
  "orijinallik": 18,
  "ticari_potansiyel": 20,
  "karakter_derinligi": 17,
  "anlatim": 20,
  "imdb_tahmin": "7.2",
  "netflix_uygun_mu": true,
  "hedef_kitle": "hedef kitle tanımı yaş, ilgi alanı, platform tercihiyle",
  "benzer_yapimlar": ["Türkçe veya uluslararası yapım 1", "yapım 2", "yapım 3"],
  "yayin_platformu": "En uygun yayın platformu önerisi",
  "yapimci_yorumu": "Yapımcı gözünden 2-3 cümle — güçlü yanlar ve yatırım kararı"
}`;

  try{
    var groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer " + process.env.GROQ_API_KEY,
      },
      body:JSON.stringify({
        model:"llama-3.3-70b-versatile",
        messages:[{role:"user", content:prompt}],
        temperature:0.68,
        max_tokens:1024,
      }),
    });

    if(!groqRes.ok) throw new Error("Groq API hatası: " + groqRes.status);

    var data = await groqRes.json();
    var text = data.choices?.[0]?.message?.content || "";
    text = text.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
    var match = text.match(/\{[\s\S]*\}/);
    if(!match) throw new Error("JSON bulunamadı");

    var parsed = JSON.parse(match[0]);

    // Tip güvenliği
    var sayisal = ["toplam","orijinallik","ticari_potansiyel","karakter_derinligi","anlatim"];
    sayisal.forEach(k=>{ if(typeof parsed[k]==="string") parsed[k]=parseInt(parsed[k])||0; });
    if(typeof parsed.netflix_uygun_mu === "string") parsed.netflix_uygun_mu = parsed.netflix_uygun_mu==="true";
    if(!Array.isArray(parsed.benzer_yapimlar)) parsed.benzer_yapimlar = [];

    // Toplam doğrula (alt puanların toplamı 100'ü geçmesin)
    var altToplam = (parsed.orijinallik||0)+(parsed.ticari_potansiyel||0)+(parsed.karakter_derinligi||0)+(parsed.anlatim||0);
    if(altToplam !== parsed.toplam) parsed.toplam = altToplam;

    res.status(200).json(parsed);
  }catch(e){
    console.error("[puan]", e.message);
    res.status(500).json({error: e.message});
  }
}
