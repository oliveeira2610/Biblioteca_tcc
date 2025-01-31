  import React from "react";
  import { useNavigate } from "react-router-dom";
  import "../../src/styles/manage-books.css";


  const BookCard = ({ book }) => {
    const navigate = useNavigate();

    const handleClick = () => {
      navigate(`/BookDescription/${book.id}`); // Agora passando corretamente o ID
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
          Status: {book.status}
        </p>
      </div>
    );
    
  };

  export default BookCard;
