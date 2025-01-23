import React, { useState } from 'react';
import '../../src/styles/search-books.css';

function SearchBooks() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=10`
      );
      const data = await response.json();
      if (data.items) {
        setBooks(data.items);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() !== '') {
      fetchBooks();
    }
  };

  return (
    <div className="search-books-container">
      <h4>🔎 Pesquisa de Livros</h4>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Digite o nome do livro, autor ou gênero"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Buscar
        </button>
      </form>
      {loading && <p>Carregando...</p>}
      <div className="books-list">
        {books.length > 0 ? (
          books.map((book) => {
            const volumeInfo = book.volumeInfo;
            const imageLinks = volumeInfo.imageLinks || {};
            return (
              <div key={book.id} className="book-card">
                <div className="book-card-image">
                  {imageLinks.thumbnail ? (
                    <img
                      src={imageLinks.thumbnail}
                      alt={volumeInfo.title}
                    />
                  ) : (
                    <div className="no-image-placeholder">Sem imagem</div>
                  )}
                </div>
                <div className="book-card-info">
                  <h2>{volumeInfo.title}</h2>
                  <p>
                    <strong>Autor(es):</strong> {volumeInfo.authors?.join(', ') || 'Não informado'}
                  </p>
                  <p>
                    <strong>Gênero:</strong> {volumeInfo.categories?.join(', ') || 'Não informado'}
                  </p>
                  <p>
                    <strong>Data de Lançamento:</strong> {volumeInfo.publishedDate || 'Não informado'}
                  </p>
                  <p>
                    <strong>Editora:</strong> {volumeInfo.publisher || 'Não informado'}
                  </p>
                  <p>
                    <strong>Sinopse:</strong> {volumeInfo.description || 'Sinopse não disponível'}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          !loading && <p>Nenhum livro encontrado. Tente outra pesquisa.</p>
        )}
      </div>
    </div>
  );
}

export default SearchBooks;
