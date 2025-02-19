import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../src/styles/registerBook.css';

function RegisterBook() {
  const location = useLocation();
  const navigate = useNavigate();
  const { book } = location.state || {};
  const [formData, setFormData] = useState({
    nome_do_livro: book?.volumeInfo?.title || '',
    autor: book?.volumeInfo?.authors?.[0] || '',
    editora: book?.volumeInfo?.publisher || '',
    sinopse: book?.volumeInfo?.description || '',
    isbn: book?.volumeInfo?.industryIdentifiers?.[0]?.identifier || 'Desconhecido',
    ano_publicacao: book?.volumeInfo?.publishedDate?.slice(0, 4) || '',
    imagem: book?.volumeInfo?.imageLinks?.thumbnail || '',
    quantidade: 1,
    local: '',
    numero: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/livros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Livro cadastrado com sucesso!');
        navigate('/add-books');
      } else {
        const errorData = await response.json();
        alert(`Erro ao cadastrar livro: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error);
      alert('Erro ao cadastrar livro. Tente novamente.');
    }
  };

  return (
    <div className="register-book-container">
      <h1>Registrar Livro</h1>
      <form onSubmit={handleSubmit} className="register-book-form">
        <input type="text" name="nome_do_livro" placeholder="Nome do Livro" value={formData.nome_do_livro} onChange={handleInputChange} />
        <input type="text" name="autor" placeholder="Autor" value={formData.autor} onChange={handleInputChange} />
        <input type="text" name="editora" placeholder="Editora" value={formData.editora} onChange={handleInputChange} />
        <textarea name="sinopse" placeholder="Sinopse" value={formData.sinopse} onChange={handleInputChange}></textarea>
        <input type="text" name="isbn" placeholder="ISBN" value={formData.isbn} onChange={handleInputChange} />
        <input type="number" name="ano_publicacao" placeholder="Ano de Publicação" value={formData.ano_publicacao} onChange={handleInputChange} />
        <input type="text" name="imagem" placeholder="URL da Imagem" value={formData.imagem} onChange={handleInputChange} />
        <input type="number" name="quantidade" placeholder="Quantidade" value={formData.quantidade} onChange={handleInputChange} min="1" />
        <input type="text" name="local" placeholder="Local" value={formData.local} onChange={handleInputChange} />
        <input type="text" name="numero" placeholder="Número" value={formData.numero} onChange={handleInputChange} />
        <button type="submit">Cadastrar Livro</button>
      </form>
    </div>
  );
}

export default RegisterBook;