import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../src/styles/bookStatus.css";

function BookStatus() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [user, setUser] = useState(null);
  const [reservationDate, setReservationDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [penalty, setPenalty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/livros/${id}`);
        if (!response.ok) {
          throw new Error("Livro não encontrado");
        }
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("Usuário não autenticado");
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/usuario-logado?id=${userId}`);
        if (!response.ok) {
          throw new Error("Usuário não encontrado");
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchBookDetails();
    fetchUserDetails();
  }, [id]);

  if (loading) return <p>Carregando detalhes...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!book) return <p>Livro não encontrado.</p>;

  const handleReserve = async () => {
    if (!reservationDate || !returnDate) {
      alert("Por favor, preencha todas as datas.");
      return;
    }

    const currentDate = new Date();
    const returnDateObj = new Date(returnDate);
    const overduePenalty = returnDateObj < currentDate ? 10 : 0;

    const reservation = {
      livro_id: id,
      usuario_id: user?.id || 1,
      data_reserva: reservationDate,
      data_devolucao: returnDate,
      status: "Reservado",
      multa: overduePenalty,
    };

    try {
      const response = await fetch("http://localhost:3001/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservation),
      });

      if (!response.ok) {
        throw new Error("Erro ao reservar o livro.");
      }

      setPenalty(overduePenalty);
      alert("Reserva realizada com sucesso!");
      navigate("/search");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="book-status-container">
      <div className="user-info">
        <h2>Informações do Usuário</h2>
        {user ? (
          <>
            <p>
              <strong>Nome:</strong> {user.nome}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </>
        ) : (
          <p>Carregando informações do usuário...</p>
        )}
      </div>

      <div className="book-info">
        <h2>Informações do Livro</h2>
        <p>
          <strong>Nome do Livro:</strong> {book.nome_do_livro}
        </p>
        <p>
          <strong>Autor:</strong> {book.autor}
        </p>
        <p>
          <strong>Editora:</strong> {book.editora}
        </p>

        <div className="book-details-image">
          {book.imagem ? (
            <img src={book.imagem} alt={book.nome_do_livro} />
          ) : (
            <div className="no-image-placeholder">Sem imagem</div>
          )}
        </div>
      </div>

      <div className="reservation-info">
        <h2>Detalhes da Reserva</h2>
        <label>
          Data da Reserva:
          <input
            type="date"
            value={reservationDate}
            onChange={(e) => setReservationDate(e.target.value)}
          />
        </label>

        <label>
          Data de Devolução:
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </label>

        {penalty > 0 && (
          <p className="penalty-warning">
            Multa de R${penalty} devido ao atraso.
          </p>
        )}

        <button onClick={handleReserve} className="confirm-reservation">
          Confirmar Reserva
        </button>
      </div>
    </div>
  );
}

export default BookStatus;
