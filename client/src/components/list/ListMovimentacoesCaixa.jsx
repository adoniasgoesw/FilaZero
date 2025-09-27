import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, User, CreditCard } from 'lucide-react';
import api from '../../services/api';

const ListMovimentacoesCaixa = ({ 
  estabelecimentoId, 
  caixaId,
  searchQuery = ''
}) => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para rolagem infinita
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const itemsPerPage = 10;

  const displayedMovimentacoes = React.useMemo(() => {
    const list = Array.isArray(movimentacoes) ? movimentacoes : [];
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    const normalize = (s) => String(s || '').toLowerCase();
    return list.filter((m) => {
      const tipo = normalize(m.tipo);
      const descricao = normalize(m.descricao);
      const usuario = normalize(m.usuario_nome);
      return tipo.includes(q) || descricao.includes(q) || usuario.includes(q);
    });
  }, [movimentacoes, searchQuery]);

  const fetchMovimentacoes = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      console.log('🔍 Buscando movimentações para caixa:', caixaId, 'Página:', page);
      
      const response = await api.get(`/movimentacoes-caixa/${caixaId}?page=${page}&limit=${itemsPerPage}`);
      
      console.log('✅ Resposta da API:', response);
      
      if (response.success) {
        const newMovimentacoes = response.data.movimentacoes || response.data;
        const total = response.data.total || newMovimentacoes.length;

        if (append) {
          setMovimentacoes(prev => [...prev, ...newMovimentacoes]);
        } else {
          setMovimentacoes(newMovimentacoes);
        }
        
        setCurrentPage(page);
        setHasMore(page < Math.ceil(total / itemsPerPage));
        
        console.log('✅ Movimentações carregadas:', newMovimentacoes.length, 'Total:', total, 'Páginas:', Math.ceil(total / itemsPerPage));
      } else {
        throw new Error(response.message || 'Erro ao carregar movimentações');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar movimentações:', error);
      setError(error.message || 'Erro ao carregar movimentações');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [estabelecimentoId, caixaId, itemsPerPage]);

  useEffect(() => {
    if (!estabelecimentoId || !caixaId) return;
    fetchMovimentacoes(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estabelecimentoId, caixaId]);

  // Função para carregar mais movimentações
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchMovimentacoes(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, loading, currentPage, fetchMovimentacoes]);

  // Função para recarregar a lista
  const refreshList = useCallback(() => {
    if (estabelecimentoId && caixaId) {
      fetchMovimentacoes(1);
    }
  }, [estabelecimentoId, caixaId, fetchMovimentacoes]);

  // Função para formatar moeda
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter cor do tipo
  const getTipoColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'entrada':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'saida':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'abertura':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'fechamento':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Efeito para rolagem infinita
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Efeito para atualização em tempo real
  useEffect(() => {
    const handleMovimentacaoChange = () => {
      console.log('🔄 Evento de mudança de movimentação recebido - recarregando lista');
      refreshList();
    };

    // Escutar eventos de mudança de movimentações
    window.addEventListener('movimentacaoChanged', handleMovimentacaoChange);
    window.addEventListener('caixaChanged', handleMovimentacaoChange);
    
    return () => {
      window.removeEventListener('movimentacaoChanged', handleMovimentacaoChange);
      window.removeEventListener('caixaChanged', handleMovimentacaoChange);
    };
  }, [refreshList]);

  if (loading && movimentacoes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600">Carregando movimentações...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-rose-500 mb-4">
            <Calculator className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar movimentações</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshList}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (movimentacoes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600">Nenhuma movimentação encontrada</p>
          <p className="text-gray-500 text-sm">As movimentações aparecerão aqui quando houver entradas ou saídas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            {/* Tipo - sempre visível */}
            <th className="px-2 sm:px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Tipo
            </th>
            {/* Descrição - sempre visível */}
            <th className="px-2 sm:px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Descrição
            </th>
            {/* Valor - visível em tablet+ */}
            <th className="hidden sm:table-cell px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Valor
            </th>
            {/* Adicionado por - visível em desktop+ */}
            <th className="hidden md:table-cell px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Adicionado por
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {displayedMovimentacoes.map((movimentacao) => (
            <tr 
              key={movimentacao.id}
              className="transition-colors hover:bg-gray-50 cursor-pointer"
            >
              {/* Tipo - sempre visível */}
              <td className="px-2 sm:px-3 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(movimentacao.tipo)}`}>
                  {movimentacao.tipo ? movimentacao.tipo.charAt(0).toUpperCase() + movimentacao.tipo.slice(1).toLowerCase() : 'N/A'}
                </span>
              </td>
              
              {/* Descrição - sempre visível */}
              <td className="px-2 sm:px-3 py-4">
                <div className="text-sm font-medium text-gray-600 truncate max-w-[120px] sm:max-w-xs">
                  {movimentacao.descricao || 'Sem descrição'}
                </div>
              </td>
              
              {/* Valor - visível em tablet+ */}
              <td className="hidden sm:table-cell px-3 py-4">
                <span className={`text-sm font-bold ${
                  movimentacao.tipo?.toLowerCase() === 'entrada' || movimentacao.tipo?.toLowerCase() === 'abertura'
                    ? 'text-emerald-600' 
                    : 'text-rose-600'
                }`}>
                  {movimentacao.tipo?.toLowerCase() === 'entrada' || movimentacao.tipo?.toLowerCase() === 'abertura' ? '+' : '-'}
                  {formatCurrency(movimentacao.valor)}
                </span>
              </td>
              
              {/* Adicionado por - visível em desktop+ */}
              <td className="hidden md:table-cell px-3 py-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 truncate max-w-[150px]">
                    {movimentacao.usuario_nome || 'Usuário não identificado'}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Indicador de carregamento para rolagem infinita */}
      {loadingMore && (
        <div className="flex justify-center items-center py-6 border-t border-gray-200">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
          <span className="ml-2 text-sm text-gray-600">Carregando mais movimentações...</span>
        </div>
      )}
    </div>
  );
};

export default ListMovimentacoesCaixa;