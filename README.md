# 🗡️ Lonca Görev Panosu API

Fantastik bir maceracılar loncasının görevlerini yöneten REST API.
Görevler oluşturulur, maceracılara atanır, önceliğe göre sınıflanır ve durumları takip edilir.

**Teknolojiler:** Node.js, Express.js, JSON dosya tabanlı veri

📄 **[Proje Tanıtım Dokümanı](docs/PROJE_TANITIM.md)**

## Kurulum

```bash
git clone https://github.com/dckaratas/lonca-api.git
cd lonca-api
npm install
npm start          # veya geliştirme için: npm run dev
```

Sunucu varsayılan olarak `http://localhost:3000` adresinde çalışır. Port değiştirmek için `PORT` ortam değişkeni kullanılabilir.

## Klasör Yapısı

```
src/
├── server.js                 # Uygulama giriş noktası
├── routes/taskRoutes.js      # /tasks routing
├── controllers/taskController.js   # CRUD iş mantığı
├── middleware/logger.js      # İstek loglama middleware'i
└── data/
    ├── tasks.json            # Veri dosyası
    └── store.js              # JSON okuma/yazma
logs/requests.log             # Logger çıktısı (otomatik oluşur)
```

## Veri Modeli — Görev (Task)

| Alan | Tip | Açıklama |
|---|---|---|
| id | number | Otomatik artan |
| title | string | **Zorunlu** — görev başlığı |
| description | string | Görev açıklaması |
| priority | `critical` \| `high` \| `medium` \| `low` | Öncelik (varsayılan `medium`). Arayüzde lonca rütbesi olarak gösterilir: S / A / B / C |
| status | `open` \| `in_progress` \| `completed` | Görev durumu |
| assignee | string \| null | Görevi üstlenen maceracı |
| reward | number | Altın ödülü |
| createdAt / updatedAt | ISO tarih | Zaman damgaları |

## Endpoint'ler

| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/tasks` | Tüm görevleri listele |
| GET | `/tasks/:id` | Görev detayı |
| POST | `/tasks` | Yeni görev ekle |
| PUT | `/tasks/:id` | Görevi güncelle |
| DELETE | `/tasks/:id` | Görevi sil |

### Örnek istek — Görev ekleme

```http
POST /tasks
Content-Type: application/json

{
  "title": "Kuzey Mağarasındaki Goblinleri Temizle",
  "description": "Goblin sürüsünü dağıt.",
  "priority": "low",
  "assignee": "Aria Gümüşok",
  "reward": 50
}
```

## Logger Middleware

Her istek için method, endpoint, zaman damgası, durum kodu ve süre hem konsola hem `logs/requests.log` dosyasına yazılır:

```
[2026-10-10T12:04:29.948Z] PUT /tasks/6 200 - 1ms
```

## Testler (Postman)

Tüm istekler [`docs/lonca-api.postman_collection.json`](docs/lonca-api.postman_collection.json) koleksiyonundadır
(Postman → **Import**). İstekler sırayla çalıştırılmalıdır: ekleme isteği oluşan görevin id'sini `{{taskId}}`
değişkenine kaydeder, sonraki istekler bu görevi kullanır. Her isteğin durum kodunu doğrulayan testleri vardır.

| # | İstek | Beklenen | Ekran görüntüsü |
|---|---|---|---|
| 1 | `POST /tasks` — Görev ekleme | 201 Created | ![](docs/screenshots/01_gorev_ekleme_POST.png) |
| 2 | `GET /tasks` — Görev listeleme | 200 OK | ![](docs/screenshots/02_gorev_listeleme_GET.png) |
| 3 | `GET /tasks/:id` — Görev detayı | 200 OK | ![](docs/screenshots/03_gorev_detay_GET.png) |
| 4 | `PUT /tasks/:id` — Görev güncelleme | 200 OK | ![](docs/screenshots/04_gorev_guncelleme_PUT.png) |
| 5 | `DELETE /tasks/:id` — Görev silme | 200 OK | ![](docs/screenshots/05_gorev_silme_DELETE.png) |
| 6 | `POST /tasks` — Başlıksız ekleme | 400 Bad Request | ![](docs/screenshots/06_hata_400_baslik_yok.png) |
| 7 | `GET /tasks/:id` — Silinmiş görev | 404 Not Found | ![](docs/screenshots/07_hata_404_bulunamadi.png) |

Logger middleware'in bu isteklerdeki konsol çıktısı:

![Logger çıktısı](docs/screenshots/08_logger_konsol.png)
