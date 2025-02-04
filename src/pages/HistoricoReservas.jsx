import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../src/styles/global.css";
import "../../src/styles/historicoReservas.css";

const HistoricoReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [devolucoes, setDevolucoes] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/reservas/historico").then((response) => {
      setReservas(response.data);
    });

    axios.get("http://localhost:3001/historico-devolucoes").then((response) => {
      setDevolucoes(response.data);
    });
  }, []);

  return (
    <div className="historico-reservas">
      <h1>Histórico de Reservas e Devoluções</h1>
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
          {reservas.map((reserva) => (
            <tr key={reserva.id}>
              <td>{reserva.usuario}</td>
              <td>{reserva.livro}</td>
              <td>{new Date(reserva.data_reserva).toLocaleDateString()}</td>
              <td>{reserva.data_devolucao ? new Date(reserva.data_devolucao).toLocaleDateString() : "N/A"}</td>
              <td>{reserva.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h2>Devoluções</h2>
      <table>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Livro</th>
            <th>Data de Devolução</th>
          </tr>
        </thead>
        <tbody>
          {devolucoes.map((devolucao) => (
            <tr key={devolucao.id}>
              <td>{devolucao.usuario}</td>
              <td>{devolucao.livro}</td>
              <td>{new Date(devolucao.data_devolucao).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoricoReservas;
