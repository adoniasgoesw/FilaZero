import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/layout/SearchBar';
import AddButton from '../../components/buttons/AddButton';
import BackButton from '../../components/buttons/BackButton';
import BaseModal from '../../components/modals/Base';
import FormCategorias from '../../components/forms/FormCategorias';
import ListCategorias from '../../components/list/ListCategorias';
import CacheStatus from '../../components/elements/CacheStatus';
import { useCategories } from '../../hooks/useCacheData';
import { Tag } from 'lucide-react';

const Categorias = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaParaEditar, setCategoriaParaEditar] = useState(null);
  
  // Usar hook de cache para categorias
  const {
    data: categorias,
    loading,
    error,
    fromCache,
    lastUpdated,
    saveData,
    deleteData,
    refresh,
    invalidateCache
  } = useCategories({
    autoFetch: true,
    forceRefresh: false,
    ttlMinutes: 60
  });

  const openModal = () => {
    setCategoriaParaEditar(null); // Reset para criação
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoriaParaEditar(null); // Reset ao fechar
  };

  const handleSubmit = async (formData) => {
    try {
      const isUpdate = !!categoriaParaEditar;
      await saveData(formData, isUpdate);
      console.log('✅ Categoria processada com sucesso:', formData);
      closeModal();
    } catch (error) {
      console.error('❌ Erro ao processar categoria:', error);
      // Aqui você pode mostrar uma notificação de erro para o usuário
    }
  };

  const handleListAction = (action) => {
    if (action.action === 'edit') {
      setCategoriaParaEditar(action.categoria);
      setIsModalOpen(true);
    } else if (action.action === 'delete') {
      handleDelete(action.categoria.id);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteData(id);
      console.log('✅ Categoria deletada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar categoria:', error);
      // Aqui você pode mostrar uma notificação de erro para o usuário
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Container fixo para elementos que não devem rolar */}
        <div className="sticky top-0 z-10 bg-gray-50">
          {/* Header com botão voltar, barra de pesquisa e botão */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Botão Voltar */}
              <div className="flex-shrink-0">
                <BackButton 
                  onClick={() => window.history.back()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-12 px-4"
                />
              </div>
              
              {/* Barra de pesquisa */}
              <div className="flex-1 mx-6">
                <SearchBar placeholder="Buscar categorias..." />
              </div>
              
              {/* Botão ADD */}
              <div className="flex-shrink-0">
                <AddButton 
                  onClick={openModal}
                  text="Mais Categorias"
                  className="bg-gradient-to-r from-cyan-300 to-cyan-400 hover:from-cyan-400 hover:to-cyan-500 text-white h-12"
                />
              </div>
            </div>
          </div>

          {/* Título da página com ícone e status do cache */}
          <div className="bg-white px-4 sm:px-6 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-cyan-600" />
                </div>
                <h1 className="text-lg font-semibold text-gray-800 ml-3">Categorias</h1>
              </div>
              
              {/* Status do cache */}
              <CacheStatus
                fromCache={fromCache}
                lastUpdated={lastUpdated}
                loading={loading}
                error={error}
                onRefresh={refresh}
                onInvalidate={invalidateCache}
                showControls={true}
                size="default"
              />
            </div>
          </div>
        </div>

        {/* Conteúdo Principal - Apenas a listagem rola */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Listagem de Categorias */}
            <ListCategorias 
              categorias={categorias || []}
              loading={loading}
              onAction={handleListAction}
            />
          </div>
        </div>
      </div>

      {/* Modal com Formulário */}
      <BaseModal 
        isOpen={isModalOpen} 
        onClose={closeModal}
      >
        <FormCategorias 
          onClose={closeModal} 
          onSubmit={handleSubmit}
          categoriaParaEditar={categoriaParaEditar}
        />
      </BaseModal>
    </div>
  );
};

export default Categorias;
