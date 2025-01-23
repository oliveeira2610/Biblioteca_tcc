

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../../src/styles/search-books.css';

// function SearchBooks() {
//   const [query, setQuery] = useState('');
//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   // Recuperando a última pesquisa salva
//   useEffect(() => {
//     const savedQuery = localStorage.getItem('lastSearchQuery');
//     if (savedQuery) {
//       setQuery(savedQuery);
//       fetchBooks(savedQuery);
//     }
//   }, []);

//   const fetchBooks = async (searchQuery) => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=10`
//       );
//       const data = await response.json();
//       if (data.items) {
//         setBooks(data.items);
//       } else {
//         setBooks([]);
//       }
//     } catch (error) {
//       console.error('Erro ao buscar livros:', error);
//       setBooks([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (query.trim() !== '') {
//       // Salvar no localStorage a última pesquisa
//       localStorage.setItem('lastSearchQuery', query);
//       fetchBooks(query);
//     }
//   };

//   const handleCardClick = (bookId) => {
//     navigate(`/book/${bookId}`);
//   };

//   return (
//     <div className="search-books-container">
//       <h1>🔎 Pesquisa de Livros</h1>
//       <form onSubmit={handleSearch} className="search-form">
//         <input
//           type="text"
//           placeholder="Digite o nome do livro, autor ou gênero"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           className="search-input"
//         />
//         <button type="submit" className="search-button">
//           Buscar
//         </button>
//       </form>
//       {loading && <p>Carregando...</p>}
//       <div className="books-list">
//         {books.map((book) => {
//           const volumeInfo = book.volumeInfo;
//           const imageLinks = volumeInfo.imageLinks || {};
//           return (
//             <div
//               key={book.id}
//               className="book-card"
//               onClick={() => handleCardClick(book.id)}
//             >
//               {imageLinks.thumbnail ? (
//                 <img
//                   src={imageLinks.thumbnail}
//                   alt={volumeInfo.title}
//                   className="book-card-image"
//                 />
//               ) : (
//                 <div className="no-image-placeholder">Sem imagem</div>
//               )}
//               <h3 className="book-card-title">{volumeInfo.title}</h3>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// export default SearchBooks;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../src/styles/search-books.css';

function SearchBooks() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verifica se o componente foi montado na página de pesquisa
  useEffect(() => {
    const savedQuery = localStorage.getItem('lastSearchQuery');
    if (savedQuery) {
      setQuery(savedQuery);
      fetchBooks(savedQuery);
    }
  }, []); // A dependência vazia faz com que esse useEffect só rode uma vez ao carregar a página

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
      // Salvar no localStorage a última pesquisa
      localStorage.setItem('lastSearchQuery', query);
      fetchBooks(query);
    }
  };

  const handleCardClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const clearSearch = () => {
    setQuery('');
    setBooks([]);
    localStorage.removeItem('lastSearchQuery');
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

      {/* Botão para limpar a pesquisa */}
      <button onClick={clearSearch} className="clear-button">
        Limpar Pesquisa
      </button>

      {loading && <p>Carregando...</p>}

      <div className="books-list">
        {books.map((book) => {
          const volumeInfo = book.volumeInfo;
          const imageLinks = volumeInfo.imageLinks || {};
          return (
            <div
              key={book.id}
              className="book-card"
              onClick={() => handleCardClick(book.id)}
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
    </div>
  );
}

export default SearchBooks;
