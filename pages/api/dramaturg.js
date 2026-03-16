// pages/api/dramaturg.js
import { withAuth } from "../../lib/withAuth";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  var {senaryo, tip, tur} = req.body;
  if(!senaryo) return res.status(400).json({error:"senaryo zorunlu"});

  // Her seferinde farklı bir dramaturg perspektifi
  var perspektifler = [
    "Bir Yeşilçam ustası",
    "Netflix Türkiye içerik direktörü",
    "Uluslararası festival jürisi üyesi",
    "TRT drama editörü",
    "Cannes ödüllü Fransız yapımcı",
  ];
  var perspektif = perspektifler[Math.floor(Math.random()*perspektifler.length)];

  var prompt = `Sen ${perspektif} gözüyle değerlendirme yapıyorsun. Aşağıdaki senaryoyu bu perspektiften, eleştirel ve özgün biçimde analiz et. Klişe yorumlardan kaçın, bu senaryoya özel tespitler yap.

Senaryo: ${senaryo.baslik} (${tur} — ${tip})
Tagline: ${senaryo.tagline||""}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış Sahnesi: ${senaryo.acilis_sahnesi}
Büyük Dramatik Soru: ${senaryo.buyuk_soru}

Değerlendirirken şunlara bak:
- Bu spesifik senaryo için benzersiz güçlü yanlar neler?
- Hangi spesifik sahneler/karakterler sorunlu?
- ${tur} türüne özgü beklentiler karşılanıyor mu?
- Gerilim eğrisi nerede zirve yapıyor, nerede düşüyor?
- Puan 60-95 arasında olsun ve gerçekten bu senaryonun kalitesini yansıtsın.

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "genel_puan": <60-95 arası gerçekçi puan>,
  "perspektif": "${perspektif}",
  "guc_noktalari": ["bu senaryoya özgü güçlü yön 1", "güçlü yön 2", "güçlü yön 3"],
  "zayif_noktalar": ["bu senaryoya özgü zayıf nokta 1", "zayıf nokta 2"],
  "turk_dizi_uyumu": "Bu spesifik senaryonun Türk TV formatıyla uyumu — somut referanslarla",
  "gerilim_analizi": "Bu senaryonun gerilim eğrisi analizi — hangi beat'lerde ne oluyor",
  "karakter_motivasyon": "Bu senaryodaki karakterlerin motivasyon analizi — isim isim",
  "oneri_1": "Bu senaryoya özgü en kritik geliştirme önerisi",
  "oneri_2": "İkinci spesifik öneri",
  "oneri_3": "Üçüncü spesifik öneri",
  "sonuc": "Bu senaryoya özel final karar — 1-2 cümle"
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
        temperature:0.88,
        max_tokens:1500,
      }),
    });

    if(!groqRes.ok) throw new Error("Groq API hatası: " + groqRes.status);

    var data = await groqRes.json();
    var text = data.choices?.[0]?.message?.content || "";
    text = text.replace(/```json\s*/gi,"").replace(/```\s*/g,"").trim();
    var match = text.match(/\{[\s\S]*\}/);
    if(!match) throw new Error("JSON bulunamadı");

    var parsed = JSON.parse(match[0]);

    // Puan sayıya dönüştür
    if(typeof parsed.genel_puan === "string") parsed.genel_puan = parseInt(parsed.genel_puan)||70;
    // Dizi kontrolü
    if(!Array.isArray(parsed.guc_noktalari)) parsed.guc_noktalari = [];
    if(!Array.isArray(parsed.zayif_noktalar)) parsed.zayif_noktalar = [];

    res.status(200).json(parsed);
  }catch(e){
    console.error("[dramaturg]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
