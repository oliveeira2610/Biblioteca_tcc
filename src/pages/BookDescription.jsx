import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../src/styles/BookDetails.css";

function BookDescription() {
  const { id } = useParams();
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/livro-detalhes/${id}`);
        if (!response.ok) {
          throw new Error("Livro não encontrado");
        }
        const data = await response.json();
        setBookDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  if (loading) return <p>Carregando detalhes...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!bookDetails) return <p>Livro não encontrado.</p>;

  return (
    <div className="book-details-container">
      <button onClick={() => navigate("/search")} className="back-button">
        ← Voltar
      </button>
      <div className="book-details-content">
        <div className="book-details-image">
          {bookDetails.imagem ? (
            <img src={bookDetails.imagem} alt={bookDetails.nome_do_livro} />
          ) : (
            <div className="no-image-placeholder">Sem imagem</div>
          )}
        </div>
        <div className="book-details-info">
          <h1>{bookDetails.nome_do_livro}</h1>
          <p><strong>Autor:</strong> {bookDetails.autor || "Não informado"}</p>
          <p><strong>Gênero:</strong> {bookDetails.genero || "Não informado"}</p>
          <p><strong>Data de Lançamento:</strong> {bookDetails.data_lancamento || "Não informado"}</p>
          <p><strong>Editora:</strong> {bookDetails.editora || "Não informado"}</p>
          <p><strong>Sinopse:</strong> {bookDetails.sinopse || "Sinopse não disponível"}</p>
          <p><strong>Reservado até:</strong> {bookDetails.data_devolucao || "Não informado"}</p>

          {bookDetails.status === "Disponível" ? (
            <button onClick={() => navigate(`/bookStatus/${id}`)} className="reserve-button">
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
