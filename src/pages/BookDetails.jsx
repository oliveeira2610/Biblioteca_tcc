import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../../src/styles/BookDetails.css";

function BookDetails() {
  const { id } = useParams(); // Obtém o ID do livro da URL
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newQuantity, setNewQuantity] = useState(""); // Estado para a nova quantidade

  // Função para buscar os detalhes do livro e as informações de reserva
  const fetchBookDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/livro-detalhes/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar os detalhes do livro");
      }

      const data = await response.json();
      setBookDetails(data);
      setNewQuantity(data.quantidade_disponivel); // Define a quantidade inicial
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar a quantidade de livros no estoque
  const updateQuantity = async () => {
    try {
      const response = await fetch(`http://localhost:3001/livros/${id}/quantidade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantidade: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar quantidade de livros");
      }

      const data = await response.json();
      console.log(data.message);
      fetchBookDetails(); // Recarrega os detalhes do livro após a atualização
    } catch (error) {
      console.error("Erro ao atualizar quantidade de livros:", error);
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
        <p><strong>Quantidade no estoque:</strong> {bookDetails.quantidade_disponivel}</p>
        <p><strong>Quantidade disponível:</strong> {bookDetails.quantidade_disponivel_nao_alugada}</p>

        <div className="quantity-edit">
          <label>
            Nova quantidade:
            <input 
              type="number" 
              value={newQuantity} 
              onChange={(e) => setNewQuantity(e.target.value)} 
            />
          </label>
          <button onClick={updateQuantity}>Atualizar Quantidade</button>
        </div>

        <div className="reservation-details">
          {bookDetails.reservas && bookDetails.reservas.length > 0 ? (
            bookDetails.reservas.map((reserva) => (
              <div key={reserva.reserva_id} className="reserva-info">
                <p><strong>Status da reserva:</strong> {reserva.reserva_status}</p>
                <p><strong>Nome do usuário:</strong> {reserva.nome_usuario}</p>
                <p><strong>Email:</strong> {reserva.usuario_email}</p>
                <p><strong>CPF:</strong> {reserva.usuario_cpf}</p>
                <p><strong>Telefone:</strong> {reserva.usuario_telefone}</p>
                <p><strong>Data de reserva:</strong> {reserva.data_reserva}</p>
                <p><strong>Data de devolução:</strong> {reserva.data_devolucao}</p>
                <p><strong>Multa:</strong> R$ {reserva.multa ? reserva.multa.toFixed(2) : "0.00"}</p>
                <p><strong>Tempo de atraso:</strong> {reserva.tempo_atraso ? `${reserva.tempo_atraso} dias` : "Não atrasado"}</p>
              </div>
            ))
          ) : (
            <p>Este livro não tem reservas no momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetails;
