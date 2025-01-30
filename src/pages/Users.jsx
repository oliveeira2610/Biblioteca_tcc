import React, { useState, useEffect } from "react";
import ManageBookCard from "../../src/components/ManageBookCard";
import "../../src/styles/Users.css"; // Estilização

const Users = () => {
  const [usuarios, setUsuarios] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3001/usuarios");
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const handleBookClick = (bookId) => {
    alert(`Você clicou no livro de ID: ${bookId}`);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
                {usuario.livrosReservados && usuario.livrosReservados.length > 0 ? (
                  usuario.livrosReservados.map((book) => (
                    <ManageBookCard
                      key={book.id}
                      book={book}
                      onClick={handleBookClick}
                      onReserve={() => {}}
                      onFree={() => {}}
                      onDelete={() => {}}
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
