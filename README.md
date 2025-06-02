# Lessie - Sistema de Gerenciamento de Biblioteca

Bem-vindo ao Lessie, um sistema de gerenciamento de biblioteca desenvolvido como Projeto de Conclusão de Curso (TCC). Este projeto visa oferecer uma solução completa e intuitiva para a administração de acervos, empréstimos, usuários e outras operações essenciais de uma biblioteca, utilizando tecnologias web modernas como React para o frontend e Node.js para o backend, com um banco de dados SQLite.

O nome "Lessie" foi escolhido para representar a inteligência e a organização que o sistema busca trazer para o gerenciamento bibliotecário, inspirado na ideia de um assistente eficiente e amigável.



## Visão Geral do Projeto

Lessie é uma aplicação web completa projetada para simplificar a gestão de bibliotecas. Ela oferece interfaces distintas para usuários comuns e administradores, cada uma com funcionalidades específicas para atender às suas necessidades.

### Tecnologias Utilizadas

*   **Frontend:** React.js, Vite, CSS Modules, Framer Motion (para animações)
*   **Backend:** Node.js, Express.js
*   **Banco de Dados:** SQLite
*   **Outros:** Axios (para requisições HTTP), React Router DOM (para navegação)

## Funcionalidades Principais

O sistema Lessie é rico em funcionalidades, projetado para oferecer uma experiência completa tanto para os usuários que buscam livros quanto para os administradores que gerenciam o acervo e as operações da biblioteca.

### Para Usuários

1.  **Autenticação Segura:** Usuários podem criar suas contas fornecendo informações básicas como nome, email, CPF, telefone e senha. O processo de login valida as credenciais e direciona o usuário para a página inicial.
2.  **Página Inicial (Home):** Ao logar, o usuário é recebido com uma interface amigável que exibe recomendações de livros selecionados aleatoriamente do acervo, incentivando a descoberta de novas leituras. A página também apresenta uma citação inspiradora e informações básicas da biblioteca.
3.  **Busca de Livros (Acervo):** Uma funcionalidade central permite aos usuários pesquisar o acervo completo da biblioteca. A busca pode ser feita pelo título do livro e os resultados são exibidos de forma organizada, agrupados por gênero. Cada livro listado mostra sua capa (se disponível), título, autor e status de disponibilidade (Disponível ou Indisponível). A interface de busca conta com um efeito visual de letras flutuantes no fundo, tornando a experiência mais dinâmica.
4.  **Detalhes do Livro:** Clicando em um livro na busca ou nas recomendações, o usuário acessa uma página com informações detalhadas, incluindo sinopse, autor, gênero, ano de publicação e editora. Nesta página, o usuário pode interagir com o livro de diversas formas:
    *   **Reserva:** Se o livro estiver disponível e o usuário não possuir bloqueios (como multas pendentes), ele pode reservá-lo diretamente.
    *   **Fila de Espera:** Caso o livro esteja indisponível, o usuário pode optar por entrar em uma fila de espera para ser notificado quando o livro for devolvido.
    *   **Notificações:** Mesmo que não queira entrar na fila, o usuário pode solicitar ser notificado quando um livro específico se tornar disponível.
    *   **Cancelamento:** É possível cancelar o registro de notificação ou sair da fila de espera a qualquer momento.
    *   **Easter Eggs:** Alguns livros podem conter links secretos para jogos ou conteúdos interativos (como o jogo do Dinossauro, Flappy Bird ou um PDF interativo do Doom), adicionando um elemento de surpresa e diversão.
5.  **Perfil do Usuário:** Cada usuário possui uma página de perfil onde pode visualizar e gerenciar suas informações e atividades na biblioteca:
    *   **Dados Pessoais:** Exibe nome, email, telefone e status (ativo ou bloqueado).
    *   **Foto de Perfil:** Permite ao usuário adicionar ou atualizar sua foto de perfil colando a URL de uma imagem.
    *   **Livros Reservados:** Lista os livros atualmente reservados pelo usuário, com suas respectivas datas de reserva e devolução.
    *   **Multas Pendentes:** Mostra as multas acumuladas por atrasos na devolução. O sistema integra-se a uma plataforma de pagamento (Mercado Pago) para que o usuário possa quitar suas multas online.
    *   **Livros Acompanhados:** Exibe a lista de livros para os quais o usuário solicitou notificações de disponibilidade.
    *   **Notificações Recebidas:** Apresenta as notificações recebidas sobre a disponibilidade dos livros acompanhados.
    *   **Logout:** Permite ao usuário encerrar sua sessão de forma segura.

### Para Administradores

1.  **Dashboard Administrativo:** Após o login com credenciais de administrador, o usuário é direcionado a um painel de controle centralizado. Este dashboard oferece uma visão geral das métricas chave da biblioteca, como número total de livros, usuários cadastrados, livros alugados, livros devolvidos e o valor total de multas aplicadas. O dashboard também serve como ponto de acesso rápido para as diversas funcionalidades administrativas.
2.  **Gerenciamento de Livros:**
    *   **Adicionar Livros:** Interface para cadastrar novos livros no acervo, inserindo informações como título, autor, gênero, sinopse, ano, editora, quantidade e URL da imagem da capa.
    *   **Gerenciar Acervo:** Permite visualizar, editar ou remover livros existentes no banco de dados.
3.  **Gerenciamento de Usuários:**
    *   **Listar Usuários:** Exibe a lista de todos os usuários cadastrados no sistema.
    *   **Visualizar/Editar Perfil:** Permite ao administrador visualizar detalhes de um usuário específico e, potencialmente, editar informações ou status (como bloquear/desbloquear).
4.  **Gerenciamento de Empréstimos e Devoluções:**
    *   **Livros Reservados:** Lista todos os livros que estão atualmente emprestados, mostrando quem os reservou e as datas de devolução previstas.
    *   **Histórico de Reservas:** Mantém um registro de todos os empréstimos e devoluções realizados, permitindo consultas e auditorias.
    *   **Detalhes da Devolução:** Possivelmente uma tela para registrar a devolução de um livro e calcular multas, se aplicável.
5.  **Gerenciamento de Multas:**
    *   **Multas por Usuário:** Permite visualizar as multas pendentes de cada usuário e, possivelmente, registrar pagamentos ou aplicar isenções.

## Telas do Sistema

O sistema é composto por diversas telas, cada uma desenhada para uma função específica:

*   **Login:** Formulário para entrada no sistema.
*   **Cadastro:** Formulário para registro de novos usuários.
*   **Home:** Página inicial com boas-vindas e recomendações.
*   **Busca de Livros:** Tela para pesquisar e visualizar o acervo.
*   **Descrição do Livro:** Detalhes completos de um livro específico.
*   **Status do Livro:** Provavelmente relacionada ao processo de reserva/fila.
*   **Perfil do Usuário:** Painel pessoal do usuário.
*   **Dashboard (Admin):** Painel de controle para administradores.
*   **Adicionar Livros (Admin):** Formulário para cadastro de novos livros.
*   **Gerenciar Livros (Admin):** Tabela ou lista para edição/remoção de livros.
*   **Usuários (Admin):** Lista de usuários cadastrados.
*   **Perfil do Usuário (Admin View):** Visualização do perfil de um usuário pelo administrador.
*   **Livros Reservados (Admin):** Lista de empréstimos ativos.
*   **Histórico de Reservas (Admin):** Registro de empréstimos passados.
*   **Detalhes da Devolução (Admin):** Tela para processar devoluções.
*   **Multas (Admin):** Gerenciamento de multas.
*   **Notificações:** Pode ser uma tela dedicada ou integrada ao perfil.
*   **Jogos (Easter Eggs):** Telas separadas para os jogos interativos.

## Como Executar o Projeto

Para executar o projeto Lessie localmente, siga estas etapas:

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/oliveeira2610/Biblioteca_tcc.git
    cd Biblioteca_tcc
    ```

2.  **Instale as Dependências do Frontend:**
    ```bash
    npm install
    ```

3.  **Instale as Dependências do Backend:**
    ```bash
    cd banco_de_dados
    npm install
    ```

4.  **Inicie o Servidor Backend:**
    Ainda no diretório `banco_de_dados`:
    ```bash
    node server.js
    ```
    O servidor backend estará rodando em `http://localhost:3001`.

5.  **Inicie a Aplicação Frontend:**
    Volte para o diretório raiz do projeto (`Biblioteca_tcc`):
    ```bash
    cd ..
    npm run dev
    ```
    A aplicação React estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

6.  **Acesse a Aplicação:** Abra seu navegador e acesse o endereço fornecido pelo Vite.

**Observação:** O banco de dados SQLite (`books.db`) já está incluído no repositório com algumas tabelas e dados iniciais. Certifique-se de que o backend (`server.js`) esteja rodando antes de iniciar o frontend.

## Contribuição

Este projeto foi desenvolvido como um TCC. Contribuições são bem-vindas! Se você encontrar bugs ou tiver sugestões de melhorias, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

