import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../src/styles/global.css";
import '../../src/styles/notifications.css';
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

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("Usuário não autenticado");
        return null;
      }
  
      try {
        const response = await fetch(`http://localhost:3001/usuario-logado?id=${userId}`);
        if (!response.ok) {
          throw new Error("Usuário não encontrado");
        }
        const data = await response.json();
        setUser(data);
        return userId;
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        return null;
      }
    };
  
    const fetchNotifications = async (userId) => {
      if (!userId) return;
      try {
        const response = await fetch(`http://localhost:3001/notifications/${userId}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar notificações");
        }
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };
  
    const loadData = async () => {
      const userId = await fetchUserDetails();
      if (userId) {
        fetchNotifications(userId);
        const interval = setInterval(() => {
          fetchNotifications(userId);
        }, 10000);
        return () => clearInterval(interval);
      }
    };
  
    loadData();
  }, []);

  return (
    <div className="notifications-page-container floating-background">
      <FloatingLetters />
      <h1 className='titolo'>Notificações</h1>
      <button onClick={() => setNotifications([])} className="clear-all-button">
        Limpar Todas as Notificações
      </button>
      {notifications.length > 0 ? (
        <div className="books-list">


          {notifications.map((notification, index) => (
            <div
              key={index}
              className="book-card"
              onClick={() => navigate(`/BookDescription/${notification.book_id}`)}
            >
              {notification.imagem ? (
                <img
                  src={notification.imagem}
                  alt={notification.book_name}
                  className="book-card-image"
                />
              ) : (
                <div className="no-image-placeholder">Sem imagem</div>
              )}
              <h3 className="book-card-title">{notification.book_name}</h3>
              <p className="book-card-author">{notification.autor}</p>
              <p
                className={`book-availability ${
                  notification.book_status === 'Disponível' ? 'available' : 'unavailable'
                }`}
              >
                {notification.book_status === 'Disponível' ? 'Disponível' : 'Indisponível'}
              </p>
              <p className="notification-message">{notification.message}</p>
              <small>{new Date(notification.timestamp).toLocaleString()}</small>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cancelBookNotification(notification.book_id);
                }}
                className="cancel-notification-button"
              >
                Limpar Notificação
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Sem notificações no momento</p>
      )}
    </div>
  );
}

export default Notifications;