const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'estoque.db');

let _sqlDb = null;

function saveDb() {
  const data = _sqlDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function createWrapper() {
  return {
    prepare: (sql) => ({
      run: (...params) => {
        const flat = params.flat();
        _sqlDb.run(sql, flat);
        saveDb();
        const lastId = _sqlDb.exec('SELECT last_insert_rowid()');
        return { lastInsertRowid: lastId[0]?.values[0][0] || 0 };
      },
      get: (...params) => {
        const flat = params.flat();
        const res = _sqlDb.exec(sql, flat);
        if (!res.length || !res[0].values.length) return undefined;
        const obj = {};
        res[0].columns.forEach((c, i) => obj[c] = res[0].values[0][i]);
        return obj;
      },
      all: (...params) => {
        const flat = params.flat();
        const res = _sqlDb.exec(sql, flat);
        if (!res.length) return [];
        return res[0].values.map(row => {
          const obj = {};
          res[0].columns.forEach((c, i) => obj[c] = row[i]);
          return obj;
        });
      }
    }),
    exec: (sql) => { _sqlDb.run(sql); saveDb(); },
    pragma: () => {}
  };
}

async function initDb() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    _sqlDb = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    _sqlDb = new SQL.Database();
  }

  _sqlDb.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      perfil TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS equipamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      marca TEXT, modelo TEXT, numero_serie TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'disponivel',
      quantidade INTEGER NOT NULL DEFAULT 1,
      observacoes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS alocacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipamento_id INTEGER NOT NULL,
      colaborador_nome TEXT NOT NULL,
      colaborador_setor TEXT, data_saida DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_retorno DATETIME, observacoes TEXT,
      usuario_responsavel_id INTEGER,
      status TEXT NOT NULL DEFAULT 'ativo'
    );
    CREATE TABLE IF NOT EXISTS movimentacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipamento_id INTEGER NOT NULL,
      tipo TEXT NOT NULL, quantidade INTEGER DEFAULT 1,
      descricao TEXT, usuario_id INTEGER,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  for (const [nome, username, senha, perfil] of [
    ['Usuário Padrão','admin','admin','admin'],
    ['T.I','ti','2026','admin'],
    ['Gestor','gestor','2026','viewer'],
  ]) {
    try { _sqlDb.run(`INSERT OR IGNORE INTO usuarios (nome,username,senha,perfil) VALUES (?,?,?,?)`, [nome,username,senha,perfil]); } catch {}
  }

  saveDb();
  return createWrapper();
}

module.exports = { initDb };
