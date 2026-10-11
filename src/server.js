const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
  res.json({ message: 'Lonca Görev Panosu API çalışıyor', endpoints: ['/tasks'] });
});

app.use('/tasks', taskRoutes);

// Tanımsız endpoint
app.use((req, res) => {
  res.status(404).json({ error: `Bulunamadı: ${req.method} ${req.originalUrl}` });
});

// Beklenmeyen hatalar
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatası' });
});

app.listen(PORT, () => {
  console.log(`Lonca API http://localhost:${PORT} adresinde çalışıyor`);
});
