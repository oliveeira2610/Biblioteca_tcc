import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './sing.css';
import Logo from "/src/assets/img/Logo_lessie.png";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Limpa erros anteriores

    setError("");
  
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Salvar apenas o ID do usuário no localStorage
        localStorage.setItem("userId", data.id);
        localStorage.setItem("userRole", data.role); // Salva a função do usuário
  
        if (data.role === "admin") {
          navigate("/Dashboard"); // Página do admin
        } else {
          navigate("/home"); // Página do usuário comum
        }
      } else {
        setError(data.error || "Erro ao fazer login.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    }
  };
  
  

 
  

  return (
    <div className="body">
      <header className="auth-header">
        <img src="src/assets/img/Logo_lessie.png" className="Imglogo" />
        <p className="texto_header">" Ninguém cresce sozinho "</p>
      </header>
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="Façalogin">Faça seu Login!</h2>
        <form onSubmit={handleLogin}>
          <label className="Label-login" htmlFor="Email">EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="Label-login" htmlFor="Password">SENHA</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="checkboxlogin">
            <input type="checkbox" />
            <label htmlFor="checkbox" className="permanecer" >Permanecer conectado</label>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Login</button>
          <p>
            Não tem uma conta? <a href="/register">Cadastre-se</a>
          </p>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
