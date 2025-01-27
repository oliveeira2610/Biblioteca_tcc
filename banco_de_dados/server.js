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

// Criar tabela "livros" caso não exista (Descomente isso)
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

  // Log para depuração
  console.log('Dados recebidos para adicionar livro:', req.body);

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

    // Log para depuração
    console.log(`Livro adicionado com sucesso! ID: ${this.lastID}`);

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

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
