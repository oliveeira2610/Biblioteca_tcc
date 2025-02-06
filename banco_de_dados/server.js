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
        data_devolucao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (livro_id) REFERENCES livros(id)
      );
    `);

});

console.log("Tabelas criadas ou já existentes.");


// 📌 ENDPOINTS 📌













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
        console.log(`Nenhum usuário registrado para receber notificações do livro ${bookId}`);
        return;
      }

      rows.forEach((row) => {
        const userId = row.user_id;

        console.log(`Criando notificação para userId: ${userId}, bookId: ${bookId}`);

        db.run(
          `INSERT INTO notificacoes (user_id, book_id, message) VALUES (?, ?, ?)`,
          [userId, bookId, message],
          function (err) {
            if (err) {
              console.error(`Erro ao adicionar notificação para userId ${userId}:`, err);
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
        return res.status(500).json({ message: "Erro ao deletar notificações" });
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
        return res.status(500).json({ message: "Erro ao buscar notificação existente" });
      }

      if (row) {
        console.log(`Usuário ${userId} já está registrado para receber notificações do livro ${bookId}`);
        return res.status(400).json({ message: "Você já está registrado para receber notificações deste livro." });
      }

      db.run(
        `INSERT INTO livros_para_notificacao (user_id, book_id) VALUES (?, ?)`,
        [userId, bookId],
        function (err) {
          if (err) {
            console.error("Erro ao registrar notificação:", err);
            return res.status(500).json({ message: "Erro ao registrar notificação" });
          }
          console.log(`Usuário ${userId} agora receberá notificações do livro ${bookId}`);
          res.status(201).json({ message: "Notificação registrada com sucesso." });
        }
      );
    }
  );
});



app.get("/check-notification/:userId/:bookId", (req, res) => {
  const { userId, bookId } = req.params;

  db.get(
    `SELECT * FROM livros_para_notificacao WHERE user_id = ? AND book_id = ?`,
    [userId, bookId],
    (err, row) => {
      if (err) {
        console.error("Erro ao verificar notificação:", err);
        return res.status(500).json({ message: "Erro ao verificar notificação" });
      }
      res.status(200).json({ exists: !!row });
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
        return res.status(500).json({ message: "Erro ao cancelar registro de notificação" });
      }
      res.status(200).json({ message: "Registro de notificação cancelado com sucesso." });
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
        return res.status(500).json({ message: "Erro ao verificar notificação" });
      }
      if (row) {
        return res.status(200).json({ message: "Notificação registrada", exists: true });
      } else {
        return res.status(200).json({ message: "Nenhuma notificação registrada", exists: false });
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
  const totalRented = await db.get("SELECT COUNT(*) AS count FROM reservas WHERE status = 'Reservado'");
  const totalReturned = await db.get("SELECT COUNT(*) AS count FROM historico_devolucoes");
  const totalFines = await db.get("SELECT SUM(multa) AS total FROM reservas WHERE multa > 0");

  res.json({
    totalBooks: totalBooks.count,
    totalUsers: totalUsers.count,
    totalRented: totalRented.count,
    totalReturned: totalReturned.count,
    totalFines: totalFines.total ? totalFines.total : 0,
  });
});













/////////////////////// LIVROS ///////////////////////













// Endpoint para atualizar o status do livro e notificar os usuários
app.put("/livros/:id", (req, res) => {
  const { status } = req.body;

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
              createNotification(bookId, message);
            }
          }

          res.status(200).json({ message: "Status atualizado com sucesso!" });
        }
      );
    }
  );
});


app.put("/livros/:id", (req, res) => {
  const { status } = req.body;

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
              createNotification(bookId, message);
            }
          }

          res.status(200).json({ message: "Status atualizado com sucesso!" });
        }
      );
    }
  );
});


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


// 🔹 Deletar um livro
app.delete("/livros/:id", (req, res) => {
  db.run(`DELETE FROM livros WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Erro ao deletar o livro." });
    if (this.changes === 0)
      return res.status(404).json({ error: "Livro não encontrado." });
    res.status(200).json({ message: "Livro deletado com sucesso!" });
  });
});



// Endpoint para adicionar um livro
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
    quantidade 
  } = req.body;

  // Define o status como "Disponível" por padrão se não for enviado
  const status = "Disponível";

  // Verifica se o livro já existe pelo ISBN, exceto para ISBN "Desconhecido"
  if (isbn !== "Desconhecido") {
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
        "INSERT INTO livros (isbn, nome_do_livro, genero, autor, editora, sinopse, ano_publicacao, status, imagem, quantidade_disponivel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
          quantidade 
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
  } else {
    // Caso ISBN seja "Desconhecido", insere o livro diretamente, adicionando um UUID para garantir unicidade
    const uniqueIsbn = isbn + "_" + Date.now(); // Gerar um ISBN único para "Desconhecido"
    db.run(
      "INSERT INTO livros (isbn, nome_do_livro, genero, autor, editora, sinopse, ano_publicacao, status, imagem, quantidade_disponivel) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        uniqueIsbn,
        nome_do_livro,
        genero,
        autor,
        editora,
        sinopse,
        ano_publicacao,
        status,
        imagem,
        quantidade 
      ],
      function (err) {
        if (err) {
          console.error("Erro ao adicionar livro:", err);
          return res.status(500).json({ error: "Erro ao adicionar livro" });
        }
        res.status(201).json({ message: "Livro adicionado com sucesso!" });
      }
    );
  }
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

    const books = rows.map(row => ({
      ...row,
      quantidade_disponivel_nao_alugada: row.quantidade_disponivel - row.quantidade_reservada
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
      livros.editora,
      livros.imagem,
      livros.sinopse,
      livros.status,
      livros.quantidade_disponivel,
      COUNT(reservas.id) AS quantidade_reservada,
      (livros.quantidade_disponivel - COUNT(reservas.id)) AS quantidade_disponivel_nao_alugada,
      reservas.id AS reserva_id,
      reservas.status AS reserva_status,
      reservas.data_reserva,
      reservas.data_devolucao,
      reservas.multa,
      usuarios.userName AS nome_usuario,
      usuarios.email AS usuario_email,
      usuarios.cpf AS usuario_cpf,
      usuarios.telefone AS usuario_telefone
    FROM livros
    LEFT JOIN reservas ON livros.id = reservas.livro_id AND reservas.status = 'Reservado'
    LEFT JOIN usuarios ON reservas.usuario_id = usuarios.id
    WHERE livros.id = ?
    GROUP BY usuarios.id, reservas.id
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error("Erro na consulta:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }

    const reservasPorUsuario = rows.reduce((acc, row) => {
      const usuarioIndex = acc.findIndex(
        (user) => user.nome_usuario === row.nome_usuario
      );
      const reservaInfo = {
        reserva_id: row.reserva_id,
        reserva_status: row.reserva_status,
        data_reserva: row.data_reserva,
        data_devolucao: row.data_devolucao,
        multa: row.multa,
      };

      if (usuarioIndex > -1) {
        acc[usuarioIndex].reservas.push(reservaInfo);
      } else {
        acc.push({
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
      editora: rows[0].editora,
      imagem: rows[0].imagem,
      sinopse: rows[0].sinopse,
      status: rows[0].status,
      quantidade_disponivel: rows[0].quantidade_disponivel,
      quantidade_reservada: rows[0].quantidade_reservada,
      quantidade_disponivel_nao_alugada: rows[0].quantidade_disponivel_nao_alugada,
      reservasPorUsuario,
    };

    res.json(bookDetails);
  });
});



app.put("/livros/:id/quantidade", (req, res) => {
  const { quantidade } = req.body;
  const { id } = req.params;

  db.run(
    "UPDATE livros SET quantidade_disponivel = ? WHERE id = ?",
    [quantidade, id],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar quantidade de livros:", err);
        return res.status(500).json({ error: "Erro ao atualizar quantidade de livros." });
      }
      res.status(200).json({ message: "Quantidade de livros atualizada com sucesso!" });
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
app.delete("/reservas/:livro_id/:usuario_id", (req, res) => {
  const { livro_id, usuario_id } = req.params;

  db.run(
    "DELETE FROM reservas WHERE livro_id = ? AND usuario_id = ?",
    [livro_id, usuario_id],
    function (err) {
      if (err) {
        console.error("Erro ao remover reserva:", err);
        return res.status(500).json({ message: "Erro ao remover reserva" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: "Reserva não encontrada" });
      }

      return res.json({ message: "Reserva removida com sucesso." });
    }
  );
});


// Modificar a tabela reservas para armazenar o número de dias em atraso e a multa
db.run(`ALTER TABLE reservas ADD COLUMN dias_atraso INTEGER DEFAULT 0`, (err) => {
  if (err && err.message.includes("duplicate column name")) {
    console.log("A coluna dias_atraso já existe.");
  } else if (err) {
    console.error("Erro ao adicionar coluna dias_atraso:", err);
  } else {
    console.log("Coluna dias_atraso adicionada com sucesso.");
  }
});

// Atualizar a lógica de multa ao criar uma reserva
app.post("/reservas", (req, res) => {
  const { livro_id, usuario_id, data_reserva, data_devolucao, status, multa } = req.body;

  if (!livro_id || !usuario_id || !data_reserva || !data_devolucao || !status) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  // Verificar se o usuário já reservou este livro
  db.get(
    `SELECT * FROM reservas WHERE livro_id = ? AND usuario_id = ? AND status = 'Reservado'`,
    [livro_id, usuario_id],
    (err, row) => {
      if (err) {
        console.error("Erro ao verificar reservas existentes:", err);
        return res.status(500).json({ error: "Erro ao verificar reservas existentes." });
      }

      if (row) {
        return res.status(400).json({ error: "Você já reservou este livro." });
      }

      const query = `INSERT INTO reservas (livro_id, usuario_id, data_reserva, data_devolucao, status, multa) VALUES (?, ?, ?, ?, ?, ?)`;

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



// Endpoint para marcar devolução de um livro
// Endpoint para marcar devolução de um livro
app.put("/reservas/:id/devolver", async (req, res) => {
  const reservaId = req.params.id;
  const db = await openDb();

  try {
    const reserva = await db.get(`SELECT * FROM reservas WHERE id = ?`, reservaId);
    if (!reserva) {
      console.error(`Erro: Reserva ${reservaId} não encontrada.`);
      return res.status(404).json({ error: "Reserva não encontrada." });
    }

    const bookId = reserva.livro_id;
    if (!bookId) {
      console.error(`Erro: livro_id não encontrado para reserva ID ${reservaId}`);
      return res.status(500).json({ error: "Erro ao obter ID do livro." });
    }

    await db.run(
      `UPDATE reservas SET status = 'Devolvido', data_devolucao = CURRENT_TIMESTAMP WHERE id = ?`,
      reservaId
    );

    await db.run(`UPDATE livros SET status = 'Disponível' WHERE id = ?`, bookId);

    // Adicionar ao histórico de devoluções
    await db.run(`INSERT INTO historico_devolucoes (usuario_id, livro_id) VALUES (?, ?)`, [
      reserva.usuario_id,
      bookId,
    ]);

    console.log(`Livro ID ${bookId} agora está disponível. Criando notificações...`);
    createNotification(bookId, "O livro agora está disponível para reserva!");

    res.json({ message: "Livro devolvido com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar a reserva:", error);
    res.status(500).json({ error: "Erro ao atualizar a reserva." });
  }
});

// Endpoint para obter o histórico de devoluções
app.get("/historico-devolucoes", async (req, res) => {
  const db = await openDb();

  try {
    const historico = await db.all(`
      SELECT 
        h.id,
        u.userName AS usuario,
        l.nome_do_livro AS livro,
        h.data_devolucao
      FROM historico_devolucoes h
      JOIN usuarios u ON h.usuario_id = u.id
      JOIN livros l ON h.livro_id = l.id
      ORDER BY h.data_devolucao DESC
    `);

    res.json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico de devoluções:", error);
    res.status(500).json({ error: "Erro ao buscar histórico de devoluções." });
  }
});


// Endpoint para obter o histórico de reservas
app.get("/reservas/historico", async (req, res) => {
  const db = await openDb();

  try {
    const historico = await db.all(`
      SELECT r.id, u.userName AS usuario, l.nome_do_livro AS livro, r.data_reserva, r.data_devolucao, r.status
      FROM reservas r
      JOIN usuarios u ON r.usuario_id = u.id
      JOIN livros l ON r.livro_id = l.id
      ORDER BY r.data_reserva DESC
    `);

    res.json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico de reservas:", error);
    res.status(500).json({ error: "Erro ao buscar histórico de reservas." });
  }
});










/////////////////////// USUARIOS ///////////////////////












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

  const queryUsuario = `
    SELECT 
      usuarios.id, 
      usuarios.userName, 
      usuarios.email, 
      usuarios.telefone
    FROM usuarios
    WHERE usuarios.id = ?
  `;

  const queryReservas = `
    SELECT 
      reservas.livro_id,
      livros.nome_do_livro,
      reservas.data_reserva, 
      reservas.data_devolucao, 
      reservas.multa
    FROM reservas
    JOIN livros ON reservas.livro_id = livros.id
    WHERE reservas.usuario_id = ?
  `;

  const queryLivrosParaNotificacao = `
    SELECT 
      livros.id AS livro_id, 
      livros.nome_do_livro
    FROM livros_para_notificacao
    JOIN livros ON livros_para_notificacao.book_id = livros.id
    WHERE livros_para_notificacao.user_id = ?
  `;

  db.serialize(() => {
    db.get(queryUsuario, [userId], (err, usuario) => {
      if (err) {
        console.error("Erro ao buscar dados do usuário:", err);
        return res
          .status(500)
          .json({ error: "Erro ao buscar dados do usuário." });
      }

      if (!usuario) {
        return res
          .status(404)
          .json({ error: "Usuário não encontrado." });
      }

      db.all(queryReservas, [userId], (err, reservas) => {
        if (err) {
          console.error("Erro ao buscar reservas:", err);
          return res
            .status(500)
            .json({ error: "Erro ao buscar reservas." });
        }

        db.all(queryLivrosParaNotificacao, [userId], (err, livrosParaNotificacao) => {
          if (err) {
            console.error("Erro ao buscar livros para notificação:", err);
            return res
              .status(500)
              .json({ error: "Erro ao buscar livros para notificação." });
          }

          const userInfo = {
            id: usuario.id,
            userName: usuario.userName,
            email: usuario.email,
            telefone: usuario.telefone,
            reservas: reservas.map(row => ({
              livroId: row.livro_id,
              nome_do_livro: row.nome_do_livro,
              data_reserva: row.data_reserva,
              data_devolucao: row.data_devolucao,
              multa: row.multa,
            })),
            livrosParaNotificacao: livrosParaNotificacao.map(row => ({
              livroId: row.livro_id,
              nome_do_livro: row.nome_do_livro,
            })),
          };

          res.json(userInfo);
        });
      });
    });
  });
});












/////////////////////// MULTAS ///////////////////////














// Rota para calcular e atualizar a multa
app.post("/atualizar-multa/:reserva_id", (req, res) => {
  const { reserva_id } = req.params;

  db.get(`SELECT data_devolucao FROM reservas WHERE id = ?`, [reserva_id], (err, row) => {
    if (err) {
      console.error("Erro ao buscar reserva:", err);
      return res.status(500).json({ error: "Erro ao buscar reserva." });
    }

    if (!row) {
      return res.status(404).json({ error: "Reserva não encontrada." });
    }

    const data_devolucao = new Date(row.data_devolucao);
    const hoje = new Date();
    let dias_atraso = Math.ceil((hoje - data_devolucao) / (1000 * 60 * 60 * 24));
    dias_atraso = dias_atraso > 0 ? dias_atraso : 0; // garantir que dias_atraso não seja negativo

    const multa = 10 + dias_atraso * 2;

    db.run(`UPDATE reservas SET multa = ?, dias_atraso = ? WHERE id = ?`, [multa, dias_atraso, reserva_id], function (err) {
      if (err) {
        console.error("Erro ao atualizar multa:", err);
        return res.status(500).json({ error: "Erro ao atualizar multa." });
      }

      res.status(200).json({ message: "Multa atualizada com sucesso!", multa, dias_atraso });
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
    return res.status(400).json({ error: "Reserva ID e valor da multa são obrigatórios." });
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






// Endpoint para obter o histórico de devoluções
app.get("/historico-devolucoes", async (req, res) => {
  const db = await openDb();

  try {
    const historico = await db.all(`
      SELECT 
        h.id,
        u.userName AS usuario,
        l.nome_do_livro AS livro,
        h.data_devolucao
      FROM historico_devolucoes h
      JOIN usuarios u ON h.usuario_id = u.id
      JOIN livros l ON h.livro_id = l.id
      ORDER BY h.data_devolucao DESC
    `);

    res.json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico de devoluções:", error);
    res.status(500).json({ error: "Erro ao buscar histórico de devoluções." });
  }
});

/////////////////////// INICIAR SERVIDOR ///////////////////////

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
