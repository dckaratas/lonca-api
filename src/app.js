const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.disable('x-powered-by'); // sunucu teknolojisini yanıt başlığında gösterme
// Varsayılan: her kaynaktan erişim. Yayında CORS_ORIGIN ile web panelinin adresine kısıtlanmalı.
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(logger);

app.get('/', (req, res) => {
  res.json({ message: 'Lonca Görev Panosu API çalışıyor', endpoints: ['/tasks', '/reports'] });
});

app.use('/tasks', taskRoutes);
app.use('/reports', reportRoutes);

// Tanımsız endpoint
app.use((req, res) => {
  res.status(404).json({ error: `Bulunamadı: ${req.method} ${req.originalUrl}` });
});

// Hatalar: bozuk/çok büyük JSON gövdesi 4xx, diğerleri 500 (ayrıntı istemciye gösterilmez)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Geçersiz JSON gövdesi' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'İstek gövdesi çok büyük' });
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatası' });
});

module.exports = app;
