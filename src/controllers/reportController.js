const { readTasks } = require('../data/store');
const { PRIORITIES, STATUSES } = require('../constants');

const sumReward = (tasks) => tasks.reduce((total, t) => total + t.reward, 0);
const byPriority = (a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority);

// Verilen alana göre görev sayıları, ör. { open: 2, in_progress: 1, completed: 1 }
function countBy(tasks, field, keys) {
  const counts = Object.fromEntries(keys.map((key) => [key, 0]));
  tasks.forEach((t) => counts[t[field]]++);
  return counts;
}

// GET /reports/completed
exports.completed = (req, res) => {
  const tasks = readTasks().filter((t) => t.status === 'completed');
  res.json({ count: tasks.length, totalReward: sumReward(tasks), tasks });
};

// GET /reports/pending — tamamlanmamış görevler, en acil olan önce
exports.pending = (req, res) => {
  const tasks = readTasks().filter((t) => t.status !== 'completed').sort(byPriority);
  res.json({
    count: tasks.length,
    byStatus: countBy(tasks, 'status', ['open', 'in_progress']),
    unassigned: tasks.filter((t) => !t.assignee).length,
    totalReward: sumReward(tasks),
    tasks,
  });
};

// GET /reports/summary
exports.summary = (req, res) => {
  const tasks = readTasks();
  const completed = tasks.filter((t) => t.status === 'completed');

  // Maceracı bazında görev sayısı ve kazanılan ödül
  const assignees = {};
  tasks.filter((t) => t.assignee).forEach((t) => {
    assignees[t.assignee] ??= { assignee: t.assignee, total: 0, completed: 0, earnedReward: 0 };
    const entry = assignees[t.assignee];
    entry.total++;
    if (t.status === 'completed') {
      entry.completed++;
      entry.earnedReward += t.reward;
    }
  });

  res.json({
    total: tasks.length,
    byStatus: countBy(tasks, 'status', STATUSES),
    byPriority: countBy(tasks, 'priority', PRIORITIES),
    completionRate: tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0,
    rewards: { total: sumReward(tasks), paid: sumReward(completed), pending: sumReward(tasks) - sumReward(completed) },
    assignees: Object.values(assignees),
  });
};
