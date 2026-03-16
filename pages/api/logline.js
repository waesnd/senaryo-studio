// pages/api/logline.js
import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  var {senaryo, tur, tip} = req.body;
  if(!senaryo) return res.status(400).json({error:"senaryo zorunlu"});

  var prompt = `Sen Hollywood'un en iyi logline yazarısın. Aşağıdaki senaryo için 3 farklı güçlü logline yaz. Her biri tek cümle, max 40 kelime, protagonist + hedef + engel yapısında, Türkçe.

Senaryo: ${senaryo.baslik}
Tür: ${tur} ${tip}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{"logline1":"...","logline2":"...","logline3":"..."}`;

  try{
    var sonuc = await callGroq(prompt, { temperature: 0.8, max_tokens: 512, raw: false });

    res.status(200).json(sonuc);
  }catch(e){
    console.error("[logline]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
