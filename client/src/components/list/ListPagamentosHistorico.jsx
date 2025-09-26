import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

const ListPagamentosHistorico = ({ caixaId, estabelecimentoId }) => {
  const [pagamentos, setPagamentos] = useState([]);
  const [resumo, setResumo] = useState([]);
  const [totalGeral, setTotalGeral] = useState(0);
  const [totalPagamentos, setTotalPagamentos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscarPagamentosHistorico = async () => {
    if (!caixaId || !estabelecimentoId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/pagamentos/historico/caixa/${caixaId}`, {
        params: { estabelecimento_id: estabelecimentoId }
      });

      if (response.data.success) {
        setPagamentos(response.data.data.pagamentos || []);
        setResumo(response.data.data.resumo || []);
        setTotalGeral(response.data.data.total_geral || 0);
        setTotalPagamentos(response.data.data.total_pagamentos || 0);
      } else {
        setError(response.data.message || 'Erro ao buscar pagamentos históricos');
      }
    } catch (err) {
      console.error('Erro ao buscar pagamentos históricos:', err);
      setError('Erro ao carregar pagamentos históricos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarPagamentosHistorico();
  }, [caixaId, estabelecimentoId]);

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando pagamentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 mr-2">⚠️</div>
          <span className="text-red-800">{error}</span>
        </div>
        <button 
          onClick={buscarPagamentosHistorico}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo dos Pagamentos */}
      {resumo.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Resumo por Forma de Pagamento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {resumo.map((item, index) => (
              <div key={item.pagamento_id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{item.pagamento_nome}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {item.pagamento_tipo}
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatarValor(item.total)}
                </div>
                <div className="text-sm text-gray-600">
                  {item.quantidade} pagamento{item.quantidade !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Geral:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatarValor(totalGeral)}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {totalPagamentos} pagamento{totalPagamentos !== 1 ? 's' : ''} no total
            </div>
          </div>
        </div>
      )}

      {/* Lista Detalhada de Pagamentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            💳 Histórico Detalhado de Pagamentos
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Todos os pagamentos realizados neste caixa
          </p>
        </div>

        {pagamentos.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">💳</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum pagamento encontrado
            </h4>
            <p className="text-gray-600">
              Não há pagamentos registrados para este caixa ainda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forma de Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagamentos.map((pagamento) => (
                  <tr key={pagamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-600">
                          #{pagamento.pedido_codigo || pagamento.pedido_id}
                        </div>
                        <div className="ml-2 text-xs text-gray-500">
                          (R$ {formatarValor(pagamento.pedido_valor_total).replace('R$', '').trim()})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-600">
                          {pagamento.pagamento_nome}
                        </div>
                        <div className="ml-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {pagamento.pagamento_tipo}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-600">
                        {formatarValor(Math.min(pagamento.valor_pago, pagamento.pedido_valor_total))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(pagamento.finalizado_em)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Finalizado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Botão de Atualizar */}
      <div className="flex justify-center">
        <button
          onClick={buscarPagamentosHistorico}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              Atualizando...
            </>
          ) : (
            <>
              🔄 Atualizar Lista
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ListPagamentosHistorico;