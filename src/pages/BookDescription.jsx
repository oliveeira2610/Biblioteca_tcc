import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../src/styles/bookDescription.css";
import "../../src/styles/button.css";
import "../../src/styles/colors.css";
import { div } from "framer-motion/client";


function BookDescription() {
  const { id } = useParams();
  const [bookDetails, setBookDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationExists, setNotificationExists] = useState(false);
  const [isInQueue, setIsInQueue] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

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

  const checkFila = async () => {
    if (!bookDetails?.id) return;

    try {
      const res = await fetch(`http://localhost:3001/fila-reserva/${bookDetails.id}`);
      const fila = await res.json();
      setIsInQueue(fila.some(f => f.usuario_id === Number(userId)));
    } catch (err) {
      console.error("Erro ao verificar fila:", err);
    }
  };

  const handleEntrarNaFila = async () => {
    if (!userId || !bookDetails?.id) {
      return alert("Erro ao identificar usuário ou livro.");
    }

    try {
      const response = await fetch("http://localhost:3001/fila-reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ livro_id: bookDetails.id, usuario_id: userId }),
      });

      const data = await response.json();
      alert(data.message);
      await checkFila();
    } catch (err) {
      console.error("Erro ao entrar na fila:", err);
      alert("Erro ao entrar na fila. Tente novamente.");
    }
  };

  const handleCancelarFila = async () => {
    if (!userId || !bookDetails?.id) {
      return alert("Erro ao identificar usuário ou livro.");
    }

    try {
      const response = await fetch(
        `http://localhost:3001/fila-reserva/${bookDetails.id}/${userId}`,
        { method: "DELETE" }
      );

      const data = await response.json();
      alert(data.message || "Fila cancelada com sucesso!");
      await checkFila();
    } catch (err) {
      console.error("Erro ao cancelar fila:", err);
      alert("Erro ao cancelar a fila. Tente novamente.");
    }
  };

  const registerNotification = async () => {
    if (!user?.id || !bookDetails?.id) {
      console.error("Erro: userId ou bookId está indefinido.");
      alert("Erro ao registrar notificação.");
      return;
    }

    try {
      const requestBody = JSON.stringify({
        userId: Number(user.id),
        bookId: Number(bookDetails.id),
      });

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
      fetchData();
    } catch (error) {
      console.error("Erro ao registrar notificação:", error);
    }
  };

  const cancelNotification = async () => {
    if (!user?.id || !bookDetails?.id) {
      console.error("Erro: userId ou bookId está indefinido.");
      alert("Erro ao cancelar notificação.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/register-notification/${user.id}/${bookDetails.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error("Erro ao cancelar notificação:", data.message);
        alert(data.message || "Erro ao cancelar notificação.");
        return;
      }

      alert("Notificação cancelada com sucesso.");
      fetchData();
    } catch (error) {
      console.error("Erro ao cancelar notificação:", error);
    }
  };

  const fetchData = async () => {
    await fetchBookDetails();
    await fetchUserDetails();
    await checkNotification();
    await checkFila();
  };

  useEffect(() => {
    if (!id || !userId) {
      setError("Usuário ou livro não identificado.");
      return;
    }
    fetchData();
  }, [id, userId]);

  if (loading) return <p>Carregando detalhes...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!bookDetails) return <p>Livro não encontrado.</p>;

  return (
    
    <div className="book-description-wrapper">
      <button onClick={() => navigate("/search")} className="back-button" />
  
      
      <div className="body-book-description">
        <div className="book-details-image">
          {bookDetails.imagem ? (
            <img src={bookDetails.imagem} alt={bookDetails.nome_do_livro} />
          ) : (
            <div className="no-image-placeholder">Sem imagem</div>
          )}
        </div>

        <div className="book-details-info">
          <h1>{bookDetails.nome_do_livro}</h1>
          <p className="detalhe"><strong className="detalhes-strong">Autor:</strong> {bookDetails.autor || "Não informado"}</p>
          <p className="detalhe"><strong className="detalhes-strong">Gênero:</strong> {bookDetails.genero || "Não informado"}</p>
          <p className="detalhe"><strong className="detalhes-strong">Data de Lançamento:</strong> {bookDetails.ano_publicacao || "Não informado"}</p>
          <p className="detalhe"><strong className="detalhes-strong">Editora:</strong> {bookDetails.editora || "Não informado"}</p>
          <p><strong className="detalhes-strong">Sinopse:</strong></p> <p className="sinopse-detalhes"> {bookDetails.sinopse || "Sinopse não disponível"}</p>

          {notificationExists ? (
            <>
              <p className="error-message">
                Você já registrou uma notificação para este livro.
              </p>
              <button onClick={cancelNotification} className="cancel-button">
                Cancelar Notificação
              </button>
            </>
          ) : (
            <button onClick={registerNotification} className="notify-button">
              Registrar Notificação
            </button>
          )}

          {user?.bloqueado ? (
            <button className="reserve-button" disabled>
              Usuário bloqueado para reservas
            </button>
          ) : bookDetails.quantidade_disponivel_nao_alugada > 0 ? (
            <button
              onClick={() => navigate(`/bookStatus/${id}`)}
              className="reserve-button"
            >
              Reservar
            </button>
          ) : (
            isInQueue ? (
              <button onClick={handleCancelarFila} className="cancel-button">
                Cancelar Fila de Espera
              </button>
            ) : (
              <button onClick={handleEntrarNaFila} className="notify-button">
                Entrar na fila de reserva  
              </button>
            )
          )}


          {bookDetails.local === "DinossauroGame" && (
            <button onClick={() => navigate("/dinossauro")} className="esteregg-button">
              Acessar Easter Egg 🎮
            </button>
          )}
          {bookDetails.local === "flapbird" && (
            <button onClick={() => navigate("/flapBird")} className="esteregg-button">
              Acessar Easter Egg 🎮
            </button>
          )}
          {bookDetails.local === "Doom" && (
            <a href="https://doompdf.pages.dev/doom.pdf" target="_blank" rel="noopener noreferrer" className="esteregg-button">
              Acessar Easter Egg 🎮
            </a>
          )}
        </div>
      </div>

    </div>
  );
}

export default BookDescription;
