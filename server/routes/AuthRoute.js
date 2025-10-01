import express from 'express';
import loginController from '../controllers/login.js';
import categoriasController from '../controllers/categorias.js';
import produtosController from '../controllers/produtos.js';
import upload from '../middlewares/cloudinaryUpload.js';
import pontosConfigController from '../controllers/pontosConfig.js';
import fetch from 'node-fetch';
import * as atendimentosController from '../controllers/atendimentos.js';
import * as pedidosController from '../controllers/pedidos.js';
import registerController from '../controllers/register.js';
import caixasController from '../controllers/caixas.js';
import clientesController from '../controllers/clientes.js';
import pagamentosController from '../controllers/pagamentos.js';
import * as estabelecimentosController from '../controllers/estabelecimentos.js';
import * as chatController from '../controllers/chat.js';

const router = express.Router();

// ===== ROTAS DE AUTENTICAÇÃO =====
// Rota de login
router.post('/login', loginController.login);
// Rota de registro (pública)
router.post('/register', registerController.register);

// Rota para obter dados do usuário logado (requer autenticação)
router.get('/usuario', loginController.verificarToken, loginController.getUsuarioLogado);

// ===== ROTAS DE CATEGORIAS =====
// Rota para cadastrar categoria (requer autenticação)
router.post('/categorias', loginController.verificarToken, upload.single('imagem'), categoriasController.cadastrar);

// Rota para listar categorias por estabelecimento (para dropdown de produtos) - DEVE VIR ANTES da rota genérica
router.get('/categorias-dropdown/:estabelecimento_id', produtosController.listarCategorias);

// Rota para listar categorias por estabelecimento
router.get('/categorias/:estabelecimento_id', categoriasController.listarPorEstabelecimento);

// Rota para editar categoria (requer autenticação)
router.put('/categorias/:id', loginController.verificarToken, upload.single('imagem'), categoriasController.editar);

// Rota para deletar categoria (requer autenticação)
router.delete('/categorias/:id', loginController.verificarToken, categoriasController.deletar);

// Rota para alterar status da categoria (requer autenticação)
router.put('/categorias/:id/status', loginController.verificarToken, categoriasController.alterarStatus);

// ===== ROTAS DE PRODUTOS =====
// Rota para listar produtos por estabelecimento
router.get('/produtos/:estabelecimento_id', produtosController.listarPorEstabelecimento);

// Rota para cadastrar produto (requer autenticação)
router.post('/produtos', loginController.verificarToken, upload.single('imagem'), produtosController.cadastrar);

// Rota para editar produto (requer autenticação)
router.put('/produtos/:id', loginController.verificarToken, upload.single('imagem'), produtosController.editar);

// Rota para deletar produto (requer autenticação)
router.delete('/produtos/:id', loginController.verificarToken, produtosController.deletar);

// Rota para alterar status do produto (requer autenticação)
router.put('/produtos/:id/status', loginController.verificarToken, produtosController.alterarStatus);

// Rota para listar produtos com categorias de complementos (para cópia)
router.get('/produtos-com-categorias-complementos/:estabelecimento_id', loginController.verificarToken, produtosController.listarProdutosComCategoriasComplementos);

// ===== ROTAS DE CONFIGURAÇÃO DE PONTOS DE ATENDIMENTO =====
// Obter configuração por estabelecimento
router.get('/pontos-atendimento/config/:estabelecimento_id', loginController.verificarToken, pontosConfigController.getConfig);

// Criar configuração (com defaults) caso não exista
router.post('/pontos-atendimento/config/:estabelecimento_id', loginController.verificarToken, pontosConfigController.createOrEnsureDefaults);

// Atualizar configuração
router.put('/pontos-atendimento/config/:estabelecimento_id', loginController.verificarToken, pontosConfigController.updateConfig);

// Deletar configuração (opcional)
router.delete('/pontos-atendimento/config/:estabelecimento_id', loginController.verificarToken, pontosConfigController.deleteConfig);

// Listar pontos com base na configuração
router.get('/pontos-atendimento/:estabelecimento_id', loginController.verificarToken, pontosConfigController.listPoints);

// ===== ROTAS DE ATENDIMENTOS =====
// Tornar ensure e setStatus públicos para permitir salvar sem login no PDV
router.post('/atendimentos/ensure/:estabelecimento_id/:identificador', atendimentosController.ensureAtendimento);
router.put('/atendimentos/:estabelecimento_id/:identificador/nome', loginController.verificarToken, atendimentosController.updateNomePonto);
router.patch('/atendimentos/:estabelecimento_id/:identificador/nome', loginController.verificarToken, atendimentosController.updateNomePonto);
router.get('/atendimentos/:estabelecimento_id/:identificador/status', atendimentosController.getStatus);
router.put('/atendimentos/:estabelecimento_id/:identificador/status', atendimentosController.setStatus);

// ===== ROTAS DE PEDIDOS =====
// Detalhes de um pedido específico (DEVE VIR ANTES das rotas genéricas)
router.get('/pedidos/detalhes/:pedido_id', loginController.verificarToken, pedidosController.getDetalhesPedido);

// ROTAS ESPECÍFICAS DEVEM VIR ANTES DAS GENÉRICAS
// Listar itens do pedido com complementos (DEVE VIR ANTES da rota genérica)
router.get('/pedidos/:estabelecimento_id/:identificador/itens', (req, res, next) => {
  console.log('🔍 Rota /pedidos/:estabelecimento_id/:identificador/itens chamada');
  console.log('📝 Parâmetros:', req.params);
  console.log('🌐 URL completa:', req.originalUrl);
  next();
}, pedidosController.listarItensPedido);

// Buscar pagamentos existentes de um pedido (DEVE VIR ANTES da rota genérica)
router.get('/pedidos/:estabelecimento_id/:identificador/pagamentos', pedidosController.buscarPagamentosPedido);

// Atualizar cliente do pedido (DEVE VIR ANTES da rota genérica)
router.put('/pedidos/:estabelecimento_id/:identificador/cliente', pedidosController.atualizarClientePedido);

// Atualizar desconto do pedido (DEVE VIR ANTES da rota genérica)
router.put('/pedidos/:estabelecimento_id/:identificador/discount', pedidosController.atualizarDescontoPedido);

// Atualizar acréscimo do pedido (DEVE VIR ANTES da rota genérica)
router.put('/pedidos/:estabelecimento_id/:identificador/surcharge', pedidosController.atualizarAcrescimoPedido);

// Atualizar valores de pagamento e troco do pedido (DEVE VIR ANTES da rota genérica)
router.put('/pedidos/:estabelecimento_id/:identificador/payment', pedidosController.atualizarValoresPagamento);

// Criar pedido vazio quando acessar ponto de atendimento (DEVE VIR ANTES da rota genérica)
router.post('/pedidos/:estabelecimento_id/:identificador/criar', pedidosController.criarPedidoVazio);

// Finalizar pedido (DEVE VIR ANTES da rota genérica)
router.post('/pedidos/:estabelecimento_id/:identificador/finalizar', pedidosController.finalizarPedido);

// ROTAS GENÉRICAS (DEVEM VIR POR ÚLTIMO)
// Tornar rotas de pedidos públicas para permitir uso sem autenticação no PDV
router.put('/pedidos/:estabelecimento_id/:identificador', pedidosController.upsertPedido);
router.get('/pedidos/:estabelecimento_id/:identificador', pedidosController.getPedido);
router.delete('/pedidos/:estabelecimento_id/:identificador', pedidosController.deletePedido);

// Deletar item específico
router.delete('/pedidos/itens/:item_id', pedidosController.deleteItem);
// Criar/obter pagamento composto
router.post('/pedidos/:estabelecimento_id/pagamento-composto', pedidosController.criarOuObterPagamentoComposto);
// Criar pagamento composto padrão
router.post('/pedidos/:estabelecimento_id/pagamento-composto-padrao', pedidosController.criarPagamentoCompostoPadrao);
// Histórico de pedidos por estabelecimento (opcionalmente a partir de uma data)
router.get('/historico-pedidos/:estabelecimento_id', loginController.verificarToken, pedidosController.listarHistorico);

// Rota para listar pagamentos históricos por caixa
router.get('/pagamentos-historico/:caixa_id', loginController.verificarToken, pedidosController.listarPagamentosHistorico);

// Complementos dos itens do pedido
router.post('/pedidos/itens/:item_pedido_id/complementos', pedidosController.addItemComplementos);
router.get('/pedidos/itens/:item_pedido_id/complementos', pedidosController.listItemComplementos);

// ===== ROTAS DE CATEGORIAS DE COMPLEMENTOS =====
// Rota para cadastrar categoria de complementos (requer autenticação)
router.post('/categorias-complementos', loginController.verificarToken, produtosController.cadastrarCategoriaComplemento);

// Rota para listar categorias de complementos por produto
router.get('/categorias-complementos/:produto_id', produtosController.listarCategoriasComplementos);

// Rota para editar categoria de complementos (requer autenticação)
router.put('/categorias-complementos/:id', loginController.verificarToken, produtosController.editarCategoriaComplemento);

// Rota para deletar categoria de complementos (requer autenticação)
router.delete('/categorias-complementos/:id', loginController.verificarToken, produtosController.deletarCategoriaComplemento);

// ===== ROTAS DE COMPLEMENTOS =====
// Rota para cadastrar complemento (requer autenticação)
router.post('/complementos', loginController.verificarToken, produtosController.cadastrarComplemento);

// Rota para listar complementos por estabelecimento
router.get('/complementos/:estabelecimento_id', produtosController.listarComplementos);

// Rota para editar complemento (requer autenticação)
router.put('/complementos/:id', loginController.verificarToken, produtosController.editarComplemento);

// Rota para alterar status do complemento
router.put('/complementos/:id/status', produtosController.alterarStatusComplemento);

// Rota para deletar complemento (requer autenticação)
router.delete('/complementos/:id', loginController.verificarToken, produtosController.deletarComplemento);

// ===== ROTAS DE ITENS COMPLEMENTOS =====
// Rota para salvar complementos em uma categoria
router.post('/itens-complementos', loginController.verificarToken, produtosController.salvarItensComplementos);

// Rota para listar complementos de uma categoria
router.get('/itens-complementos/categoria/:categoria_id', produtosController.listarItensComplementos);

// Rota para deletar um item complemento específico
router.delete('/itens-complementos/:id', loginController.verificarToken, produtosController.deletarItemComplemento);

// ===== ROTAS DE CAIXAS (HISTÓRICO) =====
router.post('/caixas', loginController.verificarToken, caixasController.abrir);
router.get('/caixas/:estabelecimento_id', loginController.verificarToken, caixasController.listarPorEstabelecimento);
router.get('/caixas/aberto/:estabelecimento_id', loginController.verificarToken, caixasController.getAberto);
router.post('/caixas/fechar', loginController.verificarToken, caixasController.fechar);
router.post('/caixas/entrada', loginController.verificarToken, caixasController.adicionarEntrada);
router.post('/caixas/saida', loginController.verificarToken, caixasController.adicionarSaida);
router.get('/caixas/movimentacoes/:estabelecimento_id', loginController.verificarToken, caixasController.listarMovimentacoes);
router.get('/movimentacoes-caixa/:caixa_id', loginController.verificarToken, caixasController.listarMovimentacoesPorCaixa);
router.get('/caixas/detalhes/:caixa_id', loginController.verificarToken, caixasController.getDetalhes);

// ===== ROTAS DE CLIENTES =====
// Rota para cadastrar cliente (requer autenticação)
router.post('/clientes', loginController.verificarToken, clientesController.cadastrar);

// Rota para listar clientes por estabelecimento
router.get('/clientes/:estabelecimento_id', loginController.verificarToken, clientesController.listarPorEstabelecimento);
router.get('/clientes/:estabelecimento_id/:id', loginController.verificarToken, clientesController.buscarPorId);

// Rota para editar cliente (requer autenticação)
router.put('/clientes/:id', loginController.verificarToken, clientesController.editar);

// Rota para deletar cliente (requer autenticação)
router.delete('/clientes/:id', loginController.verificarToken, clientesController.deletar);

// Rota para alterar status do cliente (requer autenticação)
router.put('/clientes/:id/status', loginController.verificarToken, clientesController.alterarStatus);

// ===== ROTAS DE PAGAMENTOS =====
// Rota para cadastrar forma de pagamento (requer autenticação)
router.post('/pagamentos', loginController.verificarToken, pagamentosController.cadastrar);

// Rota para listar formas de pagamento por estabelecimento
router.get('/pagamentos/:estabelecimento_id', loginController.verificarToken, pagamentosController.listarPorEstabelecimento);

// Rota para editar forma de pagamento (requer autenticação)
router.put('/pagamentos/:id', loginController.verificarToken, pagamentosController.editar);

// Rota para deletar forma de pagamento (requer autenticação)
router.delete('/pagamentos/:id', loginController.verificarToken, pagamentosController.deletar);

// Rota para alterar status da forma de pagamento (requer autenticação)
router.put('/pagamentos/:id/status', loginController.verificarToken, pagamentosController.alterarStatus);

// Rota para buscar pagamentos de um pedido específico
router.get('/pagamentos/pedido/:pedido_id', loginController.verificarToken, pagamentosController.buscarPagamentosPorPedido);

// Rota para excluir pagamento específico de um pedido
router.delete('/pagamentos/pedido/:pedido_id/:pagamento_id', loginController.verificarToken, pagamentosController.excluirPagamentoDoPedido);

// Rota para atualizar valor de pagamento específico de um pedido
router.put('/pagamentos/pedido/:pedido_id/:pagamento_id', loginController.verificarToken, pagamentosController.atualizarPagamentoDoPedido);

// Rota para listar histórico de pagamentos por caixa
router.get('/pagamentos/historico/caixa/:caixa_id', loginController.verificarToken, pagamentosController.listarHistoricoPorCaixa);

// ===== ROTAS DE ESTABELECIMENTOS =====
// Rota para buscar dados do estabelecimento do usuário logado
router.get('/estabelecimento/meu', loginController.verificarToken, estabelecimentosController.getEstabelecimentoUsuario);

// Rota para buscar dados de um estabelecimento específico por ID
router.get('/estabelecimento/:id', loginController.verificarToken, estabelecimentosController.getEstabelecimento);

// Rota para atualizar dados do estabelecimento do usuário logado
router.put('/estabelecimento/meu', loginController.verificarToken, estabelecimentosController.updateEstabelecimento);

// ===== ROTA PARA BUSCAR IMAGENS =====
// Rota para buscar sugestões de imagens via Google Custom Search
router.get('/buscar-imagens', async (req, res) => {
  try {
    const query = req.query.q; // palavra-chave do usuário
    
    if (!query || query.trim().length < 2) {
      return res.json({ 
        success: true, 
        imagens: [] 
      });
    }

    const API_KEY = "AIzaSyA6zCjMUOSZJ5ZIB3yjAOxboCMxz7R-H_Q";
    const CSE_ID = "859f0f1be01a14e3c";

    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query.trim())}&cx=${CSE_ID}&searchType=image&num=10&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('Erro da API do Google:', data.error);
      return res.status(500).json({ 
        success: false, 
        error: "Erro ao buscar imagens" 
      });
    }

    const imagens = data.items?.map(item => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink || item.link,
      title: item.title || '',
      context: item.image?.contextLink || '',
      // Adicionar informações de validação
      isValid: true,
      checked: false
    })) || [];

    res.json({ 
      success: true, 
      imagens 
    });

  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    res.status(500).json({ 
      success: false, 
      error: "Erro interno ao buscar imagens" 
    });
  }
});

// ===== ROTA PARA PROXY DE IMAGENS =====
// Rota para servir imagens através de proxy (evita problemas de CORS)
router.get('/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    
    if (!imageUrl) {
      return res.status(400).json({ 
        success: false, 
        error: "URL da imagem é obrigatória" 
      });
    }

    // Fazer fetch da imagem
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return res.status(404).json({ 
        success: false, 
        error: "Imagem não encontrada" 
      });
    }

    // Obter o tipo de conteúdo da imagem
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Definir headers para cache e CORS
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    // Pipe da resposta da imagem para o cliente
    response.body.pipe(res);

  } catch (error) {
    console.error('Erro no proxy de imagem:', error);
    res.status(500).json({ 
      success: false, 
      error: "Erro interno ao carregar imagem" 
    });
  }
});

// ===== ROTA FALE CONOSCO (PÚBLICA) =====
// Rota para receber mensagens do formulário "Fale Conosco"
router.post('/contato', async (req, res) => {
  try {
    const { nome, email, whatsapp, restaurante, mensagem } = req.body;

    console.log('📧 Dados recebidos do formulário:', { nome, email, whatsapp, restaurante, mensagem });

    // Validação básica dos campos obrigatórios
    if (!nome || !email || !mensagem) {
      console.log('❌ Validação falhou: campos obrigatórios ausentes');
      return res.status(400).json({
        success: false,
        message: 'Nome, email e mensagem são obrigatórios'
      });
    }

    console.log('✅ Validação passou, configurando nodemailer...');

    // Importar nodemailer dinamicamente
    const nodemailer = await import('nodemailer');

    // Configurar o transporter do Gmail
    console.log('🔧 Configurando transporter do Gmail...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'adoniasgoes86@gmail.com',
        pass: 'ioazwrmbvenxeyxp' // Senha de app do Gmail
      }
    });

    console.log('✅ Transporter configurado, testando conexão...');
    
    // Testar a conexão
    try {
      await transporter.verify();
      console.log('✅ Conexão com Gmail verificada com sucesso');
    } catch (verifyError) {
      console.error('❌ Erro ao verificar conexão com Gmail:', verifyError);
      throw new Error('Falha na configuração do e-mail: ' + verifyError.message);
    }

    // Configurar o e-mail
    const mailOptions = {
      from: '"Fale Conosco - FilaZero" <adoniasgoes86@gmail.com>',
      to: 'adoniasgoes86@gmail.com',
      subject: `Nova mensagem do formulário de contato - ${nome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            📧 Nova Mensagem do Formulário de Contato
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Informações do Contato:</h3>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>WhatsApp:</strong> ${whatsapp || 'Não informado'}</p>
            <p><strong>Restaurante:</strong> ${restaurante || 'Não informado'}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Mensagem:</h3>
            <p style="line-height: 1.6; color: #4b5563;">${mensagem}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>💡 Dica:</strong> Responda diretamente para o email: ${email}
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Esta mensagem foi enviada através do formulário de contato do FilaZero PDV</p>
            <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      `
    };

    console.log('📤 Enviando e-mail...');
    
    // Enviar o e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ E-mail enviado com sucesso:', info.messageId);

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
    });

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor. Tente novamente mais tarde.',
      error: error.message
    });
  }
});

router.post('/fale-conosco', async (req, res) => {
  try {
    const { nome, email, whatsapp, restaurante, mensagem } = req.body;

    console.log('📧 Dados recebidos do formulário:', { nome, email, whatsapp, restaurante, mensagem });

    // Validação básica dos campos obrigatórios
    if (!nome || !email || !mensagem) {
      console.log('❌ Validação falhou: campos obrigatórios ausentes');
      return res.status(400).json({
        success: false,
        message: 'Nome, email e mensagem são obrigatórios'
      });
    }

    console.log('✅ Validação passou, configurando nodemailer...');

    // Importar nodemailer dinamicamente
    const nodemailer = await import('nodemailer');

    // Configurar o transporter do Gmail
    console.log('🔧 Configurando transporter do Gmail...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'adoniasgoes86@gmail.com',
        pass: 'ioazwrmbvenxeyxp' // Senha de app do Gmail
      }
    });

    console.log('✅ Transporter configurado, testando conexão...');
    
    // Testar a conexão
    try {
      await transporter.verify();
      console.log('✅ Conexão com Gmail verificada com sucesso');
    } catch (verifyError) {
      console.error('❌ Erro ao verificar conexão com Gmail:', verifyError);
      throw new Error('Falha na configuração do e-mail: ' + verifyError.message);
    }

    // Configurar o e-mail
    const mailOptions = {
      from: '"Fale Conosco - FilaZero" <adoniasgoes86@gmail.com>',
      to: 'adoniasgoes86@gmail.com',
      subject: `Nova mensagem de ${nome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Nova mensagem do formulário "Fale Conosco"
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Dados do Cliente:</h3>
            <p><strong>Nome:</strong> ${nome}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>WhatsApp:</strong> ${whatsapp || 'Não informado'}</p>
            <p><strong>Restaurante:</strong> ${restaurante || 'Não informado'}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #1e40af; margin-top: 0;">Mensagem:</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${mensagem}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #2563eb; border-radius: 4px;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>Enviado em:</strong> ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      `
    };

    // Enviar o e-mail
    console.log('📤 Enviando e-mail...');
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ E-mail enviado com sucesso!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Dados da mensagem:', { nome, email, whatsapp, restaurante });

    res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
    });

  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // Determinar o tipo de erro
    let errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
    
    if (error.message.includes('Invalid login')) {
      errorMessage = 'Erro de autenticação do e-mail. Verifique as credenciais.';
    } else if (error.message.includes('ENOTFOUND')) {
      errorMessage = 'Erro de conexão. Verifique sua internet.';
    } else if (error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Servidor de e-mail indisponível.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== ROTAS DE CHAT (ZERINHO AI) =====
// Rota para processar mensagens do chat (pública)
router.post('/chat', chatController.processMessage);

// Rota para obter status da IA (pública)
router.get('/chat/status', chatController.getStatus);

export default router;
