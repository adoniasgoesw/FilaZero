import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, User2, CreditCard, User, Info } from 'lucide-react';
import api from '../../services/api';

const formatCurrency = (n) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n||0));
const formatDateOnly = (iso) => {
  if (!iso) return '-';
  try { return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short'}).format(new Date(iso)); } catch { return iso; }
};

const formatTimeOnly = (iso) => {
  if (!iso) return '-';
  try { return new Intl.DateTimeFormat('pt-BR',{timeStyle:'short'}).format(new Date(iso)); } catch { return iso; }
};

const ListHistoricoPedidos = ({ estabelecimentoId, caixaId, onVerDetalhes, onPedidosLoaded }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      console.log('🔍 ListHistoricoPedidos - fetchData chamado');
      console.log('🔍 estabelecimentoId:', estabelecimentoId);
      console.log('🔍 caixaId:', caixaId);
      
      if (!estabelecimentoId || !caixaId) {
        console.log('❌ ListHistoricoPedidos - estabelecimentoId ou caixaId não informado');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const url = `/historico-pedidos/${estabelecimentoId}?caixa_id=${encodeURIComponent(caixaId)}`;
      console.log('🔍 ListHistoricoPedidos - Fazendo requisição para:', url);
      
      const res = await api.get(url);
      console.log('🔍 ListHistoricoPedidos - Resposta da API:', res);
      
      if (res.success) {
        const pedidos = Array.isArray(res.data) ? res.data : (res.data?.itens || []);
        console.log('✅ ListHistoricoPedidos - Pedidos carregados:', pedidos.length, 'pedidos');
        console.log('✅ ListHistoricoPedidos - Primeiros pedidos:', pedidos.slice(0, 3));
        
        setItems(pedidos);
        
        // Chamar callback para calcular total de vendas
        if (onPedidosLoaded) {
          onPedidosLoaded(pedidos);
        }
      } else {
        console.error('❌ ListHistoricoPedidos - Erro na resposta:', res.message);
        throw new Error(res.message || 'Erro ao carregar histórico de pedidos');
      }
    } catch (e) {
      console.error('❌ ListHistoricoPedidos - Erro no fetchData:', e);
      setError(e.message || 'Erro ao carregar histórico de pedidos');
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId, caixaId, onPedidosLoaded]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
      <div className="flex items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div><span className="ml-3 text-gray-600">Carregando pedidos...</span></div>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-emerald-500 mb-2"><CreditCard className="w-10 h-10 mx-auto"/></div>
        <div className="text-gray-600 mb-2">{error}</div>
        <button onClick={fetchData} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">Tentar novamente</button>
      </div>
    </div>
  );

  if (!items.length) return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
      <div className="text-center text-gray-600">Nenhum pedido encontrado.</div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
          <tr>
            {/* Data - sempre visível */}
            <th className="px-2 sm:px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Data
            </th>
            {/* Cliente - sempre visível */}
            <th className="px-2 sm:px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Cliente
            </th>
            {/* Valor Total - visível em tablet+ */}
            <th className="hidden sm:table-cell px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Valor Total
            </th>
            {/* Forma de Pagamento - visível em desktop+ */}
            <th className="hidden md:table-cell px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Forma de Pagamento
            </th>
            {/* Canal - visível em desktop+ */}
            <th className="hidden lg:table-cell px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Canal
            </th>
            {/* Vendido por - visível em desktop+ */}
            <th className="hidden xl:table-cell px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Vendido por
            </th>
            {/* Detalhes - visível em desktop+ */}
            <th className="hidden xl:table-cell px-3 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Detalhes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((p) => (
            <tr 
              key={p.id}
              className="transition-colors hover:bg-gray-50 cursor-pointer"
              onClick={() => onVerDetalhes && onVerDetalhes(p)}
            >
              {/* Data - sempre visível */}
              <td className="px-2 sm:px-3 py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500"/>
                  <div>
                    <div className="text-sm text-gray-900">{formatDateOnly(p.criado_em)}</div>
                    <div className="text-xs text-gray-500">{formatTimeOnly(p.criado_em)}</div>
                  </div>
                </div>
              </td>
              
              {/* Cliente - sempre visível */}
              <td className="px-2 sm:px-3 py-4">
                <div className="text-sm font-medium text-gray-600 truncate max-w-[120px] sm:max-w-xs">
                  {p.cliente_nome || 'Cliente não informado'}
                </div>
              </td>
              
              {/* Valor Total - visível em tablet+ */}
              <td className="hidden sm:table-cell px-3 py-4">
                <span className="text-sm font-bold text-gray-600">
                  {formatCurrency(p.valor_total)}
                </span>
              </td>
              
              {/* Forma de Pagamento - visível em desktop+ */}
              <td className="hidden md:table-cell px-3 py-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 truncate max-w-[150px]">
                    {p.forma_pagamento || 'Não informado'}
                  </span>
                </div>
              </td>
              
              {/* Canal - visível em desktop+ */}
              <td className="hidden lg:table-cell px-3 py-4">
                <span className="text-sm text-gray-600">
                  {p.canal || 'PDV'}
                </span>
              </td>
              
              {/* Vendido por - visível em desktop+ */}
              <td className="hidden xl:table-cell px-3 py-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 truncate max-w-[120px]">
                    {p.vendido_por || '—'}
                  </span>
                </div>
              </td>
              
              {/* Detalhes - visível em desktop+ */}
              <td className="hidden xl:table-cell px-3 py-4">
                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerDetalhes && onVerDetalhes(p);
                    }}
                    className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
                    title="Ver detalhes"
                  >
                    <Info className="w-5 h-5" />
                  </button>
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

export default ListHistoricoPedidos;


