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
            <Link to="/users">Usuários</Link>
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
