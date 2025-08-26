import React, { useState, useEffect } from 'react';
import { Tag, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import api from '../../services/api';
import Notification from '../elements/Notification';

const ListCategorias = ({ onRefresh, onEdit }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [categoriaParaDeletar, setCategoriaParaDeletar] = useState(null);

  // Buscar categorias do estabelecimento
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
        console.log('📋 Categorias recebidas do backend:', response.data.data);
        setCategorias(response.data.data);
        setFilteredCategorias(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorias baseado no termo de busca
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

  // Buscar categorias quando o componente montar ou quando onRefresh for chamado
  useEffect(() => {
    buscarCategorias();
  }, [onRefresh]);

  // Função para deletar categoria
  const deletarCategoria = async (id) => {
    const categoria = categorias.find(cat => cat.id === id);
    if (categoria) {
      setCategoriaParaDeletar(categoria);
      setShowNotification(true);
      setActiveCard(null);
    }
  };

  // Função para editar categoria
  const editarCategoria = (id) => {
    const categoria = categorias.find(cat => cat.id === id);
    if (categoria && onEdit) {
      onEdit(categoria);
      setActiveCard(null);
    }
  };

  // Função para ativar/desativar categoria
  const toggleStatusCategoria = async (id, novoStatus) => {
    try {
      const response = await api.put(`/categorias/${id}/status`, { status: novoStatus });
      if (response.data.success) {
        buscarCategorias();
        setActiveCard(null);
      }
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
    }
  };

  // Função para gerenciar clique no card (mobile)
  const handleCardClick = (id) => {
    if (activeCard === id) {
      setActiveCard(null);
    } else {
      setActiveCard(id);
    }
  };

  // Função para confirmar exclusão
  const confirmarExclusao = async () => {
    try {
      if (categoriaParaDeletar) {
        const response = await api.delete(`/categorias/${categoriaParaDeletar.id}`);
        if (response.data.success) {
          buscarCategorias();
          setShowNotification(false);
          setCategoriaParaDeletar(null);
        }
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  if (filteredCategorias.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Tag className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
        </h3>
        <p className="text-gray-500">
          {searchTerm ? 'Tente ajustar os termos de busca.' : 'Comece cadastrando sua primeira categoria.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar categorias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Grid de categorias */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredCategorias.map((categoria) => (
          <div
            key={categoria.id}
            className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => handleCardClick(categoria.id)}
          >
            {/* Card da categoria */}
            <div className="p-4 text-center">
              {/* Ícone da categoria */}
              <div className="w-16 h-16 mx-auto mb-3 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: categoria.cor || '#e5e7eb' }}>
                <Tag className="w-8 h-8 text-white opacity-80" />
              </div>

              {/* Nome da categoria */}
              <h4 className="font-semibold text-gray-800 text-sm truncate">
                {categoria.nome}
              </h4>

              {/* Status */}
              <div className="mt-2">
                {categoria.status ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Ativa
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                    Inativa
                  </span>
                )}
              </div>

              {/* Botões de ação */}
              <div className={`absolute top-2 right-2 flex flex-row space-x-1 transition-opacity duration-200 ${
                activeCard === categoria.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                {/* Botão Ativar/Desativar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatusCategoria(categoria.id, !categoria.status);
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                    categoria.status 
                      ? 'bg-amber-500 hover:bg-amber-600 hover:scale-110' 
                      : 'bg-emerald-500 hover:bg-emerald-600 hover:scale-110'
                  } text-white shadow-md hover:shadow-lg`}
                  title={categoria.status ? 'Desativar categoria' : 'Ativar categoria'}
                >
                  {categoria.status ? (
                    <PowerOff className="w-3 h-3" />
                  ) : (
                    <Power className="w-3 h-3" />
                  )}
                </button>

                {/* Botão Editar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    editarCategoria(categoria.id);
                  }}
                  className="w-6 h-6 bg-sky-500 hover:bg-sky-600 hover:scale-110 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                  title="Editar categoria"
                >
                  <Edit className="w-3 h-3" />
                </button>

                {/* Botão Deletar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletarCategoria(categoria.id);
                  }}
                  className="w-6 h-6 bg-rose-500 hover:bg-rose-600 hover:scale-110 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                  title="Deletar categoria"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Componente de Notificação para Exclusão */}
      <Notification
        isOpen={showNotification}
        onClose={() => {
          setShowNotification(false);
          setCategoriaParaDeletar(null);
        }}
        message={`Você deseja excluir essa categoria, "${categoriaParaDeletar?.nome}"?`}
        onConfirm={confirmarExclusao}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
};

export default ListCategorias;
