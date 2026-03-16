// pages/api/beatsheet.js
import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});

  var {senaryo, tip, tur} = req.body;
  if(!senaryo) return res.status(400).json({error:"senaryo zorunlu"});

  var prompt = `Sen Blake Snyder'ın "Save the Cat" yönteminde uzman bir senaryo danışmanısın. Aşağıdaki senaryo için 15 beat'i detaylı şekilde Türkçe doldur. Her beat için 2-3 cümle yaz — somut, sahneye dökülebilir içerik ol.

Senaryo: ${senaryo.baslik}
Tür: ${tur} ${tip}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış Sahnesi: ${senaryo.acilis_sahnesi}
Büyük Soru: ${senaryo.buyuk_soru}

SADECE aşağıdaki JSON formatında yanıt ver, hiçbir açıklama ekleme:
{
  "opening": "Açılış görüntüsü — filmin tonu ve dünyasını kurar",
  "theme": "Tema sunumu — hikayenin ana mesajı ima edilir",
  "setup": "Kurulum — karakterler, statüko, eksik olan şey",
  "catalyst": "Katalizör — her şeyi değiştiren olay",
  "debate": "Tartışma — kahraman tereddüt eder, içsel çatışma",
  "break1": "2. Perde geçişi — kahramanın yeni dünyaya adımı",
  "bstory": "B hikayesi — alt hikaye veya romantik ilişki başlar",
  "fun": "Eğlence ve oyun — yeni dünyanın keşfi",
  "midpoint": "Orta nokta — sahte zafer ya da sahte ölüm",
  "badguys": "Kötüler geri döner — baskı yoğunlaşır",
  "alllost": "Her şey kayıp — en karanlık an, tüm umutlar tükeniyor",
  "soul": "Ruhun karanlık gecesi — kahraman yıkılır, sorgulanır",
  "break2": "3. Perde geçişi — yeni karar, yeni güç kaynağı",
  "finale": "Final — son çatışma, zirve, çözüm",
  "closing": "Kapanış görüntüsü — dönüşüm tamamlandı, açılışla karşılaştırma"
}`;

  try{
    var sonuc = await callGroq(prompt, { temperature: 0.8, max_tokens: 2048, raw: false });

    res.status(200).json(sonuc);
  }catch(e){
    console.error("[beatsheet]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
