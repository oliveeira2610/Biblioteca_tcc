// routes/livros.js
const express = require("express");
const router = express.Router();
const { sqliteConnection } = require("../config/db");
const atualizarStatusLivro = require("../utils/atualizarStatusLivro");
const { createNotification } = require("../services/notificacoes");

// 🧪 Teste manual de notificação
router.post("/testar-notificacao", (req, res) => {
  const { bookId, numeroUnidade, message } = req.body;
  createNotification(bookId, numeroUnidade, message);
  res.status(200).json({ msg: "Notificação enviada (se válida)." });
});

// 📚 Criar livro
router.post("/", (req, res) => {
  const {
    nome_do_livro, autor, genero, editora, sinopse, isbn,
    ano_publicacao, imagem, quantidade_disponivel, numero, status
  } = req.body;

  if (!nome_do_livro || !autor || !editora || !isbn || !ano_publicacao || !quantidade_disponivel || !numero) {
    return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  sqliteConnection.get("SELECT id FROM livros WHERE isbn = ?", [isbn], (err, row) => {
    if (err) return res.status(500).json({ error: "Erro ao verificar livro existente." });
    if (row) return res.status(400).json({ error: "Livro já cadastrado." });

    const query = `
      INSERT INTO livros (nome_do_livro, autor, genero, editora, sinopse, isbn, ano_publicacao, imagem, quantidade_disponivel, numero, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [nome_do_livro, autor, genero, editora, sinopse, isbn, ano_publicacao, imagem, quantidade_disponivel, numero, status];

    sqliteConnection.run(query, params, function (err) {
      if (err) return res.status(500).json({ error: "Erro ao cadastrar livro." });
      res.status(201).json({ id: this.lastID });
    });
  });
});

// 📚 Atualizar livro
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    nome_do_livro, autor, genero, editora, sinopse, isbn,
    ano_publicacao, quantidade_disponivel, imagem, status, numero
  } = req.body;

  sqliteConnection.get(`SELECT status FROM livros WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar status atual." });
    const statusAnterior = row?.status;

    const query = `
      UPDATE livros SET nome_do_livro = ?, autor = ?, genero = ?, editora = ?, sinopse = ?, isbn = ?, 
      ano_publicacao = ?, quantidade_disponivel = ?, imagem = ?, status = ?, numero = ? WHERE id = ?`;
    const params = [nome_do_livro, autor, genero, editora, sinopse, isbn, ano_publicacao, quantidade_disponivel, imagem, status, numero, id];

    sqliteConnection.run(query, params, function (err) {
      if (err) return res.status(500).json({ error: "Erro ao atualizar livro." });

      if (statusAnterior !== status && status === "Disponível") {
        const mensagem = `O livro "${nome_do_livro}" está disponível para reserva.`;
        createNotification(parseInt(id), numero ?? null, mensagem);
      }

      atualizarStatusLivro(parseInt(id));
      res.status(200).json({ message: "Livro atualizado com sucesso!" });
    });
  });
});

// 📚 Deletar livro
router.delete("/:id", (req, res) => {
  sqliteConnection.run("DELETE FROM livros WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Erro ao deletar o livro." });
    if (this.changes === 0) return res.status(404).json({ error: "Livro não encontrado." });
    res.status(200).json({ message: "Livro deletado com sucesso!" });
  });
});

// 📚 Buscar todos os livros
router.get("/", (req, res) => {
  const query = `
    SELECT 
      livros.id, livros.nome_do_livro, livros.genero, livros.autor,
      livros.editora, livros.sinopse, livros.isbn, livros.ano_publicacao,
      livros.quantidade_disponivel, livros.imagem, livros.status,
      COUNT(reservas.id) AS quantidade_reservada,
      (livros.quantidade_disponivel - COUNT(reservas.id)) AS quantidade_disponivel_nao_alugada
    FROM livros
    LEFT JOIN reservas ON livros.id = reservas.livro_id AND reservas.status = 'Reservado'
    GROUP BY livros.id`;

  sqliteConnection.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar os livros." });

    const books = rows.map(row => ({
      ...row,
      quantidade_disponivel_nao_alugada: Math.max(row.quantidade_disponivel_nao_alugada, 0),
      status: row.quantidade_disponivel_nao_alugada > 0 ? "Disponível" : "Indisponível"
    }));

    res.status(200).json(books);
  });
});

// 📘 Buscar livro por ID
router.get("/:id", (req, res) => {
  sqliteConnection.get("SELECT * FROM livros WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar o livro." });
    if (!row) return res.status(404).json({ error: "Livro não encontrado." });
    res.status(200).json(row);
  });
});

module.exports = router;
