import React from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/manage-books.css";

const ManageBookCard = ({ book, freeBook, reserveBook, deleteBook }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  return (
    <div className="book-card" onClick={handleClick}>
      {book.imagem ? (
        <img src={book.imagem} alt={book.nome_do_livro} className="book-card-image" />
      ) : (
        <div className="no-image-placeholder">Sem imagem</div>
      )}
      <h3 className="book-card-title">{book.nome_do_livro}</h3>
      <p className="book-card-author">{book.autor}</p>
      <p className="book-card-status" style={{ color: book.status === "Disponível" ? "green" : "red" }}>
        Status: {book.status} {book.atrasado && "(Em atraso)"}
      </p>
      {book.atrasado && <p className="book-card-late">Atrasado por: {book.tempoAtraso} dias</p>}
      {book.multas && book.multas > 0 && <p className="book-card-fine">Multa pendente: R$ {book.multas.toFixed(2)}</p>}

      {/* Botões de ação */}
      {(book.status === "Indisponível" || book.status === "Reservado") && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            freeBook(book.id);
          }}
        >
          Liberar
        </button>
      )}

      {book.status === "Disponível" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            reserveBook(book.id);
          }}
        >
          Reservar
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteBook(book.id);
        }}
      >
        Deletar
      </button>
    </div>
  );
};

export default ManageBookCard;
