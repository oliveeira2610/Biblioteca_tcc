import React from "react";

const ManageBookCard = ({ book, onDelete }) => {
  return (
    <div className="book-card">
      <h4>{book.nome_do_livro}</h4>
      <button onClick={onDelete}>Deletar</button>
    </div>
  );
};

export default ManageBookCard;
