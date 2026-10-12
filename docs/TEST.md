# Lonca Görev Panosu API — Test Dokümantasyonu

API iki yolla test edilmiştir:

1. **Otomatik testler:** Node.js'in yerleşik `node:test` modülüyle yazıldı, ek paket gerektirmez.
2. **Manuel testler:** Postman koleksiyonuyla yapıldı, her isteğin sonucu otomatik doğrulanır ve ekran görüntüsü alınır.

## 1. Otomatik testler

```bash
npm test
```

Testler `test/api.test.js` dosyasındadır. Her çalıştırmada:

- `src/data/tasks.json` geçici bir klasöre kopyalanır ve testler bu kopya üzerinde çalışır (`DATA_FILE` ortam değişkeni). Gerçek veri değişmez.
- Sunucu boş bir portta başlatılır, testler bittiğinde kapatılır ve geçici dosya silinir.
- `NODE_ENV=test` olduğu için logger middleware bu istekleri kaydetmez.

| # | Test | Doğrulanan |
|---|---|---|
| 1 | CRUD akışı | Ekle (201, `status: open`) → detay → güncelle (`updatedAt` oluşur) → sil → tekrar istenince 404 |
| 2 | Geçersiz görev verisi | 7 farklı hatalı gövde: başlık yok, boş başlık, 101 karakter başlık, sayı açıklama, geçersiz öncelik, boş assignee, negatif ödül. Hepsi 400 ve doğru mesaj |
| 3 | Çoklu hata | Üç hatalı alan → `details` dizisinde 3 mesaj |
| 4 | Güncelleme doğrulaması | Geçersiz durum, boş başlık ve sayı olmayan id → 400 |
| 5 | Filtre | `status` ve `priority` filtreleri yalnızca eşleşen görevleri döndürür; geçersiz değer → 400 |
| 6 | Arama | `EJDERHA` araması büyük/küçük harf duyarsız eşleşir; `keyword` yoksa 400 |
| 7 | Atanan kişi | `aria gümüşok` (küçük harf) → yalnızca Aria Gümüşok'un görevleri |
| 8 | Sıralama | `sort=reward&order=desc` azalan sıralı; geçersiz alan → 400 |
| 9 | Sayfalama | `page=2&limit=2` doğru dilimi ve sayfa bilgisini döndürür; `limit=500` ve `page=0` → 400 |
| 10 | Bekleyen/tamamlanan raporu | İki raporun sayıları toplam görev sayısına eşit, bekleyenlerde en acil görev başta |
| 11 | Özet raporu | Durum ve öncelik dağılımlarının toplamı = toplam görev; ödenen + bekleyen ödül = toplam ödül |

### Son çalıştırma sonucu

```
✔ CRUD: ekle → detay → güncelle → sil → 404
✔ Doğrulama: geçersiz görev verisi 400 döner
✔ Doğrulama: birden fazla hata details dizisinde listelenir
✔ Doğrulama: güncellemede geçersiz durum ve id 400 döner
✔ Filtre: duruma ve önceliğe göre
✔ Arama: anahtar kelime başlık ve açıklamada büyük/küçük harf duyarsız aranır
✔ Atanan kişi: /tasks/assignee/:name
✔ Sıralama: ödüle göre azalan
✔ Sayfalama: page ve limit ile sayfa bilgisi döner
✔ Rapor: tamamlanan ve bekleyen görevler
✔ Rapor: özet sayıları tutarlı
ℹ tests 11
ℹ pass 11
ℹ fail 0
```

## 2. Postman testleri

Koleksiyon: [`lonca-api.postman_collection.json`](lonca-api.postman_collection.json) (Postman → **Import**).

- `baseUrl` değişkeni `http://localhost:3000` olarak tanımlıdır.
- İstek 01, oluşturduğu görevin id'sini `{{taskId}}` değişkenine kaydeder. 03, 04, 05 ve 07 bu görevi kullanır, bu yüzden 01–07 sırayla çalıştırılmalıdır.
- Koleksiyonun tamamı **Run collection** ile tek seferde çalıştırılabilir. Her isteğin **Test Results** sekmesinde doğrulama sonuçları görünür.

### Temel CRUD ve hata testleri

| # | İstek | Beklenen | Postman testi | Ekran görüntüsü |
|---|---|---|---|---|
| 01 | `POST /tasks` | 201 | id sayı, başlık doğru | `01_gorev_ekleme_POST.png` |
| 02 | `GET /tasks` | 200 | Boş olmayan dizi | `02_gorev_listeleme_GET.png` |
| 03 | `GET /tasks/{{taskId}}` | 200 | Dönen id = taskId | `03_gorev_detay_GET.png` |
| 04 | `PUT /tasks/{{taskId}}` | 200 | Durum `in_progress`, öncelik `critical` | `04_gorev_guncelleme_PUT.png` |
| 05 | `DELETE /tasks/{{taskId}}` | 200 | Mesaj "Görev silindi" | `05_gorev_silme_DELETE.png` |
| 06 | `POST /tasks` (başlıksız) | 400 | Durum kodu | `06_hata_400_baslik_yok.png` |
| 07 | `GET /tasks/{{taskId}}` (silinmiş) | 404 | Durum kodu | `07_hata_404_bulunamadi.png` |
| — | Logger konsol çıktısı | — | — | `08_logger_konsol.png` |

### Filtreleme, arama, raporlama ve doğrulama testleri

| # | İstek | Beklenen | Postman testi | Ekran görüntüsü |
|---|---|---|---|---|
| 09 | `GET /tasks?status=completed` | 200 | Tüm sonuçlar `completed` | `09_filtre_durum_GET.png` |
| 10 | `GET /tasks?priority=high` | 200 | Tüm sonuçlar `high` | — |
| 11 | `GET /tasks/search?keyword=ejderha` | 200 | Sonuçlar kelimeyi içerir | `11_arama_GET.png` |
| 12 | `GET /tasks/assignee/Aria Gümüşok` | 200 | Tüm sonuçlar Aria'ya ait | — |
| 13 | `GET /tasks?sort=reward&order=desc&page=1&limit=2` | 200 | En fazla 2 kayıt, sayfa bilgisi, azalan ödül | `13_siralama_sayfalama_GET.png` |
| 14 | `GET /reports/completed` | 200 | `count` = görev sayısı | — |
| 15 | `GET /reports/pending` | 200 | Tamamlanmış görev içermez | — |
| 16 | `GET /reports/summary` | 200 | Ödenen + bekleyen = toplam ödül | `16_rapor_ozet_GET.png` |
| 17 | `POST /tasks` (geçersiz öncelik ve ödül) | 400 | `details` dizisinde 2 hata | — |
| 18 | `GET /tasks?status=done` | 400 | Durum kodu | — |

Ekran görüntüleri `docs/screenshots/` klasöründedir. 09–18 arasından örnek olarak 09, 11, 13 ve 16 numaralı isteklerin görüntüsü alınmıştır; diğer istekler koleksiyonda hazırdır ve aynı durumlar otomatik testlerle de doğrulanır.

## 3. Elle kontrol edilen durumlar

| Durum | Beklenen | Sonuç |
|---|---|---|
| Bozuk JSON gövdesi (`{"title":`) | 400 "Geçersiz JSON gövdesi" | ✔ |
| 10 KB'den büyük gövde | 413 "İstek gövdesi çok büyük" | ✔ |
| Tanımsız endpoint (`GET /quests`) | 404 | ✔ |
| Sunucu yeniden başlatıldıktan sonra veri | Görevler korunur (`tasks.json`) | ✔ |
| Her istek sonrası `logs/requests.log` | Method, endpoint, zaman, durum kodu, süre yazılır | ✔ |
