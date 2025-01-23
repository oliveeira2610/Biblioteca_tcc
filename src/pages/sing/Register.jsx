import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth } from "./firebaseConfig.js";
import { useNavigate } from "react-router-dom";
import './sing.css';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
