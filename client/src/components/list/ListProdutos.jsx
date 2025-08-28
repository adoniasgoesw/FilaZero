import React, { useState, useEffect } from 'react';
import { Power, PowerOff, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api.js';
import Notification from '../elements/Notification.jsx';

const ListProdutos = ({ onRefresh, onAction }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para notificações
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    showConfirm: false
  });

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

  // Função helper para lidar com erro de imagem
  const handleImageError = (e) => {
    if (e.target) {
      e.target.style.display = 'none';
    }
    if (e.target && e.target.nextSibling) {
      e.target.nextSibling.style.display = 'flex';
    }
  };

  // Função para mostrar notificação
  const showNotification = (type, title, message, onConfirm = null, showConfirm = false) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      showConfirm
    });
  };

  // Função para fechar notificação
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  // Buscar produtos do banco de dados
  const buscarProdutos = async () => {
    try {
      setLoading(true);
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      
      if (!estabelecimento || !estabelecimento.id) {
        console.error('Estabelecimento não encontrado');
        return;
      }

      const response = await api.get(`/produtos/estabelecimento/${estabelecimento.id}`);
      if (response.data.success) {
        setProdutos(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar produtos quando o componente montar
  useEffect(() => {
    buscarProdutos();
  }, [onRefresh]);

  // Função para ativar/desativar produto
  const toggleStatusProduto = async (id, novoStatus) => {
    try {
      const response = await api.put(`/produtos/${id}/status`, { status: novoStatus });
      if (response.data.success) {
        buscarProdutos(); // Recarregar lista
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status do produto:', error);
    }
  };

  // Função para editar produto
  const editarProduto = (produto) => {
    // Emitir evento para abrir modal de edição
    if (onAction && typeof onAction === 'function') {
      onAction({ action: 'edit', produto });
    }
  };

  // Função para deletar produto
  const deletarProduto = async (id) => {
    const produto = produtos.find(prod => prod.id === id);
    if (produto) {
      showNotification(
        'delete',
        'Confirmar Exclusão',
        `Deseja excluir o produto "${produto.nome}"?`,
        () => confirmarDeletarProduto(id),
        true
      );
    }
  };

  // Função para confirmar exclusão
  const confirmarDeletarProduto = async (id) => {
    try {
      const response = await api.delete(`/produtos/${id}`);
      if (response.data.success) {
        buscarProdutos();
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  };

  // Formatar preço
  const formatarPreco = (preco) => {
    if (!preco) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  // Função para obter ícone baseado na categoria
  const getCategoryIcon = (categoriaNome) => {
    const categoria = categoriaNome?.toLowerCase() || '';
    
    if (categoria.includes('eletrônicos') || categoria.includes('eletronicos')) {
      return 'fas fa-laptop';
    } else if (categoria.includes('roupas') || categoria.includes('vestuário')) {
      return 'fas fa-tshirt';
    } else if (categoria.includes('livros') || categoria.includes('literatura')) {
      return 'fas fa-book';
    } else if (categoria.includes('alimentos') || categoria.includes('comida')) {
      return 'fas fa-utensils';
    } else if (categoria.includes('bebidas')) {
      return 'fas fa-wine-glass';
    } else {
      return 'fas fa-box';
    }
  };

  // Função para obter cor do gradiente baseado na categoria
  const getCategoryGradient = (categoriaNome) => {
    const categoria = categoriaNome?.toLowerCase() || '';
    
    if (categoria.includes('eletrônicos') || categoria.includes('eletronicos')) {
      return 'from-blue-400 to-blue-600';
    } else if (categoria.includes('roupas') || categoria.includes('vestuário')) {
      return 'from-red-400 to-red-600';
    } else if (categoria.includes('livros') || categoria.includes('literatura')) {
      return 'from-yellow-400 to-yellow-600';
    } else if (categoria.includes('alimentos') || categoria.includes('comida')) {
      return 'from-green-400 to-green-600';
    } else if (categoria.includes('bebidas')) {
      return 'from-purple-400 to-purple-600';
    } else {
      return 'from-indigo-400 to-indigo-600';
    }
  };

  // Função para obter cor da categoria
  const getCategoryColor = (categoriaNome) => {
    const categoria = categoriaNome?.toLowerCase() || '';
    
    if (categoria.includes('eletrônicos') || categoria.includes('eletronicos')) {
      return 'bg-purple-100 text-purple-800';
    } else if (categoria.includes('roupas') || categoria.includes('vestuário')) {
      return 'bg-blue-100 text-blue-800';
    } else if (categoria.includes('livros') || categoria.includes('literatura')) {
      return 'bg-green-100 text-green-800';
    } else if (categoria.includes('alimentos') || categoria.includes('comida')) {
      return 'bg-orange-100 text-orange-800';
    } else if (categoria.includes('bebidas')) {
      return 'bg-pink-100 text-pink-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  // Componente de Card Horizontal para Mobile com Estrutura Hierárquica
  const ProductCardMobile = ({ produto }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
      {/* 👑 PAI - Card com 3 filhos alinhados horizontalmente */}
      <div className="flex h-20">
        
        {/* 🖼️ FILHO 1 - Imagem (sem filhos) */}
        <div className="w-1/5 h-full">
          <div className={`w-full h-full bg-gradient-to-br ${getCategoryGradient(produto.categoria_nome)} flex items-center justify-center`}>
            {produto.imagem_url ? (
              <img
                src={getImageUrl(produto.imagem_url)}
                alt={produto.nome}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : null}
            {(!produto.imagem_url || produto.imagem_url === '') && (
              <i className={`${getCategoryIcon(produto.categoria_nome)} text-white text-lg`}></i>
            )}
          </div>
        </div>

        {/* 📊 FILHO 2 - Dados (com 2 filhos em coluna) */}
        <div className="w-2/5 h-full p-3 flex flex-col justify-center space-y-1">
          {/* Filho 2.1 - Nome */}
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {produto.nome}
          </h3>
          
          {/* Filho 2.2 - Preço */}
          <div>
            <span className="text-sm font-bold text-gray-900">
              {formatarPreco(produto.valor_venda)}
            </span>
          </div>
        </div>

        {/* ⚡ FILHO 3 - Ações + Status (com 2 filhos em coluna) */}
        <div className="w-2/5 h-full p-3 flex flex-col justify-between">
          
          {/* Filho 3.1 - Ações (com 3 filhos em linha) */}
          <div className="flex items-center justify-end space-x-1">
            {/* Filho 3.1.1 - Ativar/Desativar */}
            <button
              onClick={() => toggleStatusProduto(produto.id, !produto.status)}
              className={`w-7 h-7 rounded-full text-white transition-colors flex items-center justify-center ${
                produto.status
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
              title={produto.status ? 'Desativar' : 'Ativar'}
            >
              {produto.status ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
            </button>

            {/* Filho 3.1.2 - Editar */}
            <button
              onClick={() => editarProduto(produto)}
              className="w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors flex items-center justify-center"
              title="Editar"
            >
              <Edit className="w-3 h-3" />
            </button>

            {/* Filho 3.1.3 - Deletar */}
            <button
              onClick={() => deletarProduto(produto.id)}
              className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors flex items-center justify-center"
              title="Deletar"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {/* Filho 3.2 - Status */}
          <div className="flex justify-end">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              produto.status
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              <i className={`fas fa-circle ${produto.status ? 'text-green-500' : 'text-red-500'} mr-1 text-xs`}></i>
              {produto.status ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </div>
      </div>
    );

  // Componente de Card Vertical para Tablet
  const ProductCardTablet = ({ produto }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
      {/* Imagem e Status */}
      <div className="relative">
        <div className={`w-full h-32 bg-gradient-to-br ${getCategoryGradient(produto.categoria_nome)} flex items-center justify-center`}>
          {produto.imagem_url ? (
            <img
              src={getImageUrl(produto.imagem_url)}
              alt={produto.nome}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : null}
          {(!produto.imagem_url || produto.imagem_url === '') && (
            <i className={`${getCategoryIcon(produto.categoria_nome)} text-white text-4xl`}></i>
          )}
        </div>
        
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            produto.status
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            <i className={`fas fa-circle ${produto.status ? 'text-green-500' : 'text-red-500'} mr-1 text-xs`}></i>
            {produto.status ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-3">
        {/* Nome do Produto */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
          {produto.nome}
        </h3>
        
        {/* Categoria */}
        <div className="mb-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(produto.categoria_nome)}`}>
            {produto.categoria_nome || 'Sem categoria'}
          </span>
        </div>
        
        {/* Preço */}
        <div className="mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatarPreco(produto.valor_venda)}
          </span>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex items-center justify-center space-x-2">
          {/* Ativar/Desativar */}
          <button
            onClick={() => toggleStatusProduto(produto.id, !produto.status)}
            className={`w-8 h-8 rounded-full text-white transition-colors flex items-center justify-center ${
              produto.status
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
            title={produto.status ? 'Desativar' : 'Ativar'}
          >
            {produto.status ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>

          {/* Editar */}
          <button
            onClick={() => editarProduto(produto)}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors flex items-center justify-center"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Deletar */}
          <button
            onClick={() => deletarProduto(produto.id)}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors flex items-center justify-center"
            title="Deletar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      </div>
    );

  // Componente de Tabela para Desktop
  const ProductTable = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
            {/* Cabeçalho da tabela */}
          <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Produto
                </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Categoria
                </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Preço de Venda
                </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            
            {/* Corpo da tabela */}
          <tbody className="divide-y divide-gray-200">
              {produtos.map((produto) => (
              <tr key={produto.id} className="hover:bg-gray-50 transition-colors duration-200">
                {/* Produto com Imagem */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                      {/* Imagem do produto */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryGradient(produto.categoria_nome)} rounded-lg flex items-center justify-center`}>
                        {produto.imagem_url ? (
                          <img
                            src={getImageUrl(produto.imagem_url)}
                            alt={produto.nome}
                          className="w-full h-full object-cover rounded-lg"
                            onError={handleImageError}
                        />
                      ) : null}
                      {(!produto.imagem_url || produto.imagem_url === '') && (
                        <i className={`${getCategoryIcon(produto.categoria_nome)} text-white text-lg`}></i>
                        )}
                      </div>
                      
                    {/* Nome do produto */}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                    </div>
                    </div>
                  </td>
                  
                  {/* Categoria */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(produto.categoria_nome)}`}>
                      {produto.categoria_nome || 'Sem categoria'}
                    </span>
                  </td>
                  
                  {/* Preço de Venda */}
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatarPreco(produto.valor_venda)}
                  </td>
                  
                  {/* Status */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      produto.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    <i className={`fas fa-circle ${produto.status ? 'text-green-500' : 'text-red-500'} mr-1 text-xs`}></i>
                      {produto.status ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  
                  {/* Ações */}
                <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {/* Ativar/Desativar */}
                      <button
                        onClick={() => toggleStatusProduto(produto.id, !produto.status)}
                        className={`w-8 h-8 rounded-full text-white transition-colors flex items-center justify-center ${
                          produto.status
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                        title={produto.status ? 'Desativar' : 'Ativar'}
                      >
                        {produto.status ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>

                      {/* Editar */}
                      <button
                        onClick={() => editarProduto(produto)}
                        className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors flex items-center justify-center"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Deletar */}
                      <button
                        onClick={() => deletarProduto(produto.id)}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors flex items-center justify-center"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg">Nenhum produto encontrado</p>
        <p className="text-sm">Cadastre seu primeiro produto para começar</p>
      </div>
    );
  }

  return (
    <>
      {/* Layout Responsivo */}
      
      {/* Mobile: Cards horizontais (1 por linha) - Rolagem infinita */}
      <div className="block md:hidden">
        <div className="space-y-3 pb-6">
          {produtos.map((produto) => (
            <ProductCardMobile key={produto.id} produto={produto} />
          ))}
        </div>
      </div>

      {/* Tablet: Cards verticais (2 por linha) - Rolagem infinita */}
      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-2 gap-4 pb-6">
          {produtos.map((produto) => (
            <ProductCardTablet key={produto.id} produto={produto} />
          ))}
        </div>
      </div>

      {/* Desktop: Tabela completa - Rolagem na tabela */}
      <div className="hidden lg:block">
        <div className="max-h-[70vh] overflow-y-auto">
          <ProductTable />
        </div>
      </div>

      {/* Sistema de Notificação */}
      <Notification
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        showConfirm={notification.showConfirm}
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
      />
    </>
  );
};

export default ListProdutos;
