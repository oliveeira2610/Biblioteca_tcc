import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function BookReservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [user, setUser] = useState(null);
  const [reservationDate, setReservationDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState('');
  const [fine, setFine] = useState(0);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/livros/${id}`);
        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error('Erro ao buscar detalhes do livro:', error);
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:3001/user-profile`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    };

    fetchBookDetails();
    fetchUserProfile();
  }, [id]);

  const handleReservation = async () => {
    if (!returnDate) {
      alert('Por favor, selecione uma data de devolução.');
      return;
    }

    const reservationData = {
      userId: user.id,
      bookId: book.id,
      reservationDate,
      returnDate,
      fine: 0,
      status: 'Reservado'
    };

    try {
      await fetch('http://localhost:3001/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
      });
      alert('Livro reservado com sucesso!');
      navigate('/manage-books');
    } catch (error) {
      console.error('Erro ao reservar livro:', error);
    }
  };

  return (
    <div className="reservation-container">
      <h1>Reserva de Livro</h1>
      {book && user ? (
        <div>
          <h2>{book.nome_do_livro}</h2>
          <p><strong>Autor:</strong> {book.autor}</p>
          <p><strong>Usuário:</strong> {user.nome}</p>
          <label>
            Data de Devolução:
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </label>
          <button onClick={handleReservation}>Confirmar Reserva</button>
        </div>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}

export default BookReservation;
