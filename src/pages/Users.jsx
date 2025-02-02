// import React, { useState, useEffect } from "react";
// import "../../src/styles/Users.css";
// import { useNavigate } from "react-router-dom";

// const Users = () => {
//   const [usuarios, setUsuarios] = useState([]);
//   const navigate = useNavigate();

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch("http://localhost:3001/usuarios");
//       if (!response.ok) throw new Error("Erro ao buscar usuários");
//       const data = await response.json();
//       setUsuarios(data);
//     } catch (error) {
//       console.error("Erro ao buscar usuários:", error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // Função para deletar uma reserva
//   const handleCancelReservation = async (livroId, usuarioId) => {
//     try {
//       const response = await fetch(`http://localhost:3001/reservas/${livroId}/${usuarioId}`, { method: "DELETE" });
//       if (!response.ok) throw new Error("Erro ao cancelar reserva");
//       alert("Reserva cancelada!");
//       fetchUsers(); // Atualiza os dados
//     } catch (error) {
//       console.error("Erro ao cancelar reserva:", error);
//     }
//   };

//   // Função para reservar um livro
//   const handleReserveBook = async (livroId) => {
//     try {
//       const response = await fetch("http://localhost:3001/reservas", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           livro_id: livroId,
//           usuario_id: localStorage.getItem("userId"),
//           data_reserva: new Date().toISOString(),
//           data_devolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
//           status: "Reservado",
//           multa: 0,
//         }),
//       });
//       if (!response.ok) throw new Error("Erro ao reservar livro");
//       alert("Livro reservado com sucesso!");
//       fetchUsers();
//     } catch (error) {
//       console.error("Erro ao reservar livro:", error);
//     }
//   };

//   return (
//     <div className="users-container">
//       {usuarios.length === 0 ? (
//         <p>Carregando usuários...</p>
//       ) : (
//         usuarios.map((usuario) => (
//           <div key={usuario.id} className="user-card">
//             <h3>{usuario.userName}</h3>
//             <p>Email: {usuario.email}</p>
//             <p>Telefone: {usuario.telefone}</p>

//             <div className="books-section">
//               <h4>Livros Reservados:</h4>
//               <div className="books-cards">
//                 {usuario.livrosReservados.length > 0 ? (
//                   usuario.livrosReservados.map((book) => (
//                     <div
//                       key={book.id}
//                       className="book-card"
//                       onClick={() => navigate(`/book/${book.id}`)}
//                       style={{ cursor: "pointer" }}
//                     >
//                       {book.imagem ? (
//                         <img
//                           src={book.imagem.startsWith("http") ? book.imagem : `http://localhost:3001/${book.imagem}`}
//                           alt={book.nome_do_livro}
//                           className="book-card-image"
//                           onError={(e) => (e.target.src = "/placeholder.jpg")} // Mostra uma imagem padrão se der erro
//                         />
//                       ) : (
//                         <div className="no-image-placeholder">Sem imagem</div>
//                       )}

//                       <h3 className="book-card-title">{book.nome_do_livro}</h3>
//                       <p className="book-card-author">{book.autor}</p>

//                       <p className="book-card-status" style={{ color: book.status === "Disponível" ? "green" : "red" }}>
//                         Status: {book.status ? book.status : "Desconhecido"}
//                       </p>

//                       {book.atrasado && <p className="book-card-late">Atrasado por: {book.tempoAtraso} dias</p>}
//                       {book.multas && book.multas > 0 && <p className="book-card-fine">Multa: R$ {book.multas.toFixed(2)}</p>}


                  
//                       <button onClick={(e) => { e.stopPropagation(); handleCancelReservation(book.id, usuario.id); }}>Liberar Reserva</button>
//                     </div>
//                   ))
//                 ) : (
//                   <p>Sem livros reservados</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default Users;

import React, { useState, useEffect } from "react";
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
  const handleCancelReservation = async (livroId, usuarioId) => {
    try {
      const response = await fetch(`http://localhost:3001/reservas/${livroId}/${usuarioId}`, { method: "DELETE" });
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

  // Função para marcar devolução de um livro
  const handleReturnBook = async (reservaId) => {
    try {
      const response = await fetch(`http://localhost:3001/reservas/${reservaId}/devolver`, { method: "PUT" });
      if (!response.ok) throw new Error("Erro ao marcar devolução");
      alert("Livro devolvido com sucesso!");
      fetchUsers();
    } catch (error) {
      console.error("Erro ao marcar devolução:", error);
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
                    <div
                      key={book.id}
                      className="book-card"
                      onClick={() => navigate(`/book/${book.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {book.imagem ? (
                        <img
                          src={book.imagem.startsWith("http") ? book.imagem : `http://localhost:3001/${book.imagem}`}
                          alt={book.nome_do_livro}
                          className="book-card-image"
                          onError={(e) => (e.target.src = "/placeholder.jpg")} // Mostra uma imagem padrão se der erro
                        />
                      ) : (
                        <div className="no-image-placeholder">Sem imagem</div>
                      )}

                      <h3 className="book-card-title">{book.nome_do_livro}</h3>
                      <p className="book-card-author">{book.autor}</p>

                      <p className="book-card-status" style={{ color: book.status === "Disponível" ? "green" : "red" }}>
                        Status: {book.status ? book.status : "Desconhecido"}
                      </p>

                      {book.atrasado && <p className="book-card-late">Atrasado por: {book.tempoAtraso} dias</p>}
                      {book.multas && book.multas > 0 && <p className="book-card-fine">Multa: R$ {book.multas.toFixed(2)}</p>}

                      <button onClick={(e) => { e.stopPropagation(); handleCancelReservation(book.id, usuario.id); }}>Liberar Reserva</button>
                      {book.status === "Reservado" && (
                        <button onClick={(e) => { e.stopPropagation(); handleReturnBook(book.reservaId); }}>Marcar como Devolvido</button>
                      )}
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
