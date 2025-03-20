LESSIE




DEU PAU

Requisição para /usuarios recebida
Erro ao buscar usuários e reservas: Error: SQLITE_ERROR: no such column: reservas.atrasado
--> in Database#all('\n' +
  '    SELECT \n' +
  '      usuarios.id, \n' +
  '      usuarios.userName AS nome, \n' +
  '      usuarios.email, \n' +
  '      usuarios.telefone, \n' +
  '      livros.id AS livro_id,\n' +
  '      livros.nome_do_livro, \n' +
  '      livros.imagem, \n' +
  '      livros.status,\n' +
  '      reservas.id AS reserva_id, \n' +
  '      reservas.data_reserva,\n' +
  '      reservas.data_devolucao,\n' +
  '      reservas.multa,\n' +
  '      reservas.atrasado\n' +
  '    FROM usuarios\n' +
  '    LEFT JOIN reservas ON usuarios.id = reservas.usuario_id\n' +
  '    LEFT JOIN livros ON reservas.livro_id = livros.id\n' +
  '  ', [Function (anonymous)])
    at C:\Temp\TCC_GRP2\Biblioteca_tcc\banco_de_dados\server.js:1502:6
    at Layer.handle [as handle_request] (C:\Temp\TCC_GRP2\Biblioteca_tcc\node_modules\express\lib\router\layer.js:95:5)
    at next (C:\Temp\TCC_GRP2\Biblioteca_tcc\node_modules\express\lib\router\route.js:149:13)
    at Route.dispatch (C:\Temp\TCC_GRP2\Biblioteca_tcc\node_modules\express\lib\router\route.js:119:3)
    at Layer.handle [as handle_request] (C:\Temp\TCC_GRP2\Biblioteca_tcc\node_modules\express\lib\router\layer.js:95:5)
    at C:\Temp\TCC_GRP2\Biblioteca_tcc\node_modules\express\lib\router\index.js:284:15
    at Function.process_params (C:\Temp\TCC_GRP2\Biblioteca_tcc\node_modules\express\lib\router\index.js:346:12)
    at next (C:\Temp\TCC_GRP2\Biblioteca_tcc\node_modules\express\lib\router\index.js:280:10)
    at jsonParser (C:\Temp\TCC_GRP2\Biblioteca_tcc\node_modules\body-parser\lib\types\json.js:113:7) {
  errno: 1,
  code: 'SQLITE_ERROR',
  __augmented: true
}

RESOLVER COMPATIBILIDADE DE TELAS COM O SISTEMA NOVO





















ATUALIZAÇÕES:






PROJETOS FUTUROS:


Sistema de pagamento para liberar multas -- na pagina perfil  -> cards








PRECISA FAZER:






Ver com grupo se tira a pagina de reserved books e apenas mostre a quantidade ou repaginar o historico





criar sistema de filas, fazer reserva para o livro indisponivel

remover campos estante e localização bookdetails  /// RECRIAR TABELA DE LIVROS COM CODIGO DO SERVER.JS

criar sistema para diferenciar exemplares, na tela de managedatabooks fazer os cards serem agrupamentos das unidades individuais dos livros 

criar uma dashboard com informações de quantos livros e quantas vezes foram reservados no mes e por usuario



                        JapaJapaJapaJapaJapaJapaJapa


finalizar a pagina bookdescription, bgl chato kkkkkkk

fazer o status de multa ficar vermelho e evitdente na aba perfil 

tirar a pagina notificações










MELHORIAS FEITAS NO PROJETO:

// FEITO // tela nova DevolucoaoUsuario.jsx = tela que mostra as informações da devolução do livro e o usuario que devolveu e a data de devolução

// FEITO // Melhorar as verificações de registro

// FEITO // Aparecer mais informações do livro na pagina BookDetails

// FEITO // Criar uma tela para adicionar livro na mão com imagem por link 

// FEITO // Criar sistema de escrever observações para devolução e aparecer nos detalhes da Devolução 

// FEITO // Criar tela para o adm ver o perfil do Usuario e poder ver as observações 

// FEITO // os cards da pagina addbooks redirecionar para uma tela para cadastrar os livros, puxando as informações automaticamente pela api mas tendo a possibilidade de editar,colocando local do livro Ex: Prateleira, Numero do livro alem das outras informações

// FEITO // Criar botao para deslogar na pagina de "perfil usuario"

// FEITO // fazer a pesquisa funcionar junto a digitação em tempo real

// FEITO // Na tela reserved books, quando clicar no card ser redirecionado para tela de detalhed de reserva

// FEITO // ajustar multas altomaticas q nao estao funcionando

// FEITO // preciso resolver o user bloqueado

// FEITO // Sistema para o adm bloquear usuarios de reservar livros na pagina "Users"

// FEITO // estoque de livros.

// FEITO //  aviso em baixo: reservado até x dia - Bookdetails.

// FEITO //  criar pagina acervo. JapaJapaJapaJapaJapaJapaJapaJapaJapaJapaJapa

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




/////////////////////////////////////////

Breve explicação das telas:


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

