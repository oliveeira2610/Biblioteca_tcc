import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../src/styles/global.css";
import "../../src/styles/dashboard.css"; // Adicione um arquivo CSS para os estilos



const Dashboard = () => {

  function FloatingLetters() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");
    const [letterElements, setLetterElements] = useState([]);
  
    useEffect(() => {
        const generateInitialLetters = () => {
          return Array.from({ length: 40 }).map((_, index) => ({
            id: index,
            char: letters[Math.floor(Math.random() * letters.length)],
            left: Math.random() * 100,
            top: Math.random() * 100,
            speedX: (Math.random() - 0.5) * 0.2,
            speedY: (Math.random() - 0.5) * 0.2,
            fontSize: Math.random() * 3 + 2,
            opacity: Math.random() * 0.1 + 0.05,
          }));
        };
    
        setLetterElements(generateInitialLetters());
      }, []);
    
      useEffect(() => {
        const interval = setInterval(() => {
          setLetterElements((prevLetters) =>
            prevLetters.map((letter) => ({
              ...letter,
              left: (letter.left + letter.speedX + 100) % 100,
              top: (letter.top + letter.speedY + 100) % 100,
            }))
          );
        }, 50);
    
        return () => clearInterval(interval);
      }, []);
  
    return (
      <div className="floating-letters-container">
        {letterElements.map((letter) => (
          <span
            key={letter.id}
            className="floating-letter"
            style={{
              left: `${letter.left}vw`,
              top: `${letter.top}vh`,
              fontSize: `${letter.fontSize}rem`,
              opacity: letter.opacity,
            }}
          >
            {letter.char}
          </span>
        ))}
      </div>
    );
  }
  

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
    <div className="dashboard floating-background">
      <FloatingLetters />
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

      <Link to="/multasUsuarios" className="card">
        <h2>Total de Multas Aplicadas</h2>
        <p>R$ {data.totalFines}</p>
      </Link>
      
    </div>
  );
};

export default Dashboard;
