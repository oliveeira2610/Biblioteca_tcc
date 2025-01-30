import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../src/styles/BookDetails.css";

function BookDescription() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookDescription = async () => {
      try {
        const response = await fetch(`http://localhost:3001/livros/${id}`);
        if (!response.ok) {
          throw new Error("Livro não encontrado");
        }
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDescription();
  }, [id]);

  if (loading) return <p>Carregando detalhes...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!book) return <p>Livro não encontrado.</p>;

  return (
    <div className="book-details-container">
      <button onClick={() => navigate("/search")} className="back-button">
        ← Voltar
      </button>
      <div className="book-details-content">
        <div className="book-details-image">
          {book.imagem ? (
            <img src={book.imagem} alt={book.nome_do_livro} />
          ) : (
            <div className="no-image-placeholder">Sem imagem</div>
          )}
        </div>
        <div className="book-details-info">
          <h1>{book.nome_do_livro}</h1>
          <p>
            <strong>Autor:</strong> {book.autor || "Não informado"}
          </p>
          <p>
            <strong>Gênero:</strong> {book.genero || "Não informado"}
          </p>
          <p>
            <strong>Data de Lançamento:</strong>{" "}
            {book.data_lancamento || "Não informado"}
          </p>
          <p>
            <strong>Editora:</strong> {book.editora || "Não informado"}
          </p>
          <p>
            <strong>Sinopse:</strong> {book.sinopse || "Sinopse não disponível"}
          </p>
          {/* Verifica o status do livro e altera o texto do botão */}
          {book.status === "Disponível" ? (
            <button
              onClick={() => navigate(`/bookStatus/${id}`)}
              className="reserve-button"
            >
              Reservar
            </button>
          ) : (
            <button className="reserve-button" disabled>
              Indisponível no momento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDescription;
