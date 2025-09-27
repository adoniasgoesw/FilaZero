import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

export const usePainelPagamentos = (estabelecimentoId) => {
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);
  
  // Estados para dados (busca direta da API)
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para carregar pagamentos da API
  const loadPagamentos = useCallback(async () => {
    if (!estabelecimentoId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/pagamentos/${estabelecimentoId}`);
      if (response.success) {
        setPagamentos(response.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
      setError(err.message || 'Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId]);

  // Carregar dados da API
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
