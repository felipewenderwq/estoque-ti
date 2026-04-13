const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

router.post('/login', (req, res) => {
  const { username, senha } = req.body;
  const user = req.db.prepare('SELECT * FROM usuarios WHERE username = ? AND senha = ?').get(username, senha);
  if (!user) return res.redirect('/login?erro=invalido');
  req.session.user = { id: user.id, nome: user.nome, username: user.username, perfil: user.perfil };
  res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
