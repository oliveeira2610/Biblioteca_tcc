const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

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

// Criar tabelas caso não existam
db.serialize(() => {
  db.run(`
      CREATE TABLE IF NOT EXISTS usuarios ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        telefone TEXT
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
        imagem TEXT
      );
    `);

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
});

console.log("Tabelas criadas ou já existentes.");

const createNotification = (userId, bookId, message) => {
  db.all(
    `SELECT * FROM livros_para_notificacao WHERE user_id = ? AND book_id = ?`,
    [userId, bookId],
    (err, rows) => {
      if (err) {
        console.error("Erro ao buscar registros de notificação:", err);
        return;
      }
      if (rows.length > 0) {
        db.run(
          `INSERT INTO notificacoes (user_id, book_id, message) VALUES (?, ?, ?)`,
          [userId, bookId, message],
          function (err) {
            if (err) {
              console.error("Erro ao adicionar notificação:", err);
            } else {
              console.log(`Notificação adicionada: ${message}`);
            }
          }
        );
      }
    }
  );
};

app.put("/livros/:id", (req, res) => {
  const { status, userId } = req.body;

  db.get(
    `SELECT status FROM livros WHERE id = ?`,
    [req.params.id],
    (err, row) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Erro ao buscar status atual do livro." });

      const currentStatus = row.status;

      db.run(
        `UPDATE livros SET status = ? WHERE id = ?`,
        [status, req.params.id],
        function (err) {
          if (err)
            return res.status(500).json({ error: "Erro ao atualizar status." });

          if (currentStatus !== status) {
            const bookId = req.params.id;
            let message;

            if (status === "Disponível") {
              message = `O livro com ID ${bookId} está disponível.`;
            } else if (status === "Indisponível") {
              message = `O livro com ID ${bookId} está indisponível.`;
            }

            if (message) {
              createNotification(userId, bookId, message);
            }
          }

          res.status(200).json({ message: "Status atualizado com sucesso!" });
        }
      );
    }
  );
});

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

  db.run(
    `INSERT INTO livros_para_notificacao (user_id, book_id) VALUES (?, ?)`,
    [userId, bookId],
    function (err) {
      if (err) {
        console.error("Erro ao registrar livro para notificação:", err);
        return res
          .status(500)
          .json({ message: "Erro ao registrar livro para notificação" });
      }
      res
        .status(201)
        .json({ message: "Livro registrado para notificação com sucesso." });
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

// 📌 ENDPOINTS 📌

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
  db.all(
    `SELECT * FROM notificacoes WHERE user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Erro ao buscar notificações:", err); // Adicionando log de erro
        return res.status(500).json({ message: "Erro ao buscar notificações" });
      }
      res.json(rows);
    }
  );
});

// Endpoint de login sem bcrypt
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  const query = `SELECT * FROM usuarios WHERE email = ?`;

  db.get(query, [email], (err, user) => {
    if (err) {
      console.error("Erro ao buscar usuário:", err.message);
      return res.status(500).json({ error: "Erro ao buscar usuário." });
    }

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    // Comparação direta da senha (sem bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Retornar os dados do usuário (sem a senha)
    res.status(200).json({
      id: user.id,
      userName: user.userName,
      email: user.email,
      cpf: user.cpf,
      telefone: user.telefone,
    });
  });
});

app.get("/usuario-logado", (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID do usuário não fornecido." });
  }

  const query = `SELECT id, userName, email, telefone FROM usuarios WHERE id = ?`;
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

app.get("/perfil-usuario/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      usuarios.id, 
      usuarios.userName, 
      usuarios.email, 
      usuarios.telefone,
      livros.id AS livro_id,
      livros.nome_do_livro,
      reservas.data_reserva, 
      reservas.data_devolucao, 
      reservas.multa
    FROM usuarios
    LEFT JOIN reservas ON usuarios.id = reservas.usuario_id
    LEFT JOIN livros ON reservas.livro_id = livros.id
    WHERE usuarios.id = ?
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar dados do usuário:", err);
      return res
        .status(500)
        .json({ error: "Erro ao buscar dados do usuário." });
    }

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Usuário não encontrado ou sem reservas." });
    }

    const userInfo = {
      id: rows[0].id,
      userName: rows[0].userName,
      email: rows[0].email,
      telefone: rows[0].telefone,
      reservas: rows
        .filter((row) => row.livro_id)
        .map((row) => ({
          livroId: row.livro_id,
          nome_do_livro: row.nome_do_livro,
          data_reserva: row.data_reserva,
          data_devolucao: row.data_devolucao,
          multa: row.multa,
        })),
    };

    res.json(userInfo);
  });
});

// 🔹 Adicionar um livro
app.post("/livros", (req, res) => {
  const {
    isbn,
    nome_do_livro,
    genero,
    autor,
    editora,
    sinopse,
    ano_publicacao,
    imagem,
  } = req.body;

  // Define o status como "Disponível" por padrão se não for enviado
  const status = "Disponível";

  // Verifica se o livro já existe pelo ISBN
  db.get("SELECT * FROM livros WHERE isbn = ?", [isbn], (err, row) => {
    if (err) {
      console.error("Erro ao buscar livro no banco:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    if (row) {
      return res.status(400).json({ message: "Livro já cadastrado!" });
    }

    // Se não existir, insere o livro no banco
    db.run(
      "INSERT INTO livros (isbn, nome_do_livro, genero, autor, editora, sinopse, ano_publicacao, status, imagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        isbn,
        nome_do_livro,
        genero,
        autor,
        editora,
        sinopse,
        ano_publicacao,
        status,
        imagem,
      ],
      function (err) {
        if (err) {
          console.error("Erro ao adicionar livro:", err);
          return res.status(500).json({ error: "Erro ao adicionar livro" });
        }
        res.status(201).json({ message: "Livro adicionado com sucesso!" });
      }
    );
  });
});

// 🔹 Buscar todos os livros
app.get("/livros", (req, res) => {
  db.all(`SELECT * FROM livros`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao buscar os livros." });
    }
    res.status(200).json(rows);
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

// 🔹 Deletar um livro
app.delete("/livros/:id", (req, res) => {
  db.run(`DELETE FROM livros WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Erro ao deletar o livro." });
    if (this.changes === 0)
      return res.status(404).json({ error: "Livro não encontrado." });
    res.status(200).json({ message: "Livro deletado com sucesso!" });
  });
});

/// Rota para buscar usuários com reservas de livros
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
    livros.status,  -- 🔹 Adicionando status do livro
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
          status: row.status, // 🔹 Agora o status é retornado
          data_reserva: row.data_reserva,
          data_devolucao: row.data_devolucao,
          multa: row.multa,
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
                  status: row.status, // 🔹 Agora o status é retornado
                  data_reserva: row.data_reserva,
                  data_devolucao: row.data_devolucao,
                  multa: row.multa,
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

// Rota de criação de reserva
app.post("/reservas", (req, res) => {
  const { livro_id, usuario_id, data_reserva, data_devolucao, status, multa } =
    req.body;

  // Log de depuração para verificar os dados recebidos
  console.log("Dados da reserva recebidos:", req.body);

  if (!livro_id || !usuario_id || !data_reserva || !data_devolucao || !status) {
    return res
      .status(400)
      .json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  const query = `INSERT INTO reservas (livro_id, usuario_id, data_reserva, data_devolucao, status, multa) VALUES (?, ?, ?, ?, ?, ?)`;

  // Atualizar o status do livro para "Reservado"
  db.run(
    `UPDATE livros SET status = "Reservado" WHERE id = ?`,
    [livro_id],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar status do livro:", err);
        return res
          .status(500)
          .json({ error: "Erro ao atualizar status do livro." });
      }

      // Criar a reserva após atualizar o status do livro
      db.run(
        query,
        [livro_id, usuario_id, data_reserva, data_devolucao, status, multa],
        function (err) {
          if (err) {
            console.error("Erro ao criar reserva:", err);
            return res.status(500).json({ error: "Erro ao criar reserva." });
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
});

// Endpoint para buscar livros com informações de reserva, status, multa e tempo de atraso
app.get("/livros-com-reservas", (req, res) => {
  const query = `
      SELECT 
        livros.id,
        livros.nome_do_livro,
        livros.autor,
        livros.editora,
        livros.imagem,
        livros.status AS livro_status,
        reservas.status AS reserva_status,
        reservas.multa,
        julianday(reservas.data_devolucao) - julianday(current_timestamp) AS tempo_atraso
      FROM livros
      LEFT JOIN reservas ON livros.id = reservas.livro_id
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

app.get("/livro-detalhes/:id", (req, res) => {
  const { id } = req.params;

  // Verifique se o ID é válido
  if (!id) {
    return res.status(400).json({ error: "ID do livro não fornecido" });
  }

  // Consulta ao banco de dados para obter os detalhes do livro e as informações do usuário
  const query = `
    SELECT 
      livros.id,
      livros.nome_do_livro,
      livros.autor,
      livros.editora,
      livros.imagem,
      livros.sinopse,
      livros.status,  
      reservas.status AS reserva_status,
      usuarios.userName AS nome_usuario,
      usuarios.email AS usuario_email,
      usuarios.cpf AS usuario_cpf,
      usuarios.telefone AS usuario_telefone,
      reservas.data_reserva,
      reservas.data_devolucao,
      reservas.multa,
      julianday(reservas.data_devolucao) - julianday(current_timestamp) AS tempo_atraso
    FROM livros
    LEFT JOIN reservas ON livros.id = reservas.livro_id
    LEFT JOIN usuarios ON reservas.usuario_id = usuarios.id
    WHERE livros.id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error("Erro na consulta:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }

    if (!row) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }

    // Retorne os detalhes do livro, incluindo informações de reserva e usuário
    res.json({
      id: row.id,
      nome_do_livro: row.nome_do_livro,
      autor: row.autor,
      editora: row.editora,
      imagem: row.imagem,
      sinopse: row.sinopse,
      status: row.status,
      reserva_status: row.reserva_status,
      nome_usuario: row.nome_usuario,
      usuario_email: row.usuario_email,
      usuario_cpf: row.usuario_cpf,
      usuario_telefone: row.usuario_telefone,
      data_reserva: row.data_reserva,
      data_devolucao: row.data_devolucao,
      multa: row.multa,
      tempo_atraso: row.tempo_atraso,
    });
  });
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

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
