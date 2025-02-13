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
  const [historicoDevolucoes, setHistoricoDevolucoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://localhost:3001/perfil-usuario/${userId}`);
        if (!response.ok) throw new Error("Erro ao buscar informações do usuário.");
        const data = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchHistoricoDevolucoes = async () => {
      try {
        const response = await fetch(`http://localhost:3001/historico-devolucoes`);
        if (!response.ok) throw new Error("Erro ao buscar histórico de devoluções.");
        const data = await response.json();
        setHistoricoDevolucoes(data.filter(item => item.usuario === userInfo?.userName));
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserInfo();
    fetchHistoricoDevolucoes();
  }, [userId, userInfo?.userName]);

  const deleteUser = async () => {
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        const response = await fetch(`http://localhost:3001/usuarios/${userId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Erro ao excluir usuário.");
        alert("Usuário excluído com sucesso!");
        navigate("/users");
      } catch (err) {
        setError(err.message);
      }
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
      </div>

      <div className="livros-reservados">
        <h2>Livros Reservados</h2>
        {userInfo.reservas.length > 0 ? (
          <ul>
            {userInfo.reservas.map((reserva) => (
              <li key={reserva.livroId}>{reserva.nome_do_livro} - Devolução: {new Date(reserva.data_devolucao).toLocaleDateString()}</li>
            ))}
          </ul>
        ) : (
          <p>Não há livros reservados.</p>
        )}
      </div>

      <div className="historico-devolucoes">
        <h2>Histórico de Devoluções</h2>
        {historicoDevolucoes.length > 0 ? (
          <ul>
            {historicoDevolucoes.map((historico) => (
              <li key={historico.id}>{historico.livro} - Devolvido em {new Date(historico.data_devolucao).toLocaleDateString()}</li>
            ))}
          </ul>
        ) : (
          <p>Sem histórico de devoluções.</p>
        )}
      </div>

      <button onClick={deleteUser} className="delete-user-button">Excluir Usuário</button>
    </div>
  );
}

export default PerfilUsuarioAdm;
    