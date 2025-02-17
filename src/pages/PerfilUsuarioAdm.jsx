import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/perfilUsuario.css";
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

function PerfilUsuarioAdm() {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [adminComments, setAdminComments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:3001/perfil-usuario/${userId}`);
        if (!response.ok) throw new Error("Erro ao buscar informações do usuário.");
        const data = await response.json();
        setUserInfo(data);
        setIsBlocked(data.bloqueado);
        fetchAdminComments();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAdminComments = async () => {
      try {
        const response = await fetch(`http://localhost:3001/usuarios/${userId}/comentarios`);
        if (!response.ok) throw new Error("Erro ao buscar comentários.");
        const data = await response.json();
        setAdminComments(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserInfo();
  }, [userId]);

  const toggleBlockUser = async () => {
    try {
      const response = await fetch(`http://localhost:3001/usuarios/${userId}/bloquear`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bloqueado: !isBlocked }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar status de bloqueio.");
      setIsBlocked(!isBlocked);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const response = await fetch(`http://localhost:3001/usuarios/${userId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao excluir usuário.");
      alert("Usuário excluído com sucesso!");
      navigate("/usuarios");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCommentChange = (e) => {
    setAdminComment(e.target.value);
  };

  const saveAdminComment = async () => {
    try {
      const response = await fetch(`http://localhost:3001/usuarios/${userId}/comentario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: adminComment }),
      });
      if (!response.ok) throw new Error("Erro ao salvar comentário.");
      const newComment = await response.json();
      setAdminComments([newComment, ...adminComments]);
      setAdminComment("");
      alert("Comentário salvo com sucesso!");

      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      fetchAdminComments();
    }
  };

  const deleteAdminComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:3001/usuarios/comentario/${commentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao deletar comentário.");
      setAdminComments(adminComments.filter(comment => comment.id !== commentId));
      alert("Comentário deletado com sucesso!");
    } catch (err) {
      setError(err.message);
    } finally {
      fetchAdminComments();
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!userInfo) return <p>Usuário não encontrado.</p>;

  return (
    <div className="perfil-usuario-container floating-background">
      <FloatingLetters />
      <h1>Perfil do Usuário</h1>
      <div className="dados-pessoais">
        <h2>Dados Pessoais</h2>
        <p><strong>Nome:</strong> {userInfo.userName}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
        <p><strong>Telefone:</strong> {userInfo.telefone}</p>
        <p><strong>Multa Pendente:</strong> {userInfo.multa}</p>
        <p><strong>Status:</strong> {isBlocked ? "Bloqueado" : "Desbloqueado"}</p>
      </div>

      <div className="historico-reservas">
        <h2>Histórico de Reservas</h2>
        {userInfo.reservas && userInfo.reservas.length > 0 ? (
          <ul>
            {userInfo.reservas.map((reserva) => (
              <li key={reserva.livroId}>
                <p><strong>Livro:</strong> {reserva.nome_do_livro}</p>
                <p><strong>Data de Reserva:</strong> {new Date(reserva.data_reserva).toLocaleDateString()}</p>
                <p><strong>Data de Devolução:</strong> {new Date(reserva.data_devolucao).toLocaleDateString()}</p>
                <p><strong>Multa:</strong> {reserva.multa}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma reserva encontrada.</p>
        )}
      </div>

      <div className="admin-comment-section">
        <h2>Comentários do Administrador</h2>
        <ul className="admin-comments-list">
          {adminComments.map(comment => (
            <li key={comment.id} className="admin-comment-item">
              <p>{comment.comment}</p>
              <button onClick={() => deleteAdminComment(comment.id)} className="delete-comment-button">Apagar</button>
            </li>
          ))}
        </ul>
        <textarea
          value={adminComment}
          onChange={handleCommentChange}
          placeholder="Adicione um comentário sobre este usuário"
        />
        <button onClick={saveAdminComment}>Salvar Comentário</button>
      </div>

      <button onClick={toggleBlockUser} className="block-user-button" style={{ backgroundColor: isBlocked ? 'red' : 'green' }}>
        {isBlocked ? "Desbloquear Reservas" : "Bloquear Reservas"}
      </button>

      <button onClick={deleteUser} className="delete-user-button" style={{ backgroundColor: 'red' }}>
        Excluir Usuário
      </button>
    </div>
  );
}

export default PerfilUsuarioAdm;
