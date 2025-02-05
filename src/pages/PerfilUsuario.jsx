import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/book-card.css";
import "../../src/styles/perfilUsuario.css";

function PerfilUsuario() {
  const userId = localStorage.getItem("userId"); // Obtendo o ID do usuário logado do localStorage
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]); // Notificações recebidas
  const [watchlist, setWatchlist] = useState([]); // Livros que o usuário selecionou para receber notificações
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:3001/perfil-usuario/${userId}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar informações do usuário.");
        }
        const data = await response.json();
        setUserInfo(data);
        setWatchlist(data.livrosParaNotificacao || []); // Livros que o usuário deseja ser notificado
      } catch (err) {
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

      // Removendo o livro da lista de livros para notificação
      setWatchlist((prevWatchlist) => prevWatchlist.filter((book) => book.livroId !== bookId));
      alert("Notificação removida com sucesso.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!userInfo) return <p>Usuário não encontrado.</p>;

  return (
    <div className="perfil-usuario-container">
      <h1>Perfil do Usuário</h1>
      <div className="dados-pessoais">
        <h2>Dados Pessoais</h2>
        <p><strong>Nome:</strong> {userInfo.userName}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
        <p><strong>Telefone:</strong> {userInfo.telefone}</p>
      </div>

      {/* Lista de livros reservados */}
      <div className="livros-reservados">
        <h2>Livros Reservados</h2>
        {userInfo.reservas.length > 0 ? (
          <div className="books-list">
            {userInfo.reservas.map((reserva) => (
              <div key={reserva.livroId} className="book-card">
                <h3 className="book-card-title">{reserva.nome_do_livro}</h3>
                <p><strong>Data de Reserva:</strong> {new Date(reserva.data_reserva).toLocaleDateString()}</p>
                <p><strong>Data de Devolução:</strong> {new Date(reserva.data_devolucao).toLocaleDateString()}</p>
                <p><strong>Multa:</strong> R$ {reserva.multa.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Não há livros reservados no momento.</p>
        )}
      </div>

      {/* Lista de livros para os quais o usuário deseja receber notificações */}
      <h2>Livros que Você Está Acompanhando</h2>
      {watchlist.length > 0 ? (
        <div className="books-list">
          {watchlist.map((book) => (
            <div key={book.livroId} className="book-card">
              <h3 className="book-card-title">{book.nome_do_livro}</h3>
              <button onClick={() => cancelNotification(book.livroId)} className="cancel-notification-button">
                Deixar de Receber Notificações
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Você não está acompanhando nenhum livro.</p>
      )}

      {/* Notificações recebidas */}
      <h2>Notificações Recebidas</h2>
      {notifications.length > 0 ? (
        <div className="books-list">
          {notifications.map((notification, index) => (
            <div key={index} className="book-card">
              <h3 className="book-card-title">{notification.book_name}</h3>
              <p className="book-card-author">{notification.autor}</p>
              <p className={`book-availability ${notification.book_status === "Disponível" ? "available" : "unavailable"}`}>
                {notification.book_status === "Disponível" ? "Disponível" : "Indisponível"}
              </p>
              <p className="notification-message">{notification.message}</p>
              <small>{new Date(notification.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      ) : (
        <p>Você ainda não recebeu notificações.</p>
      )}
    </div>
  );
}

export default PerfilUsuario;
