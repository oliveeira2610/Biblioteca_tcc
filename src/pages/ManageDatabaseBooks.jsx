import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/manage-books.css";

function ManageDatabaseBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função para buscar todos os livros
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/livros");
      if (!response.ok) {
        throw new Error("Erro ao buscar livros: " + response.statusText);
      }
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Função para navegar para a página de detalhes do livro
  const handleCardClick = (bookId) => {
    navigate(`/book/${bookId}`); // Navega para a página BookDetails com o ID do livro
  };

  // Função para atualizar o status do livro
  const updateBookStatus = async (bookId, status) => {
    try {
      const response = await fetch(`http://localhost:3001/livros/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar status");
      }

      const updatedBook = await response.json();
      console.log("Livro atualizado com sucesso:", updatedBook);

      // Recarregar os livros após a atualização
      fetchBooks(); // Garantir que os livros sejam recarregados para mostrar o status atualizado
    } catch (error) {
      console.error("Erro ao atualizar livro:", error);
    }
  };

  // Função para liberar o livro e remover a reserva (caso esteja reservado)
  const freeBook = async (bookId) => {
    // Atualizar o status do livro para "Disponível"
    await updateBookStatus(bookId, "Disponível");

    // Se o livro estava reservado, vamos remover a reserva
    try {
      const reservationResponse = await fetch(`http://localhost:3001/reservas/${bookId}`, {
        method: "DELETE", // Vamos deletar a reserva associada ao livro
      });

      if (!reservationResponse.ok) {
        throw new Error("Erro ao remover reserva");
      }

      console.log("Reserva removida com sucesso.");
    } catch (error) {
      console.error("Erro ao remover reserva:", error);
    }
  };

  // Função para reservar o livro
  const reserveBook = async (bookId) => {
    // Atualizar o status do livro para "Indisponível"
    await updateBookStatus(bookId, "Indisponível");

    // Adicionar reserva (isto pode ser feito no banco de dados de reservas)
    try {
      const reservationResponse = await fetch("http://localhost:3001/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          livro_id: bookId,
          usuario_id: 1, // O ID do usuário pode ser dinâmico ou ser passado como parâmetro
        }),
      });

      if (!reservationResponse.ok) {
        throw new Error("Erro ao fazer reserva");
      }

      console.log("Livro reservado com sucesso.");
    } catch (error) {
      console.error("Erro ao fazer reserva:", error);
    }
  };

  // Função para deletar o livro do banco de dados
  const deleteBook = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:3001/livros/${bookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar livro");
      }

      console.log("Livro deletado com sucesso.");
      // Recarregar os livros após a exclusão
      fetchBooks();
    } catch (error) {
      console.error("Erro ao deletar livro:", error);
    }
  };

  // Carregar os livros ao montar o componente
  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="manage-books-container">
      <h1>📚 Gerenciar Livros</h1>
      {loading && <p>Carregando...</p>}
      <div className="books-list">
        {books.map((book) => (
          <div
            key={book.id}
            className="book-card"
            onClick={() => handleCardClick(book.id)} // Aciona a navegação ao clicar no livro
          >
            {book.imagem ? (
              <img
                src={book.imagem}
                alt={book.nome_do_livro}
                className="book-card-image"
              />
            ) : (
              <div className="no-image-placeholder">Sem imagem</div>
            )}
            <h3 className="book-card-title">{book.nome_do_livro}</h3>
            <p className="book-card-author">{book.autor}</p>
            <p className="book-card-status" style={{ color: book.status === 'Disponível' ? 'green' : 'red' }}>
              Status: {book.status} {book.atrasado && "(Em atraso)"}
            </p>
            {book.atrasado && (
              <p className="book-card-late">Atrasado por: {book.tempoAtraso} dias</p>
            )}
            {book.multas && book.multas > 0 && (
              <p className="book-card-fine">Multa pendente: R$ {book.multas.toFixed(2)}</p>
            )}

            {/* Botões de ação */}
            {(book.status === "Indisponível" || book.status === "Reservado") && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Impede que o clique navegue para a página de detalhes
                  freeBook(book.id); // Libera o livro e remove a reserva
                }}
              >
                Liberar
              </button>
            )}

            {/* Botão de reserva só aparece para livros disponíveis */}
            {book.status === "Disponível" && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Impede que o clique navegue para a página de detalhes
                  reserveBook(book.id); // Reserva o livro
                }}
              >
                Reservar
              </button>
            )}

            {/* Botão de deletar aparece em qualquer caso */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Impede que o clique navegue para a página de detalhes
                deleteBook(book.id); // Deleta o livro
              }}
            >
              Deletar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageDatabaseBooks;
