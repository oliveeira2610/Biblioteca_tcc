import React, { useState, useEffect } from 'react';
import '../../src/styles/manage-books.css';

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Função para buscar os livros do banco de dados
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/livros');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar o status do livro no banco
  const updateBookStatus = async (bookId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/livros/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.id === bookId ? { ...book, status: newStatus } : book
          )
        );
      } else {
        console.error('Erro ao atualizar o status do livro');
      }
    } catch (error) {
      console.error('Erro na comunicação com a API:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="manage-books-container">
      <h1>📚 Gerenciar Livros</h1>
      {loading && <p>Carregando...</p>}
      <div className="books-list">
        {books.map((book) => {
          const volumeInfo = book.volumeInfo;
          const imageLinks = volumeInfo.imageLinks || {};
          return (
            <div key={book.id} className="book-card">
              {imageLinks.thumbnail ? (
                <img
                  src={imageLinks.thumbnail}
                  alt={volumeInfo.title}
                  className="book-card-image"
                />
              ) : (
                <div className="no-image-placeholder">Sem imagem</div>
              )}
              <h3 className="book-card-title">{volumeInfo.title}</h3>
              <p className="book-card-author">{volumeInfo.authors ? volumeInfo.authors[0] : 'Autor desconhecido'}</p>
              <p className="book-card-status">
                Status: {book.status}
              </p>
              <div className="status-buttons">
                <button
                  onClick={() => updateBookStatus(book.id, 'disponivel')}
                  className="status-button available"
                >
                  Disponível
                </button>
                <button
                  onClick={() => updateBookStatus(book.id, 'reservado')}
                  className="status-button reserved"
                >
                  Reservado
                </button>
                <button
                  onClick={() => updateBookStatus(book.id, 'indisponivel')}
                  className="status-button unavailable"
                >
                  Indisponível
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ManageBooks;
