import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../src/styles/search-books.css'; // Usando o mesmo arquivo de estilos da tela SearchBooks

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("Usuário não autenticado");
        return;
      }

      try {
        const response = await fetch(`http://localhost:3001/usuario-logado?id=${userId}`);
        if (!response.ok) {
          throw new Error("Usuário não encontrado");
        }
        const data = await response.json();
        setUser(data);
        return data.id;
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
      }
    };

    const fetchNotifications = async (userId) => {
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

    fetchUserDetails().then(userId => {
      if (userId) fetchNotifications(userId);
    });
  }, []);

  const clearAllNotifications = async () => {
    if (!user?.id) {
      console.error("Usuário não autenticado");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/notifications/${user.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erro ao deletar notificações");
      }
      setNotifications([]);
      alert("Todas as notificações foram deletadas.");
    } catch (error) {
      console.error("Erro ao deletar notificações:", error);
    }
  };

  const cancelBookNotification = async (bookId) => {
    if (!user?.id) {
      console.error("Usuário não autenticado");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/notifications/${user.id}/${bookId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erro ao deletar notificações do livro");
      }
      setNotifications(notifications.filter(notification => notification.book_id !== bookId));
      alert("Notificações do livro deletadas com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar notificações do livro:", error);
    }
  };

  return (
    <div className="search-books-container">
      <h1>Notificações</h1>
      <button onClick={clearAllNotifications} className="clear-all-button">
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
              <p className={`book-availability ${notification.book_status === 'Disponível' ? 'available' : 'unavailable'}`}>
                {notification.book_status === 'Disponível' ? 'Disponível' : 'Indisponível'}
              </p>
              <p className="notification-message">{notification.message}</p>
              <small>{new Date(notification.timestamp).toLocaleString()}</small>
              <button onClick={(e) => { e.stopPropagation(); cancelBookNotification(notification.book_id); }} className="cancel-notification-button">
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
