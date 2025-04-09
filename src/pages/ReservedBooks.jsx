import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/book-card.css";
import "../../src/styles/reservedBooks.css";
import '../../src/styles/FloatingBackground.css';

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

function ReservedBooks() {
  const [reservedBooks, setReservedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função para buscar os livros reservados
  const fetchReservedBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/livros-com-reservas");
      if (!response.ok) {
        throw new Error("Erro ao buscar livros reservados: " + response.statusText);
      }
      const data = await response.json();
      const filteredBooks = data.filter(book => book.reserva_status === "Reservado");
      setReservedBooks(filteredBooks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Função para navegar para a página de detalhes do livro
  const handleCardClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  // Carregar os livros reservados ao montar o componente
  useEffect(() => {
    fetchReservedBooks();
  }, []);

  return (
    <div className="reserved-books-page-container floating-background">
      <FloatingLetters />
      <h1>📖 Livros Reservados</h1>
      {loading && <p>Carregando...</p>}
      <div className="books-list">
        {reservedBooks.length === 0 && !loading ? (
          <p>Nenhum livro reservado no momento.</p>
        ) : (
          reservedBooks.map((book) => (
            <div
              key={book.livro_id}
              className="book-card"
              onClick={() => handleCardClick(book.livro_id)}
            >
              {book.imagem ? (
                <img src={book.imagem} alt={book.nome_do_livro} className="book-card-image" />
              ) : (
                <div className="no-image-placeholder">Sem imagem</div>
              )}
              <h3 className="book-card-title">{book.nome_do_livro}</h3>
              <p className="book-card-author">{book.autor}</p>
              <p><strong>Editora:</strong> {book.editora}</p>
              <p><strong>Status:</strong> {book.reserva_status}</p>
              {book.multa > 0 && (
                <p className="book-card-fine">Multa pendente: R$ {book.multa.toFixed(2)}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReservedBooks;
