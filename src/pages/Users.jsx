import React, { useState, useEffect } from "react";
import "../../src/styles/Users.css"; // Adapte a estilização conforme necessário


const Users = () => {
    const [usuarios, setUsuarios] = useState([]);

    // Função para buscar usuários e seus livros reservados
    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3001/usuarios');
            const data = await response.json();
            setUsuarios(data);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    // Função chamada ao clicar em um livro
    const handleBookClick = (bookName) => {
        alert(`Você clicou no livro: ${bookName}`);
        // Aqui você pode adicionar uma lógica para redirecionar para uma página de detalhes ou mostrar informações do livro
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="users-container">
            {usuarios.length === 0 ? (
                <p>Carregando usuários...</p>
            ) : (
                usuarios.map((usuario) => (
                    <div key={usuario.id} className="user-card">
                        <h3>{usuario.userName}</h3>
                        <p>Email: {usuario.email}</p>
                        <p>Telefone: {usuario.telefone}</p>

                        <div className="books-section">
                            <h4>Livros Reservados:</h4>
                            <div className="books-cards">
                                {usuario.nome_do_livro ? (
                                    <div
                                        className="book-card"
                                        onClick={() => handleBookClick(usuario.nome_do_livro)}
                                    >
                                        <h5>{usuario.nome_do_livro}</h5>
                                        <p>Status: {usuario.status}</p>
                                        <p>Data de Reserva: {usuario.data_reserva}</p>
                                    </div>
                                ) : (
                                    <p>Sem livros reservados</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Users;
