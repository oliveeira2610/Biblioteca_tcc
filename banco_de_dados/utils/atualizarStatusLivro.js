// utils/atualizarStatusLivro.js
const { sqliteConnection } = require("../config/db");

function atualizarStatusLivro(bookId) {
  const db = sqliteConnection;

  db.get(
    `
    SELECT 
      l.quantidade_disponivel AS total,
      COUNT(r.id) AS alugadas
    FROM livros l
    LEFT JOIN reservas r ON l.id = r.livro_id AND r.status = 'Reservado'
    WHERE l.id = ?
    GROUP BY l.id
    `,
    [bookId],
    (err, row) => {
      if (err) {
        console.error("❌ Erro ao calcular status:", err);
        return;
      }

      const unidadesDisponiveis = row.total - row.alugadas;
      const novoStatus = unidadesDisponiveis > 0 ? "Disponível" : "Indisponível";

      db.run(
        `UPDATE livros SET status = ? WHERE id = ?`,
        [novoStatus, bookId],
        (err) => {
          if (err) {
            console.error("❌ Erro ao atualizar status do livro:", err);
          } else {
            console.log(`📘 Status atualizado para "${novoStatus}" | Livro ID: ${bookId}`);
          }
        }
      );
    }
  );
}

module.exports = atualizarStatusLivro;
