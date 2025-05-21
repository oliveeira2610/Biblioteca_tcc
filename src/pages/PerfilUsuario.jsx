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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:3001/perfil-usuario/${userId}`);
        if (!response.ok) throw new Error("Erro ao buscar informações do usuário.");
        const data = await response.json();

        // Buscar notificações
        const notif = await fetch(`http://localhost:3001/notifications/${userId}`);
        const notificacoes = await notif.json();

        // Buscar livros acompanhados
        const watchRes = await fetch(`http://localhost:3001/livros-para-notificacao/${userId}`);
        const watchlist = await watchRes.json();

        setUserInfo({ ...data, notifications: notificacoes || [], watchlist: watchlist || [] });
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

  const cancelNotification = async (bookId) => {
    await fetch(`http://localhost:3001/register-notification/${userId}/${bookId}`, {
      method: "DELETE",
    });
    setUserInfo((prev) => ({
      ...prev,
      watchlist: prev.watchlist.filter((b) => b.book_id !== bookId),
    }));
  };

  const payFine = async (livroId, nome_do_livro, multa) => {
    try {
      const response = await fetch("http://localhost:3001/create_preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `Multa - ${nome_do_livro}`,
          quantity: 1,
          price: multa,
        }),
      });
  
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point; // Redireciona para o pagamento
      } else {
        alert("Erro ao gerar link de pagamento.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar pagamento.");
    }
  };
  

  const deleteNotification = async (bookId) => {
    await fetch(`http://localhost:3001/notifications/${userId}/${bookId}`, {
      method: "DELETE",
    });
    setUserInfo((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.book_id !== bookId),
    }));
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!userInfo) return <p>Usuário não encontrado.</p>;

  const totalReservados = userInfo.reservas?.length || 0;
  const totalAcompanhando = userInfo.watchlist?.length || 0;
  const multasPendentes = userInfo.reservas?.filter((r) => r.multa > 0) || [];

  async function iniciarPagamento(valorMulta) {
    try {
      const res = await fetch("http://localhost:3001/criar-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: valorMulta }),
      });
  
      if (!res.ok) throw new Error("Erro ao criar preferência de pagamento");
  
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error("Erro:", err.message);
      alert("Não foi possível iniciar o pagamento.");
    }
  }
  
  
  
  return (
    <div className="perfil-usuario-container">
      <FloatingLetters />
      
  
      <div className="container_principal_user">
      
        <div className="primeiro_container">
          <div className="esquerda_primeira">
            <div className="img_perfil">
              <img src="/src/assets/img/perfil_icone.png" alt="Perfil" />
            </div>
            <div className="dados-pessoais">
              <p><strong>Nome:</strong> {userInfo.userName}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Telefone:</strong> {userInfo.telefone || "Não informado"}</p>
              <p><strong>Status:</strong> {userInfo.bloqueado ? "🚫 Bloqueado" : "✅ Ativo"}</p>
              <p><strong>Livros Reservados:</strong> {totalReservados}</p>
              <p><strong>Acompanhando:</strong> {totalAcompanhando}</p>
              <button className="logout-button" onClick={handleLogout}>Sair</button>
            </div>
          </div>
  
          <div className="direita_primeira">
            <h2>SUAS MULTAS</h2>
            <div className="multas_perfil">
            {(userInfo.reservas || []).map((reserva) => (
              <div key={reserva.livroId} className="book-card">
                <h4>{reserva.nome_do_livro}</h4>
                <p><strong>Multa:</strong> R$ {(reserva.multa || 0).toFixed(2)}</p>
                {reserva.multa > 0 && (
                  <button
                    onClick={() => iniciarPagamento(reserva.multa)} // ✅ Aqui está certo
                    className="pay-button"
                  >
                    Pagar Multa
                  </button>
                )}
              </div>
            ))}
  
            </div>
  
            <h2>LIVROS RESERVADOS</h2>
            <div className="livros-reservados">
              {(userInfo.reservas || []).length > 0 ? (
                userInfo.reservas.map((reserva) => (
                  <div key={reserva.livroId} className="book-card">
                    <h3>{reserva.nome_do_livro}</h3>
                    <p><strong>Data de Reserva:</strong> {new Date(reserva.data_reserva).toLocaleDateString()}</p>
                    <p><strong>Data de Devolução:</strong> {new Date(reserva.data_devolucao).toLocaleDateString()}</p>
                    <p><strong>Multa:</strong> R$ {(reserva.multa || 0).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p>Nenhum livro reservado.</p>
              )}
            </div>
          </div>
        </div>
  
        <div className="segundo_container">
          <div className="esquerda_segundo">
            <h2>LIVROS QUE VOCÊ ESTÁ ACOMPANHANDO</h2>
            <div className="livros_acompanhando">
              {(userInfo.watchlist || []).length > 0 ? (
                userInfo.watchlist.map((book) => (
                  <div key={book.book_id} className="book-card">
                    <h3>{book.nome_do_livro}</h3>
                    <button onClick={() => cancelNotification(book.book_id)} className="cancel-button">
                      Cancelar Notificação
                    </button>
                  </div>
                ))
              ) : (
                <p>Você não está acompanhando nenhum livro.</p>
              )}
            </div>
          </div>
  
          <div className="direita_segundo">
            <h2>NOTIFICAÇÕES</h2>
            <div className="notificacoes ">
              {(userInfo.notifications || []).length > 0 ? (
                userInfo.notifications.map((notif) => (
                  <div key={notif.id} className="book-card">
                    <h3>{notif.book_name}</h3>
                    <p><strong>Autor:</strong> {notif.autor}</p>
                    <p><strong>Status:</strong> {notif.book_status}</p>
                    <p>{notif.message}</p>
                    <small>{new Date(notif.timestamp).toLocaleString()}</small>
                    <button onClick={() => deleteNotification(notif.book_id)} className="delete-button">
                      Apagar Notificação
                    </button>
                  </div>
                ))
              ) : (
                <p>Sem notificações no momento.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  }
  
  export default PerfilUsuario;