import React, { useState, useEffect } from "react";
import ManageBookCard from "../../src/components/ManageBookCard";
import "../../src/styles/Users.css"; // Estilização

const Users = () => {
  const [usuarios, setUsuarios] = useState([]);

  // Função para buscar usuários e reservas do banco de dados
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3001/usuarios");
      if (!response.ok) throw new Error("Erro ao buscar usuários");
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Função para cancelar uma reserva no banco de dados
  const handleCancelReservation = async (livroId) => {
    try {
      const response = await fetch(`http://localhost:3001/reservas/${livroId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erro ao cancelar reserva");
      alert("Reserva cancelada com sucesso!");
      fetchUsers(); // Atualiza a lista após exclusão
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
    }
  };

  return (
    <div className="users-container">
      {usuarios.length === 0 ? (
        <p>Carregando usuários...</p>
      ) : (
        usuarios.map((usuario) => (
          <div key={usuario.id} className="user-card">
            <h3>{usuario.userName}</h3>
            <p>Email: {usuario.email}</p>
            <p>Telefone: {usuario.telefone}</p>

            <div className="books-section">
              <h4>Livros Reservados:</h4>
              <div className="books-cards">
                {usuario.livrosReservados.length > 0 ? (
                  usuario.livrosReservados.map((book) => (
                    <ManageBookCard
                      key={book.id}
                      book={book}
                      onDelete={() => handleCancelReservation(book.id)}
                    />
                  ))
                ) : (
                  <p>Sem livros reservados</p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Users;
