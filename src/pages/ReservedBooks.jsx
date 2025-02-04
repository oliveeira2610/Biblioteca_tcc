import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/book-card.css";
import "../../src/styles/reservedBooks.css";

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
    <div className="reserved-books-page-container">
      <h1>📖 Livros Reservados</h1>
      {loading && <p>Carregando...</p>}
      <div className="books-list">
        {reservedBooks.length === 0 && !loading ? (
          <p>Nenhum livro reservado no momento.</p>
        ) : (
          reservedBooks.map((book) => (
            <div
              key={book.id}
              className="book-card"
              onClick={() => handleCardClick(book.id)}
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
