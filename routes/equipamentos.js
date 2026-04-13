const express = require('express');
const router = express.Router();
const path = require('path');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.perfil !== 'admin') return res.status(403).json({ erro: 'Sem permissão' });
  next();
}

router.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'equipamentos.html'));
});

router.get('/api', requireAuth, (req, res) => {
  const db = req.db;
  const { categoria, status, q } = req.query;
  let sql = 'SELECT * FROM equipamentos WHERE 1=1';
  const params = [];
  if (categoria) { sql += ' AND categoria = ?'; params.push(categoria); }
  if (status) { sql += ' AND status = ?'; params.push(status); }
  if (q) {
    sql += ' AND (nome LIKE ? OR marca LIKE ? OR modelo LIKE ? OR numero_serie LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }
  sql += " AND status != 'descartado' ORDER BY categoria, nome";
  res.json(db.prepare(sql).all(...params));
});

router.get('/api/:id', requireAuth, (req, res) => {
  const item = req.db.prepare('SELECT * FROM equipamentos WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ erro: 'Não encontrado' });
  res.json(item);
});

router.post('/api', requireAdmin, (req, res) => {
  const db = req.db;
  const { nome, categoria, marca, modelo, numero_serie, status, quantidade, observacoes } = req.body;
  if (!nome || !categoria) return res.status(400).json({ erro: 'Nome e categoria são obrigatórios' });
  try {
    const result = db.prepare(`
      INSERT INTO equipamentos (nome, categoria, marca, modelo, numero_serie, status, quantidade, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(nome, categoria, marca||'', modelo||'', numero_serie||null, status||'disponivel', quantidade||1, observacoes||'');

    db.prepare(`
      INSERT INTO movimentacoes (equipamento_id, tipo, quantidade, descricao, usuario_id)
      VALUES (?, 'entrada', ?, 'Equipamento cadastrado', ?)
    `).run(result.lastInsertRowid, quantidade||1, req.session.user.id);

    res.json({ sucesso: true, id: result.lastInsertRowid });
  } catch(err) {
    if (err.message && err.message.includes('UNIQUE')) return res.status(400).json({ erro: 'Número de série já cadastrado' });
    res.status(500).json({ erro: err.message });
  }
});

router.put('/api/:id', requireAdmin, (req, res) => {
  const db = req.db;
  const { nome, categoria, marca, modelo, numero_serie, status, quantidade, observacoes } = req.body;
  try {
    db.prepare(`
      UPDATE equipamentos SET nome=?, categoria=?, marca=?, modelo=?, numero_serie=?, status=?, quantidade=?, observacoes=?, atualizado_em=datetime('now')
      WHERE id=?
    `).run(nome, categoria, marca||'', modelo||'', numero_serie||null, status, quantidade, observacoes||'', req.params.id);
    res.json({ sucesso: true });
  } catch(err) {
    if (err.message && err.message.includes('UNIQUE')) return res.status(400).json({ erro: 'Número de série já cadastrado' });
    res.status(500).json({ erro: err.message });
  }
});

router.delete('/api/:id', requireAdmin, (req, res) => {
  req.db.prepare("UPDATE equipamentos SET status = 'descartado' WHERE id = ?").run(req.params.id);
  res.json({ sucesso: true });
});

module.exports = router;
