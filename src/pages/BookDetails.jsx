import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../src/styles/BookDetails.css";

function BookDetails() {
  const { id } = useParams(); // Obtém o ID do livro da URL
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar os detalhes do livro e as informações de reserva
  const fetchBookDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/livro-detalhes/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar os detalhes do livro");
      }

      const data = await response.json();
      setBookDetails(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (bookDetails) => {
    try {
      const response = await fetch("http://localhost:3001/livros", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookDetails),
      });
  
      if (!response.ok) {
        throw new Error("Erro ao adicionar livro");
      }
  
      const addedBook = await response.json();
      console.log("Livro adicionado com sucesso:", addedBook);
      fetchBooks(); // Recarregar a lista de livros após a inserção
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
    }
  };
  

  useEffect(() => {
    fetchBookDetails();
  }, [id]); // Recarrega quando o ID do livro mudar

  if (loading) {
    return <p>Carregando detalhes...</p>;
  }

  if (!bookDetails) {
    return <p>Livro não encontrado</p>;
  }

  return (
    <div className="book-details-container">
      <div className="book-image">
        <img 
          src={bookDetails.imagem ? bookDetails.imagem : "default-image.jpg"} 
          alt={bookDetails.nome_do_livro} 
        />
      </div>
      
      <div className="book-info">
        <h1>{bookDetails.nome_do_livro}</h1>
        <p><strong>Autor:</strong> {bookDetails.autor}</p>
        <p><strong>Editora:</strong> {bookDetails.editora}</p>
        <p><strong>Sinopse:</strong> {bookDetails.sinopse}</p>

        <div className="reservation-details">
          {bookDetails.reserva_status ? (
            <>
              <p><strong>Status da reserva:</strong> {bookDetails.reserva_status}</p>
              <p><strong>Nome do usuário:</strong> {bookDetails.nome_usuario}</p>
              <p><strong>Email:</strong> {bookDetails.usuario_email}</p>
              <p><strong>CPF:</strong> {bookDetails.usuario_cpf}</p>
              <p><strong>Telefone:</strong> {bookDetails.usuario_telefone}</p>
              <p><strong>Data de reserva:</strong> {bookDetails.data_reserva}</p>
              <p><strong>Data de devolução:</strong> {bookDetails.data_devolucao}</p>
              <p><strong>Multa:</strong> R$ {bookDetails.multa ? bookDetails.multa.toFixed(2) : "0.00"}</p>
              <p><strong>Tempo de atraso:</strong> {bookDetails.tempo_atraso ? `${bookDetails.tempo_atraso} dias` : "Não atrasado"}</p>
            </>
          ) : (
            <p>Este livro não tem reservas no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
