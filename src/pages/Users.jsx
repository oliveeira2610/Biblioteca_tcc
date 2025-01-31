import React, { useState, useEffect } from "react";
import ManageBookCard from "../../src/components/ManageBookCard";
import "../../src/styles/Users.css";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

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

  // Função para deletar uma reserva
  const handleCancelReservation = async (livroId) => {
    try {
      const response = await fetch(`http://localhost:3001/reservas/${livroId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao cancelar reserva");
      alert("Reserva cancelada!");
      fetchUsers(); // Atualiza os dados
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
    }
  };

  // Função para reservar um livro
  const handleReserveBook = async (livroId) => {
    try {
      const response = await fetch("http://localhost:3001/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          livro_id: livroId,
          usuario_id: localStorage.getItem("userId"),
          data_reserva: new Date().toISOString(),
          data_devolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Reservado",
          multa: 0,
        }),
      });
      if (!response.ok) throw new Error("Erro ao reservar livro");
      alert("Livro reservado com sucesso!");
      fetchUsers();
    } catch (error) {
      console.error("Erro ao reservar livro:", error);
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
                      onReserve={() => handleReserveBook(book.id)}
                      onFree={() => handleCancelReservation(book.id)}
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
