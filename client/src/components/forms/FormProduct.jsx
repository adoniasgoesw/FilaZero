import React, { useState, useEffect } from 'react';
import { Package, Image as ImageIcon, Upload, Zap, Loader2, Plus, X } from 'lucide-react';
import api, { buscarImagens } from '../../services/api';
import AddButton from '../buttons/Add';
import CopyButton from '../buttons/Copy';
import FormCategoriaComplemento from './FormCategoriaComplemento';
import ListCategoryComplements from '../list/ListCategoryComplements';
import Notification from '../elements/Notification';
import ValidationNotification from '../elements/ValidationNotification';
import { useFormValidation } from '../../hooks/useFormValidation';

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
  const [formData, setFormData] = useState({
    nome: '',
    imagem: null,
    categoria: '',
    valorVenda: '',
    valorCusto: '',
    codigoPdv: '',
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
        categoria: produto.categoria_id ? produto.categoria_id.toString() : '',
        valorVenda: produto.valor_venda || '',
        valorCusto: produto.valor_custo || '',
        codigoPdv: produto.codigo_pdv || '',
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
        setSugestoesImagens(response.imagens || []);
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
      // Fazer download da imagem e converter para File
      const response = await fetch(imagemUrl);
      const blob = await response.blob();
      
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
      
      // Limpar erro se existir
      setError('');
      
      console.log('✅ Imagem sugerida selecionada:', imagemUrl);
    } catch (error) {
      console.error('Erro ao selecionar imagem sugerida:', error);
      setError('Erro ao carregar a imagem selecionada');
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
    if (!produtoSelecionadoParaCopiar || !produto?.id) {
      setError('Produto não selecionado ou produto atual não encontrado!');
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
        valorVenda: { required: true, label: 'Valor de venda' }
      };

      // Adicionar validação de imagem apenas no modo de criação
      if (!isEditMode) {
        validationRules.imagem = { required: true, label: 'Imagem' };
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
      
      if (isEditMode) {
        // Modo de edição
        if (formData.imagem) {
          formDataToSend.append('imagem', formData.imagem);
        }
        
        const response = await api.put(`/produtos/${produto.id}`, formDataToSend);
        
        if (response.success) {
          console.log('✅ Produto editado com sucesso');
          // Disparar evento para o BaseModal fechar
          window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: response.data }));
        }
      } else {
        // Modo de criação
        formDataToSend.append('imagem', formData.imagem);
        
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        if (!estabelecimentoId) {
          throw new Error('Estabelecimento não identificado!');
        }
        formDataToSend.append('estabelecimento_id', estabelecimentoId);

        const response = await api.post('/produtos', formDataToSend);
        
        if (response.success) {
          const novoProduto = response.data;
          
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
            categoria: '',
            valorVenda: '',
            valorCusto: '',
            codigoPdv: '',
            estoqueEnabled: false,
            estoque: '',
            tempoPreparoEnabled: false,
            tempoPreparo: ''
          });
          setImagePreview(null);
          
          console.log('✅ Produto criado com sucesso');
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
    <form onSubmit={handleSubmit} className="h-full w-full flex flex-col modal-form bg-white">
      {/* Tabs Navigation */}
      <div className="flex gap-2 p-2 bg-gray-50">
          <button
            type="button"
            onClick={() => setActiveFormTab('detalhes')}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
              activeFormTab === 'detalhes'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Detalhes
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('complementos')}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
              activeFormTab === 'complementos'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Complementos
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('receita')}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
              activeFormTab === 'receita'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Receita
          </button>
      </div>

      {/* Conteúdo do formulário baseado na aba ativa */}
      <div className="p-2 sm:p-4 max-h-96 overflow-y-auto scrollbar-hide">
        {activeFormTab === 'detalhes' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Nome do Produto - largura total */}
            <div className="space-y-2 sm:space-y-3">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                Nome do Produto
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => {
                  handleInputChange('nome', e.target.value);
                  clearError('nome');
                }}
                className={`w-full px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  getFieldError('nome') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite o nome do produto"
                disabled={isLoading}
              />
              {getFieldError('nome') && (
                <p className="text-xs text-red-500 mt-1">{getFieldError('nome')}</p>
              )}
            </div>

            {/* Categoria - em cima da imagem */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Categoria
              </label>
              <div className="relative">
              <select
                value={formData.categoria}
                  onChange={(e) => {
                    handleInputChange('categoria', e.target.value);
                    clearError('categoria');
                  }}
                  className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer bg-white ${
                    getFieldError('categoria') 
                      ? 'border-red-400 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  } ${loadingCategorias ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loadingCategorias}
              >
                  <option value="" className="text-gray-500 font-light">
                    {loadingCategorias ? 'Carregando...' : 'Selecione uma categoria'}
                </option>
                {categorias.map(cat => (
                    <option 
                      key={cat.id} 
                      value={cat.id.toString()}
                      className="text-gray-700 font-light py-2"
                    >
                      {cat.nome}
                    </option>
                ))}
              </select>
                
                {/* Ícone de dropdown customizado */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg 
                    className="w-5 h-5 text-gray-400 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {getFieldError('categoria') && (
                <p className="text-xs text-red-500 mt-2 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {getFieldError('categoria')}
                </p>
              )}
              
              {categorias.length === 0 && !loadingCategorias && (
                <p className="text-xs text-orange-600 mt-2 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Nenhuma categoria encontrada.
                </p>
              )}
          </div>

            {/* Componente Pai - Container principal */}
            <div className="flex flex-row gap-2">
              {/* Filho 1 - Imagem do Produto (lado esquerdo) */}
              <div className="flex-shrink-0 relative">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                  <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 overflow-hidden bg-gray-50">
                  {formData.imagem ? (
                    <div className="w-full h-full relative">
                      <img
                        src={URL.createObjectURL(formData.imagem)}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  ) : imagePreview ? (
                    <div className="w-full h-full relative">
                      <img
                        src={getImageUrl(imagePreview)}
                        alt="Imagem atual"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  ) : (
                      <div className="flex flex-col items-center text-gray-500 p-1 sm:p-2 md:p-4 text-center">
                        <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 md:w-10 md:h-10 mb-1 sm:mb-2 md:mb-3 text-gray-400" />
                        <span className="text-[10px] sm:text-xs md:text-sm font-medium">Clique para selecionar</span>
                        <span className="text-[8px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">PNG, JPG até 5MB</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Filho 2 - Container dos valores (lado direito) */}
              <div className="flex-1 space-y-1 sm:space-y-2">
                {/* Valores (valor venda e valor custo em coluna) */}
                <div className="space-y-1 sm:space-y-2">
                  {/* Valor Venda */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Valor Venda
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-xs sm:text-sm">R$</span>
                      <input
                        type="text"
                        value={formData.valorVenda}
                        onChange={(e) => {
                          handleInputChange('valorVenda', e.target.value);
                          clearError('valorVenda');
                        }}
                        className={`w-full pl-6 sm:pl-8 md:pl-12 pr-2 sm:pr-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          getFieldError('valorVenda') ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0,00"
                      />
                    </div>
                    {getFieldError('valorVenda') && (
                      <p className="text-xs text-red-500 mt-1">{getFieldError('valorVenda')}</p>
                    )}
                  </div>
                  
                  {/* Valor Custo */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Valor Custo
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-xs sm:text-sm">R$</span>
                      <input
                        type="text"
                        value={formData.valorCusto}
                        onChange={(e) => handleInputChange('valorCusto', e.target.value)}
                        className="w-full pl-6 sm:pl-8 md:pl-12 pr-2 sm:pr-4 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>
          </div>
        </div>

        {/* Seção de sugestões de imagens - LAYOUT HORIZONTAL */}
        {mostrarSugestoes && (
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-purple-800">
                Sugestões
              </h3>
              {buscandoImagens && (
                <div className="flex items-center gap-2 text-purple-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Buscando...</span>
                </div>
              )}
            </div>
              
            {buscandoImagens ? (
              <div className="flex items-center justify-center py-8 bg-white rounded-xl border-2 border-dashed border-purple-300">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto mb-2" />
                  <p className="text-purple-700 font-medium text-sm">Encontrando imagens...</p>
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
                        <div className="relative overflow-hidden rounded-xl bg-white shadow-md border-2 border-transparent group-hover:border-purple-400 group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
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
                              className="w-full h-full flex items-center justify-center text-purple-400 bg-purple-50"
                              style={{ display: 'none' }}
                            >
                              <ImageIcon size={16} className="sm:w-5 sm:h-5" />
                            </div>
                          </div>
                          
                          {/* Overlay com botão de seleção */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-1">
                            <div className="bg-white rounded-full p-1 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                              <Upload className="w-3 h-3 text-purple-600" />
                            </div>
                          </div>
                          
                          {/* Indicador de seleção */}
                          <div className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                    <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                    <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                    <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            ) : formData.nome.trim().length >= 2 ? (
              <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-purple-300">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-6 h-6 text-purple-500" />
                </div>
                <h4 className="text-purple-800 font-semibold mb-1 text-sm">Nenhuma imagem encontrada</h4>
                <p className="text-purple-600 text-xs">
                  Tente um termo diferente para "{formData.nome}"
                </p>
              </div>
            ) : null}
          </div>
        )}


            {/* Código PDV */}
          <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Código PDV
            </label>
            <input
              type="text"
                value={formData.codigoPdv}
                onChange={(e) => handleInputChange('codigoPdv', e.target.value)}
                className="w-full px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Código PDV"
            />
          </div>

            {/* Tempo de Preparo - com toggle */}
          <div>
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-gray-700">Tempo de Preparo</label>
                <label className="relative inline-flex items-center cursor-pointer">
            <input
                    type="checkbox"
                    id="tempoPreparoEnabled"
                    checked={formData.tempoPreparoEnabled}
                    onChange={() => handleCheckboxChange('tempoPreparoEnabled')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
          </div>

              {/* Input do tempo de preparo - só aparece se habilitado */}
              {formData.tempoPreparoEnabled && (
                <div className="mt-2">
            <input
                    type="number"
                    min="1"
                    value={formData.tempoPreparo}
                    onChange={(e) => handleInputChange('tempoPreparo', e.target.value)}
                    className="w-full px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Minutos"
            />
          </div>
              )}
        </div>

            {/* Controle de Estoque */}
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-gray-700">Controle de Estoque</label>
              <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="estoqueEnabled"
              checked={formData.estoqueEnabled}
              onChange={() => handleCheckboxChange('estoqueEnabled')}
                  className="sr-only peer"
            />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
            {/* Quantidade de Estoque */}
          {formData.estoqueEnabled && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Quantidade em Estoque
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoque}
                onChange={(e) => handleInputChange('estoque', e.target.value)}
                  className="w-full px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>
          )}
        
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
          <div className="space-y-4">
            {/* Se estiver mostrando a listagem de complementos, esconder tudo */}
            {showComplementoForm ? (
              <div className="space-y-4">
                {/* Cabeçalho cinza - altura reduzida */}
                <div className="bg-gray-100 rounded-lg py-2 px-4">
                  <h3 className="text-base font-semibold text-gray-800">Complementos</h3>
                </div>

                {/* Listagem de complementos com checkboxes - sem bordas */}
                <div className="space-y-2">
                  {complementosDisponiveis.map((complemento) => (
                    <div key={complemento.id} className="flex items-center space-x-4 py-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        id={`complemento-${complemento.id}`}
                        checked={complementosSelecionados.some(c => c.id === complemento.id)}
                        onChange={() => handleComplementoSelect(complemento)}
                        className="h-5 w-5 appearance-none rounded-full border-2 border-blue-500 checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
                      />
                      <label 
                        htmlFor={`complemento-${complemento.id}`}
                        className="flex-1 text-sm font-light text-gray-700 cursor-pointer tracking-wide"
                      >
                        {complemento.nome}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ) : showCopyComplementos ? (
              <div className="space-y-4">
                {/* Cabeçalho cinza com botão de voltar */}
                <div className="bg-gray-100 rounded-lg py-2 px-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-800">Produtos</h3>
                  <button
                    onClick={() => {
                      setShowCopyComplementos(false);
                      setProdutoSelecionadoParaCopiar(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Listagem de produtos com checkboxes - sem bordas */}
                <div className="space-y-2">
                  {loadingProdutos ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                      <span className="ml-2 text-gray-600">Carregando produtos...</span>
                    </div>
                  ) : produtosComComplementos.length > 0 ? (
                    produtosComComplementos.map((produto) => (
                      <div key={produto.id} className="flex items-center space-x-4 py-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          id={`produto-${produto.id}`}
                          checked={produtoSelecionadoParaCopiar?.id === produto.id}
                          onChange={() => handleSelecionarProdutoParaCopiar(produto)}
                          className="h-5 w-5 appearance-none rounded-full border-2 border-blue-500 checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
                        />
                        <label 
                          htmlFor={`produto-${produto.id}`}
                          className="flex-1 text-sm font-light text-gray-700 cursor-pointer tracking-wide"
                        >
                          {produto.nome}
                        </label>
                        <span className="text-xs text-gray-500">
                          {produto.categorias_count} {produto.categorias_count === 1 ? 'categoria' : 'categorias'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Nenhum produto com categorias de complementos encontrado</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <>
                {/* Botões de ação - só aparecem quando não estiver em modo de cópia */}
                <div className="flex space-x-1 sm:space-x-3">
                  <button 
                    onClick={() => setShowCategoriaForm(true)}
                    className="bg-blue-600 text-white px-2 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 sm:space-x-2 flex-1"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Adicionar Categoria</span>
                  </button>
                  <button 
                    onClick={handleCopiarComplementos}
                    className="bg-gray-600 text-white px-2 sm:px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-1 sm:space-x-2 flex-1"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    <span className="text-xs sm:text-sm">Copiar Complementos</span>
                  </button>
                </div>


                {/* Formulário de categoria de complementos - aparece acima da listagem */}
                {showCategoriaForm && (
                  <div className="mb-4">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-1 shadow-lg">
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
                    </div>
                  </div>
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

                {/* Área de conteúdo vazia - só mostra se não tiver categoria e não estiver editando */}
                {!showCategoriaForm && !produto?.id && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500">Nenhum complemento adicionado ainda</p>
                    <p className="text-sm text-gray-400 mt-1">Use os botões acima para adicionar complementos</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeFormTab === 'receita' && (
          <div className="text-center py-8 sm:py-12">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Receita</h3>
            <p className="text-gray-500 text-sm sm:text-base">Aqui será adicionada a receita do produto</p>
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
    </form>
  );
};

export default FormProduct;
