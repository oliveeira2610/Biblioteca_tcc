import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../src/styles/global.css';
import '../../src/styles/notifications.css';
import '../../src/styles/FloatingBackground.css';

function FloatingLetters() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
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

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:3001/usuario-logado?id=${userId}`);
        const data = await response.json();
        setUser(data);
        return userId;
      } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        return null;
      }
    };

    const fetchNotifications = async (userId) => {
      try {
        const response = await fetch(`http://localhost:3001/notifications/${userId}`);
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error('Erro ao buscar notificações:', err);
      }
    };

    const loadData = async () => {
      const userId = await fetchUserDetails();
      if (userId) {
        fetchNotifications(userId);
        const interval = setInterval(() => fetchNotifications(userId), 10000);
        return () => clearInterval(interval);
      }
    };

    loadData();
  }, []);

  const cancelBookNotification = (bookId) => {
    // lógica para cancelar a notificação (ainda a ser implementada)
    console.log(`Cancelando notificação do livro ${bookId}`);
  };

  return (
    <div className="notifications-page-container floating-background">
      <FloatingLetters />
      <h2 className="notifications-title">Notificações</h2>
      {notifications.length > 0 ? (
        <div className="notifications-list">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="notification-card"
              onClick={() => navigate(`/BookDescription/${notification.book_id}`)}
            >
              <p className="notification-date">
                {new Date(notification.timestamp).toLocaleDateString('pt-BR')}
              </p>
              <p className="notification-message">
                <strong>{notification.book_name || 'Notificação'}</strong>{' '}
                {notification.message}
              </p>
              {notification.book_status && (
                <p className={`notification-availability ${notification.book_status === 'Disponível' ? 'available' : 'unavailable'}`}>
                  {notification.book_status}
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cancelBookNotification(notification.book_id);
                }}
                className="clear-notification-button"
              >
                Limpar Notificação
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-notifications-message">Sem notificações no momento</p>
      )}
    </div>
  );
}

export default Notifications;
