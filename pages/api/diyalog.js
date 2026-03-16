// pages/api/diyalog.js
import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  var {metin, tur} = req.body;
  if(!metin?.trim()) return res.status(400).json({error:"metin zorunlu"});

  var prompt = `Sen Türkiye'nin en iyi diyalog yazarısın. Aşağıdaki diyaloğu güçlendir — daha doğal, daha çarpıcı, karaktere özgü ve sinematik yap. Tür: ${tur||"Drama"}. Orijinalin duygusunu ve anlamını koru ama çok daha iyi yaz.

Orijinal diyalog:
${metin}

SADECE güçlendirilmiş diyaloğu yaz, başka açıklama ekleme.`;

  try{
    var sonuc = await callGroq(prompt, { temperature: 0.85, max_tokens: 1024, raw: true });

    res.status(200).json({sonuc});
  }catch(e){
    console.error("[diyalog]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
