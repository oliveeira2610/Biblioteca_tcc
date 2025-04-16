import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import "../../src/styles/global.css";
import "../../src/styles/DevolucaoDetails.css";

function DevolucaoDetails() {
  const { livroId, usuarioId } = useParams();
  const [devolucaoDetails, setDevolucaoDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [observacoes, setObservacoes] = useState([]);
  const [novaObservacao, setNovaObservacao] = useState("");

  const fetchDevolucaoDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/historico-devolucoes/${livroId}/${usuarioId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar os detalhes da devolução");
      }

      const data = await response.json();
      setDevolucaoDetails(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchObservacoes = async () => {
    try {
      const response = await fetch(`http://localhost:3001/observacoes-devolucoes/${livroId}/${usuarioId}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar observações");
      }

      const data = await response.json();
      setObservacoes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleObservacaoChange = (e) => {
    setNovaObservacao(e.target.value);
  };

  const handleAddObservacao = async () => {
    try {
      const response = await fetch(`http://localhost:3001/observacoes-devolucoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ livro_id: livroId, usuario_id: usuarioId, observacao: novaObservacao }),
      });

      if (!response.ok) {
        throw new Error("Erro ao adicionar observação");
      }

      const data = await response.json();
      console.log(data.message);
      setNovaObservacao("");
      fetchObservacoes(); // Atualiza a lista de observações
    } catch (error) {
      console.error("Erro ao adicionar observação:", error);
    }
  };

  const handleDeleteObservacao = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/observacoes-devolucoes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar observação");
      }

      const data = await response.json();
      console.log(data.message);
      fetchObservacoes(); // Atualiza a lista de observações
    } catch (error) {
      console.error("Erro ao deletar observação:", error);
    }
  };

  useEffect(() => {
    fetchDevolucaoDetails();
    fetchObservacoes();
  }, [livroId, usuarioId]);

  if (loading) {
    return <p>Carregando detalhes...</p>;
  }

  if (!devolucaoDetails) {
    return <p>Devolução não encontrada</p>;
  }

  return (
    <div className="devolucao-details-container">
      <div className="book-image">
        <img
          src={devolucaoDetails.imagem ? devolucaoDetails.imagem : "default-image.jpg"}
          alt={devolucaoDetails.nome_do_livro}
        />
      </div>

      <div className="book-info">
        <h1>{devolucaoDetails.nome_do_livro}</h1>
        <p><strong>Autor:</strong> {devolucaoDetails.autor}</p>
        <p><strong>Editora:</strong> {devolucaoDetails.editora}</p>
        <p><strong>Sinopse:</strong> {devolucaoDetails.sinopse}</p>
        <p><strong>Status:</strong> {devolucaoDetails.status}</p>
        <p><strong>Quantidade no estoque:</strong> {devolucaoDetails.quantidade_disponivel}</p>
      </div>

      <div className="reservation-details1">
        <div className="usuario-reservas">
          <h3>{devolucaoDetails.userName}</h3>
          <p><strong>Email:</strong> {devolucaoDetails.email}</p>
          <p><strong>CPF:</strong> {devolucaoDetails.cpf}</p>
          <p><strong>Telefone:</strong> {devolucaoDetails.telefone}</p>
          <div className="reserva-info">
            <p><strong>Status da reserva:</strong> {devolucaoDetails.status}</p>
            <p><strong>Data de reserva:</strong> {devolucaoDetails.data_reserva ? format(new Date(devolucaoDetails.data_reserva), "dd/MM/yyyy") : "N/A"}</p>
            <p><strong>Data de devolução prevista:</strong> {devolucaoDetails.data_devolucao ? format(new Date(devolucaoDetails.data_devolucao), "dd/MM/yyyy") : "N/A"}</p>
            <p><strong>Data real da devolução:</strong> {devolucaoDetails.data_devolvido ? format(new Date(devolucaoDetails.data_devolvido), "dd/MM/yyyy") : "N/A"}</p>
            <p><strong>Multa:</strong> R$ {devolucaoDetails.multa ? devolucaoDetails.multa.toFixed(2) : "0.00"}</p>
            <p><strong>Unidade reservada:</strong> {devolucaoDetails.numero_unidade ?? "N/A"}</p>


          </div>
        </div>
      </div>

      <div className="observacoes-section">
        <h2>Observações</h2>
        <textarea
          value={novaObservacao}
          onChange={handleObservacaoChange}
          placeholder="Escreva suas observações aqui..."
          rows="4"
          cols="50"
        />
        <button onClick={handleAddObservacao}>Adicionar Observação</button>
        <div className="observacoes-list">
          {observacoes.map((obs) => (
            <div key={obs.id} className="observacao-item">
              <p>{obs.observacao}</p>
              <p><small>{format(new Date(obs.data), "dd/MM/yyyy HH:mm")}</small></p>
              <button onClick={() => handleDeleteObservacao(obs.id)}>Apagar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DevolucaoDetails;
