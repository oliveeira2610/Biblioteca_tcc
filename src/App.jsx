import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Books from './pages/Books';
import Users from './pages/Users';
import SearchBooks from './pages/SearchBooks';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div>
        {/* Navbar estilizada */}
        <nav className="navbar">
          <div className="navbar-container">
            <h1 className="logo">📚 Biblioteca Virtual</h1>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/books">Livros</Link></li>
              <li><Link to="/users">Usuários</Link></li>
              <li><Link to="/search">Pesquisar Livros</Link></li> {/* Novo link */}
            </ul>
          </div>
        </nav>

        {/* Conteúdo das páginas */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/users" element={<Users />} />
          <Route path="/search" element={<SearchBooks />} /> {/* Nova rota */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
