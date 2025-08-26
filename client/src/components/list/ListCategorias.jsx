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
        console.log('🔍 Total de categorias:', response.data.data.length);
        console.log('📊 Status das categorias:', response.data.data.map(cat => ({ id: cat.id, nome: cat.nome, status: cat.status })));
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
      setActiveCard(null); // Fechar botões
    }
  };

  // Função para editar categoria
  const editarCategoria = (id) => {
    const categoria = categorias.find(cat => cat.id === id);
    if (categoria && onEdit) {
      onEdit(categoria);
      setActiveCard(null); // Fechar botões
    }
  };

  // Função para ativar/desativar categoria
  const toggleStatusCategoria = async (id, novoStatus) => {
    try {
      console.log('🔄 Alterando status da categoria:', { id, novoStatus });
      const response = await api.put(`/categorias/${id}/status`, { status: novoStatus });
      if (response.data.success) {
        const statusText = novoStatus ? 'ativada' : 'desativada';
        const statusColor = novoStatus ? 'emerald' : 'rose';
        console.log('✅ Status alterado com sucesso:', statusText);
        alert(`Categoria ${statusText} com sucesso!`);
        buscarCategorias(); // Recarregar lista
        setActiveCard(null); // Fechar botões
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status da categoria:', error);
      alert('Erro ao alterar status da categoria. Tente novamente.');
    }
  };

  // Função para gerenciar clique no card (mobile)
  const handleCardClick = (id) => {
    if (activeCard === id) {
      setActiveCard(null); // Fechar se já estiver aberto
    } else {
      setActiveCard(id); // Abrir botões
    }
  };

  const confirmarExclusao = async () => {
    if (!categoriaParaDeletar) return;
    try {
      const response = await api.delete(`/categorias/${categoriaParaDeletar.id}`);
      if (response.data.success) {
        buscarCategorias();
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      alert('Erro ao deletar categoria. Tente novamente.');
    } finally {
      setShowNotification(false);
      setCategoriaParaDeletar(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        <span className="ml-3 text-gray-600">Carregando categorias...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header da Listagem */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
          <Tag className="w-4 h-4 text-cyan-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Categorias</h3>
      </div>

      {/* Lista de Categorias */}
      {filteredCategorias.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
          </h4>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Tente ajustar os termos de busca' 
              : 'Comece criando sua primeira categoria'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredCategorias.map((categoria) => (
                         <div
               key={categoria.id}
               className={`rounded-xl border-2 transition-all duration-200 group aspect-square flex flex-col cursor-pointer p-3 sm:p-4 ${
                 activeCard === categoria.id 
                   ? 'border-cyan-400 shadow-lg' 
                   : categoria.status 
                     ? 'bg-white border-gray-200 hover:shadow-lg' 
                     : 'bg-gray-50 border-gray-300 opacity-75'
               }`}
               onClick={() => handleCardClick(categoria.id)}
             >
                             {/* Imagem da Categoria */}
               <div className="relative flex-1 mb-3">
                                   {/* Status no canto inferior direito */}
                  <div className="absolute bottom-2 right-2 z-10">
                    {categoria.status ? (
                      <span className="px-2 py-1 bg-emerald-500 text-white rounded-full text-xs font-medium shadow-md">
                        Ativa
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-rose-500 text-white rounded-full text-xs font-medium shadow-md">
                        Inativa
                      </span>
                    )}
                  </div>

                 {categoria.imagem_url ? (
                   <img
                     src={`http://localhost:3001${categoria.imagem_url}`}
                     alt={categoria.nome}
                     className="w-full h-full object-cover rounded-lg"
                     onError={(e) => {
                       e.target.style.display = 'none';
                       e.target.nextSibling.style.display = 'flex';
                     }}
                   />
                 ) : null}
                 
                 {/* Fallback quando não há imagem */}
                 <div 
                   className={`w-full h-full rounded-lg flex items-center justify-center ${
                     categoria.imagem_url ? 'hidden' : 'flex'
                   }`}
                   style={{ backgroundColor: categoria.cor || '#e5e7eb' }}
                 >
                   <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-white opacity-80" />
                 </div>

                                                                   {/* Botões de ação (hover no desktop, clique no mobile) - Agora em linha horizontal no topo */}
                  <div className={`absolute top-2 right-2 flex flex-row space-x-1 transition-opacity duration-200 ${
                   activeCard === categoria.id 
                     ? 'opacity-100' 
                     : 'opacity-0 group-hover:opacity-100'
                 }`}>
                                     {/* Botão Ativar/Desativar */}
                   <button
                     onClick={() => toggleStatusCategoria(categoria.id, !categoria.status)}
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
                     onClick={() => editarCategoria(categoria.id)}
                     className="w-6 h-6 bg-sky-500 hover:bg-sky-600 hover:scale-110 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                     title="Editar categoria"
                   >
                     <Edit className="w-3 h-3" />
                   </button>

                   {/* Botão Deletar */}
                   <button
                                           onClick={() => deletarCategoria(categoria.id)}
                     className="w-6 h-6 bg-rose-500 hover:bg-rose-600 hover:scale-110 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                     title="Deletar categoria"
                   >
                     <Trash2 className="w-3 h-3" />
                   </button>
                </div>
              </div>

                             {/* Informações da Categoria */}
               <div className="flex-shrink-0 text-center">
                 <h4 className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                   {categoria.nome}
                 </h4>
               </div>
            </div>
          ))}
        </div>
      )}

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
