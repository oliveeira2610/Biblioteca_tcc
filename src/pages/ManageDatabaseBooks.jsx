import React, { useState, useEffect } from "react";
import ManageBookCard from "../../src/components/ManageBookCard";
import "../../src/styles/manage-books.css";

function ManageDatabaseBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/livros");
      if (!response.ok) {
        throw new Error("Erro ao buscar livros: " + response.statusText);
      }
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
        throw new Error("Erro ao atualizar status");
      }

      fetchBooks();
    } catch (error) {
      console.error("Erro ao atualizar livro:", error);
    }
  };

  const freeBook = async (bookId) => {
    await updateBookStatus(bookId, "Disponível");
    try {
      const reservationResponse = await fetch(`http://localhost:3001/reservas/${bookId}`, {
        method: "DELETE",
      });

      if (!reservationResponse.ok) {
        throw new Error("Erro ao remover reserva");
      }
    } catch (error) {
      console.error("Erro ao remover reserva:", error);
    }
  };

  const reserveBook = async (bookId) => {
    await updateBookStatus(bookId, "Indisponível");
    try {
      const reservationResponse = await fetch("http://localhost:3001/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          livro_id: bookId,
          usuario_id: 1,
        }),
      });

      if (!reservationResponse.ok) {
        throw new Error("Erro ao fazer reserva");
      }
    } catch (error) {
      console.error("Erro ao fazer reserva:", error);
    }
  };

  const deleteBook = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:3001/livros/${bookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar livro");
      }

      fetchBooks();
    } catch (error) {
      console.error("Erro ao deletar livro:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="manage-books-container">
      <h1>📚 Gerenciar Livros</h1>
      {loading && <p>Carregando...</p>}
      <div className="books-list-manage">
        {books.map((book) => (
          <ManageBookCard
            key={book.id}
            book={book}
            freeBook={freeBook}
            reserveBook={reserveBook}
            deleteBook={deleteBook}
          />
        ))}
      </div>
    </div>
  );
}

export default ManageDatabaseBooks;
