const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'ti-estoque-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 }
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

const { initDb } = require('./db/setup');

initDb().then(db => {
  app.use((req, res, next) => { req.db = db; next(); });

  app.use('/', require('./routes/auth'));
  app.use('/equipamentos', require('./routes/equipamentos'));
  app.use('/alocacoes', require('./routes/alocacoes'));
  app.use('/dashboard', require('./routes/dashboard'));

  app.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.redirect('/login');
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n Sistema TI Estoque rodando em http://localhost:${PORT}`);
    console.log('🌐 Acesso na rede: http://SEU-IP:3000');
  });
}).catch(err => {
  console.error('Erro ao inicializar banco:', err);
  process.exit(1);
});
