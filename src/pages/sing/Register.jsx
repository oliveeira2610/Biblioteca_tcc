import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth } from "./firebaseConfig.js";
import { useNavigate } from "react-router-dom";
import './sing.css';

const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cpf, setCPF] = useState("");
  const [error, setError] = useState("");
  const [telefone, setTelefone] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/login");  // Redireciona para o login após cadastro bem-sucedido
    } catch (err) {
      setError("Erro ao cadastrar. Tente novamente.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
      <h1 className="logo">📚 Biblioteca Virtual</h1>
        <h2>Cadastre-se!</h2>
        <form onSubmit={handleRegister}>
        <input
            type="userName"
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
            type="cpf"
            placeholder="Digite seu CPF"
            value={cpf}
            onChange={(e) => setCPF(e.target.value)}
            required
          />
          <input
            type="telefone"
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
            type="Password"
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
