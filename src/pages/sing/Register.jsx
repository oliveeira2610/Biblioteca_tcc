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

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import './sing.css';
// import Logo from "/src/assets/img/Logo_lessie.png";

// const Register = () => {
//   const [userName, setUserName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [cpf, setCPF] = useState("");
//   const [telefone, setTelefone] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const validateCPF = (cpf) => {
//     // Função para validar CPF
//     cpf = cpf.replace(/[^\d]+/g, '');
//     if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
//     let soma = 0, resto;
//     for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
//     resto = (soma * 10) % 11;
//     if (resto === 10 || resto === 11) resto = 0;
//     if (resto !== parseInt(cpf.substring(9, 10))) return false;
//     soma = 0;
//     for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
//     resto = (soma * 10) % 11;
//     if (resto === 10 || resto === 11) resto = 0;
//     if (resto !== parseInt(cpf.substring(10, 11))) return false;
//     return true;
//   };

//   const validateTelefone = (telefone) => {
//     // Função para validar telefone (formato brasileiro)
//     const regex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
//     return regex.test(telefone);
//   };

//   const validatePassword = (password) => {
//     // Função para validar senha (mínimo 8 caracteres, incluindo letras e números)
//     const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
//     return regex.test(password);
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();

//     if (!validateCPF(cpf)) {
//       setError("CPF inválido!");
//       return;
//     }

//     if (!validateTelefone(telefone)) {
//       setError("Telefone inválido! Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.");
//       return;
//     }

//     if (!validatePassword(password)) {
//       setError("A senha deve ter no mínimo 8 caracteres, incluindo letras e números.");
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError("As senhas não coincidem!");
//       return;
//     }

//     try {
//       const user = {
//         userName,
//         email,
//         password,
//         cpf,
//         telefone
//       };

//       const response = await fetch("http://localhost:3001/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(user)
//       });

//       const data = await response.json();
//       if (response.status === 201) {
//         navigate("/");
//       } else {
//         setError(data.error || "Erro ao salvar no banco de dados.");
//       }
//     } catch (err) {
//       setError("Erro ao conectar com o servidor. Tente novamente.");
//     }
//   };

//   return (
//     <div className="body">
//       <header className="auth-header">
//         <img src={Logo} className="Imglogo" alt="Logo Lessie" />
//         <p className="texto_header">"Ninguém cresce sozinho"</p>
//       </header>

//       <div className="auth-box">
//         <h2>Cadastre-se!</h2>
//         <form onSubmit={handleRegister}>
//           <input
//             type="text"
//             placeholder="Digite seu nome ou ID de administrador"
//             value={userName}
//             onChange={(e) => setUserName(e.target.value)}
//             required
//           />
//           <input
//             type="email"
//             placeholder="Digite seu email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="text"
//             placeholder="Digite seu CPF"
//             value={cpf}
//             onChange={(e) => setCPF(e.target.value)}
//             required
//           />
//           <input
//             type="text"
//             placeholder="Digite seu telefone"
//             value={telefone}
//             onChange={(e) => setTelefone(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Digite sua senha"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Confirme sua senha"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//           />
//           {error && <p className="error">{error}</p>}
//           <button type="submit">Cadastrar</button>
//           <p>
//             Já tem uma conta? <a href="/">Entre aqui</a>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;