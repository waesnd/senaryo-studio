// pages/api/dramaturg.js
import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";
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
    var sonuc = await callGroq(prompt, { temperature: 0.88, max_tokens: 1500 });
    if(typeof sonuc.genel_puan === "string") sonuc.genel_puan = parseInt(sonuc.genel_puan)||70;
    if(!Array.isArray(sonuc.guc_noktalari)) sonuc.guc_noktalari = [];
    if(!Array.isArray(sonuc.zayif_noktalar)) sonuc.zayif_noktalar = [];
    res.status(200).json(sonuc);
  }catch(e){
    console.error("[dramaturg]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
