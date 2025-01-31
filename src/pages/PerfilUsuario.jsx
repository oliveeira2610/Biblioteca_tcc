import React, { useEffect, useState } from 'react';
import '../../src/styles/PerfilUsuario.css';

function PerfilUsuario() {
  const userId = localStorage.getItem("userId"); // Obtendo o ID do usuário logado do localStorage
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log("Fetching user info for userId:", userId); // Log de depuração
        const response = await fetch(`http://localhost:3001/perfil-usuario/${userId}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar informações do usuário.");
        }
        const data = await response.json();
        console.log("User info received:", data); // Log de depuração
        setUserInfo(data);
      } catch (err) {
        console.error("Error fetching user info:", err); // Log de depuração
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

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
      <div className="livros-reservados">
        <h2>Livros Reservados</h2>
        {userInfo.reservas.length > 0 ? (
          <ul>
            {userInfo.reservas.map((reserva, index) => (
              <li key={index}>
                <p><strong>Livro:</strong> {reserva.nome_do_livro}</p>
                <p><strong>Data de Reserva:</strong> {new Date(reserva.data_reserva).toLocaleDateString()}</p>
                <p><strong>Data de Devolução:</strong> {new Date(reserva.data_devolucao).toLocaleDateString()}</p>
                <p><strong>Multa:</strong> R$ {reserva.multa.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Não há livros reservados no momento.</p>
        )}
      </div>
    </div>
  );
}

export default PerfilUsuario;
