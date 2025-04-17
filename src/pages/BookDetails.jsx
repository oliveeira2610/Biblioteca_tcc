import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import "../../src/styles/global.css";
import "../../src/styles/BookDetails.css";
import { div } from "framer-motion/client";

function BookDetails() {
  const { id } = useParams();
  const [bookDetails, setBookDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedBook, setEditedBook] = useState({});

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/livro-detalhes/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao buscar os detalhes do livro");
      }
      const data = await response.json();
      console.log("📥 Dados recebidos:", data);
      setBookDetails(data);
    } catch (error) {
      console.error("🚨 Erro ao buscar os detalhes do livro:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBook((prev) => ({
      ...prev,
      [name]: value || prev[name], // Se o valor for vazio, mantém o antigo
    }));
  };

  const updateBookDetails = async () => {
    // Verifica se todos os campos obrigatórios estão presentes
    if (!editedBook.nome_do_livro || !editedBook.autor || !editedBook.editora || !editedBook.isbn || !editedBook.ano_publicacao || !editedBook.quantidade_disponivel) {
      alert("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    console.log("Enviando dados para atualização:", editedBook);

    try {
      const response = await fetch(`http://localhost:3001/livros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedBook),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar detalhes do livro");
      }

      // Atualiza o estado local para refletir imediatamente a mudança
      setBookDetails(editedBook);
      setEditMode(false);
    } catch (error) {
      console.error("Erro ao atualizar detalhes do livro:", error);
    }
  };

  const handleEditClick = () => {
    setEditedBook(bookDetails);
    setEditMode(true);
  };

  const calcularDiasAtraso = (dataDevolucao) => {
    const hoje = new Date();
    const dataDev = new Date(dataDevolucao);
    const diasAtraso = Math.ceil((hoje - dataDev) / (1000 * 60 * 60 * 24));
    return diasAtraso > 0 ? diasAtraso : 0;
  };

  if (loading) return <p>Carregando detalhes...</p>;
  if (!bookDetails) return <p>Livro não encontrado</p>;

  return (
    <div className="body-book-details">

    <div className="book-details-container">
      <div className="book-image">
        <img src={bookDetails.imagem || "default-image.jpg"} alt={bookDetails.nome_do_livro} />
      </div>
      <div className="book-info">
        <h1>{bookDetails.nome_do_livro}</h1>
        <p><strong>Autor:</strong> {bookDetails.autor}</p>
        <p><strong>Gênero:</strong> {bookDetails.genero}</p>
        <p><strong>Editora:</strong> {bookDetails.editora}</p>
        <p><strong>Sinopse:</strong> {bookDetails.sinopse}</p>
        <p><strong>ISBN:</strong> {bookDetails.isbn}</p>
        <p><strong>Ano de Publicação:</strong> {bookDetails.ano_publicacao}</p>
        <p><strong>Quantidade disponível:</strong> {bookDetails.quantidade_disponivel}</p>
        <p><strong>Status:</strong> {bookDetails.status}</p>
        <p><strong>📌 Número:</strong> {bookDetails.numero || "Não informado"}</p>
        <p><strong>Unidades:</strong> {bookDetails.unidades?.join(", ") || "Nenhuma unidade disponível"}</p>
        <button onClick={handleEditClick}>{editMode ? "Cancelar" : "Editar Informações"}</button>
      </div>
      {editMode && (
        <div className="book-edit">
          <h2>Editar Informações</h2>
          <input type="text" name="nome_do_livro" placeholder="Nome do Livro" value={editedBook.nome_do_livro || ""} onChange={handleInputChange} />
          <input type="text" name="autor" placeholder="Autor" value={editedBook.autor || ""} onChange={handleInputChange} />
          <input type="text" name="genero" placeholder="Gênero" value={editedBook.genero || ""} onChange={handleInputChange} />
          <input type="text" name="editora" placeholder="Editora" value={editedBook.editora || ""} onChange={handleInputChange} />
          <textarea name="sinopse" placeholder="Sinopse" value={editedBook.sinopse || ""} onChange={handleInputChange}></textarea>
          <input type="text" name="isbn" placeholder="ISBN" value={editedBook.isbn || ""} onChange={handleInputChange} />
          <input type="number" name="ano_publicacao" placeholder="Ano de Publicação" value={editedBook.ano_publicacao || ""} onChange={handleInputChange} />
          <input type="number" name="quantidade_disponivel" placeholder="Quantidade Disponível" value={editedBook.quantidade_disponivel || ""} onChange={handleInputChange} />
          <input type="text" name="imagem" placeholder="URL da imagem" value={editedBook.imagem || ""} onChange={handleInputChange} />
          <input type="text" name="status" placeholder="Status" value={editedBook.status || ""} onChange={handleInputChange} />
          <input type="text" name="numero" placeholder="Número" value={editedBook.numero || ""} onChange={handleInputChange} />
          <button onClick={updateBookDetails}>Salvar Alterações</button>
        </div>
      )}

      <div className="reservation-details">
        {bookDetails.reservasPorUsuario && bookDetails.reservasPorUsuario.length > 0 ? (
          bookDetails.reservasPorUsuario.map((usuario, index) => (
            <div key={index} className="usuario-reservas">
              <h3>{usuario.nome_usuario}</h3>
              <p><strong>Email:</strong> {usuario.usuario_email}</p>
              <p><strong>CPF:</strong> {usuario.usuario_cpf}</p>
              <p><strong>Telefone:</strong> {usuario.usuario_telefone}</p>
              {usuario.reservas.map((reserva, reservaIndex) => (
                <div key={reservaIndex} className="reserva-info">
                  <p><strong>Status da reserva:</strong> {reserva.reserva_status}</p>
                  <p><strong>Data de reserva:</strong> {reserva.data_reserva ? format(new Date(reserva.data_reserva), "dd/MM/yyyy") : "N/A"}</p>
                  <p><strong>Data de devolução:</strong> {reserva.data_devolucao ? format(new Date(reserva.data_devolucao), "dd/MM/yyyy") : "N/A"}</p>
                  <p><strong>Multa:</strong> R$ {reserva.multa ? reserva.multa.toFixed(2) : "0.00"}</p>
                  <p><strong>Tempo de atraso:</strong> {calcularDiasAtraso(reserva.data_devolucao) > 0 ? `${calcularDiasAtraso(reserva.data_devolucao)} dias` : "Não atrasado"}</p>
                  <p><strong>Unidade:</strong> {reserva.unidade || "Não especificada"}</p>
                </div>
              ))}
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