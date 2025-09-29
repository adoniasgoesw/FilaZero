import React, { useState, useEffect, useCallback } from 'react';
import { Package } from 'lucide-react';
import api from '../../services/api';
import EditButton from '../buttons/Edit';
import DeleteButton from '../buttons/Delete';
import ConfirmDelete from '../elements/ConfirmDelete';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const ListComplementos = ({ 
  estabelecimentoId, 
  onComplementoDelete, 
  onComplementoEdit, 
  searchQuery = '',
  selectedComplementos = [],
  onSelectionChange
}) => {
  const [complementos, setComplementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, complemento: null });
  const [deleting, setDeleting] = useState(false);
  
  // Estados para seleção múltipla
  const [selectAll, setSelectAll] = useState(false);

  const fetchComplementos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando complementos para estabelecimento:', estabelecimentoId);
      
      const response = await api.get(`/complementos/${estabelecimentoId}?show_all=1`);
      
      console.log('✅ Resposta da API:', response);
      
      if (response.success) {
        setComplementos(response.data);
        console.log('✅ Complementos carregados:', response.data.length);
      } else {
        throw new Error(response.message || 'Erro ao carregar complementos');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar complementos:', error);
      setError(error.message || 'Erro ao carregar complementos');
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    if (estabelecimentoId) {
      fetchComplementos();
    }
  }, [estabelecimentoId, fetchComplementos]);

  // Escutar eventos de atualização em tempo real
  useEffect(() => {
    const handleComplementoUpdate = () => {
      console.log('🔄 ListComplementos - Evento de atualização recebido, recarregando complementos...');
      if (estabelecimentoId) {
        fetchComplementos();
      }
    };

    const handleRefreshComplementos = () => {
      console.log('🔄 ListComplementos - Evento refreshComplementos recebido, recarregando complementos...');
      if (estabelecimentoId) {
        fetchComplementos();
      }
    };

    window.addEventListener('complementoUpdated', handleComplementoUpdate);
    window.addEventListener('refreshComplementos', handleRefreshComplementos);
    
    return () => {
      window.removeEventListener('complementoUpdated', handleComplementoUpdate);
      window.removeEventListener('refreshComplementos', handleRefreshComplementos);
    };
  }, [estabelecimentoId, fetchComplementos]);

  // Função para recarregar a lista
  const refreshList = useCallback(() => {
    if (estabelecimentoId) {
      fetchComplementos();
    }
  }, [estabelecimentoId, fetchComplementos]);

  // Memoizar lista filtrada
  const displayed = React.useMemo(() => {
    const list = Array.isArray(complementos) ? complementos : [];
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    return list.filter((c) => String(c.nome || '').toLowerCase().includes(q));
  }, [complementos, searchQuery]);

  // Controlar seleção baseada nos complementos selecionados externos
  useEffect(() => {
    setSelectAll(selectedComplementos.length === displayed.length && displayed.length > 0);
  }, [selectedComplementos, displayed.length]);

  // Função para alternar status do complemento
  const toggleStatus = async (complemento) => {
    try {
      const response = await api.put(`/complementos/${complemento.id}/status`);
      
      if (response.success) {
        // Atualizar o complemento na lista
        setComplementos(prev => prev.map(c => 
          c.id === complemento.id 
            ? { ...c, status: !c.status }
            : c
        ));
        
        console.log('✅ Status do complemento alterado:', complemento.nome, 'Novo status:', !complemento.status);
      } else {
        throw new Error(response.message || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      setError(error.message || 'Erro ao alterar status do complemento');
    }
  };

  // Função para selecionar/deselecionar complemento individual
  const handleComplementoSelect = (complemento) => {
    if (onSelectionChange) {
      const isSelected = selectedComplementos.some(c => c.id === complemento.id);
      if (isSelected) {
        onSelectionChange(selectedComplementos.filter(c => c.id !== complemento.id));
      } else {
        onSelectionChange([...selectedComplementos, complemento]);
      }
    }
  };

  // Função para selecionar/deselecionar todos os complementos
  const handleSelectAll = () => {
    if (onSelectionChange) {
      if (selectAll) {
        onSelectionChange([]);
      } else {
        onSelectionChange([...displayed]);
      }
    }
  };

  // Função para clicar no complemento (abrir modal de edição)
  const handleComplementoClick = (complemento) => {
    onComplementoEdit(complemento);
  };


  // Função para deletar complemento
  const handleDelete = async (complemento) => {
    try {
      setDeleting(true);
      const response = await api.delete(`/complementos/${complemento.id}`);
      
      if (response.success) {
        // Remover complemento da lista
        setComplementos(prev => prev.filter(c => c.id !== complemento.id));
        
        // Fechar modal
        setDeleteModal({ isOpen: false, complemento: null });
        
        // Chamar callback para notificação
        if (onComplementoDelete) {
          onComplementoDelete(complemento);
        }
        
        console.log('✅ Complemento deletado:', complemento.nome);
      } else {
        throw new Error(response.message || 'Erro ao deletar complemento');
      }
    } catch (error) {
      console.error('❌ Erro ao deletar complemento:', error);
      setError(error.message || 'Erro ao deletar complemento');
    } finally {
      setDeleting(false);
    }
  };

  // Função para formatar moeda
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-3 text-gray-600">Carregando complementos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Package className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar complementos</h3>
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

  if (displayed.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <p className="text-gray-600">Nenhum complemento encontrado</p>
          <p className="text-gray-500 text-sm">Adicione um complemento para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabela única com cabeçalho fixo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full mt-33 md:mt-0" style={{ scrollBehavior: 'smooth' }}>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <table className="min-w-full">
            <thead className="bg-gray-100 sticky top-0 z-10">
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
                <th className="px-1 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Complemento</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Preço</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-3 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.map((complemento) => (
                <tr 
                  key={complemento.id} 
                  className="transition-colors cursor-pointer"
                  onClick={() => handleComplementoClick(complemento)}
                >
                  <td className="px-1 py-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center h-6 ml-2">
                      <input 
                        type="checkbox" 
                        checked={selectedComplementos.some(c => c.id === complemento.id)}
                        onChange={() => handleComplementoSelect(complemento)}
                        className="w-4 h-4 text-blue-600 bg-white border-2 border-blue-500 rounded-full focus:ring-blue-500 focus:ring-2 checked:bg-blue-500 checked:border-blue-500" 
                      />
                    </div>
                  </td>
                  <td className="px-1 py-6">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 truncate">{complemento.nome}</div>
                      <div className="text-xs text-gray-500 truncate">Complemento do cardápio</div>
                    </div>
                  </td>
                  <td className="px-3 py-6 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-400">{formatCurrency(complemento.valor_venda)}</span>
                  </td>
                  <td className="px-3 py-6 hidden sm:table-cell">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        complemento.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {complemento.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-3 py-6 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => toggleStatus(complemento)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${complemento.status ? 'bg-green-50 hover:bg-green-100' : 'bg-orange-50 hover:bg-orange-100'}`}
                        title={complemento.status ? 'Desabilitar' : 'Habilitar'}
                      >
                        {complemento.status ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-orange-500" />
                        )}
                      </button>
                      <EditButton 
                        onClick={() => onComplementoEdit(complemento)} 
                        size="sm"
                        variant="soft"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        title="Editar"
                      />
                      <DeleteButton 
                        onClick={() => setDeleteModal({ isOpen: true, complemento })} 
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
        onClose={() => setDeleteModal({ isOpen: false, complemento: null })}
        onConfirm={() => handleDelete(deleteModal.complemento)}
        title="Excluir Complemento"
        message={`Tem certeza que deseja excluir o complemento "${deleteModal.complemento?.nome}"? Esta ação não pode ser desfeita.`}
        isLoading={deleting}
      />
    </div>
  );
};

export default ListComplementos;
