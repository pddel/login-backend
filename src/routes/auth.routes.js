const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById, createUser } = require('../db');
const { requireAuth } = require('../middleware');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt };
}
function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}
function setAuthCookie(res, token, remember) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Email tidak valid.' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'Kata sandi minimal 8 karakter.' });
  if (findUserByEmail(email)) return res.status(409).json({ error: 'Email sudah terdaftar.' });

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = createUser({ name, email, passwordHash });
  setAuthCookie(res, signToken(user.id), true);
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password, remember } = req.body || {};
  const user = email && findUserByEmail(email);
  const ok = user && bcrypt.compareSync(password || '', user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Email atau kata sandi salah.' });

  setAuthCookie(res, signToken(user.id), !!remember);
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  const user = findUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });
  res.json({ user: publicUser(user) });
});

module.exports = router;
