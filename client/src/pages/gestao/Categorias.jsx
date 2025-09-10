import React, { useState, useEffect, useRef } from 'react';
import { Tag } from 'lucide-react'; // Icon for page and modal title
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormCategory from '../../components/forms/FormCategory';
import ListCategory from '../../components/list/ListCategory';
import Notification from '../../components/elements/Notification';

function Categorias() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const contentRef = useRef(null);
  useEffect(() => {
    try { contentRef.current?.scrollTo({ top: 0, behavior: 'auto' }); } catch {}
  }, []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState(null);
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [refreshList, setRefreshList] = useState(0);
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [search, setSearch] = useState('');

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

  const handleCategorySave = (data) => {
    console.log('Categoria salva:', data);
    // Fechar modal primeiro
    setIsAddModalOpen(false);
    // Forçar atualização da lista
    setRefreshList(prev => prev + 1);
    // Mostrar notificação de sucesso
    showNotification('success', 'Sucesso!', 'Categoria cadastrada com sucesso!');
  };

  const handleCategoryCancel = () => {
    console.log('handleCategoryCancel executado!');
    setIsAddModalOpen(false);
  };

  const handleCategoryDelete = (categoria) => {
    // Mostrar notificação de sucesso após deletar
    showNotification('success', 'Excluído!', `Categoria "${categoria.nome}" foi excluída com sucesso!`);
  };

  const handleCategoryEdit = (categoria) => {
    console.log('Editando categoria:', categoria);
    setCategoriaToEdit(categoria);
    setIsEditModalOpen(true);
  };

  const handleCategoryEditSave = (data) => {
    console.log('Categoria editada:', data);
    // Fechar modal primeiro
    setIsEditModalOpen(false);
    setCategoriaToEdit(null);
    // Forçar atualização da lista
    setRefreshList(prev => prev + 1);
    // Mostrar notificação de sucesso
    showNotification('success', 'Atualizado!', 'Categoria atualizada com sucesso!');
  };

  const handleCategoryEditCancel = () => {
    setIsEditModalOpen(false);
    setCategoriaToEdit(null);
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
            <SearchBar placeholder="Pesquisar categorias..." value={search} onChange={setSearch} />
          </div>
          
          {/* Botão adicionar */}
          <AddButton 
            text="Categorias"
            color="orange"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Título - fixo apenas em mobile */}
      <div className="fixed md:relative top-16 md:top-auto left-0 right-0 md:left-auto md:right-auto z-40 md:z-auto bg-white px-4 md:px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-6 h-6 text-orange-500" />
          Categorias
        </h1>
      </div>

      {/* Área de conteúdo com rolagem */}
      <div ref={contentRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6 mt-32 md:mt-0">
        {estabelecimentoId ? (
          <ListCategory 
            key={refreshList} 
            estabelecimentoId={estabelecimentoId}
            onCategoryDelete={handleCategoryDelete}
            onCategoryEdit={handleCategoryEdit}
            searchQuery={search}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-600">Carregando dados do estabelecimento...</p>
          </div>
        )}
      </div>

      {/* Modal de Adicionar Categoria */}
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={handleCategoryCancel}
        title="Cadastrar Categoria"
        icon={Tag}
        iconBgColor="bg-orange-500"
        iconColor="text-white"

        onSave={handleCategorySave}
        showButtons={true}
      >
        <FormCategory />
      </BaseModal>

      {/* Modal de Editar Categoria */}
      <BaseModal
        isOpen={isEditModalOpen}
        onClose={handleCategoryEditCancel}
        title="Editar Categoria"
        icon={Tag}
        iconBgColor="bg-blue-500"
        iconColor="text-white"

        onSave={handleCategoryEditSave}
        showButtons={true}
      >
        <FormCategory categoria={categoriaToEdit} />
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

export default Categorias;
