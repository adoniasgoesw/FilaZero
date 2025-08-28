import React, { useState, useEffect } from 'react';
import { Package, Tag, ChefHat, Utensils } from 'lucide-react';
import CancelButton from '../buttons/CancelButton';
import SaveButton from '../buttons/SaveButton';
import TabButton from '../buttons/TabButton';
import StatusToggleButton from '../buttons/StatusToggleButton';
import CopyButton from '../buttons/CopyButton';
import ListagemCategoriaComplementos from '../list/ListagemCategoriaComplementos';
import ListComplementos from '../list/ListComplementos.jsx';
import ListItemsComplementos from '../list/ListItemsComplementos.jsx';
import Notification from '../elements/Notification.jsx';
import SearchBar from '../layout/SearchBar.jsx';
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
  const [showAdicionarComplementos, setShowAdicionarComplementos] = useState(false);
  const [complementosSelecionados, setComplementosSelecionados] = useState([]);
  const [complementosPorCategoria, setComplementosPorCategoria] = useState({});
  const [complementosDisponiveis, setComplementosDisponiveis] = useState([]);
  const [categoriaAtualParaComplementos, setCategoriaAtualParaComplementos] = useState(null);
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



  // Função para salvar as categorias de complementos no banco de dados
  const salvarCategoriasComplementosNoBanco = async (produtoId) => {
    try {
      console.log('💾 Salvando categorias de complementos no banco para o produto:', produtoId);
      
      // Buscar estabelecimento do localStorage
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      if (!estabelecimento || !estabelecimento.id) {
        console.warn('⚠️ Estabelecimento não encontrado');
        return;
      }

      let categoriasSalvas = 0;
      const categoriasTemporarias = [];

      // Processar categorias temporárias (novas)
      console.log('🔍 Categorias para processar:', categoriasComplementos);
      console.log('🔍 Categorias editadas:', categoriasEditadas);
      
      for (const categoria of categoriasComplementos) {
        console.log('🔍 Processando categoria:', categoria);
        console.log('🔍 É temporária?', categoria.isTemporary);
        console.log('🔍 ID da categoria:', categoria.id);
        console.log('🔍 ID começa com temp_?', categoria.id.toString().startsWith('temp_'));
        
        if (categoria.isTemporary || categoria.id.toString().startsWith('temp_')) {
          console.log('✅ Categoria temporária encontrada, criando no banco...');
          // Categoria nova - criar no banco sem produto_id
          const categoriaData = {
            produto_id: null, // Será atualizado depois
            nome: categoria.nome,
            quantidade_minima: categoria.quantidade_minima,
            quantidade_maxima: categoria.quantidade_maxima,
            preenchimento_obrigatorio: categoria.preenchimento_obrigatorio,
            status: categoria.status
          };

          console.log('📤 Dados da categoria para enviar:', categoriaData);

          try {
            const response = await api.post('/categorias-complementos', categoriaData);
            console.log('📥 Resposta da API:', response.data);
            if (response.data.success) {
              categoriasTemporarias.push(response.data.data.id);
              categoriasSalvas++;
              console.log('✅ Categoria temporária criada no banco:', response.data.data);
            }
          } catch (error) {
            console.error('❌ Erro ao criar categoria temporária no banco:', error);
            console.error('❌ Detalhes do erro:', error.response?.data);
          }
        } else if (categoriasEditadas[categoriasComplementos.indexOf(categoria)]) {
          // Categoria existente editada - atualizar no banco apenas se não for temporária
          const categoriaEditada = categoriasEditadas[categoriasComplementos.indexOf(categoria)];
          
          // Verificar se não é temporária
          if (!categoria.isTemporary && !categoria.id.toString().startsWith('temp_')) {
            try {
              const response = await api.put(`/categorias-complementos/${categoria.id}`, categoriaEditada);
              if (response.data.success) {
                categoriasSalvas++;
                console.log('✅ Categoria atualizada no banco:', response.data.data);
              }
            } catch (error) {
              console.error('❌ Erro ao atualizar categoria no banco:', error);
            }
          } else {
            // Se for temporária editada, criar no banco como nova
            console.log('✅ Categoria temporária editada encontrada, criando no banco...');
            const categoriaData = {
              produto_id: null, // Será atualizado depois
              nome: categoriaEditada.nome || categoria.nome,
              quantidade_minima: categoriaEditada.quantidade_minima !== undefined ? categoriaEditada.quantidade_minima : categoria.quantidade_minima,
              quantidade_maxima: categoriaEditada.quantidade_maxima !== undefined ? categoriaEditada.quantidade_maxima : categoria.quantidade_maxima,
              preenchimento_obrigatorio: categoriaEditada.preenchimento_obrigatorio !== undefined ? categoriaEditada.preenchimento_obrigatorio : categoria.preenchimento_obrigatorio,
              status: categoriaEditada.status !== undefined ? categoriaEditada.status : categoria.status
            };

            try {
              const response = await api.post('/categorias-complementos', categoriaData);
              if (response.data.success) {
                categoriasTemporarias.push(response.data.data.id);
                categoriasSalvas++;
                console.log('✅ Categoria temporária editada criada no banco:', response.data.data);
              }
            } catch (error) {
              console.error('❌ Erro ao criar categoria temporária editada no banco:', error);
            }
          }
        }
      }

      // Se houver categorias temporárias, atualizar o produto_id delas
      console.log('🔍 Categorias temporárias para atualizar produto_id:', categoriasTemporarias);
      if (categoriasTemporarias.length > 0) {
        console.log('✅ Atualizando produto_id das categorias temporárias...');
        try {
          const updateData = {
            produto_id: produtoId,
            categoria_ids: categoriasTemporarias
          };
          console.log('📤 Dados para atualizar produto_id:', updateData);
          
          const response = await api.put('/categorias-complementos/atualizar-produto-id', updateData);
          console.log('📥 Resposta da atualização de produto_id:', response.data);
          
          if (response.data.success) {
            console.log('✅ produto_id atualizado para categorias temporárias:', response.data.data);
            
            // AGORA salvar os complementos temporários para essas categorias
            await salvarComplementosTemporarios(categoriasTemporarias);
          }
        } catch (error) {
          console.error('❌ Erro ao atualizar produto_id das categorias:', error);
          console.error('❌ Detalhes do erro:', error.response?.data);
        }
      } else {
        console.log('⚠️ Nenhuma categoria temporária para atualizar produto_id');
      }

      // Limpar estado de edição
      setCategoriasEditadas({});
      
      if (categoriasSalvas > 0) {
        console.log(`🎉 ${categoriasSalvas} categorias salvas/atualizadas no banco de dados!`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar categorias no banco:', error);
    }
  };

  // Função para salvar complementos temporários após as categorias serem salvas
  const salvarComplementosTemporarios = async (categoriaIds) => {
    try {
      console.log('💾 Salvando complementos temporários para categorias:', categoriaIds);
      
      for (const categoriaId of categoriaIds) {
        // Encontrar a categoria temporária correspondente
        const categoriaTemp = categoriasComplementos.find(cat => 
          cat.id.toString().startsWith('temp_') && 
          complementosPorCategoria[cat.id]
        );
        
        if (categoriaTemp && complementosPorCategoria[categoriaTemp.id]) {
          const complementosIds = complementosPorCategoria[categoriaTemp.id];
          console.log(`📝 Salvando ${complementosIds.length} complementos para categoria ${categoriaId}`);
          
          try {
            const response = await api.post('/itens-complementos/multiplos', {
              categoria_id: categoriaId,
              complemento_ids: complementosIds
            });
            
            if (response.data.success) {
              console.log(`✅ Complementos salvos para categoria ${categoriaId}:`, response.data.data);
              
              // Atualizar o estado local com o novo ID da categoria
              setComplementosPorCategoria(prev => {
                const newState = { ...prev };
                // Remover entrada temporária e adicionar com ID real
                delete newState[categoriaTemp.id];
                newState[categoriaId] = complementosIds;
                return newState;
              });
            }
          } catch (error) {
            console.error(`❌ Erro ao salvar complementos para categoria ${categoriaId}:`, error);
          }
        }
      }
      
      // Também salvar complementos de novas categorias quando editando produto existente
      if (isEditando && produtoParaEditar?.id && complementosPorCategoria.nova) {
        console.log('💾 EDITANDO PRODUTO - Salvando complementos de nova categoria...');
        
        // Encontrar a categoria recém-criada (deve ser a última da lista)
        const categoriaRecemCriada = categoriasComplementos[categoriasComplementos.length - 1];
        
        if (categoriaRecemCriada && !categoriaRecemCriada.id.toString().startsWith('temp_')) {
          const complementosIds = complementosPorCategoria.nova;
          console.log(`📝 Salvando ${complementosIds.length} complementos para nova categoria ${categoriaRecemCriada.id}`);
          
          try {
            const response = await api.post('/itens-complementos/multiplos', {
              categoria_id: categoriaRecemCriada.id,
              complemento_ids: complementosIds
            });
            
            if (response.data.success) {
              console.log(`✅ Complementos salvos para nova categoria ${categoriaRecemCriada.id}:`, response.data.data);
              
              // Atualizar o estado local
              setComplementosPorCategoria(prev => {
                const newState = { ...prev };
                // Remover entrada 'nova' e adicionar com ID real da categoria
                delete newState.nova;
                newState[categoriaRecemCriada.id] = complementosIds;
                return newState;
              });
            }
          } catch (error) {
            console.error(`❌ Erro ao salvar complementos para nova categoria ${categoriaRecemCriada.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar complementos temporários:', error);
    }
  };

  // Função para salvar TODAS as categorias (novas + editadas) - SALVA NO BANCO SE EDITANDO
  const handleSalvarTodasCategorias = async () => {
    try {
      console.log('🔍 handleSalvarTodasCategorias iniciado');
      console.log('🔍 showFormCategoria:', showFormCategoria);
      console.log('🔍 novaCategoria:', novaCategoria);
      console.log('🔍 isEditando:', isEditando);
      console.log('🔍 produtoParaEditar:', produtoParaEditar);
      
      setLoading(true);
      
      // Salvar categoria nova se existir
      if (showFormCategoria && novaCategoria.nome.trim()) {
        console.log('✅ Categoria válida encontrada...');
        
        if (novaCategoria.quantidade_minima > novaCategoria.quantidade_maxima) {
          showNotification('error', 'Erro', 'Quantidade mínima não pode ser maior que a máxima');
          return;
        }

        if (isEditando && produtoParaEditar?.id) {
          // EDITANDO PRODUTO EXISTENTE - Salvar categoria diretamente no banco
          console.log('💾 EDITANDO PRODUTO - Salvando categoria diretamente no banco...');
          
          try {
            const categoriaData = {
              produto_id: produtoParaEditar.id,
              nome: novaCategoria.nome.trim(),
              quantidade_minima: novaCategoria.quantidade_minima,
              quantidade_maxima: novaCategoria.quantidade_maxima,
              preenchimento_obrigatorio: novaCategoria.preenchimento_obrigatorio,
              status: novaCategoria.status
            };

            console.log('📤 Dados da categoria para enviar:', categoriaData);
            
            const response = await api.post('/categorias-complementos', categoriaData);
            
            if (response.data.success) {
              const categoriaSalva = response.data.data;
              console.log('✅ Categoria salva no banco:', categoriaSalva);
              
              // Adicionar ao estado local com ID real
              setCategoriasComplementos(prev => {
                const newState = [...prev, categoriaSalva];
                console.log('✅ Estado atualizado com categoria do banco:', newState);
                return newState;
              });
              
              showNotification('success', 'Categoria Salva!', 'Categoria salva diretamente no banco de dados! 🎉');
            } else {
              showNotification('error', 'Erro', 'Erro ao salvar categoria no banco');
            }
          } catch (error) {
            console.error('❌ Erro ao salvar categoria no banco:', error);
            showNotification('error', 'Erro', 'Erro ao salvar categoria no banco. Tente novamente.');
          }
        } else {
          // NOVO PRODUTO - Criar categoria temporária
          console.log('🆕 NOVO PRODUTO - Criando categoria temporária...');
          
          const novaCategoriaTemp = {
            id: `temp_${Date.now()}`, // ID temporário
            produto_id: null, // Será definido quando o produto for salvo
            nome: novaCategoria.nome.trim(),
            quantidade_minima: novaCategoria.quantidade_minima,
            quantidade_maxima: novaCategoria.quantidade_maxima,
            preenchimento_obrigatorio: novaCategoria.preenchimento_obrigatorio,
            status: novaCategoria.status,
            criado_em: new Date().toISOString(),
            isTemporary: true // Marca como temporária
          };

          console.log('✅ Categoria temporária criada:', novaCategoriaTemp);

          // Adicionar ao estado local
          setCategoriasComplementos(prev => {
            const newState = [...prev, novaCategoriaTemp];
            console.log('✅ Estado atualizado com categoria temporária:', newState);
            return newState;
          });
          
          showNotification('success', 'Categoria Adicionada!', 'Categoria adicionada ao produto. Salve o produto para persistir no banco de dados! 🎉');
        }
        
        setShowFormCategoria(false);
        setNovaCategoria({
          nome: '',
          quantidade_minima: 0,
          quantidade_maxima: 0,
          preenchimento_obrigatorio: false,
          status: true
        });
      } else {
        console.log('⚠️ Nenhuma categoria válida para salvar');
      }

      // Limpar estado de edição
      setCategoriasEditadas({});
      
    } catch (error) {
      console.error('Erro ao processar categorias:', error);
      showNotification('error', 'Erro', 'Erro ao processar categorias. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (index) => {
    try {
      const categoria = categoriasComplementos[index];
      const novoStatus = !categoria.status;
      
      // Se é categoria temporária, apenas atualizar no estado local
      if (categoria.isTemporary || categoria.id.toString().startsWith('temp_')) {
        console.log('📝 Atualizando status de categoria temporária no estado local');
        
        setCategoriasComplementos(prev => 
          prev.map((cat, i) => 
            i === index ? { ...cat, status: novoStatus } : cat
          )
        );
        
        // Marcar como editada
        setCategoriasEditadas(prev => ({
          ...prev,
          [index]: { ...prev[index], status: novoStatus }
        }));
        
        return;
      }
      
      // Se é categoria do banco, atualizar no backend
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
    setShowAdicionarComplementos(true);
    console.log('Adicionando complemento para categoria:', categoria);
    // Armazenar a categoria atual para salvar os complementos
    setCategoriaAtualParaComplementos(categoria);
  };



  const handleDeletarCategoria = async (categoriaId, index) => {
    try {
      const categoria = categoriasComplementos[index];
      
      // Se é categoria temporária, apenas remover do estado local
      if (categoria.isTemporary || categoria.id.toString().startsWith('temp_')) {
        console.log('📝 Removendo categoria temporária do estado local');
        
        setCategoriasComplementos(prev => prev.filter((_, i) => i !== index));
        
        // Remover das editadas também
        setCategoriasEditadas(prev => {
          const newEditadas = { ...prev };
          delete newEditadas[index];
          return newEditadas;
        });
        
        return;
      }
      
      // Se é categoria do banco, deletar no backend
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
        
        // Buscar itens de complementos para cada categoria
        await buscarItensComplementosPorCategorias(response.data.data);
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

  // Buscar itens de complementos para todas as categorias
  const buscarItensComplementosPorCategorias = async (categorias) => {
    try {
      const itensPorCategoria = {};
      
      for (const categoria of categorias) {
        if (categoria.id && !categoria.isTemporary) {
          const response = await api.get(`/itens-complementos/categoria/${categoria.id}`);
          if (response.data.success) {
            // Extrair apenas os IDs dos complementos
            const complementoIds = response.data.data.map(item => item.complemento_id);
            itensPorCategoria[categoria.id] = complementoIds;
          }
        }
      }
      
      setComplementosPorCategoria(itensPorCategoria);
      console.log('📋 Itens de complementos carregados:', itensPorCategoria);
    } catch (error) {
      console.error('❌ Erro ao buscar itens de complementos:', error);
    }
  };

  // Buscar complementos disponíveis do estabelecimento
  const buscarComplementosDisponiveis = async () => {
    try {
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      
      if (!estabelecimento || !estabelecimento.id) {
        console.error('Estabelecimento não encontrado');
        return;
      }

      const response = await api.get(`/complementos/estabelecimento/${estabelecimento.id}`);
      if (response.data.success) {
        setComplementosDisponiveis(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar complementos:', error);
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
    buscarComplementosDisponiveis();
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
        const produtoSalvo = response.data.data;
        
        // AGORA salvar as categorias de complementos no banco de dados
        await salvarCategoriasComplementosNoBanco(produtoSalvo.id);
        
        const mensagem = isEditando ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!';
        showNotification('success', 'Sucesso', mensagem);
        onSubmit(produtoSalvo);
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
            <TabButton
              isActive={activeTab === 'detalhes'}
              onClick={() => setActiveTab('detalhes')}
              activeColor="text-cyan-600"
              inactiveColor="text-gray-600"
              hoverColor="hover:text-gray-800"
            >
              Detalhes
            </TabButton>
            <TabButton
              isActive={activeTab === 'complementos'}
              onClick={() => setActiveTab('complementos')}
              activeColor="text-orange-600"
              inactiveColor="text-orange-600"
              hoverColor="hover:text-orange-700"
            >
              Complementos
            </TabButton>
            <TabButton
              isActive={activeTab === 'receita'}
              onClick={() => setActiveTab('receita')}
              activeColor="text-green-600"
              inactiveColor="text-green-600"
              hoverColor="hover:text-green-700"
            >
              Receita
            </TabButton>
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
            {/* Modo Normal - Mostrar componentes de categoria */}
            {!showAdicionarComplementos && (
              <>
                {/* Botões de Ação */}
                <div className="flex space-x-3 mb-4">
                  <SaveButton
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
                  <StatusToggleButton
                    isActive={novaCategoria.status}
                    onClick={() => setNovaCategoria(prev => ({ ...prev, status: !prev.status }))}
                    size="sm"
                    showText={true}
                    className="px-2 py-1 text-xs font-medium rounded-md hover:bg-gray-50"
                  />
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

                  {/* Lista de Complementos Selecionados */}
                  <ListItemsComplementos
                    complementosSelecionados={complementosPorCategoria.nova || []}
                    complementos={complementosDisponiveis}
                    onRemoverComplemento={(complementoId) => {
                      setComplementosPorCategoria(prev => ({
                        ...prev,
                        nova: (prev.nova || []).filter(id => id !== complementoId)
                      }));
                    }}
                  />

                  {/* Botão Adicionar Complementos */}
                  <div className="flex justify-end pt-1">
                    <SaveButton
                      onClick={() => setShowAdicionarComplementos(true)}
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
              onDeletarCategoria={handleDeletarCategoria}
              complementosPorCategoria={complementosPorCategoria}
              complementosDisponiveis={complementosDisponiveis}
              onRemoverComplemento={(categoriaId, complementoId) => {
                setComplementosPorCategoria(prev => ({
                  ...prev,
                  [categoriaId]: (prev[categoriaId] || []).filter(id => id !== complementoId)
                }));
              }}
            />
              </>
            )}

            {/* Modo Adicionar Complementos - Mostrar barra de pesquisa */}
            {showAdicionarComplementos && (
              <div className="space-y-4">
                {/* Barra de Pesquisa - Livre, sem borda externa */}
                <SearchBar placeholder="Buscar complementos..." />

                {/* Cabeçalho Complementos */}
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Complementos</h3>
                </div>

                {/* Listagem de Complementos - Modificada para seleção */}
                <ListComplementos 
                  onRefresh={null}
                  onAction={null}
                  modoSelecao={true}
                  complementosSelecionados={complementosSelecionados}
                  setComplementosSelecionados={setComplementosSelecionados}
                />
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
              <SaveButton
                onClick={() => {
                  // TODO: Implementar adição de receita
                  console.log('Adicionando receita para o produto');
                }}
                text="Adicionar Receita"
                className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 text-base"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botões fixos na parte inferior */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <CancelButton
            onClick={
              showAdicionarComplementos 
                ? () => {
                    setShowAdicionarComplementos(false);
                    setComplementosSelecionados([]);
                  }
                : onClose
            }
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          />
          <SaveButton
            onClick={
              showAdicionarComplementos 
                ? async () => {
                    try {
                      console.log('🔄 Salvando complementos selecionados:', complementosSelecionados);
                      
                      // Salvar complementos selecionados
                      if (showFormCategoria) {
                        // Nova categoria sendo criada - verificar se é novo produto ou editando
                        if (isEditando && produtoParaEditar?.id) {
                          // EDITANDO PRODUTO - complementos serão salvos quando a categoria for salva
                          console.log('💾 EDITANDO PRODUTO - Complementos serão salvos com a categoria');
                          setComplementosPorCategoria(prev => ({
                            ...prev,
                            nova: complementosSelecionados
                          }));
                        } else {
                          // NOVO PRODUTO - salvar complementos temporariamente
                          setComplementosPorCategoria(prev => ({
                            ...prev,
                            nova: complementosSelecionados
                          }));
                          console.log('✅ Complementos salvos temporariamente para nova categoria');
                        }
                      } else {
                        // Categoria existente sendo editada - verificar se é temporária
                        if (categoriaAtualParaComplementos && categoriaAtualParaComplementos.id) {
                          const isTemporaryCategory = categoriaAtualParaComplementos.isTemporary || 
                                                   categoriaAtualParaComplementos.id.toString().startsWith('temp_');
                          
                          if (isTemporaryCategory) {
                            // CATEGORIA TEMPORÁRIA - salvar complementos temporariamente
                            console.log('📝 Categoria temporária, salvando complementos temporariamente');
                            setComplementosPorCategoria(prev => ({
                              ...prev,
                              [categoriaAtualParaComplementos.id]: complementosSelecionados
                            }));
                            
                            showNotification('success', 'Complementos Adicionados!', 'Complementos adicionados temporariamente. Salve a categoria para persistir no banco de dados! 🎉');
                          } else {
                            // CATEGORIA EXISTENTE NO BANCO - salvar complementos IMEDIATAMENTE
                            console.log('💾 Categoria existente - Salvando complementos IMEDIATAMENTE no banco para categoria ID:', categoriaAtualParaComplementos.id);
                            
                            try {
                              const response = await api.post('/itens-complementos/multiplos', {
                                categoria_id: categoriaAtualParaComplementos.id,
                                complemento_ids: complementosSelecionados
                              });
                              
                              if (response.data.success) {
                                console.log('✅ Complementos salvos IMEDIATAMENTE no banco:', response.data.data);
                                
                                // Atualizar estado local
                                setComplementosPorCategoria(prev => ({
                                  ...prev,
                                  [categoriaAtualParaComplementos.id]: complementosSelecionados
                                }));
                                
                                showNotification('success', 'Complementos Salvos!', 'Complementos salvos diretamente no banco de dados! 🎉');
                              } else {
                                console.error('❌ Erro na resposta da API:', response.data);
                                showNotification('error', 'Erro', 'Erro ao salvar complementos no banco');
                              }
                            } catch (error) {
                              console.error('❌ Erro ao salvar complementos no banco:', error);
                              showNotification('error', 'Erro', 'Erro ao salvar complementos no banco. Tente novamente.');
                            }
                          }
                        } else {
                          console.warn('⚠️ Nenhuma categoria válida encontrada para salvar');
                          showNotification('warning', 'Atenção', 'Nenhuma categoria válida encontrada para salvar complementos');
                        }
                      }
                      
                      console.log('✅ Complementos salvos na categoria:', complementosSelecionados);
                      setShowAdicionarComplementos(false);
                      setComplementosSelecionados([]);
                      setCategoriaAtualParaComplementos(null);
                    } catch (error) {
                      console.error('❌ Erro ao salvar complementos:', error);
                      // TODO: Mostrar notificação de erro
                    }
                  }
                : activeTab === 'detalhes' 
                  ? handleSubmit 
                  : handleSalvarTodasCategorias
            }
            text={
              showAdicionarComplementos 
                ? `Adicionar Complementos (${complementosSelecionados.length})` 
                : loading 
                  ? 'Salvando...' 
                  : 'Salvar'
            }
            disabled={loading}
            className="flex-1"
          />
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
