import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, User2, CreditCard, User } from 'lucide-react';
import Information from '../buttons/Information';
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
      if (!estabelecimentoId || !caixaId) return;
      setLoading(true);
      setError(null);
      const res = await api.get(`/historico-pedidos/${estabelecimentoId}?caixa_id=${encodeURIComponent(caixaId)}`);
      if (res.success) {
        const pedidos = Array.isArray(res.data) ? res.data : (res.data?.itens || []);
        setItems(pedidos);
        // Chamar callback para calcular total de vendas
        if (onPedidosLoaded) {
          onPedidosLoaded(pedidos);
        }
      } else {
        throw new Error(res.message || 'Erro ao carregar histórico de pedidos');
      }
    } catch (e) {
      setError(e.message || 'Erro ao carregar histórico de pedidos');
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId, caixaId]);

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
    <div>
      {/* Mobile cards - sem card branco envolvendo */}
      <div className="md:hidden grid grid-cols-1 gap-2">
        {items.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
            {/* Header com data e botão de informação */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 text-gray-600 text-xs">
                <Calendar className="w-4 h-4"/>
                <div>
                  <div className="font-medium">{formatDateOnly(p.criado_em)}</div>
                  <div className="text-[10px] text-gray-500">{formatTimeOnly(p.criado_em)}</div>
                </div>
              </div>
              <Information
                onClick={() => onVerDetalhes && onVerDetalhes(p)}
                className="w-7 h-7 bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200 transition-colors"
              />
            </div>

            {/* Cliente e Valor Total na mesma linha */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                  <User2 className="w-3 h-3"/>
                </div>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {p.cliente_nome || 'Cliente'}
                </span>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[11px] text-gray-500">Valor</div>
                <div className="text-sm font-semibold text-gray-500">{formatCurrency(p.valor_total)}</div>
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="mb-2">
              <div className="text-[11px] text-gray-500">Forma de Pagamento</div>
              <div className="text-sm font-medium text-gray-900 truncate">{p.forma_pagamento || '—'}</div>
            </div>

            {/* Canal e Vendido por na mesma linha */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] text-gray-500">Canal</div>
                <div className="text-sm font-medium text-gray-900">{p.canal || 'PDV'}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">Vendido por</div>
                <div className="text-sm font-medium text-gray-900 truncate">{p.vendido_por || '—'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela desktop */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor Total</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Forma de Pagamento</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Canal</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendido por</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500"/>
                      <div>
                        <div>{formatDateOnly(p.criado_em)}</div>
                        <div className="text-[10px] text-gray-500">{formatTimeOnly(p.criado_em)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-900">{(p.cliente_nome && String(p.cliente_nome).trim()) ? p.cliente_nome : 'Não informado'}</td>
                  <td className="px-3 py-4 text-sm font-semibold text-gray-500">{formatCurrency(p.valor_total)}</td>
                  <td className="px-3 py-4 text-sm text-gray-900">{(p.forma_pagamento && String(p.forma_pagamento).trim()) ? p.forma_pagamento : 'Não informado'}</td>
                  <td className="px-3 py-4 text-sm text-gray-900">{p.canal || 'PDV'}</td>
                  <td className="px-3 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{p.vendido_por || '—'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-center">
                    <Information
                      onClick={() => onVerDetalhes && onVerDetalhes(p)}
                      className="w-8 h-8 bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200 transition-colors mx-auto"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListHistoricoPedidos;


