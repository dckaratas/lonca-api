const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Lonca API http://localhost:${PORT} adresinde çalışıyor`);
});
