import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePagamentos } from '../contexts/CacheContext';

export const usePainelPagamentos = (estabelecimentoId) => {
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);
  
  // Usar hook de cache
  const { pagamentos, loadPagamentos } = usePagamentos(estabelecimentoId);

  // Carregar dados do cache
  useEffect(() => {
    if (estabelecimentoId) {
      loadPagamentos();
    }
  }, [estabelecimentoId, loadPagamentos]);

  // Selecionar pagamento
  const selecionarPagamento = useCallback((pagamento) => {
    setPagamentoSelecionado(pagamento);
  }, []);

  // Limpar seleção de pagamento
  const limparSelecaoPagamento = useCallback(() => {
    setPagamentoSelecionado(null);
  }, []);

  // Obter formas de pagamento ativas
  const formasPagamentoAtivas = useMemo(() => {
    return pagamentos.filter(pagamento => pagamento.status === true);
  }, [pagamentos]);

  return {
    // Dados
    formasPagamento: formasPagamentoAtivas,
    pagamentoSelecionado,
    
    // Ações
    selecionarPagamento,
    limparSelecaoPagamento,
    
    // Estados
    isLoading: false, // Cache sempre disponível
    error: null
  };
};

export default usePainelPagamentos;
