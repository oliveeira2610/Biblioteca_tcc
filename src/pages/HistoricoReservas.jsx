import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../src/styles/HistoricoReservas.css"; // Adicione um arquivo CSS para os estilos

const HistoricoReservas = () => {
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/reservas/historico").then((response) => {
      setReservas(response.data);
    });
  }, []);

  return (
    <div className="historico-reservas">
      <h1>Histórico de Reservas</h1>
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
    </div>
  );
};

export default HistoricoReservas;
