const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());


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
});

console.log("Tabelas criadas ou já existentes.");

// 📌 ENDPOINTS 📌

// Endpoint de login sem bcrypt
app.post('/login', (req, res) => {
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
      telefone: user.telefone
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

// 🔹 Adicionar um livro
app.post('/livros', (req, res) => {
  const { isbn, nome_do_livro, genero, autor, editora, sinopse, ano_publicacao, imagem } = req.body;

  // Define o status como "Disponível" por padrão se não for enviado
  const status = 'Disponível';

  // Verifica se o livro já existe pelo ISBN
  db.get('SELECT * FROM livros WHERE isbn = ?', [isbn], (err, row) => {
      if (err) {
          console.error('Erro ao buscar livro no banco:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      if (row) {
          return res.status(400).json({ message: 'Livro já cadastrado!' });
      }
      
      // Se não existir, insere o livro no banco
      db.run(
          'INSERT INTO livros (isbn, nome_do_livro, genero, autor, editora, sinopse, ano_publicacao, status, imagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [isbn, nome_do_livro, genero, autor, editora, sinopse, ano_publicacao, status, imagem],
          function (err) {
              if (err) {
                  console.error('Erro ao adicionar livro:', err);
                  return res.status(500).json({ error: 'Erro ao adicionar livro' });
              }
              res.status(201).json({ message: 'Livro adicionado com sucesso!' });
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
  db.run(`UPDATE livros SET status = ? WHERE id = ?`, [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Erro ao atualizar status." });
    res.status(200).json({ message: "Status atualizado com sucesso!" });
  });
});



// Rota para deletar a reserva
app.delete('/reservas/:livro_id', (req, res) => {
  const livro_id = req.params.livro_id;

  // A consulta para deletar a reserva no banco de dados
  db.run('DELETE FROM reservas WHERE livro_id = ?', [livro_id], function(err) {
    if (err) {
      console.error('Erro ao remover reserva:', err);
      return res.status(500).json({ message: 'Erro ao remover reserva' });
    }

    if (this.changes === 0) {
      // Caso não tenha encontrado nada para excluir
      return res.status(404).json({ message: 'Reserva não encontrada' });
    }

    return res.json({ message: 'Reserva removida com sucesso.' });
  });
});



// 🔹 Deletar um livro
app.delete("/livros/:id", (req, res) => {
  db.run(`DELETE FROM livros WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Erro ao deletar o livro." });
    if (this.changes === 0) return res.status(404).json({ error: "Livro não encontrado." });
    res.status(200).json({ message: "Livro deletado com sucesso!" });
  });
});

/// Rota para buscar usuários com reservas de livros
app.get('/usuarios', (req, res) => {
  db.all(
      `SELECT usuarios.id, usuarios.userName, usuarios.email, usuarios.telefone, 
              livros.nome_do_livro, livros.status, reservas.data_reserva
       FROM usuarios
       LEFT JOIN reservas ON usuarios.id = reservas.usuario_id
       LEFT JOIN livros ON reservas.livro_id = livros.id`,
      (err, rows) => {
          if (err) {
              console.error('Erro ao buscar usuários e reservas:', err);
              return res.status(500).json({ error: 'Erro ao buscar usuários e reservas' });
          }

          // Se não houverem dados, retorne um array vazio
          res.status(200).json(rows || []);
      }
  );
});



// Endpoint para pegar os usuários com os livros reservados
app.get('/usuarios', (req, res) => {
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
      console.error('Erro ao buscar usuários e reservas:', err);
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
    
    console.log('Usuários encontrados:', rows);
    const usuarios = rows.reduce((acc, row) => {
      const user = acc.find(u => u.id === row.id);
      if (user) {
        user.reservas.push({
          nome_do_livro: row.nome_do_livro,
          status: row.status,
          data_reserva: row.data_reserva,
          atrasado: row.atrasado
        });
      } else {
        acc.push({
          id: row.id,
          nome: row.nome,
          email: row.email,
          telefone: row.telefone,
          reservas: [{
            nome_do_livro: row.nome_do_livro,
            status: row.status,
            data_reserva: row.data_reserva,
            atrasado: row.atrasado
          }]
        });
      }
      return acc;
    }, []);
    
    res.status(200).json(usuarios);
  });
});


// Rota de criação de reserva
app.post("/reservas", (req, res) => {
  const { livro_id, usuario_id, data_reserva, data_devolucao, status, multa } = req.body;

  // Log de depuração para verificar os dados recebidos
  console.log("Dados da reserva recebidos:", req.body);

  if (!livro_id || !usuario_id || !data_reserva || !data_devolucao || !status) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  const query = `INSERT INTO reservas (livro_id, usuario_id, data_reserva, data_devolucao, status, multa) VALUES (?, ?, ?, ?, ?, ?)`;

  // Atualizar o status do livro para "Reservado"
  db.run(
    `UPDATE livros SET status = "Reservado" WHERE id = ?`,
    [livro_id],
    function (err) {
      if (err) {
        console.error("Erro ao atualizar status do livro:", err);
        return res.status(500).json({ error: "Erro ao atualizar status do livro." });
      }

      // Criar a reserva após atualizar o status do livro
      db.run(query, [livro_id, usuario_id, data_reserva, data_devolucao, status, multa], function (err) {
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
      });
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
      console.error('Erro ao buscar livros com reservas:', err);
      return res.status(500).json({ error: "Erro ao buscar livros com reservas." });
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
      nome_do_livro: row.nome_do_livro,
      autor: row.autor,
      editora: row.editora,
      imagem: row.imagem,
      sinopse: row.sinopse,
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
  db.get("SELECT * FROM reservas WHERE livro_id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar status do livro" });
    res.json(row);
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
