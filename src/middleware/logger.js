const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', '..', 'logs', 'requests.log');
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

// Her isteğin method, endpoint, zaman damgası, durum kodu ve süresini kaydeder
function logger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`;
    console.log(line);
    fs.appendFile(LOG_FILE, line + '\n', (err) => {
      if (err) console.error('Log dosyasına yazılamadı:', err.message);
    });
  });

  next();
}

module.exports = logger;
