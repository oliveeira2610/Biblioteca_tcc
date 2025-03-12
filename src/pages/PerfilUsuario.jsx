import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/book-card.css";
import "../../src/styles/perfilUsuario.css";
import "../../src/styles/FloatingBackground.css";

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

function PerfilUsuario() {
  const userId = localStorage.getItem("userId");
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/perfil-usuario/${userId}`
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar informações do usuário.");
        }
        const data = await response.json();
        console.log("Dados recebidos:", data);
        setUserInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!userInfo) return <p>Usuário não encontrado.</p>;

  return (
    <div className="perfil-usuario-container floating-background">
      <FloatingLetters />

      <div className="container_principal_user">
        <div className="primeiro_container">
          <div className="esquerda_primeira">
            <div className="img_perfil">
              <img src="src/assets/img/perfil_icone.png" alt="" />
            </div>
            <div className="dados-pessoais">
              <p id="nome_p">
                <strong>Nome:</strong> {userInfo.userName}
              </p>
              <p>
                <strong>Email:</strong> {userInfo.email}
              </p>
              <p>
                <strong>Telefone:</strong> {userInfo.telefone}
              </p>
              <p>
                <strong>CPF:</strong> {userInfo.cpf}
              </p>
              <p>
                <strong>Multa Pendente:</strong> {userInfo.multa}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {isBlocked ? "Bloqueado" : "Desbloqueado"}
              </p>
            </div>
          </div>
          <div className="direita_primeira">
            <h2 id="suas_multas">SUAS MULTAS</h2>
            <div className="multas_perfil"></div>
            <h2 id="livros_reservados_h2"> LIVROS RESERVADOS</h2>
            <div className="reservados_perfil">
              <div className="livros-reservados">
                <h2>Livros Reservados</h2>
                {userInfo.reservas.length > 0 ? (
                  <div className="books-list">
                    {userInfo.reservas.map((reserva) => (
                      <div key={reserva.livroId} className="book-card">
                        <h3 className="book-card-title">
                          {reserva.nome_do_livro}
                        </h3>
                        <p>
                          <strong>Data de Reserva:</strong>{" "}
                          {new Date(reserva.data_reserva).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Data de Devolução:</strong>{" "}
                          {new Date(
                            reserva.data_devolucao
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Multa:</strong> R$ {reserva.multa.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Não há livros reservados no momento.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="esquerda_segundo">
  <h1>LIVROS QUE VOCÊ ESTÁ ACOMPANHANDO</h1>
  <div className="livros_acompanhando">
    {userInfo.watchlist && userInfo.watchlist.length > 0 ? (
      <div className="books-list">
        {userInfo.watchlist.map((book) => (
          <div key={book.livroId} className="book-card">
            <h3 className="book-card-title">{book.nome_do_livro}</h3>
            <button
              onClick={() => cancelNotification(book.livroId)}
              className="cancel-notification-button"
            >
              Deixar de Receber Notificações
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p>Você não está acompanhando nenhum livro.</p>
    )}
  </div>
</div>

<div className="direita_segundo">
  <h1>NOTIFICAÇÕES</h1>
  <div className="notificacoes">
    {userInfo.notifications && userInfo.notifications.length > 0 ? (
      <div className="books-list">
        {userInfo.notifications.map((notification, index) => (
          <div key={index} className="book-card">
            <h3 className="book-card-title">{notification.book_name}</h3>
            <p className="book-card-author">{notification.autor}</p>
            <p
              className={`book-availability ${
                notification.book_status === "Disponível"
                  ? "available"
                  : "unavailable"
              }`}
            >
              {notification.book_status === "Disponível"
                ? "Disponível"
                : "Indisponível"}
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
</div>

      </div>
    </div>
  );
}

export default PerfilUsuario;
