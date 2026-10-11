# 🗡️ Lonca Görev Panosu API

Fantastik bir maceracılar loncasının görevlerini yöneten REST API.
Görevler oluşturulur, maceracılara atanır, önceliğe göre sınıflanır ve durumları takip edilir.

**Teknolojiler:** Node.js, Express.js, JSON dosya tabanlı veri

📄 **[Proje Tanıtım Dokümanı](docs/PROJE_TANITIM.md)**

## Kurulum

```bash
git clone <repo-url>
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

Postman test ekran görüntüleri `docs/screenshots/` klasöründe yer alır.
<!-- TODO: Ekleme, listeleme, detay, güncelleme, silme ekran görüntülerini ekle -->
