import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react'; // Icon for page and modal title
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormProduct from '../../components/forms/FormProduct';
import ListProduct from '../../components/list/ListProduct';
import Notification from '../../components/elements/Notification';

function Produtos() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [produtoToEdit, setProdutoToEdit] = useState(null);
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });

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

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:min-h-screen">
      {/* Header - fixo apenas em mobile */}
      <div className="fixed md:relative top-0 left-0 right-0 md:left-auto md:right-auto z-50 md:z-auto bg-white px-4 md:px-6 py-4">
        <div className="flex items-center gap-3 w-full">
          {/* Botão voltar */}
          <BackButton />
          
          {/* Barra de pesquisa */}
          <div className="flex-1 min-w-0">
            <SearchBar placeholder="Pesquisar produtos..." />
          </div>
          
          {/* Botão adicionar */}
          <AddButton 
            text="Produtos"
            color="red"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Título fixo */}
      <div className="fixed md:relative top-16 md:top-auto left-0 right-0 md:left-auto md:right-auto z-40 md:z-auto bg-white px-4 md:px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-red-500" />
          Produtos
        </h1>
      </div>

      {/* Área de conteúdo com rolagem */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 mt-32 md:mt-8">
        {estabelecimentoId ? (
          <ListProduct 
            key={refreshList} 
            estabelecimentoId={estabelecimentoId}
            onProductDelete={handleProductDelete}
            onProductEdit={handleProductEdit}
          />
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
      >
        <FormProduct />
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
      >
        <FormProduct produto={produtoToEdit} />
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
