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
import ErrorBoundary from '../../components/elements/ErrorBoundary';
import CacheStatus from '../../components/elements/CacheStatus';
import { useProducts, useComplementos } from '../../hooks/useCacheData';
import { Package } from 'lucide-react';

const Produtos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [complementoParaEditar, setComplementoParaEditar] = useState(null);
  const [viewMode, setViewMode] = useState('produtos'); // 'produtos' ou 'complementos'

  // Usar hooks de cache para produtos e complementos
  const {
    data: produtos,
    loading: loadingProdutos,
    error: errorProdutos,
    fromCache: fromCacheProdutos,
    lastUpdated: lastUpdatedProdutos,
    saveData: saveProduto,
    deleteData: deleteProduto,
    refresh: refreshProdutos,
    invalidateCache: invalidateProdutos
  } = useProducts({
    autoFetch: true,
    forceRefresh: false,
    ttlMinutes: 60
  });

  const {
    data: complementos,
    loading: loadingComplementos,
    error: errorComplementos,
    fromCache: fromCacheComplementos,
    lastUpdated: lastUpdatedComplementos,
    saveData: saveComplemento,
    deleteData: deleteComplemento,
    refresh: refreshComplementos,
    invalidateCache: invalidateComplementos
  } = useComplementos({
    autoFetch: true,
    forceRefresh: false,
    ttlMinutes: 60
  });

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

  const handleSubmit = async (formData) => {
    try {
      if (viewMode === 'produtos') {
        const isUpdate = !!produtoParaEditar;
        await saveProduto(formData, isUpdate);
        console.log('✅ Produto processado com sucesso:', formData);
      } else {
        const isUpdate = !!complementoParaEditar;
        await saveComplemento(formData, isUpdate);
        console.log('✅ Complemento processado com sucesso:', formData);
      }
      closeModal();
    } catch (error) {
      console.error('❌ Erro ao processar dados:', error);
      // Aqui você pode mostrar uma notificação de erro para o usuário
    }
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
    } else if (action.action === 'delete') {
      if (viewMode === 'produtos') {
        handleDeleteProduto(action.produto.id);
      } else {
        handleDeleteComplemento(action.complemento.id);
      }
    }
  };

  const handleDeleteProduto = async (id) => {
    try {
      await deleteProduto(id);
      console.log('✅ Produto deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
    }
  };

  const handleDeleteComplemento = async (id) => {
    try {
      await deleteComplemento(id);
      console.log('✅ Complemento deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar complemento:', error);
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

  // Dados atuais baseados no modo de visualização
  const currentData = viewMode === 'produtos' ? produtos : complementos;
  const currentLoading = viewMode === 'produtos' ? loadingProdutos : loadingComplementos;
  const currentError = viewMode === 'produtos' ? errorProdutos : errorComplementos;
  const currentFromCache = viewMode === 'produtos' ? fromCacheProdutos : fromCacheComplementos;
  const currentLastUpdated = viewMode === 'produtos' ? lastUpdatedProdutos : lastUpdatedComplementos;

  // Funções baseadas no modo de visualização
  const currentRefresh = viewMode === 'produtos' ? refreshProdutos : refreshComplementos;
  const currentInvalidate = viewMode === 'produtos' ? invalidateProdutos : invalidateComplementos;

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
            <div className="flex items-center justify-between">
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

              {/* Status do cache */}
              <CacheStatus
                fromCache={currentFromCache}
                lastUpdated={currentLastUpdated}
                loading={currentLoading}
                error={currentError}
                onRefresh={currentRefresh}
                onInvalidate={currentInvalidate}
                showControls={true}
                size="default"
              />
            </div>
          </div>
        </div>

        {/* Conteúdo Principal - Apenas a listagem rola */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white mx-4 sm:mx-6 rounded-t-xl -mt-1 p-4 sm:p-6">
            {/* Listagem baseada na seleção */}
            {viewMode === 'produtos' ? (
              <ListProdutos 
                produtos={currentData || []}
                loading={currentLoading}
                onAction={handleListAction}
              />
            ) : (
              <ListComplementos 
                complementos={currentData || []}
                loading={currentLoading}
                onAction={handleListAction}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal para formulários */}
      <BaseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={viewMode === 'produtos' ? 'Produtos' : 'Complementos'}
        size="4xl"
      >
        {viewMode === 'produtos' ? (
          <ErrorBoundary>
            <FormProdutos
              onClose={closeModal}
              onSubmit={handleSubmit}
              produtoParaEditar={produtoParaEditar}
            />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <FormComplementos
              onClose={closeModal}
              onSubmit={handleSubmit}
              complementoParaEditar={complementoParaEditar}
            />
          </ErrorBoundary>
        )}
      </BaseModal>
    </div>
  );
};

export default Produtos;
