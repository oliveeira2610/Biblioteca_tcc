const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao banco SQLite
const db = new sqlite3.Database('./bibliotecaVirtual.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err.message);
  } else {
    console.log('Conectado ao banco de dados.');
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
    status TEXT CHECK(status IN ('disponivel', 'indisponivel', 'reservado')) NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Erro ao criar a tabela livros:', err.message);
  } else {
    console.log('Tabela livros criada ou já existe.');
  }
});

// Endpoint para adicionar um livro
app.post('/livros', (req, res) => {
  const { nome_do_livro, genero, autor, editora, sinopse, status } = req.body;

  if (!nome_do_livro || !genero || !autor || !editora || !status) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  const query = `INSERT INTO livros (nome_do_livro, genero, autor, editora, sinopse, status) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [nome_do_livro, genero, autor, editora, sinopse, status];

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
    });
  });
});

// Endpoint para buscar um livro pelo ID
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
