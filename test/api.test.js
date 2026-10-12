// Otomatik API testleri — çalıştırma: npm test
// Gerçek tasks.json bozulmasın diye her çalıştırmada geçici bir kopya kullanılır.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lonca-api-'));
process.env.DATA_FILE = path.join(tempDir, 'tasks.json');
process.env.NODE_ENV = 'test';
fs.copyFileSync(path.join(__dirname, '..', 'src', 'data', 'tasks.json'), process.env.DATA_FILE);

const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => {
  server.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

async function call(method, url, body) {
  const res = await fetch(baseUrl + url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

// ---------- CRUD ----------
test('CRUD: ekle → detay → güncelle → sil → 404', async () => {
  const created = await call('POST', '/tasks', { title: 'Test Görevi', priority: 'high', reward: 75 });
  assert.equal(created.status, 201);
  assert.equal(created.body.status, 'open');
  const { id } = created.body;

  assert.equal((await call('GET', `/tasks/${id}`)).body.title, 'Test Görevi');

  const updated = await call('PUT', `/tasks/${id}`, { status: 'completed', assignee: 'Aria Gümüşok' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.status, 'completed');
  assert.ok(updated.body.updatedAt);

  assert.equal((await call('DELETE', `/tasks/${id}`)).body.message, 'Görev silindi');
  assert.equal((await call('GET', `/tasks/${id}`)).status, 404);
});

// ---------- Doğrulama middleware'i ----------
test('Doğrulama: geçersiz görev verisi 400 döner', async () => {
  const cases = [
    [{ description: 'başlık yok' }, 'title alanı zorunludur'],
    [{ title: '   ' }, 'title boş olmayan bir metin olmalıdır'],
    [{ title: 'x'.repeat(101) }, 'title en fazla 100 karakter olabilir'],
    [{ title: 'Görev', description: 42 }, 'description metin olmalıdır'],
    [{ title: 'Görev', priority: 'urgent' }, 'priority şunlardan biri olmalıdır: critical, high, medium, low'],
    [{ title: 'Görev', assignee: '' }, 'assignee boş olmayan bir metin veya null olmalıdır'],
    [{ title: 'Görev', reward: -5 }, 'reward 0 veya daha büyük bir sayı olmalıdır'],
  ];
  for (const [body, message] of cases) {
    const res = await call('POST', '/tasks', body);
    assert.equal(res.status, 400, JSON.stringify(body));
    assert.equal(res.body.error, message);
  }
});

test('Doğrulama: birden fazla hata details dizisinde listelenir', async () => {
  const res = await call('POST', '/tasks', { priority: 'urgent', reward: 'çok' });
  assert.equal(res.status, 400);
  assert.equal(res.body.details.length, 3);
});

test('Doğrulama: güncellemede geçersiz durum ve id 400 döner', async () => {
  assert.equal((await call('PUT', '/tasks/1', { status: 'done' })).status, 400);
  assert.equal((await call('PUT', '/tasks/1', { title: '' })).status, 400);
  assert.equal((await call('GET', '/tasks/abc')).status, 400);
});

// ---------- Filtreleme, arama, sayfalama ----------
test('Filtre: duruma ve önceliğe göre', async () => {
  const completed = await call('GET', '/tasks?status=completed');
  assert.ok(completed.body.length > 0);
  assert.ok(completed.body.every((t) => t.status === 'completed'));

  const high = await call('GET', '/tasks?priority=critical');
  assert.ok(high.body.every((t) => t.priority === 'critical'));

  assert.equal((await call('GET', '/tasks?status=done')).status, 400);
});

test('Arama: anahtar kelime başlık ve açıklamada büyük/küçük harf duyarsız aranır', async () => {
  const res = await call('GET', '/tasks/search?keyword=EJDERHA');
  assert.equal(res.status, 200);
  assert.ok(res.body.length > 0);
  assert.ok(res.body.every((t) => `${t.title} ${t.description}`.toLocaleLowerCase('tr').includes('ejderha')));

  assert.equal((await call('GET', '/tasks/search')).status, 400);
});

test('Atanan kişi: /tasks/assignee/:name', async () => {
  const res = await call('GET', `/tasks/assignee/${encodeURIComponent('aria gümüşok')}`);
  assert.ok(res.body.length > 0);
  assert.ok(res.body.every((t) => t.assignee === 'Aria Gümüşok'));
});

test('Sıralama: ödüle göre azalan', async () => {
  const res = await call('GET', '/tasks?sort=reward&order=desc');
  const rewards = res.body.map((t) => t.reward);
  assert.deepEqual(rewards, [...rewards].sort((a, b) => b - a));
  assert.equal((await call('GET', '/tasks?sort=id')).status, 400);
});

test('Sayfalama: page ve limit ile sayfa bilgisi döner', async () => {
  const all = (await call('GET', '/tasks')).body;
  const res = await call('GET', '/tasks?page=2&limit=2');
  assert.deepEqual(res.body.data, all.slice(2, 4));
  assert.deepEqual(res.body.pagination, { page: 2, limit: 2, total: all.length, totalPages: Math.ceil(all.length / 2) });

  assert.equal((await call('GET', '/tasks?limit=500')).status, 400);
  assert.equal((await call('GET', '/tasks?page=0')).status, 400);
});

// ---------- Raporlar ----------
test('Rapor: tamamlanan ve bekleyen görevler', async () => {
  const all = (await call('GET', '/tasks')).body;

  const completed = (await call('GET', '/reports/completed')).body;
  assert.equal(completed.count, all.filter((t) => t.status === 'completed').length);

  const pending = (await call('GET', '/reports/pending')).body;
  assert.equal(pending.count + completed.count, all.length);
  assert.equal(pending.tasks[0].priority, 'critical'); // en acil görev önce
});

test('Rapor: özet sayıları tutarlı', async () => {
  const summary = (await call('GET', '/reports/summary')).body;
  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

  assert.equal(sum(summary.byStatus), summary.total);
  assert.equal(sum(summary.byPriority), summary.total);
  assert.equal(summary.rewards.paid + summary.rewards.pending, summary.rewards.total);
  assert.ok(summary.completionRate >= 0 && summary.completionRate <= 100);
});
