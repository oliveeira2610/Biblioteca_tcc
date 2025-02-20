import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from "./pages/sing/Login";
import Register from "./pages/sing/Register";
import Home from './pages/Home';
import Users from './pages/Users';
import SearchBooks from './pages/SearchBooks';
import BookDetails from './pages/BookDetails';
import AddBooks from './pages/AddBooks';
import ManageDatabaseBooks from './pages/ManageDatabaseBooks';
import BookDescription from './pages/BookDescription';
import BookStatus from './pages/BookStatus';
import PerfilUsuario from './pages/PerfilUsuario';
import Dashboard from './pages/Dashboard';
import HistoricoReservas from "./pages/HistoricoReservas";
import DevolucaoDetails from "./pages/DevolucaoDetails";
import MultasUsuarios from './pages/MultasUsuarios';
import ReservedBooks from './pages/ReservedBooks';
import Notifications from './pages/Notifications';
import RegisterBook from './pages/RegisterBook';
import PerfilUsuarioAdm from './pages/PerfilUsuarioAdm';
import Navbar from './components/Navbar'; 
import AdminRoute from "./components/AdminRoute"; 
import './styles/global.css';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="*" element={<Layout />} />
        </Routes>
      </div>
    </Router>
  );
}

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/register" || location.pathname === "/"; // Não renderiza a Navbar nessas rotas

  return (
    <div>
      {!hideNavbar && <Navbar />}  {/* Renderiza a Navbar condicionalmente */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/users" element={<Users />} />
        <Route path="/search" element={<SearchBooks />} /> 
        <Route path="/addbooks" element={<AddBooks />} />
        <Route path="/register-book" element={<RegisterBook />} />
        <Route path="/BookDescription/:id" element={<BookDescription />} />
        <Route path="/historicoReservas" element={<HistoricoReservas />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/book/:id" element={<BookDetails />} /> 
        <Route path="/reservedBooks" element={<ReservedBooks />} />
        <Route path="/multasUsuarios" element={<MultasUsuarios />} />
        <Route path="/dashboard" element={ <AdminRoute> <Dashboard /> </AdminRoute>} />
        <Route path="/manage-database-books" element={<ManageDatabaseBooks />} />
        <Route path="/bookStatus/:id" element={<BookStatus />} />
        <Route path="/perfil-usuario-adm/:userId" element={<PerfilUsuarioAdm />} />
        <Route path="/perfil-usuario" element={<PerfilUsuario />} />
        <Route path="/historico-reservas" element={<HistoricoReservas />} />
        <Route path="/devolucao-detalhes/:livroId/:usuarioId" element={<DevolucaoDetails />} />


      </Routes>
    </div>
  );
}

export default App;
