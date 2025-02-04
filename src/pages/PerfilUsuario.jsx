import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../src/styles/global.css";
import "../../src/styles/book-card.css";
import "../../src/styles/perfilUsuario.css";

function PerfilUsuario() {
  const userId = localStorage.getItem("userId"); // Obtendo o ID do usuário logado do localStorage
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log("Fetching user info for userId:", userId); // Log de depuração
        const response = await fetch(`http://localhost:3001/perfil-usuario/${userId}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar informações do usuário.");
        }
        const data = await response.json();
        console.log("User info received:", data); // Log de depuração
        setUserInfo(data);
      } catch (err) {
        console.error("Error fetching user info:", err); // Log de depuração
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:3001/notifications/${userId}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar notificações.");
        }
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err); // Log de depuração
        setError(err.message);
      }
    };

    fetchUserInfo();
    fetchNotifications();
  }, [userId]);

  const cancelNotification = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:3001/register-notification/${userId}/${bookId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erro ao cancelar notificação.");
      }
      setNotifications(notifications.filter(notification => notification.book_id !== bookId));
      alert("Notificação cancelada com sucesso.");
    } catch (err) {
      console.error("Error canceling notification:", err); // Log de depuração
      setError(err.message);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!userInfo) return <p>Usuário não encontrado.</p>;

  return (
    <div className="perfil-usuario-container"> {/* Utilizando a mesma classe contêiner da tela SearchBooks */}
      <h1>Perfil do Usuário</h1>
      <div className="dados-pessoais">
        <h2>Dados Pessoais</h2>
        <p><strong>Nome:</strong> {userInfo.userName}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
        <p><strong>Telefone:</strong> {userInfo.telefone}</p>
      </div>
      <div className="livros-reservados">
        <h2>Livros Reservados</h2>
        {userInfo.reservas.length > 0 ? (
          <ul>
            {userInfo.reservas.map((reserva, index) => (
              <li key={index}>
                <p><strong>Livro:</strong> {reserva.nome_do_livro}</p>
                <p><strong>Data de Reserva:</strong> {new Date(reserva.data_reserva).toLocaleDateString()}</p>
                <p><strong>Data de Devolução:</strong> {new Date(reserva.data_devolucao).toLocaleDateString()}</p>
                <p><strong>Multa:</strong> R$ {reserva.multa.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há livros reservados no momento.</p>
        )}
      </div>
      <div className="livros-para-notificacao">
        <h2>Livros Marcados para Notificação</h2>
        {userInfo.livrosParaNotificacao.length > 0 ? (
          <ul>
            {userInfo.livrosParaNotificacao.map((livro, index) => (
              <li key={index}>
                <p>{livro.nome_do_livro}</p>
                <button onClick={() => cancelNotification(livro.livroId)} className="cancel-notification-button">
                  Desabilitar Notificação
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há livros marcados para notificação no momento.</p>
        )}
        <h2>Notificações</h2>
        {notifications.length > 0 ? (
          <div className="books-list">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="book-card"
                onClick={() => navigate(`/BookDescription/${notification.book_id}`)}
                aria-label={`Detalhes do livro ${notification.book_name}`}
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
                <button onClick={(e) => { e.stopPropagation(); cancelNotification(notification.book_id); }} className="cancel-notification-button">
                  Limpar Notificação
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Não há notificações no momento.</p>
        )}
      </div>
    </div>
  );
}

export default PerfilUsuario;
