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
- **Temel hata yönetimi** — eksik başlıkta `400`, bulunamayan görevde ve tanımsız endpoint'te `404`,
  beklenmeyen hatalarda `500` döner

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

## 5. Mimari

```
İstek → express.json() → Logger middleware → /tasks router → taskController → tasks.json
```

| Katman | Dosya | Görevi |
|---|---|---|
| Giriş noktası | `src/server.js` | Express uygulaması, middleware'ler, 404 ve hata yakalayıcı |
| Routing | `src/routes/taskRoutes.js` | Endpoint → controller eşlemesi |
| Controller | `src/controllers/taskController.js` | CRUD iş mantığı ve doğrulama |
| Middleware | `src/middleware/logger.js` | İstek loglama |
| Veri | `src/data/store.js` | JSON dosyası okuma/yazma |

## 6. Test

Beş CRUD endpoint'inin tamamı Postman üzerinden test edilmiştir. Ekran görüntüleri
`docs/screenshots/` klasöründedir. Kurulum ve çalıştırma adımları için `README.md` dosyasına bakınız.

## 7. Proje Ekosistemi

Bu API, aynı tema üzerinde geliştirilen diğer eğitim projeleriyle birlikte çalışacak şekilde tasarlanmıştır:
**lonca-web** (React görev panosu) bu API'ye bağlanabilir; **lonca-sql** içindeki `LoncaDB` veri tabanında
aynı yapıda bir `Tasks` tablosu bulunur.
