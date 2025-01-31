import React from "react";
import { useNavigate } from "react-router-dom";

const ManageBookCard = ({ book, onDelete, onReserve, onFree }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/book/${book.id}`);
  };

  return (
    <div className="book-card" onClick={handleCardClick} style={{ cursor: "pointer" }}>
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

      {/* 🔹 Exibe o status do livro */}
      <p className="book-card-status" style={{ color: book.status === "Disponível" ? "green" : "red" }}>
        Status: {book.status ? book.status : "Desconhecido"}
      </p>

      {book.atrasado && <p className="book-card-late">Atrasado por: {book.tempoAtraso} dias</p>}
      {book.multas && book.multas > 0 && <p className="book-card-fine">Multa: R$ {book.multas.toFixed(2)}</p>}

      {book.status === "Indisponível" && (
        <button onClick={(e) => { e.stopPropagation(); onFree(book.id); }}>Liberar</button>
      )}

      {book.status === "Disponível" && (
        <button onClick={(e) => { e.stopPropagation(); onReserve(book.id); }}>Reservar</button>
      )}

      <button onClick={(e) => { e.stopPropagation(); onDelete(book.id); }}>Deletar</button>
    </div>
  );
};

export default ManageBookCard;
