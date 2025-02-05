import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/multas.css";
import "../../src/styles/book-card.css";

const MultasUsuarios = () => {
  const [multas, setMultas] = useState([]);
  const [reservasAtivas, setReservasAtivas] = useState([]);
  const [reservaId, setReservaId] = useState("");
  const [valorMulta, setValorMulta] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar multas
        const multasRes = await axios.get("http://localhost:3001/multas");
        setMultas(multasRes.data || []);

        // Buscar reservas ativas
        const reservasRes = await axios.get(
          "http://localhost:3001/livros-com-reservas"
        );
        const filteredBooks = reservasRes.data.filter(
          (book) => book.reserva_status === "Reservado"
        );

        setReservasAtivas(filteredBooks);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reservaId || !valorMulta) {
      alert("Preencha todos os campos.");
      return;
    }
    try {
      await axios.post("http://localhost:3001/adicionar-multa", {
        reserva_id: reservaId,
        valor_multa: parseFloat(valorMulta),
      });
      alert("Multa adicionada com sucesso!");
      setReservaId("");
      setValorMulta("");

      // Atualizar lista de multas
      const response = await axios.get("http://localhost:3001/multas");
      setMultas(response.data || []);
    } catch (error) {
      alert("Erro ao adicionar multa.");
      console.error(error);
    }
  };

  return (
    <div className="multas-usuarios">
      <h1>Multas Aplicadas</h1>
      <form onSubmit={handleSubmit} className="form-multa">
        <label>ID da Reserva:</label>
        <input
          type="number"
          value={reservaId}
          onChange={(e) => setReservaId(e.target.value)}
          required
        />
        <label>Valor da Multa (R$):</label>
        <input
          type="number"
          step="0.01"
          value={valorMulta}
          onChange={(e) => setValorMulta(e.target.value)}
          required
        />
        <button type="submit" disabled={!reservaId || !valorMulta}>
          Adicionar Multa
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Total de Multas</th>
          </tr>
        </thead>
        <tbody>
          {multas.length === 0 ? (
            <tr>
              <td colSpan="2">Nenhuma multa registrada.</td>
            </tr>
          ) : (
            multas.map((multa) => (
              <tr key={multa.usuario_id}>
                <td>{multa.usuario || "Usuário Desconhecido"}</td>
                <td>
                  R$ {multa.total_multa ? multa.total_multa.toFixed(2) : "0.00"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h1>Reservas Ativas</h1>
      <div className="books-list">
        {reservasAtivas.length === 0 ? (
          <p>Nenhuma reserva ativa no momento.</p>
        ) : (
          reservasAtivas.map((book) => (
            <div
              key={book.livro_id}
              className="book-card"
              onClick={() => navigate(`/book/${book.livro_id}`)}
            >
              {book.imagem ? (
                <img
                  src={book.imagem}
                  alt={book.nome_do_livro}
                  className="book-card-image"
                />
              ) : (
                <div className="no-image-placeholder">Sem imagem</div>
              )}
              <h3 className="book-card-title">
                {book.nome_do_livro || "Nome não disponível"}
              </h3>
              <p className="book-card-author">
                {book.autor || "Autor desconhecido"}
              </p>
              <p>
                <strong>Usuário que Reservou:</strong>{" "}
                {book.usuario || "Não informado"}
              </p>
              <p>
                <strong>ID da Reserva:</strong> {book.reserva_id || "N/A"}
              </p>
              <p>
                <strong>Data de Devolução:</strong>{" "}
                {book.data_devolucao
                  ? new Date(book.data_devolucao).toLocaleDateString()
                  : "Data não definida"}
              </p>
              <p>
                <strong>Editora:</strong> {book.editora || "Não informada"}
              </p>
              <p>
                <strong>Status da Reserva:</strong>{" "}
                {book.reserva_status || "Indefinido"}
              </p>
              {book.multa > 0 && (
                <p className="book-card-fine">
                  Multa pendente: R$ {book.multa.toFixed(2)}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MultasUsuarios;
