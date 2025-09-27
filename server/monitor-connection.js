import { checkConnectionHealth, closePool } from './config/db.js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

let isMonitoring = true;
let checkCount = 0;

async function monitorConnection() {
  while (isMonitoring) {
    checkCount++;
    const timestamp = new Date().toISOString();
    
    try {
      const isHealthy = await checkConnectionHealth();
      
      if (isHealthy) {
        console.log(`✅ [${timestamp}] Check #${checkCount}: Conexão saudável`);
      } else {
        console.log(`❌ [${timestamp}] Check #${checkCount}: Conexão não saudável`);
      }
      
    } catch (error) {
      console.log(`💥 [${timestamp}] Check #${checkCount}: Erro - ${error.message}`);
    }
    
    // Aguardar 10 segundos antes do próximo check
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Parando monitoramento...');
  isMonitoring = false;
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Parando monitoramento...');
  isMonitoring = false;
  await closePool();
  process.exit(0);
});

console.log('🔍 Iniciando monitoramento de conexão (Ctrl+C para parar)...');
monitorConnection();























