import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../src/styles/global.css";
import '../../src/styles/notifications.css'; 

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
  
        // Atualiza automaticamente as notificações a cada 10 segundos
        const interval = setInterval(() => {
          fetchNotifications(userId);
        }, 10000);
  
        return () => clearInterval(interval);
      }
    };
  
    loadData();
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
  
      alert("Todas as notificações foram deletadas. Novas notificações aparecerão quando disponíveis.");
      setNotifications([]); 
  
      // Buscar novas notificações depois de 5 segundos
      setTimeout(() => {
        fetch(`http://localhost:3001/notifications/${user.id}`)
          .then((response) => response.json())
          .then((data) => setNotifications(data))
          .catch((error) => console.error("Erro ao buscar notificações:", error));
      }, 5000);
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
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.book_id !== bookId)
      );
      alert("Notificações do livro deletadas com sucesso.");
    } catch (error) {
      console.error("Erro ao deletar notificações do livro:", error);
    }
  };

  return (
    <div className="notifications-page-container">
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
