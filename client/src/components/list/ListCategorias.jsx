import React, { useState, useEffect } from 'react';
import { Power, PowerOff, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api.js';

const ListCategorias = ({ onRefresh, onAction }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  // Função helper para construir URL da imagem
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    console.log('🖼️ getImageUrl chamado com:', imagePath);
    
    // Se já é uma URL completa, retornar como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('✅ URL já é completa, retornando como está');
      return imagePath;
    }
    
    // Detectar ambiente automaticamente
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    console.log('🌍 Ambiente detectado:', isProduction ? 'Produção' : 'Desenvolvimento');
    
    if (isProduction) {
      // Produção: usar Render
      const url = `https://filazero-sistema-de-gestao.onrender.com${imagePath}`;
      console.log('🔗 URL construída para produção:', url);
      return url;
    } else {
      // Desenvolvimento: usar localhost
      const url = `http://localhost:3001${imagePath}`;
      console.log('🔗 URL construída para desenvolvimento:', url);
      return url;
    }
  };

  // Buscar categorias do banco de dados
  const buscarCategorias = async () => {
    try {
      setLoading(true);
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      
      if (!estabelecimento || !estabelecimento.id) {
        console.error('Estabelecimento não encontrado');
        return;
      }

      const response = await api.get(`/categorias/estabelecimento/${estabelecimento.id}`);
      if (response.data.success) {
        setCategorias(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar categorias quando o componente montar
  useEffect(() => {
    buscarCategorias();
  }, [onRefresh]);

  // Função para ativar/desativar categoria
  const toggleStatusCategoria = async (id, novoStatus) => {
    try {
      const response = await api.put(`/categorias/${id}/status`, { status: novoStatus });
      if (response.data.success) {
        const statusText = novoStatus ? 'ativada' : 'desativada';
        alert(`Categoria ${statusText} com sucesso!`);
        buscarCategorias(); // Recarregar lista
        setActiveCard(null); // Fechar botões
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status da categoria:', error);
      alert('Erro ao alterar status da categoria. Tente novamente.');
    }
  };

  // Função para editar categoria
  const editarCategoria = (categoria) => {
    // Emitir evento para abrir modal de edição
    if (onAction && typeof onAction === 'function') {
      onAction({ action: 'edit', categoria });
    }
    setActiveCard(null);
  };

  // Função para deletar categoria
  const deletarCategoria = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      try {
        const response = await api.delete(`/categorias/${id}`);
        if (response.data.success) {
          alert('Categoria deletada com sucesso!');
          buscarCategorias();
        }
      } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        alert('Erro ao deletar categoria. Tente novamente.');
      }
    }
    setActiveCard(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg">Nenhuma categoria encontrada</p>
        <p className="text-sm">Crie sua primeira categoria para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid de categorias */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className={`relative bg-white border rounded-xl p-2 sm:p-3 hover:shadow-lg transition-all duration-200 cursor-pointer group ${
              categoria.status ? 'border-gray-200' : 'border-gray-300 opacity-75'
            }`}
            onClick={() => setActiveCard(activeCard === categoria.id ? null : categoria.id)}
          >
            {/* Botões de ação - aparecem no clique */}
            <div className={`absolute top-4 right-4 flex space-x-2 transition-opacity duration-200 z-10 ${
              activeCard === categoria.id ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Ativar/Desativar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStatusCategoria(categoria.id, !categoria.status);
                }}
                className={`w-6 h-6 rounded-full text-white transition-colors flex items-center justify-center ${
                  categoria.status
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
                title={categoria.status ? 'Desativar' : 'Ativar'}
              >
                {categoria.status ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
              </button>

              {/* Editar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  editarCategoria(categoria);
                }}
                className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors flex items-center justify-center"
                title="Editar"
              >
                <Edit className="w-3 h-3" />
              </button>

              {/* Deletar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletarCategoria(categoria.id);
                }}
                className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors flex items-center justify-center"
                title="Deletar"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Imagem */}
            <div className="relative w-full aspect-square mb-2 sm:mb-3 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              {categoria.imagem_url ? (
                <img
                  src={getImageUrl(categoria.imagem_url)}
                  alt={categoria.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.warn('❌ Erro ao carregar imagem:', categoria.imagem_url);
                    console.warn('🔗 URL tentada:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ Imagem carregada com sucesso:', categoria.imagem_url);
                  }}
                />
              ) : (
                <div className="text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Status - DENTRO da imagem, canto inferior direito */}
              <div className="absolute bottom-2 right-2 z-10">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium shadow-md ${
                    categoria.status
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {categoria.status ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>

            {/* Nome */}
            <h3 className="font-medium text-gray-800 text-center mb-1 sm:mb-2 truncate text-sm sm:text-base">
              {categoria.nome}
            </h3>


          </div>
        ))}
      </div>
    </div>
  );
};

export default ListCategorias;
