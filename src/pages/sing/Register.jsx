import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './sing.css';
import Logo from "/src/assets/img/Logo_lessie.png";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cpf, setCPF] = useState("");
  const [telefone, setTelefone] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    try {
      const user = {
        userName,
        email,
        password, // Removendo confirmPassword
        cpf,
        telefone
      };

      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      });

      const data = await response.json();
      if (response.status === 201) {
        navigate("/");
      } else {
        setError(data.error || "Erro ao salvar no banco de dados.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor. Tente novamente.");
    }
  };

  return (
    <div className="body">
      <header className="auth-header">
        <img src={Logo} className="Imglogo" alt="Logo Lessie" />
        <p className="texto_header">"Ninguém cresce sozinho"</p>
      </header>

      <div className="auth-box">
        <h2>Cadastre-se!</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Digite seu nome ou ID de administrador"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Digite seu CPF"
            value={cpf}
            onChange={(e) => setCPF(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Digite seu telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Cadastrar</button>
          <p>
            Já tem uma conta? <a href="/">Entre aqui</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
