import React, { useState, useEffect } from 'react';
import { Package, Image as ImageIcon, Upload, Zap, Loader2, Plus, X } from 'lucide-react';
import api, { buscarImagens } from '../../services/api';
import AddButton from '../buttons/Add';
import CopyButton from '../buttons/Copy';
import CloseButton from '../buttons/Close';
import FormCategoriaComplemento from './FormCategoriaComplemento';
import ListCategoryComplements from '../list/ListCategoryComplements';
import Notification from '../elements/Notification';
import ValidationNotification from '../elements/ValidationNotification';
import { useFormValidation } from '../../hooks/useFormValidation';
import FormContainer from './FormContainer';
import FormField from './FormField';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormGrid from './FormGrid';
// Removido import do cache - agora busca diretamente da API

// Função debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const FormProduct = ({ produto = null, onStateChange }) => {
  // Usar hook de cache para produtos
  // Funções para gerenciar produtos (busca direta da API)
  const addProduto = (produto) => {
    // Esta função será chamada pelo componente pai
    console.log('Produto adicionado:', produto);
  };

  const updateProduto = (produto) => {
    // Esta função será chamada pelo componente pai
    console.log('Produto atualizado:', produto);
  };
  
  const [formData, setFormData] = useState({
    nome: '',
    imagem: null,
    imagemUrl: null, // Para URLs de imagens sugeridas
    categoria: '',
    valorVenda: '',
    valorCusto: '',
    estoqueEnabled: false,
    estoque: '',
    tempoPreparoEnabled: false,
    tempoPreparo: ''
  });

  // Hook de validação
  const {
    errors,
    showNotification: showValidationNotification,
    validateForm,
    clearError,
    getFieldError,
    setShowNotification: setShowValidationNotification
  } = useFormValidation();

  // Detectar se é modo de edição
  const isEditMode = !!produto;
  
  // Estado para controlar a aba ativa do formulário
  const [activeFormTab, setActiveFormTab] = useState('detalhes');
  
  // Estado para controlar se deve mostrar o formulário de categoria de complementos
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  
  // Estado para controlar se deve mostrar a listagem de complementos para seleção
  const [showComplementoForm, setShowComplementoForm] = useState(false);
  
  // Estado para armazenar complementos disponíveis
  const [complementosDisponiveis, setComplementosDisponiveis] = useState([]);
  
  // Estado para armazenar complementos selecionados
  const [complementosSelecionados, setComplementosSelecionados] = useState([]);
  
  // Estado para armazenar a categoria atual sendo editada
  const [categoriaAtualEditando, setCategoriaAtualEditando] = useState(null);
  
  // Estado para armazenar categorias temporárias (quando produto não existe ainda)
  const [categoriasTemporarias, setCategoriasTemporarias] = useState([]);
  
  // Estado para armazenar complementos temporários (quando categoria não existe ainda)
  const [complementosTemporarios, setComplementosTemporarios] = useState([]);
  
  // Estado para armazenar dados da categoria sendo criada
  const [categoriaAtual, setCategoriaAtual] = useState(null);
  
  // Estado para armazenar categorias editadas
  const [categoriasEditadas, setCategoriasEditadas] = useState({});
  
  // Estados para cópia de complementos
  const [showCopyComplementos, setShowCopyComplementos] = useState(false);
  const [produtosComComplementos, setProdutosComComplementos] = useState([]);
  const [produtoSelecionadoParaCopiar, setProdutoSelecionadoParaCopiar] = useState(null);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  
  // Estado para notificações
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  
  // Estados para sugestões de imagens
  const [sugestoesImagens, setSugestoesImagens] = useState([]);
  const [buscandoImagens, setBuscandoImagens] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  // Buscar categorias do estabelecimento
  useEffect(() => {
    const fetchCategorias = async () => {
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      if (!estabelecimentoId) return;

      setLoadingCategorias(true);
      try {
        const response = await api.get(`/categorias-dropdown/${estabelecimentoId}`);
        if (response.success) {
          setCategorias(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setError('Erro ao carregar categorias');
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  // Limpar estado de complementos quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Cleanup quando o componente for desmontado
      setShowComplementoForm(false);
      setComplementosSelecionados([]);
      setComplementosDisponiveis([]);
      setCategoriaAtualEditando(null);
      setComplementosTemporarios([]);
    };
  }, []);

  // Interceptar o cancelar do modal quando estiver na seleção de complementos
  useEffect(() => {
    const handleModalCancel = (event) => {
      if (showComplementoForm) {
        // Se estiver na seleção de complementos, cancelar a seleção em vez de fechar o modal
        event.preventDefault();
        handleCancelarComplementos();
      }
    };

    // Adicionar listener para interceptar o cancelar
    window.addEventListener('modalCancel', handleModalCancel);

    return () => {
      window.removeEventListener('modalCancel', handleModalCancel);
    };
  }, [showComplementoForm]);

  // Notificar a página sobre mudanças de estado
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        showComplementoForm,
        complementosSelecionados,
        activeFormTab
      });
    }
  }, [showComplementoForm, complementosSelecionados, activeFormTab, onStateChange]);


  // Preencher formulário com dados do produto (modo edição) - DEPOIS de carregar as categorias
  useEffect(() => {
    if (produto && categorias.length > 0) {
      setFormData({
        nome: produto.nome || '',
        imagem: null, // Nova imagem (se selecionada)
        imagemUrl: produto.imagem_url || null, // URL da imagem atual
        categoria: produto.categoria_id ? produto.categoria_id.toString() : '',
        valorVenda: produto.valor_venda || '',
        valorCusto: produto.valor_custo || '',
        estoqueEnabled: produto.habilita_estoque || false,
        estoque: produto.estoque_qtd || '',
        tempoPreparoEnabled: !!produto.tempo_preparo_min,
        tempoPreparo: produto.tempo_preparo_min || ''
      });
      
      // Se o produto tem imagem, mostrar preview
      if (produto.imagem_url) {
        setImagePreview(produto.imagem_url);
      }
    }
  }, [produto, categorias]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Se for o campo nome, buscar sugestões de imagens
    if (field === 'nome') {
      buscarSugestoesImagens(value);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imagem: null,
      imagemUrl: null
    }));
    setImagePreview(null);
  };

  // Função de validação removida para evitar problemas de CORS

  // Função para buscar sugestões de imagens com debounce
  const buscarSugestoesImagens = debounce(async (query) => {
    if (!query || query.trim().length < 2) {
      setSugestoesImagens([]);
      setMostrarSugestoes(false);
      return;
    }

    setBuscandoImagens(true);
    setMostrarSugestoes(true);

    try {
      const response = await buscarImagens(query);
      if (response.success) {
        const imagens = response.imagens || [];
        
        // Filtrar apenas as primeiras 5 imagens para evitar muitas requisições
        const imagensLimitadas = imagens.slice(0, 5);
        
        // Usar todas as imagens sem validação CORS para evitar problemas
        setSugestoesImagens(imagensLimitadas);
      } else {
        setSugestoesImagens([]);
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões de imagens:', error);
      setSugestoesImagens([]);
    } finally {
      setBuscandoImagens(false);
    }
  }, 500);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        imagem: file
      }));
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Limpar erro se existir
      setError('');
    }
  };

  // Função para selecionar uma imagem sugerida
  const selecionarImagemSugerida = async (imagemUrl) => {
    try {
      setError('');
      
      // Tentar usar o proxy do backend primeiro
      try {
        const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/proxy-image?url=${encodeURIComponent(imagemUrl)}`;
        
        // Fazer download da imagem através do proxy
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
          const blob = await response.blob();
          
          // Verificar se o blob é válido
          if (blob.size > 0 && blob.type.startsWith('image/')) {
            // Criar um arquivo a partir do blob
            const file = new File([blob], 'imagem-sugerida.jpg', { type: blob.type });
            
            // Atualizar o estado do formulário
            setFormData(prev => ({
              ...prev,
              imagem: file
            }));
            
            // Atualizar o preview
            setImagePreview(imagemUrl);
            
            // Esconder as sugestões
            setMostrarSugestoes(false);
            setSugestoesImagens([]);
            
            console.log('✅ Imagem sugerida selecionada via proxy:', imagemUrl);
            return;
          }
        }
      } catch (proxyError) {
        console.log('Proxy não disponível, tentando método alternativo:', proxyError.message);
      }
      
      // Método alternativo: criar um objeto URL temporário para preview
      // (sem fazer download real para evitar CORS)
      setImagePreview(imagemUrl);
      
      // Criar um objeto de arquivo simulado para o formulário
      // (o upload real será feito quando o formulário for submetido)
      const mockFile = new File([''], 'imagem-sugerida.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'url', { value: imagemUrl });
      
      setFormData(prev => ({
        ...prev,
        imagem: mockFile,
        imagemUrl: imagemUrl // Adicionar URL da imagem para uso posterior
      }));
      
      // Esconder as sugestões
      setMostrarSugestoes(false);
      setSugestoesImagens([]);
      
      console.log('✅ Imagem sugerida selecionada (método alternativo):', imagemUrl);
      
    } catch (error) {
      console.error('Erro ao selecionar imagem sugerida:', error);
      setError('Erro ao carregar a imagem selecionada: ' + error.message);
      
      // Remover a imagem problemática das sugestões
      setSugestoesImagens(prev => prev.filter(img => img.url !== imagemUrl));
    }
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getImageUrl = (imagemUrl) => {
    if (!imagemUrl) return null;
    
    // Se a URL já é completa (começa com http), retorna como está
    if (imagemUrl.startsWith('http')) {
      return imagemUrl;
    }
    
    // Fallback para URLs locais (desenvolvimento)
    const normalizedUrl = imagemUrl.replace(/\\/g, '/');
    
    // Determinar a base URL baseada no ambiente
    let baseUrl;
    if (import.meta.env.VITE_API_URL) {
      baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    } else {
      baseUrl = 'http://localhost:3001';
    }
    
    // Garantir que não há dupla barra
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanImageUrl = normalizedUrl.replace(/^\//, '');
    
    return `${cleanBaseUrl}/${cleanImageUrl}`;
  };

  // Função específica para URLs de sugestões (Google Images)
  const getSuggestionImageUrl = (imagemUrl) => {
    if (!imagemUrl) return null;
    
    // Usar a mesma lógica do input principal que já funciona
    // Se a URL já é completa (começa com http), retorna como está
    if (imagemUrl.startsWith('http')) {
      return imagemUrl;
    }
    
    // Fallback para URLs locais (desenvolvimento)
    // Normalizar separadores de caminho (Windows usa \, Unix usa /)
    const normalizedUrl = imagemUrl.replace(/\\/g, '/');
    
    // Determinar a base URL baseada no ambiente
    let baseUrl;
    if (import.meta.env.VITE_API_URL) {
      // Remove /api do final se existir, pois vamos adicionar apenas o caminho da imagem
      baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    } else {
      // Fallback para desenvolvimento
      baseUrl = 'http://localhost:3001';
    }
    
    // Garantir que não há dupla barra
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanImageUrl = normalizedUrl.replace(/^\//, '');
    
    return `${cleanBaseUrl}/${cleanImageUrl}`;
  };

  // Função para mostrar notificação
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Função para buscar produtos que possuem categorias de complementos
  const buscarProdutosComComplementos = async () => {
    try {
      setLoadingProdutos(true);
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      
      if (!estabelecimentoId) {
        setError('Estabelecimento não identificado!');
        return;
      }

      // Usar o novo endpoint específico para produtos com categorias de complementos
      const response = await api.get(`/produtos-com-categorias-complementos/${estabelecimentoId}`);
      
      if (response.success) {
        setProdutosComComplementos(response.data);
        console.log('✅ Produtos com categorias de complementos encontrados:', response.data.length);
      } else {
        throw new Error('Erro ao carregar produtos');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar produtos com complementos:', error);
      setError('Erro ao carregar produtos: ' + error.message);
    } finally {
      setLoadingProdutos(false);
    }
  };

  // Função para lidar com o clique no botão "Copiar Complementos"
  const handleCopiarComplementos = async () => {
    setShowCopyComplementos(true);
    await buscarProdutosComComplementos();
  };

  // Função para selecionar produto para copiar complementos
  const handleSelecionarProdutoParaCopiar = (produto) => {
    setProdutoSelecionadoParaCopiar(produto);
  };

  // Função para copiar categorias de complementos do produto selecionado
  const handleCopiarCategoriasComplementos = async () => {
    if (!produtoSelecionadoParaCopiar) {
      setError('Selecione um produto para copiar as categorias!');
      return;
    }
    
    if (!produto?.id) {
      setError('Produto atual não encontrado!');
      return;
    }

    try {
      // Buscar categorias do produto selecionado
      const categoriasResponse = await api.get(`/categorias-complementos/${produtoSelecionadoParaCopiar.id}`);
      
      if (categoriasResponse.success && categoriasResponse.data.length > 0) {
        const categoriasParaCopiar = categoriasResponse.data;
        
        // Para cada categoria, criar uma nova no produto atual
        for (const categoria of categoriasParaCopiar) {
          const payload = {
            produto_id: produto.id,
            nome: categoria.nome,
            quantidade_minima: categoria.quantidade_minima || 0,
            quantidade_maxima: categoria.quantidade_maxima || null,
            preenchimento_obrigatorio: categoria.preenchimento_obrigatorio || false
          };
          
          // Criar a categoria
          const categoriaResponse = await api.post('/categorias-complementos', payload);
          
          if (categoriaResponse.success) {
            // Buscar complementos da categoria original
            const complementosResponse = await api.get(`/itens-complementos/categoria/${categoria.id}`);
            
            if (complementosResponse.success && complementosResponse.data.length > 0) {
              // Copiar os complementos para a nova categoria
              const complementosIds = complementosResponse.data.map(item => item.complemento_id);
              await api.post('/itens-complementos', {
                categoria_id: categoriaResponse.data.id,
                complementos: complementosIds
              });
            }
          }
        }
        
        showNotification(`${categoriasParaCopiar.length} categorias de complementos copiadas com sucesso!`);
        
        // Fechar o modo de cópia e limpar seleção
        setShowCopyComplementos(false);
        setProdutoSelecionadoParaCopiar(null);
        
        // Disparar evento para atualizar a listagem
        window.dispatchEvent(new CustomEvent('categoriasAtualizadas'));
      } else {
        setError('Produto selecionado não possui categorias de complementos!');
      }
    } catch (error) {
      console.error('❌ Erro ao copiar categorias:', error);
      setError('Erro ao copiar categorias: ' + error.message);
    }
  };

  // Função para lidar com o clique no botão "Adicionar Complemento"
  const handleAdicionarComplemento = async (categoria = null) => {
    try {
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      if (!estabelecimentoId) {
        setError('Estabelecimento não identificado!');
        return;
      }

      // Armazenar a categoria que está sendo editada
      // Se não há categoria (criando nova), usar a categoria atual do formulário
      const categoriaParaEditar = categoria || categoriaAtual;
      setCategoriaAtualEditando(categoriaParaEditar);

      // Buscar complementos disponíveis
      const response = await api.get(`/complementos/${estabelecimentoId}`);
      if (response.success) {
        setComplementosDisponiveis(response.data);
        
        // Se a categoria tem ID, buscar complementos já existentes para pré-selecionar
        let complementosJaExistentes = [];
        if (categoriaParaEditar?.id) {
          try {
            const complementosResponse = await api.get(`/itens-complementos/categoria/${categoriaParaEditar.id}`);
            if (complementosResponse.success) {
              complementosJaExistentes = complementosResponse.data.map(item => ({
                id: item.complemento_id,
                nome: item.complemento_nome,
                valor_venda: item.complemento_valor
              }));
            }
          } catch (error) {
            console.error('Erro ao buscar complementos existentes:', error);
          }
        }
        
        setComplementosSelecionados(complementosJaExistentes);
        setShowComplementoForm(true);
      } else {
        setError('Erro ao carregar complementos');
      }
    } catch (error) {
      console.error('Erro ao buscar complementos:', error);
      setError('Erro ao carregar complementos: ' + error.message);
    }
  };

  // Função para lidar com a seleção/deseleção de complementos
  const handleComplementoSelect = (complemento) => {
    setComplementosSelecionados(prev => {
      const isSelected = prev.some(c => c.id === complemento.id);
      if (isSelected) {
        return prev.filter(c => c.id !== complemento.id);
      } else {
        return [...prev, complemento];
      }
    });
  };

  // Função para cancelar a seleção de complementos
  const handleCancelarComplementos = () => {
    setShowComplementoForm(false);
    setComplementosSelecionados([]);
    setComplementosDisponiveis([]);
    setCategoriaAtualEditando(null);
  };

  // Função para salvar complementos selecionados
  const handleSalvarComplementos = async () => {
    if (complementosSelecionados.length === 0) {
      setError('Selecione pelo menos um complemento!');
      return;
    }
    
    if (!categoriaAtualEditando) {
      setError('Categoria não identificada!');
      return;
    }
    
    try {
      // Verificar se a categoria existe (tem ID) ou é temporária
      if (categoriaAtualEditando.id) {
        // Categoria existe - salvar diretamente no banco
        const complementosIds = complementosSelecionados.map(c => c.id);
        
        const response = await api.post('/itens-complementos', {
          categoria_id: categoriaAtualEditando.id,
          complementos: complementosIds
        });
        
        if (response.success) {
          showNotification(response.message);
          console.log('✅ Complementos salvos na categoria:', response.data);
          
          // Disparar evento para recarregar a listagem de complementos
          window.dispatchEvent(new CustomEvent('complementosAtualizados', { 
            detail: { categoriaId: categoriaAtualEditando.id } 
          }));
        } else {
          setError(response.message || 'Erro ao salvar complementos');
        }
      } else {
        // Categoria é temporária - salvar temporariamente
        const complementosTemporarios = complementosSelecionados.map(c => ({
          id: `temp_${Date.now()}_${c.id}`,
          complemento_id: c.id,
          complemento_nome: c.nome,
          complemento_valor: c.valor_venda,
          categoria_temporaria: categoriaAtualEditando
        }));
        
        setComplementosTemporarios(prev => {
          const novosComplementos = [...prev, ...complementosTemporarios];
          
          // Disparar evento para atualizar a listagem de complementos temporários
          window.dispatchEvent(new CustomEvent('complementosTemporariosAtualizados', { 
            detail: { complementosTemporarios: novosComplementos } 
          }));
          
          return novosComplementos;
        });
        
        showNotification(`${complementosSelecionados.length} complemento(s) adicionado(s) temporariamente!`);
        console.log('✅ Complementos salvos temporariamente:', complementosTemporarios);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar complementos:', error);
      setError('Erro ao salvar complementos: ' + error.message);
    }
    
    // Fechar a seleção de complementos e voltar aos componentes originais
    setShowComplementoForm(false);
    setComplementosSelecionados([]);
    setComplementosDisponiveis([]);
    setCategoriaAtualEditando(null);
  };

  // Função para salvar categorias editadas
  const salvarCategoriasEditadas = async () => {
    try {
      let categoriasSalvas = 0;
      for (const [categoriaId, dados] of Object.entries(categoriasEditadas)) {
        const response = await api.put(`/categorias-complementos/${categoriaId}`, {
          nome: dados.nome,
          quantidade_minima: dados.quantidadeMinima,
          quantidade_maxima: dados.quantidadeMaxima,
          preenchimento_obrigatorio: dados.preenchimentoObrigatorio
        });

        if (response.success) {
          categoriasSalvas++;
          console.log('✅ Categoria editada:', response.data);
        }
      }
      
      // Mostrar notificação de sucesso
      if (categoriasSalvas > 0) {
        showNotification(`Categoria${categoriasSalvas > 1 ? 's' : ''} salva${categoriasSalvas > 1 ? 's' : ''} com sucesso!`);
        
        // Disparar evento para atualizar a listagem de categorias
        window.dispatchEvent(new CustomEvent('categoriasAtualizadas'));
      }
      
      // Limpar categorias editadas
      setCategoriasEditadas({});
    } catch (error) {
      console.error('❌ Erro ao salvar categorias editadas:', error);
      setError('Erro ao salvar categorias editadas: ' + error.message);
      showNotification('Erro ao salvar categorias', 'error');
    }
  };

  // Função para salvar categoria de complementos
  const salvarCategoriaComplemento = async (categoriaData) => {
    try {
      console.log('🔍 Dados da categoria:', categoriaData);
      
      if (isEditMode && produto?.id) {
        // Modo edição - produto existe, salvar diretamente
        const payload = {
          produto_id: produto.id,
          nome: categoriaData.nome,
          quantidade_minima: categoriaData.quantidadeMinima || '',
          quantidade_maxima: categoriaData.quantidadeMaxima || '',
          preenchimento_obrigatorio: categoriaData.preenchimentoObrigatorio
        };
        
        console.log('🔍 Payload enviado:', payload);
        
        const response = await api.post('/categorias-complementos', payload);

        if (response.success) {
          console.log('✅ Categoria de complementos salva:', response.data);
          
          // Salvar complementos temporários se existirem para esta categoria
          const complementosParaEstaCategoria = complementosTemporarios.filter(
            comp => comp.categoria_temporaria?.nome === categoriaData.nome
          );
          
          if (complementosParaEstaCategoria.length > 0) {
            try {
              const complementosIds = complementosParaEstaCategoria.map(c => c.complemento_id);
              await api.post('/itens-complementos', {
                categoria_id: response.data.id,
                complementos: complementosIds
              });
              
              // Remover complementos temporários salvos
              setComplementosTemporarios(prev => 
                prev.filter(comp => comp.categoria_temporaria?.nome !== categoriaData.nome)
              );
              
              console.log('✅ Complementos temporários salvos na categoria:', complementosIds.length);
            } catch (error) {
              console.error('❌ Erro ao salvar complementos temporários:', error);
            }
          }
          
          setShowCategoriaForm(false);
          setCategoriaAtual(null);
          showNotification('Categoria criada com sucesso!');
          
          // Disparar evento para atualizar a listagem de categorias
          window.dispatchEvent(new CustomEvent('categoriasAtualizadas'));
        }
      } else {
        // Modo criação - produto não existe, salvar temporariamente
        setCategoriasTemporarias(prev => [...prev, categoriaData]);
        setShowCategoriaForm(false);
        console.log('✅ Categoria salva temporariamente:', categoriaData);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar categoria de complementos:', error);
      setError('Erro ao salvar categoria de complementos: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Se estiver na aba de complementos
    if (activeFormTab === 'complementos') {
      // Se estiver no modo de cópia de complementos
      if (showCopyComplementos) {
        // Validar se um produto foi selecionado
        if (!produtoSelecionadoParaCopiar) {
          setError('Selecione um produto para copiar as categorias!');
          return;
        }
        
        // Copiar categorias do produto selecionado
        await handleCopiarCategoriasComplementos();
        return;
      }
      
      // Se estiver mostrando a listagem de complementos para seleção
      if (showComplementoForm) {
        // Validar se pelo menos um complemento foi selecionado
        if (complementosSelecionados.length === 0) {
          setError('Selecione pelo menos um complemento!');
          return;
        }
        
        // Salvar complementos selecionados e voltar aos 4 componentes
        handleSalvarComplementos();
        return;
      }
      
      // Salvar categoria nova se estiver criando
      if (showCategoriaForm && categoriaAtual) {
        // Validar dados da categoria
        if (!categoriaAtual.nome.trim()) {
          setError('Nome da categoria é obrigatório!');
          return;
        }
        
        // Validar quantidades apenas se ambas estiverem preenchidas e válidas
        if (categoriaAtual.quantidadeMinima && categoriaAtual.quantidadeMaxima &&
            categoriaAtual.quantidadeMinima !== '' && categoriaAtual.quantidadeMaxima !== '') {
          const qtdMin = parseInt(categoriaAtual.quantidadeMinima);
          const qtdMax = parseInt(categoriaAtual.quantidadeMaxima);
          
          if (!isNaN(qtdMin) && !isNaN(qtdMax) && qtdMin > qtdMax) {
            setError('Quantidade mínima não pode ser maior que a máxima!');
            return;
          }
        }
        
        // Salvar categoria de complementos
        await salvarCategoriaComplemento(categoriaAtual);
      }
      
      // Salvar categorias editadas
      if (Object.keys(categoriasEditadas).length > 0) {
        await salvarCategoriasEditadas();
      }
      
      return;
    }
    
    // Validações para aba de detalhes
    if (activeFormTab === 'detalhes') {
    const validationRules = {
      nome: { required: true, label: 'Nome' },
      categoria: { required: true, label: 'Categoria' },
      valorVenda: { required: true, label: 'Valor de venda', currency: true }
    };

      // Adicionar validação de imagem apenas no modo de criação
    if (!isEditMode) {
      // Verificar se tem imagem ou imagemUrl
      if (!formData.imagem && !formData.imagemUrl) {
        validationRules.imagem = { required: true, label: 'Imagem' };
      }
    }

    const isValid = validateForm(formData, validationRules);
    if (!isValid) {
      return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      // Criar FormData para envio
      const formDataToSend = new FormData();
      formDataToSend.append('nome', formData.nome.trim());
      formDataToSend.append('categoria_id', formData.categoria);
      formDataToSend.append('valor_venda', formData.valorVenda);
      formDataToSend.append('valor_custo', formData.valorCusto || '');

      formDataToSend.append('habilita_estoque', formData.estoqueEnabled);
      formDataToSend.append('estoque_qtd', formData.estoque || '0');
      formDataToSend.append('tempo_preparo_min', formData.tempoPreparoEnabled ? formData.tempoPreparo || '' : '');
      
      // Adicionar URL da imagem se for uma imagem sugerida
      if (formData.imagemUrl) {
        formDataToSend.append('imagem_url', formData.imagemUrl);
      }
      
      if (isEditMode) {
        // Modo de edição
        if (formData.imagem && !formData.imagemUrl) {
          formDataToSend.append('imagem', formData.imagem);
        }
        
        const response = await api.put(`/produtos/${produto.id}`, formDataToSend);
        
        if (response.success) {
          console.log('✅ Produto editado com sucesso');
          // Atualizar produto no cache
          updateProduto(response.data.id, response.data);
          // Disparar evento para o BaseModal fechar
          window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: response.data }));
        }
      } else {
        // Modo de criação
        if (formData.imagem && !formData.imagemUrl) {
          formDataToSend.append('imagem', formData.imagem);
        }
        
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        if (!estabelecimentoId) {
          throw new Error('Estabelecimento não identificado!');
        }
        formDataToSend.append('estabelecimento_id', estabelecimentoId);

        const response = await api.post('/produtos', formDataToSend);
        
        if (response.success) {
          const novoProduto = response.data;
          
          // Adicionar produto ao cache
          addProduto(novoProduto);
          
          // Salvar categorias temporárias se existirem
          if (categoriasTemporarias.length > 0) {
            for (const categoria of categoriasTemporarias) {
              try {
                const categoriaResponse = await api.post('/categorias-complementos', {
                  produto_id: novoProduto.id,
                  nome: categoria.nome,
                  quantidade_minima: categoria.quantidadeMinima,
                  quantidade_maxima: categoria.quantidadeMaxima,
                  preenchimento_obrigatorio: categoria.preenchimentoObrigatorio
                });
                
                console.log('✅ Categoria temporária salva:', categoria.nome);
                
                // Salvar complementos temporários para esta categoria
                const complementosParaEstaCategoria = complementosTemporarios.filter(
                  comp => comp.categoria_temporaria?.nome === categoria.nome
                );
                
                if (complementosParaEstaCategoria.length > 0) {
                  try {
                    const complementosIds = complementosParaEstaCategoria.map(c => c.complemento_id);
                    await api.post('/itens-complementos', {
                      categoria_id: categoriaResponse.data.id,
                      complementos: complementosIds
                    });
                    
                    console.log('✅ Complementos temporários salvos na categoria:', complementosIds.length);
                  } catch (error) {
                    console.error('❌ Erro ao salvar complementos temporários:', error);
                  }
                }
              } catch (error) {
                console.error('❌ Erro ao salvar categoria temporária:', error);
              }
            }
            // Limpar categorias e complementos temporários
            setCategoriasTemporarias([]);
            setComplementosTemporarios([]);
          }
          
          // Limpar formulário apenas no modo de criação
          setFormData({
            nome: '',
            imagem: null,
            imagemUrl: null,
            categoria: '',
            valorVenda: '',
            valorCusto: '',
            estoqueEnabled: false,
            estoque: '',
            tempoPreparoEnabled: false,
            tempoPreparo: ''
          });
          setImagePreview(null);
          
          console.log('✅ Produto criado com sucesso');
          // Disparar eventos de atualização em tempo real
          window.dispatchEvent(new CustomEvent('produtoUpdated'));
          window.dispatchEvent(new CustomEvent('categoriaUpdated'));
          // Disparar evento para o BaseModal fechar
          window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: response.data }));
        }
      }
    } catch (error) {
      const errorMessage = isEditMode ? 'Erro ao atualizar produto: ' : 'Erro ao cadastrar produto: ';
      setError(errorMessage + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="form-product" onSubmit={handleSubmit} className="h-full flex flex-col modal-form bg-white">
      <FormContainer>
        {/* Header com abas - estilo moderno */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveFormTab('detalhes')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeFormTab === 'detalhes'
                    ? 'border-gray-600 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Detalhes
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('complementos')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeFormTab === 'complementos'
                    ? 'border-gray-600 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Complementos
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('receita')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeFormTab === 'receita'
                    ? 'border-gray-600 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Receita
              </button>
            </nav>
          </div>
        </div>

        {/* Conteúdo do formulário baseado na aba ativa */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeFormTab === 'detalhes' && (
          <div className="space-y-4">
            {/* Nome do Produto */}
            <div className="mb-4">
              <FormField 
                label="Nome do Produto" 
                required
                error={getFieldError('nome')}
                helpText="Nome que aparecerá na listagem de produtos"
              >
                <FormInput
                  type="text"
                  value={formData.nome}
                  onChange={(e) => {
                    handleInputChange('nome', e.target.value);
                    clearError('nome');
                  }}
                  placeholder="Digite o nome do produto"
                  error={!!getFieldError('nome')}
                  disabled={isLoading}
                />
              </FormField>
            </div>

            {/* Categoria */}
            <div className="mb-4">
              <FormField 
                label="Categoria" 
                required
                error={getFieldError('categoria')}
                helpText={categorias.length === 0 && !loadingCategorias ? "Nenhuma categoria encontrada." : "Categoria do produto"}
              >
                <FormSelect
                  value={formData.categoria}
                  onChange={(e) => {
                    handleInputChange('categoria', e.target.value);
                    clearError('categoria');
                  }}
                  options={categorias}
                  placeholder={loadingCategorias ? 'Carregando...' : 'Selecione uma categoria'}
                  error={!!getFieldError('categoria')}
                  disabled={loadingCategorias}
                  required
                />
              </FormField>
            </div>

            {/* Imagem do Produto */}
            <div className="mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Imagem do Produto
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="imagem"
                    name="imagem"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 overflow-hidden bg-gray-50">
                    {formData.imagem ? (
                      <div className="w-full h-full relative">
                        <img
                          src={URL.createObjectURL(formData.imagem)}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : imagePreview ? (
                      <div className="w-full h-full relative">
                        <img
                          src={getImageUrl(imagePreview)}
                          alt="Imagem atual"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500 p-2 text-center">
                        <ImageIcon className="w-6 h-6 mb-2 text-gray-400" />
                        <span className="text-xs font-medium">Clique para selecionar</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de sugestões de imagens - LAYOUT HORIZONTAL */}
            {mostrarSugestoes && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-800">
                    Sugestões de Imagens
                  </h3>
                  {buscandoImagens && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Buscando...</span>
                    </div>
                  )}
                </div>
                  
                {buscandoImagens ? (
                  <div className="flex items-center justify-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <Loader2 className="w-6 h-6 text-gray-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-700 font-medium text-sm">Encontrando imagens...</p>
                    </div>
                  </div>
                ) : sugestoesImagens.length > 0 ? (
                  <div className="relative">
                    {/* Container com scroll horizontal */}
                    <div className="overflow-x-auto scrollbar-hide">
                      <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                        {sugestoesImagens.map((imagem, index) => (
                          <div
                            key={index}
                            className="group relative cursor-pointer flex-shrink-0"
                            onClick={() => selecionarImagemSugerida(imagem.url)}
                            onMouseEnter={() => {
                              // Preview automático no hover
                              setImagePreview(imagem.url);
                            }}
                            onMouseLeave={() => {
                              // Volta para a imagem original se não foi selecionada
                              if (!formData.imagem) {
                                setImagePreview(produto?.imagem_url || null);
                              }
                            }}
                          >
                            {/* Card responsivo */}
                            <div className="relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 group-hover:border-gray-400 group-hover:shadow-md transition-all duration-300 transform group-hover:-translate-y-1">
                              {/* Imagem responsiva */}
                              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 relative">
                                <img
                                  src={getSuggestionImageUrl(imagem.thumbnail || imagem.url)}
                                  alt={imagem.title || 'Imagem sugerida'}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  onError={(e) => {
                                    console.error('Erro ao carregar imagem sugerida:', imagem.thumbnail || imagem.url);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                  onLoad={() => {
                                    console.log('✅ Imagem sugerida carregada:', imagem.thumbnail || imagem.url);
                                  }}
                                />
                                {/* Fallback para erro */}
                                <div 
                                  className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"
                                  style={{ display: 'none' }}
                                >
                                  <ImageIcon size={16} className="sm:w-5 sm:h-5" />
                                </div>
                              </div>
                              
                              {/* Overlay com botão de seleção */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-1">
                                <div className="bg-white rounded-full p-1 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                  <Upload className="w-3 h-3 text-gray-600" />
                                </div>
                              </div>
                              
                              {/* Indicador de seleção */}
                              <div className="absolute top-1 right-1 w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Indicador de scroll no mobile */}
                    <div className="flex justify-center mt-2 sm:hidden">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ) : formData.nome.trim().length >= 2 ? (
                  <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ImageIcon className="w-6 h-6 text-gray-500" />
                    </div>
                  <h4 className="text-gray-800 font-semibold mb-1 text-sm">Nenhuma imagem disponível</h4>
                    <p className="text-gray-600 text-xs">
                    As imagens encontradas não estão mais disponíveis ou foram bloqueadas. Tente um termo diferente para "{formData.nome}" ou faça upload de uma imagem.
                  </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Valor Venda */}
            <div className="mb-4">
              <FormField 
                label="Valor Venda" 
                required
                error={getFieldError('valorVenda')}
                helpText="Preço de venda do produto"
              >
                <div className="relative">
                  <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">R$</span>
                  <FormInput
                    type="text"
                    value={formData.valorVenda}
                    onChange={(e) => {
                      handleInputChange('valorVenda', e.target.value);
                      clearError('valorVenda');
                    }}
                    placeholder="R$ 0,00"
                    error={!!getFieldError('valorVenda')}
                    className="pl-5"
                  />
                </div>
              </FormField>
            </div>
            
            {/* Valor Custo */}
            <div className="mb-4">
              <FormField 
                label="Valor Custo"
                helpText="Custo de produção do produto (opcional)"
              >
                <div className="relative">
                  <span className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">R$</span>
                  <FormInput
                    type="text"
                    value={formData.valorCusto}
                    onChange={(e) => handleInputChange('valorCusto', e.target.value)}
                    placeholder="R$ 0,00"
                    className="pl-5"
                  />
                </div>
              </FormField>
            </div>

            {/* Tempo de Preparo e Controle de Estoque - em coluna */}
            <div className="mb-6">
              <div className="space-y-4">

                {/* Tempo de Preparo */}
                <FormField 
                  label="Tempo de Preparo"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Habilitar Tempo de Preparo</label>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCheckboxChange('tempoPreparoEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                          formData.tempoPreparoEnabled ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.tempoPreparoEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Input do tempo de preparo - só aparece se habilitado */}
                    {formData.tempoPreparoEnabled && (
                      <FormInput
                        type="number"
                        min="1"
                        value={formData.tempoPreparo}
                        onChange={(e) => handleInputChange('tempoPreparo', e.target.value)}
                        placeholder="Minutos"
                      />
                    )}
                  </div>
                </FormField>

                {/* Controle de Estoque */}
                <FormField 
                  label="Controle de Estoque"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Habilitar Controle de Estoque</label>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCheckboxChange('estoqueEnabled')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                          formData.estoqueEnabled ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.estoqueEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Quantidade de Estoque */}
                    {formData.estoqueEnabled && (
                      <FormInput
                        type="number"
                        min="0"
                        value={formData.estoque}
                        onChange={(e) => handleInputChange('estoque', e.target.value)}
                        placeholder="0"
                      />
                    )}
                  </div>
                </FormField>
              </div>
            </div>
        
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                </div>
                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>
          )}
          </div>
        )}

        {activeFormTab === 'complementos' && (
          <div className="space-y-6 mt-4">
            {/* Se estiver mostrando a listagem de complementos, esconder tudo */}
            {showComplementoForm ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Selecionar Complementos</h3>
                    <p className="text-sm text-gray-600 mt-1">Escolha os complementos para esta categoria</p>
                  </div>
                  <button
                    onClick={handleCancelarComplementos}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Listagem de complementos */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {complementosDisponiveis.map((complemento) => (
                      <div key={complemento.id} className="flex items-center space-x-4 p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0">
                        <div className="relative flex-shrink-0 flex items-center">
                          <input
                            type="checkbox"
                            id={`complemento-${complemento.id}`}
                            checked={complementosSelecionados.some(c => c.id === complemento.id)}
                            onChange={() => handleComplementoSelect(complemento)}
                            className="h-5 w-5 appearance-none rounded-full border-2 border-gray-300 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                          />
                          {complementosSelecionados.some(c => c.id === complemento.id) && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <label 
                          htmlFor={`complemento-${complemento.id}`}
                          className="flex-1 text-sm font-light text-gray-500 cursor-pointer tracking-wide flex items-center"
                        >
                          {complemento.nome}
                        </label>
                        {complemento.valor_venda && (
                          <span className="text-sm font-medium text-gray-600 flex items-center">
                            R$ {parseFloat(complemento.valor_venda).toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : showCopyComplementos ? (
              <div className="space-y-6">
                {/* Header com botão de voltar */}
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Copiar Complementos</h3>
                    <p className="text-sm text-gray-600 mt-1">Selecione um produto para copiar suas categorias</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCopyComplementos(false);
                      setProdutoSelecionadoParaCopiar(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Listagem de produtos */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {loadingProdutos ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium">Carregando produtos...</p>
                        </div>
                      </div>
                    ) : produtosComComplementos.length > 0 ? (
                      produtosComComplementos.map((produto) => (
                        <div key={produto.id} className="flex items-center space-x-4 p-4 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0">
                          <div className="relative">
                            <input
                              type="radio"
                              id={`produto-${produto.id}`}
                              name="produto-selecionado"
                              checked={produtoSelecionadoParaCopiar?.id === produto.id}
                              onChange={() => handleSelecionarProdutoParaCopiar(produto)}
                              className="h-5 w-5 appearance-none rounded-full border-2 border-gray-300 checked:bg-purple-600 checked:border-purple-600 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-purple-200"
                            />
                            {produtoSelecionadoParaCopiar?.id === produto.id && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <label 
                            htmlFor={`produto-${produto.id}`}
                            className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            {produto.nome}
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {produto.categorias_count} {produto.categorias_count === 1 ? 'categoria' : 'categorias'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-gray-600 font-semibold mb-2">Nenhum produto encontrado</h4>
                        <p className="text-gray-500 text-sm">Não há produtos com categorias de complementos</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Botões de ação */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowCategoriaForm(true)}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium text-sm sm:text-base whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Categoria</span>
                  </button>
                  
                  <button 
                    onClick={handleCopiarComplementos}
                    className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 font-medium text-sm sm:text-base whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    <span>Copiar Complementos</span>
                  </button>
                </div>

                {/* Formulário de categoria de complementos */}
                {showCategoriaForm && (
                  <FormCategoriaComplemento
                    onClose={() => {
                      setShowCategoriaForm(false);
                      setCategoriaAtual(null);
                    }}
                    onDataChange={setCategoriaAtual}
                    onAdicionarComplemento={handleAdicionarComplemento}
                    categoria={categoriaAtual}
                    complementosTemporarios={complementosTemporarios}
                  />
                )}

                {/* Listagem de categorias de complementos */}
                {produto?.id && (
                  <ListCategoryComplements
                    produtoId={produto.id}
                    onCategoriaEdit={(categoriaId, dados) => {
                      setCategoriasEditadas(prev => ({
                        ...prev,
                        [categoriaId]: dados
                      }));
                    }}
                    onCategoriaDelete={(categoria) => {
                      console.log('Categoria deletada:', categoria);
                      showNotification('Categoria deletada com sucesso!');
                    }}
                    onAdicionarComplemento={handleAdicionarComplemento}
                  />
                )}

              </>
            )}
          </div>
        )}

        {activeFormTab === 'receita' && (
          <div className="text-center py-12 mt-4">
            <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Receita</h3>
              <p className="text-gray-500 text-sm">Aqui será adicionada a receita do produto</p>
            </div>
          </div>
        )}
        </div>

        {/* Notificação */}
        {notification.show && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ show: false, message: '', type: 'success' })}
          />
        )}

        {/* Notificação de Validação */}
        <ValidationNotification
          isOpen={showValidationNotification}
          onClose={() => setShowValidationNotification(false)}
          errors={errors}
          title="Campos obrigatórios não preenchidos"
        />
      </FormContainer>
    </form>
  );
};

export default FormProduct;
