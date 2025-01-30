import React, { useState, useEffect } from "react";
import BookCard from "../../src/components/BookCard";
import "../../src/styles/search-books.css";

function SearchBooks() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [groupedBooks, setGroupedBooks] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim() === "") {
      setFilteredBooks(books);
      groupBooksByGenre(books);
      return;
    }
    const searchResults = books.filter((book) =>
      book.nome_do_livro.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredBooks(searchResults);
    groupBooksByGenre(searchResults);
  };

  return (
    <div className="search-books-container">
      <h1>📚 Biblioteca</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Pesquisar livros..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Buscar</button>
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
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchBooks;
