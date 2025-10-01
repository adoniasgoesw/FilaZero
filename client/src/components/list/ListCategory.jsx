import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import EditButton from '../buttons/Edit';
import DeleteButton from '../buttons/Delete';
import StatusButton from '../buttons/Status';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import ConfirmDelete from '../elements/ConfirmDelete';

const ListCategory = ({ estabelecimentoId, onCategoryDelete, onCategoryEdit, searchQuery = '' }) => {
  const [categorias, setCategorias] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoria: null });
  const [deleting, setDeleting] = useState(false);

  const displayed = React.useMemo(() => {
    const list = Array.isArray(categorias) ? categorias : [];
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    return list.filter((c) => String(c.nome || '').toLowerCase().includes(q));
  }, [categorias, searchQuery]);

  // Função para buscar categorias da API
  const fetchCategorias = useCallback(async () => {
    if (!estabelecimentoId) return;
    
    // Só mostrar loading se não há categorias carregadas
    if (categorias.length === 0) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response = await api.get(`/categorias/${estabelecimentoId}`);
      if (response.success) {
        setCategorias(response.data || []);
      } else {
        throw new Error(response.message || 'Erro ao carregar categorias');
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [estabelecimentoId, categorias.length]);

  // Carregar categorias quando o componente monta ou estabelecimentoId muda
  useEffect(() => {
    if (estabelecimentoId) {
      fetchCategorias();
    }
  }, [estabelecimentoId, fetchCategorias]);

  // Escutar eventos de atualização em tempo real
  useEffect(() => {
    const handleRefreshCategorias = () => {
      console.log('🔄 ListCategory - Evento refreshCategorias recebido, recarregando categorias...');
      console.log('🔄 ListCategory - estabelecimentoId:', estabelecimentoId);
      if (estabelecimentoId) {
        fetchCategorias();
      }
    };

    console.log('🔄 ListCategory - Adicionando listener para refreshCategorias');
    window.addEventListener('refreshCategorias', handleRefreshCategorias);
    
    return () => {
      console.log('🔄 ListCategory - Removendo listener para refreshCategorias');
      window.removeEventListener('refreshCategorias', handleRefreshCategorias);
    };
  }, [estabelecimentoId, fetchCategorias]);

  const handleEdit = (categoria) => {
    console.log('Editar categoria:', categoria);
    if (onCategoryEdit) {
      onCategoryEdit(categoria);
    }
  };

  const handleDelete = (categoria) => {
    console.log('Abrir modal de exclusão para:', categoria);
    setDeleteModal({ isOpen: true, categoria });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.categoria) return;

    setDeleting(true);
    try {
      console.log('Deletando categoria:', deleteModal.categoria);
      
      const response = await api.delete(`/categorias/${deleteModal.categoria.id}`);
      
      if (response.success) {
        console.log('✅ Categoria deletada com sucesso:', response.data);
        
        // Atualizar lista local
        setCategorias(prev => prev.filter(c => c.id !== deleteModal.categoria.id));
        
        // Fechar modal
        setDeleteModal({ isOpen: false, categoria: null });
        
        // Chamar callback para mostrar notificação
        if (onCategoryDelete) {
          onCategoryDelete(deleteModal.categoria);
        }
      } else {
        console.error('❌ Erro ao deletar categoria:', response.message);
      }
    } catch (err) {
      console.error('❌ Erro ao deletar categoria:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, categoria: null });
  };

  const handleToggleStatus = async (categoria) => {
    console.log('Editar status da categoria:', categoria);
    
    try {
      const response = await api.put(`/categorias/${categoria.id}/status`);
      
      if (response.success) {
        console.log('✅ Status da categoria alterado com sucesso:', response.data);
        
        // Atualizar lista local
        setCategorias(prev => prev.map(c => 
          c.id === categoria.id ? { ...c, status: response.data.status } : c
        ));
        
        // Mostrar notificação de sucesso
        const statusText = response.data.status ? 'ativada' : 'desativada';
        console.log(`✅ Categoria "${categoria.nome}" foi ${statusText}`);
      } else {
        console.error('❌ Erro ao alterar status da categoria:', response.message);
      }
    } catch (err) {
      console.error('❌ Erro ao alterar status da categoria:', err);
    }
  };




  const getImageUrl = (imagemUrl) => {
    if (!imagemUrl) return null;
    
    console.log('🔍 URL original da imagem:', imagemUrl);
    
    // Se a URL já é completa (começa com http), retorna como está
    // Isso funciona tanto para URLs locais quanto para URLs do Cloudinary
    if (imagemUrl.startsWith('http')) {
      console.log('✅ URL completa encontrada:', imagemUrl);
      return imagemUrl;
    }
    
    // Fallback para URLs locais (desenvolvimento)
    // Normalizar separadores de caminho (Windows usa \, Unix usa /)
    const normalizedUrl = imagemUrl.replace(/\\/g, '/');
    console.log('🔧 URL normalizada:', normalizedUrl);
    
    // Determinar a base URL baseada no ambiente
    let baseUrl;
    if (import.meta.env.VITE_API_URL) {
      // Remove /api do final se existir, pois vamos adicionar apenas o caminho da imagem
      baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    } else {
      // Fallback para desenvolvimento
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

  // Mostrar loading apenas no carregamento inicial
  if (isLoading && categorias.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-2">Erro ao carregar categorias</p>
          <p className="text-gray-500 text-sm mb-4">{error.message}</p>
          <button 
            onClick={fetchCategorias}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Mostrar mensagem se não houver categorias
  if (categorias.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-600">Nenhuma categoria encontrada</p>
          <p className="text-gray-500 text-sm">Adicione uma nova categoria para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {displayed.map((categoria) => (
          <div
            key={categoria.id}
            data-category-id={categoria.id}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            {/* Imagem da categoria */}
            <div className="p-2 sm:p-3">
              <div className="relative aspect-square bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                {getImageUrl(categoria.imagem_url) ? (
                  <img
                    src={getImageUrl(categoria.imagem_url)}
                    alt={categoria.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full flex items-center justify-center text-gray-400"
                  style={{ display: getImageUrl(categoria.imagem_url) ? 'none' : 'flex' }}
                >
                  <ImageIcon size={20} />
                </div>

                {/* Botões de ação no canto superior direito - aparecem no hover */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleToggleStatus(categoria)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${categoria.status ? 'bg-green-50 hover:bg-green-100' : 'bg-orange-50 hover:bg-orange-100'}`}
                    title={categoria.status ? 'Desabilitar' : 'Habilitar'}
                  >
                    {categoria.status ? (
                      <ToggleRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-orange-500" />
                    )}
                  </button>
                  <EditButton
                    onClick={() => handleEdit(categoria)}
                    size="sm"
                    variant="soft"
                    className="rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center"
                  />
                  <DeleteButton
                    onClick={() => handleDelete(categoria)}
                    size="sm"
                    variant="soft"
                    className="rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center"
                  />
                </div>
                {/* Status badge no canto inferior direito */}
                <div className="absolute bottom-2 right-2">
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      categoria.status
                        ? 'bg-green-600 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {categoria.status ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Conteúdo do card */}
            <div className="px-2 sm:px-3 py-2">
              <h3 className="font-semibold text-gray-900 text-xs mb-1 truncate">
                {categoria.nome}
              </h3>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal de confirmação de exclusão */}
      <ConfirmDelete
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Categoria"
        message="Tem certeza que deseja excluir esta categoria?"
        itemName={deleteModal.categoria?.nome}
        isLoading={deleting}
      />
    </div>
  );
};

export default ListCategory;