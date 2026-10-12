# Lonca Görev Panosu API — Proje Tanıtım Dokümanı

**Proje:** Node.js ile Backend Programlama — Bitirme Projesi
**Hazırlayan:** Doğan Can Karataş
**Teknolojiler:** Node.js, Express.js, REST API, JSON dosya tabanlı veri

## 1. Projenin Amacı

Bu proje, eğitim süresince öğrenilen Node.js, Express.js, routing, middleware ve CRUD konularını
gerçek hayatta kullanılabilecek bir **görev yönetim sistemi API'si** üzerinde uygulamak amacıyla geliştirilmiştir.
Sistem tamamen REST API mantığıyla çalışır ve herhangi bir istemci (web paneli, mobil uygulama, Postman)
tarafından kullanılabilir.

## 2. Senaryo

Yönergedeki "ekip içindeki görevleri takip etmek isteyen yazılım şirketi" senaryosu, fantastik bir
temaya uyarlanmıştır: **bir maceracılar loncası.**

Lonca ustası, şehirden gelen işleri (goblin temizliği, kayıp kervanı bulma, ejderha yuvasından hazine çalma…)
görev panosuna asar. Her görev bir maceracıya atanır, önceliği belirlenir ve tamamlanana kadar durumu takip edilir.

| Yönergedeki kavram | Projedeki karşılığı |
|---|---|
| Şirket / ekip | Maceracılar loncası |
| Çalışan | Maceracı (`assignee`) |
| Görev | Görev panosundaki ilan (`/tasks`) |
| Öncelik | `priority`: critical / high / medium / low — arayüzde **S / A / B / C rütbesi** olarak gösterilir |
| Durum takibi | `status`: open → in_progress → completed |

## 3. Sistem Özellikleri

- **Görev ekleme** — yeni görev oluşturma (`POST /tasks`)
- **Görev listeleme** — tüm görevleri görüntüleme (`GET /tasks`)
- **Görev detayı** — belirli bir görevi görüntüleme (`GET /tasks/:id`)
- **Görev güncelleme** — başlık, açıklama, öncelik, durum, atanan kişi ve ödül güncelleme (`PUT /tasks/:id`)
- **Görev silme** — görevi sistemden kaldırma (`DELETE /tasks/:id`)
- **Logger middleware** — her isteğin method, endpoint, zaman damgası, durum kodu ve süresini
  konsola ve `logs/requests.log` dosyasına kaydeder
- **Temel hata yönetimi** — geçersiz veride `400`, bulunamayan görevde ve tanımsız endpoint'te `404`,
  beklenmeyen hatalarda `500` döner

### Ek özellikler (yönergedeki pratik çalışmalar)

- **Filtreleme, arama ve sayfalama** — duruma (`?status=`) ve önceliğe (`?priority=`) göre filtre,
  başlık/açıklamada anahtar kelime araması (`/tasks/search?keyword=`), maceracıya göre görevler
  (`/tasks/assignee/:name`), sıralama (`?sort=createdAt`) ve sayfalama (`?page=1&limit=10`)
- **Doğrulama middleware'i** — `title`, `description`, `priority`, `status`, `assignee` ve `reward` alanlarını,
  ayrıca `:id` ve sorgu parametrelerini controller'dan önce kontrol eder; hatalı istekte tüm hataları listeleyen `400` döner
- **Raporlama** — tamamlanan görevler (`/reports/completed`), bekleyen görevler (`/reports/pending`) ve
  durum/öncelik dağılımı, tamamlanma oranı, ödül toplamları ile maceracı istatistiklerini veren özet (`/reports/summary`)
- **Dokümantasyon** — [API dokümantasyonu](API.md), [test dokümantasyonu](TEST.md) ve [kullanım kılavuzu](KULLANIM_KILAVUZU.md)

## 4. Veri Modeli

```json
{
  "id": 3,
  "title": "Kül Dağı Ejderhasını Uyandırma",
  "description": "Ejderhanın yuvasından Yıldız Taşı'nı fark edilmeden çal.",
  "priority": "critical",
  "status": "open",
  "assignee": null,
  "reward": 1000,
  "createdAt": "2026-10-03T08:15:00.000Z"
}
```

Veriler `src/data/tasks.json` dosyasında saklanır; sunucu yeniden başlatıldığında kaybolmaz.
Alan kuralları, durum akışı ve SQL karşılığı için: [Veri Modeli Tasarımı](VERI_MODELI.md).

## 5. Mimari

```
İstek → express.json() → Logger → router → doğrulama middleware'i → controller → tasks.json
                                      ├─ /tasks   → validateTask → taskController
                                      └─ /reports →                reportController
```

| Katman | Dosya | Görevi |
|---|---|---|
| Giriş noktası | `src/server.js` | Sunucuyu belirtilen portta başlatır |
| Uygulama | `src/app.js` | Express uygulaması, middleware'ler, 404 ve hata yakalayıcı |
| Routing | `src/routes/taskRoutes.js`, `reportRoutes.js` | Endpoint → middleware → controller eşlemesi |
| Controller | `src/controllers/taskController.js` | CRUD, filtreleme, arama, sıralama, sayfalama |
| Controller | `src/controllers/reportController.js` | Rapor hesaplamaları |
| Middleware | `src/middleware/logger.js` | İstek loglama |
| Middleware | `src/middleware/validateTask.js` | Gövde, id ve sorgu parametresi doğrulama |
| Veri | `src/data/store.js` | JSON dosyası okuma/yazma |

## 6. Test

Tüm endpoint'ler Postman üzerinden test edilmiştir (17 istek). Ekran görüntüleri
`docs/screenshots/` klasöründedir; istekler `docs/lonca-api.postman_collection.json` koleksiyonundadır.
Ayrıca `npm test` ile çalışan 11 otomatik test bulunur. Test senaryolarının tamamı
[test dokümantasyonunda](TEST.md), kurulum ve kullanım adımları [kullanım kılavuzunda](KULLANIM_KILAVUZU.md) yer alır.

## 7. Proje Ekosistemi

Bu API, aynı tema üzerinde geliştirilen diğer eğitim projeleriyle birlikte çalışacak şekilde tasarlanmıştır:
**lonca-web** (React görev panosu) bu API'ye bağlanabilir; **lonca-sql** içindeki `LoncaDB` veri tabanında
aynı yapıda bir `Tasks` tablosu bulunur.
