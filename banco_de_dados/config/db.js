// config/db.js
const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite");
const path = require("path");

const dbPath = path.resolve(__dirname, "../books.db");

const sqliteConnection = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("✅ Banco de dados conectado com sucesso!");
  }
});

async function openDb() {
  return sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

module.exports = {
  sqliteConnection,
  openDb,
};
