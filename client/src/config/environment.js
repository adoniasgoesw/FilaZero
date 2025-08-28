// Configuração de ambiente otimizada
class EnvironmentConfig {
  constructor() {
    this.validateEnvironment();
  }

  // Validar variáveis de ambiente obrigatórias
  validateEnvironment() {
    const requiredVars = ['VITE_API_URL'];
    const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️ Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
    }
  }

  // Obter URL da API
  get apiUrl() {
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  // Verificar se está em desenvolvimento
  get isDevelopment() {
    return import.meta.env.MODE === 'development';
  }

  // Verificar se está em produção
  get isProduction() {
    return import.meta.env.MODE === 'production';
  }

  // Verificar se está em preview
  get isPreview() {
    return import.meta.env.MODE === 'preview';
  }

  // Obter versão da aplicação
  get version() {
    return import.meta.env.VITE_APP_VERSION || '1.0.0';
  }

  // Obter nome da aplicação
  get appName() {
    return import.meta.env.VITE_APP_NAME || 'FilaZero';
  }

  // Obter configurações de debug
  get debug() {
    return {
      enabled: this.isDevelopment,
      apiUrl: this.apiUrl,
      mode: import.meta.env.MODE,
      version: this.version
    };
  }

  // Obter configurações de CORS
  get cors() {
    return {
      origin: this.isProduction 
        ? ['https://filazero.netlify.app']
        : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true
    };
  }

  // Obter configurações de timeout
  get timeout() {
    return {
      api: 30000, // 30 segundos
      upload: 60000, // 1 minuto
      auth: 300000 // 5 minutos
    };
  }

  // Obter configurações de cache
  get cache() {
    return {
      ttl: 5 * 60 * 1000, // 5 minutos
      maxSize: 100, // Máximo de 100 itens
      enabled: true
    };
  }

  // Obter configurações de paginação
  get pagination() {
    return {
      defaultPageSize: 20,
      maxPageSize: 100,
      pageSizeOptions: [10, 20, 50, 100]
    };
  }

  // Obter configurações de upload
  get upload() {
    return {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxFiles: 10
    };
  }

  // Obter configurações de segurança
  get security() {
    return {
      sessionTimeout: 30 * 60 * 1000, // 30 minutos
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutos
      requirePasswordChange: 90 * 24 * 60 * 60 * 1000 // 90 dias
    };
  }

  // Obter configurações de notificação
  get notification() {
    return {
      position: 'top-right',
      autoClose: 5000,
      maxNotifications: 5
    };
  }

  // Obter configurações de tema
  get theme() {
    return {
      primary: '#3B82F6',
      secondary: '#6B7280',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#06B6D4'
    };
  }

  // Obter configurações de responsividade
  get responsive() {
    return {
      breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
      }
    };
  }

  // Obter configurações de performance
  get performance() {
    return {
      lazyLoading: true,
      imageOptimization: true,
      codeSplitting: true,
      serviceWorker: this.isProduction
    };
  }

  // Obter configurações de analytics
  get analytics() {
    return {
      enabled: this.isProduction,
      trackingId: import.meta.env.VITE_GA_TRACKING_ID,
      debug: this.isDevelopment
    };
  }

  // Obter configurações de monitoramento
  get monitoring() {
    return {
      enabled: this.isProduction,
      endpoint: import.meta.env.VITE_MONITORING_ENDPOINT,
      sampleRate: 0.1 // 10% das sessões
    };
  }

  // Obter configurações de backup
  get backup() {
    return {
      enabled: this.isProduction,
      frequency: 'daily',
      retention: 30 // 30 dias
    };
  }

  // Obter configurações de log
  get logging() {
    return {
      level: this.isDevelopment ? 'debug' : 'error',
      maxSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5
    };
  }

  // Obter configurações de teste
  get testing() {
    return {
      enabled: this.isDevelopment,
      coverage: 80,
      timeout: 10000
    };
  }

  // Obter configurações de deploy
  get deploy() {
    return {
      environment: import.meta.env.VITE_DEPLOY_ENV || 'development',
      region: import.meta.env.VITE_DEPLOY_REGION || 'us-east-1',
      version: this.version
    };
  }

  // Obter todas as configurações
  getAll() {
    return {
      apiUrl: this.apiUrl,
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
      isPreview: this.isPreview,
      version: this.version,
      appName: this.appName,
      debug: this.debug,
      cors: this.cors,
      timeout: this.timeout,
      cache: this.cache,
      pagination: this.pagination,
      upload: this.upload,
      security: this.security,
      notification: this.notification,
      theme: this.theme,
      responsive: this.responsive,
      performance: this.performance,
      analytics: this.analytics,
      monitoring: this.monitoring,
      backup: this.backup,
      logging: this.logging,
      testing: this.testing,
      deploy: this.deploy
    };
  }
}

// Instância global da configuração
const config = new EnvironmentConfig();

export default config;
