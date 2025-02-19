import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userRes, historicoRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:3001/perfil-usuario/${userId}`),
          fetch(`http://localhost:3001/usuarios/${userId}/historico-reservas`),
          fetch(`http://localhost:3001/usuarios/${userId}/comentarios`)
        ]);

        if (!userRes.ok || !historicoRes.ok || !commentsRes.ok) throw new Error("Erro ao buscar dados");

        const userData = await userRes.json();
        const historicoData = await historicoRes.json();
        const commentsData = await commentsRes.json();

        setUserInfo(userData);
        setHistoricoReservas(historicoData);
        setAdminComments(commentsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

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
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAdminComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:3001/usuarios/comentario/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao deletar comentário.");

      setAdminComments(adminComments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <p>Carregando...</p>;
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
      </div>

      {/* Seção de Histórico de Reservas (Livros Devolvidos) */}
      <div className="historico-reservas">
        <h2>Livros Devolvidos</h2>
        {historicoReservas.length > 0 ? (
          <div className="livros-container">
            {historicoReservas.map((book) => (
              <div
                key={book.livro_id}
                className="book-card"
                onClick={() => navigate(`/devolucao-detalhes/${book.livro_id}/${userId}`)}
                style={{ cursor: "pointer" }}
              >
                {book.imagem ? (
                  <img
                    src={book.imagem}
                    alt={book.nome_do_livro}
                    className="book-card-image"
                  />
                ) : (
                  <div className="no-image-placeholder">Sem imagem</div>
                )}
                <h3 className="book-card-title">{book.nome_do_livro}</h3>
                <p className="book-card-author">{book.autor}</p>
                <p><strong>Data de Reserva:</strong> {new Date(book.data_reserva).toLocaleDateString()}</p>
                <p><strong>Data de Devolução:</strong> {new Date(book.data_devolucao).toLocaleDateString()}</p>
                <p><strong>Data Real da Devolução:</strong> {book.data_devolvido ? new Date(book.data_devolvido).toLocaleDateString() : "N/A"}</p>
                <p><strong>Multa:</strong> R$ {book.multa?.toFixed(2) || "0.00"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma devolução encontrada.</p>
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
    </div>
  );
}

export default PerfilUsuarioAdm;
