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
  const userId = localStorage.getItem("userId"); // Obtendo o ID do usuário logado do localStorage
  const [userInfo, setUserInfo] = useState(null);
  const [notifications, setNotifications] = useState([]); // Notificações recebidas
  const [watchlist, setWatchlist] = useState([]); // Livros que o usuário selecionou para receber notificações
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false); // Adicionado estado para bloqueio do usuário
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
        console.log("Dados recebidos:", data); // Verifique se o CPF está aqui
        setUserInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/notifications/${userId}`
        );
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
      const response = await fetch(
        `http://localhost:3001/register-notification/${userId}/${bookId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao cancelar notificação.");
      }

      // Removendo o livro da lista de livros para notificação
      setWatchlist((prevWatchlist) =>
        prevWatchlist.filter((book) => book.livroId !== bookId)
      );
      alert("Notificação removida com sucesso.");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId"); // Remove o ID do usuário do localStorage
    navigate("/"); // Redireciona para a tela de login
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
            <div className="multas_perfil">
              dsfs  
            </div>
            <div className="reservados_perfil">
              sadas
            </div>
          </div>
        </div>
        <div className="segundo_container"></div>
      </div>
    </div>
  );
}

export default PerfilUsuario;
