import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../src/styles/global.css";

const Navbar = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const response = await fetch(`http://localhost:3001/usuario-logado?id=${userId}`);
          if (!response.ok) {
            throw new Error("Erro ao buscar usuário");
          }
          const data = await response.json();
          setUserName(data.userName || "Usuário");
        } catch (error) {
          console.error("Erro ao buscar usuário:", error);
        }
      }
    };
    fetchUser();
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="logo">📚 Biblioteca Virtual</h1>
        <div className="user-greeting">Olá, {userName}!</div>
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
            <Link to="/perfil-usuario">Perfil</Link>
          </li>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/search">Pesquisar Livros</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
