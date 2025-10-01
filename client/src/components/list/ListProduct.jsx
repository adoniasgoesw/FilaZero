import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, Package, MoreHorizontal, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
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
  // Estados para produtos
  const [produtos, setProdutos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, produto: null });
  const [deleting, setDeleting] = useState(false);
  
  // Estados para seleção múltipla
  const [selectAll, setSelectAll] = useState(false);
  
  // Estados para dropdown de ações
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState({ isOpen: false, produtos: [] });
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Função para buscar produtos
  const fetchProdutos = useCallback(async () => {
    if (!estabelecimentoId) return;
    
    console.log('🔄 ListProduct - fetchProdutos chamado, estabelecimentoId:', estabelecimentoId);
    console.log('🔄 ListProduct - produtos.length:', produtos.length);
    
    // Só mostrar loading se não há produtos carregados
    if (produtos.length === 0) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response = await api.get(`/produtos/${estabelecimentoId}`);
      if (response.success) {
        console.log('🔄 ListProduct - Produtos carregados:', response.data.produtos?.length || 0);
        setProdutos(response.data.produtos || []);
      } else {
        setError(response.message || 'Erro ao carregar produtos');
      }
    } catch (err) {
      setError('Erro ao carregar produtos');
      console.error('Erro ao buscar produtos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [estabelecimentoId, produtos.length]);

  // Buscar produtos quando o componente montar ou estabelecimentoId mudar
  useEffect(() => {
    if (estabelecimentoId) {
      fetchProdutos();
    }
  }, [estabelecimentoId]);

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

  // Escutar eventos de atualização em tempo real
  useEffect(() => {
    const handleProdutoUpdate = () => {
      console.log('🔄 ListProduct - Evento de atualização recebido, recarregando produtos...');
      fetchProdutos(); // Recarregar dados
    };

    const handleRefreshProdutos = () => {
      console.log('🔄 ListProduct - Evento refreshProdutos recebido, recarregando produtos...');
      console.log('🔄 ListProduct - estabelecimentoId:', estabelecimentoId);
      if (estabelecimentoId) {
        fetchProdutos(); // Recarregar dados
      }
    };

    window.addEventListener('produtoUpdated', handleProdutoUpdate);
    window.addEventListener('refreshProdutos', handleRefreshProdutos);
    
    return () => {
      window.removeEventListener('produtoUpdated', handleProdutoUpdate);
      window.removeEventListener('refreshProdutos', handleRefreshProdutos);
    };
  }, [estabelecimentoId]);

  // Controlar seleção baseada nos produtos selecionados externos
  useEffect(() => {
    setSelectAll(externalSelectedProducts.length === displayedProdutos.length && displayedProdutos.length > 0);
  }, [externalSelectedProducts.length, displayedProdutos.length]);


  // Função para alternar status do produto
  const toggleStatus = async (produto) => {
    try {
      const response = await api.put(`/produtos/${produto.id}/status`);
      
      if (response.success) {
        // Recarregar produtos
        await fetchProdutos();
        
        console.log('✅ Status do produto alterado:', produto.nome, 'Novo status:', !produto.status);
      } else {
        throw new Error(response.message || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status:', error);
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
      
      // Recarregar produtos
      await fetchProdutos();
      
      // Fechar modal e limpar seleção
      setBulkDeleteModal({ isOpen: false, produtos: [] });
      onSelectionChange([]);
      setShowActionsDropdown(false);
      
      console.log(`✅ ${externalSelectedProducts.length} produtos deletados`);
    } catch (error) {
      console.error('❌ Erro ao deletar produtos em lote:', error);
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
        console.log('✅ Produto deletado:', produto.nome);
        
        // Recarregar produtos
        await fetchProdutos();
        
        // Disparar evento de atualização em tempo real
        window.dispatchEvent(new CustomEvent('produtoUpdated'));
        
        // Fechar modal
        setDeleteModal({ isOpen: false, produto: null });
        
        // Chamar callback para notificação
        if (onProductDelete) {
          onProductDelete(produto);
        }
      } else {
        throw new Error(response.message || 'Erro ao deletar produto');
      }
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
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

  // Debug: verificar estado dos produtos
  console.log('🔍 ListProduct Debug:', {
    estabelecimentoId,
    produtos: produtos?.length || 0,
    isLoading,
    error,
    displayedProdutos: displayedProdutos?.length || 0
  });

  // Mostrar loading apenas no carregamento inicial
  if (isLoading && produtos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">
            <X className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-red-600 mb-2">Erro ao carregar produtos</p>
          <p className="text-gray-500 text-sm">{error.message}</p>
          <button 
            onClick={fetchProdutos}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Mostrar mensagem se não houver produtos
  if (!displayedProdutos || displayedProdutos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-600">
            {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto encontrado'}
          </p>
          <p className="text-gray-500 text-sm">
            {searchQuery ? 'Tente ajustar os termos de pesquisa.' : 'Adicione um produto para começar'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabela única com cabeçalho fixo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full mt-44 md:mt-0">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <table className="min-w-full">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="px-1 py-4 text-left">
                  <div className="flex items-center h-6 ml-2">
                    <input 
                      type="checkbox" 
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-white border-2 border-blue-500 rounded-full focus:ring-blue-500 focus:ring-2 checked:bg-blue-500 checked:border-blue-500" 
                    />
                  </div>
                </th>
                <th className="px-1 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Produto</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoria</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Preço</th>
                <th className="px-3 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="px-3 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Ações</th>
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
                    <div className="flex items-center h-6 ml-2">
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
                      <div className="w-12 h-12 flex items-center justify-center mr-2 flex-shrink-0">
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
                  <td className="px-3 py-6">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {produto.categoria_nome || 'Sem categoria'}
                    </span>
                  </td>
                  <td className="px-3 py-6 whitespace-nowrap hidden sm:table-cell">
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
                      {produto.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-3 py-6 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => toggleStatus(produto)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${produto.status ? 'bg-green-50 hover:bg-green-100' : 'bg-orange-50 hover:bg-orange-100'}`}
                        title={produto.status ? 'Desativar' : 'Ativar'}
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
