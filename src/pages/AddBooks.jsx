import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../src/styles/addBooks.css';
import '../../src/styles/button.css';

function AddBooks() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  const fetchBooks = async (searchQuery) => {
    setLoading(true);
    setStatusMessage('');
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=10`
      );
      const data = await response.json();
      setBooks(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      setStatusMessage('Erro ao buscar livros. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() !== '') {
      fetchBooks(query);
    }
  };

  const handleCardClick = (book) => {
    navigate('/register-book', { state: { book } });
  };

  return (
    <div className="add-books-container">
      <h1>🔎 Pesquisa de Livros</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Digite o nome do livro, autor ou gênero"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Buscar</button>
      </form>

      {loading && <p>Carregando...</p>}

      <div className="books-list">
        {books.map((book) => {
          const volumeInfo = book.volumeInfo;
          return (
            <div key={book.id} className="book-card" onClick={() => handleCardClick(book)}>
              {volumeInfo.imageLinks?.thumbnail ? (
                <img src={volumeInfo.imageLinks.thumbnail} alt={volumeInfo.title} className="book-card-image" />
              ) : (
                <div className="no-image-placeholder">Sem imagem</div>
              )}
              <h3 className="book-card-title">{volumeInfo.title}</h3>
            </div>
          );
        })}
      </div>

      {statusMessage && <div className="status-message">{statusMessage}</div>}
    </div>
  );
}

export default AddBooks;