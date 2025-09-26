import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import EditButton from '../buttons/Edit';
import DeleteButton from '../buttons/Delete';
import StatusButton from '../buttons/Status';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import ConfirmDelete from '../elements/ConfirmDelete';
import { useCategorias, useCache } from '../../contexts/CacheContext';

const ListCategory = ({ estabelecimentoId, onCategoryDelete, onCategoryEdit, searchQuery = '', isReordering = false }) => {
  // Usar hook de cache para categorias
  const { categorias, loadCategorias, updateCategoria, removeCategoria } = useCategorias(estabelecimentoId);
  const { invalidateCache } = useCache();
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoria: null });
  const [deleting, setDeleting] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOver, setDraggedOver] = useState(null);
  const [reorderedCategories, setReorderedCategories] = useState([]);

  const displayed = React.useMemo(() => {
    const list = Array.isArray(categorias) ? categorias : [];
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    return list.filter((c) => String(c.nome || '').toLowerCase().includes(q));
  }, [categorias, searchQuery]);

  // Inicializar lista reordenada quando entrar no modo de reordenação
  useEffect(() => {
    if (isReordering && displayed.length > 0) {
      setReorderedCategories([...displayed]);
    }
  }, [isReordering, displayed]);

  // Expor lista reordenada globalmente para a página de Categorias
  useEffect(() => {
    if (isReordering) {
      window.reorderedCategories = reorderedCategories;
    } else {
      window.reorderedCategories = [];
    }
  }, [reorderedCategories, isReordering]);

  // Carregar categorias do cache
  useEffect(() => {
    if (estabelecimentoId) {
      loadCategorias();
    }
  }, [estabelecimentoId, loadCategorias]);

  // Escutar eventos de atualização em tempo real
  useEffect(() => {
    const handleCategoriaUpdate = () => {
      console.log('🔄 ListCategory - Evento de atualização recebido, recarregando categorias...');
      if (estabelecimentoId) {
        loadCategorias(true); // Forçar recarregamento
      }
    };

    window.addEventListener('categoriaUpdated', handleCategoriaUpdate);
    
    return () => {
      window.removeEventListener('categoriaUpdated', handleCategoriaUpdate);
    };
  }, [estabelecimentoId, loadCategorias]);

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
        
        // Remover categoria do cache
        removeCategoria(deleteModal.categoria.id);
        
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
        
        // Atualizar categoria no cache
        updateCategoria(categoria.id, { status: response.data.status });
        
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

  // Funções de drag and drop simplificadas
  const handleMouseDown = (e, categoria) => {
    if (!isReordering) return;
    e.preventDefault();
    setDraggedItem(categoria);
    
    const element = e.currentTarget;
    // Apenas aumentar um pouco e adicionar borda azul
    element.style.transform = 'scale(1.1)';
    element.style.zIndex = '1000';
    element.style.position = 'relative';
    element.style.border = '2px solid #3b82f6';
    
    // Adicionar listeners para mouse move e up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!draggedItem || !isReordering) return;
    
    // Encontrar elemento sob o mouse
    const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
    if (elementUnderMouse) {
      const categoryCard = elementUnderMouse.closest('[data-category-id]');
      if (categoryCard) {
        const targetId = parseInt(categoryCard.getAttribute('data-category-id'));
        const targetCategoria = reorderedCategories.find(cat => cat.id === targetId);
        if (targetCategoria && targetCategoria.id !== draggedItem.id) {
          setDraggedOver(targetCategoria);
        }
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!draggedItem || !isReordering) return;
    
    // Encontrar elemento sob o mouse
    const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
    if (elementUnderMouse) {
      const categoryCard = elementUnderMouse.closest('[data-category-id]');
      if (categoryCard) {
        const targetId = parseInt(categoryCard.getAttribute('data-category-id'));
        const targetCategoria = reorderedCategories.find(cat => cat.id === targetId);
        
        if (targetCategoria && targetCategoria.id !== draggedItem.id) {
          // Reordenar as categorias - apenas trocar posições
          const newOrder = [...reorderedCategories];
          const draggedIndex = newOrder.findIndex(cat => cat.id === draggedItem.id);
          const targetIndex = newOrder.findIndex(cat => cat.id === targetCategoria.id);

          // Trocar posições diretamente
          [newOrder[draggedIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[draggedIndex]];

          setReorderedCategories(newOrder);
        }
      }
    }
    
    // Resetar estado
    setDraggedItem(null);
    setDraggedOver(null);
    
    // Remover listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Resetar estilo do elemento
    const draggedElement = document.querySelector(`[data-category-id="${draggedItem?.id}"]`);
    if (draggedElement) {
      draggedElement.style.transform = 'scale(1)';
      draggedElement.style.zIndex = 'auto';
      draggedElement.style.position = 'static';
      draggedElement.style.border = '';
    }
  };


  // Salvar nova ordem
  const handleSaveOrder = useCallback(async () => {
    try {
      console.log('💾 Salvando ordem das categorias...');

      // Atualizar cada categoria individualmente com a nova ordem
      const updatePromises = reorderedCategories.map(async (categoria, index) => {
        const updateData = {
          nome: categoria.nome,
          ordem: index + 1,
          status: categoria.status
        };

        console.log(`📝 Atualizando categoria ${categoria.nome} para ordem ${index + 1}`);
        
        const response = await api.put(`/categorias/${categoria.id}`, updateData);
        
        if (!response.success) {
          throw new Error(`Erro ao atualizar categoria ${categoria.nome}: ${response.message}`);
        }
        
        return response;
      });

      // Aguardar todas as atualizações
      await Promise.all(updatePromises);
      
      console.log('✅ Ordem das categorias atualizada com sucesso');
      
      // Invalidar cache para forçar reload
      invalidateCache('categorias');
      
      // Aguardar um pouco e recarregar categorias
      setTimeout(async () => {
        await loadCategorias();
        console.log('🔄 Lista de categorias recarregada com nova ordem');
      }, 100);
      
      return true;
    } catch (err) {
      console.error('❌ Erro ao atualizar ordem das categorias:', err);
      throw err;
    }
  }, [reorderedCategories, loadCategorias, invalidateCache]);

  // Expor função de salvamento globalmente
  useEffect(() => {
    if (isReordering) {
      window.saveCategoriesOrder = handleSaveOrder;
    } else {
      window.saveCategoriesOrder = null;
    }
  }, [isReordering, reorderedCategories, handleSaveOrder]);

  // Lista a ser exibida (reordenada ou normal)
  const categoriesToShow = isReordering ? reorderedCategories : displayed;

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
        {categoriesToShow.map((categoria) => (
          <div
            key={categoria.id}
            data-category-id={categoria.id}
            onMouseDown={(e) => handleMouseDown(e, categoria)}
            className={`group bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 ${
              isReordering 
                ? 'cursor-move select-none' 
                : 'hover:shadow-md hover:-translate-y-0.5'
            } ${
              draggedOver && draggedOver.id === categoria.id 
                ? 'ring-2 ring-blue-500 ring-opacity-50' 
                : ''
            }`}
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

                {/* Botões de ação no canto superior direito - aparecem no hover (escondidos no modo de reordenação) */}
                {!isReordering && (
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
                )}
                {/* Status badge no canto inferior direito */}
                <div className="absolute bottom-2 right-2">
                  {isReordering ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500 text-white">
                      Arrastar
                    </span>
                  ) : (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        categoria.status
                          ? 'bg-green-600 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {categoria.status ? 'Ativo' : 'Inativo'}
                    </span>
                  )}
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