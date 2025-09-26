import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import './styles/animations.css'
import AppRoute from './routes/AppRoute.jsx'
import printService from './services/printService.js'
import { CacheProvider } from './contexts/CacheContext.jsx'

// Listener para impressão de nota fiscal
window.addEventListener('printInvoice', async (event) => {
  try {
    const { pedido, itens, cliente } = event.detail;
    
    if (pedido && itens) {
      // Adicionar dados do cliente ao pedido se disponível
      if (cliente) {
        pedido.cliente_nome = cliente.nome;
        pedido.cliente_nome_real = cliente.nome;
      }
      
      // Gerar e imprimir a nota fiscal
      const result = await printService.printPedido(pedido, itens);
      
      if (result.success) {
        console.log('✅ Nota fiscal impressa com sucesso!');
      } else {
        console.error('❌ Erro ao imprimir nota fiscal:', result.message);
      }
    }
  } catch (error) {
    console.error('❌ Erro no listener de impressão:', error);
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CacheProvider>
      <AppRoute />
    </CacheProvider>
  </StrictMode>,
)
