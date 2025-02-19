import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import "../../src/styles/global.css";
import "../../src/styles/DevolucaoDetails.css";

function DevolucaoDetails() {
  const { livroId, usuarioId } = useParams();
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBookDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/livro-detalhes/${livroId}/${usuarioId}`);
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

  useEffect(() => {
    fetchBookDetails();
  }, [livroId, usuarioId]);

  if (loading) {
    return <p>Carregando detalhes...</p>;
  }

  if (!bookDetails) {
    return <p>Livro não encontrado</p>;
  }

  return (
    <div className="devolucao-details-container">
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
        <p><strong>Status:</strong> {bookDetails.status}</p>
        <p><strong>Quantidade no estoque:</strong> {bookDetails.quantidade_disponivel}</p>
      </div>

      <div className="reservation-details">
        <div className="usuario-reservas">
          <h3>{bookDetails.usuario.nome_usuario}</h3>
          <p><strong>Email:</strong> {bookDetails.usuario.usuario_email}</p>
          <p><strong>CPF:</strong> {bookDetails.usuario.usuario_cpf}</p>
          <p><strong>Telefone:</strong> {bookDetails.usuario.usuario_telefone}</p>
          <div className="reserva-info">
            <p><strong>Status da reserva:</strong> {bookDetails.reserva.reserva_status}</p>
            <p><strong>Data de reserva:</strong> {bookDetails.reserva.data_reserva ? format(new Date(bookDetails.reserva.data_reserva), "dd/MM/yyyy") : "N/A"}</p>
            <p><strong>Data de devolução:</strong> {bookDetails.reserva.data_devolucao ? format(new Date(bookDetails.reserva.data_devolucao), "dd/MM/yyyy") : "N/A"}</p>
            <p><strong>Devolvido em:</strong> {bookDetails.reserva.devolvido_em ? format(new Date(bookDetails.reserva.devolvido_em), "dd/MM/yyyy") : "N/A"}</p>
            <p><strong>Multa:</strong> R$ {bookDetails.reserva.multa ? bookDetails.reserva.multa.toFixed(2) : "0.00"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DevolucaoDetails;
