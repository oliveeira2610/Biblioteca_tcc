import React from 'react';
import "../../src/styles/global.css";
import '../../src/styles/home.css';

function Home() {
  return (
    <div className="home-container">
      {/* Cabeçalho */}
      <header className="home-header">
        <div className="header-overlay">
          <h1>📚 Bem-vindo à Biblioteca Virtual</h1>
          <p>Um universo de conhecimento e aprendizado ao seu alcance.</p>
          <div className="cta-buttons">
            <a href="#highlights" className="cta-button">Explore Destaques</a>
            <a href="#about" className="cta-button secondary">Saiba Mais</a>
          </div>
        </div>
      </header>

      {/* Adições na primeira parte */}
      <section className="home-intro">
        <div className="intro-content">
          <h2>Por que escolher nossa Biblioteca Virtual?</h2>
          <p>
            Somos mais que uma biblioteca! Oferecemos uma plataforma interativa onde você pode explorar, aprender e crescer. 
            Descubra o melhor em ficção, ciência, história e muito mais.
          </p>
          <ul className="features-list">
            <li>📖 Acesso a milhares de livros gratuitos</li>
            <li>🌐 Biblioteca disponível 24/7</li>
            <li>🧑‍🏫 Cursos exclusivos e guias de aprendizado</li>
            <li>📈 Estatísticas de leitura personalizadas</li>
          </ul>
        </div>
        <div className="intro-image">
          <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b" alt="Estudo" />
        </div>
      </section>

      {/* Seções */}
      <main className="home-content">
        {/* Destaques */}
        <section id="highlights" className="highlights-section">
          <h2>🌟 Destaques</h2>
          <div className="highlight-cards">
            <div className="card">
              <h3>📖 Ficção</h3>
              <p>Descubra mundos fantásticos e histórias emocionantes.</p>
            </div>
            <div className="card">
              <h3>🔬 Ciência</h3>
              <p>Expanda seu conhecimento com nossas coleções científicas.</p>
            </div>
            <div className="card">
              <h3>📜 História</h3>
              <p>Explore o passado e entenda o presente.</p>
            </div>
            <div className="card">
              <h3>🧠 Desenvolvimento Pessoal</h3>
              <p>Aprenda habilidades e transforme sua vida.</p>
            </div>
          </div>
        </section>

        {/* Sobre */}
        <section id="about" className="about-section">
          <h2>📚 Sobre Nós</h2>
          <p>
            Somos apaixonados por compartilhar conhecimento e acreditamos no poder da leitura para transformar vidas. 
            Combinamos tecnologia e educação para criar uma experiência única.
          </p>
          <div className="about-image-container">
            <img src="https://source.unsplash.com/800x400/?books,library" alt="Biblioteca" />
          </div>
        </section>

        {/* Galeria */}
        <section id="gallery" className="gallery-section">
          <h2>🎨 Galeria de Imagens</h2>
          <div className="gallery-grid">
            <img src="https://source.unsplash.com/300x200/?books" alt="Livros" />
            <img src="https://source.unsplash.com/300x200/?library" alt="Biblioteca" />
            <img src="https://source.unsplash.com/300x200/?reading" alt="Leitura" />
            <img src="https://source.unsplash.com/300x200/?education" alt="Educação" />
          </div>
        </section>

        {/* Contato */}
        <section id="contact" className="contact-section">
          <h2>📞 Contato</h2>
          <p>Tem dúvidas, sugestões ou quer compartilhar algo? Entre em contato conosco!</p>
          <a href="mailto:contato@gmail.com" className="cta-button">Envie um E-mail</a>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="home-footer">
        <p>© 2025 Biblioteca Virtual. Todos os direitos reservados.</p>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">🌐 Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">🐦 Twitter</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">📸 Instagram</a>
        </div>
      </footer>
    </div>
  );
}

export default Home;
