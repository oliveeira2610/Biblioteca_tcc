import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../src/styles/registerBook.css';

function RegisterBook() {
  const location = useLocation();
  const navigate = useNavigate();
  const { book } = location.state || {};

  const [formData, setFormData] = useState({
    id: book?.id || '',
    nome_do_livro: book?.nome_do_livro || book?.volumeInfo?.title || '',
    autor: book?.autor || book?.volumeInfo?.authors?.[0] || '',
    genero: book?.genero || '',
    editora: book?.editora || book?.volumeInfo?.publisher || '',
    sinopse: book?.sinopse || book?.volumeInfo?.description || '',
    isbn: book?.isbn || book?.volumeInfo?.industryIdentifiers?.[0]?.identifier || '',
    ano_publicacao: book?.ano_publicacao || book?.volumeInfo?.publishedDate?.slice(0, 4) || '',
    imagem: book?.imagem || book?.volumeInfo?.imageLinks?.thumbnail || '',
    quantidade_disponivel: book?.quantidade_disponivel || 1,
    numero: book?.numero || '',
    status: book?.status || 'Disponível',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newBookData = { 
      ...formData, 
      quantidade_disponivel: Number(formData.quantidade_disponivel), 
      ano_publicacao: Number(formData.ano_publicacao) 
    };
    delete newBookData.id;
    
    try {
      console.log("📤 Enviando para o backend:", JSON.stringify(newBookData, null, 2));

      const response = await fetch('http://localhost:3001/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookData),
      });

      const data = await response.json();
      console.log("📥 Resposta do backend:", data);

      if (!response.ok) {
        alert(`Erro: ${data.error}`);
        return;
      }

      // Criar unidades para o livro cadastrado
      for (let i = 0; i < newBookData.quantidade_disponivel; i++) {
        await fetch('http://localhost:3001/unidades-livro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ livro_id: data.id, status: 'Disponível' }),
        });
      }

      alert('Livro e unidades cadastrados com sucesso!');
      navigate('/addbooks');
    } catch (error) {
      console.error('🚨 Erro ao cadastrar livro:', error);
      alert('Erro ao cadastrar livro. Tente novamente.');
    }
  };

  return (
    <div className="register-book-container">
      <h1>{formData.id ? 'Editar Livro' : 'Registrar Livro'}</h1>
      <form onSubmit={handleSubmit} className="register-book-form">
        <input type="text" name="nome_do_livro" placeholder="Nome do Livro" value={formData.nome_do_livro} onChange={handleInputChange} required />
        <input type="text" name="autor" placeholder="Autor" value={formData.autor} onChange={handleInputChange} required />
        <input type="text" name="genero" placeholder="Gênero" value={formData.genero} onChange={handleInputChange} required />
        <input type="text" name="editora" placeholder="Editora" value={formData.editora} onChange={handleInputChange} required />
        <textarea name="sinopse" placeholder="Sinopse" value={formData.sinopse} onChange={handleInputChange}></textarea>
        <input type="text" name="isbn" placeholder="ISBN" value={formData.isbn} onChange={handleInputChange} required />
        <input type="number" name="ano_publicacao" placeholder="Ano de Publicação" value={formData.ano_publicacao} onChange={handleInputChange} required />
        <input type="text" name="imagem" placeholder="URL da Imagem" value={formData.imagem} onChange={handleInputChange} />
        <input type="number" name="quantidade_disponivel" placeholder="Quantidade de Unidades" value={formData.quantidade_disponivel} onChange={handleInputChange} min="1" required />
        <input type="text" name="numero" placeholder="Número" value={formData.numero} onChange={handleInputChange} required />
        <select name="status" value={formData.status} onChange={handleInputChange} required>
          <option value="Disponível">Disponível</option>
          <option value="Indisponível">Indisponível</option>
        </select>
        <button type="submit">{formData.id ? 'Atualizar Livro' : 'Cadastrar Livro'}</button>
      </form>
    </div>
  );
}

export default RegisterBook;
