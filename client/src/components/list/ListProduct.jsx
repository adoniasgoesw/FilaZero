import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, Package } from 'lucide-react';
import api from '../../services/api';
import EditButton from '../buttons/Edit';
import DeleteButton from '../buttons/Delete';
import StatusButton from '../buttons/Status';
import ConfirmDelete from '../elements/ConfirmDelete';

const ListProduct = ({ estabelecimentoId, onProductDelete, onProductEdit }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, produto: null });
  const [deleting, setDeleting] = useState(false);
  
  // Estados para rolagem infinita
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchProdutos = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      console.log('🔍 Buscando produtos para estabelecimento:', estabelecimentoId, 'Página:', page);
      console.log('🔍 URL da API:', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/produtos/${estabelecimentoId}?page=${page}&limit=${itemsPerPage}`);
      
      const response = await api.get(`/produtos/${estabelecimentoId}?page=${page}&limit=${itemsPerPage}`);
      
      console.log('✅ Resposta da API:', response);
      
      if (response.success) {
        const newProdutos = response.data.produtos || response.data;
        const total = response.data.total || newProdutos.length;
        const totalPages = Math.ceil(total / itemsPerPage);
        
        if (append) {
          setProdutos(prev => [...prev, ...newProdutos]);
        } else {
          setProdutos(newProdutos);
        }
        
        setTotalPages(totalPages);
        setHasMore(page < totalPages);
        setCurrentPage(page);
        
        console.log('✅ Produtos carregados:', newProdutos.length, 'Total:', total, 'Páginas:', totalPages);
      } else {
        setError('Erro ao carregar produtos');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar produtos:', err);
      console.error('❌ Detalhes do erro:', err.message);
      setError(`Erro ao carregar produtos: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [estabelecimentoId, itemsPerPage]);

  useEffect(() => {
    if (estabelecimentoId) {
      // Reset states when estabelecimentoId changes
      setProdutos([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchProdutos(1, false);
    }
  }, [estabelecimentoId, fetchProdutos]);

  // Função para carregar mais produtos
  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchProdutos(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, currentPage, fetchProdutos]);

  // Detectar rolagem para carregar mais produtos
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreProducts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreProducts]);

  const handleEdit = (produto) => {
    console.log('Editar produto:', produto);
    if (onProductEdit) {
      onProductEdit(produto);
    }
  };

  const handleDelete = (produto) => {
    console.log('Abrir modal de exclusão para:', produto);
    setDeleteModal({ isOpen: true, produto });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.produto) return;

    setDeleting(true);
    try {
      console.log('Deletando produto:', deleteModal.produto);
      
      const response = await api.delete(`/produtos/${deleteModal.produto.id}`);
      
      if (response.success) {
        console.log('✅ Produto deletado com sucesso:', response.data);
        
        // Remover o produto da lista local
        setProdutos(prev => prev.filter(prod => prod.id !== deleteModal.produto.id));
        
        // Fechar modal
        setDeleteModal({ isOpen: false, produto: null });
        
        // Chamar callback para mostrar notificação
        if (onProductDelete) {
          onProductDelete(deleteModal.produto);
        }
      } else {
        console.error('❌ Erro ao deletar produto:', response.message);
        setError('Erro ao deletar produto: ' + response.message);
      }
    } catch (err) {
      console.error('❌ Erro ao deletar produto:', err);
      setError('Erro ao deletar produto: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, produto: null });
  };

  const handleToggleStatus = async (produto) => {
    console.log('Alterar status do produto:', produto);
    
    try {
      const response = await api.put(`/produtos/${produto.id}/status`);
      
      if (response.success) {
        console.log('✅ Status do produto alterado com sucesso:', response.data);
        
        // Atualizar o produto na lista local
        setProdutos(prev => prev.map(prod => 
          prod.id === produto.id 
            ? { ...prod, status: response.data.status }
            : prod
        ));
        
        // Mostrar notificação de sucesso
        const statusText = response.data.status ? 'ativado' : 'desativado';
        console.log(`✅ Produto "${produto.nome}" foi ${statusText}`);
      } else {
        console.error('❌ Erro ao alterar status do produto:', response.message);
        setError('Erro ao alterar status: ' + response.message);
      }
    } catch (err) {
      console.error('❌ Erro ao alterar status do produto:', err);
      setError('Erro ao alterar status: ' + err.message);
    }
  };

  const getImageUrl = (imagemUrl) => {
    if (!imagemUrl) return null;
    
    console.log('🔍 URL original da imagem:', imagemUrl);
    
    // Se a URL já é completa (começa com http), retorna como está
    if (imagemUrl.startsWith('http')) {
      console.log('✅ URL completa encontrada:', imagemUrl);
      return imagemUrl;
    }
    
    // Fallback para URLs locais (desenvolvimento)
    const normalizedUrl = imagemUrl.replace(/\\/g, '/');
    console.log('🔧 URL normalizada:', normalizedUrl);
    
    // Determinar a base URL baseada no ambiente
    let baseUrl;
    if (import.meta.env.VITE_API_URL) {
      baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    } else {
      baseUrl = 'http://localhost:3001';
    }
    
    console.log('🌐 Base URL:', baseUrl);
    
    // Garantir que não há dupla barra
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanImageUrl = normalizedUrl.replace(/^\//, '');
    
    const finalUrl = `${cleanBaseUrl}/${cleanImageUrl}`;
    console.log('🎯 URL final:', finalUrl);
    
    return finalUrl;
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">Carregando produtos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchProdutos}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Package className="mx-auto h-12 w-12" />
        </div>
        <p className="text-gray-600">Nenhum produto encontrado</p>
        <p className="text-gray-500 text-sm">Adicione um novo produto para começar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
      {/* Layout responsivo: Cards para mobile/tablet, Tabela para desktop */}
      
      {/* Cards para mobile e tablet */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              {/* Header do card: Imagem + Nome + Ações */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Imagem do produto */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                    {getImageUrl(produto.imagem_url) ? (
                      <img
                        src={getImageUrl(produto.imagem_url)}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full flex items-center justify-center text-gray-400"
                      style={{ display: getImageUrl(produto.imagem_url) ? 'none' : 'flex' }}
                    >
                      <ImageIcon size={16} />
                    </div>
                  </div>
                  
                  {/* Nome do produto */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {produto.nome}
                    </h3>
                    {produto.descricao && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {produto.descricao}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex items-center space-x-1 ml-2">
                  <EditButton
                    onClick={() => handleEdit(produto)}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center"
                  />
                  <DeleteButton
                    onClick={() => handleDelete(produto)}
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center"
                  />
                  <StatusButton
                    onClick={() => handleToggleStatus(produto)}
                    size="sm"
                    isActive={produto.status}
                    className={`rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center ${
                      produto.status
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Conteúdo do card */}
              <div className="space-y-2">
                {/* Categoria */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Categoria:</span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {produto.categoria_nome || 'Sem categoria'}
                  </span>
                </div>

                {/* Preço */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Preço:</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(produto.valor_venda)}
                    </div>
                    {produto.valor_custo && (
                      <div className="text-xs text-gray-500">
                        Custo: {formatCurrency(produto.valor_custo)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status:</span>
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      produto.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {produto.status ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela para desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          {/* Cabeçalho da tabela */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          
          {/* Corpo da tabela */}
          <tbody className="bg-white divide-y divide-gray-200">
            {produtos.map((produto) => (
              <tr key={produto.id} className="hover:bg-gray-50 transition-colors duration-150">
                {/* Coluna Produto (Imagem + Nome) */}
                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    {/* Imagem do produto */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      {getImageUrl(produto.imagem_url) ? (
                        <img
                          src={getImageUrl(produto.imagem_url)}
                          alt={produto.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full flex items-center justify-center text-gray-400"
                        style={{ display: getImageUrl(produto.imagem_url) ? 'none' : 'flex' }}
                      >
                        <ImageIcon size={16} />
                      </div>
                    </div>
                    
                    {/* Nome do produto */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {produto.nome}
                      </p>
                      {produto.descricao && (
                        <p className="text-xs text-gray-500 truncate">
                          {produto.descricao}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Coluna Categoria */}
                <td className="px-4 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {produto.categoria_nome || 'Sem categoria'}
                  </span>
                </td>

                {/* Coluna Preço */}
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">
                      {formatCurrency(produto.valor_venda)}
                    </div>
                    {produto.valor_custo && (
                      <div className="text-xs text-gray-500">
                        Custo: {formatCurrency(produto.valor_custo)}
                      </div>
                    )}
                  </div>
                </td>

                {/* Coluna Status */}
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      produto.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {produto.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>

                {/* Coluna Ações */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    <EditButton
                      onClick={() => handleEdit(produto)}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center"
                    />
                    <DeleteButton
                      onClick={() => handleDelete(produto)}
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center"
                    />
                    <StatusButton
                      onClick={() => handleToggleStatus(produto)}
                      size="sm"
                      isActive={produto.status}
                      className={`rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center ${
                        produto.status
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Indicador de carregamento para rolagem infinita */}
      {loadingMore && (
        <div className="flex justify-center items-center py-6 border-t border-gray-200">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-sm text-gray-600">Carregando mais produtos...</span>
        </div>
      )}

      {/* Indicador de fim da lista */}
      {!hasMore && produtos.length > 0 && (
        <div className="flex justify-center items-center py-6 border-t border-gray-200">
          <span className="text-sm text-gray-500">Todos os produtos foram carregados</span>
        </div>
      )}
      
      {/* Modal de confirmação de exclusão */}
      <ConfirmDelete
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Produto"
        message="Tem certeza que deseja excluir este produto?"
        itemName={deleteModal.produto?.nome}
        isLoading={deleting}
      />
    </div>
  );
};

export default ListProduct;
