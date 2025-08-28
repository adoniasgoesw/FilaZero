// Sistema de logging estruturado
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Log de informação
  info(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.log(`ℹ️ ${message}`, data);
      } else {
        console.log(`ℹ️ ${message}`);
      }
    }
  }

  // Log de sucesso
  success(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.log(`✅ ${message}`, data);
      } else {
        console.log(`✅ ${message}`);
      }
    }
  }

  // Log de warning
  warn(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.warn(`⚠️ ${message}`, data);
      } else {
        console.warn(`⚠️ ${message}`);
      }
    }
  }

  // Log de erro
  error(message, error = null) {
    if (this.isDevelopment) {
      if (error) {
        console.error(`❌ ${message}`, error);
      } else {
        console.error(`❌ ${message}`);
      }
    }
    
    // Em produção, enviar para serviço de monitoramento
    if (this.isProduction && error) {
      // TODO: Implementar envio para serviço de monitoramento
      // this.sendToMonitoringService(message, error);
    }
  }

  // Log de debug (só em desenvolvimento)
  debug(message, data = null) {
    if (this.isDevelopment) {
      if (data) {
        console.log(`🔍 ${message}`, data);
      } else {
        console.log(`🔍 ${message}`);
      }
    }
  }

  // Log de performance
  time(label) {
    if (this.isDevelopment) {
      console.time(`⏱️ ${label}`);
    }
  }

  timeEnd(label) {
    if (this.isDevelopment) {
      console.timeEnd(`⏱️ ${label}`);
    }
  }
}

// Instância global do logger
const logger = new Logger();

export default logger;
