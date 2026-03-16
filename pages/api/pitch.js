// pages/api/pitch.js
import { withAuth } from "../../lib/withAuth";
import { callGroq } from "../../lib/groq";
async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({error:"Method not allowed"});
  var {senaryo, tur, tip} = req.body;
  if(!senaryo) return res.status(400).json({error:"senaryo zorunlu"});

  var prompt = `Sen Türkiye'nin en iyi yapımcılarına pitch sunan bir senaryo temsilcisisin. Aşağıdaki senaryo için profesyonel bir pitch deck içeriği oluştur.

Senaryo: ${senaryo.baslik} (${tur} ${tip})
Tagline: ${senaryo.tagline||""}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış: ${senaryo.acilis_sahnesi}

SADECE şu JSON formatında yanıt ver, başka hiçbir şey yazma:
{
  "one_liner":"Tek cümlelik en güçlü pitch",
  "problem":"Hangi insani sorunu ele alıyor",
  "cozum":"Senaryo bunu nasıl çözüyor",
  "hedef_kitle":"Hedef kitle ve platform önerisi",
  "rekabet":"Benzer yapımlar ve bu senaryonun farkı",
  "neden_simdi":"Bu hikaye neden şimdi anlatılmalı",
  "vizyon":"Franchise veya sezon genişleme potansiyeli",
  "cagri":"Yapımcıya yatırım çağrısı"
}`;

  try{
    var sonuc = await callGroq(prompt, { temperature: 0.75, max_tokens: 1500, raw: false });

    res.status(200).json(sonuc);
  }catch(e){
    console.error("[pitch]", e.message);
    res.status(500).json({error: e.message});
  }
}

export default withAuth(handler);
