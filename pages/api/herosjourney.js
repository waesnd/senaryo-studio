// pages/api/herosjourney.js
import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  var {senaryo, tur, tip} = req.body;
  if(!senaryo) return res.status(400).json({error:"senaryo zorunlu"});

  var prompt = `Sen Joseph Campbell'ın "The Hero's Journey" (Kahramanın Yolculuğu) yönteminde uzman bir mitoloji ve senaryo analistisin. Aşağıdaki senaryoyu 12 aşamalı Hero's Journey yapısına göre Türkçe doldur. Her aşama için 2-3 cümle yaz — bu senaryoya özgü, somut içerik.

Senaryo: ${senaryo.baslik} (${tur} ${tip})
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış: ${senaryo.acilis_sahnesi}
Büyük Soru: ${senaryo.buyuk_soru}

12 Aşama:
1. Olağan Dünya (Ordinary World)
2. Maceranın Çağrısı (Call to Adventure)
3. Çağrıyı Reddetme (Refusal of the Call)
4. Akıl Hocasıyla Karşılaşma (Meeting the Mentor)
5. Eşiği Geçmek (Crossing the Threshold)
6. Testler, Müttefikler, Düşmanlar (Tests, Allies, Enemies)
7. En Derin Mağaraya Yaklaşmak (Approach to the Inmost Cave)
8. Büyük Sınav (The Ordeal)
9. Ödülü Almak (Reward / Seizing the Sword)
10. Geri Dönüş Yolu (The Road Back)
11. Diriliş (Resurrection)
12. Eliksirle Dönüş (Return with the Elixir)

SADECE aşağıdaki JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "olagan_dunya": "...",
  "macera_cagrisi": "...",
  "cagriya_ret": "...",
  "akil_hoca": "...",
  "esigi_gecmek": "...",
  "testler": "...",
  "derin_magara": "...",
  "buyuk_sinav": "...",
  "odulu_almak": "...",
  "donus_yolu": "...",
  "dirilis": "...",
  "eliksirle_donus": "..."
}`;

  try{
    var sonuc = await callGroq(prompt, { temperature: 0.82, max_tokens: 2048, raw: false });

    res.status(200).json(sonuc);
  }catch(e){
    console.error("[herosjourney]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
