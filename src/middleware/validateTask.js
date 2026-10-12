const { PRIORITIES, STATUSES } = require('../constants');

const MAX_LENGTH = { title: 100, description: 1000, assignee: 50 };
const SORT_FIELDS = ['createdAt', 'reward', 'priority', 'title'];

const isNonEmpty = (value) => typeof value === 'string' && value.trim() !== '';
const isPositiveInt = (value) => /^[1-9]\d*$/.test(value);

function badRequest(res, errors) {
  return res.status(400).json({ error: errors[0], details: errors });
}

// Gövdedeki görev alanlarını kontrol eder; partial=true ise (PUT) gönderilmeyen alanlar atlanır
function taskErrors(body, partial) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return ['İstek gövdesi bir JSON nesnesi olmalıdır'];

  const { title, description, priority, status, assignee, reward } = body;
  const errors = [];

  if (title === undefined) {
    if (!partial) errors.push('title alanı zorunludur');
  } else if (!isNonEmpty(title)) {
    errors.push('title boş olmayan bir metin olmalıdır');
  } else if (title.length > MAX_LENGTH.title) {
    errors.push(`title en fazla ${MAX_LENGTH.title} karakter olabilir`);
  }

  if (description !== undefined) {
    if (typeof description !== 'string') errors.push('description metin olmalıdır');
    else if (description.length > MAX_LENGTH.description) errors.push(`description en fazla ${MAX_LENGTH.description} karakter olabilir`);
  }

  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.push(`priority şunlardan biri olmalıdır: ${PRIORITIES.join(', ')}`);
  }

  // Yeni görev her zaman "open" başlar; durum yalnızca güncellemede değiştirilir
  if (partial && status !== undefined && !STATUSES.includes(status)) {
    errors.push(`status şunlardan biri olmalıdır: ${STATUSES.join(', ')}`);
  }

  if (assignee !== undefined && assignee !== null) {
    if (!isNonEmpty(assignee)) errors.push('assignee boş olmayan bir metin veya null olmalıdır');
    else if (assignee.length > MAX_LENGTH.assignee) errors.push(`assignee en fazla ${MAX_LENGTH.assignee} karakter olabilir`);
  }

  if (reward !== undefined && !(typeof reward === 'number' && Number.isFinite(reward) && reward >= 0)) {
    errors.push('reward 0 veya daha büyük bir sayı olmalıdır');
  }

  return errors;
}

// POST /tasks
exports.validateCreate = (req, res, next) => {
  const errors = taskErrors(req.body, false);
  errors.length ? badRequest(res, errors) : next();
};

// PUT /tasks/:id
exports.validateUpdate = (req, res, next) => {
  const errors = taskErrors(req.body, true);
  errors.length ? badRequest(res, errors) : next();
};

// :id parametresi pozitif tam sayı olmalı (router.param ile kullanılır)
exports.validateId = (req, res, next, id) => {
  isPositiveInt(id) ? next() : badRequest(res, ['id pozitif bir tam sayı olmalıdır']);
};

// Listeleme isteklerindeki filtre, sıralama ve sayfalama parametreleri
exports.validateQuery = (req, res, next) => {
  const { status, priority, keyword, sort, order, page, limit } = req.query;
  const errors = [];

  if (status !== undefined && !STATUSES.includes(status)) errors.push(`status şunlardan biri olmalıdır: ${STATUSES.join(', ')}`);
  if (priority !== undefined && !PRIORITIES.includes(priority)) errors.push(`priority şunlardan biri olmalıdır: ${PRIORITIES.join(', ')}`);
  if (keyword !== undefined && !isNonEmpty(keyword)) errors.push('keyword boş olmayan bir metin olmalıdır');
  if (sort !== undefined && !SORT_FIELDS.includes(sort)) errors.push(`sort şunlardan biri olmalıdır: ${SORT_FIELDS.join(', ')}`);
  if (order !== undefined && !['asc', 'desc'].includes(order)) errors.push('order asc veya desc olmalıdır');
  if (page !== undefined && !isPositiveInt(page)) errors.push('page pozitif bir tam sayı olmalıdır');
  if (limit !== undefined && !(isPositiveInt(limit) && Number(limit) <= 100)) errors.push('limit 1 ile 100 arasında bir tam sayı olmalıdır');

  errors.length ? badRequest(res, errors) : next();
};
