import React, { useEffect, useState, useCallback } from 'react';
import { Calculator, Calendar, Info } from 'lucide-react';
import { useCaixas } from '../../hooks/useRealtime';

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

const ListCaixas = ({ estabelecimentoId, apenasFechados = false, searchQuery = '', onVerDetalhes }) => {
  // Usar tempo real para caixas (atualização a cada 5 segundos)
  const { data: caixas = [], isLoading, error, refetch } = useCaixas(estabelecimentoId, apenasFechados);

  // Filtrar itens baseado na pesquisa
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return caixas;
    
    const query = searchQuery.toLowerCase().trim();
    return caixas.filter(caixa => {
      const data = formatDateOnly(caixa.data_abertura).toLowerCase();
      const valorAbertura = formatCurrency(caixa.valor_abertura).toLowerCase();
      const entradas = formatCurrency(caixa.entradas).toLowerCase();
      const saidas = formatCurrency(caixa.saidas).toLowerCase();
      const fechamento = caixa.valor_fechamento ? formatCurrency(caixa.valor_fechamento).toLowerCase() : '';
      const diferenca = caixa.diferenca ? formatCurrency(caixa.diferenca).toLowerCase() : '';
      
      return data.includes(query) || 
             valorAbertura.includes(query) || 
             entradas.includes(query) || 
             saidas.includes(query) || 
             fechamento.includes(query) ||
             diferenca.includes(query);
    });
  }, [caixas, searchQuery]);

  if (isLoading) {
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
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button onClick={refetch} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!filteredItems.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Calculator className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600">
            {searchQuery ? 'Nenhum caixa encontrado' : (apenasFechados ? 'Nenhum caixa fechado encontrado' : 'Nenhum registro encontrado')}
          </p>
          <p className="text-gray-500 text-sm">
            {searchQuery ? 'Tente ajustar os termos de pesquisa.' : (apenasFechados ? 'Feche um caixa para começar o histórico.' : 'Abra um caixa para começar o histórico.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor abertura</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Entradas</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Saídas</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Fechamento</th>
              <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Diferença</th>
              <th className="px-3 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-gray-50">
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDateOnly(c.data_abertura)}</span>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-emerald-700">{formatCurrency(c.valor_abertura)}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm hidden sm:table-cell">
                  <span className="px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                    {formatCurrency(c.entradas)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm hidden sm:table-cell">
                  <span className="px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
                    {formatCurrency(c.saidas)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-600 hidden md:table-cell">{c.valor_fechamento ? formatCurrency(c.valor_fechamento) : '-'}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm hidden md:table-cell">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    c.diferenca >= 0 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    {c.diferenca ? formatCurrency(c.diferenca) : '-'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  {onVerDetalhes && (
                    <button
                      onClick={() => onVerDetalhes(c)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Info className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListCaixas;


