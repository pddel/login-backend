const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'users.json');

function ensureDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf-8');
}

function readUsers() {
  ensureDb();
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')); } catch { return []; }
}

function writeUsers(users) {
  ensureDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

function findUserByEmail(email) {
  return readUsers().find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

function findUserById(id) {
  return readUsers().find((u) => u.id === id);
}

function createUser({ name, email, passwordHash }) {
  const users = readUsers();
  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name || '',
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return user;
}

module.exports = { readUsers, writeUsers, findUserByEmail, findUserById, createUser };
