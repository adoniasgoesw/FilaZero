import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/layout/SearchBar';
import AddButton from '../../components/buttons/AddButton';
import BackButton from '../../components/buttons/BackButton';
import BaseModal from '../../components/modals/Base';
import FormProdutos from '../../components/forms/FormProdutos';
import FormComplementos from '../../components/forms/FormComplementos';
import ListProdutos from '../../components/list/ListProdutos';
import ListComplementos from '../../components/list/ListComplementos';
import { Package } from 'lucide-react';

const Produtos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [complementoParaEditar, setComplementoParaEditar] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState('produtos'); // 'produtos' ou 'complementos'

  const openModal = () => {
    if (viewMode === 'produtos') {
      setProdutoParaEditar(null); // Reset para criação
      setComplementoParaEditar(null);
    } else {
      setComplementoParaEditar(null); // Reset para criação
      setProdutoParaEditar(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProdutoParaEditar(null);
    setComplementoParaEditar(null);
  };

  const handleSubmit = (formData) => {
    if (viewMode === 'produtos') {
      console.log('Produto processado:', formData);
    } else {
      console.log('Complemento processado:', formData);
    }
    setRefreshKey(prev => prev + 1); // Forçar refresh da lista
    closeModal();
  };

  const handleListAction = (action) => {
    if (action.action === 'edit') {
      if (viewMode === 'produtos') {
        setProdutoParaEditar(action.produto);
        setComplementoParaEditar(null);
      } else {
        setComplementoParaEditar(action.complemento);
        setProdutoParaEditar(null);
      }
      setIsModalOpen(true);
    }
  };

  const getButtonText = () => {
    if (viewMode === 'produtos') {
      return 'Produto';
    } else {
      return 'Complemento';
    }
  };

  const getSearchPlaceholder = () => {
    if (viewMode === 'produtos') {
      return 'Buscar produtos...';
    } else {
      return 'Buscar complementos...';
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
              <SearchBar placeholder={getSearchPlaceholder()} />
            </div>
            
            {/* Botão ADD */}
            <div className="flex-shrink-0">
              <AddButton 
                onClick={openModal}
                text={getButtonText()}
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
            <h1 className="text-lg font-semibold text-gray-800 ml-3">Produtos & Complementos</h1>
          </div>
        </div>

        {/* Header de Seleção - Produtos vs Complementos */}
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-gray-100">
          <div className="flex justify-start">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('produtos')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'produtos'
                    ? 'bg-white text-cyan-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Produtos
              </button>
              <button
                onClick={() => setViewMode('complementos')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'complementos'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Complementos
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal - Conectado visualmente com o header */}
        <div className="bg-white mx-4 sm:mx-6 rounded-t-xl -mt-1 flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Listagem baseada na seleção */}
          {viewMode === 'produtos' ? (
            <ListProdutos onRefresh={refreshKey} onAction={handleListAction} />
          ) : (
            <ListComplementos onRefresh={refreshKey} onAction={handleListAction} />
          )}
        </div>
      </div>

      {/* Modal com Formulário */}
      <BaseModal 
        isOpen={isModalOpen} 
        onClose={closeModal}
      >
        {viewMode === 'produtos' ? (
          <FormProdutos 
            onClose={closeModal} 
            onSubmit={handleSubmit}
            produtoParaEditar={produtoParaEditar}
          />
        ) : (
          <FormComplementos 
            onClose={closeModal} 
            onSubmit={handleSubmit}
            complementoParaEditar={complementoParaEditar}
          />
        )}
      </BaseModal>
    </div>
  );
};

export default Produtos;
