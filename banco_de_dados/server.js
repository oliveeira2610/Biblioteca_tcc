const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());


// Criação e conexção do banco de dados
const db = new sqlite3.Database('./books.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Banco de dados criado ou conectado com sucesso!');
  }
});

// Criar tabela "livros" caso não exista
db.run(`
    CREATE TABLE IF NOT EXISTS livros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_do_livro TEXT NOT NULL,
    genero TEXT NOT NULL,
    autor TEXT NOT NULL,
    editora TEXT NOT NULL,
    sinopse TEXT,
    status TEXT NOT NULL,
    imagem TEXT
  );
  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    livro_id INTEGER,
    usuario_id INTEGER,
    data_reserva TEXT,
    data_devolucao TEXT,
    status TEXT,
    multa REAL,
    FOREIGN KEY (livro_id) REFERENCES livros(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  );
  CREATE TABLE usuarios ( 
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    telefone TEXT
  );
);

`, (err) => {
  if (err) {
    console.error('Erro ao criar a tabela livros:', err.message);
  } else {
    console.log('Tabela livros e reservas e usuarios criada ou já existe.');
  }
});

// Endpoint para adicionar um livro
app.post('/livros', (req, res) => {
  const { nome_do_livro, genero, autor, editora, sinopse, status, imagem } = req.body;

  if (!nome_do_livro || !genero || !autor || !editora || !status) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  const query = `INSERT INTO livros (nome_do_livro, genero, autor, editora, sinopse, status, imagem) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [nome_do_livro, genero, autor, editora, sinopse, status, imagem]; // Incluindo a URL da imagem

  db.run(query, params, function (err) {
    if (err) {
      console.error('Erro ao adicionar livro:', err.message);
      return res.status(500).json({ error: 'Erro ao adicionar o livro.' });
    }

    res.status(201).json({
      id: this.lastID,
      nome_do_livro,
      genero,
      autor,
      editora,
      sinopse,
      status,
      imagem, // Retornando a URL da imagem
    });
  });
});




app.post('/usuarios', (req, res) => {
  console.log("Recebendo dados:", req.body);

  const { userName, email, password, confirmPassword, cpf, telefone } = req.body;

  // Verifica se todos os campos obrigatórios foram preenchidos
  if (!userName || !email || !password || !confirmPassword || !cpf || !telefone) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  // Verifica se as senhas coincidem
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "As senhas não coincidem." });
  }

  // Insere no banco de dados (REMOVENDO confirmPassword)
  const query = `INSERT INTO usuarios (userName, email, password, cpf, telefone) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [userName, email, password, cpf, telefone], function (err) {
    if (err) {
      console.error("Erro ao adicionar usuário:", err.message);
      return res.status(500).json({ error: "Erro ao cadastrar usuário." });
    }

    res.status(201).json({
      id: this.lastID,
      userName,
      email,
      cpf,
      telefone
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


// reservas
app.post("/reservas", async (req, res) => {
  const { livro_id, usuario_id, data_reserva, data_devolucao, status, multa } = req.body;

  if (!livro_id || !usuario_id || !data_reserva || !data_devolucao || !status) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
      const db = await openDb();
      await db.run(
          `INSERT INTO reservas (livro_id, usuario_id, data_reserva, data_devolucao, status, multa)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [livro_id, usuario_id, data_reserva, data_devolucao, status, multa]
      );
      res.status(201).json({ message: "Reserva criada com sucesso!" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao criar a reserva." });
  }
});



// Endpoint para buscar um livro pelo ID
app.get('/livros/:id', (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM livros WHERE id = ?`;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar livro:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar o livro.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Livro não encontrado.' });
    }

    res.status(200).json(row);
  });
});
// Endpoint para buscar status dos livros

app.get('/book-status/:id', (req, res) => {
  console.log("Recebendo pedido para ID:", req.params.id);
});

app.get('/book-status/:id', async (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM reservas WHERE livro_id = ?";
  db.get(query, [id], (err, row) => {
      if (err) {
          res.status(500).json({ error: "Erro ao buscar status do livro" });
      } else {
          res.json(row);
      }
  });
});

// Endpoint para buscar todos os livros
app.get('/livros', (req, res) => {
  const query = `SELECT * FROM livros`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar livros:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar os livros.' });
    }

    res.status(200).json(rows);
  });
});

// Endpoint para deletar um livro pelo ID
app.delete('/livros/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM livros WHERE id = ?`;
  db.run(query, [id], function (err) {
    if (err) {
      console.error('Erro ao deletar livro:', err.message);
      return res.status(500).json({ error: 'Erro ao deletar o livro.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Livro não encontrado.' });
    }

    res.status(200).json({ message: 'Livro deletado com sucesso!' });
  });
});

// Endpoint para atualizar o status do livro
app.put('/livros/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = `UPDATE livros SET status = ? WHERE id = ?`;
  db.run(query, [status, id], function (err) {
    if (err) {
      console.error('Erro ao atualizar status:', err.message);
      return res.status(500).json({ error: 'Erro ao atualizar status.' });
    }

    res.status(200).json({ message: 'Status atualizado com sucesso!' });
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
