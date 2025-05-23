// models/createTables.js
const { sqliteConnection } = require("../config/db");

function createTables() {
  const db = sqliteConnection;

  db.serialize(() => {
    // 🔹 Tabela usuarios
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        telefone TEXT,
        bloqueado INTEGER DEFAULT 0
      );
    `);

    db.run(`ALTER TABLE usuarios ADD COLUMN role TEXT DEFAULT 'user'`, (err) => {
      if (err?.message?.includes("duplicate column name")) {
        console.log("🔄 A coluna 'role' já existe.");
      } else if (err) {
        console.error("❌ Erro ao adicionar coluna 'role':", err);
      } else {
        console.log("✅ Coluna 'role' adicionada.");
      }
    });

    // 🔹 Tabela livros
    db.run(`
      CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_do_livro TEXT NOT NULL,
        genero TEXT NOT NULL,
        autor TEXT NOT NULL,
        editora TEXT NOT NULL,
        sinopse TEXT,
        isbn TEXT UNIQUE NOT NULL,
        ano_publicacao INTEGER NOT NULL,
        quantidade_disponivel INTEGER NOT NULL DEFAULT 1,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        imagem TEXT,
        numero INTEGER
      );
    `);

    db.run(`ALTER TABLE livros ADD COLUMN numero INTEGER`, () => {});
    db.run(`ALTER TABLE livros ADD COLUMN estante TEXT`, () => {});

    // 🔹 Tabela reservas
    db.run(`
      CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        livro_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_devolucao TIMESTAMP,
        status TEXT,
        multa REAL,
        numero_unidade INTEGER,
        dias_atraso INTEGER DEFAULT 0,
        FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

    // 🔹 Trigger de devolução padrão
    db.run(`
      CREATE TRIGGER IF NOT EXISTS set_data_devolucao
      AFTER INSERT ON reservas
      FOR EACH ROW
      BEGIN
        UPDATE reservas
        SET data_devolucao = DATETIME(NEW.data_reserva, '+7 days')
        WHERE id = NEW.id;
      END;
    `);

    // 🔹 Outras tabelas
    db.run(`
      CREATE TABLE IF NOT EXISTS historico_devolucoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        livro_id INTEGER NOT NULL,
        data_reserva TIMESTAMP,
        data_devolucao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_devolvido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        multa REAL DEFAULT 0,
        dias_atraso INTEGER DEFAULT 0,
        userName TEXT,
        email TEXT,
        cpf TEXT,
        telefone TEXT,
        bloqueado INTEGER DEFAULT 0,
        numero_unidade INTEGER,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS fila_reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        livro_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        data_entrada DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (livro_id) REFERENCES livros(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        message TEXT,
        numero_unidade INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS livros_para_notificacao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES usuarios(id),
        FOREIGN KEY (book_id) REFERENCES livros(id)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS observacoes_devolucoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        livro_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        observacao TEXT,
        data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (livro_id) REFERENCES livros(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS admin_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);
  });

  console.log("🧱 Tabelas criadas ou já existentes.");
}

async function verificarEAdicionarColunaDataDevolvido() {
  const { openDb } = require("../config/db");
  const db = await openDb();
  const colunas = await db.all(`PRAGMA table_info(reservas)`);
  const existe = colunas.some((c) => c.name === "data_devolvido");

  if (!existe) {
    console.log("📦 Adicionando coluna 'data_devolvido'...");
    await db.run(`ALTER TABLE reservas ADD COLUMN data_devolvido DATETIME`);
    console.log("✅ Coluna 'data_devolvido' adicionada.");
  } else {
    console.log("✅ Coluna 'data_devolvido' já existe.");
  }
}

module.exports = {
  verificarEAdicionarColunaDataDevolvido,
  createTables: createTables,
};
