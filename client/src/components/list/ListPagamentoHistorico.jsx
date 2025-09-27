import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, DollarSign, TrendingUp, Smartphone, Banknote } from 'lucide-react';
import api from '../../services/api';

const ListPagamentoHistorico = ({ 
  estabelecimentoId, 
  caixaId,
  searchQuery = ''
}) => {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalGeral, setTotalGeral] = useState(0);

  const displayedPagamentos = React.useMemo(() => {
    const list = Array.isArray(pagamentos) ? pagamentos : [];
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    const normalize = (s) => String(s || '').toLowerCase();
    return list.filter((p) => {
      const formaPagamento = normalize(p.pagamento_nome);
      return formaPagamento.includes(q);
    });
  }, [pagamentos, searchQuery]);

  const fetchPagamentos = useCallback(async () => {
    try {
      if (!estabelecimentoId || !caixaId) {
        console.log('⚠️ Parâmetros ausentes:', { estabelecimentoId, caixaId });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando pagamentos históricos para caixa:', caixaId);
      console.log('🔍 Token no localStorage:', !!localStorage.getItem('token'));
      
      const response = await api.get(`/pagamentos/historico/caixa/${caixaId}?estabelecimento_id=${estabelecimentoId}`);
      
      console.log('✅ Resposta da API de pagamentos:', response);
      console.log('✅ Estrutura da resposta:', {
        hasData: !!response.data,
        success: response.data?.success,
        hasDataData: !!response.data?.data,
        message: response.data?.message
      });
      
      // Verificar se a resposta tem a estrutura esperada
      if (response && response.success) {
        // Resposta direta (sem .data)
        const resumoData = response.data?.resumo || [];
        const total = response.data?.total_geral || 0;
        
        setPagamentos(resumoData);
        setTotalGeral(total);
        
        console.log('✅ Pagamentos carregados (formato direto):', resumoData.length, 'Total geral:', total);
      } else if (response.data && response.data.success) {
        // Resposta aninhada (com .data)
        const resumoData = response.data.data.resumo || [];
        const total = response.data.data.total_geral || 0;
        
        setPagamentos(resumoData);
        setTotalGeral(total);
        
        console.log('✅ Pagamentos carregados (formato aninhado):', resumoData.length, 'Total geral:', total);
      } else {
        console.error('❌ Resposta não bem-sucedida:', response);
        
        // Verificar se é erro de autenticação
        const errorMessage = response.data?.message || response.message;
        if (errorMessage === 'Token não fornecido' || errorMessage === 'Token inválido') {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        throw new Error(errorMessage || 'Erro ao carregar pagamentos históricos');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar pagamentos históricos:', error);
      setError(error.message || 'Erro ao carregar pagamentos históricos');
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId, caixaId]);

  useEffect(() => {
    if (!estabelecimentoId || !caixaId) return;
    fetchPagamentos();
  }, [estabelecimentoId, caixaId, fetchPagamentos]);

  // Função para recarregar a lista
  const refreshList = useCallback(() => {
    if (estabelecimentoId && caixaId) {
      fetchPagamentos();
    }
  }, [estabelecimentoId, caixaId, fetchPagamentos]);

  // Função para formatar moeda
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };


  // Função para obter ícone da forma de pagamento
  const getFormaPagamentoIcon = (forma) => {
    switch (forma?.toLowerCase()) {
      case 'pix':
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'dinheiro':
        return <Banknote className="w-5 h-5 text-green-600" />;
      case 'crédito':
      case 'credito':
      case 'cartão':
      case 'cartao':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'débito':
      case 'debito':
        return <CreditCard className="w-5 h-5 text-orange-600" />;
      case 'vale refeição':
        return <DollarSign className="w-5 h-5 text-yellow-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  // Efeito para atualização em tempo real
  useEffect(() => {
    const handlePedidoChange = () => {
      console.log('🔄 Evento de mudança de pedido recebido - recarregando pagamentos');
      refreshList();
    };

    // Escutar eventos de mudança de pedidos
    window.addEventListener('pedidoChanged', handlePedidoChange);
    window.addEventListener('caixaChanged', handlePedidoChange);
    
    return () => {
      window.removeEventListener('pedidoChanged', handlePedidoChange);
      window.removeEventListener('caixaChanged', handlePedidoChange);
    };
  }, [refreshList]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600">Carregando pagamentos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <CreditCard className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar pagamentos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {/* Informações de debug */}
          <div className="text-xs text-gray-500 mb-4 p-3 bg-gray-50 rounded">
            <div>Caixa ID: {caixaId || 'Não definido'}</div>
            <div>Estabelecimento ID: {estabelecimentoId || 'Não definido'}</div>
            <div>Token: {localStorage.getItem('token') ? 'Presente' : 'Ausente'}</div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <button
              onClick={refreshList}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Recarregar página
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (pagamentos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-gray-600">Nenhum pagamento encontrado</p>
          <p className="text-gray-500 text-sm">Os pagamentos aparecerão aqui quando houver vendas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tabela de pagamentos */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              {/* Pagamento - sempre visível */}
              <th className="px-2 sm:px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Pagamento
              </th>
              {/* Valor Total - sempre visível */}
              <th className="px-2 sm:px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Valor Total
              </th>
              {/* Quantidade de Pedidos - visível em tablet+ */}
              <th className="hidden sm:table-cell px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Pedidos
              </th>
              {/* Percentual - visível em desktop+ */}
              <th className="hidden md:table-cell px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                % do Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedPagamentos.map((pagamento, index) => (
              <tr 
                key={pagamento.pagamento_id || index}
                className="transition-colors hover:bg-gray-50"
              >
                {/* Pagamento - sempre visível */}
                <td className="px-2 sm:px-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                      {getFormaPagamentoIcon(pagamento.pagamento_nome)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-600">
                        {pagamento.pagamento_nome || 'Não informado'}
                      </div>
                    </div>
                  </div>
                </td>
                
                {/* Valor Total - sempre visível */}
                <td className="px-2 sm:px-3 py-4">
                  <div className="text-lg font-bold text-gray-600">
                    {formatCurrency(pagamento.total)}
                  </div>
                </td>
                
                {/* Quantidade de Pedidos - visível em tablet+ */}
                <td className="hidden sm:table-cell px-3 py-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {pagamento.quantidade || 0} pagamento(s)
                    </span>
                  </div>
                </td>
                
                {/* Percentual - visível em desktop+ */}
                <td className="hidden md:table-cell px-3 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${totalGeral > 0 ? (pagamento.total / totalGeral) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {totalGeral > 0 ? ((pagamento.total / totalGeral) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListPagamentoHistorico;

