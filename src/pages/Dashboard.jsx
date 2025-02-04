import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/dashboard.css"; // Adicione um arquivo CSS para os estilos

const Dashboard = () => {
  const [data, setData] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalRented: 0,
    totalReturned: 0,
    totalFines: 0,
  });

  useEffect(() => {
    axios.get("http://localhost:3001/dashboard").then((response) => {
      setData(response.data);
    });
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard da Biblioteca</h1>

      <Link to="/addBooks" className="card">
        <h2>Adicionar Livros</h2>
  
      </Link>


      <Link to="/manage-database-books" className="card">
        <h2>Total de Livros</h2>
        <p>{data.totalBooks}</p>
      </Link>

      <Link to="/users" className="card">
        <h2>Total de Usuários</h2>
        <p>{data.totalUsers}</p>
      </Link>

      <Link to="/reservedBooks" className="card">
        <h2>Total de Livros Alugados</h2>
        <p>{data.totalRented}</p>
      </Link>
      
      <Link to="/historicoReservas" className="card">
        <h2>Total de Livros Devolvidos</h2>
        <p>{data.totalReturned}</p>
      </Link>

      <div className="card">
        <h2>Total de Multas Aplicadas</h2>
        <p>R$ {data.totalFines}</p>
      </div>
      
    </div>
  );
};

export default Dashboard;
