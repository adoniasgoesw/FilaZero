import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';
import EditButton from '../buttons/Edit';
import DeleteButton from '../buttons/Delete';
import StatusButton from '../buttons/Status';
import ConfirmDelete from '../elements/ConfirmDelete';

const ListCategory = ({ estabelecimentoId, onCategoryDelete, onCategoryEdit }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoria: null });
  const [deleting, setDeleting] = useState(false);

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando categorias para estabelecimento:', estabelecimentoId);
      console.log('🔍 URL da API:', `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/categorias/${estabelecimentoId}`);
      
      const response = await api.get(`/categorias/${estabelecimentoId}`);
      
      console.log('✅ Resposta da API:', response);
      
      if (response.success) {
        setCategorias(response.data);
        console.log('✅ Categorias carregadas:', response.data);
      } else {
        setError('Erro ao carregar categorias');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar categorias:', err);
      console.error('❌ Detalhes do erro:', err.message);
      setError(`Erro ao carregar categorias: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [estabelecimentoId]);

  useEffect(() => {
    if (estabelecimentoId) {
      fetchCategorias();
    }
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
        
        // Remover a categoria da lista local
        setCategorias(prev => prev.filter(cat => cat.id !== deleteModal.categoria.id));
        
        // Fechar modal
        setDeleteModal({ isOpen: false, categoria: null });
        
        // Chamar callback para mostrar notificação
        if (onCategoryDelete) {
          onCategoryDelete(deleteModal.categoria);
        }
      } else {
        console.error('❌ Erro ao deletar categoria:', response.message);
        setError('Erro ao deletar categoria: ' + response.message);
      }
    } catch (err) {
      console.error('❌ Erro ao deletar categoria:', err);
      setError('Erro ao deletar categoria: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, categoria: null });
  };

  const handleToggleStatus = async (categoria) => {
    console.log('Alterar status da categoria:', categoria);
    
    try {
      const response = await api.put(`/categorias/${categoria.id}/status`);
      
      if (response.success) {
        console.log('✅ Status da categoria alterado com sucesso:', response.data);
        
        // Atualizar a categoria na lista local
        setCategorias(prev => prev.map(cat => 
          cat.id === categoria.id 
            ? { ...cat, status: response.data.status }
            : cat
        ));
        
        // Mostrar notificação de sucesso
        const statusText = response.data.status ? 'ativada' : 'desativada';
        console.log(`✅ Categoria "${categoria.nome}" foi ${statusText}`);
      } else {
        console.error('❌ Erro ao alterar status da categoria:', response.message);
        setError('Erro ao alterar status: ' + response.message);
      }
    } catch (err) {
      console.error('❌ Erro ao alterar status da categoria:', err);
      setError('Erro ao alterar status: ' + err.message);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2 text-gray-600">Carregando categorias...</span>
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
          onClick={fetchCategorias}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-gray-600">Nenhuma categoria encontrada</p>
        <p className="text-gray-500 text-sm">Adicione uma nova categoria para começar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {categorias.map((categoria) => (
        <div
          key={categoria.id}
          className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          {/* Imagem da categoria */}
          <div className="aspect-square bg-gray-100 relative">
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
            
            {/* Botões de ação no canto superior direito */}
            <div className="absolute top-1.5 right-1.5 flex gap-1">
              <EditButton
                onClick={() => handleEdit(categoria)}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center"
              />
              <DeleteButton
                onClick={() => handleDelete(categoria)}
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center"
              />
              <StatusButton
                onClick={() => handleToggleStatus(categoria)}
                size="sm"
                isActive={categoria.status}
                className={`rounded-full p-1 shadow-sm w-6 h-6 flex items-center justify-center ${
                  categoria.status
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              />
            </div>

            {/* Status badge no canto inferior direito */}
            <div className="absolute bottom-1.5 right-1.5">
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  categoria.status
                    ? 'bg-green-600 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {categoria.status ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Conteúdo do card */}
          <div className="p-2">
            <h3 className="font-semibold text-gray-900 text-xs mb-1 truncate">
              {categoria.nome}
            </h3>
          </div>
        </div>
      ))}
      
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
