import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/manageDatabaseBooks.css";
import "../../src/styles/book-card.css";
import '../../src/styles/FloatingBackground.css';


function FloatingLetters() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
  const [letterElements, setLetterElements] = useState([]);

  useEffect(() => {
    const generateInitialLetters = () => {
      return Array.from({ length: 40 }).map((_, index) => ({
        id: index,
        char: letters[Math.floor(Math.random() * letters.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        fontSize: Math.random() * 3 + 2,
        opacity: Math.random() * 0.1 + 0.05,
      }));
    };

    setLetterElements(generateInitialLetters());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLetterElements((prevLetters) =>
        prevLetters.map((letter) => ({
          ...letter,
          left: (letter.left + letter.speedX + 100) % 100,
          top: (letter.top + letter.speedY + 100) % 100,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="floating-letters-container">
      {letterElements.map((letter) => (
        <span
          key={letter.id}
          className="floating-letter"
          style={{
            left: `${letter.left}vw`,
            top: `${letter.top}vh`,
            fontSize: `${letter.fontSize}rem`,
            opacity: letter.opacity,
          }}
        >
          {letter.char}
        </span>
      ))}
    </div>
  );
}

const ManageDatabaseBooks = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função para buscar os livros do backend
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/livros");
      if (!response.ok) {
        throw new Error("Erro ao buscar livros.");
      }
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para navegar para a página de detalhes do livro
  const handleCardClick = (bookId) => {
    navigate(`/book/${bookId}`); // Navega para a página BookDetails com o ID do livro
  };

  // Função para liberar todas as reservas de um livro
  const releaseAllReservations = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:3001/livros/${bookId}/liberar-reservas`, {
        method: "PUT",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao liberar reservas.");
      }

      alert(`Reservas liberadas com sucesso! Unidades afetadas: ${data.unidades_afetadas}`);
      fetchBooks(); // Atualiza a lista de livros após liberar as reservas
    } catch (error) {
      console.error("Erro ao liberar reservas:", error);
      alert(error.message || "Erro ao liberar reservas. Tente novamente.");
    }
  };

  // Função para atualizar o status do livro
  const updateBookStatus = async (bookId, status) => {
    try {
      const response = await fetch(`http://localhost:3001/livros/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status do livro.");
      }

      const updatedBook = await response.json();
      console.log("Livro atualizado com sucesso:", updatedBook);

      // Atualiza o estado local para refletir a mudança
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === bookId ? { ...book, status } : book
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar livro:", error);
      alert("Erro ao atualizar status do livro.");
    }
  };

  // Função para liberar o livro e remover a reserva (caso esteja reservado)
  const freeBook = async (bookId) => {
    // Atualizar o status do livro para "Disponível"
    await updateBookStatus(bookId, "Disponível");

    // Se o livro estava reservado, vamos remover a reserva
    try {
      const reservationResponse = await fetch(`http://localhost:3001/reservas/${bookId}`, {
        method: "DELETE", // Vamos deletar a reserva associada ao livro
      });

      if (!reservationResponse.ok) {
        throw new Error("Erro ao remover reserva.");
      }

      console.log("Reserva removida com sucesso.");
      fetchBooks(); // Atualiza a lista de livros após remover a reserva
    } catch (error) {
      console.error("Erro ao remover reserva:", error);
      alert("Erro ao remover reserva.");
    }
  };

  // Carregar os livros ao montar o componente
  useEffect(() => {
    fetchBooks();
  }, []);

  // Filtrar livros com base no termo de pesquisa
  const filteredBooks = books.filter((book) =>
    book.nome_do_livro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-books-container floating-background">
      <FloatingLetters />
      <h1 className="gerencialivr">Gerenciar Livros</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input-manage"
        placeholder="Buscar livros..."
      />
      {loading && <p>Carregando...</p>}
      <div className="books-list-manage">
        {filteredBooks.map((book) => (
          <div key={book.id} className="book-card">
            <h3>{book.nome_do_livro}</h3>
            <p>Autor: {book.autor}</p>
            <p>Status: {book.status}</p>
            <button onClick={() => handleCardClick(book.id)}>Detalhes</button>
            <button onClick={() => releaseAllReservations(book.id)}>
              Liberar Reservas
            </button>
            <button onClick={() => freeBook(book.id)}>Remover Reserva</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageDatabaseBooks;