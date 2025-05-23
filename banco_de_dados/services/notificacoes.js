// services/notificacoes.js
const { sqliteConnection } = require("../config/db");

function createNotification(bookId, numeroUnidade = null, message = "") {
  const db = sqliteConnection;

  console.log("📡 Criando notificação para livro:", bookId);

  db.all(
    `SELECT user_id FROM livros_para_notificacao WHERE book_id = ?`,
    [bookId],
    (err, rows) => {
      if (err) {
        console.error("🚨 Erro ao buscar usuários para notificação:", err);
        return;
      }

      if (rows.length === 0) {
        console.log("⚠️ Nenhum usuário registrado para receber notificações deste livro.");
        return;
      }

      rows.forEach(({ user_id }) => {
        db.run(
          `INSERT INTO notificacoes (user_id, book_id, numero_unidade, message)
           VALUES (?, ?, ?, ?)`,
          [user_id, bookId, numeroUnidade, message],
          function (err) {
            if (err) {
              console.error(`❌ Erro ao notificar user ${user_id}:`, err);
            } else {
              console.log(`✅ Notificação enviada para user ${user_id} (ID Notificação: ${this.lastID})`);
            }
          }
        );
      });
    }
  );
}

module.exports = {
  createNotification,
};
