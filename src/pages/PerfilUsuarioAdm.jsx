import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../src/styles/global.css";


import "../../src/styles/perfilUsuarioAdm.css";

import "../../src/styles/FloatingBackground.css";
import "../../src/styles/perfilUsuarioAdm.css";

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
  const [historicoReservas, setHistoricoReservas] = useState([]);
  const [adminComments, setAdminComments] = useState([]);
  const [adminComment, setAdminComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false); // Adicionado estado para bloqueio do usuário
  const [error, setError] = useState(null); // Adicionado estado para erros
  const navigate = useNavigate();
  const [mostrarComentarios, setMostrarComentarios] = useState(false); //skibidi

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userRes, historicoRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:3001/perfil-usuario/${userId}`),
          fetch(`http://localhost:3001/usuarios/${userId}/historico-reservas`),
          fetch(`http://localhost:3001/usuarios/${userId}/comentarios`),
        ]);

        if (!userRes.ok || !historicoRes.ok || !commentsRes.ok)
          throw new Error("Erro ao buscar dados");

        const userData = await userRes.json();
        const historicoData = await historicoRes.json();
        const commentsData = await commentsRes.json();

        setUserInfo(userData);
        setHistoricoReservas(historicoData);
        setAdminComments(commentsData);
        setIsBlocked(userData.bloqueado);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const toggleBlockUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/usuarios/${userId}/bloquear`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bloqueado: !isBlocked }),
        }
      );
      if (!response.ok)
        throw new Error("Erro ao atualizar status de bloqueio.");
      setIsBlocked(!isBlocked);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async () => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      const response = await fetch(`http://localhost:3001/usuarios/${userId}`, {
        method: "DELETE",
      });
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
      const response = await fetch(
        `http://localhost:3001/usuarios/${userId}/comentario`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment: adminComment }),
        }
      );

      if (!response.ok) throw new Error("Erro ao salvar comentário.");

      const newComment = await response.json();
      setAdminComments([newComment, ...adminComments]);
      setAdminComment("");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAdminComment = async (commentId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/usuarios/comentario/${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Erro ao deletar comentário.");

      setAdminComments(
        adminComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!userInfo) return <p>Usuário não encontrado.</p>;

 

  return (

    <><div className="perfil-usuario-container ">
      <FloatingLetters />

      <div className="container_principal_user">
        <div className="primeiro_container">
          <div className="esquerda_primeira">

           

            {!mostrarComentarios ? (
              <div className="dados-pessoais">
                <div className="img_perfil">
                  <img src="/src/assets/img/perfil_icone.png" alt="Perfil" />
                </div>
                <h2>Dados Pessoais</h2>
                <p>
                  <strong>Nome:</strong> {userInfo.userName}
                </p>
                <p>
                  <strong>Email:</strong> {userInfo.email}
                </p>
                <p>
                  <strong>Telefone:</strong> {userInfo.telefone}
                </p>
                <p>
                  <strong>Multa Pendente:</strong> {userInfo.multa}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {isBlocked ? "Bloqueado" : "Desbloqueado"}
                </p>




              </div>
            ) : (
              <div className="admin-comment-section">
                <ul className="admin-comments-list">
                  {adminComments.map((comment) => (
                    <li key={comment.id} className="admin-comment-item">
                      <p>{comment.comment}</p>
                      <button
                        onClick={() => deleteAdminComment(comment.id)}
                        className="delete-comment-button"
                      >
                        Apagar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="direita_primeira">

            <h4 className="Livros-devolvidos">LIVROS DEVOLVIDOS</h4>
            <div className="historico-reservas1">
              {historicoReservas.length > 0 ? (
                <div className="livros-container">
                  {historicoReservas.map((book) => (
                    <div
                      key={book.livro_id}
                      className="book-card"
                      onClick={() => navigate(
                        `/devolucao-detalhes/${book.livro_id}/${userId}`
                      )}
                      style={{ cursor: "pointer" }}
                    >
                      {book.imagem ? (
                        <img
                          src={book.imagem}
                          alt={book.nome_do_livro}
                          className="book-card-image" />
                      ) : (
                        <div className="no-image-placeholder">Sem imagem</div>
                      )}
                      <h3 className="book-card-title">{book.nome_do_livro}</h3>
                      <p className="book-card-author">{book.autor}</p>
                      <p>
                        <strong>Data de Reserva:</strong>{" "}
                        {new Date(book.data_reserva).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Data de Devolução:</strong>{" "}
                        {new Date(book.data_devolucao).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Data Real da Devolução:</strong>{" "}
                        {book.data_devolvido
                          ? new Date(book.data_devolvido).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Multa:</strong> R${" "}
                        {book.multa?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Nenhuma devolução encontrada.</p>
              )}
            </div>
          </div>
        </div>

      
      </div>
    </div><div className="perfil-adm-container floating-background">

        <h1 className="perfil-adm-titulo">Perfil do Usuário</h1>

        <div className="perfil-adm-dados">
          <h2>Dados Pessoais</h2>
          <p><strong>Nome:</strong> {userInfo.userName}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Telefone:</strong> {userInfo.telefone}</p>
          <p><strong>Multa Pendente:</strong> {userInfo.multa}</p>
          <p><strong>Status:</strong> {isBlocked ? "Bloqueado" : "Desbloqueado"}</p>
          <button onClick={toggleBlockUser} className="perfil-adm-btn-bloquear" style={{ backgroundColor: isBlocked ? 'red' : 'green' }}>
            {isBlocked ? "Desbloquear Reservas" : "Bloquear Reservas"}
          </button>

          <button onClick={deleteUser} className="perfil-adm-btn-excluir">
            Excluir Usuário
          </button>
        </div>

        <div className="perfil-adm-comentarios">
          <h2>Comentários do Administrador</h2>
          <ul className="perfil-adm-lista-comentarios">
            {adminComments.map(comment => (
              <li key={comment.id} className="perfil-adm-comentario">
                <p>{comment.comment}</p>
                <button onClick={() => deleteAdminComment(comment.id)} className="perfil-adm-btn-apagar">Apagar</button>
              </li>
            ))}
          </ul>
          <textarea
            value={adminComment}
            onChange={handleCommentChange}
            className="perfil-adm-textarea"
            placeholder="Adicione um comentário sobre este usuário" />
          <button onClick={saveAdminComment} className="perfil-adm-btn-salvar">Salvar Comentário</button>
        </div>


      </div></>


  );
}

export default PerfilUsuarioAdm;
