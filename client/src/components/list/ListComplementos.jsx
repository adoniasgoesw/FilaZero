import React, { useState, useEffect } from 'react';
import { Power, PowerOff, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api.js';
import Notification from '../elements/Notification.jsx';

const ListComplementos = ({ onRefresh, onAction, modoSelecao = false, complementosSelecionados = [], setComplementosSelecionados = null }) => {
  const [complementos, setComplementos] = useState([]);
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

  // Buscar complementos do banco de dados
  const buscarComplementos = async () => {
    try {
      setLoading(true);
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      
      if (!estabelecimento || !estabelecimento.id) {
        console.error('Estabelecimento não encontrado');
        return;
      }

      const response = await api.get(`/complementos/estabelecimento/${estabelecimento.id}`);
      if (response.data.success) {
        setComplementos(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar complementos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar complementos quando o componente montar
  useEffect(() => {
    buscarComplementos();
  }, [onRefresh]);

  // Função para ativar/desativar complemento
  const toggleStatusComplemento = async (id, novoStatus) => {
    try {
      const response = await api.put(`/complementos/${id}/status`, { status: novoStatus });
      if (response.data.success) {
        buscarComplementos(); // Recarregar lista
      }
    } catch (error) {
      console.error('❌ Erro ao alterar status do complemento:', error);
    }
  };

  // Função para editar complemento
  const editarComplemento = (complemento) => {
    // Emitir evento para abrir modal de edição
    if (onAction && typeof onAction === 'function') {
      onAction({ action: 'edit', complemento });
    }
  };

  // Função para lidar com seleção de complementos
  const handleSelecaoComplemento = (complementoId) => {
    if (!setComplementosSelecionados) return;
    
    setComplementosSelecionados(prev => {
      if (prev.includes(complementoId)) {
        return prev.filter(id => id !== complementoId);
      } else {
        return [...prev, complementoId];
      }
    });
  };

  // Função para deletar complemento
  const deletarComplemento = async (id) => {
    const complemento = complementos.find(comp => comp.id === id);
    if (complemento) {
      showNotification(
        'delete',
        'Confirmar Exclusão',
        `Deseja excluir o complemento "${complemento.nome}"?`,
        () => confirmarDeletarComplemento(id),
        true
      );
    }
  };

  // Função para confirmar exclusão
  const confirmarDeletarComplemento = async (id) => {
    try {
      const response = await api.delete(`/complementos/${id}`);
      if (response.data.success) {
        buscarComplementos();
        closeNotification();
      }
    } catch (error) {
      console.error('Erro ao deletar complemento:', error);
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

  // Componente de Card Horizontal para Mobile
  const ComplementoCardMobile = ({ complemento }) => {
    // Modo de seleção - mostrar apenas nome e checkbox
    if (modoSelecao) {
      return (
        <div className="py-2 hover:bg-gray-50 transition-colors rounded-lg px-1">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={complementosSelecionados.includes(complemento.id)}
              onChange={() => handleSelecaoComplemento(complemento.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm font-light text-gray-600">
              {complemento.nome}
            </span>
          </div>
        </div>
      );
    }

    // Modo normal - mostrar card completo
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
        {/* 👑 PAI - Card com 3 filhos alinhados horizontalmente */}
        <div className="flex h-20">
          
          {/* 🖼️ FILHO 1 - Imagem (sem filhos) */}
          <div className="w-1/5 h-full">
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              {complemento.imagem_url ? (
                <img
                  src={getImageUrl(complemento.imagem_url)}
                  alt={complemento.nome}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              ) : null}
              {(!complemento.imagem_url || complemento.imagem_url === '') && (
                <i className="fas fa-plus text-white text-lg"></i>
              )}
            </div>
          </div>

          {/* 📊 FILHO 2 - Dados (com 2 filhos em coluna) */}
          <div className="w-2/5 h-full p-3 flex flex-col justify-center space-y-1">
            {/* Filho 2.1 - Nome */}
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {complemento.nome}
            </h3>
            
            {/* Filho 2.2 - Preço */}
            <div>
              <span className="text-sm font-bold text-gray-900">
                {formatarPreco(complemento.valor_venda)}
              </span>
            </div>
          </div>

          {/* ⚡ FILHO 3 - Ações + Status (com 2 filhos em coluna) */}
          <div className="w-2/5 h-full p-3 flex flex-col justify-between">
            
            {/* Filho 3.1 - Ações (com 3 filhos em linha) */}
            <div className="flex items-center justify-end space-x-1">
              {/* Filho 3.1.1 - Ativar/Desativar */}
              <button
                onClick={() => toggleStatusComplemento(complemento.id, !complemento.status)}
                className={`w-7 h-7 rounded-full text-white transition-colors flex items-center justify-center ${
                  complemento.status
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
                title={complemento.status ? 'Desativar' : 'Ativar'}
              >
                {complemento.status ? <PowerOff className="w-3 h-3" /> : <Power className="w-3 h-3" />}
              </button>

              {/* Filho 3.1.2 - Editar */}
              <button
                onClick={() => editarComplemento(complemento)}
                className="w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors flex items-center justify-center"
                title="Editar"
              >
                <Edit className="w-3 h-3" />
              </button>

              {/* Filho 3.1.3 - Deletar */}
              <button
                onClick={() => deletarComplemento(complemento.id)}
                className="w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors flex items-center justify-center"
                title="Deletar"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Filho 3.2 - Status */}
            <div className="flex justify-end">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                complemento.status
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                <i className={`fas fa-circle ${complemento.status ? 'text-green-500' : 'text-red-500'} mr-1 text-xs`}></i>
                {complemento.status ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente de Card Vertical para Tablet
  const ComplementoCardTablet = ({ complemento }) => {
    // Modo de seleção - mostrar apenas nome e checkbox
    if (modoSelecao) {
      return (
        <div className="py-2 hover:bg-gray-50 transition-colors rounded-lg px-1">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={complementosSelecionados.includes(complemento.id)}
              onChange={() => handleSelecaoComplemento(complemento.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm font-light text-gray-600">
              {complemento.nome}
            </span>
          </div>
        </div>
      );
    }

    // Modo normal - mostrar card completo
    return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
      {/* Imagem e Status */}
      <div className="relative">
        <div className="w-full h-32 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          {complemento.imagem_url ? (
            <img
              src={getImageUrl(complemento.imagem_url)}
              alt={complemento.nome}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : null}
          {(!complemento.imagem_url || complemento.imagem_url === '') && (
            <i className="fas fa-plus text-white text-4xl"></i>
          )}
        </div>
        
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            complemento.status
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            <i className={`fas fa-circle ${complemento.status ? 'text-green-500' : 'text-red-500'} mr-1 text-xs`}></i>
            {complemento.status ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-3">
        {/* Nome do Complemento */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
          {complemento.nome}
        </h3>
        
        {/* Preço */}
        <div className="mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatarPreco(complemento.valor_venda)}
          </span>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex items-center justify-center space-x-2">
          {/* Ativar/Desativar */}
          <button
            onClick={() => toggleStatusComplemento(complemento.id, !complemento.status)}
            className={`w-8 h-8 rounded-full text-white transition-colors flex items-center justify-center ${
              complemento.status
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
            title={complemento.status ? 'Desativar' : 'Ativar'}
          >
            {complemento.status ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>

          {/* Editar */}
          <button
            onClick={() => editarComplemento(complemento)}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors flex items-center justify-center"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Deletar */}
          <button
            onClick={() => deletarComplemento(complemento.id)}
            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors flex items-center justify-center"
            title="Deletar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
      );
  };

  // Componente de Tabela para Desktop
  const ComplementoTable = () => {
    // Modo de seleção - mostrar apenas nome e checkbox
    if (modoSelecao) {
      return (
        <div className="space-y-1">
          {complementos.map((complemento) => (
            <div key={complemento.id} className="flex items-center space-x-3 py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={complementosSelecionados.includes(complemento.id)}
                onChange={() => handleSelecaoComplemento(complemento.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="text-sm font-light text-gray-600">
                {complemento.nome}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // Modo normal - mostrar tabela completa
    return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Cabeçalho da tabela */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Complemento
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
            {complementos.map((complemento) => (
              <tr key={complemento.id} className="hover:bg-gray-50 transition-colors duration-200">
                {/* Complemento com Imagem */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    {/* Imagem do complemento */}
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                      {complemento.imagem_url ? (
                        <img
                          src={getImageUrl(complemento.imagem_url)}
                          alt={complemento.nome}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {(!complemento.imagem_url || complemento.imagem_url === '') && (
                        <i className="fas fa-plus text-white text-lg"></i>
                      )}
                    </div>
                    
                    {/* Nome do complemento */}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{complemento.nome}</div>
                    </div>
                  </div>
                </td>
                
                {/* Preço de Venda */}
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {formatarPreco(complemento.valor_venda)}
                </td>
                
                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    complemento.status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <i className={`fas fa-circle ${complemento.status ? 'text-green-500' : 'text-red-500'} mr-1 text-xs`}></i>
                    {complemento.status ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                
                {/* Ações */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {/* Ativar/Desativar */}
                    <button
                      onClick={() => toggleStatusComplemento(complemento.id, !complemento.status)}
                      className={`w-8 h-8 rounded-full text-white transition-colors flex items-center justify-center ${
                        complemento.status
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                      title={complemento.status ? 'Desativar' : 'Ativar'}
                    >
                      {complemento.status ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => editarComplemento(complemento)}
                      className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors flex items-center justify-center"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Deletar */}
                    <button
                      onClick={() => deletarComplemento(complemento.id)}
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (complementos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg">Nenhum complemento encontrado</p>
        <p className="text-sm">Cadastre seu primeiro complemento para começar</p>
      </div>
    );
  }

  return (
    <>
      {/* Layout Responsivo */}
      
      {/* Mobile: Cards horizontais (1 por linha) - Rolagem infinita */}
      <div className="block md:hidden">
        <div className="space-y-3 pb-6">
          {complementos.map((complemento) => (
            <ComplementoCardMobile key={complemento.id} complemento={complemento} />
          ))}
        </div>
      </div>

      {/* Tablet: Cards verticais (2 por linha) - Rolagem infinita */}
      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-2 gap-4 pb-6">
          {complementos.map((complemento) => (
            <ComplementoCardTablet key={complemento.id} complemento={complemento} />
          ))}
        </div>
      </div>

      {/* Desktop: Tabela completa - Rolagem na tabela */}
      <div className="hidden lg:block">
        <div className="max-h-[70vh] overflow-y-auto">
          <ComplementoTable />
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

export default ListComplementos;
