import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, Package } from 'lucide-react';
import api from '../../services/api';
import EditButton from '../buttons/Edit';
import DeleteButton from '../buttons/Delete';
import StatusButton from '../buttons/Status';
import ConfirmDelete from '../elements/ConfirmDelete';

const ListProduct = ({ estabelecimentoId, onProductDelete, onProductEdit, activeTab, setActiveTab }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, produto: null });
  const [deleting, setDeleting] = useState(false);
  
  // Estados para rolagem infinita
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

        
        if (append) {
          setProdutos(prev => [...prev, ...newProdutos]);
        } else {
          setProdutos(newProdutos);
        }
        

        setCurrentPage(page);
        setHasMore(page < Math.ceil(total / itemsPerPage));
        
        console.log('✅ Produtos carregados:', newProdutos.length, 'Total:', total, 'Páginas:', Math.ceil(total / itemsPerPage));
      } else {
        throw new Error(response.message || 'Erro ao carregar produtos');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      setError(error.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [estabelecimentoId, itemsPerPage]);

  useEffect(() => {
    if (estabelecimentoId) {
      fetchProdutos(1);
    }
  }, [estabelecimentoId, fetchProdutos]);

  // Função para carregar mais produtos
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      fetchProdutos(currentPage + 1, true);
    }
  }, [hasMore, loadingMore, loading, currentPage, fetchProdutos]);

  // Função para recarregar a lista
  const refreshList = useCallback(() => {
    if (estabelecimentoId) {
      fetchProdutos(1);
    }
  }, [estabelecimentoId, fetchProdutos]);

  // Função para alternar status do produto
  const toggleStatus = async (produto) => {
    try {
      const response = await api.put(`/produtos/${produto.id}/status`);
      
      if (response.success) {
        // Atualizar o produto na lista
        setProdutos(prev => prev.map(p => 
          p.id === produto.id 
            ? { ...p, status: !p.status }
            : p
        ));
        
        console.log('✅ Status do produto alterado:', produto.nome, 'Novo status:', !produto.status);
      } else {
        throw new Error(response.message || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
      setError(error.message || 'Erro ao alterar status do produto');
    }
  };

  // Função para deletar produto
  const handleDelete = async (produto) => {
    try {
      setDeleting(true);
      const response = await api.delete(`/produtos/${produto.id}`);
      
      if (response.success) {
        // Remover produto da lista
        setProdutos(prev => prev.filter(p => p.id !== produto.id));
        
        // Fechar modal
        setDeleteModal({ isOpen: false, produto: null });
        
        // Chamar callback para notificação
        if (onProductDelete) {
          onProductDelete(produto);
        }
        
        console.log('✅ Produto deletado:', produto.nome);
      } else {
        throw new Error(response.message || 'Erro ao deletar produto');
      }
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      setError(error.message || 'Erro ao deletar produto');
    } finally {
      setDeleting(false);
    }
  };

  // Função para formatar moeda
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter URL da imagem
  const getImageUrl = (imagemUrl) => {
    if (!imagemUrl) return null;
    
    // Se a URL já é completa (começa com http), retorna como está
    if (imagemUrl.startsWith('http')) {
      return imagemUrl;
    }
    
    // Fallback para URLs locais (desenvolvimento)
    const normalizedUrl = imagemUrl.replace(/\\/g, '/');
    
    // Determinar a base URL baseada no ambiente
    let baseUrl;
    if (import.meta.env.VITE_API_URL) {
      baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    } else {
      baseUrl = 'http://localhost:3001';
    }
    
    // Garantir que não há dupla barra
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanImageUrl = normalizedUrl.replace(/^\//, '');
    
    return `${cleanBaseUrl}/${cleanImageUrl}`;
  };

  // Efeito para rolagem infinita
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  if (loading && produtos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-3 text-gray-600">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Package className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar produtos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshList}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Package className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600">Comece adicionando seu primeiro produto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* Header para mobile - FORA do container principal */}
      <div className="block lg:hidden mb-4">
        <div className="">
          <div className="flex">
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
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {/* Layout responsivo: Cards para mobile/tablet, Tabela para desktop */}
        
        {/* Cards para mobile e tablet */}
        <div className="block lg:hidden">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 h-20"
            >
              {/* Layout: Imagem (20%) + Conteúdo (80%) */}
              <div className="flex h-full">
                {/* Imagem - 20% da largura, com padding e bordas arredondadas */}
                <div className="w-1/5 h-full flex items-center justify-center p-2">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
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
                </div>
                
                {/* Conteúdo - 80% da largura */}
                <div className="flex-1 p-3 relative">
                  {/* Nome e Preço alinhados */}
                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {produto.nome}
                    </h3>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(produto.valor_venda)}
                    </div>
                  </div>
                  
                  {/* Status no canto superior direito */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        produto.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {produto.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  {/* Botões no canto inferior direito */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <StatusButton
                      isActive={produto.status}
                      onClick={() => toggleStatus(produto)}
                      size="sm"
                    />
                    <EditButton onClick={() => onProductEdit(produto)} size="sm" />
                    <DeleteButton onClick={() => setDeleteModal({ isOpen: true, produto })} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabela para desktop com cabeçalho fixo */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          {/* Cabeçalho fixo da tabela */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Preço
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Ações
                  </th>
                </tr>
              </thead>
            </table>
          </div>
          
          {/* Corpo da tabela com scroll */}
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <tbody className="bg-white divide-y divide-gray-200">
                {produtos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50 transition-colors duration-150">
                    {/* Coluna Produto (Imagem + Nome) */}
                    <td className="px-4 py-4 w-1/3">
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
                    <td className="px-4 py-4 w-1/6">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {produto.categoria_nome || 'Sem categoria'}
                      </span>
                    </td>

                    {/* Coluna Preço */}
                    <td className="px-4 py-4 w-1/6">
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
                    <td className="px-4 py-4 w-1/6">
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
                    <td className="px-4 py-4 w-1/6">
                      <div className="flex items-center justify-center gap-1">
                        <StatusButton
                          isActive={produto.status}
                          onClick={() => toggleStatus(produto)}
                          size="sm"
                        />
                        <EditButton onClick={() => onProductEdit(produto)} size="sm" />
                        <DeleteButton onClick={() => setDeleteModal({ isOpen: true, produto })} size="sm" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Indicador de carregamento para rolagem infinita */}
      {loadingMore && (
        <div className="flex justify-center items-center py-6 border-t border-gray-200">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
          <span className="ml-2 text-sm text-gray-600">Carregando mais produtos...</span>
        </div>
      )}

        {/* Modal de confirmação de exclusão */}
        <ConfirmDelete
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, produto: null })}
          onConfirm={() => handleDelete(deleteModal.produto)}
          title="Excluir Produto"
          message={`Tem certeza que deseja excluir o produto "${deleteModal.produto?.nome}"? Esta ação não pode ser desfeita.`}
          isLoading={deleting}
        />
      </div>
    </div>
  );
};

export default ListProduct;
