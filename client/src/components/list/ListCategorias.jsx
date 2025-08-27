import React, { useState, useEffect } from 'react';
import { Power, PowerOff, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api.js';

const ListCategorias = ({ onRefresh }) => {
  const [categorias, setCategorias] = useState([]);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCard, setActiveCard] = useState(null);

  // Função helper para construir URL da imagem
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Se já é uma URL completa, retornar como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Detectar ambiente automaticamente
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
      // Produção: usar Render
      return `https://filazero-sistema-de-gestao.onrender.com${imagePath}`;
    } else {
      // Desenvolvimento: usar localhost
      return `http://localhost:3001${imagePath}`;
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
        setFilteredCategorias(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorias por termo de busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategorias(categorias);
    } else {
      const filtered = categorias.filter(categoria =>
        categoria.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategorias(filtered);
    }
  }, [searchTerm, categorias]);

  // Carregar categorias quando o componente montar
  useEffect(() => {
    buscarCategorias();
  }, [onRefresh]);

  // Função para ativar/desativar categoria
  const toggleStatusCategoria = async (id, novoStatus) => {
    try {
      const response = await api.put(`/categorias/${id}`, { status: novoStatus });
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
  const editarCategoria = () => {
    // Implementar edição futuramente
    alert('Funcionalidade de edição será implementada em breve!');
    setActiveCard(null);
  };

  // Função para deletar categoria
  const deletarCategoria = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
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

  if (filteredCategorias.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg">Nenhuma categoria encontrada</p>
        <p className="text-sm">Crie sua primeira categoria para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Grid de categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredCategorias.map((categoria) => (
          <div
            key={categoria.id}
            className={`relative bg-white border rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer ${
              categoria.status ? 'border-gray-200' : 'border-gray-300 opacity-75'
            }`}
            onClick={() => setActiveCard(activeCard === categoria.id ? null : categoria.id)}
          >
            {/* Status */}
            <div className="absolute top-2 right-2">
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

            {/* Imagem */}
            <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                             {categoria.imagem_url ? (
                 <img
                   src={getImageUrl(categoria.imagem_url)}
                   alt={categoria.nome}
                   className="w-full h-full object-cover"
                   onError={(e) => {
                     console.warn('Erro ao carregar imagem:', categoria.imagem_url);
                     e.target.style.display = 'none';
                   }}
                 />
               ) : (
                <div className="text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Nome */}
            <h3 className="font-medium text-gray-800 text-center mb-3 truncate">
              {categoria.nome}
            </h3>

            {/* Botões de ação */}
            {activeCard === categoria.id && (
              <div className="absolute top-2 left-2 flex flex-row space-x-1">
                {/* Ativar/Desativar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatusCategoria(categoria.id, !categoria.status);
                  }}
                  className={`p-2 rounded-lg text-white transition-colors ${
                    categoria.status
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                  title={categoria.status ? 'Desativar' : 'Ativar'}
                >
                  {categoria.status ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </button>

                {/* Editar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    editarCategoria(categoria);
                  }}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Deletar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletarCategoria(categoria.id);
                  }}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                  title="Deletar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListCategorias;
