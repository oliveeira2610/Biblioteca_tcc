import React from 'react';
import '../../src/styles/global.css';
function Books() {
  return (
    <div className="books-page">
      <h1>📚 Livros Disponíveis</h1>
      <ul className="book-list">
        <li>📖 Dom Casmurro - Machado de Assis</li>
        <li>📖 A Revolução dos Bichos - George Orwell</li>
        <li>📖 O Senhor dos Anéis - J.R.R. Tolkien</li>
        <li>📖 Cem Anos de Solidão - Gabriel García Márquez</li>
      </ul>
    </div>
  );
}

export default Books;
