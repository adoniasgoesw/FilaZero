import logger from './logger.js';

// Sistema de tratamento de erros centralizado
export class ErrorHandler {
  // Tratar erros de API
  static handleApiError(error, context = '') {
    let message = 'Erro interno do servidor';
    let status = 500;

    if (error.response) {
      // Erro da API
      status = error.response.status;
      message = error.response.data?.message || this.getDefaultMessage(status);
      
      logger.error(`Erro de API ${status}: ${message}`, {
        context,
        status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data
      });
    } else if (error.request) {
      // Erro de rede
      message = 'Erro de conexão. Verifique sua internet.';
      logger.error('Erro de rede', {
        context,
        error: error.message
      });
    } else {
      // Erro local
      message = error.message || 'Erro inesperado';
      logger.error('Erro local', {
        context,
        error: error.message
      });
    }

    return {
      message,
      status,
      isNetworkError: !error.response,
      isApiError: !!error.response
    };
  }

  // Obter mensagem padrão baseada no status
  static getDefaultMessage(status) {
    const messages = {
      400: 'Dados inválidos enviados',
      401: 'Acesso não autorizado',
      403: 'Acesso negado',
      404: 'Recurso não encontrado',
      409: 'Conflito de dados',
      422: 'Dados inválidos',
      429: 'Muitas requisições. Tente novamente em breve.',
      500: 'Erro interno do servidor',
      502: 'Serviço temporariamente indisponível',
      503: 'Serviço em manutenção',
      504: 'Timeout da requisição'
    };

    return messages[status] || 'Erro desconhecido';
  }

  // Tratar erros de validação
  static handleValidationError(errors, context = '') {
    logger.warn('Erro de validação', {
      context,
      errors
    });

    return {
      message: 'Dados inválidos. Verifique os campos destacados.',
      errors,
      isValidationError: true
    };
  }

  // Tratar erros de autenticação
  static handleAuthError(error, context = '') {
    logger.error('Erro de autenticação', {
      context,
      error: error.message
    });

    return {
      message: 'Sessão expirada. Faça login novamente.',
      isAuthError: true,
      shouldRedirect: true
    };
  }

  // Tratar erros de upload
  static handleUploadError(error, context = '') {
    logger.error('Erro de upload', {
      context,
      error: error.message
    });

    return {
      message: 'Erro ao fazer upload do arquivo. Tente novamente.',
      isUploadError: true
    };
  }

  // Função para mostrar erro ao usuário
  static showErrorToUser(error, context = '') {
    const errorInfo = this.handleApiError(error, context);
    
    // Aqui você pode integrar com seu sistema de notificação
    // Por exemplo, mostrar um toast ou modal de erro
    
    return errorInfo;
  }

  // Função para log de erro em produção
  static logProductionError(error, context = '') {
    if (process.env.NODE_ENV === 'production') {
      // Em produção, enviar para serviço de monitoramento
      // this.sendToMonitoringService(error, context);
      
      // Por enquanto, apenas log local
      logger.error('Erro em produção', {
        context,
        error: error.message,
        stack: error.stack
      });
    }
  }
}

export default ErrorHandler;
