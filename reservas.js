// ...existing code...

function reservarLivro(livroId) {
    const usuarioLogado = obterUsuarioLogado(); // Função que retorna o usuário atualmente logado
    const emailUsuario = usuarioLogado.email;

    // ...existing code...
    const reserva = {
        livroId: livroId,
        usuarioEmail: emailUsuario,
        // ...existing code...
    };

    // ...existing code...
}

// Função fictícia para obter o usuário atualmente logado
function obterUsuarioLogado() {
    // Implementar a lógica para obter o usuário logado
    return {
        email: 'usuario_atual@example.com',
        // ...outros dados do usuário...
    };
}

// ...existing code...
