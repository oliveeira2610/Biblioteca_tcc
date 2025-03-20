import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/bookStatus.css";

function BookStatus() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [user, setUser] = useState(null);
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
    if (user?.multa > 0) {
      alert("Você possui multas pendentes e não pode reservar livros.");
      return;
    }
  
    if (user?.bloqueado) {
      alert("Você está bloqueado e não pode reservar livros.");
      return;
    }
  
    const currentDate = new Date();
    const returnDate = new Date(currentDate);
    returnDate.setDate(currentDate.getDate() + 7);
  
    try {
      const response = await fetch(`http://localhost:3001/livros/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar detalhes do livro.");
      }
  
      const bookData = await response.json();
      
      if (!bookData.unidades || !Array.isArray(bookData.unidades)) {
        throw new Error("Nenhuma unidade disponível para reserva.");
      }
  
      const unidadeReservada = bookData.unidades.find(unidade => unidade.status === "Disponível");
  
      if (!unidadeReservada) {
        throw new Error("Não há unidades disponíveis para reserva.");
      }
  
      const reservationResponse = await fetch("http://localhost:3001/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          livro_id: id,
          unidade_id: unidadeReservada.id,
          usuario_id: user?.id,
          data_reserva: currentDate.toISOString(),
          data_devolucao: returnDate.toISOString(),
          status: "Reservado",
          multa: 0,
        }),
      });
  
      if (!reservationResponse.ok) {
        const errorData = await reservationResponse.json();
        throw new Error(errorData.error || "Erro ao reservar o livro.");
      }
  
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
            <p><strong>Nome:</strong> {user.userName}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </>
        ) : (
          <p>Carregando informações do usuário...</p>
        )}
      </div>

      <div className="book-info">
        <h2>Informações do Livro</h2>
        <p><strong>Nome do Livro:</strong> {book.nome_do_livro}</p>
        <p><strong>Autor:</strong> {book.autor}</p>
        <p><strong>Editora:</strong> {book.editora}</p>

        <div className="book-details-image">
          {book.imagem ? (
            <img src={book.imagem} alt={book.nome_do_livro} />
          ) : (
            <div className="no-image-placeholder">Sem imagem</div>
          )}
        </div>
      </div>

      <button onClick={handleReserve} className="confirm-reservation">
        Confirmar Reserva
      </button>
    </div>
  );
}

export default BookStatus;
