import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, DollarSign, Smartphone, Banknote, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
import EditButton from '../buttons/Edit';
import DeleteButton from '../buttons/Delete';
import StatusButton from '../buttons/Status';
import ConfirmDelete from '../elements/ConfirmDelete';
// Removido import do cache - agora busca diretamente da API

const ListPagamentos = ({ 
  onEdit, 
  onPagamentosLoaded,
  searchQuery = '',
  selectedPagamentos: externalSelectedPagamentos = [],
  onSelectionChange
}) => {
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, pagamento: null });
  const [deleting, setDeleting] = useState(false);
  
  // Estados para seleção múltipla
  const [selectAll, setSelectAll] = useState(false);
  
  // Estados para dropdown de ações
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState({ isOpen: false, pagamentos: [] });
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Estados para pagamentos (busca direta da API)
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
        if (onPagamentosLoaded) {
          onPagamentosLoaded(response.data || []);
        }
      } else {
        throw new Error(response.message || 'Erro ao carregar pagamentos');
      }
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
      setError(err.message || 'Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId, onPagamentosLoaded]);

  // Função para adicionar pagamento
  const addPagamento = useCallback((pagamento) => {
    setPagamentos(prev => [...prev, pagamento]);
  }, []);

  // Função para atualizar pagamento
  const updatePagamento = useCallback((pagamentoAtualizado) => {
    setPagamentos(prev => prev.map(p => p.id === pagamentoAtualizado.id ? pagamentoAtualizado : p));
  }, []);

  // Função para remover pagamento
  const removePagamento = useCallback((pagamentoId) => {
    setPagamentos(prev => prev.filter(p => p.id !== pagamentoId));
  }, []);

  // Buscar ID do estabelecimento
  useEffect(() => {
    const id = localStorage.getItem('estabelecimentoId');
    if (id) {
      setEstabelecimentoId(Number(id));
    }
  }, []);

  // Carregar pagamentos da API
  useEffect(() => {
    if (estabelecimentoId) {
      loadPagamentos();
    }
  }, [estabelecimentoId, loadPagamentos]);

  const displayedPagamentos = React.useMemo(() => {
    const list = Array.isArray(pagamentos) ? pagamentos : [];
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    const normalize = (s) => String(s || '').toLowerCase();
    return list.filter((p) => {
      const name = normalize(p.nome);
      const tipo = normalize(p.tipo);
      const conta = normalize(p.conta_bancaria);
      return name.includes(q) || tipo.includes(q) || conta.includes(q);
    });
  }, [pagamentos, searchQuery]);

  // Escutar evento de reload
  useEffect(() => {
    const handleReload = () => {
      if (estabelecimentoId) {
        loadPagamentos();
      }
    };

    window.addEventListener('reloadPagamentos', handleReload);
    return () => window.removeEventListener('reloadPagamentos', handleReload);
  }, [estabelecimentoId, loadPagamentos]);

  // Controlar seleção baseada nos pagamentos selecionados externos
  useEffect(() => {
    setSelectAll(externalSelectedPagamentos.length === displayedPagamentos.length && displayedPagamentos.length > 0);
  }, [externalSelectedPagamentos.length, displayedPagamentos.length]);

  // Função para recarregar a lista
  const refreshList = useCallback(() => {
    if (estabelecimentoId) {
      loadPagamentos();
    }
  }, [estabelecimentoId, loadPagamentos]);

  // Função para alternar status do pagamento
  const toggleStatus = async (pagamento) => {
    try {
      const response = await api.put(`/pagamentos/${pagamento.id}/status`, {
        status: !pagamento.status
      });
      
      if (response.success) {
        // Atualizar o pagamento no cache
        updatePagamento(pagamento.id, { status: !pagamento.status });
        
        console.log('✅ Status do pagamento alterado:', pagamento.nome, 'Novo status:', !pagamento.status);
      } else {
        throw new Error(response.message || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
    }
  };

  // Função para selecionar/deselecionar pagamento individual
  const handlePagamentoSelect = (pagamento) => {
    if (onSelectionChange) {
      const isSelected = externalSelectedPagamentos.some(p => p.id === pagamento.id);
      if (isSelected) {
        onSelectionChange(externalSelectedPagamentos.filter(p => p.id !== pagamento.id));
      } else {
        onSelectionChange([...externalSelectedPagamentos, pagamento]);
      }
    }
  };

  // Função para selecionar/deselecionar todos os pagamentos
  const handleSelectAll = () => {
    if (onSelectionChange) {
      if (selectAll) {
        onSelectionChange([]);
      } else {
        onSelectionChange([...displayedPagamentos]);
      }
    }
  };

  // Função para clicar no pagamento (abrir modal de edição)
  const handlePagamentoClick = (pagamento) => {
    onEdit(pagamento);
  };

  // Função para deletar múltiplos pagamentos
  const handleBulkDelete = async () => {
    try {
      setBulkDeleting(true);
      
      const promises = externalSelectedPagamentos.map(pagamento => 
        api.delete(`/pagamentos/${pagamento.id}`)
      );
      
      await Promise.all(promises);
      
      // Remover pagamentos do cache
      externalSelectedPagamentos.forEach(pagamento => {
        removePagamento(pagamento.id);
      });
      
      // Fechar modal e limpar seleção
      setBulkDeleteModal({ isOpen: false, pagamentos: [] });
      onSelectionChange([]);
      setShowActionsDropdown(false);
      
      console.log(`✅ ${externalSelectedPagamentos.length} pagamentos deletados`);
    } catch (error) {
      console.error('❌ Erro ao deletar pagamentos em lote:', error);
    } finally {
      setBulkDeleting(false);
    }
  };

  // Função para deletar pagamento
  const handleDelete = async (pagamento) => {
    try {
      setDeleting(true);
      const response = await api.delete(`/pagamentos/${pagamento.id}`);
      
      if (response.success) {
        // Remover pagamento do cache
        removePagamento(pagamento.id);
        
        // Fechar modal
        setDeleteModal({ isOpen: false, pagamento: null });
        
        console.log('✅ Pagamento deletado:', pagamento.nome);
      } else {
        throw new Error(response.message || 'Erro ao deletar pagamento');
      }
    } catch (error) {
      console.error('❌ Erro ao deletar pagamento:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Função para obter ícone baseado no tipo
  const getTipoIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'dinheiro':
        return <Banknote className="w-5 h-5 text-green-600" />;
      case 'pix':
        return <Smartphone className="w-5 h-5 text-blue-600" />;
      case 'cartão':
      case 'cartao':
        return <CreditCard className="w-5 h-5 text-purple-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  // Função para obter cor do ícone baseado no tipo
  const getTipoIconColor = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'dinheiro':
        return 'bg-green-100 text-green-600';
      case 'pix':
        return 'bg-blue-100 text-blue-600';
      case 'cartão':
      case 'cartao':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Efeito para fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionsDropdown && !event.target.closest('.relative')) {
        setShowActionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionsDropdown]);

  if (loading && pagamentos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
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
          <button
            onClick={refreshList}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (pagamentos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <CreditCard className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
          <p className="text-gray-600">Comece adicionando seu primeiro pagamento.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabela responsiva */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-1 py-4 text-left">
                  <div className="flex items-center h-6 ml-2">
                    <input 
                      type="checkbox" 
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-white border-2 border-blue-500 rounded-full focus:ring-blue-500 focus:ring-2 checked:bg-blue-500 checked:border-blue-500" 
                    />
                  </div>
                </th>
                <th className="px-1 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pagamento</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Tipo</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Taxa</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Conta Bancária</th>
                <th className="px-3 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedPagamentos.map((pagamento) => (
                <tr 
                  key={pagamento.id}
                  className="transition-colors cursor-pointer hover:bg-gray-50"
                  onClick={() => handlePagamentoClick(pagamento)}
                >
                  <td className="px-1 py-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center h-6 ml-2">
                      <input 
                        type="checkbox" 
                        checked={externalSelectedPagamentos.some(p => p.id === pagamento.id)}
                        onChange={() => handlePagamentoSelect(pagamento)}
                        className="w-4 h-4 text-blue-600 bg-white border-2 border-blue-500 rounded-full focus:ring-blue-500 focus:ring-2 checked:bg-blue-500 checked:border-blue-500" 
                      />
                    </div>
                  </td>
                  <td className="px-1 py-6">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-2 shadow-sm flex-shrink-0 ${getTipoIconColor(pagamento.tipo)}`}>
                        {getTipoIcon(pagamento.tipo)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">{pagamento.nome}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {pagamento.tipo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-6 hidden sm:table-cell">
                    <span className="text-sm font-medium text-gray-600">
                      {pagamento.tipo}
                    </span>
                  </td>
                  <td className="px-3 py-6">
                    <span className="text-sm font-medium text-gray-600">
                      {pagamento.taxa ? `${pagamento.taxa}%` : '0%'}
                    </span>
                  </td>
                  <td className="px-3 py-6 hidden md:table-cell">
                    <span className="text-sm font-medium text-gray-600">
                      {pagamento.conta_bancaria || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-6 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => toggleStatus(pagamento)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${pagamento.status ? 'bg-green-50 hover:bg-green-100' : 'bg-orange-50 hover:bg-orange-100'}`}
                        title={pagamento.status ? 'Desativar' : 'Ativar'}
                      >
                        {pagamento.status ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-orange-500" />
                        )}
                      </button>
                      <EditButton 
                        onClick={() => onEdit(pagamento)} 
                        size="sm"
                        variant="soft"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        title="Editar"
                      />
                      <DeleteButton 
                        onClick={() => setDeleteModal({ isOpen: true, pagamento })} 
                        size="sm"
                        variant="soft"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        title="Deletar"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDelete
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, pagamento: null })}
        onConfirm={() => handleDelete(deleteModal.pagamento)}
        title="Excluir Pagamento"
        message={`Tem certeza que deseja excluir o pagamento "${deleteModal.pagamento?.nome}"? Esta ação não pode ser desfeita.`}
        isLoading={deleting}
      />

      {/* Modal de confirmação de exclusão em lote */}
      <ConfirmDelete
        isOpen={bulkDeleteModal.isOpen}
        onClose={() => setBulkDeleteModal({ isOpen: false, pagamentos: [] })}
        onConfirm={handleBulkDelete}
        title="Excluir Pagamentos"
        message={`Tem certeza que deseja excluir ${bulkDeleteModal.pagamentos.length} pagamento${bulkDeleteModal.pagamentos.length > 1 ? 's' : ''}? Esta ação não pode ser desfeita.`}
        isLoading={bulkDeleting}
      />
    </div>
  );
};

export default ListPagamentos;
