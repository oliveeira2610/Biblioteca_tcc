import React from "react";
import { Link } from "react-router-dom";
import "../../src/styles/global.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="logo">📚 Biblioteca Virtual</h1>
        <ul className="nav-links">
          <li>
            <Link to="/home">Home</Link>
          </li>
          <li>
            <Link to="/books">Livros</Link>
          </li>
          <li>
            <Link to="/notifications">Notificações</Link>
          </li>
          <li>
            <Link to="/users">Usuários</Link>
          </li>
          <li>
            <Link to="/addBooks">Adcionar livros</Link>
          </li>
          <li>
            <Link to="/manage-database-books">Livros Adcionados</Link>
          </li>
          <li>
            <Link to="/perfil-usuario">Perfil</Link>
          </li>
          <li>
            <Link to="/search">Pesquisar Livros</Link>
          </li>{" "}
          {/* Novo link */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
