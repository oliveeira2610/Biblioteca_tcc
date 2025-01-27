import React, { useState, useEffect } from 'react';
import '../../src/styles/search-books.css';

function AddBooks() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchBooks = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=10`
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
      fetchBooks(query);
    }
  };

  const handleCardClick = async (book) => {
    const volumeInfo = book.volumeInfo;
    const data = {
      nome_do_livro: volumeInfo.title,
      genero: volumeInfo.categories ? volumeInfo.categories[0] : 'Gênero desconhecido',
      autor: volumeInfo.authors ? volumeInfo.authors[0] : 'Autor desconhecido',
      editora: volumeInfo.publisher || 'Editora desconhecida',
      sinopse: volumeInfo.description || 'Sem sinopse disponível',
      status: 'disponivel',
    };

    console.log('Enviando dados para o servidor:', data);

    try {
      const response = await fetch('http://localhost:3001/livros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatusMessage('Livro adicionado com sucesso!');
        console.log('Resposta da API:', await response.json());
      } else {
        const errorData = await response.json();
        setStatusMessage(`Erro ao adicionar o livro: ${errorData.message || 'Desconhecido'}`);
        console.error('Erro na resposta da API:', errorData);
      }
    } catch (error) {
      console.error('Erro na comunicação com a API:', error);
      setStatusMessage('Erro na comunicação com o servidor.');
    }
  };

  return (
    <div className="search-books-container">
      <h1>🔎 Pesquisa de Livros</h1>
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
        {books.map((book) => {
          const volumeInfo = book.volumeInfo;
          const imageLinks = volumeInfo.imageLinks || {};
          return (
            <div
              key={book.id}
              className="book-card"
              onClick={() => handleCardClick(book)}
            >
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
            </div>
          );
        })}
      </div>

      {/* Exibe a mensagem de status abaixo dos livros */}
      {statusMessage && <div className="status-message">{statusMessage}</div>}
    </div>
  );
}

export default AddBooks;
