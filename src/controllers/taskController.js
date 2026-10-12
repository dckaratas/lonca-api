const { readTasks, writeTasks } = require('../data/store');
const { PRIORITIES } = require('../constants');

// Alan doğrulaması middleware/validateTask.js'te yapılır; buraya gelen veri geçerlidir.

const normalize = (text) => text.toLocaleLowerCase('tr');

function findIndex(tasks, id) {
  return tasks.findIndex((t) => t.id === Number(id));
}

// Sıralama değerleri; priority önem sırasına göre (low=1 … critical=4) karşılaştırılır
const sortValue = {
  createdAt: (t) => t.createdAt,
  reward: (t) => t.reward,
  priority: (t) => PRIORITIES.length - PRIORITIES.indexOf(t.priority),
  title: (t) => normalize(t.title),
};

// Sorgu parametrelerine göre filtreler, sıralar ve istenirse sayfalar
function listTasks(res, query) {
  const { status, priority, assignee, keyword, sort, order = 'asc', page, limit } = query;
  let tasks = readTasks();

  if (status) tasks = tasks.filter((t) => t.status === status);
  if (priority) tasks = tasks.filter((t) => t.priority === priority);
  if (assignee) tasks = tasks.filter((t) => t.assignee && normalize(t.assignee) === normalize(assignee));
  if (keyword) {
    const word = normalize(keyword.trim());
    tasks = tasks.filter((t) => normalize(`${t.title} ${t.description}`).includes(word));
  }

  if (sort) {
    const value = sortValue[sort];
    const direction = order === 'desc' ? -1 : 1;
    tasks.sort((a, b) => (value(a) > value(b) ? 1 : value(a) < value(b) ? -1 : 0) * direction);
  }

  // page/limit verilmezse düz liste döner (web paneli bu biçimi kullanır)
  if (page === undefined && limit === undefined) return res.json(tasks);

  const pageNo = Number(page) || 1;
  const size = Number(limit) || 10;
  res.json({
    data: tasks.slice((pageNo - 1) * size, pageNo * size),
    pagination: { page: pageNo, limit: size, total: tasks.length, totalPages: Math.ceil(tasks.length / size) },
  });
}

// GET /tasks?status=&priority=&assignee=&keyword=&sort=&order=&page=&limit=
exports.getAll = (req, res) => listTasks(res, req.query);

// GET /tasks/search?keyword=
exports.search = (req, res) => {
  if (req.query.keyword === undefined) return res.status(400).json({ error: 'keyword parametresi zorunludur' });
  listTasks(res, req.query);
};

// GET /tasks/assignee/:name
exports.getByAssignee = (req, res) => listTasks(res, { ...req.query, assignee: req.params.name });

// GET /tasks/:id
exports.getById = (req, res) => {
  const task = readTasks().find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Görev bulunamadı' });
  res.json(task);
};

// POST /tasks
exports.create = (req, res) => {
  const { title, description = '', priority = 'medium', assignee = null, reward = 0 } = req.body;

  const tasks = readTasks();
  const task = {
    id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
    title: title.trim(),
    description,
    priority,
    status: 'open',
    assignee,
    reward,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  writeTasks(tasks);
  res.status(201).json(task);
};

// PUT /tasks/:id
exports.update = (req, res) => {
  const tasks = readTasks();
  const index = findIndex(tasks, req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Görev bulunamadı' });

  const { title, description, priority, status, assignee, reward } = req.body;
  const task = tasks[index];
  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;
  if (assignee !== undefined) task.assignee = assignee;
  if (reward !== undefined) task.reward = reward;
  task.updatedAt = new Date().toISOString();

  writeTasks(tasks);
  res.json(task);
};

// DELETE /tasks/:id
exports.remove = (req, res) => {
  const tasks = readTasks();
  const index = findIndex(tasks, req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Görev bulunamadı' });

  const [deleted] = tasks.splice(index, 1);
  writeTasks(tasks);
  res.json({ message: 'Görev silindi', task: deleted });
};
