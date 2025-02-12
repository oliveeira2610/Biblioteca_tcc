trabalho teste

.\sqlite3 ecommerce.db

projetos futuros:

Sistema de pagamento para liberar multas -- na pagina perfil  -> cards

melhorias das paginas

// FEITO // estoque de livros.

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

// Feito // arrumar as notificações se não estiverem chegando

// Feito // colocar segurança na senha de login e registro comb bcrypt 

// Feito // criar tipo de usuario Ex: Admin e comum, e determinar as paginas que só o usuario comum pode ver e entrar na pagina

// Feitor // se tiver multas o usuario não consiga reservar um livro, e o adm tmb consiga bloquear o usuario de reservar manualmente 



PRECISA FAZER:

Colocar local do livro Ex: Prateleira, Numero do livro 

Criar uma tela para adicionar livro na mão com imagem por link

deixar o formulario de registro com verificações melhores

na tela reserved books, quando clicar no card ser redirecionado para tela de detalhed de reserva

                        JapaJapaJapaJapaJapaJapaJapa


fazer uma aba no perfil para multas aplicadas JapaJapaJapaJapaJapaJapaJapa

criar pagina acervo. JapaJapaJapaJapaJapaJapaJapaJapaJapaJapaJapa

livros aleatorios na home JapaJapaJapaJapaJapaJapaJapaJapaJapaJapaJapa




SERVER.JS

Estrutura do Servidor
Framework Utilizado: Express
Banco de Dados: SQLite
Porta do Servidor: 3001
Middleware: CORS e JSON
Conexão com o Banco de Dados
Conexão com o banco de dados books.db.
Criação de tabelas se não existirem:
usuarios
livros
reservas
notificacoes
livros_para_notificacao
historico_devolucoes
Endpoints Principais
Notificações:

Criar, deletar e buscar notificações.
Registrar livros para notificação.
Cancelar notificações.
Livros:

Adicionar, buscar, atualizar e deletar livros.
Atualizar status do livro e notificar usuários.
Reservas:

Criar, deletar e buscar reservas.
Marcar devolução de um livro.
Calcular e atualizar multas.
Usuários:

Registrar, buscar e gerenciar usuários.
Login de usuários.
Dashboard:

Obter dados estatísticos sobre livros, usuários, reservas e multas.
Histórico
Registro de devoluções e histórico de reservas.
Início do Servidor
O servidor é iniciado na porta 3001.