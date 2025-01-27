import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../src/styles/manage-books.css';

function ManageDatabaseBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  // Função para navegar para a tela de edição de disponibilidade
  const handleCardClick = (bookId) => {
    navigate(`/edit-book/${bookId}`);
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageDatabaseBooks;
