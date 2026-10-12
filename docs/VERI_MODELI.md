# Lonca Görev Panosu API — Veri Modeli Tasarımı

**Hazırlayan:** Doğan Can Karataş

Bu doküman, sistemin temel varlığı olan **Görev (Task)** için veri yapısının nasıl belirlendiğini açıklar.
Uç noktalar ve istek/yanıt örnekleri için [API Dokümantasyonu](API.md)'na bakınız.

## 1. Varlık: Görev (Task)

Senaryodaki her ihtiyaç bir alana karşılık gelir:

| İhtiyaç (yönerge) | Alan |
|---|---|
| Görev oluşturulması | `id`, `title`, `description`, `createdAt` |
| Görevin çalışana atanması | `assignee` |
| Durum takibi | `status`, `updatedAt` |
| Öncelik yönetimi | `priority` |
| Temanın gereği (lonca ödülü) | `reward` |

## 2. Alanlar

| Alan | Tip | Zorunlu | Varsayılan | Kural | Açıklama |
|---|---|---|---|---|---|
| `id` | number | — | otomatik | Pozitif tam sayı, benzersiz | En büyük id + 1 olarak sunucu atar |
| `title` | string | **Evet** | — | Boş olamaz, en fazla 100 karakter | Görev başlığı |
| `description` | string | Hayır | `""` | En fazla 1000 karakter | Görev açıklaması |
| `priority` | enum | Hayır | `medium` | `critical`, `high`, `medium`, `low` | Öncelik |
| `status` | enum | — | `open` | `open`, `in_progress`, `completed` | Durum; yeni görev her zaman `open` başlar |
| `assignee` | string \| null | Hayır | `null` | Boş olmayan metin, en fazla 50 karakter | Görevi üstlenen maceracı |
| `reward` | number | Hayır | `0` | 0 veya daha büyük | Altın ödülü |
| `createdAt` | string (ISO 8601) | — | oluşturma anı | — | Sunucu atar |
| `updatedAt` | string (ISO 8601) | — | — | — | Yalnızca güncellenen görevlerde bulunur |

"Zorunlu" sütununda "—" olan alanlar istemciden alınmaz, sunucu tarafından belirlenir.
Kurallar `src/middleware/validateTask.js` içinde uygulanır; ihlalde API `400 Bad Request` döner.

## 3. Sabit değer listeleri (enum)

Değerler `src/constants.js` dosyasında tek yerde tanımlıdır.

**Öncelik (`priority`)** — arayüzde lonca rütbesi olarak gösterilir:

| Değer | Rütbe | Anlamı | Sıralama ağırlığı |
|---|---|---|---|
| `critical` | S | Kritik | 4 |
| `high` | A | Yüksek | 3 |
| `medium` | B | Orta | 2 |
| `low` | C | Düşük | 1 |

**Durum (`status`)**:

```
  open  ──────►  in_progress  ──────►  completed
 (Açık)          (Sürüyor)            (Tamamlandı)
```

Durumlar arasında geçiş serbesttir (ör. tamamlanan bir görev yeniden açılabilir); bu, eğitim kapsamında
iş kurallarını basit tutmak için bilinçli bir tercihtir.

## 4. Örnek kayıt

```json
{
  "id": 5,
  "title": "Batık Tapınağın Lanetini Kaldır",
  "description": "Tapınaktaki lanetli totemi bul ve rahibeye teslim et.",
  "priority": "high",
  "status": "in_progress",
  "assignee": "Lyra Gecerüzgârı",
  "reward": 400,
  "createdAt": "2026-10-05T11:00:00.000Z",
  "updatedAt": "2026-10-06T09:30:00.000Z"
}
```

## 5. Saklama

- Görevler `src/data/tasks.json` dosyasında bir **dizi** olarak tutulur; sunucu yeniden başlasa da kaybolmaz.
- Okuma/yazma yalnızca `src/data/store.js` üzerinden yapılır (`readTasks`, `writeTasks`). Veri kaynağı
  değiştirilmek istenirse (ör. SQL Server) yalnızca bu dosyanın değişmesi yeterlidir.
- Başlangıçta 5 örnek görev bulunur.

## 6. İlişkisel karşılığı

Aynı model, **lonca-sql** projesindeki `LoncaDB` veri tabanında `Tasks` tablosu olarak da tasarlanmıştır:

| JSON alanı | SQL sütunu | SQL tipi / kısıt |
|---|---|---|
| `id` | `TaskID` | `INT IDENTITY(1,1) PRIMARY KEY` |
| `title` | `Title` | `NVARCHAR(100) NOT NULL` |
| `description` | `Description` | `NVARCHAR(500)` |
| `priority` | `Priority` | `VARCHAR(10) NOT NULL DEFAULT 'medium'`, `CHECK (Priority IN ('critical','high','medium','low'))` |
| `status` | `Status` | `VARCHAR(20) NOT NULL DEFAULT 'open'`, `CHECK (Status IN ('open','in_progress','completed'))` |
| `assignee` | `AssigneeID` | `INT NULL FOREIGN KEY → Adventurers(AdventurerID)` (atanan kişi ayrı tabloda) |
| `reward` | `RewardGold` | `INT NOT NULL DEFAULT 0` |
| `createdAt` | `CreatedAt` | `DATETIME NOT NULL DEFAULT GETDATE()` |
| `updatedAt` | `UpdatedAt` | `DATETIME NULL` |

JSON modelde atanan kişi basitlik için metin olarak tutulurken, ilişkisel modelde normalizasyon gereği
ayrı bir `Adventurers` tablosuna yabancı anahtarla bağlanır.
