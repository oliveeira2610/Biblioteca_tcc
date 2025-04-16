import React, { useState, useEffect } from "react";
import "../../src/styles/global.css";
import "../../src/styles/Users.css";
import "../../src/styles/book-card.css";
import { useNavigate } from "react-router-dom";
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

const Users = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [historicoDevolucoes, setHistoricoDevolucoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleCancelReservation = async (livroId, usuarioId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/reservas/${livroId}/${usuarioId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Erro ao cancelar reserva");
      alert("Reserva cancelada!");
      fetchUsers();
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchHistoricoDevolucoes();
  }, []);

  const handleReturnBook = async (reservaId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/reservas/${reservaId}/devolver-e-registrar`,
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
  

  const filteredUsers = usuarios.filter((usuario) => {
    return (
      usuario.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="users-container floating-background">
      <FloatingLetters />
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
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/perfil-usuario-adm/${usuario.id}`);
              }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book/${book.id}`);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {book.imagem ? (
                        <img
                          src={
                            book.imagem.startsWith("http")
                              ? book.imagem
                              : `http://localhost:3001/${book.imagem}`
                          }
                          alt={book.nome_do_livro}
                          className="book-card-image"
                          onError={(e) => (e.target.src = "/placeholder.jpg")}
                        />
                      ) : (
                        <div className="no-image-placeholder">Sem imagem</div>
                      )}

                      <h3 className="book-card-title">{book.nome_do_livro}</h3>
                      <p className="book-card-author">{book.autor}</p>

                      <p
                        className="book-card-status"
                        style={{
                          color: book.status === "Disponível" ? "green" : "red",
                        }}
                      >
                        Status: {book.status ? book.status : "Desconhecido"}
                      </p>

                      {book.tempo_atraso && book.tempo_atraso > 0 && (
                        <p className="book-card-late">
                          Atrasado por: {book.tempo_atraso} dias
                        </p>
                      )}
                      {book.multas && book.multas > 0 && (
                        <p className="book-card-fine">
                          Multa: R$ {book.multas.toFixed(2)}
                        </p>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReturnBook(book.reservaId);
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

            <div className="books-section">
              <h4>Livros Devolvidos:</h4>
              <div className="books-cards">
                {historicoDevolucoes.filter(
                  (devolucao) => devolucao.usuario === usuario.userName
                ).length > 0 ? (
                  historicoDevolucoes
                    .filter(
                      (devolucao) => devolucao.usuario === usuario.userName
                    )
                    .map((devolucao) => (
                      <div
                        key={devolucao.id}
                        className="book-card"
                        onClick={() => navigate(`/book/${devolucao.livro_id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        {devolucao.imagem ? (
                          <img
                            src={
                              devolucao.imagem.startsWith("http")
                                ? devolucao.imagem
                                : `http://localhost:3001/${devolucao.imagem}`
                            }
                            alt={devolucao.livro}
                            className="book-card-image"
                            onError={(e) => (e.target.src = "/placeholder.jpg")}
                          />
                        ) : (
                          <div className="no-image-placeholder">Sem imagem</div>
                        )}

                        <h3 className="book-card-title">
                          {devolucao.livro || "Título Desconhecido"}
                        </h3>
                        <p className="book-card-author">
                          {devolucao.autor || "Autor Desconhecido"}
                        </p>

                        <p
                          className="book-card-status"
                          style={{ color: "green" }}
                        >
                          Status: Devolvido
                        </p>

                        {devolucao.data_devolucao && (
                          <p className="book-card-return-date">
                            Devolvido em: {" "}
                            {new Date(
                              devolucao.data_devolucao
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))
                ) : (
                  <p>Sem livros devolvidos</p>
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
