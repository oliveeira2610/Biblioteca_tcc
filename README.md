trabalho teste

.\sqlite3 ecommerce.db

projetos futuros:

// FEITO // estoque de livros.

melhorias das paginas

// NÂO DA // componentizar os cards para melhora das telas e organização 

// FEITO //  aviso em baixo: reservado até x dia - Bookdetails.

// FEITO // criar pagina de notificações, e colocar um botao novo no BookDetails "indisponivel" que quando o usuario ativar, enviar uma notificação na aba nofificações quando o livro se tornar disponivel novamente.

// Feito // criar pagina perfil. Ex: dados pessoais, livros reservados com prazo de devolução e multas a pagar.

// Feito // integrar totalmente o users.jsx ao banco de dados

// Feito // colocar avisos de disponibilidade fisica e disponibilidade para reserva

// Feito // na tela users colocar os cards de livro funcionais e organizados com botoes para liberar as reservas

// Feito // colocar as notificações de livros em formato de cards funcionais na tela perfilusuarios junto com os livros para melhor gerenciamento de notificações

// Feito // colocar na pagina notificações as notificações de livros em formato de cards funcionais 

// Feito // managedatabasebooks arrumada de bugs de banco de dados

// Feito // mudança do bookstatus para enviar informações novas como data de devolução e multa automatica (definida para 7 dias uteis após reserva, e multa de 10 reais pelo atraso e acrecentando 2 reais por dia de atraso)

// Feito // arrumar a pagina bookdetails para que o adm possa ver melhor as informações em geral

// Feito // arrumar bookdesciption pra adicionar funcionalidades como não deixar o usuario reservar o mesmo livro duas vezes e não conseguir habilitar as notificações ja estando habilitadas

// Feito // arrumar "Quantidade disponível:" da pagina bookdetails

// Feito // separar as reservas na bookdetails em cards grandes individuais 

// Feito // Colocar na navbar comprimento com o nome do usuario automaticamente Ex: Ola Japa!.




PRECISA FAZER:

fazer uma aba no perfil para multas aplicadas e se tiver multas o usuario não consiga reservar um livro, e o adm tmb consiga bloquear o usuario de reservar manualmente

arrumar as notificações se não estiverem chegando

colocar segurança na senha de login e registro comb bcrypt

criar tipo de usuario Ex: Admin e comum, e determinar as paginas que só o usuario comum pode ver e entrar na pagina

criar pagina acervo.

livros aleatorios na home 




SERVER.JS

Conecta-se a um banco de dados SQLite chamado books.db.

Cria as tabelas usuarios, livros, reservas, notificacoes e livros_para_notificacao se elas ainda não existirem.

Cria um trigger para definir automaticamente a data de devolução dos livros após uma reserva ser feita.

Rotas de API:

Manipulação de livros (/livros): Adicionar, buscar, atualizar status, deletar e buscar detalhes de livros.

Manipulação de usuários (/usuarios): Login, buscar dados do usuário, perfil do usuário, e usuários com reservas.

Manipulação de reservas (/reservas): Adicionar, buscar, deletar reservas e pagar multas.

Manipulação de notificações (/notifications): Adicionar, buscar e deletar notificações; registrar e cancelar notificações de livros específicos.

Funções Auxiliares:

createNotification: Cria notificações para um usuário sobre um livro específico.

Middleware para lidar com CORS e JSON.
