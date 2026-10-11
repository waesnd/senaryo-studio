# Türkçe senaryo kalite değerlendirmesi

Model çıktısının şemaya uyması tek başına yazarlık kalitesini göstermez. `evals/turkish-scenarios.json` içindeki sentetik brief'ler Türkçe doğallık, çatışma, karakter tutarlılığı, sahne/diyalog yapısı ve özel isteğe uyumu karşılaştırmak için tutulur.

Her prompt/model değişikliğinde aynı brief'leri çalıştırın. Anahtarı ortamdan sağlayın; hiçbir anahtar raporlanmaz:

```sh
npm run eval:ai -- --live --limit 3
```

Canlı çalıştırma ücretli API kullanabilir; `--live` olmadan ağ isteği yapılmaz. İlk karşılaştırmada kısa üç örnekle başlayın. Tüm sentetik brief'leri değerlendirmek için limiti artırın. Sonuçlar git dışında `.artifacts/ai-evaluation.json` dosyasına yazılır.

İki okuyucu her sonucu 1–5 aralığında değerlendirsin: Türkçe doğallık, somut dramatik çatışma, karakter motivasyonu, sahneler arasında tutarlılık, diyalogda karakter sesi, brief'e uyum ve klişeden uzaklık. Kör model karşılaştırması tercih edin; toplam puanın yanında güçlü/zayıf örnekleri ve anlaşmazlıkları saklayın. Şema başarısı, süre ve hata oranı otomatik raporlanır; yaratıcı kalite insan değerlendirmesine bırakılır.

Üretim kullanıcı metinlerini bu sentetik corpus'a eklemeyin. AI puanı ticari başarı garantisi değildir. Özel kişi/olay içeren brief'ler yerine kurgusal örnek kullanın. Başarısız cevaplar kullanıcı eserinin üzerine yazılmamalı.

İzlenecek ürün sinyalleri: gerçekten kaydedilen ilk eser, yeniden açılıp düzenlenen eser, sürüm geri yükleme başarısı, yararlı geri bildirim sonrası revizyon, 7 günlük yazar dönüşü ve başarılı AI işi başına maliyet. Bunları içerik metni, oturum token'ı veya e-posta loglamadan ölçün.
