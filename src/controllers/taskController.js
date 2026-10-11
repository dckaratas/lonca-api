const { readTasks, writeTasks } = require('../data/store');

// Öncelik, arayüzde lonca rütbesi olarak gösterilir: critical=S, high=A, medium=B, low=C
const PRIORITIES = ['critical', 'high', 'medium', 'low'];
const STATUSES = ['open', 'in_progress', 'completed'];

const isNonEmpty = (value) => typeof value === 'string' && value.trim() !== '';

// Metin alanlarına nesne/dizi gibi beklenmeyen tiplerin kaydedilmesini engeller
function typeError({ description, assignee }) {
  if (description !== undefined && typeof description !== 'string') return 'description metin olmalıdır';
  if (assignee !== undefined && assignee !== null && typeof assignee !== 'string') return 'assignee metin veya null olmalıdır';
  return null;
}

function findIndex(tasks, id) {
  return tasks.findIndex((t) => t.id === Number(id));
}

// GET /tasks
exports.getAll = (req, res) => {
  res.json(readTasks());
};

// GET /tasks/:id
exports.getById = (req, res) => {
  const task = readTasks().find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Görev bulunamadı' });
  res.json(task);
};

// POST /tasks
exports.create = (req, res) => {
  const { title, description = '', priority = 'medium', assignee = null, reward = 0 } = req.body;
  if (!isNonEmpty(title)) return res.status(400).json({ error: 'title alanı zorunludur' });
  const invalid = typeError(req.body);
  if (invalid) return res.status(400).json({ error: invalid });

  const tasks = readTasks();
  const task = {
    id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
    title,
    description,
    priority: PRIORITIES.includes(priority) ? priority : 'medium',
    status: 'open',
    assignee,
    reward: Number(reward) || 0,
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
  if (title !== undefined && !isNonEmpty(title)) return res.status(400).json({ error: 'title boş olamaz' });
  const invalid = typeError(req.body);
  if (invalid) return res.status(400).json({ error: invalid });

  const task = tasks[index];
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (PRIORITIES.includes(priority)) task.priority = priority;
  if (STATUSES.includes(status)) task.status = status;
  if (assignee !== undefined) task.assignee = assignee;
  if (reward !== undefined) task.reward = Number(reward) || 0;
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
