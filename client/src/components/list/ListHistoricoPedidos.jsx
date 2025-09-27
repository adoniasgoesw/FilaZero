import React, { useEffect } from 'react';
import { Calendar, User2, CreditCard, User, Info } from 'lucide-react';
import { useHistoricoPedidos } from '../../hooks/useRealtime';

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
  // Usar tempo real para histórico de pedidos (atualização a cada 5 segundos)
  const { data: items = [], isLoading, error, refetch } = useHistoricoPedidos(estabelecimentoId, caixaId);

  // Chamar callback quando dados mudarem
  useEffect(() => {
    if (items.length > 0 && onPedidosLoaded) {
      onPedidosLoaded(items);
    }
  }, [items, onPedidosLoaded]);

  if (isLoading) return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
      <div className="flex items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div><span className="ml-3 text-gray-600">Carregando pedidos...</span></div>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-emerald-500 mb-2"><CreditCard className="w-10 h-10 mx-auto"/></div>
        <div className="text-gray-600 mb-2">{error.message}</div>
        <button onClick={refetch} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">Tentar novamente</button>
      </div>
    </div>
  );

  if (!items.length) return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-600">Nenhum pedido encontrado</p>
        <p className="text-gray-500 text-sm">Os pedidos aparecerão aqui quando houver vendas</p>
      </div>
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


