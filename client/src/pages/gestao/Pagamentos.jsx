import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CreditCard, MoreHorizontal, Check, X, Trash2 } from 'lucide-react';
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormPagamento from '../../components/forms/FormPagamento';
import ListPagamentos from '../../components/list/ListPagamentos';
import Notification from '../../components/elements/Notification';
import api from '../../services/api';

function Pagamentos() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [pagamentoEditando, setPagamentoEditando] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  
  // Estados para barra de ações no cabeçalho
  const [selectedPagamentos, setSelectedPagamentos] = useState([]);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current && typeof contentRef.current.scrollTo === 'function') {
      contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const handlePagamentoSave = (data) => {
    console.log('Pagamento salvo:', data);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setPagamentoEditando(null);
    // Recarregar lista de pagamentos
    window.dispatchEvent(new CustomEvent('reloadPagamentos'));
    showNotification('success', 'Sucesso!', 'Pagamento salvo com sucesso!');
  };

  const handlePagamentoCancel = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setPagamentoEditando(null);
  };

  const handleEditPagamento = (pagamento) => {
    setPagamentoEditando(pagamento);
    setIsEditModalOpen(true);
  };

  const handlePagamentosLoaded = useCallback((pagamentosData) => {
    setPagamentos(pagamentosData);
  }, []);

  // Funções para controlar seleção e barra de ações
  const handlePagamentoSelectionChange = (selected) => {
    setSelectedPagamentos(selected);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:min-h-screen">
      {/* Header - fixo apenas em mobile */}
      <div className="fixed md:relative top-0 left-0 right-0 md:left-auto md:right-auto z-30 md:z-auto bg-white px-4 md:px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 w-full">
          {/* Botão voltar */}
          <BackButton />
          
          {/* Barra de pesquisa */}
          <div className="flex-1 min-w-0">
            <SearchBar
              placeholder="Pesquisar pagamentos..."
              value={search}
              onChange={setSearch}
            />
          </div>
          
          {/* Botão adicionar */}
          <AddButton 
            text="Pagamentos"
            color="purple"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Título padronizado com outras páginas */}
      <div className="px-4 md:px-6 pt-4 pb-2 mt-16 md:mt-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
              Pagamentos
            </h1>
          </div>
          {/* Ações alinhadas à direita: mostrar apenas quando houver seleção */}
          {(() => {
            const count = selectedPagamentos.length;
            if (count === 0) return null;
            return (
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 relative flex-shrink-0">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">{count} pagamento{count > 1 ? 's' : ''} selecionado{count > 1 ? 's' : ''}</span>
                <button
                  onClick={() => setShowActionsDropdown((v) => !v)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-1.5 sm:px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center justify-center"
                  title="Ações"
                >
                  <MoreHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>

                {showActionsDropdown && (
                  <div className="absolute right-0 top-8 w-36 sm:w-40 bg-white rounded-md shadow-lg border border-gray-200 z-40">
                    <button
                      onClick={async () => {
                        try {
                          if (selectedPagamentos.length === 0) return;
                          await Promise.all(selectedPagamentos.map((p) => api.put(`/pagamentos/${p.id}/status`, { status: true })));
                          setShowActionsDropdown(false);
                          setSelectedPagamentos([]);
                          window.dispatchEvent(new CustomEvent('reloadPagamentos'));
                          showNotification('success', 'Sucesso!', 'Pagamentos ativados com sucesso!');
                        } catch { /* noop */ }
                      }}
                      className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:bg-gray-50"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Ativar</span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (selectedPagamentos.length === 0) return;
                          await Promise.all(selectedPagamentos.map((p) => api.put(`/pagamentos/${p.id}/status`, { status: false })));
                          setShowActionsDropdown(false);
                          setSelectedPagamentos([]);
                          window.dispatchEvent(new CustomEvent('reloadPagamentos'));
                          showNotification('success', 'Sucesso!', 'Pagamentos desativados com sucesso!');
                        } catch { /* noop */ }
                      }}
                      className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 text-orange-600" />
                      <span>Desativar</span>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          if (selectedPagamentos.length === 0) return;
                          await Promise.all(selectedPagamentos.map((p) => api.delete(`/pagamentos/${p.id}`)));
                          setShowActionsDropdown(false);
                          setSelectedPagamentos([]);
                          window.dispatchEvent(new CustomEvent('reloadPagamentos'));
                          showNotification('success', 'Sucesso!', 'Pagamentos excluídos com sucesso!');
                        } catch { /* noop */ }
                      }}
                      className="w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-xs flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:bg-gray-50"
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
      <div className="px-4 md:px-6 pb-6">
        {/* Área de conteúdo com rolagem */}
        <div ref={contentRef} className="flex-1 overflow-y-auto scrollbar-hide">
          <ListPagamentos
            onEdit={handleEditPagamento}
            onPagamentosLoaded={handlePagamentosLoaded}
            searchQuery={search}
            selectedPagamentos={selectedPagamentos}
            onSelectionChange={handlePagamentoSelectionChange}
          />
        </div>
      </div>

      {/* Modal de Adicionar Pagamento */}
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={handlePagamentoCancel}
        title="Cadastrar Pagamento"
        icon={CreditCard}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        onSave={handlePagamentoSave}
        showButtons={true}
      >
        <FormPagamento
          onClose={handlePagamentoCancel}
          onSave={handlePagamentoSave}
        />
      </BaseModal>

      {/* Modal de Editar Pagamento */}
      <BaseModal
        isOpen={isEditModalOpen}
        onClose={handlePagamentoCancel}
        title="Editar Pagamento"
        icon={CreditCard}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
        onSave={handlePagamentoSave}
        showButtons={true}
        headerContent={
          pagamentoEditando?.id ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shadow-sm">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-800">Editar Pagamento</h2>
                <button
                  onClick={async () => {
                    if (window.confirm(`Tem certeza que deseja deletar o pagamento "${pagamentoEditando.nome}"?`)) {
                      try {
                        const response = await api.delete(`/pagamentos/${pagamentoEditando.id}`);
                        if (response.success) {
                          setIsEditModalOpen(false);
                          setPagamentoEditando(null);
                          window.dispatchEvent(new CustomEvent('reloadPagamentos'));
                          showNotification('success', 'Sucesso!', 'Pagamento deletado com sucesso!');
                        } else {
                          throw new Error(response.message || 'Erro ao deletar pagamento');
                        }
                      } catch (error) {
                        console.error('❌ Erro ao deletar pagamento:', error);
                      }
                    }
                  }}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Deletar Pagamento"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : null
        }
      >
        <FormPagamento
          pagamentoData={pagamentoEditando}
          onClose={handlePagamentoCancel}
          onSave={handlePagamentoSave}
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

export default Pagamentos;