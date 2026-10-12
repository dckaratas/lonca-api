# Lonca Görev Panosu API — Kullanım Kılavuzu

Bu kılavuz, API'yi ilk kez kuracak ve kullanacak biri için adım adım hazırlanmıştır.
Uç noktaların tüm ayrıntıları için [API Dokümantasyonu](API.md)'na bakınız.

## 1. Gereksinimler

- **Node.js 18 veya üzeri** (geliştirme Node.js 24 ile yapıldı). Kontrol etmek için: `node -v`
- **Postman** (isteğe bağlı, istekleri denemek için)

## 2. Kurulum

```bash
git clone https://github.com/dckaratas/lonca-api.git
cd lonca-api
npm install
```

## 3. Sunucuyu çalıştırma

```bash
npm start
```

Konsolda şu satır görünür:

```
Lonca API http://localhost:3000 adresinde çalışıyor
```

Tarayıcıda `http://localhost:3000/tasks` adresini açarak görev listesini görebilirsiniz.

| Komut | Ne yapar |
|---|---|
| `npm start` | Sunucuyu başlatır |
| `npm run dev` | Kod değiştikçe sunucuyu otomatik yeniden başlatır |
| `npm test` | Otomatik testleri çalıştırır |

Sunucuyu durdurmak için konsolda **Ctrl + C**'ye basın.

### Port veya izinli adresi değiştirmek

```bash
# Linux / macOS / Git Bash
PORT=4000 npm start

# Windows PowerShell
$env:PORT=4000; npm start
```

API'yi bir web sitesinden kullanacaksanız `CORS_ORIGIN` ile yalnızca o adrese izin verin, ör. `CORS_ORIGIN=https://lonca-web.netlify.app`.

## 4. Postman ile kullanım

1. Postman'de **Import** → `docs/lonca-api.postman_collection.json` dosyasını seçin.
2. Sol menüde **Lonca Görev Panosu API** koleksiyonu görünür.
3. Sunucu çalışırken bir isteğe tıklayıp **Send**'e basın.
4. Tüm istekleri sırayla çalıştırmak için koleksiyona sağ tıklayıp **Run collection** seçin.

> İstek 01 yeni bir görev oluşturur ve id'sini saklar; 03–05 bu görevi kullanır. Bu yüzden ilk yedi istek sırayla çalıştırılmalıdır.

## 5. Sık yapılan işlemler

### Yeni görev asmak

```http
POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "Kayıp Ejderha Yumurtasını Bul",
  "priority": "high",
  "reward": 300
}
```

Yalnızca `title` zorunludur. Öncelik verilmezse `medium`, ödül verilmezse `0` olur.

### Görevi bir maceracıya atamak

```http
PUT http://localhost:3000/tasks/6
Content-Type: application/json

{ "assignee": "Aria Gümüşok", "status": "in_progress" }
```

### Görevi tamamlandı olarak işaretlemek

```http
PUT http://localhost:3000/tasks/6
Content-Type: application/json

{ "status": "completed" }
```

### Görevleri bulmak

| Ne arıyorsunuz? | İstek |
|---|---|
| Açık görevler | `GET /tasks?status=open` |
| Kritik (S rütbe) görevler | `GET /tasks?priority=critical` |
| İçinde "goblin" geçen görevler | `GET /tasks/search?keyword=goblin` |
| Borin'in görevleri | `GET /tasks/assignee/Borin Demirsakal` |
| En yüksek ödüllü görevler | `GET /tasks?sort=reward&order=desc` |
| En acil görevler önce | `GET /tasks?sort=priority&order=desc` |
| 10'arlı sayfalar halinde | `GET /tasks?page=1&limit=10` |

### Lonca raporları

| Rapor | İstek |
|---|---|
| Tamamlanan görevler ve dağıtılan altın | `GET /reports/completed` |
| Bekleyen görevler (en acil önce) | `GET /reports/pending` |
| Genel durum, tamamlanma oranı, maceracı istatistikleri | `GET /reports/summary` |

## 6. Öncelik ve rütbe karşılıkları

| API değeri (`priority`) | Web panelinde rütbe | Anlamı |
|---|---|---|
| `critical` | S | Kritik |
| `high` | A | Yüksek |
| `medium` | B | Orta |
| `low` | C | Düşük |

## 7. Sorun giderme

| Sorun | Çözüm |
|---|---|
| `EADDRINUSE: address already in use :::3000` | 3000 portu başka bir program tarafından kullanılıyor. Diğer sunucuyu kapatın veya `PORT=4000 npm start` ile başka port seçin. |
| Postman'de `Could not send request` | Sunucu çalışmıyor. Konsolda `npm start` çalıştırın. |
| `400 title alanı zorunludur` | Gövdede `title` yok. Postman'de **Body → raw → JSON** seçili olduğundan emin olun. |
| `400 Geçersiz JSON gövdesi` | JSON yazımı hatalı (eksik tırnak, fazla virgül vb.). |
| `400 ... şunlardan biri olmalıdır` | Öncelik, durum veya sıralama değeri listede yok; hata mesajında geçerli değerler yazar. |
| `404 Görev bulunamadı` | Bu id ile görev yok veya silinmiş. `GET /tasks` ile mevcut id'lere bakın. |
| Verileri ilk haline döndürmek | `git checkout src/data/tasks.json` |

## 8. Veriler ve loglar nerede?

- **Görevler:** `src/data/tasks.json`. Sunucu kapansa da kaybolmaz.
- **İstek kayıtları:** `logs/requests.log`. Her istek için tarih, method, adres, durum kodu ve süre yazılır:

  ```
  [2026-10-12T08:10:00.000Z] GET /tasks?status=open 200 - 2ms
  ```
