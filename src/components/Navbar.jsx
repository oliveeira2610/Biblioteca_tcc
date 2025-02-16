import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../src/styles/navbar.css";
import Logo from "/src/assets/img/Logo_lessie.png";

const Navbar = () => {
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState(""); // Estado para armazenar o tipo de usuário

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
          setRole(data.role || "user"); // Define a role (admin ou user)
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
        <div className="logo_ola">
          <img src="src/assets/img/Logo_lessie.png" className="Imglogo" />
          <div className="user-greeting">Olá, {userName}!</div>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/home" className="linksnavbar">Home</Link>
          </li>
          <li>
            <Link to="/notifications" className="linksnavbar" >Notificações</Link>
          </li>
          <li>
            <Link to="/perfil-usuario" className="linksnavbar" >Perfil</Link>
          </li>
          {role === "admin" && ( // Exibe o Dashboard apenas para admins
            <li><Link to="/dashboard"  className="linksnavbar" >Dashboard</Link></li>
          )}
          <li>
            <Link to="/search" className="linksnavbar" >Pesquisar Livros</Link>
          </li>
          
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
