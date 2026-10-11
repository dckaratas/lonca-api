const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'tasks.json');

function readTasks() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2) + '\n', 'utf-8');
}

module.exports = { readTasks, writeTasks };
