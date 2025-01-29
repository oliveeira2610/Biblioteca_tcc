import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/manage-books.css";

function ManageDatabaseBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleCardClick = (bookId) => {
    navigate(`/bookStatus/${bookId}`);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="manage-books-container">
      <h1>📚 Gerenciar Livros</h1>
      {loading && <p>Carregando...</p>}
      <div className="books-list">
        {books.map((book) => (
          <div key={book.id} className="book-card" onClick={() => handleCardClick(book.id)}>
            {book.imagem ? (
              <img src={book.imagem} alt={book.nome_do_livro} className="book-card-image" />
            ) : (
              <div className="no-image-placeholder">Sem imagem</div>
            )}
            <h3 className="book-card-title">{book.nome_do_livro}</h3>
            <p className="book-card-author">{book.autor}</p>
            <p className="book-card-status">
              Status: {book.status} {book.atrasado && "(Em atraso)"}
            </p>
            {book.atrasado && (
              <p className="book-card-late">Atrasado por: {book.tempoAtraso} dias</p>
            )}
            {book.multas && book.multas > 0 && (
              <p className="book-card-fine">Multa pendente: R$ {book.multas.toFixed(2)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageDatabaseBooks;
