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
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchUserInfo = async () => {
        try {
          const response = await fetch(`http://localhost:3001/perfil-usuario/${userId}`);
          if (!response.ok) throw new Error("Erro ao buscar informações do usuário.");
          const data = await response.json();
          setUserInfo(data);
          setIsBlocked(data.bloqueado);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
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
  
    if (loading) return <p>Carregando...</p>;
    if (error) return <p>Erro: {error}</p>;
    if (!userInfo) return <p>Usuário não encontrado.</p>;
  
    return (
      <div className="perfil-usuario-container floating-background">
        <h1>Perfil do Usuário</h1>
        <div className="dados-pessoais">
          <h2>Dados Pessoais</h2>
          <p><strong>Nome:</strong> {userInfo.userName}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Telefone:</strong> {userInfo.telefone}</p>
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
  