const express = require('express');
const router = express.Router();
const path = require('path');

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

router.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

router.get('/api/stats', requireAuth, (req, res) => {
  const db = req.db;
  try {
    const total = db.prepare("SELECT COUNT(*) as total FROM equipamentos WHERE status != 'descartado'").get();
    const disponiveis = db.prepare("SELECT COUNT(*) as total FROM equipamentos WHERE status = 'disponivel'").get();
    const emUso = db.prepare("SELECT COUNT(*) as total FROM equipamentos WHERE status = 'em_uso'").get();
    const defeituosos = db.prepare("SELECT COUNT(*) as total FROM equipamentos WHERE status = 'defeituoso'").get();
    const alocacoesAtivas = db.prepare("SELECT COUNT(*) as total FROM alocacoes WHERE status = 'ativo'").get();

    const porCategoria = db.prepare(`
      SELECT categoria, COUNT(*) as total,
        SUM(CASE WHEN status = 'disponivel' THEN 1 ELSE 0 END) as disponiveis,
        SUM(CASE WHEN status = 'em_uso' THEN 1 ELSE 0 END) as em_uso
      FROM equipamentos WHERE status != 'descartado'
      GROUP BY categoria ORDER BY categoria
    `).all();

    const ultimasMovimentacoes = db.prepare(`
      SELECT m.*, e.nome as equipamento_nome, u.nome as usuario_nome
      FROM movimentacoes m
      LEFT JOIN equipamentos e ON e.id = m.equipamento_id
      LEFT JOIN usuarios u ON u.id = m.usuario_id
      ORDER BY m.criado_em DESC LIMIT 10
    `).all();

    res.json({
      stats: {
        total: total.total,
        disponiveis: disponiveis.total,
        emUso: emUso.total,
        defeituosos: defeituosos.total,
        alocacoesAtivas: alocacoesAtivas.total
      },
      porCategoria,
      ultimasMovimentacoes
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
