import React, { useEffect, useState } from "react";
import "../../src/styles/Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

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
    <div className="notifications-container">
      <h1>Notificações</h1>
      <button onClick={clearAllNotifications} className="clear-all-button">
        Limpar Todas as Notificações
      </button>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notification, index) => (
            <li key={index}>
              <p>{notification.message}</p>
              <small>{new Date(notification.timestamp).toLocaleString()}</small>
              <button onClick={() => cancelBookNotification(notification.book_id)} className="cancel-notification-button">
                Cancelar Notificação
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Sem notificações no momento</p>
      )}
    </div>
  );
}

export default Notifications;
