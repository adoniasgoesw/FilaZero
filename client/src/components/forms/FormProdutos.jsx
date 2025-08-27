import React, { useState, useEffect } from 'react';
import { Package, Tag } from 'lucide-react';
import CancelButton from '../buttons/CancelButton';
import Notification from '../elements/Notification.jsx';
import api from '../../services/api.js';

const FormProdutos = ({ onClose, onSubmit, produtoParaEditar = null }) => {
  const [formData, setFormData] = useState({
    nome: produtoParaEditar?.nome || '',
    descricao: produtoParaEditar?.descricao || '',
    categoria_id: produtoParaEditar?.categoria_id || '',
    valor_venda: produtoParaEditar?.valor_venda || '',
    valor_custo: produtoParaEditar?.valor_custo || '',
    habilitar_estoque: produtoParaEditar?.habilitar_estoque || false,
    estoque_quantidade: produtoParaEditar?.estoque_quantidade || '',
    habilitar_tempo_preparo: produtoParaEditar?.habilitar_tempo_preparo || false,
    tempo_preparo: produtoParaEditar?.tempo_preparo || '',
    status: produtoParaEditar?.status !== false
  });
  
  const [imagemPreview, setImagemPreview] = useState(
    produtoParaEditar?.imagem_url ? getImageUrl(produtoParaEditar.imagem_url) : null
  );
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para notificação
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    showConfirm: false
  });
  
  const isEditando = !!produtoParaEditar;

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

  // Buscar categorias do estabelecimento
  const buscarCategorias = async () => {
    try {
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      if (!estabelecimento || !estabelecimento.id) return;

      const response = await api.get(`/categorias/estabelecimento/${estabelecimento.id}`);
      if (response.data.success) {
        setCategorias(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  // Carregar categorias quando o componente montar
  useEffect(() => {
    buscarCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      showNotification('warning', 'Campo Obrigatório', 'Nome é obrigatório!');
      return;
    }

    if (!formData.categoria_id) {
      showNotification('warning', 'Campo Obrigatório', 'Categoria é obrigatória!');
      return;
    }

    try {
      setLoading(true);
      
      // Pegar o estabelecimento ID do localStorage
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      console.log('🏪 Estabelecimento encontrado:', estabelecimento);
      
      if (!estabelecimento || !estabelecimento.id) {
        showNotification('error', 'Erro', 'Erro: Estabelecimento não encontrado!');
        return;
      }

      // Criar FormData para enviar arquivo
      const formDataToSend = new FormData();
      formDataToSend.append('estabelecimento_id', estabelecimento.id);
      formDataToSend.append('nome', formData.nome);
      formDataToSend.append('descricao', formData.descricao);
      formDataToSend.append('categoria_id', formData.categoria_id);
      formDataToSend.append('valor_venda', formData.valor_venda);
      formDataToSend.append('valor_custo', formData.valor_custo);
      formDataToSend.append('habilitar_estoque', formData.habilitar_estoque);
      formDataToSend.append('estoque_quantidade', formData.estoque_quantidade);
      formDataToSend.append('habilitar_tempo_preparo', formData.habilitar_tempo_preparo);
      formDataToSend.append('tempo_preparo', formData.tempo_preparo);
      formDataToSend.append('status', formData.status);
      
      if (formData.imagem) {
        formDataToSend.append('imagem', formData.imagem);
      }
      
      // Se estiver editando, incluir o ID do produto
      if (isEditando) {
        formDataToSend.append('id', produtoParaEditar.id);
      }

      // Log do que está sendo enviado
      console.log('📤 Dados sendo enviados:', formData);
      
      let response;
      
      if (isEditando) {
        // Atualizar produto existente
        response = await api.put(`/produtos/${produtoParaEditar.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Criar novo produto
        response = await api.post('/produtos', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        const mensagem = isEditando ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!';
        showNotification('success', 'Sucesso', mensagem);
        onSubmit(response.data.data);
        onClose();
      } else {
        showNotification('error', 'Erro', 'Erro ao ' + (isEditando ? 'atualizar' : 'criar') + ' produto: ' + response.data.message);
      }
    } catch (error) {
      console.error('Erro ao ' + (isEditando ? 'atualizar' : 'criar') + ' produto:', error);
      if (error.response?.data?.message) {
        showNotification('error', 'Erro', 'Erro: ' + error.response.data.message);
      } else {
        showNotification('error', 'Erro', 'Erro ao ' + (isEditando ? 'atualizar' : 'criar') + ' produto. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header fixo - sempre visível */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-cyan-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditando ? 'Alterar Produto' : 'Cadastrar Produto'}
          </h2>
        </div>
      </div>

      {/* Formulário com scroll - ocupa o espaço restante */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome - Obrigatório */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Produto *
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Nome do produto"
            />
          </div>

          {/* Imagem - Logo abaixo do nome */}
          <div>
            <label htmlFor="imagem" className="block text-sm font-medium text-gray-700 mb-2">
              Imagem do Produto
            </label>
            <div className="relative">
              <input
                type="file"
                id="imagem"
                name="imagem"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData(prev => ({
                      ...prev,
                      imagem: file
                    }));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-200 overflow-hidden">
                {formData.imagem ? (
                  <div className="w-full h-full relative">
                    <img
                      src={URL.createObjectURL(formData.imagem)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : imagemPreview ? (
                  <div className="w-full h-full relative">
                    <img
                      src={imagemPreview}
                      alt="Imagem atual"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500">Clique para selecionar</p>
                    <p className="text-xs text-gray-400">ou arraste aqui</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categoria - Obrigatório */}
          <div>
            <label htmlFor="categoria_id" className="block text-sm font-medium text-gray-700 mb-2">
              Categoria *
            </label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Descrição do produto"
            />
          </div>

          {/* Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="valor_venda" className="block text-sm font-medium text-gray-700 mb-2">
                Valor de Venda
              </label>
              <input
                type="number"
                id="valor_venda"
                name="valor_venda"
                value={formData.valor_venda}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>
            <div>
              <label htmlFor="valor_custo" className="block text-sm font-medium text-gray-700 mb-2">
                Valor de Custo
              </label>
              <input
                type="number"
                id="valor_custo"
                name="valor_custo"
                value={formData.valor_custo}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Estoque */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="habilitar_estoque"
                name="habilitar_estoque"
                checked={formData.habilitar_estoque}
                onChange={handleChange}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="habilitar_estoque" className="text-sm font-medium text-gray-700">
                Habilitar Controle de Estoque
              </label>
            </div>
            
            {formData.habilitar_estoque && (
              <div>
                <label htmlFor="estoque_quantidade" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade em Estoque
                </label>
                <input
                  type="number"
                  id="estoque_quantidade"
                  name="estoque_quantidade"
                  value={formData.estoque_quantidade}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Tempo de Preparo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="habilitar_tempo_preparo"
                name="habilitar_tempo_preparo"
                checked={formData.habilitar_tempo_preparo}
                onChange={handleChange}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
              />
              <label htmlFor="habilitar_tempo_preparo" className="text-sm font-medium text-gray-700">
                Habilitar Tempo de Preparo
              </label>
            </div>
            
            {formData.habilitar_tempo_preparo && (
              <div>
                <label htmlFor="tempo_preparo" className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de Preparo (minutos)
                </label>
                <input
                  type="number"
                  id="tempo_preparo"
                  name="tempo_preparo"
                  value={formData.tempo_preparo}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="status"
              name="status"
              checked={formData.status}
              onChange={handleChange}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Produto Ativo
            </label>
          </div>

          {/* Espaçamento para os botões fixos */}
          <div className="h-20"></div>
        </form>
      </div>

      {/* Botões fixos na parte inferior */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <CancelButton
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          />
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-cyan-300 to-cyan-400 hover:from-cyan-400 hover:to-cyan-500 text-white h-12 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : (isEditando ? 'Alterar' : 'Cadastrar')}
          </button>
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
        confirmText="OK"
        cancelText="Fechar"
      />
    </div>
  );
};

export default FormProdutos;
