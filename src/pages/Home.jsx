import React, { useState, useEffect } from "react";
import "../../src/styles/global.css";
import "../../src/styles/home.css";
import { useNavigate } from "react-router-dom";


function Home() {
  const [randomBooks, setRandomBooks] = useState([]);
  const navigate = useNavigate();


  

  useEffect(() => {
    fetchRandomBooks();
  }, []);
  

  const fetchRandomBooks = async () => {
    try {
      const response = await fetch("http://localhost:3001/livros");
      if (!response.ok) {
        throw new Error("Erro ao buscar livros: " + response.statusText);
      }
      const data = await response.json();

      // Embaralha e pega 3 livros aleatórios
      const shuffled = data.sort(() => 0.5 - Math.random());
      setRandomBooks(shuffled.slice(0, 12));
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    }
  };

  const handleCardClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };
  

  return (
    <div className="home-container">
      <div className="fodacitron">
        <div className="img-wrapper">
          <div className="img-home"></div>
          <div className="text-overlay">
            <p id="titulo-home">Bem-vindo ao Lessie</p>
            <p id="nome-site" className="Lessie-logo">
              LESSIE
            </p>
            <p id="putaqpariu" className="putaqpariu">
              “ Mergulhar no mundo da leitura, permite-nos viajar sem tirar os
              pés do chão “ - Iolanda Brazão
            </p>
          </div>
        </div>
      </div>

      {/* Seção de recomendações */}
      <div className="segundaparte-home">
        <div className="recomendacoes">
          <h2>RECOMENDAÇÕES DO DIA</h2>
        </div>
        <div className="livros-recomendados">
          {randomBooks.length > 0 ? (
            randomBooks.map((book) => (
              <div
                key={book.id}
                className="book-card-home"
                onClick={() => handleCardClick(book.id)}
                style={{ cursor: "pointer" }}
              >
                {book.imagem ? (
                  <img
                    src={book.imagem}
                    alt={book.nome_do_livro}
                    className="book-card-image-home"
                  />
                ) : (
                  <div className="no-image-placeholder">Sem imagem</div>
                )}
                <h3 className="book-card-title-home">{book.nome_do_livro}</h3>
                <p className="book-card-author-home">{book.autor}</p>
                
              </div>
            ))
          ) : (
            <p>Carregando recomendações...</p>
          )}
        </div>
      </div>
        <footer className="footer">
          <p>&copy; 2025 Biblioteca XYZ. Todos os direitos reservados.</p>
          <p>Contato: biblioteca@email.com | Telefone: (99) 9999-9999</p>   
        </footer>
    </div>
  );
}

export default Home;
