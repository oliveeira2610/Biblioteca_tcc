import React, { useState, useEffect } from "react";
import "../../src/styles/global.css";
import "../../src/styles/Users.css";
import "../../src/styles/book-card.css";
import { useNavigate } from "react-router-dom";
import "../../src/styles/FloatingBackground.css";

const Users = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [historicoDevolucoes, setHistoricoDevolucoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchHistoricoDevolucoes();
  }, []);

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

  const fetchHistoricoDevolucoes = async () => {
    try {
      const response = await fetch("http://localhost:3001/historico-devolucoes");
      if (!response.ok) throw new Error("Erro ao buscar histórico de devoluções");
      const data = await response.json();
      setHistoricoDevolucoes(data);
    } catch (error) {
      console.error("Erro ao buscar histórico de devoluções:", error);
    }
  };

  const handleReturnBook = async (reservaId, livroId, usuarioId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/reservas/${reservaId}/devolver`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Erro ao marcar devolução");
      alert("Livro devolvido com sucesso!");
      fetchUsers();
      fetchHistoricoDevolucoes();
    } catch (error) {
      console.error("Erro ao marcar devolução:", error);
    }
  };

  const filteredUsers = usuarios.filter((usuario) =>
    usuario.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-container floating-background">
      <input
        type="text"
        placeholder="Pesquisar usuários pelo nome ou email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {filteredUsers.length === 0 ? (
        <p>Nenhum usuário encontrado.</p>
      ) : (
        filteredUsers.map((usuario) => (
          <div key={usuario.id} className="user-card">
            <div
              onClick={() => navigate(`/perfil-usuario-adm/${usuario.id}`)}
              style={{ cursor: "pointer" }}
            >
              <h3>{usuario.userName}</h3>
              <p>Email: {usuario.email}</p>
              <p>Telefone: {usuario.telefone}</p>
            </div>

            <div className="books-section">
              <h4>Livros Reservados:</h4>
              <div className="books-cards">
                {usuario.livrosReservados.length > 0 ? (
                  usuario.livrosReservados.map((book) => (
                    <div
                      key={book.id}
                      className="book-card"
                      onClick={() => navigate(`/book/${book.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {book.imagem ? (
                        <img
                          src={`http://localhost:3001/${book.imagem}`}
                          alt={book.nome_do_livro}
                          className="book-card-image"
                          onError={(e) => (e.target.src = "/placeholder.jpg")}
                        />
                      ) : (
                        <div className="no-image-placeholder">Sem imagem</div>
                      )}
                      <h3>{book.nome_do_livro}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReturnBook(book.reservaId, book.id, usuario.id);
                        }}
                      >
                        Marcar como Devolvido
                      </button>
                    </div>
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
