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
        // Alterado: assigna o objeto retornado diretamente ao state "book"
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
        const response = await fetch(
          `http://localhost:3001/usuario-logado?id=${userId}`
        );
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

  const mudarStatus = (id) => {
    fetch(`http://localhost:3001/verificar-disponibilidade/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao mudar status");
        return response.json(); // parse once
      })
      .then((data) => {
        console.log("🔁 Resposta da API:", data); // log full response here
        console.log("✅", data.message); // optionally log a specific field
      })
      .catch((error) => {
        console.error("❌ Erro ao mudar status:", error);
      });
  };

  const handleReserve = async () => {
    if (user?.multa > 0) {
      alert("Você possui multas pendentes e não pode reservar livros.");
      return;
    }

    if (user?.bloqueado) {
      alert("Você está bloqueado e não pode reservar livros.");
      return;
    }

    try {
      const reservationResponse = await fetch(
        "http://localhost:3001/reservar-unidade",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            livro_id: book.id, // ID do livro
            usuario_id: user?.id, // ID do usuário
            data_reserva: new Date().toISOString(),
            data_devolucao: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(), // 7 dias para devolução
            status: "Reservado",
            multa: 0,
          }),
        }
      );

      const reservationData = await reservationResponse.json();

      if (!reservationResponse.ok) {
        throw new Error(reservationData.error || "Erro ao reservar o livro.");
      }

      mudarStatus(book.id); // Atualiza o status do livro para "Reservado"
      alert(
        `Reserva realizada com sucesso! Unidade reservada: ${reservationData.numero_unidade}`
      );

      navigate("/search");
    } catch (error) {
      console.error("Erro ao reservar livro:", error);
      alert(error.message || "Erro ao reservar livro. Tente novamente.");
    }
  };

  return (
    <div className="book-status-container">
      <div className="user-info">
        <h2>Informações do Usuário</h2>
        {user ? (
          <>
            <p>
              <strong>Nome:</strong> {user.userName}
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

      <button onClick={handleReserve} className="confirm-reservation">
        Confirmar Reserva
      </button>
    </div>
  );
}

export default BookStatus;
