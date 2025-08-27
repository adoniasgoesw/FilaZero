import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/layout/SearchBar';
import AddButton from '../../components/buttons/AddButton';
import BackButton from '../../components/buttons/BackButton';
import BaseModal from '../../components/modals/Base';
import FormProdutos from '../../components/forms/FormProdutos';
import ListProdutos from '../../components/list/ListProdutos';
import { Package } from 'lucide-react';

const Produtos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openModal = () => {
    setProdutoParaEditar(null); // Reset para criação
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProdutoParaEditar(null); // Reset ao fechar
  };

  const handleSubmit = (formData) => {
    console.log('Produto processado:', formData);
    setRefreshKey(prev => prev + 1); // Forçar refresh da lista
    closeModal();
  };

  const handleListAction = (action) => {
    if (action.action === 'edit') {
      setProdutoParaEditar(action.produto);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
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
              <SearchBar placeholder="Buscar produtos..." />
            </div>
            
            {/* Botão ADD */}
            <div className="flex-shrink-0">
              <AddButton 
                onClick={openModal}
                text="Novo Produto"
                className="bg-gradient-to-r from-cyan-300 to-cyan-400 hover:from-cyan-400 hover:to-cyan-500 text-white h-12"
              />
            </div>
          </div>
        </div>

        {/* Título da página com ícone */}
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-cyan-600" />
            </div>
            <h1 className="text-lg font-semibold text-gray-800 ml-3">Produtos</h1>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Listagem de Produtos */}
          <ListProdutos onRefresh={refreshKey} onAction={handleListAction} />
        </div>
      </div>

      {/* Modal com Formulário */}
      <BaseModal 
        isOpen={isModalOpen} 
        onClose={closeModal}
      >
        <FormProdutos 
          onClose={closeModal} 
          onSubmit={handleSubmit}
          produtoParaEditar={produtoParaEditar}
        />
      </BaseModal>
    </div>
  );
};

export default Produtos;
