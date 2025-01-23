import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../src/styles/BookDetails.css';

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${id}`
        );
        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error('Erro ao buscar detalhes do livro:', error);
      }
    };
    fetchBookDetails();
  }, [id]);

  if (!book) {
    return <p>Carregando detalhes...</p>;
  }

  const { volumeInfo } = book;
  const imageLinks = volumeInfo.imageLinks || {};

  return (
    <div className="book-details-container">
      <button onClick={() => navigate('/search')} className="back-button">
        ← Voltar
      </button>
      <div className="book-details-content">
        <div className="book-details-image">
          {imageLinks.thumbnail ? (
            <img src={imageLinks.thumbnail} alt={volumeInfo.title} />
          ) : (
            <div className="no-image-placeholder">Sem imagem</div>
          )}
        </div>
        <div className="book-details-info">
          <h1>{volumeInfo.title}</h1>
          <p><strong>Autor(es):</strong> {volumeInfo.authors?.join(', ') || 'Não informado'}</p>
          <p><strong>Gênero:</strong> {volumeInfo.categories?.join(', ') || 'Não informado'}</p>
          <p><strong>Data de Lançamento:</strong> {volumeInfo.publishedDate || 'Não informado'}</p>
          <p><strong>Editora:</strong> {volumeInfo.publisher || 'Não informado'}</p>
          <p><strong>Sinopse:</strong> {volumeInfo.description || 'Sinopse não disponível'}</p>
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
