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
  res.sendFile(path.join(__dirname, '..', 'public', 'alocacoes.html'));
});

router.get('/api', requireAuth, (req, res) => {
  const db = req.db;
  const { status } = req.query;
  let sql = `
    SELECT a.*, e.nome as equipamento_nome, e.categoria, e.marca, e.modelo,
           u.nome as responsavel_nome
    FROM alocacoes a
    LEFT JOIN equipamentos e ON e.id = a.equipamento_id
    LEFT JOIN usuarios u ON u.id = a.usuario_responsavel_id
  `;
  if (status) sql += ' WHERE a.status = ?';
  sql += ' ORDER BY a.data_saida DESC';
  const items = status ? db.prepare(sql).all(status) : db.prepare(sql).all();
  res.json(items);
});

router.post('/api', requireAdmin, (req, res) => {
  const db = req.db;
  const { equipamento_id, colaborador_nome, colaborador_setor, observacoes } = req.body;
  if (!equipamento_id || !colaborador_nome) return res.status(400).json({ erro: 'Equipamento e colaborador são obrigatórios' });

  const equip = db.prepare('SELECT * FROM equipamentos WHERE id = ?').get(equipamento_id);
  if (!equip) return res.status(404).json({ erro: 'Equipamento não encontrado' });
  if (equip.status !== 'disponivel') return res.status(400).json({ erro: 'Equipamento não está disponível' });

  const result = db.prepare(`
    INSERT INTO alocacoes (equipamento_id, colaborador_nome, colaborador_setor, observacoes, usuario_responsavel_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(equipamento_id, colaborador_nome, colaborador_setor||'', observacoes||'', req.session.user.id);

  db.prepare("UPDATE equipamentos SET status = 'em_uso', atualizado_em = datetime('now') WHERE id = ?").run(equipamento_id);
  db.prepare(`INSERT INTO movimentacoes (equipamento_id, tipo, descricao, usuario_id) VALUES (?, 'saida', ?, ?)`)
    .run(equipamento_id, `Alocado para: ${colaborador_nome}`, req.session.user.id);

  res.json({ sucesso: true, id: result.lastInsertRowid });
});

router.put('/api/:id/devolver', requireAdmin, (req, res) => {
  const db = req.db;
  const alocacao = db.prepare('SELECT * FROM alocacoes WHERE id = ?').get(req.params.id);
  if (!alocacao) return res.status(404).json({ erro: 'Alocação não encontrada' });

  db.prepare("UPDATE alocacoes SET status = 'devolvido', data_retorno = datetime('now') WHERE id = ?").run(req.params.id);
  db.prepare("UPDATE equipamentos SET status = 'disponivel', atualizado_em = datetime('now') WHERE id = ?").run(alocacao.equipamento_id);
  db.prepare(`INSERT INTO movimentacoes (equipamento_id, tipo, descricao, usuario_id) VALUES (?, 'devolucao', ?, ?)`)
    .run(alocacao.equipamento_id, `Devolvido por: ${alocacao.colaborador_nome}`, req.session.user.id);

  res.json({ sucesso: true });
});

module.exports = router;
