import React, { useState, useEffect, useRef } from 'react';
import { Package, MoreHorizontal, Check, X, Trash2 } from 'lucide-react'; // Icon for page and modal title
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormProduct from '../../components/forms/FormProduct';
import FormComplementos from '../../components/forms/FormComplementos';
import ListProduct from '../../components/list/ListProduct';
import ListComplementos from '../../components/list/ListComplementos';
import Notification from '../../components/elements/Notification';
import api from '../../services/api';
import StatusButton from '../../components/buttons/Status';
import DeleteButton from '../../components/buttons/Delete';

function Produtos() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const contentRef = useRef(null);
  useEffect(() => {
    if (contentRef.current && typeof contentRef.current.scrollTo === 'function') {
      contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [produtoToEdit, setProdutoToEdit] = useState(null);
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [activeTab, setActiveTab] = useState('produtos'); // 'produtos' ou 'complementos'
  const [search, setSearch] = useState('');
  
  // Estados para complementos
  const [isAddComplementoModalOpen, setIsAddComplementoModalOpen] = useState(false);
  const [isEditComplementoModalOpen, setIsEditComplementoModalOpen] = useState(false);
  const [complementoToEdit, setComplementoToEdit] = useState(null);
  const [refreshComplementosList, setRefreshComplementosList] = useState(0);
  const [formProductState, setFormProductState] = useState({
    showComplementoForm: false,
    complementosSelecionados: [],
    activeFormTab: 'detalhes'
  });
  
  // Estados para barra de ações no cabeçalho
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedComplementos, setSelectedComplementos] = useState([]);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

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

  const handleProductSave = (data) => {
    console.log('Produto salvo:', data);
    // Fechar modal primeiro
    setIsAddModalOpen(false);
    // Forçar atualização da lista
    setRefreshList(prev => prev + 1);
    // Mostrar notificação de sucesso
    showNotification('success', 'Sucesso!', 'Produto cadastrado com sucesso!');
  };

  const handleProductCancel = () => {
    console.log('handleProductCancel executado!');
    setIsAddModalOpen(false);
  };

  const handleProductDelete = (produto) => {
    // Mostrar notificação de sucesso após deletar
    showNotification('success', 'Excluído!', `Produto "${produto.nome}" foi excluído com sucesso!`);
  };

  const handleProductEdit = (produto) => {
    console.log('Editando produto:', produto);
    setProdutoToEdit(produto);
    setIsEditModalOpen(true);
  };

  const handleProductEditSave = (data) => {
    console.log('Produto editado:', data);
    // Fechar modal primeiro
    setIsEditModalOpen(false);
    setProdutoToEdit(null);
    // Forçar atualização da lista
    setRefreshList(prev => prev + 1);
    // Mostrar notificação de sucesso
    showNotification('success', 'Atualizado!', 'Produto atualizado com sucesso!');
  };

  const handleProductEditCancel = () => {
    setIsEditModalOpen(false);
    setProdutoToEdit(null);
  };

  // Funções para complementos
  const handleComplementoSave = (data) => {
    console.log('Complemento salvo:', data);
    setIsAddComplementoModalOpen(false);
    setRefreshComplementosList(prev => prev + 1);
    showNotification('success', 'Sucesso!', 'Complemento cadastrado com sucesso!');
  };

  const handleComplementoCancel = () => {
    setIsAddComplementoModalOpen(false);
  };

  const handleComplementoDelete = (complemento) => {
    showNotification('success', 'Excluído!', `Complemento "${complemento.nome}" foi excluído com sucesso!`);
  };

  const handleComplementoEdit = (complemento) => {
    console.log('Editando complemento:', complemento);
    setComplementoToEdit(complemento);
    setIsEditComplementoModalOpen(true);
  };

  const handleComplementoEditSave = (data) => {
    console.log('Complemento editado:', data);
    setIsEditComplementoModalOpen(false);
    setComplementoToEdit(null);
    setRefreshComplementosList(prev => prev + 1);
    showNotification('success', 'Atualizado!', 'Complemento atualizado com sucesso!');
  };

  const handleComplementoEditCancel = () => {
    setIsEditComplementoModalOpen(false);
    setComplementoToEdit(null);
  };

  // Funções para controlar seleção e barra de ações
  const handleProductSelectionChange = (selected) => {
    setSelectedProducts(selected);
  };

  const handleComplementoSelectionChange = (selected) => {
    setSelectedComplementos(selected);
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
              placeholder={activeTab === 'produtos' ? 'Pesquisar produtos...' : 'Pesquisar complementos...'}
              value={search}
              onChange={setSearch}
            />
          </div>
          
          {/* Botão adicionar */}
          <AddButton 
            text={activeTab === 'produtos' ? 'Produtos' : 'Complementos'}
            color="red"
            onClick={() => {
              if (activeTab === 'produtos') {
                setIsAddModalOpen(true);
              } else {
                setIsAddComplementoModalOpen(true);
              }
            }}
          />
        </div>
      </div>

      {/* Título padronizado com outras páginas (Clientes/Categorias) */}
      <div className="px-4 md:px-6 pt-4 pb-2 mt-16 md:mt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'produtos' ? 'Produtos' : 'Complementos'}
            </h1>
          </div>
          {/* Ações alinhadas à direita: mostrar apenas quando houver seleção */}
          {(() => {
            const count = activeTab === 'produtos' ? selectedProducts.length : selectedComplementos.length;
            if (count === 0) return null;
            return (
              <div className="flex items-center gap-3 relative">
                <span className="text-sm text-gray-600 whitespace-nowrap">{count} produto{count > 1 ? 's' : ''} selecionado{count > 1 ? 's' : ''}</span>
                <button
                  onClick={() => setShowActionsDropdown((v) => !v)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center justify-center"
                  title="Ações"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>

                {showActionsDropdown && (
                  <div className="absolute right-0 top-8 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={async () => {
                        try {
                          if (activeTab !== 'produtos' || selectedProducts.length === 0) return;
                          await Promise.all(selectedProducts.map((p) => api.put(`/produtos/${p.id}/status`)));
                          setShowActionsDropdown(false);
                          setSelectedProducts([]);
                          setRefreshList((v) => v + 1);
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
                          if (activeTab !== 'produtos' || selectedProducts.length === 0) return;
                          await Promise.all(selectedProducts.map((p) => api.put(`/produtos/${p.id}/status`)));
                          setShowActionsDropdown(false);
                          setSelectedProducts([]);
                          setRefreshList((v) => v + 1);
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
                          if (activeTab !== 'produtos' || selectedProducts.length === 0) return;
                          await Promise.all(selectedProducts.map((p) => api.delete(`/produtos/${p.id}`)));
                          setShowActionsDropdown(false);
                          setSelectedProducts([]);
                          setRefreshList((v) => v + 1);
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
      <div className="px-4 md:px-6 pb-6">
        {/* Abas modernas */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('produtos')}
                  className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                    activeTab === 'produtos'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Produtos
                </button>
                <button
                  onClick={() => setActiveTab('complementos')}
                  className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                    activeTab === 'complementos'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Complementos
                </button>
              </nav>
              
            </div>
          </div>
        </div>

        {/* Área de conteúdo com rolagem */}
        <div ref={contentRef} className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Conteúdo baseado na aba ativa */}
          {estabelecimentoId ? (
            activeTab === 'produtos' ? (
              <ListProduct 
                key={refreshList} 
                estabelecimentoId={estabelecimentoId}
                onProductDelete={handleProductDelete}
                onProductEdit={handleProductEdit}
                searchQuery={search}
                selectedProducts={selectedProducts}
                onSelectionChange={handleProductSelectionChange}
              />
            ) : (
              <ListComplementos 
                key={refreshComplementosList} 
                estabelecimentoId={estabelecimentoId}
                onComplementoDelete={handleComplementoDelete}
                onComplementoEdit={handleComplementoEdit}
                searchQuery={search}
                selectedComplementos={selectedComplementos}
                onSelectionChange={handleComplementoSelectionChange}
              />
            )
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <p className="text-gray-600">Carregando dados do estabelecimento...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Adicionar Produto */}
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={handleProductCancel}
        title="Cadastrar Produto"
        icon={Package}
        iconBgColor="bg-red-500"
        iconColor="text-white"
        onSave={handleProductSave}
        showButtons={true}
        saveText={formProductState.activeFormTab === 'complementos' && formProductState.showComplementoForm 
          ? `Salvar (${formProductState.complementosSelecionados.length})` 
          : 'Salvar'
        }
      >
        <FormProduct 
          onStateChange={setFormProductState}
        />
      </BaseModal>

      {/* Modal de Editar Produto */}
      <BaseModal
        isOpen={isEditModalOpen}
        onClose={handleProductEditCancel}
        title="Editar Produto"
        icon={Package}
        iconBgColor="bg-blue-500"
        iconColor="text-white"
        onSave={handleProductEditSave}
        showButtons={true}
        saveText={formProductState.activeFormTab === 'complementos' && formProductState.showComplementoForm 
          ? `Salvar (${formProductState.complementosSelecionados.length})` 
          : 'Salvar'
        }
      >
        <FormProduct produto={produtoToEdit} onStateChange={setFormProductState} />
      </BaseModal>

      {/* Modal de Adicionar Complemento */}
      <BaseModal
        isOpen={isAddComplementoModalOpen}
        onClose={handleComplementoCancel}
        title="Cadastrar Complemento"
        icon={Package}
        iconBgColor="bg-red-500"
        iconColor="text-white"
        onSave={handleComplementoSave}
        showButtons={true}
      >
        <FormComplementos />
      </BaseModal>

      {/* Modal de Editar Complemento */}
      <BaseModal
        isOpen={isEditComplementoModalOpen}
        onClose={handleComplementoEditCancel}
        title="Editar Complemento"
        icon={Package}
        iconBgColor="bg-blue-500"
        iconColor="text-white"
        onSave={handleComplementoEditSave}
        showButtons={true}
      >
        <FormComplementos complemento={complementoToEdit} />
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

export default Produtos;
