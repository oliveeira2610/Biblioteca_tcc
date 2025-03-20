import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/manageDatabaseBooks.css";
import "../../src/styles/book-card.css";
import '../../src/styles/FloatingBackground.css';

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

function ManageDatabaseBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

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
        body: JSON.stringify({ status, userId }),
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
      fetchBooks(); // Recarregar os livros após a remoção da reserva
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
      const response = await fetch(`http://localhost:3001/livros/${bookId}`);
      const book = await response.json();
      const unidadeReservada = book.unidades.find(unidade => unidade.status === "Disponível");

      if (!unidadeReservada) {
        throw new Error("Não há unidades disponíveis para reserva");
      }

      const reservationResponse = await fetch("http://localhost:3001/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          livro_id: bookId,
          unidade_id: unidadeReservada.id,
          usuario_id: userId,
          data_reserva: new Date().toISOString(),
          data_devolucao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Reservado",
          multa: 0,
        }),
      });

      if (!reservationResponse.ok) {
        throw new Error("Erro ao fazer reserva");
      }

      console.log("Livro reservado com sucesso.");
      fetchBooks(); // Recarregar os livros após a reserva
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

  // Filtrar livros com base no termo de pesquisa
  const filteredBooks = books.filter((book) =>
    book.nome_do_livro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-books-container floating-background">
      <FloatingLetters />
      <h1 className="gerencialivr">Gerenciar Livros</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input-manage"
      />
      {loading && <p>Carregando...</p>}
      <div className="books-list-manage">
        {filteredBooks.map((book) => (
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
            <p><strong>Quantidade estoque:</strong> {book.quantidade_disponivel}</p>
            <p><strong>Quantidade disponível:</strong> {book.quantidade_disponivel_nao_alugada}</p>
            <p className="book-card-status" style={{ color: book.quantidade_disponivel_nao_alugada > 0 ? 'green' : 'red' }}>
              Status: {book.quantidade_disponivel_nao_alugada > 0 ? 'Disponível' : 'Indisponível'} {book.atrasado && "(Em atraso)"}
            </p>
            {book.atrasado && (
              <p className="book-card-late">Atrasado por: {book.tempoAtraso} dias</p>
            )}
            {book.multas && book.multas > 0 && (
              <p className="book-card-fine">Multa pendente: R$ {book.multas.toFixed(2)}</p>
            )}

            {/* Botões de ação */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // Impede que o clique navegue para a página de detalhes
                freeBook(book.id); // Libera o livro e remove a reserva
              }}
            >
              Liberar Reservas
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Impede que o clique navegue para a página de detalhes
                deleteBook(book.id); // Deleta o livro
              }}
            >
              Deletar Livro
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageDatabaseBooks;
