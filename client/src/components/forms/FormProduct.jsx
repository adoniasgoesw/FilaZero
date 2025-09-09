import React, { useState, useEffect } from 'react';
import { Package, Image as ImageIcon, Upload, Zap, Loader2, Plus } from 'lucide-react';
import api, { buscarImagens } from '../../services/api';
import AddButton from '../buttons/Add';
import CopyButton from '../buttons/Copy';
import FormCategoriaComplemento from './FormCategoriaComplemento';
import ListCategoryComplements from '../list/ListCategoryComplements';
import Notification from '../elements/Notification';

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
        tempoPreparoEnabled: produto.habilita_tempo_preparo || false,
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
      if (!formData.nome.trim()) {
        setError('Nome é obrigatório!');
        return;
      }
      
      if (!formData.categoria) {
        setError('Categoria é obrigatória!');
        return;
      }
      
      if (!formData.valorVenda) {
        setError('Valor de venda é obrigatório!');
        return;
      }
      
      // Imagem é obrigatória apenas no modo de criação
      if (!isEditMode && !formData.imagem) {
        setError('Imagem é obrigatória!');
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
      formDataToSend.append('habilita_tempo_preparo', formData.tempoPreparoEnabled);
      formDataToSend.append('tempo_preparo_min', formData.tempoPreparo || '');
      
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
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form">
      {/* Header do formulário - fixo */}
      <div className="border-b border-gray-200 pb-4 mb-6 sticky top-0 z-10 bg-white">
        <div className="flex bg-gray-50 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setActiveFormTab('detalhes')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeFormTab === 'detalhes'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Detalhes
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('complementos')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeFormTab === 'complementos'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Complementos
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('receita')}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeFormTab === 'receita'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Receita
          </button>
        </div>
      </div>

      {/* Conteúdo do formulário baseado na aba ativa */}
      <div className="flex-1 space-y-6">
        {activeFormTab === 'detalhes' && (
          <>
        {/* Nome e Categoria (esquerda) + Imagem (direita) */}
        <div className="grid grid-cols-2 gap-6">
          {/* Coluna esquerda: Nome e Categoria */}
          <div className="space-y-4">
            {/* Nome - Obrigatório */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome do produto"
              />
            </div>

            {/* Categoria - Obrigatório */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria <span className="text-red-500">*</span>
              </label>

              <select
                required
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingCategorias}
              >
                <option value="">
                  {loadingCategorias ? 'Carregando categorias...' : 'Selecione uma categoria'}
                </option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.nome}</option>
                ))}
              </select>
              {categorias.length === 0 && !loadingCategorias && (
                <p className="text-xs text-orange-600 mt-1">
                  Nenhuma categoria encontrada. Cadastre uma categoria primeiro.
                </p>
              )}
            </div>
          </div>

          {/* Coluna direita: Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem do Produto {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <div className="flex justify-center">
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
                <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 overflow-hidden bg-gray-50">
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
                    <div className="flex flex-col items-center text-gray-500 p-4 text-center">
                      <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                      <span className="text-sm font-medium">Clique para selecionar</span>
                      <span className="text-xs text-gray-400 mt-1">ou arraste uma imagem aqui</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {isEditMode && produto?.imagem_url ? 'Deixe em branco para manter a imagem atual' : 'Formatos aceitos: PNG, JPG, JPEG (máx. 5MB)'}
            </p>
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

        {/* Grid de 2 colunas para os outros campos */}
        <div className="grid grid-cols-2 gap-4">
          {/* Valor de Venda - Obrigatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor de Venda <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.valorVenda}
              onChange={(e) => handleInputChange('valorVenda', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="R$ 0,00"
            />
          </div>

          {/* Valor de Custo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor de Custo
            </label>
            <input
              type="text"
              value={formData.valorCusto}
              onChange={(e) => handleInputChange('valorCusto', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="R$ 0,00"
            />
          </div>

          {/* Código PDV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código PDV
            </label>
            <input
              type="text"
              value={formData.codigoPdv}
              onChange={(e) => handleInputChange('codigoPdv', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Código do produto"
            />
          </div>
        </div>

        {/* Estoque - Opcional (largura total) */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="estoqueEnabled"
              checked={formData.estoqueEnabled}
              onChange={() => handleCheckboxChange('estoqueEnabled')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="estoqueEnabled" className="ml-2 text-sm font-medium text-gray-700">
              Habilitar Controle de Estoque
            </label>
          </div>
          
          {formData.estoqueEnabled && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade em Estoque
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoque}
                onChange={(e) => handleInputChange('estoque', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          )}
        </div>

        {/* Tempo de Preparo - Opcional (largura total) */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="tempoPreparoEnabled"
              checked={formData.tempoPreparoEnabled}
              onChange={() => handleCheckboxChange('tempoPreparoEnabled')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="tempoPreparoEnabled" className="ml-2 text-sm font-medium text-gray-700">
              Habilitar Tempo de Preparo
            </label>
          </div>
          
          {formData.tempoPreparoEnabled && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo de Preparo (em minutos)
              </label>
              <input
                type="number"
                min="1"
                value={formData.tempoPreparo}
                onChange={(e) => handleInputChange('tempoPreparo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="30"
              />
            </div>
          )}
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
          </>
        )}

        {activeFormTab === 'complementos' && (
          <div className="space-y-6">
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
            ) : (
              <>
                {/* Botões de ação */}
                <div className={`flex flex-row gap-3 ${produto?.id ? 'border-b border-gray-200 pb-4' : ''}`}>
                  <AddButton 
                    text="Adicionar Categoria"
                    color="blue"
                    onClick={() => setShowCategoriaForm(true)}
                    className="h-10 text-xs font-medium flex-1 justify-center py-2 whitespace-nowrap"
                  />
                  <CopyButton 
                    text="Copiar Complementos"
                    color="blue"
                    onClick={() => console.log('Copiar complementos')}
                    className="h-10 text-xs font-medium flex-1 justify-center py-2 whitespace-nowrap"
                  />
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
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ainda não foi adicionado nenhum complemento</h3>
                    <p className="text-gray-500">Use os botões acima para adicionar ou copiar complementos</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeFormTab === 'receita' && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Receita</h3>
            <p className="text-gray-500">Aqui será adicionada a receita do produto</p>
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
    </form>
  );
};

export default FormProduct;
