import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react'; // Icon for page and modal title
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormProduct from '../../components/forms/FormProduct';
import FormComplementos from '../../components/forms/FormComplementos';
import ListProduct from '../../components/list/ListProduct';
import ListComplementos from '../../components/list/ListComplementos';
import Notification from '../../components/elements/Notification';

function Produtos() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [produtoToEdit, setProdutoToEdit] = useState(null);
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [activeTab, setActiveTab] = useState('produtos'); // 'produtos' ou 'complementos'
  
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:min-h-screen">
      {/* Header - fixo apenas em mobile */}
      <div className="fixed md:relative top-0 left-0 right-0 md:left-auto md:right-auto z-50 md:z-auto bg-white px-4 md:px-6 py-4">
        <div className="flex items-center gap-3 w-full">
          {/* Botão voltar */}
          <BackButton />
          
          {/* Barra de pesquisa */}
          <div className="flex-1 min-w-0">
            <SearchBar placeholder={activeTab === 'produtos' ? 'Pesquisar produtos...' : 'Pesquisar complementos...'} />
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

      {/* Título fixo */}
      <div className="fixed md:relative top-16 md:top-auto left-0 right-0 md:left-auto md:right-auto z-40 md:z-auto bg-white px-4 md:px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-red-500" />
          {activeTab === 'produtos' ? 'Produtos' : 'Complementos'}
        </h1>
      </div>



      {/* Header de navegação */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex bg-gray-100 w-64">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-tl-lg ${
              activeTab === 'produtos'
                ? 'bg-gray-400 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setActiveTab('complementos')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-tr-lg ${
              activeTab === 'complementos'
                ? 'bg-gray-400 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Complementos
          </button>
        </div>
      </div>

      {/* Área de conteúdo com rolagem */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">

        {/* Conteúdo baseado na aba ativa */}
        {estabelecimentoId ? (
          activeTab === 'produtos' ? (
            <ListProduct 
              key={refreshList} 
              estabelecimentoId={estabelecimentoId}
              onProductDelete={handleProductDelete}
              onProductEdit={handleProductEdit}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ) : (
            <ListComplementos 
              key={refreshComplementosList} 
              estabelecimentoId={estabelecimentoId}
              onComplementoDelete={handleComplementoDelete}
              onComplementoEdit={handleComplementoEdit}
            />
          )
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-600">Carregando dados do estabelecimento...</p>
          </div>
        )}
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
