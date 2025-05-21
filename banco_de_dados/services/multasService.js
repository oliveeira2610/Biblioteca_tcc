// services/multasService.js
const { openDb } = require("../config/db");

async function aplicarMultasAutomaticamente() {
  const db = await openDb();

  try {
    const reservas = await db.all(
      `SELECT id, data_devolucao FROM reservas WHERE status = 'Reservado'`
    );

    const hoje = new Date();

    for (const reserva of reservas) {
      const dataDevolucao = new Date(reserva.data_devolucao);
      const diasAtraso = Math.ceil(
        (hoje - dataDevolucao) / (1000 * 60 * 60 * 24)
      );

      if (diasAtraso > 0) {
        const multa = 10 + diasAtraso * 2;

        await db.run(
          `UPDATE reservas SET multa = ?, dias_atraso = ? WHERE id = ?`,
          [multa, diasAtraso, reserva.id]
        );

        console.log(`💰 Multa aplicada: Reserva ${reserva.id} → R$${multa}`);
      }
    }

    console.log("✅ Multas aplicadas automaticamente.");
  } catch (error) {
    console.error("❌ Erro ao aplicar multas:", error);
  }
}

module.exports = {
  aplicarMultasAutomaticamente,
};
