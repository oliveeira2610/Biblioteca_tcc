import React from "react";
import "../../src/styles/global.css";
import "../../src/styles/home.css";

function Home() {
  return (
    <div className="home-container">
      <div className="fodacitron">
        <div className="img-wrapper">
          <div className="img-home"></div>
          <div className="text-overlay">
            <p>Bem vindo ao Lessie</p>
            <p className="Lessie-logo">LESSIE</p>
            <p className="putaqpariu">“ Mergulhar no mundo da leitura, permite-nos viajar sem tirar os pés do chão “
            - Iolanda Brazão</p>
          </div>
        </div>
      </div>
      <div className="segundaparte-home">
        <div className="recomendacoes">
          <h2>RECOMENDAÇÕES DO DIA</h2>
        </div>
        <div className="livros-recomendados">
          
        </div>
      </div>
    </div>
  );
}

export default Home;
