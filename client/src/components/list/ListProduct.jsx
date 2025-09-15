import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, Package, MoreHorizontal, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
import { readCache, writeCache } from '../../services/cache';
import EditButton from '../buttons/Edit';
import DeleteButton from '../buttons/Delete';
import StatusButton from '../buttons/Status';
import ConfirmDelete from '../elements/ConfirmDelete';

const ListProduct = ({ 
  estabelecimentoId, 
  onProductDelete, 
  onProductEdit, 
  searchQuery = '',
  selectedProducts: externalSelectedProducts = [],
  onSelectionChange
}) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, produto: null });
  const [deleting, setDeleting] = useState(false);
  
  // Estados para rolagem infinita
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Estados para seleção múltipla
  const [selectAll, setSelectAll] = useState(false);
  
  // Estados para dropdown de ações
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState({ isOpen: false, produtos: [] });
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const itemsPerPage = 10;

  const displayedProdutos = React.useMemo(() => {
    const list = Array.isArray(produtos) ? produtos : [];
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    const normalize = (s) => String(s || '').toLowerCase();
    return list.filter((p) => {
      const name = normalize(p.nome);
      const cat = normalize(p.categoria_nome);
      return name.includes(q) || cat.includes(q);
    });
  }, [produtos, searchQuery]);

  const fetchProdutos = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        // Fast-first paint from cache
        const cached = readCache(`produtos:${estabelecimentoId}:p${itemsPerPage}`);
        if (cached && Array.isArray(cached.produtos)) {
          setProdutos(cached.produtos);
          setHasMore(cached.hasMore ?? true);
          setCurrentPage(cached.currentPage ?? 1);
          setLoading(false);
        } else {
          setLoading(true);
        }
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
        
        // Persist to cache for instant subsequent loads
        if (page === 1) {
          writeCache(`produtos:${estabelecimentoId}:p${itemsPerPage}`, {
            produtos: newProdutos,
            total,
            currentPage: page,
            hasMore: page < Math.ceil(total / itemsPerPage)
          });
        }
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
    if (!estabelecimentoId) return;
    fetchProdutos(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estabelecimentoId]);

  // Controlar seleção baseada nos produtos selecionados externos
  useEffect(() => {
    setSelectAll(externalSelectedProducts.length === displayedProdutos.length && displayedProdutos.length > 0);
  }, [externalSelectedProducts.length, displayedProdutos.length]);

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

  // Função para selecionar/deselecionar produto individual
  const handleProductSelect = (produto) => {
    if (onSelectionChange) {
      const isSelected = externalSelectedProducts.some(p => p.id === produto.id);
      if (isSelected) {
        onSelectionChange(externalSelectedProducts.filter(p => p.id !== produto.id));
      } else {
        onSelectionChange([...externalSelectedProducts, produto]);
      }
    }
  };

  // Função para selecionar/deselecionar todos os produtos
  const handleSelectAll = () => {
    if (onSelectionChange) {
      if (selectAll) {
        onSelectionChange([]);
      } else {
        onSelectionChange([...displayedProdutos]);
      }
    }
  };

  // Função para clicar no produto (abrir modal de edição)
  const handleProductClick = (produto) => {
    onProductEdit(produto);
  };

  // Ações em lote agora são controladas no cabeçalho da página

  // Função para deletar múltiplos produtos
  const handleBulkDelete = async () => {
    try {
      setBulkDeleting(true);
      
      const promises = externalSelectedProducts.map(produto => 
        api.delete(`/produtos/${produto.id}`)
      );
      
      await Promise.all(promises);
      
      // Remover produtos da lista
      const selectedIds = externalSelectedProducts.map(p => p.id);
      setProdutos(prev => prev.filter(p => !selectedIds.includes(p.id)));
      
      // Fechar modal e limpar seleção
      setBulkDeleteModal({ isOpen: false, produtos: [] });
      onSelectionChange([]);
      setShowActionsDropdown(false);
      
      console.log(`✅ ${externalSelectedProducts.length} produtos deletados`);
    } catch (error) {
      console.error('❌ Erro ao deletar produtos em lote:', error);
      setError('Erro ao deletar produtos');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Função para obter opções do dropdown baseadas nos produtos selecionados
  // Dropdown removido do corpo da lista; opções de ação agora são controladas no cabeçalho


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

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Efeito para fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionsDropdown && !event.target.closest('.relative')) {
        setShowActionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionsDropdown]);

  if (loading && produtos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-3 text-gray-600">Carregando produtos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
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
    <div>
      {/* Removida barra de ações duplicada dentro da lista (movida para o cabeçalho da página) */}

      {/* Tabela responsiva */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-1 py-4 text-left">
                  <div className="flex items-center h-6">
                    <input 
                      type="checkbox" 
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-white border-2 border-blue-500 rounded-full focus:ring-blue-500 focus:ring-2 checked:bg-blue-500 checked:border-blue-500" 
                    />
                  </div>
                </th>
                <th className="px-1 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Produto</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Preço</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
          {displayedProdutos.map((produto) => (
                <tr 
              key={produto.id}
                  className="transition-colors cursor-pointer"
                  onClick={() => handleProductClick(produto)}
                >
                    <td className="px-1 py-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center h-6">
                        <input 
                          type="checkbox" 
                          checked={externalSelectedProducts.some(p => p.id === produto.id)}
                          onChange={() => handleProductSelect(produto)}
                          className="w-4 h-4 text-blue-600 bg-white border-2 border-blue-500 rounded-full focus:ring-blue-500 focus:ring-2 checked:bg-blue-500 checked:border-blue-500" 
                        />
                      </div>
                    </td>
                  <td className="px-1 py-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mr-2 shadow-sm flex-shrink-0">
                    {getImageUrl(produto.imagem_url) ? (
                      <img
                        src={getImageUrl(produto.imagem_url)}
                        alt={produto.nome}
                            className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                          className="w-full h-full flex items-center justify-center text-white"
                      style={{ display: getImageUrl(produto.imagem_url) ? 'none' : 'flex' }}
                    >
                          <Package className="w-5 h-5" />
                    </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">{produto.nome}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {produto.descricao || 'Produto do cardápio'}
                  </div>
                </div>
                    </div>
                  </td>
                  <td className="px-3 py-6 hidden sm:table-cell">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {produto.categoria_nome || 'Sem categoria'}
                    </span>
                  </td>
                  <td className="px-3 py-6 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-400">{formatCurrency(produto.valor_venda)}</span>
                  </td>
                  <td className="px-3 py-6 hidden md:table-cell">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        produto.status
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {produto.status ? 'Habilitado' : 'Desabilitado'}
                    </span>
                  </td>
                  <td className="px-3 py-6 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => toggleStatus(produto)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${produto.status ? 'bg-green-50 hover:bg-green-100' : 'bg-orange-50 hover:bg-orange-100'}`}
                        title={produto.status ? 'Desabilitar' : 'Habilitar'}
                      >
                        {produto.status ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-orange-500" />
                        )}
                      </button>
                      <EditButton 
                        onClick={() => onProductEdit(produto)} 
                        size="sm"
                        variant="soft"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        title="Editar"
                      />
                      <DeleteButton 
                        onClick={() => setDeleteModal({ isOpen: true, produto })} 
                        size="sm"
                        variant="soft"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        title="Deletar"
                      />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        {/* Modal de confirmação de exclusão em lote */}
        <ConfirmDelete
          isOpen={bulkDeleteModal.isOpen}
          onClose={() => setBulkDeleteModal({ isOpen: false, produtos: [] })}
          onConfirm={handleBulkDelete}
          title="Excluir Produtos"
          message={`Tem certeza que deseja excluir ${bulkDeleteModal.produtos.length} produto${bulkDeleteModal.produtos.length > 1 ? 's' : ''}? Esta ação não pode ser desfeita.`}
          isLoading={bulkDeleting}
        />
    </div>
  );
};

export default ListProduct;
