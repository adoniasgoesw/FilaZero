import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Mail, Phone, CreditCard, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
import EditButton from '../buttons/Edit';
import DeleteButton from '../buttons/Delete';
import StatusButton from '../buttons/Status';
import ConfirmDelete from '../elements/ConfirmDelete';
import { useClientes, useClientesMutation } from '../../hooks/useCache';

const ListClientes = ({ 
  estabelecimentoId,
  onEdit, 
  onClientesLoaded,
  searchQuery = '',
  selectedClientes: externalSelectedClientes = [],
  onSelectionChange
}) => {
  console.log('🔍 ListClientes renderizado com estabelecimentoId:', estabelecimentoId);
  
  // Usar cache para clientes (3 segundos)
  const { data: clientes = [], isLoading, error, refetch } = useClientes(estabelecimentoId);
  const clientesMutation = useClientesMutation();
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, cliente: null });
  const [deleting, setDeleting] = useState(false);

  // Chamar callback quando dados mudarem
  useEffect(() => {
    if (clientes.length > 0 && onClientesLoaded) {
      onClientesLoaded(clientes);
    }
  }, [clientes, onClientesLoaded]);
  
  // Estados para seleção múltipla
  const [selectAll, setSelectAll] = useState(false);
  
  // Estados para dropdown de ações
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState({ isOpen: false, clientes: [] });
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const displayedClientes = React.useMemo(() => {
    const list = Array.isArray(clientes) ? clientes : [];
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    const normalize = (s) => String(s || '').toLowerCase();
    return list.filter((c) => {
      const name = normalize(c.nome);
      const cpf = normalize(c.cpf);
      const cnpj = normalize(c.cnpj);
      const email = normalize(c.email);
      const whatsapp = normalize(c.whatsapp);
      return name.includes(q) || cpf.includes(q) || cnpj.includes(q) || email.includes(q) || whatsapp.includes(q);
    });
  }, [clientes, searchQuery]);


  // Controlar seleção baseada nos clientes selecionados externos
  useEffect(() => {
    setSelectAll(externalSelectedClientes.length === displayedClientes.length && displayedClientes.length > 0);
  }, [externalSelectedClientes.length, displayedClientes.length]);

  // Função para recarregar a lista
  const refreshList = useCallback(() => {
    refetch();
  }, [refetch]);

  // Função para alternar status do cliente
  const toggleStatus = async (cliente) => {
    try {
      const response = await api.put(`/clientes/${cliente.id}/status`, {
        status: !cliente.status
      });
      
      if (response.success) {
        // Invalidar cache automaticamente
        clientesMutation.mutate();
        
        console.log('✅ Status do cliente alterado:', cliente.nome, 'Novo status:', !cliente.status);
      } else {
        throw new Error(response.message || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      setError(error.message || 'Erro ao alterar status do cliente');
    }
  };

  // Função para selecionar/deselecionar cliente individual
  const handleClienteSelect = (cliente) => {
    if (onSelectionChange) {
      const isSelected = externalSelectedClientes.some(c => c.id === cliente.id);
      if (isSelected) {
        onSelectionChange(externalSelectedClientes.filter(c => c.id !== cliente.id));
      } else {
        onSelectionChange([...externalSelectedClientes, cliente]);
      }
    }
  };

  // Função para selecionar/deselecionar todos os clientes
  const handleSelectAll = () => {
    if (onSelectionChange) {
      if (selectAll) {
        onSelectionChange([]);
      } else {
        onSelectionChange([...displayedClientes]);
      }
    }
  };

  // Função para clicar no cliente (abrir modal de edição)
  const handleClienteClick = (cliente) => {
    onEdit(cliente);
  };

  // Função para deletar múltiplos clientes
  const handleBulkDelete = async () => {
    try {
      setBulkDeleting(true);
      
      const promises = externalSelectedClientes.map(cliente => 
        api.delete(`/clientes/${cliente.id}`)
      );
      
      await Promise.all(promises);
      
      // Invalidar cache automaticamente
      clientesMutation.mutate();
      
      // Fechar modal e limpar seleção
      setBulkDeleteModal({ isOpen: false, clientes: [] });
      onSelectionChange([]);
      setShowActionsDropdown(false);
      
      console.log(`✅ ${externalSelectedClientes.length} clientes deletados`);
    } catch (error) {
      console.error('❌ Erro ao deletar clientes em lote:', error);
      setError('Erro ao deletar clientes');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Função para deletar cliente
  const handleDelete = async (cliente) => {
    try {
      setDeleting(true);
      const response = await api.delete(`/clientes/${cliente.id}`);
      
      if (response.success) {
        // Invalidar cache automaticamente
        clientesMutation.mutate();
        
        // Fechar modal
        setDeleteModal({ isOpen: false, cliente: null });
        
        console.log('✅ Cliente deletado:', cliente.nome);
      } else {
        throw new Error(response.message || 'Erro ao deletar cliente');
      }
    } catch (error) {
      console.error('❌ Erro ao deletar cliente:', error);
      setError(error.message || 'Erro ao deletar cliente');
    } finally {
      setDeleting(false);
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

  if (isLoading && clientes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-3 text-gray-600">Carregando clientes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <User className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar clientes</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
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

  if (clientes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <User className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600">Nenhum cliente encontrado</p>
          <p className="text-gray-500 text-sm">Adicione um novo cliente para começar</p>
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
                <th className="px-1 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">CPF/CNPJ</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contato</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedClientes.map((cliente) => (
                <tr 
                  key={cliente.id}
                  className="transition-colors cursor-pointer hover:bg-gray-50"
                  onClick={() => handleClienteClick(cliente)}
                >
                  <td className="px-1 py-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center h-6 ml-2">
                      <input 
                        type="checkbox" 
                        checked={externalSelectedClientes.some(c => c.id === cliente.id)}
                        onChange={() => handleClienteSelect(cliente)}
                        className="w-4 h-4 text-blue-600 bg-white border-2 border-blue-500 rounded-full focus:ring-blue-500 focus:ring-2 checked:bg-blue-500 checked:border-blue-500" 
                      />
                    </div>
                  </td>
                  <td className="px-1 py-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-2 shadow-sm flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">{cliente.nome}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {cliente.cpf || cliente.cnpj || 'Sem documento'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-6 hidden sm:table-cell">
                    <span className="text-sm font-medium text-gray-600">
                      {cliente.cpf || cliente.cnpj || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-6">
                    <div className="space-y-1">
                      {cliente.whatsapp && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400"/>
                          <span className="text-sm font-medium text-gray-600">{cliente.whatsapp}</span>
                        </div>
                      )}
                      {cliente.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400"/>
                          <span className="text-sm font-medium text-gray-600 truncate max-w-[200px]">{cliente.email}</span>
                        </div>
                      )}
                      {!cliente.whatsapp && !cliente.email && '—'}
                    </div>
                  </td>
                  <td className="px-3 py-6 hidden md:table-cell">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cliente.status
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {cliente.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-3 py-6 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => toggleStatus(cliente)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${cliente.status ? 'bg-green-50 hover:bg-green-100' : 'bg-orange-50 hover:bg-orange-100'}`}
                        title={cliente.status ? 'Desativar' : 'Ativar'}
                      >
                        {cliente.status ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-orange-500" />
                        )}
                      </button>
                      <EditButton 
                        onClick={() => onEdit(cliente)} 
                        size="sm"
                        variant="soft"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        title="Editar"
                      />
                      <DeleteButton 
                        onClick={() => setDeleteModal({ isOpen: true, cliente })} 
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
        onClose={() => setDeleteModal({ isOpen: false, cliente: null })}
        onConfirm={() => handleDelete(deleteModal.cliente)}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${deleteModal.cliente?.nome}"? Esta ação não pode ser desfeita.`}
        isLoading={deleting}
      />

      {/* Modal de confirmação de exclusão em lote */}
      <ConfirmDelete
        isOpen={bulkDeleteModal.isOpen}
        onClose={() => setBulkDeleteModal({ isOpen: false, clientes: [] })}
        onConfirm={handleBulkDelete}
        title="Excluir Clientes"
        message={`Tem certeza que deseja excluir ${bulkDeleteModal.clientes.length} cliente${bulkDeleteModal.clientes.length > 1 ? 's' : ''}? Esta ação não pode ser desfeita.`}
        isLoading={bulkDeleting}
      />
    </div>
  );
};

export default ListClientes;