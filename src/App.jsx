import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from "./pages/sing/Login";
import Register from "./pages/sing/Register";
import Home from './pages/Home';
import Books from './pages/Books';
import Users from './pages/Users';
import SearchBooks from './pages/SearchBooks';
import BookDetails from './pages/BookDetails';
import AddBooks from './pages/AddBooks';
import ManageBooks from './pages/ManageBooks';
import Navbar from './components/Navbar';  // Importa a Navbar
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
        <Route path="/books" element={<Books />} />
        <Route path="/users" element={<Users />} />
        <Route path="/search" element={<SearchBooks />} /> 
        <Route path="/addBooks" element={<AddBooks />} /> 
        <Route path="/manageBooks" element={<ManageBooks />} /> 
        <Route path="/book/:id" element={<BookDetails />} />
      </Routes>
    </div>
  );
}

export default App;
