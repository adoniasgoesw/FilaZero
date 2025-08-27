import React, { useState, useEffect } from 'react';
import { Package, Tag, ChefHat, Utensils, Power, PowerOff } from 'lucide-react';
import CancelButton from '../buttons/CancelButton';
import AddButton from '../buttons/AddButton';
import SalveButton from '../buttons/SalveButton';
import CopyButton from '../buttons/CopyButton';
import ListagemCategoriaComplementos from '../list/ListagemCategoriaComplementos';
import Notification from '../elements/Notification.jsx';
import api from '../../services/api.js';

const FormProdutos = ({ onClose, onSubmit, produtoParaEditar = null }) => {
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

  const [formData, setFormData] = useState({
    nome: produtoParaEditar?.nome || '',
    descricao: produtoParaEditar?.descricao || '',
    categoria_id: produtoParaEditar?.categoria_id || '',
    valor_venda: produtoParaEditar?.valor_venda || '',
    valor_custo: produtoParaEditar?.valor_custo || '',
    habilitar_estoque: produtoParaEditar?.habilitar_estoque || false,
    estoque_quantidade: produtoParaEditar?.estoque_quantidade || '',
    habilitar_tempo_preparo: produtoParaEditar?.habilitar_tempo_preparo || false,
    tempo_preparo: produtoParaEditar?.tempo_preparo || ''
  });
  
  const [imagemPreview, setImagemPreview] = useState(
    produtoParaEditar?.imagem_url ? getImageUrl(produtoParaEditar.imagem_url) : null
  );
  
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState('detalhes');
  
  // Estado para categorias de complementos
  const [categoriasComplementos, setCategoriasComplementos] = useState([]);
  const [showFormCategoria, setShowFormCategoria] = useState(false);
  const [categoriasEditadas, setCategoriasEditadas] = useState({});
  const [novaCategoria, setNovaCategoria] = useState({
    nome: '',
    quantidade_minima: 0,
    quantidade_maxima: 0,
    preenchimento_obrigatorio: false,
    status: true
  });
  
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

  // Funções para gerenciar categorias de complementos
  const handleSalvarCategoria = async () => {
    if (!novaCategoria.nome.trim()) {
      showNotification('error', 'Erro', 'Nome da categoria é obrigatório');
      return;
    }
    
    if (novaCategoria.quantidade_minima > novaCategoria.quantidade_maxima) {
      showNotification('error', 'Erro', 'Quantidade mínima não pode ser maior que a máxima');
      return;
    }

    try {
      setLoading(true);
      
      // Buscar estabelecimento do localStorage
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      if (!estabelecimento || !estabelecimento.id) {
        showNotification('error', 'Erro', 'Estabelecimento não encontrado');
        return;
      }

      // Preparar dados para enviar
      const categoriaData = {
        produto_id: produtoParaEditar?.id || null, // Será definido quando o produto for salvo
        nome: novaCategoria.nome.trim(),
        quantidade_minima: novaCategoria.quantidade_minima,
        quantidade_maxima: novaCategoria.quantidade_maxima,
        preenchimento_obrigatorio: novaCategoria.preenchimento_obrigatorio,
        status: novaCategoria.status
      };

      // Enviar para a API
      const response = await api.post('/categorias-complementos', categoriaData);
      
      if (response.data.success) {
        // Adicionar à lista local com o ID retornado do backend
        const novaCategoriaCompleta = {
          ...response.data.data,
          criado_em: new Date().toISOString()
        };

        setCategoriasComplementos(prev => [...prev, novaCategoriaCompleta]);
        setShowFormCategoria(false);
        setNovaCategoria({
          nome: '',
          quantidade_minima: 0,
          quantidade_maxima: 0,
          preenchimento_obrigatorio: false,
          status: true
        });
        
  
      } else {
        showNotification('error', 'Erro', response.data.message || 'Erro ao criar categoria');
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      showNotification('error', 'Erro', 'Erro ao criar categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar TODAS as categorias (novas + editadas)
  const handleSalvarTodasCategorias = async () => {
    try {
      setLoading(true);
      
      let categoriasSalvas = 0;
      
      // Buscar estabelecimento do localStorage
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      if (!estabelecimento || !estabelecimento.id) {
        showNotification('error', 'Erro', 'Estabelecimento não encontrado');
        return;
      }

      // Salvar categoria nova se existir
      if (showFormCategoria && novaCategoria.nome.trim()) {
        if (novaCategoria.quantidade_minima > novaCategoria.quantidade_maxima) {
          showNotification('error', 'Erro', 'Quantidade mínima não pode ser maior que a máxima');
          return;
        }

        const categoriaData = {
          produto_id: produtoParaEditar?.id || null,
          nome: novaCategoria.nome.trim(),
          quantidade_minima: novaCategoria.quantidade_minima,
          quantidade_maxima: novaCategoria.quantidade_maxima,
          preenchimento_obrigatorio: novaCategoria.preenchimento_obrigatorio,
          status: novaCategoria.status
        };

        const response = await api.post('/categorias-complementos', categoriaData);
        
        if (response.data.success) {
          const novaCategoriaCompleta = {
            ...response.data.data,
            criado_em: new Date().toISOString()
          };

          setCategoriasComplementos(prev => [...prev, novaCategoriaCompleta]);
          setShowFormCategoria(false);
          setNovaCategoria({
            nome: '',
            quantidade_minima: 0,
            quantidade_maxima: 0,
            preenchimento_obrigatorio: false,
            status: true
          });
        } else {
          showNotification('error', 'Erro', response.data.message || 'Erro ao criar categoria');
          return;
        }
        
        categoriasSalvas++;
      }

      // Salvar/atualizar categorias existentes que foram editadas
      for (let i = 0; i < categoriasComplementos.length; i++) {
        const categoria = categoriasComplementos[i];
        const categoriaEditada = categoriasEditadas[i];
        
        if (categoriaEditada) {
          try {
            const response = await api.put(`/categorias-complementos/${categoria.id}`, categoriaEditada);
            
            if (response.data.success) {
              // Atualizar na lista local
              setCategoriasComplementos(prev => 
                prev.map((cat, index) => 
                  index === i ? response.data.data : cat
                )
              );
              categoriasSalvas++;
            }
          } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
          }
        }
      }
      
      // Limpar estado de edição
      setCategoriasEditadas({});
      
      // Mostrar notificação de sucesso
      if (categoriasSalvas > 0) {
        showNotification('success', 'Categorias Salvas!', 'Categorias de complementos salvas com sucesso! 🎉');
      }
    } catch (error) {
      console.error('Erro ao salvar categorias:', error);
      showNotification('error', 'Erro', 'Erro ao salvar categorias. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (index) => {
    try {
      const categoria = categoriasComplementos[index];
      const novoStatus = !categoria.status;
      
      // Atualizar no backend
      const response = await api.put(`/categorias-complementos/${categoria.id}/status`, {
        status: novoStatus
      });
      
      if (response.data.success) {
        // Atualizar na lista local
        setCategoriasComplementos(prev => 
          prev.map((cat, i) => 
            i === index ? { ...cat, status: novoStatus } : cat
          )
        );
        

      } else {
        showNotification('error', 'Erro', 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showNotification('error', 'Erro', 'Erro ao atualizar status. Tente novamente.');
    }
  };

  const handleAdicionarComplemento = (categoria) => {
    // TODO: Implementar adição de complementos
    console.log('Adicionando complemento para categoria:', categoria);
    showNotification('info', 'Info', 'Funcionalidade de adicionar complementos será implementada em breve');
  };

  const handleEditarCategoria = async (categoriaEditada, index) => {
    try {
      setLoading(true);
      
      const response = await api.put(`/categorias-complementos/${categoriaEditada.id}`, categoriaEditada);
      
      if (response.data.success) {
        setCategoriasComplementos(prev => 
          prev.map((cat, i) => i === index ? response.data.data : cat)
        );
  
      } else {
        showNotification('error', 'Erro', response.data.message || 'Erro ao atualizar categoria');
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      showNotification('error', 'Erro', 'Erro ao atualizar categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarCategoria = async (categoriaId, index) => {
    try {
      const response = await api.delete(`/categorias-complementos/${categoriaId}`);
      
      if (response.data.success) {
        setCategoriasComplementos(prev => prev.filter((_, i) => i !== index));
  
      } else {
        showNotification('error', 'Erro', response.data.message || 'Erro ao deletar categoria');
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      showNotification('error', 'Erro', 'Erro ao deletar categoria. Tente novamente.');
    }
  };

  // Buscar categorias de complementos do produto
  const buscarCategoriasComplementos = async () => {
    try {
      if (!produtoParaEditar?.id) return;
      
      console.log('🔍 Buscando categorias de complementos...');
      const response = await api.get(`/categorias-complementos/produto/${produtoParaEditar.id}`);
      console.log('✅ Resposta das categorias de complementos:', response.data);
      
      if (response.data.success) {
        setCategoriasComplementos(response.data.data);
        console.log('📋 Categorias de complementos carregadas:', response.data.data);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar categorias de complementos:', error);
      // Não mostrar erro se não houver categorias ainda
      if (error.response?.status !== 404) {
        console.error('❌ Detalhes do erro:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
    }
  };

  // Buscar categorias do estabelecimento
  const buscarCategorias = async () => {
    try {
      console.log('🔍 Buscando categorias...');
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      console.log('🏪 Estabelecimento do localStorage:', estabelecimento);
      
      if (!estabelecimento || !estabelecimento.id) {
        console.warn('⚠️ Estabelecimento não encontrado no localStorage');
        return;
      }

      console.log('📡 Fazendo requisição para categorias...');
      const response = await api.get(`/categorias/estabelecimento/${estabelecimento.id}`);
      console.log('✅ Resposta das categorias:', response.data);
      
      if (response.data.success) {
        setCategorias(response.data.data);
        console.log('📋 Categorias carregadas:', response.data.data);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  // Carregar categorias quando o componente montar
  useEffect(() => {
    buscarCategorias();
    if (produtoParaEditar?.id) {
      buscarCategoriasComplementos();
    }
  }, [produtoParaEditar?.id]);

  // Atualizar formData quando produtoParaEditar mudar
  useEffect(() => {
    if (produtoParaEditar) {
      setFormData({
        nome: produtoParaEditar.nome || '',
        descricao: produtoParaEditar.descricao || '',
        categoria_id: produtoParaEditar.categoria_id || '',
        valor_venda: produtoParaEditar.valor_venda || '',
        valor_custo: produtoParaEditar.valor_custo || '',
        habilitar_estoque: produtoParaEditar.habilitar_estoque || false,
        estoque_quantidade: produtoParaEditar.estoque_quantidade || '',
        habilitar_tempo_preparo: produtoParaEditar.habilitar_tempo_preparo || false,
        tempo_preparo: produtoParaEditar.tempo_preparo || ''
      });
      
      setImagemPreview(
        produtoParaEditar.imagem_url ? getImageUrl(produtoParaEditar.imagem_url) : null
      );
    }
  }, [produtoParaEditar]);

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

      {/* Header de Seleção - Três Áreas */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100">
        <div className="flex justify-start px-6 py-2">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('detalhes')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'detalhes'
                  ? 'bg-white text-cyan-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('complementos')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'complementos'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-orange-600 hover:text-orange-700'
              }`}
            >
              Complementos
            </button>
            <button
              onClick={() => setActiveTab('receita')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'receita'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-green-600 hover:text-green-700'
              }`}
            >
              Receita
            </button>
          </div>
        </div>
      </div>

      {/* Formulário com scroll - ocupa o espaço restante */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Área de Detalhes do Produto */}
        {activeTab === 'detalhes' && (
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

          {/* Espaçamento para os botões fixos */}
          <div className="h-20"></div>
        </form>
        )}

        {/* Área de Complementos */}
        {activeTab === 'complementos' && (
          <div className="space-y-4">
            {/* Botões de Ação */}
            <div className="flex space-x-3 mb-4">
              <AddButton
                onClick={() => setShowFormCategoria(true)}
                text="Adicionar Categoria"
                className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white"
              />
              <CopyButton
                onClick={() => {/* TODO: Implementar copiar complementos */}}
                text="Copiar Complementos"
                className="bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white"
              />
            </div>

            {/* Formulário para Nova Categoria - Card Compacto */}
            {showFormCategoria && (
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                {/* Botão de Status no canto superior direito */}
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setNovaCategoria(prev => ({ ...prev, status: !prev.status }))}
                    className="flex items-center space-x-2 px-2 py-1 text-xs font-medium rounded-md transition-colors hover:bg-gray-50"
                    title={novaCategoria.status ? 'Desativar' : 'Ativar'}
                  >
                    {novaCategoria.status ? (
                      <>
                        <Power className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">Ativo</span>
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-400">Inativo</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Nome da Categoria */}
                  <div>
                    <label htmlFor="nome_categoria" className="block text-xs font-medium text-gray-700 mb-1">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      id="nome_categoria"
                      value={novaCategoria.nome}
                      onChange={(e) => setNovaCategoria(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: Tamanhos, Bordas, Molhos"
                      required
                    />
                  </div>

                  {/* Quantidade Mínima e Máxima - Lado a lado */}
                  <div className="flex items-end space-x-3">
                    <div>
                      <label htmlFor="quantidade_minima" className="block text-xs font-medium text-gray-700 mb-1">
                        Qtd. Min
                      </label>
                      <input
                        type="number"
                        id="quantidade_minima"
                        value={novaCategoria.quantidade_minima}
                        onChange={(e) => setNovaCategoria(prev => ({ ...prev, quantidade_minima: parseInt(e.target.value) || 0 }))}
                        min="0"
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="quantidade_maxima" className="block text-xs font-medium text-gray-700 mb-1">
                        Qtd. Max
                      </label>
                      <input
                        type="number"
                        id="quantidade_maxima"
                        value={novaCategoria.quantidade_maxima}
                        onChange={(e) => setNovaCategoria(prev => ({ ...prev, quantidade_maxima: parseInt(e.target.value) || 1 }))}
                        min="1"
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Checkbox Preenchimento Obrigatório */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="preenchimento_obrigatorio"
                      checked={novaCategoria.preenchimento_obrigatorio}
                      onChange={(e) => setNovaCategoria(prev => ({ ...prev, preenchimento_obrigatorio: e.target.checked }))}
                      className="w-3 h-3 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="preenchimento_obrigatorio" className="text-xs text-gray-700">
                      Preenchimento obrigatório
                    </label>
                  </div>

                  {/* Botão Adicionar Complementos */}
                  <div className="flex justify-end pt-1">
                    <AddButton
                      onClick={() => {
                        // TODO: Implementar adição de complementos
                        console.log('Adicionando complementos para nova categoria');
                      }}
                      text="Adicionar Complementos"
                      className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Listagem de Categorias usando o novo componente */}
            <ListagemCategoriaComplementos
              categorias={categoriasComplementos}
              categoriasEditadas={categoriasEditadas}
              setCategoriasEditadas={setCategoriasEditadas}
              onToggleStatus={handleToggleStatus}
              onAdicionarComplemento={handleAdicionarComplemento}
              onEditarCategoria={handleEditarCategoria}
              onDeletarCategoria={handleDeletarCategoria}
            />

            {/* Mensagem quando não há categorias */}
            {!showFormCategoria && categoriasComplementos.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">Nenhuma categoria criada</p>
              </div>
            )}
          </div>
        )}

        {/* Área de Receita */}
        {activeTab === 'receita' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Gerenciar Receita</h3>
              <p className="text-gray-600 mb-6">Configure os ingredientes e instruções de preparo</p>
              <button
                type="button"
                className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <ChefHat className="w-5 h-5" />
                <span>Adicionar Receita</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botões fixos na parte inferior */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <CancelButton
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          />
          {activeTab === 'detalhes' && (
            <AddButton
              onClick={handleSubmit}
              text={loading ? 'Processando...' : (isEditando ? 'Alterar' : 'Cadastrar')}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-300 to-cyan-400 hover:from-cyan-400 hover:to-cyan-500 text-white h-12 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          )}
          {activeTab === 'complementos' && (
            <SalveButton
              onClick={handleSalvarTodasCategorias}
              text={loading ? 'Salvando...' : 'Salvar Categorias'}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white h-12 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          )}
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
