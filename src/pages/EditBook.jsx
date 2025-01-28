import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../src/styles/BookDetails.css';

function EditBook() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [status, setStatus] = useState('');

  const fetchBook = async () => {
    try {
      const response = await fetch(`http://localhost:3001/livros/${bookId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar o livro: ' + response.statusText);
      }
      const data = await response.json();
      setBook(data);
      setStatus(data.status);
    } catch (error) {
      console.error('Erro ao buscar o livro:', error);
    }
  };

  const updateBookStatus = async () => {
    try {
      const response = await fetch(`http://localhost:3001/livros/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert('Status atualizado com sucesso!');
        navigate('/manage-database-books');
      } else {
        alert('Erro ao atualizar o status.');
      }
    } catch (error) {
      console.error('Erro na atualização do status:', error);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  if (!book) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="edit-book-container">
      <button
        className="back-button"
        onClick={() => navigate(-1)} // Volta à página anterior
      >
        ← Voltar
      </button>
      <h1>✏️ Editar Livro</h1>
      <div className="book-details">
        {book.imagem ? (
          <img src={book.imagem} alt={book.nome_do_livro} />
        ) : (
          <div className="no-image-placeholder">Sem imagem</div>
        )}
        <h2>{book.nome_do_livro}</h2>
        <p>Autor: {book.autor}</p>
        <p>Editora: {book.editora}</p>
        <p>Gênero: {book.genero}</p>
        <textarea
          value={book.sinopse}
          readOnly
          className="sinopse-textarea"
        ></textarea>
        <div className="status-select">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
            <option value="indisponivel">Indisponível</option>
          </select>
        </div>
        <button onClick={updateBookStatus} className="update-button">
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}

export default EditBook;
