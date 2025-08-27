import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/layout/SearchBar';
import AddButton from '../../components/buttons/AddButton';
import BaseModal from '../../components/modals/Base';
import FormCategorias from '../../components/forms/FormCategorias';
import ListCategorias from '../../components/list/ListCategorias';
import { Tag } from 'lucide-react';

const Categorias = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaParaEditar, setCategoriaParaEditar] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openModal = () => {
    setCategoriaParaEditar(null); // Reset para criação
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCategoriaParaEditar(null); // Reset ao fechar
  };

  const handleSubmit = (formData) => {
    console.log('Categoria processada:', formData);
    setRefreshKey(prev => prev + 1); // Forçar refresh da lista
    closeModal();
  };

  const handleListAction = (action) => {
    if (action.action === 'edit') {
      setCategoriaParaEditar(action.categoria);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header com ícone, barra de pesquisa e botão */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Ícone da página */}
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Tag className="w-6 h-6 text-cyan-600" />
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

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Listagem de Categorias */}
          <ListCategorias onRefresh={refreshKey} onAction={handleListAction} />
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
