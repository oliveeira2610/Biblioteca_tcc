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
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [tempPhoto, setTempPhoto] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:3001/perfil-usuario/${userId}`);
        if (!response.ok) throw new Error("Erro ao buscar informações do usuário.");
        const data = await response.json();

        // Verifica se há foto salva no localStorage como fallback
        const savedPhoto = localStorage.getItem(`user_${userId}_photo`);
        if (!data.foto_url && savedPhoto) {
          data.foto_url = savedPhoto;
        }

        // Buscar notificações
        const notif = await fetch(`http://localhost:3001/notifications/${userId}`);
        const notificacoes = await notif.json();

        // Buscar livros acompanhados
        const watchRes = await fetch(`http://localhost:3001/livros-para-notificacao/${userId}`);
        const watchlist = await watchRes.json();

        setUserInfo({ ...data, notifications: notificacoes || [], watchlist: watchlist || [] });
        setTempPhoto(data.foto_url || '');
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
    localStorage.removeItem(`user_${userId}_photo`);
    navigate("/");
  };

  const handlePhotoClick = () => {
    setIsEditingPhoto(true);
    setPhotoUrl(tempPhoto);
  };

  const handleCancelPhoto = () => {
    setIsEditingPhoto(false);
    setPhotoUrl('');
  };

  const isValidImageUrl = (url) => {
    try {
      new URL(url);
      return url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;
    } catch {
      return false;
    }
  };

  const handleSavePhoto = async () => {
    if (!photoUrl.trim()) {
      alert('Por favor, insira uma URL válida');
      return;
    }
  
    if (!isValidImageUrl(photoUrl)) {
      alert('Por favor, insira uma URL de imagem válida (JPEG, JPG, GIF, PNG, WEBP ou SVG)');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3001/atualizar-foto/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ foto_url: photoUrl }),
      });

      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar foto');
      }
  
      // Atualiza o estado e o localStorage
      setUserInfo(prev => ({ ...prev, foto_url: photoUrl }));
      setTempPhoto(photoUrl);
      localStorage.setItem(`user_${userId}_photo`, photoUrl);
      setIsEditingPhoto(false);
      alert('Foto atualizada com sucesso!');
      
    } catch (err) {
      console.error('Erro ao atualizar foto:', err);
      
      // Fallback: atualiza localmente e armazena no localStorage
      setUserInfo(prev => ({ ...prev, foto_url: photoUrl }));
      setTempPhoto(photoUrl);
      localStorage.setItem(`user_${userId}_photo`, photoUrl);
      setIsEditingPhoto(false);
      
      alert('Foto salva localmente. Problema ao conectar com o servidor.');
    }
  };

  const cancelNotification = async (bookId) => {
    try {
      await fetch(`http://localhost:3001/register-notification/${userId}/${bookId}`, {
        method: "DELETE",
      });
      setUserInfo((prev) => ({
        ...prev,
        watchlist: prev.watchlist.filter((b) => b.book_id !== bookId),
      }));
    } catch (err) {
      console.error('Erro ao cancelar notificação:', err);
      alert('Erro ao cancelar notificação');
    }
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
        window.location.href = data.init_point;
      } else {
        alert("Erro ao gerar link de pagamento.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar pagamento.");
    }
  };

  const deleteNotification = async (bookId) => {
    try {
      await fetch(`http://localhost:3001/notifications/${userId}/${bookId}`, {
        method: "DELETE",
      });
      setUserInfo((prev) => ({
        ...prev,
        notifications: prev.notifications.filter((n) => n.book_id !== bookId),
      }));
    } catch (err) {
      console.error('Erro ao deletar notificação:', err);
      alert('Erro ao deletar notificação');
    }
  };

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

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">Erro: {error}</div>;
  if (!userInfo) return <div className="error">Usuário não encontrado.</div>;

  const totalReservados = userInfo.reservas?.length || 0;
  const totalAcompanhando = userInfo.watchlist?.length || 0;
  const multasPendentes = userInfo.reservas?.filter((r) => r.multa > 0) || [];

  return (
    <div className="perfil-usuario-container">
      <FloatingLetters />
      
      <div className="container_principal_user">
        <div className="primeiro_container">
          <div className="esquerda_primeira">
            <h1>Clique para alterar sua foto</h1>
            <div className="img_perfil" onClick={handlePhotoClick} style={{ cursor: 'pointer' }}>
              <img 
                src={tempPhoto || "/src/assets/img/perfil_icone.png"} 
                alt="Perfil" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = "/src/assets/img/perfil_icone.png";
                }}
              />
            </div>
            {isEditingPhoto && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Adicionar Foto de Perfil</h3>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Cole a URL da imagem (JPEG, JPG, PNG, GIF)"
                  />
                  <div className="modal-buttons">
                    <button onClick={handleSavePhoto}>Salvar</button>
                    <button onClick={handleCancelPhoto}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
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
              {multasPendentes.length > 0 ? (
                multasPendentes.map((reserva) => (
                  <div key={reserva.livroId} className="book-card">
                    <h4>{reserva.nome_do_livro}</h4>
                    <p><strong>Multa:</strong> R$ {(reserva.multa || 0).toFixed(2)}</p>
                    <button
                      onClick={() => payFine(reserva.livroId, reserva.nome_do_livro, reserva.multa)}
                      className="pay-button"
                    >
                      Pagar Multa
                    </button>
                  </div>
                ))
              ) : (
                <p>Nenhuma multa pendente.</p>
              )}
            </div>
  
            <h2>LIVROS RESERVADOS</h2>
            <div className="livros-reservados">
              {userInfo.reservas?.length > 0 ? (
                userInfo.reservas.map((reserva) => (
                  <div key={reserva.livroId} className="book-card">
                    <h3>{reserva.nome_do_livro}</h3>
                    <p><strong>Data de Reserva:</strong> {new Date(reserva.data_reserva).toLocaleDateString()}</p>
                    <p><strong>Data de Devolução:</strong> {new Date(reserva.data_devolucao).toLocaleDateString()}</p>
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
              {userInfo.watchlist?.length > 0 ? (
                userInfo.watchlist.map((book) => (
                  <div key={book.book_id} className="book-cards">
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
            <div className="notificacoes">
              {userInfo.notifications?.length > 0 ? (
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