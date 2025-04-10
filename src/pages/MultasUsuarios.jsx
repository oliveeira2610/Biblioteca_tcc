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

  const fetchMultas = async () => {
    try {
      const multasRes = await axios.get("http://localhost:3001/multas");
      setMultas(multasRes.data || []);
    } catch (error) {
      console.error("Erro ao buscar multas:", error);
    }
  };

  const fetchReservasAtivas = async () => {
    try {
      const reservasRes = await axios.get("http://localhost:3001/livros-com-reservas");
      const filteredBooks = reservasRes.data.filter((book) => book.reserva_status === "Reservado");
      setReservasAtivas(filteredBooks);
    } catch (error) {
      console.error("Erro ao buscar reservas ativas:", error);
    }
  };

  useEffect(() => {
    fetchMultas();
    fetchReservasAtivas();
  }, []);

  const handleDefinirMulta = async (reservaId, valorMulta) => {
    try {
      await axios.post(`http://localhost:3001/adicionar-multa`, {
        reserva_id: reservaId,
        valor_multa: parseFloat(valorMulta)
      });
      alert("Multa definida com sucesso!");
      fetchMultas();
      fetchReservasAtivas();
    } catch (error) {
      alert("Erro ao definir multa.");
      console.error(error);
    }
  };

  return (
    <div className="multas-usuarios">
      <h1 className="aplicadass">Multas Aplicadas</h1>
      <table className="thread1">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Total de Multas</th>
          </tr>
        </thead>
        <tbody className="textos">
          {multas.length === 0 ? (
            <tr>
              <td colSpan="2" className="fe">Nenhuma multa registrada.</td>
            </tr>
          ) : (
            multas.map((multa) => (
              <tr key={multa.usuario_id}>
                <td  className="textos3">{multa.usuario || "Usuário Desconhecido"}</td>
                <td  className="">R$ {multa.total_multa ? multa.total_multa.toFixed(2) : "0.00"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h1 className="ativas1">Reservas Ativas</h1>
      <div className="books-list-multa">
        {reservasAtivas.length === 0 ? (
          <p>Nenhuma reserva ativa no momento.</p>
        ) : (
          reservasAtivas.map((book) => (
            <div key={book.livro_id} className="book-card">
              {book.imagem ? (
                <img
                  src={book.imagem}
                  alt={book.nome_do_livro}
                  className="book-card-image"
                  onClick={() => navigate(`/book/${book.livro_id}`)}
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
                <strong>Usuário que Reservou:</strong> {book.usuario || "Não informado"}
              </p>
              <p>
                <strong>ID da Reserva:</strong> {book.reserva_id || "N/A"}
              </p>
              <p>
                <strong>Unidade:</strong> {reserva.unidade || "Não especificada"}
              </p>
              <p>
                <strong>Data de Devolução:</strong> {book.data_devolucao ? new Date(book.data_devolucao).toLocaleDateString() : "Data não definida"}
              </p>
              <p>
                <strong>Editora:</strong> {book.editora || "Não informada"}
              </p>
              <p>
                <strong>Status da Reserva:</strong> {book.reserva_status || "Indefinido"}
              </p>
              {book.multa > 0 && (
                <p className="book-card-fine">
                  Multa pendente: R$ {book.multa.toFixed(2)}
                </p>
              )}
              <div>
                <input
                className="inputa"
                  type="number"
                  value={valorMulta}
                  onChange={(e) => setValorMulta(e.target.value)}
                />
                <button className="botao-multas" onClick={() => handleDefinirMulta(book.reserva_id, valorMulta)}>Definir Multa</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MultasUsuarios;
