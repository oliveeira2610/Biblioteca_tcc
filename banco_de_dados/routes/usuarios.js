// routes/usuarios.js
const express = require("express");
const router = express.Router();
const { sqliteConnection, openDb } = require("../config/db");

// 🔹 Deletar usuário
router.delete("/:id", (req, res) => {
  sqliteConnection.run("DELETE FROM usuarios WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: "Erro ao deletar usuário." });
    if (this.changes === 0) return res.status(404).json({ error: "Usuário não encontrado." });
    res.status(200).json({ message: "Usuário excluído com sucesso!" });
  });
});

// 🔹 Bloquear/desbloquear usuário
router.put("/:id/bloquear", (req, res) => {
  const { bloqueado } = req.body;
  sqliteConnection.run(
    `UPDATE usuarios SET bloqueado = ? WHERE id = ?`,
    [bloqueado ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: "Erro ao atualizar status de bloqueio." });
      res.status(200).json({ message: "Status de bloqueio atualizado com sucesso!" });
    }
  );
});

// 🔹 Histórico de reservas do usuário
router.get("/:userId/historico-reservas", async (req, res) => {
  const db = await openDb();
  try {
    const historico = await db.all(
      `SELECT h.livro_id, l.nome_do_livro, l.autor, l.imagem, h.data_reserva, h.data_devolucao, h.data_devolvido, h.multa
       FROM historico_devolucoes h
       JOIN livros l ON h.livro_id = l.id
       WHERE h.usuario_id = ?`,
      [req.params.userId]
    );
    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar histórico." });
  }
});

// 🔹 Perfil do usuário
router.get("/perfil/:userId", async (req, res) => {
  const db = await openDb();
  try {
    const usuario = await db.get(
      `SELECT id, userName, email, telefone, bloqueado FROM usuarios WHERE id = ?`,
      [req.params.userId]
    );
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });

    const reservas = await db.all(
      `SELECT r.id AS reserva_id, r.livro_id, l.nome_do_livro, l.imagem, r.data_reserva, r.data_devolucao, r.status, r.multa
       FROM reservas r
       JOIN livros l ON r.livro_id = l.id
       WHERE r.usuario_id = ? AND r.status = 'Reservado'`,
      [req.params.userId]
    );

    const devolucoes = await db.all(
      `SELECT h.id AS devolucao_id, h.livro_id, l.nome_do_livro, l.imagem, h.data_reserva, h.data_devolucao, h.data_devolvido, h.status, h.multa
       FROM historico_devolucoes h
       JOIN livros l ON h.livro_id = l.id
       WHERE h.usuario_id = ?`,
      [req.params.userId]
    );

    res.json({ ...usuario, reservas, devolucoes });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar perfil." });
  }
});

// 🔹 Dashboard-like endpoint: todos usuários + reservas
router.get("/", (req, res) => {
  const query = `
    SELECT 
      u.id AS usuario_id, u.userName, u.email, u.telefone,
      r.id AS reserva_id, r.livro_id, r.status AS reserva_status, r.data_reserva, r.data_devolucao, r.multa, r.numero_unidade,
      l.nome_do_livro, l.imagem, l.autor, l.status AS livro_status
    FROM usuarios u
    LEFT JOIN reservas r ON u.id = r.usuario_id AND r.status = 'Reservado'
    LEFT JOIN livros l ON r.livro_id = l.id
    ORDER BY u.userName ASC
  `;

  sqliteConnection.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro ao buscar usuários e reservas" });

    const usuariosMap = new Map();

    for (const row of rows) {
      const userId = row.usuario_id;

      if (!usuariosMap.has(userId)) {
        usuariosMap.set(userId, {
          id: userId,
          userName: row.userName,
          email: row.email,
          telefone: row.telefone,
          livrosReservados: []
        });
      }

      if (row.reserva_id && row.reserva_status === "Reservado") {
        usuariosMap.get(userId).livrosReservados.push({
          id: row.livro_id,
          nome_do_livro: row.nome_do_livro,
          imagem: row.imagem,
          autor: row.autor,
          status: row.livro_status,
          data_reserva: row.data_reserva,
          data_devolucao: row.data_devolucao,
          multa: row.multa,
          reservaId: row.reserva_id,
          numero_unidade: row.numero_unidade
        });
      }
    }

    res.status(200).json(Array.from(usuariosMap.values()));
  });
});

module.exports = router;
