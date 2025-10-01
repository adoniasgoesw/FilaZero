import zerinhoAI from '../services/zerinhoAI.js';

// Endpoint para processar mensagens do chat
const processMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Mensagem é obrigatória e deve ser uma string'
      });
    }

    console.log('🤖 Zerinho AI - Processando mensagem:', message);

    // Processar mensagem com IA
    const response = await zerinhoAI.processMessage(message);

    console.log('🤖 Zerinho AI - Resposta:', response);

    res.json({
      success: true,
      data: {
        message: response,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro no endpoint de chat:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Endpoint para obter status da IA
const getStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'online',
        name: 'Zerinho',
        version: '1.0.0',
        trained: zerinhoAI.isTrained
      }
    });
  } catch (error) {
    console.error('❌ Erro ao obter status da IA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export {
  processMessage,
  getStatus
};
