import React, { useState, useEffect, useCallback } from 'react';
import { Package } from 'lucide-react';
import api from '../../services/api';
import { readCache, writeCache } from '../../services/cache';
import EditButton from '../buttons/Edit';
import DeleteButton from '../buttons/Delete';
import StatusButton from '../buttons/Status';
import ConfirmDelete from '../elements/ConfirmDelete';

const ListComplementos = ({ estabelecimentoId, onComplementoDelete, onComplementoEdit, activeTab, setActiveTab, searchQuery = '' }) => {
  const [complementos, setComplementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, complemento: null });
  const [deleting, setDeleting] = useState(false);

  const fetchComplementos = useCallback(async () => {
    try {
      const cacheKey = `complementos:${estabelecimentoId}:all`;
      const cached = readCache(cacheKey);
      if (cached && Array.isArray(cached)) {
        setComplementos(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
      setError(null);
      
      console.log('🔍 Buscando complementos para estabelecimento:', estabelecimentoId);
      
      const response = await api.get(`/complementos/${estabelecimentoId}?show_all=1`);
      
      console.log('✅ Resposta da API:', response);
      
      if (response.success) {
        setComplementos(response.data);
        writeCache(cacheKey, response.data);
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

  // Função para recarregar a lista
  const refreshList = useCallback(() => {
    if (estabelecimentoId) {
      fetchComplementos();
    }
  }, [estabelecimentoId, fetchComplementos]);

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

  const displayed = React.useMemo(() => {
    const list = Array.isArray(complementos) ? complementos : [];
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    return list.filter((c) => String(c.nome || '').toLowerCase().includes(q));
  }, [complementos, searchQuery]);

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
            <Package className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum complemento encontrado</h3>
          <p className="text-gray-600">Comece adicionando seu primeiro complemento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden mt-16 md:mt-6 mb-8" style={{ scrollBehavior: 'smooth' }}>
      {/* Layout responsivo: Cards para mobile/tablet, Tabela para desktop */}
      
      {/* Cards para mobile e tablet */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {displayed.map((complemento) => (
                         <div
               key={complemento.id}
               className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 h-20"
             >
               {/* Layout: Conteúdo completo */}
               <div className="flex h-full">
                 {/* Conteúdo - 100% da largura */}
                 <div className="flex-1 p-3 relative">
                   {/* Nome e Preço alinhados */}
                   <div className="mb-2">
                     <h3 className="text-sm font-medium text-gray-900 truncate">
                       {complemento.nome}
                     </h3>
                     <div className="text-sm font-medium text-gray-900">
                       {formatCurrency(complemento.valor_venda)}
                     </div>
                   </div>
                   
                   {/* Status no canto superior direito */}
                   <div className="absolute top-2 right-2">
                     <span
                       className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                         complemento.status
                           ? 'bg-green-100 text-green-800'
                           : 'bg-red-100 text-red-800'
                       }`}
                     >
                       {complemento.status ? 'Ativo' : 'Inativo'}
                     </span>
                   </div>
                   
                   {/* Botões no canto inferior direito */}
                   <div className="absolute bottom-2 right-2 flex items-center gap-1">
                     <StatusButton
                       isActive={complemento.status}
                       onClick={() => toggleStatus(complemento)}
                       size="sm"
                     />
                     <EditButton onClick={() => onComplementoEdit(complemento)} size="sm" />
                     <DeleteButton onClick={() => setDeleteModal({ isOpen: true, complemento })} size="sm" />
                   </div>
                 </div>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* Tabela para desktop com cabeçalho fixo */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          {/* Cabeçalho fixo da tabela */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <table className="w-full">
              <thead>
                <tr>
                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                    Complemento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Preço de Venda
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Ações
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          
          {/* Corpo da tabela com scroll */}
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <tbody className="bg-white divide-y divide-gray-200">
                                 {displayed.map((complemento) => (
                  <tr key={complemento.id} className="hover:bg-gray-50 transition-colors duration-150">
                    {/* Coluna Complemento (Nome) */}
                    <td className="px-4 py-4 w-1/2">
                      <div className="flex items-center">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {complemento.nome}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Coluna Preço de Venda */}
                    <td className="px-4 py-4 w-1/4">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatCurrency(complemento.valor_venda)}
                      </div>
                    </td>

                    {/* Coluna Status */}
                    <td className="px-4 py-4 w-1/6">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          complemento.status
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {complemento.status ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Coluna Ações */}
                    <td className="px-4 py-4 w-1/6">
                      <div className="flex items-center justify-center gap-1">
                        <StatusButton
                          isActive={complemento.status}
                          onClick={() => toggleStatus(complemento)}
                          size="sm"
                        />
                        <EditButton onClick={() => onComplementoEdit(complemento)} size="sm" />
                        <DeleteButton onClick={() => setDeleteModal({ isOpen: true, complemento })} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
