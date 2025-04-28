import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../src/styles/global.css";
import "../../src/styles/historicoReservas.css";

const HistoricoReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [devolucoes, setDevolucoes] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    axios.get("http://localhost:3001/reservas/historico").then((response) => {
      setReservas(response.data);
    });

    axios.get("http://localhost:3001/historico-devolucoes").then((response) => {
      console.log("Devoluções recebidas:", response.data);
      setDevolucoes(response.data);
    });
  }, []);

  const handleDevolucaoClick = (livroId, usuarioId) => {
    console.log("Livro ID:", livroId);
    console.log("Usuário ID:", usuarioId);
    if (usuarioId) {
      navigate(`/devolucao-detalhes/${livroId}/${usuarioId}`);
    } else {
      console.error("Usuário ID não encontrado.");
    }
  };

  return (
    <div className="historico-reservas floating-background">
      <FloatingLetters />
      <h1>Histórico de Reservas e Devoluções</h1>

      {/* Tabela de Reservas */}
      <h2>Reservas</h2>
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Livro</th>
            <th>Data de Reserva</th>
            <th>Data de Devolução</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reservas.length > 0 ? (
            reservas.map((reserva) => (
              <tr key={reserva.id}>
                <td>{reserva.usuario}</td>
                <td>{reserva.livro}</td>
                <td>{new Date(reserva.data_reserva).toLocaleDateString()}</td>
                <td>{reserva.data_devolucao ? new Date(reserva.data_devolucao).toLocaleDateString() : "N/A"}</td>
                <td>{reserva.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Nenhuma reserva encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Tabela de Devoluções */}
      <h2>Devoluções</h2>
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Livro</th>
            <th>Devolvido Em</th>
          </tr>
        </thead>
        <tbody>
          {devolucoes.length > 0 ? (
            devolucoes.map((devolucao) => (
              <tr
                key={devolucao.id}
                onClick={() => handleDevolucaoClick(devolucao.livro_id, devolucao.usuario_id)}
                style={{ cursor: "pointer" }}
              >
                <td>{devolucao.usuario}</td>
                <td>{devolucao.livro}</td>
                <td>{new Date(devolucao.data_devolvido).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">Nenhuma devolução encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoricoReservas;
