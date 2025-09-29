import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, MoreHorizontal, Check, X, Trash2 } from 'lucide-react';
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormCliente from '../../components/forms/FormCliente';
import ListClientes from '../../components/list/ListClientes';
import Notification from '../../components/elements/Notification';
import api from '../../services/api';

function Clientes() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  
  // Estados para barra de ações no cabeçalho
  const [selectedClientes, setSelectedClientes] = useState([]);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const contentRef = useRef(null);

  // Estados para clientes (busca direta da API)
  const [clientes, setClientes] = useState([]);

  // Função para adicionar cliente
  const addCliente = (cliente) => {
    setClientes(prev => [...prev, cliente]);
  };

  // Função para atualizar cliente
  const updateCliente = (clienteAtualizado) => {
    setClientes(prev => prev.map(c => c.id === clienteAtualizado.id ? clienteAtualizado : c));
  };

  // Função para remover cliente
  const removeCliente = (clienteId) => {
    setClientes(prev => prev.filter(c => c.id !== clienteId));
  };

  useEffect(() => {
    if (contentRef.current && typeof contentRef.current.scrollTo === 'function') {
      contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    // Buscar o ID do estabelecimento do localStorage
    const id = localStorage.getItem('estabelecimentoId');
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    console.log('🔍 ID do estabelecimento encontrado:', id);
    console.log('🔍 Token encontrado:', token ? 'Sim' : 'Não');
    console.log('🔍 Usuário encontrado:', usuario ? 'Sim' : 'Não');
    
    if (id) {
      const parsedId = parseInt(id);
      console.log('🔍 ID parseado:', parsedId);
      setEstabelecimentoId(parsedId);
    } else {
      console.log('❌ Nenhum estabelecimentoId encontrado no localStorage');
    }
  }, []);

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const handleClientSave = (data) => {
    console.log('Cliente salvo:', data);
    // Adicionar cliente à lista local
    addCliente(data);
    // Disparar evento para atualizar a lista
    window.dispatchEvent(new CustomEvent('reloadClientes'));
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setClienteEditando(null);
    showNotification('success', 'Sucesso!', 'Cliente salvo com sucesso!');
  };

  const handleClientCancel = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setClienteEditando(null);
  };

  const handleEditClient = (cliente) => {
    setClienteEditando(cliente);
    setIsEditModalOpen(true);
  };

  const handleClientesLoaded = useCallback((clientesData) => {
    // Os clientes são gerenciados localmente
    console.log('Clientes carregados:', clientesData.length);
  }, []);

  // Funções para controlar seleção e barra de ações
  const handleClienteSelectionChange = (selected) => {
    setSelectedClientes(selected);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:min-h-screen">
      {/* Header - fixo apenas em mobile */}
      <div className="fixed md:relative top-0 left-0 right-0 md:left-auto md:right-auto z-30 md:z-auto bg-white px-4 md:px-6 pt-6 pb-4">
        {/* Linha 1: Botão voltar + Barra de pesquisa + Botão Add */}
        <div className="flex items-center gap-3 w-full mb-3">
          {/* Botão voltar */}
          <BackButton />
          
          {/* Barra de pesquisa */}
          <div className="flex-1 min-w-0">
            <SearchBar
              placeholder="Pesquisar clientes..."
              value={search}
              onChange={setSearch}
            />
          </div>
          
          {/* Botão adicionar */}
          <AddButton 
            text="Clientes"
            color="green"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>

        {/* Linha 2: Ícone + Título + Cliente selecionado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Clientes
            </h1>
          </div>
          {/* Ações alinhadas à direita: mostrar apenas quando houver seleção */}
          {(() => {
            const count = selectedClientes.length;
            if (count === 0) return null;
            return (
              <div className="flex items-center gap-3 relative">
                <span className="text-sm text-gray-600 whitespace-nowrap">{count} cliente{count > 1 ? 's' : ''} selecionado{count > 1 ? 's' : ''}</span>
                <button
                  onClick={() => setShowActionsDropdown((v) => !v)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center justify-center"
                  title="Ações"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>

                {showActionsDropdown && (
                  <div className="absolute right-0 top-8 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-40">
                    <button
                      onClick={async () => {
                        try {
                          if (selectedClientes.length === 0) return;
                          await Promise.all(selectedClientes.map((c) => api.put(`/clientes/${c.id}/status`, { status: true })));
                          setShowActionsDropdown(false);
                          setSelectedClientes([]);
                          window.dispatchEvent(new CustomEvent('reloadClientes'));
                          showNotification('success', 'Sucesso!', 'Clientes ativados com sucesso!');
                        } catch { /* noop */ }
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Ativar</span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (selectedClientes.length === 0) return;
                          await Promise.all(selectedClientes.map((c) => api.put(`/clientes/${c.id}/status`, { status: false })));
                          setShowActionsDropdown(false);
                          setSelectedClientes([]);
                          window.dispatchEvent(new CustomEvent('reloadClientes'));
                          showNotification('success', 'Sucesso!', 'Clientes desativados com sucesso!');
                        } catch { /* noop */ }
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 text-orange-600" />
                      <span>Desativar</span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (selectedClientes.length === 0) return;
                          await Promise.all(selectedClientes.map((c) => api.delete(`/clientes/${c.id}`)));
                          setShowActionsDropdown(false);
                          setSelectedClientes([]);
                          window.dispatchEvent(new CustomEvent('reloadClientes'));
                          showNotification('success', 'Sucesso!', 'Clientes excluídos com sucesso!');
                        } catch { /* noop */ }
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                      <span>Excluir</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="px-4 md:px-6 pb-6 flex-1 overflow-hidden">
        {/* Área de conteúdo com rolagem oculta */}
        <div ref={contentRef} className="h-full overflow-y-auto scrollbar-hide">
          <ListClientes
            estabelecimentoId={estabelecimentoId}
            onEdit={handleEditClient}
            onClientesLoaded={handleClientesLoaded}
            searchQuery={search}
            selectedClientes={selectedClientes}
            onSelectionChange={handleClienteSelectionChange}
          />
        </div>
      </div>

      {/* Modal de Adicionar Cliente */}
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={handleClientCancel}
        title="Cadastrar Cliente"
        icon={Users}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        onSave={handleClientSave}
        showButtons={true}
      >
        <FormCliente
          onClose={handleClientCancel}
          onSave={handleClientSave}
        />
      </BaseModal>

      {/* Modal de Editar Cliente */}
      <BaseModal
        isOpen={isEditModalOpen}
        onClose={handleClientCancel}
        title="Editar Cliente"
        icon={Users}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        onSave={handleClientSave}
        showButtons={true}
        headerContent={
          clienteEditando?.id ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-800">Editar Cliente</h2>
                <button
                  onClick={async () => {
                    if (window.confirm(`Tem certeza que deseja deletar o cliente "${clienteEditando.nome}"?`)) {
                      try {
                        const response = await api.delete(`/clientes/${clienteEditando.id}`);
                        if (response.success) {
                          setIsEditModalOpen(false);
                          setClienteEditando(null);
                          window.dispatchEvent(new CustomEvent('reloadClientes'));
                          showNotification('success', 'Sucesso!', 'Cliente deletado com sucesso!');
                        } else {
                          throw new Error(response.message || 'Erro ao deletar cliente');
                        }
                      } catch (error) {
                        console.error('❌ Erro ao deletar cliente:', error);
                      }
                    }
                  }}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Deletar Cliente"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : null
        }
      >
        <FormCliente
          clienteData={clienteEditando}
          onClose={handleClientCancel}
          onSave={handleClientSave}
        />
      </BaseModal>

      {/* Notification */}
      <Notification
        isOpen={notification.isOpen}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}

export default Clientes;