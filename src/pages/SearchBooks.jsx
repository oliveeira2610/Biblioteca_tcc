import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/search-books.css";
import "../../src/styles/book-card.css";
import "../../src/styles/button.css";
import "../../src/styles/FloatingBackground.css";

function FloatingLetters() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
  const [letterElements, setLetterElements] = useState([]);

  useEffect(() => {
    const generateInitialLetters = () => {
      return Array.from({ length: 40 }).map((_, index) => ({
        id: index,
        char: letters[Math.floor(Math.random() * letters.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        fontSize: Math.random() * 3 + 2,
        opacity: Math.random() * 0.1 + 0.05,
      }));
    };

    setLetterElements(generateInitialLetters());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLetterElements((prevLetters) =>
        prevLetters.map((letter) => ({
          ...letter,
          left: (letter.left + letter.speedX + 100) % 100,
          top: (letter.top + letter.speedY + 100) % 100,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="floating-letters-container">
      {letterElements.map((letter) => (
        <span
          key={letter.id}
          className="floating-letter"
          style={{
            left: `${letter.left}vw`,
            top: `${letter.top}vh`,
            fontSize: `${letter.fontSize}rem`,
            opacity: letter.opacity,
          }}
        >
          {letter.char}
        </span>
      ))}
    </div>
  );
}

function SearchBooks() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [groupedBooks, setGroupedBooks] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/livros");
      if (!response.ok) {
        throw new Error("Erro ao buscar livros: " + response.statusText);
      }
      const data = await response.json();
      setBooks(data);
      setFilteredBooks(data);
      groupBooksByGenre(data);
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupBooksByGenre = (books) => {
    const grouped = books.reduce((acc, book) => {
      const genre = book.genero || "Outros";
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push(book);
      return acc;
    }, {});
    setGroupedBooks(grouped);
  };

  const handleSearch = (newQuery) => {
    if (newQuery.trim() === "") {
      setFilteredBooks(books);
      groupBooksByGenre(books);
      return;
    }
    const searchResults = books.filter((book) =>
      book.nome_do_livro.toLowerCase().includes(newQuery.toLowerCase())
    );
    setFilteredBooks(searchResults);
    groupBooksByGenre(searchResults);
  };

  const handleCardClick = (bookId) => {
    navigate(`/BookDescription/${bookId}`);
  };

  return (
    <div className="search-books-container floating-background">
      <FloatingLetters />
      <h1>📚 Biblioteca</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Pesquisar livros..."
          value={query}
          onChange={(e) => {
            const newQuery = e.target.value;
            setQuery(newQuery);
            handleSearch(newQuery); // Faz a pesquisa instantânea
          }}
          className="search-input"
        />

        <button type="submit" className="search-button">
          Buscar
        </button>
      </form>

      {loading && <p>Carregando...</p>}

      {filteredBooks.length === 0 && !loading && (
        <p className="no-results">
          Nenhum livro encontrado. Verifique a ortografia ou tente outro termo.
        </p>
      )}

      {Object.keys(groupedBooks).map((genre) => (
        <div key={genre} className="genre-section">
          <h2>{genre}</h2>
          <div className="books-list">
            {groupedBooks[genre].map((book) => (
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

                {/* Exibindo o status do livro */}
                <p
                  className={`book-availability ${
                    book.quantidade_disponivel_nao_alugada > 0
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {book.quantidade_disponivel_nao_alugada > 0
                    ? "Disponível"
                    : "Indisponível"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchBooks;
