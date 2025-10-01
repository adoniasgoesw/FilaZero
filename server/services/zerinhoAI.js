import { NlpManager } from 'node-nlp';

class ZerinhoAI {
  constructor() {
    this.manager = new NlpManager({ 
      languages: ['pt'], 
      forceNER: true,
      nlu: { log: false },
      autoSave: false,
      autoLoad: false
    });
    this.isTrained = false;
  }

  async initialize() {
    if (this.isTrained) return;
    
    console.log('🤖 Zerinho AI - Inicializando e treinando modelo...');
    
    // ===== 1. SAUDAÇÕES COMPLETAS =====
    // Saudações básicas
    this.manager.addDocument('pt', 'oi', 'saudacao');
    this.manager.addDocument('pt', 'olá', 'saudacao');
    this.manager.addDocument('pt', 'e aí', 'saudacao');
    this.manager.addDocument('pt', 'eae', 'saudacao');
    this.manager.addDocument('pt', 'eai', 'saudacao');
    this.manager.addDocument('pt', 'hey', 'saudacao');
    this.manager.addDocument('pt', 'fala', 'saudacao');
    this.manager.addDocument('pt', 'salve', 'saudacao');
    this.manager.addDocument('pt', 'opa', 'saudacao');
    this.manager.addDocument('pt', 'beleza', 'saudacao');
    this.manager.addDocument('pt', 'tudo bem', 'saudacao');
    this.manager.addDocument('pt', 'como vai', 'saudacao');
    this.manager.addDocument('pt', 'tudo certo', 'saudacao');
    this.manager.addDocument('pt', 'tudo joia', 'saudacao');
    this.manager.addDocument('pt', 'tudo tranquilo', 'saudacao');
    this.manager.addDocument('pt', 'tudo certo por aí', 'saudacao');
    this.manager.addDocument('pt', 'e aí beleza', 'saudacao');
    this.manager.addDocument('pt', 'e aí galera', 'saudacao');
    this.manager.addDocument('pt', 'eae galera', 'saudacao');
    this.manager.addDocument('pt', 'eai galera', 'saudacao');
    this.manager.addDocument('pt', 'oi tudo bem', 'saudacao');
    this.manager.addDocument('pt', 'olá tudo bem', 'saudacao');
    this.manager.addDocument('pt', 'oi pessoal', 'saudacao');
    this.manager.addDocument('pt', 'olá pessoal', 'saudacao');
    this.manager.addDocument('pt', 'e aí pessoal', 'saudacao');
    this.manager.addDocument('pt', 'eae pessoal', 'saudacao');
    this.manager.addDocument('pt', 'eai pessoal', 'saudacao');
    this.manager.addDocument('pt', 'hey pessoal', 'saudacao');
    this.manager.addDocument('pt', 'fala pessoal', 'saudacao');
    this.manager.addDocument('pt', 'salve pessoal', 'saudacao');
    this.manager.addDocument('pt', 'opa pessoal', 'saudacao');
    this.manager.addDocument('pt', 'beleza pessoal', 'saudacao');
    this.manager.addDocument('pt', 'tudo bem pessoal', 'saudacao');
    this.manager.addDocument('pt', 'como vai pessoal', 'saudacao');
    this.manager.addDocument('pt', 'tudo certo pessoal', 'saudacao');
    this.manager.addDocument('pt', 'tudo joia pessoal', 'saudacao');
    this.manager.addDocument('pt', 'tudo tranquilo pessoal', 'saudacao');
    this.manager.addDocument('pt', 'tudo certo por aí pessoal', 'saudacao');
    this.manager.addDocument('pt', 'e aí beleza pessoal', 'saudacao');
    this.manager.addDocument('pt', 'e aí galera pessoal', 'saudacao');
    this.manager.addDocument('pt', 'eae galera pessoal', 'saudacao');
    this.manager.addDocument('pt', 'eai galera pessoal', 'saudacao');
    this.manager.addDocument('pt', 'oi tudo bem pessoal', 'saudacao');
    this.manager.addDocument('pt', 'olá tudo bem pessoal', 'saudacao');
    this.manager.addDocument('pt', 'oi galera', 'saudacao');
    this.manager.addDocument('pt', 'olá galera', 'saudacao');
    this.manager.addDocument('pt', 'e aí galera', 'saudacao');
    this.manager.addDocument('pt', 'eae galera', 'saudacao');
    this.manager.addDocument('pt', 'eai galera', 'saudacao');
    this.manager.addDocument('pt', 'hey galera', 'saudacao');
    this.manager.addDocument('pt', 'fala galera', 'saudacao');
    this.manager.addDocument('pt', 'salve galera', 'saudacao');
    this.manager.addDocument('pt', 'opa galera', 'saudacao');
    this.manager.addDocument('pt', 'beleza galera', 'saudacao');
    this.manager.addDocument('pt', 'tudo bem galera', 'saudacao');
    this.manager.addDocument('pt', 'como vai galera', 'saudacao');
    this.manager.addDocument('pt', 'tudo certo galera', 'saudacao');
    this.manager.addDocument('pt', 'tudo joia galera', 'saudacao');
    this.manager.addDocument('pt', 'tudo tranquilo galera', 'saudacao');
    this.manager.addDocument('pt', 'tudo certo por aí galera', 'saudacao');
    this.manager.addDocument('pt', 'e aí beleza galera', 'saudacao');
    this.manager.addDocument('pt', 'e aí galera galera', 'saudacao');
    this.manager.addDocument('pt', 'eae galera galera', 'saudacao');
    this.manager.addDocument('pt', 'eai galera galera', 'saudacao');
    this.manager.addDocument('pt', 'oi tudo bem galera', 'saudacao');
    this.manager.addDocument('pt', 'olá tudo bem galera', 'saudacao');
    
    // Saudações com horário
    this.manager.addDocument('pt', 'bom dia', 'saudacao');
    this.manager.addDocument('pt', 'boa tarde', 'saudacao');
    this.manager.addDocument('pt', 'boa noite', 'saudacao');
    this.manager.addDocument('pt', 'bom dia pessoal', 'saudacao');
    this.manager.addDocument('pt', 'boa tarde pessoal', 'saudacao');
    this.manager.addDocument('pt', 'boa noite pessoal', 'saudacao');
    this.manager.addDocument('pt', 'bom dia galera', 'saudacao');
    this.manager.addDocument('pt', 'boa tarde galera', 'saudacao');
    this.manager.addDocument('pt', 'boa noite galera', 'saudacao');
    this.manager.addDocument('pt', 'bom dia zerinho', 'saudacao');
    this.manager.addDocument('pt', 'boa tarde zerinho', 'saudacao');
    this.manager.addDocument('pt', 'boa noite zerinho', 'saudacao');
    this.manager.addDocument('pt', 'oi zerinho', 'saudacao');
    this.manager.addDocument('pt', 'olá zerinho', 'saudacao');
    this.manager.addDocument('pt', 'e aí zerinho', 'saudacao');
    this.manager.addDocument('pt', 'eae zerinho', 'saudacao');
    this.manager.addDocument('pt', 'eai zerinho', 'saudacao');
    this.manager.addDocument('pt', 'hey zerinho', 'saudacao');
    this.manager.addDocument('pt', 'fala zerinho', 'saudacao');
    this.manager.addDocument('pt', 'salve zerinho', 'saudacao');
    this.manager.addDocument('pt', 'opa zerinho', 'saudacao');
    this.manager.addDocument('pt', 'beleza zerinho', 'saudacao');
    this.manager.addDocument('pt', 'tudo bem zerinho', 'saudacao');
    this.manager.addDocument('pt', 'como vai zerinho', 'saudacao');
    this.manager.addDocument('pt', 'tudo certo zerinho', 'saudacao');
    this.manager.addDocument('pt', 'tudo joia zerinho', 'saudacao');
    this.manager.addDocument('pt', 'tudo tranquilo zerinho', 'saudacao');
    this.manager.addDocument('pt', 'tudo certo por aí zerinho', 'saudacao');
    this.manager.addDocument('pt', 'e aí beleza zerinho', 'saudacao');
    this.manager.addDocument('pt', 'e aí galera zerinho', 'saudacao');
    this.manager.addDocument('pt', 'eae galera zerinho', 'saudacao');
    this.manager.addDocument('pt', 'eai galera zerinho', 'saudacao');
    this.manager.addDocument('pt', 'oi tudo bem zerinho', 'saudacao');
    this.manager.addDocument('pt', 'olá tudo bem zerinho', 'saudacao');
    this.manager.addDocument('pt', 'bom dia filazero', 'saudacao');
    this.manager.addDocument('pt', 'boa tarde filazero', 'saudacao');
    this.manager.addDocument('pt', 'boa noite filazero', 'saudacao');
    this.manager.addDocument('pt', 'oi filazero', 'saudacao');
    this.manager.addDocument('pt', 'olá filazero', 'saudacao');
    this.manager.addDocument('pt', 'e aí filazero', 'saudacao');
    this.manager.addDocument('pt', 'eae filazero', 'saudacao');
    this.manager.addDocument('pt', 'eai filazero', 'saudacao');
    this.manager.addDocument('pt', 'hey filazero', 'saudacao');
    this.manager.addDocument('pt', 'fala filazero', 'saudacao');
    this.manager.addDocument('pt', 'salve filazero', 'saudacao');
    this.manager.addDocument('pt', 'opa filazero', 'saudacao');
    this.manager.addDocument('pt', 'beleza filazero', 'saudacao');
    this.manager.addDocument('pt', 'tudo bem filazero', 'saudacao');
    this.manager.addDocument('pt', 'como vai filazero', 'saudacao');
    this.manager.addDocument('pt', 'tudo certo filazero', 'saudacao');
    this.manager.addDocument('pt', 'tudo joia filazero', 'saudacao');
    this.manager.addDocument('pt', 'tudo tranquilo filazero', 'saudacao');
    this.manager.addDocument('pt', 'tudo certo por aí filazero', 'saudacao');
    this.manager.addDocument('pt', 'e aí beleza filazero', 'saudacao');
    this.manager.addDocument('pt', 'e aí galera filazero', 'saudacao');
    this.manager.addDocument('pt', 'eae galera filazero', 'saudacao');
    this.manager.addDocument('pt', 'eai galera filazero', 'saudacao');
    this.manager.addDocument('pt', 'oi tudo bem filazero', 'saudacao');
    this.manager.addDocument('pt', 'olá tudo bem filazero', 'saudacao');

    // ===== 2. CADASTRO E ACESSO =====
    this.manager.addDocument('pt', 'como me cadastro', 'cadastro_sistema');
    this.manager.addDocument('pt', 'como me registro', 'cadastro_sistema');
    this.manager.addDocument('pt', 'quero criar conta', 'cadastro_sistema');
    this.manager.addDocument('pt', 'criar conta', 'cadastro_sistema');
    this.manager.addDocument('pt', 'cadastrar conta', 'cadastro_sistema');
    this.manager.addDocument('pt', 'registrar conta', 'cadastro_sistema');
    this.manager.addDocument('pt', 'nova conta', 'cadastro_sistema');
    this.manager.addDocument('pt', 'abrir conta', 'cadastro_sistema');
    this.manager.addDocument('pt', 'fazer cadastro', 'cadastro_sistema');
    this.manager.addDocument('pt', 'fazer registro', 'cadastro_sistema');
    this.manager.addDocument('pt', 'me cadastrar', 'cadastro_sistema');
    this.manager.addDocument('pt', 'me registrar', 'cadastro_sistema');
    this.manager.addDocument('pt', 'cadastro no sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'registro no sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'cadastro filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'registro filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'cadastrar filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'registrar filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'criar conta filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'conta filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'nova conta filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'abrir conta filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'fazer cadastro filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'fazer registro filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'me cadastrar filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'me registrar filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'cadastro no filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'registro no filazero', 'cadastro_sistema');
    this.manager.addDocument('pt', 'cadastro sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'registro sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'cadastrar sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'registrar sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'criar conta sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'conta sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'nova conta sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'abrir conta sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'fazer cadastro sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'fazer registro sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'me cadastrar sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'me registrar sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'cadastro no sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'registro no sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'onde eu me registro', 'cadastro_sistema');
    this.manager.addDocument('pt', 'cadastrar no sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'registrar no sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'criar conta no sistema', 'cadastro_sistema');
    this.manager.addDocument('pt', 'como criar usuário', 'cadastro_sistema');
    this.manager.addDocument('pt', 'como fazer login', 'login');
    this.manager.addDocument('pt', 'onde faço login', 'login');
    this.manager.addDocument('pt', 'esqueci minha senha', 'esqueci_senha');
    this.manager.addDocument('pt', 'não consigo entrar', 'login');
    this.manager.addDocument('pt', 'erro no login', 'login');
    this.manager.addDocument('pt', 'conta bloqueada', 'login');
    this.manager.addDocument('pt', 'recuperar senha', 'esqueci_senha');
    this.manager.addDocument('pt', 'resetar senha', 'esqueci_senha');

    // Treinando intenções de cadastro de clientes
    this.manager.addDocument('pt', 'como cadastro um cliente', 'cadastro_cliente');
    this.manager.addDocument('pt', 'como cadastrar cliente', 'cadastro_cliente');
    this.manager.addDocument('pt', 'cadastrar cliente', 'cadastro_cliente');
    this.manager.addDocument('pt', 'adicionar cliente', 'cadastro_cliente');
    this.manager.addDocument('pt', 'criar cliente', 'cadastro_cliente');
    this.manager.addDocument('pt', 'como adicionar cliente', 'cadastro_cliente');
    this.manager.addDocument('pt', 'como criar cliente', 'cadastro_cliente');

    // Treinando intenções de cadastro de produtos
    this.manager.addDocument('pt', 'como cadastro um produto', 'cadastro_produto');
    this.manager.addDocument('pt', 'como cadastrar produto', 'cadastro_produto');
    this.manager.addDocument('pt', 'cadastrar produto', 'cadastro_produto');
    this.manager.addDocument('pt', 'adicionar produto', 'cadastro_produto');
    this.manager.addDocument('pt', 'criar produto', 'cadastro_produto');
    this.manager.addDocument('pt', 'como adicionar produto', 'cadastro_produto');
    this.manager.addDocument('pt', 'como criar produto', 'cadastro_produto');

    // Treinando intenções de cadastro de categorias
    this.manager.addDocument('pt', 'como cadastro uma categoria', 'cadastro_categoria');
    this.manager.addDocument('pt', 'como cadastrar categoria', 'cadastro_categoria');
    this.manager.addDocument('pt', 'cadastrar categoria', 'cadastro_categoria');
    this.manager.addDocument('pt', 'adicionar categoria', 'cadastro_categoria');
    this.manager.addDocument('pt', 'criar categoria', 'cadastro_categoria');
    this.manager.addDocument('pt', 'como adicionar categoria', 'cadastro_categoria');
    this.manager.addDocument('pt', 'como criar categoria', 'cadastro_categoria');

    // Treinando intenções de cadastro de complementos
    this.manager.addDocument('pt', 'como cadastro um complemento', 'cadastro_complemento');
    this.manager.addDocument('pt', 'como cadastrar complemento', 'cadastro_complemento');
    this.manager.addDocument('pt', 'cadastrar complemento', 'cadastro_complemento');
    this.manager.addDocument('pt', 'adicionar complemento', 'cadastro_complemento');
    this.manager.addDocument('pt', 'criar complemento', 'cadastro_complemento');
    this.manager.addDocument('pt', 'como adicionar complemento', 'cadastro_complemento');
    this.manager.addDocument('pt', 'como criar complemento', 'cadastro_complemento');
    this.manager.addDocument('pt', 'categoria de complementos', 'cadastro_complemento');
    this.manager.addDocument('pt', 'categoria complementos', 'cadastro_complemento');
    this.manager.addDocument('pt', 'cadastrar categoria complementos', 'cadastro_complemento');
    this.manager.addDocument('pt', 'criar categoria complementos', 'cadastro_complemento');
    this.manager.addDocument('pt', 'adicionar categoria complementos', 'cadastro_complemento');
    this.manager.addDocument('pt', 'onde cadastro categoria complementos', 'cadastro_complemento');
    this.manager.addDocument('pt', 'como cadastrar categoria complementos', 'cadastro_complemento');

    // Treinando intenções de caixa
    this.manager.addDocument('pt', 'como abrir o caixa', 'abrir_caixa');
    this.manager.addDocument('pt', 'abrir caixa', 'abrir_caixa');
    this.manager.addDocument('pt', 'iniciar caixa', 'abrir_caixa');
    this.manager.addDocument('pt', 'como iniciar caixa', 'abrir_caixa');
    this.manager.addDocument('pt', 'como fechar o caixa', 'fechar_caixa');
    this.manager.addDocument('pt', 'fechar caixa', 'fechar_caixa');
    this.manager.addDocument('pt', 'fechamento de caixa', 'fechar_caixa');
    this.manager.addDocument('pt', 'como fechar caixa', 'fechar_caixa');

    // Treinando intenções de PDV/Ponto de Atendimento
    this.manager.addDocument('pt', 'ponto de atendimento', 'pdv');
    this.manager.addDocument('pt', 'pdv', 'pdv');
    this.manager.addDocument('pt', 'vendas', 'pdv');
    this.manager.addDocument('pt', 'como fazer vendas', 'pdv');
    this.manager.addDocument('pt', 'como vender', 'pdv');
    this.manager.addDocument('pt', 'sistema de vendas', 'pdv');

    // Treinando intenções de preços/planos
    this.manager.addDocument('pt', 'quais são os planos', 'planos');
    this.manager.addDocument('pt', 'preços', 'planos');
    this.manager.addDocument('pt', 'planos', 'planos');
    this.manager.addDocument('pt', 'custo', 'planos');
    this.manager.addDocument('pt', 'valor', 'planos');
    this.manager.addDocument('pt', 'quanto custa', 'planos');
    this.manager.addDocument('pt', 'preço do sistema', 'planos');

    // Treinando intenções de funcionalidades
    this.manager.addDocument('pt', 'funcionalidades', 'funcionalidades');
    this.manager.addDocument('pt', 'o que faz', 'funcionalidades');
    this.manager.addDocument('pt', 'recursos', 'funcionalidades');
    this.manager.addDocument('pt', 'o que o sistema faz', 'funcionalidades');
    this.manager.addDocument('pt', 'para que serve', 'funcionalidades');
    this.manager.addDocument('pt', 'o que é filazero', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'o que é o filazero', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'o que é a filazero', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'o que é fila zero', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'o que é o fila zero', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'o que é a fila zero', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'que sistema é esse', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'que sistema é este', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'me explica o filazero', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'me explica a filazero', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'conta sobre o filazero', 'o_que_e_filazero');
    this.manager.addDocument('pt', 'conta sobre a filazero', 'o_que_e_filazero');

    // Treinando intenções de ajuda
    this.manager.addDocument('pt', 'ajuda', 'ajuda');
    this.manager.addDocument('pt', 'help', 'ajuda');
    this.manager.addDocument('pt', 'como funciona', 'ajuda');
    this.manager.addDocument('pt', 'não sei usar', 'ajuda');
    this.manager.addDocument('pt', 'como usar', 'ajuda');

    // Treinando intenções de problemas técnicos
    this.manager.addDocument('pt', 'não consigo', 'problema_tecnico');
    this.manager.addDocument('pt', 'não estou conseguindo', 'problema_tecnico');
    this.manager.addDocument('pt', 'não funciona', 'problema_tecnico');
    this.manager.addDocument('pt', 'erro', 'problema_tecnico');
    this.manager.addDocument('pt', 'problema', 'problema_tecnico');
    this.manager.addDocument('pt', 'bug', 'problema_tecnico');
    this.manager.addDocument('pt', 'travou', 'problema_tecnico');
    this.manager.addDocument('pt', 'deu erro', 'problema_tecnico');
    this.manager.addDocument('pt', 'não está funcionando', 'problema_tecnico');
    this.manager.addDocument('pt', 'falha', 'problema_tecnico');
    this.manager.addDocument('pt', 'falhou', 'problema_tecnico');

    // Treinando intenções de contato
    this.manager.addDocument('pt', 'contato', 'contato');
    this.manager.addDocument('pt', 'telefone', 'contato');
    this.manager.addDocument('pt', 'email', 'contato');
    this.manager.addDocument('pt', 'como entrar em contato', 'contato');
    this.manager.addDocument('pt', 'falar com alguém', 'contato');

    // Treinando intenções de pagamentos
    this.manager.addDocument('pt', 'pagamento', 'pagamentos');
    this.manager.addDocument('pt', 'forma de pagamento', 'pagamentos');
    this.manager.addDocument('pt', 'configurar pagamento', 'pagamentos');
    this.manager.addDocument('pt', 'como configurar pagamento', 'pagamentos');

    // Treinando intenções de relatórios
    this.manager.addDocument('pt', 'relatório', 'relatorios');
    this.manager.addDocument('pt', 'relatorios', 'relatorios');
    this.manager.addDocument('pt', 'vendas do dia', 'relatorios');
    this.manager.addDocument('pt', 'como ver vendas', 'relatorios');
    this.manager.addDocument('pt', 'faturamento', 'relatorios');

    // Treinando intenções de cozinha
    this.manager.addDocument('pt', 'cozinha', 'cozinha');
    this.manager.addDocument('pt', 'pedidos da cozinha', 'cozinha');
    this.manager.addDocument('pt', 'comanda', 'cozinha');
    this.manager.addDocument('pt', 'como funciona a cozinha', 'cozinha');

    // Treinando intenções de delivery
    this.manager.addDocument('pt', 'delivery', 'delivery');
    this.manager.addDocument('pt', 'entrega', 'delivery');
    this.manager.addDocument('pt', 'como funciona delivery', 'delivery');
    this.manager.addDocument('pt', 'sistema de entrega', 'delivery');

    // Treinando intenções de impressão
    this.manager.addDocument('pt', 'imprimir', 'impressao');
    this.manager.addDocument('pt', 'nota fiscal', 'impressao');
    this.manager.addDocument('pt', 'comanda impressa', 'impressao');
    this.manager.addDocument('pt', 'como imprimir', 'impressao');

    // ===== 3. PEDIDOS E VENDAS =====
    this.manager.addDocument('pt', 'como abrir um pedido', 'abrir_pedido');
    this.manager.addDocument('pt', 'como fazer um pedido', 'abrir_pedido');
    this.manager.addDocument('pt', 'como funciona mesa', 'mesa_comanda');
    this.manager.addDocument('pt', 'como funciona comanda', 'mesa_comanda');
    this.manager.addDocument('pt', 'como funciona balcão', 'mesa_comanda');
    this.manager.addDocument('pt', 'como adicionar complemento', 'adicionar_complemento');
    this.manager.addDocument('pt', 'como imprimir pedido', 'imprimir_pedido');
    this.manager.addDocument('pt', 'como ver pedidos em andamento', 'pedidos_andamento');
    this.manager.addDocument('pt', 'como finalizar pedido', 'finalizar_pedido');
    this.manager.addDocument('pt', 'como cancelar pedido', 'cancelar_pedido');
    this.manager.addDocument('pt', 'como editar pedido', 'editar_pedido');
    this.manager.addDocument('pt', 'como adicionar item', 'adicionar_item');
    this.manager.addDocument('pt', 'como remover item', 'remover_item');
    this.manager.addDocument('pt', 'como alterar quantidade', 'alterar_quantidade');

    // ===== 4. CAIXA E FINANCEIRO =====
    this.manager.addDocument('pt', 'como abrir o caixa', 'abrir_caixa');
    this.manager.addDocument('pt', 'como fechar o caixa', 'fechar_caixa');
    this.manager.addDocument('pt', 'como registrar pagamento', 'registrar_pagamento');
    this.manager.addDocument('pt', 'como ver histórico de caixa', 'historico_caixa');
    this.manager.addDocument('pt', 'como ver vendas do dia', 'vendas_dia');
    this.manager.addDocument('pt', 'como ver faturamento', 'faturamento');
    this.manager.addDocument('pt', 'como fechar caixa', 'fechar_caixa');
    this.manager.addDocument('pt', 'como abrir caixa', 'abrir_caixa');
    this.manager.addDocument('pt', 'valor inicial do caixa', 'abrir_caixa');
    this.manager.addDocument('pt', 'como calcular troco', 'calcular_troco');

    // ===== 5. COZINHA =====
    this.manager.addDocument('pt', 'como funciona a área da cozinha', 'area_cozinha');
    this.manager.addDocument('pt', 'onde vejo os pedidos em preparo', 'pedidos_preparo');
    this.manager.addDocument('pt', 'como mudar status do item', 'mudar_status');
    this.manager.addDocument('pt', 'como marcar como pronto', 'marcar_pronto');
    this.manager.addDocument('pt', 'como funciona cozinha digital', 'area_cozinha');
    this.manager.addDocument('pt', 'sistema de cozinha', 'area_cozinha');
    this.manager.addDocument('pt', 'comanda digital', 'area_cozinha');
    this.manager.addDocument('pt', 'pedidos para cozinha', 'pedidos_preparo');

    // ===== 6. DELIVERY =====
    this.manager.addDocument('pt', 'como ativar delivery', 'ativar_delivery');
    this.manager.addDocument('pt', 'como atribuir entrega', 'atribuir_entrega');
    this.manager.addDocument('pt', 'como acompanhar status', 'acompanhar_entrega');
    this.manager.addDocument('pt', 'plano gratuito tem delivery', 'delivery_gratuito');
    this.manager.addDocument('pt', 'delivery gratuito', 'delivery_gratuito');
    this.manager.addDocument('pt', 'sistema de entrega', 'ativar_delivery');
    this.manager.addDocument('pt', 'como funciona delivery', 'ativar_delivery');
    this.manager.addDocument('pt', 'entregador', 'atribuir_entrega');

    // ===== 7. PLANOS E PAGAMENTOS =====
    this.manager.addDocument('pt', 'qual plano tem teste grátis', 'teste_gratis_planos');
    this.manager.addDocument('pt', 'plano vitalício pode testar', 'vitalicio_teste');
    this.manager.addDocument('pt', 'quanto custa o mensal', 'custo_mensal');
    this.manager.addDocument('pt', 'qual diferença do gratuito', 'diferenca_gratuito');
    this.manager.addDocument('pt', 'posso mudar de plano', 'mudar_plano');
    this.manager.addDocument('pt', 'plano gratuito', 'plano_gratuito');
    this.manager.addDocument('pt', 'plano pro', 'plano_pro');
    this.manager.addDocument('pt', 'plano anual', 'plano_anual');
    this.manager.addDocument('pt', 'plano vitalício', 'plano_vitalicio');
    this.manager.addDocument('pt', 'desconto anual', 'desconto_anual');
    this.manager.addDocument('pt', '30 dias grátis', 'teste_gratis_planos');
    this.manager.addDocument('pt', 'teste grátis', 'teste_gratis_planos');

    // ===== 8. NOTAS FISCAIS =====
    this.manager.addDocument('pt', 'o que é nfc-e', 'nfc_e');
    this.manager.addDocument('pt', 'como emitir nota fiscal', 'emitir_nf');
    this.manager.addDocument('pt', 'como imprimir para cozinha', 'imprimir_cozinha');
    this.manager.addDocument('pt', 'tem relatório de notas', 'relatorio_notas');
    this.manager.addDocument('pt', 'nfe', 'nfc_e');
    this.manager.addDocument('pt', 'nfce', 'nfc_e');
    this.manager.addDocument('pt', 'nota fiscal', 'emitir_nf');
    this.manager.addDocument('pt', 'emissão de nota', 'emitir_nf');

    // ===== 9. RELATÓRIOS =====
    this.manager.addDocument('pt', 'como ver vendas', 'relatorio_vendas');
    this.manager.addDocument('pt', 'como ver relatórios de caixa', 'relatorio_caixa');
    this.manager.addDocument('pt', 'como baixar relatórios', 'baixar_relatorios');
    this.manager.addDocument('pt', 'todos os planos têm relatórios', 'relatorios_planos');
    this.manager.addDocument('pt', 'relatório financeiro', 'relatorio_financeiro');
    this.manager.addDocument('pt', 'relatório de produtos', 'relatorio_produtos');
    this.manager.addDocument('pt', 'relatório de clientes', 'relatorio_clientes');
    this.manager.addDocument('pt', 'exportar relatório', 'baixar_relatorios');

    // ===== 10. USUÁRIOS E PERMISSÕES =====
    this.manager.addDocument('pt', 'atendente consegue abrir painel administrativo', 'permissao_atendente');
    this.manager.addDocument('pt', 'quem pode acessar delivery', 'permissao_delivery');
    this.manager.addDocument('pt', 'cozinheiro tem acesso ao caixa', 'permissao_cozinheiro');
    this.manager.addDocument('pt', 'permissões de usuário', 'permissao_usuario');
    this.manager.addDocument('pt', 'níveis de acesso', 'permissao_usuario');
    this.manager.addDocument('pt', 'admin', 'permissao_admin');
    this.manager.addDocument('pt', 'gerente', 'permissao_gerente');
    this.manager.addDocument('pt', 'atendente', 'permissao_atendente');
    this.manager.addDocument('pt', 'cozinheiro', 'permissao_cozinheiro');

    // ===== 11. LOGIN E ACESSO =====
    this.manager.addDocument('pt', 'login', 'login');
    this.manager.addDocument('pt', 'entrar', 'login');
    this.manager.addDocument('pt', 'acessar', 'login');
    this.manager.addDocument('pt', 'como fazer login', 'login');
    this.manager.addDocument('pt', 'como entrar', 'login');

    // ===== RESPOSTAS INTELIGENTES =====
    
    // 1. SAUDAÇÕES
    this.manager.addAnswer('pt', 'saudacao', '🎉 Oi! Tudo bem por aí? 😊\n\n✨ Seja muito bem-vindo(a) ao FilaZero! \n\n🤖 Eu sou o Zerinho, seu assistente virtual super animado! Estou aqui para te ajudar com qualquer dúvida sobre o sistema! \n\n💡 Pode perguntar sobre:\n• Cadastros e configurações\n• Como usar o PDV\n• Gestão de produtos e clientes\n• Relatórios e vendas\n• E muito mais!\n\n🚀 Vamos começar? O que você gostaria de saber?');

    // 2. CADASTRO E ACESSO
    this.manager.addAnswer('pt', 'cadastro_sistema', '🎉 Que legal que você quer se juntar ao FilaZero! 🚀\n\n✨ É super fácil criar sua conta:\n\n1️⃣ Clique no botão "Teste Grátis" na página inicial\n2️⃣ Preencha seus dados (nome, email, senha)\n3️⃣ Confirme seu email (verifique a caixa de entrada!)\n4️⃣ Pronto! Sua conta estará ativa! 🎊\n\n💡 É totalmente gratuito e você tem 30 dias para testar sem compromisso!\n\n🤖 Qualquer dúvida, é só me chamar!');
    
    this.manager.addAnswer('pt', 'login', '🔐 Vamos acessar sua conta! É bem rapidinho! 😊\n\n✨ Passo a passo:\n\n1️⃣ Clique em "Acessar Sistema" na página inicial\n2️⃣ Digite seu email e senha\n3️⃣ Clique em "Entrar" e pronto! 🎉\n\n💡 Esqueceu a senha? Sem problemas! Clique em "Esqueci minha senha" que te enviamos um link para redefinir!\n\n🤖 Precisa de ajuda com mais alguma coisa?');
    
    this.manager.addAnswer('pt', 'esqueci_senha', 'Sem problemas! Vou te ajudar a recuperar sua senha! 🔑\n\n1️⃣ Clique em "Esqueci minha senha" na tela de login\n2️⃣ Digite seu email cadastrado\n3️⃣ Verifique sua caixa de entrada\n4️⃣ Clique no link que enviamos\n5️⃣ Crie uma nova senha\n\nSe não receber o email, verifique a pasta de spam!');

    // 3. CADASTROS ESPECÍFICOS
    this.manager.addAnswer('pt', 'cadastro_cliente', '👥 Vamos cadastrar seus clientes! É super fácil! 😊\n\n✨ Passo a passo:\n\n📍 Acesse: Ajuste → Gestão → Clientes\n\n📝 Preencha os dados:\n• Nome completo\n• Telefone/WhatsApp\n• Email (opcional)\n• Endereço (opcional)\n\n✅ Clique em "Salvar" e pronto! 🎉\n\n💡 Dica: Clientes cadastrados aparecem automaticamente no PDV! Bem prático, né? 😄');
    
    this.manager.addAnswer('pt', 'cadastro_produto', '📦 Hora de cadastrar produtos! Vamos organizar seu cardápio! 🍕\n\n✨ Como fazer:\n\n📍 Acesse: Ajuste → Gestão → Produtos\n\n📝 Preencha as informações:\n• Nome do produto\n• Preço de venda\n• Categoria (crie antes se necessário)\n• Descrição (opcional)\n• Foto (opcional)\n\n✅ Clique em "Salvar" e pronto! 🎊\n\n💡 Dica: Crie as categorias primeiro para organizar melhor! Assim fica mais fácil para seus clientes! 😊');
    
    this.manager.addAnswer('pt', 'cadastro_categoria', '🏷️ Vamos organizar seus produtos com categorias! É bem prático! 😄\n\n✨ Como criar:\n\n📍 Acesse: Ajuste → Gestão → Categorias\n\n📝 Preencha:\n• Nome da categoria (ex: Pizzas, Bebidas, Sobremesas)\n• Adicione uma imagem atrativa\n\n✅ Clique em "Salvar" e pronto! 🎉\n\n💡 Dica: Categorias ajudam os clientes a encontrar produtos mais fácil! E fica tudo organizadinho! 😊');
    
    this.manager.addAnswer('pt', 'cadastro_complemento', '🍟 Complementos são a cereja do bolo! Vamos configurar! 😄\n\n✨ Para cadastrar categorias de complementos:\n\n1️⃣ Acesse: Ajuste → Gestão → Produtos\n2️⃣ Edite um produto existente\n3️⃣ Vá para a aba "Complementos"\n4️⃣ Clique em "Adicionar Categoria"\n5️⃣ Configure a categoria:\n• Nome (ex: "Adicionais", "Tamanhos")\n• Quantidade mínima/máxima\n• Se é obrigatório\n\n✅ Clique em "Salvar" e pronto! 🎊\n\n💡 Dica: Depois você adiciona os complementos específicos na categoria! Assim seus clientes podem personalizar os pedidos! 😊');

    // 4. PEDIDOS E VENDAS
    this.manager.addAnswer('pt', 'abrir_pedido', '🛒 Hora de fazer vendas! Vamos abrir um pedido! 😊\n\n✨ É super fácil:\n\n📍 Acesse: Ponto de Atendimento\n\n📝 Passo a passo:\n1️⃣ Selecione a mesa/comanda\n2️⃣ Escolha os produtos\n3️⃣ Adicione complementos se necessário\n4️⃣ Revise o pedido\n5️⃣ Escolha a forma de pagamento\n6️⃣ Finalize a venda\n\n✅ Pronto! O pedido vai direto para a cozinha! 🎉\n\n💡 Dica: É o coração do sistema! Aqui você faz as vendas! 😄');
    
    this.manager.addAnswer('pt', 'mesa_comanda', '🍽️ Vamos entender mesa e comanda! É bem simples! 😊\n\n✨ Como funciona:\n\n🪑 **Mesa**: Para clientes que ficam no local\n• Cada mesa tem um número\n• Pode ter vários pedidos\n• Fecha quando o cliente sai\n\n📋 **Comanda**: Para balcão/takeaway\n• Pedidos individuais\n• Fecha na hora\n• Ideal para delivery\n\n💡 Dica: Use mesa para restaurante e comanda para lanchonete! Assim fica tudo organizado! 😄');
    
    this.manager.addAnswer('pt', 'adicionar_complemento', 'Adicionar complementos é fácil! 🍟\n\n📍 No PDV, quando escolher um produto:\n\n1️⃣ Clique no produto\n2️⃣ Aparecerão os complementos disponíveis\n3️⃣ Marque os desejados\n4️⃣ Veja o preço atualizado\n5️⃣ Adicione ao pedido\n\n💡 Dica: Complementos são configurados em Ajuste → Gestão → Complementos!');
    
    this.manager.addAnswer('pt', 'imprimir_pedido', 'Imprimir pedidos é automático! 🖨️\n\n📍 Após finalizar a venda:\n\n1️⃣ Sistema pergunta se quer imprimir\n2️⃣ Escolha: Comanda para cozinha\n3️⃣ Escolha: Nota fiscal para cliente\n4️⃣ Clique em "Imprimir"\n\n✅ Pronto! Tudo fica salvo digitalmente também!\n\n💡 Dica: Configure sua impressora nas configurações!');

    // 5. CAIXA E FINANCEIRO
    this.manager.addAnswer('pt', 'abrir_caixa', '💰 Hora de abrir o caixa! Vamos começar o dia! 😊\n\n✨ É super importante:\n\n📍 Acesse: Ajuste → Administração → Caixa\n\n📝 Informe:\n• Valor inicial em dinheiro\n• Data e hora\n• Observações (opcional)\n\n✅ Clique em "Abrir Caixa" e pronto! 🎉\n\n💡 Dica: O valor inicial fica registrado para controle! Assim você sabe exatamente quanto tem! 😄');
    
    this.manager.addAnswer('pt', 'fechar_caixa', '📊 Hora de fechar o caixa! Vamos ver como foi o dia! 😊\n\n✨ É bem importante:\n\n📍 Acesse: Ajuste → Administração → Caixa\n\n📊 O sistema calcula automaticamente:\n• Total de vendas do dia\n• Dinheiro em espécie\n• Cartão de crédito/débito\n• PIX\n• Outros pagamentos\n\n✅ Clique em "Fechar Caixa" e confirme! 🎊\n\n💡 Dica: Faça isso todo dia antes de fechar! Assim você controla tudo certinho! 😄');
    
    this.manager.addAnswer('pt', 'registrar_pagamento', 'Registrar pagamentos é automático! 💳\n\n📍 No PDV, ao finalizar a venda:\n\n1️⃣ Escolha a forma de pagamento:\n• Dinheiro\n• Cartão de crédito\n• Cartão de débito\n• PIX\n• Outros\n\n2️⃣ Informe o valor\n3️⃣ Sistema calcula troco automaticamente\n4️⃣ Finalize a venda\n\n✅ Tudo fica registrado no caixa!');

    // 6. COZINHA
    this.manager.addAnswer('pt', 'area_cozinha', '👨‍🍳 Área da cozinha! Onde a magia acontece! 😊\n\n✨ Como funciona:\n\n📍 Acesse: Cozinha (menu principal)\n\n📋 O processo:\n• Pedidos chegam automaticamente do PDV\n• Cozinheiros veem o que precisa ser preparado\n• Marcam como "Em preparo"\n• Marcam como "Pronto" quando terminar\n• Garçom é avisado automaticamente\n\n💡 É como uma comanda digital, mas muito melhor! Bem mais organizado! 😄');
    
    this.manager.addAnswer('pt', 'pedidos_preparo', 'Ver pedidos em preparo é fácil! 🔥\n\n📍 Acesse: Cozinha\n\n📋 Você verá:\n• Lista de todos os pedidos\n• Status de cada item\n• Tempo decorrido\n• Mesa/comanda\n• Observações especiais\n\n✅ Clique em "Em preparo" quando começar\n✅ Clique em "Pronto" quando terminar\n\n💡 Dica: Organize por prioridade!');

    // 7. DELIVERY
    this.manager.addAnswer('pt', 'ativar_delivery', '🚚 Delivery está chegando! Em breve você terá essa funcionalidade! 😊\n\n✨ O que vem por aí:\n\n📍 Em breve você poderá:\n• Ativar delivery no seu estabelecimento\n• Cadastrar entregadores\n• Definir áreas de entrega\n• Acompanhar pedidos em tempo real\n• Calcular frete automaticamente\n\n⏰ Fique ligado nas atualizações! 🎉\n\n💡 Por enquanto, use o sistema normal e organize as entregas manualmente! Assim você já vai se acostumando! 😄');
    
    this.manager.addAnswer('pt', 'delivery_gratuito', '❌ O plano GRATUITO NÃO inclui delivery! 🚫\n\n✅ Para ter delivery, você precisa:\n• Plano Pró (R$ 30/mês)\n• Plano Anual (R$ 288/ano)\n• Plano Vitalício (R$ 399)\n\n💡 Mas você pode testar o delivery por 30 dias grátis no Plano Pró!\n\n🚀 Upgrade seu plano para ter todas as funcionalidades!');

    // 8. PLANOS E PAGAMENTOS
    this.manager.addAnswer('pt', 'teste_gratis_planos', '🎉 Que legal que você quer testar! Temos opções incríveis! 😊\n\n✨ Estes planos têm teste grátis de 30 dias:\n\n🆓 **Plano Gratuito**\n• Sempre gratuito\n• Funcionalidades básicas\n\n💼 **Plano Pró** (R$ 30/mês)\n• 30 dias grátis\n• Todas as funcionalidades\n\n📅 **Plano Anual** (R$ 288/ano)\n• 30 dias grátis\n• 20% de desconto\n\n❌ **Plano Vitalício** (R$ 399)\n• NÃO tem teste grátis\n• Pagamento único\n\n🚀 Comece seu teste hoje mesmo! É super fácil! 😄');
    
    this.manager.addAnswer('pt', 'vitalicio_teste', '❌ O Plano Vitalício NÃO tem teste grátis! 💰\n\n📋 Por quê?\n• É um pagamento único de R$ 399\n• Você paga uma vez e usa para sempre\n• Sem mensalidades\n• Sem renovação\n\n✅ Mas você pode testar com:\n• Plano Pró (30 dias grátis)\n• Plano Anual (30 dias grátis)\n\n💡 Teste primeiro, depois decida se quer o vitalício!');
    
    this.manager.addAnswer('pt', 'custo_mensal', '💰 Custo mensal dos planos:\n\n🆓 **Gratuito**: R$ 0/mês\n• Sempre gratuito\n• Funcionalidades básicas\n\n💼 **Pró**: R$ 30/mês\n• Todas as funcionalidades\n• Suporte prioritário\n• 30 dias grátis\n\n📅 **Anual**: R$ 24/mês (R$ 288/ano)\n• Mesmo do Pró\n• 20% de desconto\n• 30 dias grátis\n\n💎 **Vitalício**: R$ 399 (pagamento único)\n• Mesmo do Pró\n• Sem mensalidades\n• Para sempre\n\n🚀 Comece grátis hoje!');
    
    this.manager.addAnswer('pt', 'diferenca_gratuito', '📊 Diferenças do plano GRATUITO:\n\n✅ **O que TEM:**\n• PDV e pontos de atendimento\n• Gestão de produtos e categorias\n• Controle de clientes\n• Sistema de caixa\n• Relatórios básicos\n• Emissão de NFE e NFC\n• Suporte por email\n\n❌ **O que NÃO TEM:**\n• Sistema de cozinha digital\n• Sistema de delivery\n• Cardápio digital\n• Relatórios avançados\n• Suporte prioritário\n\n💡 Upgrade para o Pró e tenha tudo!');
    
    this.manager.addAnswer('pt', 'mudar_plano', '✅ Sim, você pode mudar de plano a qualquer momento! 🔄\n\n📋 Como fazer:\n1️⃣ Acesse: Configurações → Planos\n2️⃣ Escolha o novo plano\n3️⃣ Confirme a alteração\n4️⃣ Pronto!\n\n💰 **Valores:**\n• Upgrade: Paga a diferença\n• Downgrade: Crédito para próxima cobrança\n• Vitalício: Desconto proporcional\n\n💡 Dica: Teste o Pró por 30 dias antes de decidir!');

    // 9. NOTAS FISCAIS
    this.manager.addAnswer('pt', 'nfc_e', '📄 NFC-e é a Nota Fiscal do Consumidor Eletrônica! 📱\n\n📋 **O que é:**\n• Documento fiscal digital\n• Substitui o cupom fiscal\n• Válido em todo Brasil\n• Armazenado na nuvem\n\n✅ **Vantagens:**\n• Mais rápido que NFe\n• Não precisa de impressora térmica\n• Cliente recebe por email/WhatsApp\n• Controle fiscal automático\n\n💡 Dica: NFC-e é obrigatória para a maioria dos estabelecimentos!');
    
    this.manager.addAnswer('pt', 'emitir_nf', '📄 Emitir nota fiscal é automático! 📱\n\n📍 Após finalizar a venda:\n\n1️⃣ Sistema gera a NFC-e automaticamente\n2️⃣ Envia por email para o cliente\n3️⃣ Envia por WhatsApp (se cadastrado)\n4️⃣ Fica salva no sistema\n5️⃣ Imprime se necessário\n\n✅ Tudo integrado e automático!\n\n💡 Dica: Configure seus dados fiscais nas configurações!');

    // 10. RELATÓRIOS
    this.manager.addAnswer('pt', 'relatorio_vendas', '📊 Ver vendas é super fácil! 📈\n\n📍 Acesse: Histórico → Relatórios\n\n📋 Você verá:\n• Vendas do dia/semana/mês\n• Produtos mais vendidos\n• Faturamento por período\n• Comparativo com períodos anteriores\n• Gráficos e estatísticas\n\n✅ Exporte em PDF ou Excel\n\n💡 Dica: Configure alertas de metas de vendas!');
    
    this.manager.addAnswer('pt', 'relatorios_planos', '📊 Relatórios por plano:\n\n🆓 **Gratuito**:\n• Relatórios básicos\n• Vendas do dia\n• Produtos vendidos\n\n💼 **Pró/Anual/Vitalício**:\n• Todos os relatórios básicos\n• Relatórios avançados\n• Análise de clientes\n• Relatórios de cozinha\n• Relatórios de delivery\n• Exportação em PDF/Excel\n• Gráficos detalhados\n\n💡 Upgrade para ter relatórios completos!');

    // 11. PERMISSÕES
    this.manager.addAnswer('pt', 'permissao_atendente', '👤 Atendente tem acesso limitado! É assim que deve ser! 😊\n\n✨ **Pode acessar:**\n• Ponto de Atendimento (PDV)\n• Cadastro de clientes\n• Vendas e pedidos\n• Relatórios básicos\n\n🚫 **NÃO pode acessar:**\n• Painel administrativo\n• Configurações do sistema\n• Gestão de usuários\n• Relatórios financeiros\n• Configurações de planos\n\n💡 Dica: Configure as permissões em Ajuste → Gestão → Usuários! Assim cada um vê só o que precisa! 😄');
    
    this.manager.addAnswer('pt', 'permissao_delivery', '🚚 Acesso ao delivery por plano:\n\n🆓 **Gratuito**:\n• NÃO tem delivery\n• Acesso negado\n\n💼 **Pró/Anual/Vitalício**:\n• Admin: Acesso total\n• Gerente: Acesso total\n• Atendente: Apenas visualizar pedidos\n• Cozinheiro: Apenas preparar pedidos\n\n💡 Dica: Upgrade para ter delivery!');
    
    this.manager.addAnswer('pt', 'permissao_cozinheiro', '👨‍🍳 Cozinheiro tem acesso limitado! É assim que deve ser! 😊\n\n✨ **Pode acessar:**\n• Área da cozinha\n• Ver pedidos em preparo\n• Marcar como pronto\n• Pedidos de delivery\n\n🚫 **NÃO pode acessar:**\n• Caixa e financeiro\n• Configurações\n• Relatórios\n• Cadastros\n• Painel administrativo\n\n💡 Dica: Foco total na cozinha! Assim ele não se distrai com outras coisas! 😄');

    // RESPOSTAS EXISTENTES (mantidas)
    this.manager.addAnswer('pt', 'o_que_e_filazero', '🎉 O FilaZero é incrível! É um sistema completo de gestão para restaurantes, lanchonetes, bares e comércios alimentícios! 🍕\n\n✨ **O que é:**\n• Sistema de gestão 100% digital\n• PDV (Ponto de Venda) integrado\n• Controle total do seu negócio\n• Fácil de usar e configurar\n\n🚀 **Funcionalidades principais:**\n• PDV digital\n• Gestão de produtos e categorias\n• Controle de clientes\n• Sistema de caixa\n• Relatórios financeiros\n• Cozinha digital\n• Delivery\n• Impressão de notas fiscais\n• E muito mais!\n\n💡 É tudo que você precisa para gerenciar seu restaurante de forma profissional! Bem prático, né? 😊');
    
    this.manager.addAnswer('pt', 'funcionalidades', '🍕 O FilaZero é um sistema completo de gestão! É sensacional! 😊\n\n✨ **Funcionalidades principais:**\n• PDV digital\n• Gestão de produtos e categorias\n• Controle de clientes\n• Sistema de caixa\n• Relatórios financeiros\n• Cozinha digital\n• Delivery\n• Impressão de notas fiscais\n• E muito mais!\n\n💡 É tudo que você precisa para gerenciar seu restaurante! Bem organizado e fácil de usar! 😄');
    
    this.manager.addAnswer('pt', 'ajuda', '🤖 Estou aqui para te ajudar! É só me chamar! 😊\n\n✨ Posso explicar sobre:\n• Como cadastrar produtos e clientes\n• Como abrir e fechar o caixa\n• Como usar o PDV\n• Como funcionam os planos\n• Como emitir notas fiscais\n• E muito mais!\n\n💡 Só me perguntar! O FilaZero é intuitivo, mas sempre estou aqui para te ajudar! 😄');
    
    this.manager.addAnswer('pt', 'problema_tecnico', '🔧 Opa! Algo deu errado! Sem problemas! 😊\n\n✨ Só um momento! Vou chamar alguém do suporte técnico para te ajudar com esse problema. Eles são especialistas e vão resolver rapidinho! \n\n💡 Enquanto isso, você pode tentar:\n• Atualizar a página\n• Fazer login novamente\n• Verificar sua conexão\n\n🤖 Qualquer coisa, é só me chamar!');
    
    this.manager.addAnswer('pt', 'contato', '📞 Quer falar com a gente? É super fácil! 😊\n\n✨ Você pode nos contatar por:\n\n📧 **Email**: adoniasgoes86@gmail.com\n📱 **WhatsApp**: (43) 99961-8852\n\n💡 Nossa equipe está sempre disponível para te ajudar! É só chamar! 😄');

    // Treinando o modelo
    await this.manager.train();
    this.isTrained = true;
    console.log('✅ Zerinho AI - Modelo treinado com sucesso!');
  }

  async processMessage(message) {
    if (!this.isTrained) {
      await this.initialize();
    }

    try {
      const response = await this.manager.process('pt', message);
      
      // Se não encontrou uma intenção específica, retorna resposta padrão
      if (!response.answer || response.answer === 'None') {
        return "Interessante! Me conta mais sobre o que você precisa? Posso te ajudar com cadastros, configurações, uso do sistema, ou qualquer dúvida sobre o FilaZero! 😊";
      }

      return response.answer;
    } catch (error) {
      console.error('❌ Erro no Zerinho AI:', error);
      return "Ops! Algo deu errado aqui. Vou chamar alguém do suporte técnico para te ajudar! 🔧";
    }
  }
}

export default new ZerinhoAI();
