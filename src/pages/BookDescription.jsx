import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../src/styles/bookDescription.css";
import "../../src/styles/button.css";

function BookDescription() {
  const { id } = useParams();
  const [bookDetails, setBookDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationExists, setNotificationExists] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!id) return;

    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/livro-detalhes/${id}`);
        if (!response.ok) throw new Error("Livro não encontrado");
        const data = await response.json();
        setBookDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  useEffect(() => {
    if (!userId) {
      setError("Usuário não autenticado");
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/usuario-logado?id=${userId}`);
        if (!response.ok) throw new Error("Usuário não encontrado");
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      }
    };

    const checkNotification = async () => {
      try {
        const response = await fetch(`http://localhost:3001/check-notification/${userId}/${id}`);
        if (!response.ok) throw new Error("Erro ao verificar notificação");
        const data = await response.json();
        setNotificationExists(data.exists);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserDetails().then(() => checkNotification());
  }, [id, userId]);

  const registerNotification = async () => {
    if (!user?.id || !bookDetails?.id) {
      console.error("Erro: userId ou bookId está indefinido.");
      alert("Erro ao registrar notificação.");
      return;
    }
  
    try {
      const requestBody = JSON.stringify({ userId: Number(user.id), bookId: Number(bookDetails.id) });
  
      console.log("Enviando requisição para registrar notificação...");
      console.log("Payload:", requestBody);
  
      const response = await fetch("http://localhost:3001/register-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });
  
      if (!response.ok) {
        const data = await response.json();
        console.error("Erro ao registrar notificação:", data.message);
        alert(data.message || "Erro ao registrar notificação.");
        return;
      }
  
      alert("Você será notificado sobre este livro.");
    } catch (error) {
      console.error("Erro ao registrar notificação:", error);
    }
  };
  
  

  const cancelNotification = async () => {
    if (!user?.id) {
      console.error("Erro: userId está indefinido.");
      alert("Erro: Usuário não autenticado.");
      return;
    }
  
    try {
      console.log(`Cancelando notificação para userId: ${user.id}, bookId: ${id}`);
  
      const response = await fetch(`http://localhost:3001/register-notification/${user.id}/${id}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao cancelar notificação");
      }
  
      setNotificationExists(false);
      alert("Notificação deste livro foi cancelada.");
    } catch (error) {
      console.error("Erro ao cancelar notificação:", error);
    }
  };
  

  if (loading) return <p>Carregando detalhes...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!bookDetails) return <p>Livro não encontrado.</p>;

  return (
    <div className="book-details-container">
      <button onClick={() => navigate("/search")} className="back-button">
        ← Voltar
      </button>
      <div className="book-details-content">
        <div className="book-details-image">
          {bookDetails.imagem ? (
            <img src={bookDetails.imagem} alt={bookDetails.nome_do_livro} />
          ) : (
            <div className="no-image-placeholder">Sem imagem</div>
          )}
        </div>
        <div className="book-details-info">
          <h1>{bookDetails.nome_do_livro}</h1>
          <p><strong>Autor:</strong> {bookDetails.autor || "Não informado"}</p>
          <p><strong>Gênero:</strong> {bookDetails.genero || "Não informado"}</p>
          <p><strong>Data de Lançamento:</strong> {bookDetails.ano_publicacao || "Não informado"}</p>
          <p><strong>Editora:</strong> {bookDetails.editora || "Não informado"}</p>
          <p><strong>Sinopse:</strong> {bookDetails.sinopse || "Sinopse não disponível"}</p>
          <p><strong>Reservado até:</strong> {bookDetails.data_devolucao || "Não informado"}</p>

          {notificationExists ? (
            <>
              <p className="error-message">Você já registrou uma notificação para este livro.</p>
              <button onClick={cancelNotification} className="cancel-notification-button">
                Cancelar Notificação
              </button>
            </>
          ) : (
            <button onClick={registerNotification} className="notify-button">
              Registrar Notificação
            </button>
          )}

          {bookDetails.quantidade_disponivel_nao_alugada > 0 ? (
            <button onClick={() => navigate(`/bookStatus/${id}`)} className="reserve-button">
              Reservar
            </button>
          ) : (
            <button className="reserve-button" disabled>
              Indisponível no momento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDescription;
