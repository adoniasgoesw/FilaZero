import React, { useEffect, useState, useCallback } from 'react';
import { Calculator, Calendar } from 'lucide-react';
import api from '../../services/api';

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  const num = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const formatDateTime = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(d);
  } catch {
    return iso;
  }
};

const formatDateOnly = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short'
    }).format(d);
  } catch {
    return iso;
  }
};

const ListCaixas = ({ estabelecimentoId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      if (!estabelecimentoId) return;
      setLoading(true);
      setError(null);
      const res = await api.get(`/caixas/${estabelecimentoId}?page=1&limit=20`);
      if (res.success) {
        const data = res.data.caixas || res.data;
        setItems(Array.isArray(data) ? data : (res.data.caixas || []));
      } else {
        throw new Error(res.message || 'Erro ao carregar histórico de caixas');
      }
    } catch (e) {
      setError(e.message || 'Erro ao carregar histórico de caixas');
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener('refreshCaixas', handler);
    return () => window.removeEventListener('refreshCaixas', handler);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600">Carregando histórico...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-emerald-500 mb-4">
            <Calculator className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar histórico</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Calculator className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum registro encontrado</h3>
          <p className="text-gray-600">Abra um caixa para começar o histórico.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cards - Mobile */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {items.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-900">{formatDateOnly(c.data_abertura)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[11px] text-gray-500">Valor de abertura</div>
                <div className="text-sm font-semibold text-emerald-700">{formatCurrency(c.valor_abertura)}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">Entradas</div>
                <div className="text-sm font-semibold text-emerald-700">{formatCurrency(c.entradas)}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">Saídas</div>
                <div className="text-sm font-semibold text-orange-700">{formatCurrency(c.saidas)}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">Valor de fechamento</div>
                <div className="text-sm font-semibold text-gray-900">{c.valor_fechamento ? formatCurrency(c.valor_fechamento) : '-'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela - Desktop/Tablet */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor abertura</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Entradas</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Saídas</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fechamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((c) => (
                <tr key={c.id} className="transition-colors">
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{formatDateOnly(c.data_abertura)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-emerald-700">{formatCurrency(c.valor_abertura)}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                      {formatCurrency(c.entradas)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
                      {formatCurrency(c.saidas)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{c.valor_fechamento ? formatCurrency(c.valor_fechamento) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListCaixas;


