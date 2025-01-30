import React, { useState } from 'react';
import '../../src/styles/search-books.css';

function AddBooks() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Função para buscar livros da API do Google
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

  // Função chamada ao enviar o formulário de pesquisa
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() !== '') {
      fetchBooks(query);
    }
  };

  // Função para adicionar um livro ao banco de dados local
  const handleCardClick = async (book) => {
    const volumeInfo = book.volumeInfo;
    const data = {
      nome_do_livro: volumeInfo.title,
      genero: volumeInfo.categories ? volumeInfo.categories[0] : 'Gênero desconhecido',
      autor: volumeInfo.authors ? volumeInfo.authors[0] : 'Autor desconhecido',
      editora: volumeInfo.publisher || 'Editora desconhecida',
      sinopse: volumeInfo.description || 'Sem sinopse disponível',
      isbn: volumeInfo.industryIdentifiers ? volumeInfo.industryIdentifiers[0].identifier : 'Desconhecido',
      ano_publicacao: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.slice(0, 4)) : 0,
      status: 'disponivel',
      imagem: volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/150',
    };

    try {
      const response = await fetch('http://localhost:3001/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage('✅ Livro adicionado com sucesso!');
      } else {
        setStatusMessage(`❌ Erro: ${result.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao comunicar com a API:', error);
      setStatusMessage('❌ Erro na comunicação com o servidor.');
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
