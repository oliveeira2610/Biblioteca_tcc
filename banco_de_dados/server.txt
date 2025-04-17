const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const cron = require("node-cron");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

let notifications = [];
const sqlite = require("sqlite");

async function openDb() {
  return sqlite.open({
    filename: "./books.db",
    driver: sqlite3.Database,
  });
}

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database("./books.db", (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Banco de dados conectado com sucesso!");
  }
});

// Função para calcular e aplicar multas automaticamente
const aplicarMultasAutomaticamente = async () => {
  const db = await openDb();

  try {
    const reservas = await db.all(
      `SELECT id, data_devolucao FROM reservas WHERE status = 'Reservado'`
    );

    const hoje = new Date();

    for (const reserva of reservas) {
      const dataDevolucao = new Date(reserva.data_devolucao);
      let diasAtraso = Math.ceil((hoje - dataDevolucao) / (1000 * 60 * 60 * 24));

      console.log(`Reserva ID: ${reserva.id}, Dias de Atraso: ${diasAtraso}`);

      if (diasAtraso > 0) {
        const multa = 10 + diasAtraso * 2;
        await db.run(
          `UPDATE reservas SET multa = ?, dias_atraso = ? WHERE id = ?`,
          [multa, diasAtraso, reserva.id]
        );
      }
    }

    console.log("Multas aplicadas automaticamente");
  } catch (error) {
    console.error("Erro ao aplicar multas automaticamente:", error);
  }
};

// RETIRAR DEPOIS // execução da função aplicarMultasAutomaticamente
aplicarMultasAutomaticamente();
// RETIRAR DEPOIS //

// Agendar a execução da função aplicarMultasAutomaticamente todos os dias à meia-noite
cron.schedule("0 0 * * *", () => {
  aplicarMultasAutomaticamente();
  console.log("Verificação de multas executada.");
});


async function verificarEAdicionarColunaDataDevolvido() {
  const db = await openDb();

  const resultado = await db.all(`PRAGMA table_info(reservas)`);
  const colunaExiste = resultado.some(coluna => coluna.name === 'data_devolvido');

  if (!colunaExiste) {
    console.log("📦 Adicionando coluna 'data_devolvido' em 'reservas'...");
    await db.run(`ALTER TABLE reservas ADD COLUMN data_devolvido DATETIME`);
    console.log("✅ Coluna 'data_devolvido' adicionada com sucesso.");
  } else {
    console.log("✅ A coluna 'data_devolvido' já existe.");
  }
}


// Criar tabelas caso não existam
db.serialize(() => {
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
  db.run(
    `
      ALTER TABLE usuarios ADD COLUMN role TEXT DEFAULT 'user'
    `,
    (err) => {
      if (err && err.message.includes("duplicate column name")) {
        console.log("A coluna 'role' já existe.");
      } else if (err) {
        console.error("Erro ao adicionar coluna 'role':", err);
      } else {
        console.log("Coluna 'role' adicionada com sucesso.");
      }
    }
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS admin_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
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

//     -- Adiciona a coluna 'numero' à tabela 'livros'
// ALTER TABLE livros ADD COLUMN numero INTEGER;

// -- Adiciona a coluna 'estante' à tabela 'livros'
// ALTER TABLE livros ADD COLUMN estante TEXT;

  db.run(`
      CREATE TABLE IF NOT EXISTS reservas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        livro_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        data_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_devolucao TIMESTAMP,
        status TEXT,
        multa REAL,
        FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

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

  db.run(`  
      CREATE TABLE IF NOT EXISTS notificacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        message TEXT,
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
    CREATE TRIGGER IF NOT EXISTS set_data_devolucao
      AFTER INSERT ON reservas
      FOR EACH ROW
      BEGIN
        UPDATE reservas
        SET data_devolucao = DATETIME(NEW.data_reserva, '+7 days')
        WHERE id = NEW.id;
      END;
    `);

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

    db.run(
      `ALTER TABLE reservas ADD COLUMN numero_unidade INTEGER`,
      (err) => {
        if (err && err.message.includes("duplicate column name")) {
          console.log("A coluna numero_unidade já existe.");
        } else if (err) {
          console.error("Erro ao adicionar coluna numero_unidade:", err);
        } else {
          console.log("Coluna numero_unidade adicionada com sucesso.");
        }
      }
    );
    
});

console.log("Tabelas criadas ou já existentes.");

// 📌 ENDPOINTS 📌

// PARA TESTE APENAS
app.get("/testar-aplicacao-multas", async (req, res) => {
  try {
    await aplicarMultasAutomaticamente();
    res.status(200).json({ message: "Multas aplicadas com sucesso." });
  } catch (error) {
    console.error("Erro ao aplicar multas manualmente:", error);
    res.status(500).json({ error: "Erro ao aplicar multas manualmente." });
  }
});

/////////////////////// NOTIFICAÇÕES ///////////////////////

// Função para criar notificações para todos os usuários interessados
const createNotification = (bookId, message) => {
  db.all(
    `SELECT user_id FROM livros_para_notificacao WHERE book_id = ?`,
    [bookId],
    (err, rows) => {
      if (err) {
        console.error("Erro ao buscar usuários para notificação:", err);
        return;
      }

      if (rows.length === 0) {
        console.log(
          `Nenhum usuário registrado para receber notificações do livro ${bookId}`
        );
        return;
      }

      rows.forEach((row) => {
        const userId = row.user_id;

        console.log(
          `Criando notificação para userId: ${userId}, bookId: ${bookId}`
        );

        db.run(
          `INSERT INTO notificacoes (user_id, book_id, message) VALUES (?, ?, ?)`,
          [userId, bookId, message],
          function (err) {
            if (err) {
              console.error(
                `Erro ao adicionar notificação para userId ${userId}:`,
                err
              );
            } else {
              console.log(`Notificação adicionada para userId ${userId}`);
            }
          }
        );
      });
    }
  );
};

// Endpoint para deletar todas as notificações de um usuário específico
app.delete("/notifications/:userId", (req, res) => {
  const { userId } = req.params;

  db.run(
    `DELETE FROM notificacoes WHERE user_id = ?`,
    [userId],
    function (err) {
      if (err) {
        console.error("Erro ao deletar notificações:", err);
        return res
          .status(500)
          .json({ message: "Erro ao deletar notificações" });
      }
      res.status(200).json({ message: "Notificações deletadas com sucesso." });
    }
  );
});

// Endpoint para deletar notificações de um livro específico para um usuário específico
app.delete("/notifications/:userId/:bookId", (req, res) => {
  const { userId, bookId } = req.params;
  db.run(
    `DELETE FROM notificacoes WHERE user_id = ? AND book_id = ?`,
    [userId, bookId],
    function (err) {
      if (err) {
        console.error("Erro ao deletar notificações:", err);
        return res
          .status(500)
          .json({ message: "Erro ao deletar notificações" });
      }
      res
        .status(200)
        .json({ message: "Notificações do livro deletadas com sucesso." });
    }
  );
});

// Endpoint para registrar livros para notificação
app.post("/register-notification", (req, res) => {
  const { userId, bookId } = req.body;

  db.get(
    `SELECT * FROM livros_para_notificacao WHERE user_id = ? AND book_id = ?`,
    [userId, bookId],
    (err, row) => {
      if (err) {
        console.error("Erro ao buscar notificação existente:", err);
        return res
          .status(500)
          .json({ message: "Erro ao buscar notificação existente" });
      }

      if (row) {
        console.log(
          `Usuário ${userId} já está registrado para receber notificações do livro ${bookId}`
        );
        return res
          .status(400)
          .json({
            message:
              "Você já está registrado para receber notificações deste livro.",
          });
      }

      db.run(
        `INSERT INTO livros_para_notificacao (user_id, book_id) VALUES (?, ?)`,
        [userId, bookId],
        function (err) {
          if (err) {
            console.error("Erro ao registrar notificação:", err);
            return res
              .status(500)
              .json({ message: "Erro ao registrar notificação" });
          }
          console.log(
            `Usuário ${userId} agora receberá notificações do livro ${bookId}`
          );
          res
            .status(201)
            .json({ message: "Notificação registrada com sucesso." });
        }
      );
    }
  );
});

// Endpoint para cancelar notificação de um livro específico
app.delete("/register-notification/:userId/:bookId", (req, res) => {
  const { userId, bookId } = req.params;

  db.run(
    `DELETE FROM livros_para_notificacao WHERE user_id = ? AND book_id = ?`,
    [userId, bookId],
    function (err) {
      if (err) {
        console.error("Erro ao cancelar registro de notificação:", err);
        return res
          .status(500)
          .json({ message: "Erro ao cancelar registro de notificação" });
      }
      res
        .status(200)
        .json({ message: "Registro de notificação cancelado com sucesso." });
    }
  );
});

// Endpoint para verificar se o usuário já registrou notificação para um livro específico
app.get("/check-notification/:userId/:bookId", (req, res) => {
  const { userId, bookId } = req.params;

  db.get(
    `SELECT * FROM livros_para_notificacao WHERE user_id = ? AND book_id = ?`,
    [userId, bookId],
    (err, row) => {
      if (err) {
        console.error("Erro ao verificar notificação:", err);
        return res
          .status(500)
          .json({ message: "Erro ao verificar notificação" });
      }
      if (row) {
        return res
          .status(200)
          .json({ message: "Notificação registrada", exists: true });
      } else {
        return res
          .status(200)
          .json({ message: "Nenhuma notificação registrada", exists: false });
      }
    }
  );
});

// Endpoint para adicionar uma nova notificação
app.post("/notifications", (req, res) => {
  const { userId, bookId, message } = req.body;
  console.log("Recebido para notificação:", req.body); // Adicionando log para depuração
  db.run(
    `INSERT INTO notificacoes (user_id, book_id, message) VALUES (?, ?, ?)`,
    [userId, bookId, message],
    function (err) {
      if (err) {
        console.error("Erro ao adicionar notificação:", err); // Adicionando log de erro
        return res
          .status(500)
          .json({ message: "Erro ao adicionar notificação" });
      }
      res.status(201).json({ id: this.lastID, userId, bookId, message });
    }
  );
});

// Endpoint para buscar notificações de um usuário específico
app.get("/notifications/:userId", (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT 
      notificacoes.id,
      notificacoes.message,
      notificacoes.timestamp,
      livros.id AS book_id,
      livros.nome_do_livro AS book_name,
      livros.imagem,
      livros.status AS book_status,
      livros.autor
    FROM notificacoes
    JOIN livros ON notificacoes.book_id = livros.id
    WHERE notificacoes.user_id = ?
  `;
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar notificações:", err);
      return res.status(500).json({ message: "Erro ao buscar notificações" });
    }
    res.json(rows);
  });
});

/////////////////////// DASHBOARD ///////////////////////

// Endpoint para obter dados do dashboard
app.get("/dashboard", async (req, res) => {
  const db = await openDb();
  const totalBooks = await db.get("SELECT COUNT(*) AS count FROM livros");
  const totalUsers = await db.get("SELECT COUNT(*) AS count FROM usuarios");
  const totalRented = await db.get(
    "SELECT COUNT(*) AS count FROM reservas WHERE status = 'Reservado'"
  );
  const totalReturned = await db.get(
    "SELECT COUNT(*) AS count FROM historico_devolucoes"
  );
  const totalFines = await db.get(
    "SELECT SUM(multa) AS total FROM reservas WHERE multa > 0"
  );

  res.json({
    totalBooks: totalBooks.count,
    totalUsers: totalUsers.count,
    totalRented: totalRented.count,
    totalReturned: totalReturned.count,
    totalFines: totalFines.total ? totalFines.total : 0,
  });
});

/////////////////////// LIVROS ///////////////////////

app.put("/livros/:id", (req, res) => {
  const { id } = req.params;
  const {
    nome_do_livro,
    autor,
    editora,
    sinopse,
    isbn,
    ano_publicacao,
    quantidade_disponivel,
    imagem,
    status,
  } = req.body;

  db.run(
    `UPDATE livros SET 
      nome_do_livro = ?, 
      autor = ?, 
      editora = ?, 
      sinopse = ?, 
      isbn = ?, 
      ano_publicacao = ?, 
      quantidade_disponivel = ?, 
      imagem = ?, 
      status = ?
    WHERE id = ?`,
    [
      nome_do_livro,
      autor,
      editora,
      sinopse,
      isbn,
      ano_publicacao,
      quantidade_disponivel,
      imagem,
      status,
      id,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar livro:", err);
        return res.status(500).json({ error: "Erro ao atualizar livro." });
      }
      res.status(200).json({ message: "Livro atualizado com sucesso!" });
    }
  );
});

app.put("/livros/:id", (req, res) => {
  const { id } = req.params;
  const {
    nome_do_livro,
    autor,
    editora,
    sinopse,
    isbn,
    ano_publicacao,
    quantidade_disponivel,
    imagem,
  } = req.body;

  db.run(
    `UPDATE livros SET 
      nome_do_livro = ?, 
      autor = ?, 
      editora = ?, 
      sinopse = ?, 
      isbn = ?, 
      ano_publicacao = ?, 
      quantidade_disponivel = ?, 
      imagem = ?
    WHERE id = ?`,
    [
      nome_do_livro,
      autor,
      editora,
      sinopse,
      isbn,
      ano_publicacao,
      quantidade_disponivel,
      imagem,
      id,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar livro:", err);
        return res.status(500).json({ error: "Erro ao atualizar livro." });
      }
      res.status(200).json({ message: "Livro atualizado com sucesso!" });
    }
  );
});

app.get("/livro-detalhes/:livroId/:usuarioId", (req, res) => {
  const { livroId, usuarioId } = req.params;

  if (!livroId || !usuarioId) {
    return res
      .status(400)
      .json({ error: "ID do livro ou usuário não fornecido" });
  }

  const query = `
    SELECT 
      livros.id AS livro_id,
      livros.nome_do_livro,
      livros.autor,
      livros.editora,
      livros.imagem,
      livros.sinopse,
      livros.status,
      livros.quantidade_disponivel,
      reservas.id AS reserva_id,
      reservas.status AS reserva_status,
      reservas.data_reserva,
      reservas.data_devolucao,
      historico_devolucoes.data_devolucao AS devolvido_em,
      reservas.multa,
      usuarios.userName AS nome_usuario,
      usuarios.email AS usuario_email,
      usuarios.cpf AS usuario_cpf,
      usuarios.telefone AS usuario_telefone
    FROM livros
    LEFT JOIN reservas ON livros.id = reservas.livro_id AND reservas.usuario_id = ?
    LEFT JOIN historico_devolucoes ON livros.id = historico_devolucoes.livro_id AND historico_devolucoes.usuario_id = ?
    LEFT JOIN usuarios ON reservas.usuario_id = usuarios.id
    WHERE livros.id = ?
  `;

  db.get(query, [usuarioId, usuarioId, livroId], (err, row) => {
    if (err) {
      console.error("Erro na consulta:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }

    if (!row) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }

    const bookDetails = {
      id: row.livro_id,
      nome_do_livro: row.nome_do_livro,
      autor: row.autor,
      editora: row.editora,
      imagem: row.imagem,
      sinopse: row.sinopse,
      status: row.status,
      quantidade_disponivel: row.quantidade_disponivel,
      reserva: {
        reserva_id: row.reserva_id,
        reserva_status: row.reserva_status,
        data_reserva: row.data_reserva,
        data_devolucao: row.data_devolucao,
        devolvido_em: row.devolvido_em,
        multa: row.multa,
      },
      usuario: {
        nome_usuario: row.nome_usuario,
        usuario_email: row.usuario_email,
        usuario_cpf: row.usuario_cpf,
        usuario_telefone: row.usuario_telefone,
      },
    };

    res.json(bookDetails);
  });
});

// Endpoint para atualizar o status do livro e notificar os usuários
app.put("/livros/:id", (req, res) => {
  const { status, userId } = req.body;

  db.get(
    `SELECT status FROM livros WHERE id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Erro ao buscar status atual do livro." });
      }

      const currentStatus = row?.status;
      db.run(
        `UPDATE livros SET status = ? WHERE id = ?`,
        [status, req.params.id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: "Erro ao atualizar status." });
          }

          if (currentStatus !== status) {
            const bookId = req.params.id;
            let message;

            if (status === "Disponível") {
              message = `O livro com ID ${bookId} está disponível.`;
            } else if (status === "Indisponível") {
              message = `O livro com ID ${bookId} está indisponível.`;
            }

            if (message) {
              createNotification(userId || bookId, message);
            }
          }

          res.status(200).json({ message: "Status atualizado com sucesso!" });
        }
      );
    }
  );
});

app.delete("/livros/:id", (req, res) => {
  db.run(`DELETE FROM livros WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Erro ao deletar o livro." });
    if (this.changes === 0)
      return res.status(404).json({ error: "Livro não encontrado." });
    res.status(200).json({ message: "Livro deletado com sucesso!" });
  });
});

// Endpoint para adicionar um livro
app.post('/livros', (req, res) => {
  const { nome_do_livro, autor, genero, editora, sinopse, isbn, ano_publicacao, imagem, quantidade_disponivel, local, numero, estante, status } = req.body;

  console.log("Recebendo dados para cadastro:", req.body);

  if (!nome_do_livro || !autor || !editora || !isbn || !ano_publicacao || !quantidade_disponivel || !local || !numero) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  // 📌 Verifica se o ISBN já existe no banco
  db.get('SELECT id FROM livros WHERE isbn = ?', [isbn], (err, row) => {
    if (err) {
      console.error('Erro ao verificar ISBN:', err);
      return res.status(500).json({ error: 'Erro ao verificar livro existente.' });
    }

    if (row) {
      return res.status(400).json({ error: 'Este livro já está cadastrado no sistema!' });
    }

    // 📌 Se o ISBN não existir, cadastra o livro
    const query = `
      INSERT INTO livros (nome_do_livro, autor, genero, editora, sinopse, isbn, ano_publicacao, imagem, quantidade_disponivel, local, numero, estante, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [nome_do_livro, autor, genero, editora, sinopse, isbn, ano_publicacao, imagem, quantidade_disponivel, local, numero, estante, status];

    db.run(query, params, function (err) {
      if (err) {
        console.error('Erro ao inserir livro no banco de dados:', err);
        return res.status(500).json({ error: 'Erro ao cadastrar livro. Tente novamente.' });
      }
      console.log("Livro cadastrado com sucesso! ID:", this.lastID);
      res.status(201).json({ id: this.lastID });
    });
  });
});


// 🔹 Buscar todos os livros

app.get("/livros", (req, res) => {
  const query = `
    SELECT 
      livros.id,
      livros.nome_do_livro,
      livros.genero,
      livros.autor,
      livros.editora,
      livros.sinopse,
      livros.isbn,
      livros.ano_publicacao,
      livros.quantidade_disponivel,
      livros.imagem,
      livros.status,
      COUNT(reservas.id) AS quantidade_reservada,
      (livros.quantidade_disponivel - COUNT(reservas.id)) AS quantidade_disponivel_nao_alugada
    FROM livros
    LEFT JOIN reservas ON livros.id = reservas.livro_id AND reservas.status = 'Reservado'
    GROUP BY livros.id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar os livros:", err);
      return res.status(500).json({ error: "Erro ao buscar os livros." });
    }

    const books = rows.map((row) => ({
      ...row,
      quantidade_disponivel_nao_alugada: Math.max(row.quantidade_disponivel_nao_alugada, 0),
      status: row.quantidade_disponivel_nao_alugada > 0 ? 'Disponível' : 'Indisponível'
    }));

    res.status(200).json(books);
  });
});

// 🔹 Buscar todos os livros

app.get("/livros", (req, res) => {
  const query = `
    SELECT 
      livros.id,
      livros.nome_do_livro,
      livros.genero,
      livros.autor,
      livros.editora,
      livros.sinopse,
      livros.isbn,
      livros.ano_publicacao,
      livros.quantidade_disponivel,
      livros.imagem,
      COUNT(reservas.id) AS quantidade_reservada,
      (livros.quantidade_disponivel - COUNT(reservas.id)) AS quantidade_disponivel_nao_alugada
    FROM livros
    LEFT JOIN reservas ON livros.id = reservas.livro_id AND reservas.status = 'Reservado'
    GROUP BY livros.id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar os livros:", err);
      return res.status(500).json({ error: "Erro ao buscar os livros." });
    }

    const books = rows.map((row) => ({
      ...row,
      quantidade_disponivel_nao_alugada:
        row.quantidade_disponivel - row.quantidade_reservada,
    }));

    res.status(200).json(books);
  });
});

// 🔹 Buscar um livro pelo ID
app.get("/livros/:id", (req, res) => {
  db.get(`SELECT * FROM livros WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar o livro." });
    if (!row) return res.status(404).json({ error: "Livro não encontrado." });
    res.status(200).json(row);
  });
});

// 🔹 Atualizar status do livro
app.put("/livros/:id", (req, res) => {
  const { status } = req.body;
  db.run(
    `UPDATE livros SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function (err) {
      if (err)
        return res.status(500).json({ error: "Erro ao atualizar status." });
      res.status(200).json({ message: "Status atualizado com sucesso!" });
    }
  );
});

// Endpoint para buscar livros com informações de reservas, usuários, status e multa
app.get("/livros-com-reservas", (req, res) => {
  const query = `
      SELECT 
        livros.id AS livro_id,
        livros.nome_do_livro,
        livros.autor,
        livros.editora,
        livros.imagem,
        livros.status AS livro_status,
        reservas.id AS reserva_id,
        reservas.status AS reserva_status,
        reservas.multa,
        reservas.data_devolucao,
        usuarios.id AS usuario_id,
        usuarios.userName AS usuario
      FROM livros
      LEFT JOIN reservas ON livros.id = reservas.livro_id AND reservas.status = 'Reservado'
      LEFT JOIN usuarios ON reservas.usuario_id = usuarios.id
      WHERE livros.status != 'Removido'
    `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar livros com reservas:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar livros com reservas." });
    }
    res.status(200).json(rows);
  });
});

// Endpoint para buscar detalhes do livro
// Endpoint para buscar detalhes do livro
app.get("/livro-detalhes/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID do livro não fornecido" });
  }

  const query = `
    SELECT 
      livros.id AS livro_id,
      livros.nome_do_livro,
      livros.autor,
      livros.genero,
      livros.editora,
      livros.imagem,
      livros.sinopse,
      livros.isbn,
      livros.ano_publicacao,
      livros.quantidade_disponivel,
      livros.status,
      livros.local,
      livros.numero,
      livros.estante,
      COALESCE(COUNT(reservas.id), 0) AS quantidade_reservada,
      (livros.quantidade_disponivel - COALESCE(COUNT(reservas.id), 0)) AS quantidade_disponivel_nao_alugada,

      reservas.id AS reserva_id,
      reservas.status AS reserva_status,
      reservas.data_reserva,
      reservas.data_devolucao,
      reservas.multa,
      reservas.numero_unidade, -- 👈 INCLUÍDO AQUI 🔥

      usuarios.id AS usuario_id,
      usuarios.userName AS nome_usuario,
      usuarios.email AS usuario_email,
      usuarios.cpf AS usuario_cpf,
      usuarios.telefone AS usuario_telefone

    FROM livros
    LEFT JOIN reservas ON livros.id = reservas.livro_id AND reservas.status = 'Reservado'
    LEFT JOIN usuarios ON reservas.usuario_id = usuarios.id
    WHERE livros.id = ?
    GROUP BY 
      livros.id, livros.nome_do_livro, livros.autor, livros.genero, livros.editora, livros.imagem, livros.sinopse, livros.isbn, 
      livros.ano_publicacao, livros.quantidade_disponivel, livros.status, livros.local, livros.numero, livros.estante,
      reservas.id, reservas.status, reservas.data_reserva, reservas.data_devolucao, reservas.multa, reservas.numero_unidade, -- 👈 GARANTIR GROUP BY
      usuarios.id, usuarios.userName, usuarios.email, usuarios.cpf, usuarios.telefone;
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error("🚨 Erro na consulta:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }

    // Agrupar reservas por usuário
    const reservasPorUsuario = rows.reduce((acc, row) => {
      if (!row.reserva_id) return acc;

      const usuarioIndex = acc.findIndex(user => user.usuario_id === row.usuario_id);
      const reservaInfo = {
        reserva_id: row.reserva_id,
        reserva_status: row.reserva_status,
        data_reserva: row.data_reserva,
        data_devolucao: row.data_devolucao,
        multa: row.multa,
        numero_unidade: row.numero_unidade, // ✅ Passa pro frontend
        tempo_atraso: row.multa > 0 ? Math.floor(row.multa / 2) : 0,
      };

      if (usuarioIndex > -1) {
        acc[usuarioIndex].reservas.push(reservaInfo);
      } else {
        acc.push({
          usuario_id: row.usuario_id,
          nome_usuario: row.nome_usuario,
          usuario_email: row.usuario_email,
          usuario_cpf: row.usuario_cpf,
          usuario_telefone: row.usuario_telefone,
          reservas: [reservaInfo],
        });
      }
      return acc;
    }, []);

    const bookDetails = {
      id: rows[0].livro_id,
      nome_do_livro: rows[0].nome_do_livro,
      autor: rows[0].autor,
      genero: rows[0].genero,
      editora: rows[0].editora,
      imagem: rows[0].imagem,
      sinopse: rows[0].sinopse,
      isbn: rows[0].isbn,
      ano_publicacao: rows[0].ano_publicacao,
      quantidade_disponivel: rows[0].quantidade_disponivel,
      status: rows[0].status,
      local: rows[0].local,
      numero: rows[0].numero,
      estante: rows[0].estante,
      quantidade_reservada: rows[0].quantidade_reservada,
      quantidade_disponivel_nao_alugada: Math.max(rows[0].quantidade_disponivel_nao_alugada, 0),
      reservasPorUsuario,
    };

    res.json(bookDetails);
  });
});


app.get("/livro-detalhes/:livroId/:usuarioId", async (req, res) => {
  const { livroId, usuarioId } = req.params;
  const db = await openDb();

  try {
    const livro = await db.get(`SELECT * FROM livros WHERE id = ?`, [livroId]);

    if (!livro) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }

    const reservas = await db.all(
      `SELECT 
        r.id AS reserva_id,
        r.status AS reserva_status,
        r.data_reserva,
        r.data_devolucao,
        r.multa,
        r.numero_unidade,
        u.id AS usuario_id,
        u.userName AS nome_usuario,
        u.email AS usuario_email,
        u.cpf AS usuario_cpf,
        u.telefone AS usuario_telefone
      FROM reservas r
      JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.livro_id = ? AND r.usuario_id = ? AND r.status = 'Reservado'`,
      [livroId, usuarioId]
    );

    const reservasPorUsuario = reservas.length > 0
      ? [{
          usuario_id: reservas[0].usuario_id,
          nome_usuario: reservas[0].nome_usuario,
          usuario_email: reservas[0].usuario_email,
          usuario_cpf: reservas[0].usuario_cpf,
          usuario_telefone: reservas[0].usuario_telefone,
          reservas: reservas.map((r) => ({
            reserva_id: r.reserva_id,
            reserva_status: r.reserva_status,
            data_reserva: r.data_reserva,
            data_devolucao: r.data_devolucao,
            multa: r.multa,
            numero_unidade: r.numero_unidade
          }))
        }]
      : [];

    res.json({
      ...livro,
      reservasPorUsuario
    });
  } catch (err) {
    console.error("Erro ao buscar detalhes do livro:", err);
    res.status(500).json({ error: "Erro ao buscar detalhes do livro" });
  }
});







app.get("/livro-detalhes/:id", async (req, res) => {
  const { id } = req.params;
  const db = await openDb();

  try {
    const livroBase = await db.get(
      `SELECT * FROM livros WHERE id = ?`,
      [id]
    );

    if (!livroBase) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }

    const reservas = await db.all(
      `SELECT 
        r.id AS reserva_id,
        r.status AS reserva_status,
        r.data_reserva,
        r.data_devolucao,
        r.multa,
        r.numero_unidade,
        u.id AS usuario_id,
        u.userName AS nome_usuario,
        u.email AS usuario_email,
        u.cpf AS usuario_cpf,
        u.telefone AS usuario_telefone
      FROM reservas r
      JOIN usuarios u ON u.id = r.usuario_id
      WHERE r.livro_id = ? AND r.status = 'Reservado'`,
      [id]
    );

    // Agrupar reservas por usuário
    const reservasPorUsuario = reservas.reduce((acc, row) => {
      const usuarioIndex = acc.findIndex((u) => u.usuario_id === row.usuario_id);
      const reservaInfo = {
        reserva_id: row.reserva_id,
        reserva_status: row.reserva_status,
        data_reserva: row.data_reserva,
        data_devolucao: row.data_devolucao,
        multa: row.multa,
        numero_unidade: row.numero_unidade,
      };

      if (usuarioIndex > -1) {
        acc[usuarioIndex].reservas.push(reservaInfo);
      } else {
        acc.push({
          usuario_id: row.usuario_id,
          nome_usuario: row.nome_usuario,
          usuario_email: row.usuario_email,
          usuario_cpf: row.usuario_cpf,
          usuario_telefone: row.usuario_telefone,
          reservas: [reservaInfo],
        });
      }

      return acc;
    }, []);

    const livroDetalhado = {
      ...livroBase,
      reservasPorUsuario
    };

    res.json(livroDetalhado);
  } catch (err) {
    console.error("Erro ao buscar detalhes do livro:", err);
    res.status(500).json({ error: "Erro ao buscar detalhes do livro" });
  }
});



// Endpoint para atualizar detalhes do livro
// Endpoint para atualizar detalhes do livro
app.put("/livros/:id", (req, res) => {
  const { id } = req.params;
  const {
    nome_do_livro,
    autor,
    editora,
    sinopse,
    isbn,
    ano_publicacao,
    quantidade_disponivel,
    imagem,
    status,
    local,
    numero,
    estante
  } = req.body;

  // Verifica se todos os campos obrigatórios estão presentes
  if (!nome_do_livro || !autor || !editora || !isbn || !ano_publicacao || !quantidade_disponivel) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  db.run(
    `UPDATE livros SET 
      nome_do_livro = ?, 
      autor = ?, 
      editora = ?, 
      sinopse = ?, 
      isbn = ?, 
      ano_publicacao = ?, 
      quantidade_disponivel = ?, 
      imagem = ?, 
      status = ?,
      local = ?,
      numero = ?,
      estante = ?
    WHERE id = ?`,
    [
      nome_do_livro,
      autor,
      editora,
      sinopse,
      isbn,
      ano_publicacao,
      quantidade_disponivel,
      imagem,
      status,
      local,
      numero,
      estante,
      id,
    ],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar livro:", err);
        return res.status(500).json({ error: "Erro ao atualizar livro." });
      }
      res.status(200).json({ message: "Livro atualizado com sucesso!" });
    }
  );
});

/////////////////////// LOGIN E REGISTRO /////////////////////////////

// Endpoint de login sem bcrypt
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  db.get(
    `SELECT * FROM usuarios WHERE email = ?`,
    [email],
    async (err, user) => {
      if (err) {
        console.error("Erro ao buscar usuário:", err.message);
        return res.status(500).json({ error: "Erro ao buscar usuário." });
      }

      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado." });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Senha incorreta." });
      }

      res.status(200).json({
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role, // Retorna a função do usuário
      });
    }
  );
});

const bcrypt = require("bcrypt");
const saltRounds = 10; // Número de rounds de hashing

app.post("/register", async (req, res) => {
  const { userName, email, password, cpf, telefone, role } = req.body;

  if (!userName || !email || !password || !cpf) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Definir "role" apenas se for um admin criando um novo admin
    const userRole = role === "admin" ? "admin" : "user";

    db.run(
      `INSERT INTO usuarios (userName, email, password, cpf, telefone, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [userName, email, hashedPassword, cpf, telefone, userRole],
      function (err) {
        if (err) {
          console.error("Erro ao registrar usuário:", err);
          return res.status(500).json({ error: "Erro ao registrar usuário" });
        }
        res.status(201).json({ message: "Usuário registrado com sucesso!" });
      }
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

/////////////////////// RESERVAS ///////////////////////

// Rota para deletar a reserva
app.delete("/reservas/:livro_id", (req, res) => {
  const { livro_id } = req.params;

  db.run("DELETE FROM reservas WHERE livro_id = ?", [livro_id], function (err) {
    if (err) {
      console.error("Erro ao remover reserva:", err);
      return res.status(500).json({ message: "Erro ao remover reserva" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }

    return res.json({ message: "Reserva removida com sucesso." });
  });
});

// Rota para deletar uma reserva específica
app.delete("/reservas/:livro_id/:usuario_id", async (req, res) => {
  const { livro_id, usuario_id } = req.params;
  const dbInstance = await openDb();

  try {
    // Buscar reserva ativa vinculada ao usuário e ao livro
    const reserva = await dbInstance.get(
      `SELECT r.*, u.userName, u.email, u.cpf, u.telefone, u.bloqueado 
       FROM reservas r 
       JOIN usuarios u ON r.usuario_id = u.id 
       WHERE r.livro_id = ? AND r.usuario_id = ? AND r.status = 'Reservado'`,
      [livro_id, usuario_id]
    );

    // Caso não exista
    if (!reserva) {
      return res.status(404).json({ error: "Reserva não encontrada." });
    }

    // Inserir no histórico com todos os dados + unidade
    const jaRegistrado = await db.get(
      `SELECT id FROM historico_devolucoes WHERE usuario_id = ? AND livro_id = ? AND status = 'Devolvido'`,
      [reserva.usuario_id, reserva.livro_id]
    );
    
    if (!jaRegistrado) {
      await db.run(
        `INSERT INTO historico_devolucoes (
          usuario_id, livro_id, data_reserva, data_devolucao, data_devolvido,
          status, multa, dias_atraso, userName, email, cpf, telefone, bloqueado, numero_unidade
        )
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reserva.usuario_id,
          reserva.livro_id,
          reserva.data_reserva,
          reserva.data_devolucao,
          "Devolvido",
          reserva.multa,
          reserva.dias_atraso,
          reserva.userName,
          reserva.email,
          reserva.cpf,
          reserva.telefone,
          reserva.bloqueado,
          reserva.numero_unidade
        ]
      );
    }
    

    // Deletar a reserva original
    await dbInstance.run(
      `DELETE FROM reservas WHERE id = ?`,
      reserva.id
    );

    res.json({
      message: `Reserva da unidade ${reserva.numero_unidade} cancelada e registrada no histórico.`,
      numero_unidade: reserva.numero_unidade,
      livro_id,
      usuario_id
    });
  } catch (err) {
    console.error("❌ Erro ao cancelar reserva:", err);
    res.status(500).json({ error: "Erro ao cancelar reserva." });
  }
});


// Modificar a tabela reservas para armazenar o número de dias em atraso e a multa
db.run(
  `ALTER TABLE reservas ADD COLUMN dias_atraso INTEGER DEFAULT 0`,
  (err) => {
    if (err && err.message.includes("duplicate column name")) {
      console.log("A coluna dias_atraso já existe.");
    } else if (err) {
      console.error("Erro ao adicionar coluna dias_atraso:", err);
    } else {
      console.log("Coluna dias_atraso adicionada com sucesso.");
    }
  }
);

// Atualizar a lógica de multa ao criar uma reserva
app.post("/reservas", (req, res) => {
  const { livro_id, usuario_id, data_reserva, data_devolucao, status, multa } =
    req.body;

  if (!livro_id || !usuario_id || !data_reserva || !data_devolucao || !status) {
    return res
      .status(400)
      .json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  // Verificar se o usuário está bloqueado
  db.get(
    `SELECT bloqueado FROM usuarios WHERE id = ?`,
    [usuario_id],
    (err, row) => {
      if (err) {
        console.error("Erro ao verificar bloqueio do usuário:", err);
        return res
          .status(500)
          .json({ error: "Erro ao verificar bloqueio do usuário." });
      }

      if (row.bloqueado) {
        return res
          .status(403)
          .json({
            error: "Usuário bloqueado. Não é possível reservar livros.",
          });
      }

      // Verificar se o usuário já reservou este livro
      db.get(
        `SELECT * FROM reservas WHERE livro_id = ? AND usuario_id = ? AND status = 'Reservado'`,
        [livro_id, usuario_id],
        (err, row) => {
          if (err) {
            console.error("Erro ao verificar reservas existentes:", err);
            return res
              .status(500)
              .json({ error: "Erro ao verificar reservas existentes." });
          }

          if (row) {
            return res
              .status(400)
              .json({ error: "Você já reservou este livro." });
          }

          const query = `INSERT INTO reservas (livro_id, usuario_id, data_reserva, data_devolucao, status, multa) VALUES (?, ?, ?, ?, ?, ?)`;

          db.run(
            query,
            [livro_id, usuario_id, data_reserva, data_devolucao, status, multa],
            function (err) {
              if (err) {
                console.error("Erro ao criar reserva:", err);
                return res
                  .status(500)
                  .json({ error: "Erro ao criar reserva." });
              }

              res.status(201).json({
                id: this.lastID,
                livro_id,
                usuario_id,
                data_reserva,
                data_devolucao,
                status,
                multa,
              });
            }
          );
        }
      );
    }
  );
});

// Endpoint para marcar devolução de um livro
app.put("/reservas/:id/devolver", async (req, res) => {
  const { id } = req.params;
  const db = await openDb();

  try {
    // 1. Busca a reserva original
    const reserva = await db.get(`SELECT * FROM reservas WHERE id = ?`, [id]);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva não encontrada." });
    }

    // 2. Marca a reserva como devolvida
    await db.run(
      `UPDATE reservas SET status = 'Devolvido', data_devolvido = DATETIME('now') WHERE id = ?`,
      [id]
    );

    // 3. Verifica se há alguém na fila
    const proximoDaFila = await db.get(
      `SELECT * FROM fila_reservas WHERE livro_id = ? ORDER BY data_entrada ASC LIMIT 1`,
      [reserva.livro_id]
    );

    if (proximoDaFila) {
      // 4. Cria nova reserva com a mesma unidade liberada
      await db.run(
        `INSERT INTO reservas (
          livro_id, usuario_id, numero_unidade, status, data_reserva, data_devolucao
        ) VALUES (?, ?, ?, 'Reservado', DATETIME('now'), DATETIME('now', '+7 days'))`,
        [reserva.livro_id, proximoDaFila.usuario_id, reserva.numero_unidade]
      );

      // 5. Remove da fila
      await db.run(
        `DELETE FROM fila_reservas WHERE id = ?`,
        [proximoDaFila.id]
      );

      console.log(`✅ Usuário ${proximoDaFila.usuario_id} foi automaticamente reservado da fila.`);
    }

    res.status(200).json({ message: "Livro devolvido com sucesso." });
  } catch (err) {
    console.error("Erro ao devolver reserva:", err);
    res.status(500).json({ error: "Erro ao devolver reserva." });
  }
});






















///////////////comentários dos administradores/////////////////////////////

app.get("/usuarios/:userId/comentarios", async (req, res) => {
  const { userId } = req.params;
  const db = await openDb();

  try {
    const comentarios = await db.all(
      `
      SELECT id, comment, created_at FROM admin_comments WHERE user_id = ? ORDER BY created_at DESC
    `,
      [userId]
    );

    res.json(comentarios);
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    res.status(500).json({ error: "Erro ao buscar comentários." });
  }
});

app.post("/usuarios/:userId/comentario", async (req, res) => {
  const { userId } = req.params;
  const { comment } = req.body;
  const db = await openDb();

  try {
    const result = await db.run(
      `
  INSERT INTO admin_comments (user_id, comment, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [userId, comment]
    );

    res.json({
      id: result.lastID,
      comment,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    res.status(500).json({ error: "Erro ao adicionar comentário." });
  }
});

app.delete("/usuarios/comentario/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const db = await openDb();

  try {
    await db.run(`DELETE FROM admin_comments WHERE id = ?`, [commentId]);
    res.json({ message: "Comentário deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    res.status(500).json({ error: "Erro ao deletar comentário." });
  }
});



// Endpoint para adicionar observação de devolução
app.post("/observacoes-devolucoes", (req, res) => {
  const { livro_id, usuario_id, observacao } = req.body;

  const query = `
    INSERT INTO observacoes_devolucoes (livro_id, usuario_id, observacao)
    VALUES (?, ?, ?)
  `;

  db.run(query, [livro_id, usuario_id, observacao], function (err) {
    if (err) {
      console.error("Erro ao adicionar observação:", err);
      return res.status(500).json({ error: "Erro ao adicionar observação." });
    }
    res.status(201).json({ message: "Observação adicionada com sucesso!" });
  });
});

// Endpoint para buscar observações de devolução
app.get("/observacoes-devolucoes/:livroId/:usuarioId", (req, res) => {
  const { livroId, usuarioId } = req.params;

  const query = `
    SELECT * FROM observacoes_devolucoes
    WHERE livro_id = ? AND usuario_id = ?
    ORDER BY data DESC
  `;

  db.all(query, [livroId, usuarioId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar observações:", err);
      return res.status(500).json({ error: "Erro ao buscar observações." });
    }
    res.status(200).json(rows);
  });
});

// Endpoint para deletar observação de devolução
app.delete("/observacoes-devolucoes/:id", (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM observacoes_devolucoes
    WHERE id = ?
  `;

  db.run(query, [id], function (err) {
    if (err) {
      console.error("Erro ao deletar observação:", err);
      return res.status(500).json({ error: "Erro ao deletar observação." });
    }
    res.status(200).json({ message: "Observação deletada com sucesso!" });
  });
});




















/////////////////////// USUARIOS ///////////////////////

app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM usuarios WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Erro ao deletar usuário:", err);
      return res.status(500).json({ error: "Erro ao deletar usuário." });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.status(200).json({ message: "Usuário excluído com sucesso!" });
  });
});

app.put("/usuarios/:id/bloquear", (req, res) => {
  const { id } = req.params;
  const { bloqueado } = req.body;

  db.run(
    `UPDATE usuarios SET bloqueado = ? WHERE id = ?`,
    [bloqueado ? 1 : 0, id],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar status de bloqueio:", err);
        return res
          .status(500)
          .json({ error: "Erro ao atualizar status de bloqueio." });
      }
      res
        .status(200)
        .json({ message: "Status de bloqueio atualizado com sucesso!" });
    }
  );
});

app.get("/usuarios/:userId/historico-reservas", async (req, res) => {
  const { userId } = req.params;
  const db = await openDb();

  try {
    const historicoReservas = await db.all(
      `
      SELECT h.livro_id, l.nome_do_livro, l.autor, l.imagem, h.data_reserva, h.data_devolucao, h.data_devolvido, h.multa
      FROM historico_devolucoes h
      JOIN livros l ON h.livro_id = l.id
      WHERE h.usuario_id = ?
    `,
      [userId]
    );

    res.json(historicoReservas);
  } catch (error) {
    console.error("Erro ao buscar histórico de reservas:", error);
    res.status(500).json({ error: "Erro ao buscar histórico de reservas." });
  }
});

app.get("/usuarios", (req, res) => {
  const query = `
    SELECT 
      usuarios.id, 
      usuarios.userName, 
      usuarios.email, 
      usuarios.telefone, 
      livros.id AS livro_id,
      livros.nome_do_livro, 
      livros.imagem, 
      livros.status,
      reservas.id AS reserva_id, 
      reservas.data_reserva,
      reservas.data_devolucao,
      reservas.multa
    FROM usuarios
    LEFT JOIN reservas ON usuarios.id = reservas.usuario_id
    LEFT JOIN livros ON reservas.livro_id = livros.id
  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erro ao buscar usuários e reservas:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar usuários e reservas" });
    }

    const usuarios = rows.reduce((acc, row) => {
      let user = acc.find((u) => u.id === row.id);
      if (user) {
        user.livrosReservados.push({
          id: row.livro_id,
          nome_do_livro: row.nome_do_livro,
          imagem: row.imagem,
          status: row.status,
          data_reserva: row.data_reserva,
          data_devolucao: row.data_devolucao,
          multa: row.multa,
          reservaId: row.reserva_id,
        });
      } else {
        acc.push({
          id: row.id,
          userName: row.userName,
          email: row.email,
          telefone: row.telefone,
          livrosReservados: row.livro_id
            ? [
                {
                  id: row.livro_id,
                  nome_do_livro: row.nome_do_livro,
                  imagem: row.imagem,
                  status: row.status,
                  data_reserva: row.data_reserva,
                  data_devolucao: row.data_devolucao,
                  multa: row.multa,
                  reservaId: row.reserva_id,
                },
              ]
            : [],
        });
      }
      return acc;
    }, []);

    res.status(200).json(usuarios);
  });
});

// Endpoint para pegar os usuários com os livros reservados
app.get("/usuarios", (req, res) => {
  console.log("Requisição para /usuarios recebida");
  const query = `
      SELECT usuarios.id, usuarios.nome, usuarios.email, usuarios.telefone, 
            livros.nome_do_livro, livros.status, reservas.data_reserva, reservas.atrasado
      FROM usuarios
      LEFT JOIN reservas ON usuarios.id = reservas.usuario_id
      LEFT JOIN livros ON reservas.livro_id = livros.id
    `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error("Erro ao buscar usuários e reservas:", err);
      return res.status(500).json({ error: "Erro ao buscar usuários" });
    }

    console.log("Usuários encontrados:", rows);
    const usuarios = rows.reduce((acc, row) => {
      const user = acc.find((u) => u.id === row.id);
      if (user) {
        user.reservas.push({
          nome_do_livro: row.nome_do_livro,
          status: row.status,
          data_reserva: row.data_reserva,
          atrasado: row.atrasado,
        });
      } else {
        acc.push({
          id: row.id,
          nome: row.nome,
          email: row.email,
          telefone: row.telefone,
          reservas: [
            {
              nome_do_livro: row.nome_do_livro,
              status: row.status,
              data_reserva: row.data_reserva,
              atrasado: row.atrasado,
            },
          ],
        });
      }
      return acc;
    }, []);

    res.status(200).json(usuarios);
  });
});

app.get("/usuario-logado", (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID do usuário não fornecido." });
  }

  const query = `
    SELECT u.id, u.userName, u.email, u.telefone, u.role, 
           COALESCE(SUM(r.multa), 0) AS multa 
    FROM usuarios u
    LEFT JOIN reservas r ON u.id = r.usuario_id
    WHERE u.id = ?
    GROUP BY u.id
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao buscar usuário." });
    }
    if (!row) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }
    res.json(row);
  });
});

// Endpoint para buscar informações do perfil do usuário
// Endpoint para buscar informações do perfil do usuário
app.get("/perfil-usuario/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT userName, email, telefone, cpf
    FROM usuarios
    WHERE id = ?
  `;

  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error("Erro ao buscar informações do usuário:", err);
      return res.status(500).json({ error: "Erro ao buscar informações do usuário." });
    }

    if (!row) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Buscar reservas do usuário
    const reservasQuery = `
      SELECT livros.id AS livroId, livros.nome_do_livro, reservas.data_reserva, reservas.data_devolucao, reservas.multa
      FROM reservas
      JOIN livros ON reservas.livro_id = livros.id
      WHERE reservas.usuario_id = ?
    `;

    db.all(reservasQuery, [userId], (err, reservas) => {
      if (err) {
        console.error("Erro ao buscar reservas do usuário:", err);
        return res.status(500).json({ error: "Erro ao buscar reservas do usuário." });
      }

      res.json({ ...row, reservas });
    });
  });
});

app.get("/perfil-usuario/:userId", async (req, res) => {
  const { userId } = req.params;
  const db = await openDb();

  try {
    // Buscar dados do usuário
    const usuario = await db.get(
      `
      SELECT id, userName, email, telefone, bloqueado, multa
      FROM usuarios WHERE id = ?`,
      [userId]
    );

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Buscar reservas ativas do usuário
    const reservas = await db.all(
      `
      SELECT r.id AS reserva_id, r.livro_id, l.nome_do_livro, l.imagem, r.data_reserva, r.data_devolucao, r.status, r.multa
      FROM reservas r
      JOIN livros l ON r.livro_id = l.id
      WHERE r.usuario_id = ? AND r.status = 'Reservado'
    `,
      [userId]
    );

    // Buscar histórico de devoluções
    const devolucoes = await db.all(
      `
      SELECT h.id AS devolucao_id, h.livro_id, l.nome_do_livro, l.imagem, h.data_reserva, h.data_devolucao, h.data_devolvido, h.status, h.multa
      FROM historico_devolucoes h
      JOIN livros l ON h.livro_id = l.id
      WHERE h.usuario_id = ?
    `,
      [userId]
    );

    res.json({ ...usuario, reservas, devolucoes });
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    res.status(500).json({ error: "Erro ao buscar perfil do usuário." });
  }
});

/////////////////////// MULTAS ///////////////////////

// Rota para calcular e atualizar a multa
app.post("/atualizar-multa/:reserva_id", (req, res) => {
  const { reserva_id } = req.params;

  db.get(
    `SELECT data_devolucao FROM reservas WHERE id = ?`,
    [reserva_id],
    (err, row) => {
      if (err) {
        console.error("Erro ao buscar reserva:", err);
        return res.status(500).json({ error: "Erro ao buscar reserva." });
      }

      if (!row) {
        return res.status(404).json({ error: "Reserva não encontrada." });
      }

      const data_devolucao = new Date(row.data_devolucao);
      const hoje = new Date();
      let dias_atraso = Math.ceil(
        (hoje - data_devolucao) / (1000 * 60 * 60 * 24)
      );
      dias_atraso = dias_atraso > 0 ? dias_atraso : 0; // garantir que dias_atraso não seja negativo

      const multa = 10 + dias_atraso * 2;

      db.run(
        `UPDATE reservas SET multa = ?, dias_atraso = ? WHERE id = ?`,
        [multa, dias_atraso, reserva_id],
        function (err) {
          if (err) {
            console.error("Erro ao atualizar multa:", err);
            return res.status(500).json({ error: "Erro ao atualizar multa." });
          }

          res
            .status(200)
            .json({
              message: "Multa atualizada com sucesso!",
              multa,
              dias_atraso,
            });
        }
      );
    }
  );
});

// Rota para pagar a multa
app.post("/pagar-multa/:id", (req, res) => {
  const { id } = req.params;

  // Atualizar a multa no banco de dados
  db.run(
    "UPDATE reservas SET multa = 0 WHERE livro_id = ?",
    [id],
    function (err) {
      if (err) {
        console.error("Erro ao pagar multa:", err);
        return res.status(500).json({ error: "Erro ao pagar a multa" });
      }

      // Confirmar pagamento da multa
      res.status(200).json({ message: "Multa paga com sucesso" });
    }
  );
});

app.get("/multas", async (req, res) => {
  const db = await openDb();

  try {
    const multas = await db.all(`
      SELECT 
        u.id AS usuario_id, 
        u.userName AS usuario, 
        SUM(r.multa) AS total_multa
      FROM reservas r
      JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.multa > 0
      GROUP BY u.id
      ORDER BY total_multa DESC
    `);

    res.json(multas);
  } catch (error) {
    console.error("Erro ao buscar multas:", error);
    res.status(500).json({ error: "Erro ao buscar multas." });
  }
});

app.post("/adicionar-multa", (req, res) => {
  const { reserva_id, valor_multa } = req.body;

  if (!reserva_id || valor_multa === undefined) {
    return res
      .status(400)
      .json({ error: "Reserva ID e valor da multa são obrigatórios." });
  }

  db.run(
    `UPDATE reservas SET multa = ? WHERE id = ?`,
    [valor_multa, reserva_id],
    function (err) {
      if (err) {
        console.error("Erro ao adicionar multa:", err);
        return res.status(500).json({ error: "Erro ao adicionar multa." });
      }
      res.status(200).json({ message: "Multa adicionada com sucesso!" });
    }
  );
});

/////////////////////// BOOK STATUS ///////////////////////

// 🔹 Buscar status do livro por ID
app.get("/book-status/:id", (req, res) => {
  db.get(
    "SELECT * FROM reservas WHERE livro_id = ?",
    [req.params.id],
    (err, row) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Erro ao buscar status do livro" });
      res.json(row);
    }
  );
});

/////////////////////// HISTORICO ///////////////////////


app.put("/reservas/:id/devolver-e-registrar", async (req, res) => {
  const { id } = req.params;
  const db = await openDb();

  try {
    const reserva = await db.get(`
      SELECT r.*, u.userName, u.email, u.cpf, u.telefone, u.bloqueado 
      FROM reservas r 
      JOIN usuarios u ON r.usuario_id = u.id 
      WHERE r.id = ?`, [id]);

    if (!reserva) {
      return res.status(404).json({ error: "Reserva não encontrada." });
    }

    // Atualizar status da reserva
    await db.run(`
      UPDATE reservas SET status = 'Devolvido', data_devolvido = DATETIME('now')
      WHERE id = ?`, [id]);

    // Registrar no histórico
    await db.run(`
      INSERT INTO historico_devolucoes (
        usuario_id, livro_id, data_reserva, data_devolucao, data_devolvido, 
        status, multa, dias_atraso, userName, email, cpf, telefone, bloqueado, numero_unidade
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      reserva.usuario_id,
      reserva.livro_id,
      reserva.data_reserva,
      reserva.data_devolucao,
      reserva.status,
      reserva.multa,
      reserva.dias_atraso,
      reserva.userName,
      reserva.email,
      reserva.cpf,
      reserva.telefone,
      reserva.bloqueado,
      reserva.numero_unidade,
    ]);

    res.status(200).json({ message: "Livro devolvido e registrado no histórico com sucesso!" });
  } catch (err) {
    console.error("Erro ao devolver e registrar:", err);
    res.status(500).json({ error: "Erro ao devolver e registrar histórico." });
  }
});


app.get("/historico-devolucoes/:livro_id/:usuario_id", async (req, res) => {
  const { livro_id, usuario_id } = req.params;
  const dbInstance = await openDb();

  try {
    const devolucao = await dbInstance.get(
      `SELECT h.id, h.usuario_id, h.livro_id, h.data_reserva, h.data_devolucao, 
              h.data_devolvido, h.status, h.multa, h.dias_atraso,
              h.userName, h.email, h.cpf, h.telefone, h.bloqueado,
              h.numero_unidade, 
              l.nome_do_livro, l.autor, l.editora, l.sinopse, l.imagem, l.quantidade_disponivel
       FROM historico_devolucoes h
       JOIN livros l ON h.livro_id = l.id
       WHERE h.livro_id = ? AND h.usuario_id = ?
       ORDER BY h.data_devolvido DESC LIMIT 1`,
      [livro_id, usuario_id]
    );

    if (!devolucao) {
      return res.status(404).json({ error: "Devolução não encontrada." });
    }

    res.json(devolucao);
  } catch (err) {
    console.error("Erro ao buscar histórico de devolução:", err);
    res.status(500).json({ error: "Erro interno ao buscar devolução." });
  }
});


app.get("/historico-devolucoes", async (req, res) => {
  const db = await openDb();

  try {
    const historico = await db.all(`
      SELECT 
        h.id,
        h.usuario_id,
        h.userName AS usuario,
        h.livro_id,
        l.nome_do_livro AS livro,
        l.autor,
        l.imagem,
        h.data_reserva,
        h.data_devolucao,
        h.data_devolvido
      FROM historico_devolucoes h
      JOIN livros l ON h.livro_id = l.id
      ORDER BY h.data_devolvido DESC
    `);

    res.json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico de devoluções:", error);
    res.status(500).json({ error: "Erro ao buscar histórico de devoluções." });
  }
});

app.get("/reservas/historico", async (req, res) => {
  const db = await openDb();

  try {
    const reservas = await db.all(`
      SELECT 
        r.id,
        r.data_reserva,
        r.data_devolucao,
        r.status,
        r.numero_unidade,
        u.userName AS usuario,
        l.nome_do_livro AS livro
      FROM reservas r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN livros l ON r.livro_id = l.id
      WHERE r.status = 'Reservado'
      ORDER BY r.data_reserva DESC
    `);

    res.json(reservas);
  } catch (err) {
    console.error("Erro ao buscar histórico de reservas:", err);
    res.status(500).json({ error: "Erro ao buscar reservas." });
  }
});


app.post("/reservar-unidade", async (req, res) => {
  const { livro_id, usuario_id } = req.body;

  if (!livro_id || !usuario_id) {
    return res.status(400).json({ error: "Campos obrigatórios não fornecidos." });
  }

  const dbInstance = await openDb();

  try {
    const user = await dbInstance.get(`SELECT bloqueado FROM usuarios WHERE id = ?`, [usuario_id]);
    if (!user || user.bloqueado) {
      return res.status(403).json({ error: "Usuário não autorizado ou bloqueado." });
    }

    const jaReservado = await dbInstance.get(
      `SELECT id FROM reservas WHERE livro_id = ? AND usuario_id = ? AND status = 'Reservado'`,
      [livro_id, usuario_id]
    );
    if (jaReservado) {
      return res.status(400).json({ error: "Você já reservou este livro." });
    }

    const unidadesReservadas = await dbInstance.all(
      `SELECT numero_unidade FROM reservas WHERE livro_id = ? AND status = 'Reservado'`,
      [livro_id]
    );

    const livroInfo = await dbInstance.get(
      `SELECT quantidade_disponivel FROM livros WHERE id = ?`,
      [livro_id]
    );

    if (!livroInfo) {
      return res.status(404).json({ error: "Livro não encontrado." });
    }

    const todasUnidades = Array.from(
      { length: livroInfo.quantidade_disponivel },
      (_, i) => i + 1
    );
    const reservadas = unidadesReservadas.map((r) => r.numero_unidade);
    const unidadeLivre = todasUnidades.find((n) => !reservadas.includes(n));

    if (!unidadeLivre) {
      return res.status(400).json({ error: "Todas as unidades estão reservadas." });
    }

    await dbInstance.run(
      `INSERT INTO reservas (livro_id, usuario_id, numero_unidade, status, data_reserva, data_devolucao) 
       VALUES (?, ?, ?, 'Reservado', DATETIME('now'), DATETIME('now', '+7 days'))`,
      [livro_id, usuario_id, unidadeLivre]
    );

    res.status(201).json({
      message: `✅ Unidade ${unidadeLivre} reservada com sucesso.`,
      numero_unidade: unidadeLivre
    });
  } catch (err) {
    console.error("Erro ao reservar unidade:", err);
    res.status(500).json({ error: "Erro ao reservar unidade." });
  }
});










app.post("/fila-reserva", async (req, res) => {
  const { livro_id, usuario_id } = req.body;
  const db = await openDb();

  // Verifica se usuário já está na fila
  const jaNaFila = await db.get(
    `SELECT * FROM fila_reservas WHERE livro_id = ? AND usuario_id = ?`,
    [livro_id, usuario_id]
  );
  if (jaNaFila) {
    return res.status(409).json({ message: "Usuário já está na fila para este livro." });
  }

  await db.run(
    `INSERT INTO fila_reservas (livro_id, usuario_id) VALUES (?, ?)`,
    [livro_id, usuario_id]
  );

  res.status(201).json({ message: "Adicionado à fila com sucesso." });
});









/////////////////////// INICIAR SERVIDOR ///////////////////////

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

verificarEAdicionarColunaDataDevolvido();