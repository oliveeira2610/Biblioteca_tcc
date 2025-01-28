import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/manage-books.css";

function ManageDatabaseBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função para buscar os livros do banco de dados
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

  // Função para navegar para a tela de edição de disponibilidade
  const handleCardClick = (bookId) => {
    navigate(`/edit-book/${bookId}`);
  };

  // Função para deletar um livro
  const deleteBook = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:3001/livros/${bookId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Livro removido com sucesso!");
        // Atualiza a lista de livros após a exclusão
        setBooks(books.filter((book) => book.id !== bookId));
      } else {
        alert("Erro ao remover o livro.");
      }
    } catch (error) {
      console.error("Erro ao deletar livro:", error);
      alert("Erro ao tentar remover o livro.");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="manage-books-container">
      <h1>📚 Gerenciar Livros do Banco de Dados</h1>
      {loading && <p>Carregando...</p>}
      <div className="books-list">
        {books.map((book) => (
          <div
            key={book.id}
            className="book-card"
            onClick={() => handleCardClick(book.id)}
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
            <h3 className="book-card-title">{book.nome_do_livro}</h3>
            <p className="book-card-author">{book.autor}</p>
            <p className="book-card-status">Status: {book.status}</p>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Impede o clique de ser propagado para o card
                deleteBook(book.id);
              }}
              className="delete-button"
            >
              🗑️ Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageDatabaseBooks;
