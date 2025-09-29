import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CacheContext = createContext();

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache deve ser usado dentro de CacheProvider');
  }
  return context;
};

export const CacheProvider = ({ children }) => {
  // Estados do cache
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [clientes, setClientes] = useState([]);
  
  // Estados de loading
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  
  // Estados de erro
  const [errorCategorias, setErrorCategorias] = useState(null);
  const [errorProdutos, setErrorProdutos] = useState(null);
  const [errorPaymentMethods, setErrorPaymentMethods] = useState(null);
  const [errorClientes, setErrorClientes] = useState(null);
  
  // Timestamps para controle de cache
  const [lastUpdated, setLastUpdated] = useState({
    categorias: null,
    produtos: null,
    paymentMethods: null,
    clientes: null
  });

  // Função para obter estabelecimento ID
  const getEstabelecimentoId = useCallback(() => {
    const fromStorage = localStorage.getItem('estabelecimentoId');
    if (fromStorage) {
      const parsed = parseInt(fromStorage, 10);
      if (!isNaN(parsed)) return parsed;
    }
    
    try {
      const usuarioRaw = localStorage.getItem('usuario');
      if (usuarioRaw) {
        const usuario = JSON.parse(usuarioRaw);
        const cand = parseInt(usuario?.estabelecimento_id, 10);
        if (!isNaN(cand)) return cand;
      }
    } catch {
      // Ignore error
    }
    
    return null;
  }, []);

  // Função para carregar categorias
  const loadCategorias = useCallback(async (forceRefresh = false) => {
    const estId = getEstabelecimentoId();
    if (!estId) return;

    // Se já carregou recentemente e não é refresh forçado, não recarregar
    const now = Date.now();
    const lastUpdate = lastUpdated.categorias;
    if (!forceRefresh && lastUpdate && (now - lastUpdate) < 30000) { // 30 segundos
      return;
    }

    try {
      setLoadingCategorias(true);
      setErrorCategorias(null);
      
      const response = await api.get(`/categorias/${estId}`);
      if (response.success && response.data) {
        const categoriasData = Array.isArray(response.data) ? response.data : response.data.categorias || [];
        setCategorias(categoriasData);
        setLastUpdated(prev => ({ ...prev, categorias: now }));
        console.log('✅ Cache - Categorias carregadas:', categoriasData.length);
      }
    } catch (error) {
      console.error('❌ Cache - Erro ao carregar categorias:', error);
      setErrorCategorias(error.message);
    } finally {
      setLoadingCategorias(false);
    }
  }, [getEstabelecimentoId, lastUpdated.categorias]);

  // Função para carregar produtos
  const loadProdutos = useCallback(async (forceRefresh = false) => {
    const estId = getEstabelecimentoId();
    if (!estId) return;

    const now = Date.now();
    const lastUpdate = lastUpdated.produtos;
    if (!forceRefresh && lastUpdate && (now - lastUpdate) < 30000) {
      return;
    }

    try {
      setLoadingProdutos(true);
      setErrorProdutos(null);
      
      const response = await api.get(`/produtos/${estId}?page=1&limit=200`);
      if (response.success) {
        const list = response.data?.produtos || response.data || [];
        const filtered = Array.isArray(list)
          ? list.filter((p) => (p?.status === true || p?.status === 1) && (p?.categoria_status === true || p?.categoria_status === 1))
          : [];
        setProdutos(filtered);
        setLastUpdated(prev => ({ ...prev, produtos: now }));
        console.log('✅ Cache - Produtos carregados:', filtered.length);
      }
    } catch (error) {
      console.error('❌ Cache - Erro ao carregar produtos:', error);
      setErrorProdutos(error.message);
    } finally {
      setLoadingProdutos(false);
    }
  }, [getEstabelecimentoId, lastUpdated.produtos]);

  // Função para carregar métodos de pagamento
  const loadPaymentMethods = useCallback(async (forceRefresh = false) => {
    const estId = getEstabelecimentoId();
    if (!estId) return;

    const now = Date.now();
    const lastUpdate = lastUpdated.paymentMethods;
    if (!forceRefresh && lastUpdate && (now - lastUpdate) < 60000) { // 1 minuto
      return;
    }

    try {
      setLoadingPaymentMethods(true);
      setErrorPaymentMethods(null);
      
      const response = await api.get(`/pagamentos/${estId}`);
      if (response.success) {
        const activePayments = response.data.filter(payment => 
          payment.status === true && 
          payment.nome !== 'Pagamento Composto' && 
          payment.tipo !== 'Composto'
        );
        setPaymentMethods(activePayments);
        setLastUpdated(prev => ({ ...prev, paymentMethods: now }));
        console.log('✅ Cache - Métodos de pagamento carregados:', activePayments.length);
      }
    } catch (error) {
      console.error('❌ Cache - Erro ao carregar métodos de pagamento:', error);
      setErrorPaymentMethods(error.message);
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, [getEstabelecimentoId, lastUpdated.paymentMethods]);

  // Função para carregar clientes
  const loadClientes = useCallback(async (forceRefresh = false) => {
    const estId = getEstabelecimentoId();
    if (!estId) return;

    const now = Date.now();
    const lastUpdate = lastUpdated.clientes;
    if (!forceRefresh && lastUpdate && (now - lastUpdate) < 60000) {
      return;
    }

    try {
      setLoadingClientes(true);
      setErrorClientes(null);
      
      const response = await api.get(`/clientes/${estId}`);
      if (response.success) {
        setClientes(response.data || []);
        setLastUpdated(prev => ({ ...prev, clientes: now }));
        console.log('✅ Cache - Clientes carregados:', response.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Cache - Erro ao carregar clientes:', error);
      setErrorClientes(error.message);
    } finally {
      setLoadingClientes(false);
    }
  }, [getEstabelecimentoId, lastUpdated.clientes]);

  // Função para pré-carregar dados da Home
  const preloadHomeData = useCallback(async () => {
    console.log('🚀 Cache - Iniciando pré-carregamento da Home...');
    await Promise.all([
      loadCategorias(true),
      loadProdutos(true),
      loadPaymentMethods(true)
    ]);
    console.log('✅ Cache - Pré-carregamento da Home concluído');
  }, [loadCategorias, loadProdutos, loadPaymentMethods]);


  // Função para limpar cache
  const clearCache = useCallback(() => {
    setCategorias([]);
    setProdutos([]);
    setPaymentMethods([]);
    setClientes([]);
    setLastUpdated({
      categorias: null,
      produtos: null,
      paymentMethods: null,
      clientes: null
    });
    console.log('🧹 Cache - Cache limpo');
  }, []);

  // Função para invalidar cache específico
  const invalidateCache = useCallback((type) => {
    setLastUpdated(prev => ({ ...prev, [type]: null }));
    console.log(`🔄 Cache - Cache ${type} invalidado`);
  }, []);

  // Escutar eventos de atualização
  useEffect(() => {
    const handleCategoriaUpdate = () => {
      console.log('🔄 Cache - Evento categoriaUpdated recebido');
      invalidateCache('categorias');
      loadCategorias(true);
    };

    const handleProdutoUpdate = () => {
      console.log('🔄 Cache - Evento produtoUpdated recebido');
      invalidateCache('produtos');
      loadProdutos(true);
    };

    const handlePaymentUpdate = () => {
      console.log('🔄 Cache - Evento paymentUpdated recebido');
      invalidateCache('paymentMethods');
      loadPaymentMethods(true);
    };

    const handleClienteUpdate = () => {
      console.log('🔄 Cache - Evento clienteUpdated recebido');
      invalidateCache('clientes');
      loadClientes(true);
    };

    window.addEventListener('categoriaUpdated', handleCategoriaUpdate);
    window.addEventListener('produtoUpdated', handleProdutoUpdate);
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    window.addEventListener('clienteUpdated', handleClienteUpdate);
    
    return () => {
      window.removeEventListener('categoriaUpdated', handleCategoriaUpdate);
      window.removeEventListener('produtoUpdated', handleProdutoUpdate);
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
      window.removeEventListener('clienteUpdated', handleClienteUpdate);
    };
  }, []); // Removidas dependências que causavam loops

  const value = {
    // Dados do cache
    categorias,
    produtos,
    paymentMethods,
    clientes,
    
    // Estados de loading
    loadingCategorias,
    loadingProdutos,
    loadingPaymentMethods,
    loadingClientes,
    
    // Estados de erro
    errorCategorias,
    errorProdutos,
    errorPaymentMethods,
    errorClientes,
    
    // Funções de carregamento
    loadCategorias,
    loadProdutos,
    loadPaymentMethods,
    loadClientes,
    
    // Funções de pré-carregamento
    preloadHomeData,
    
    // Funções de controle
    clearCache,
    invalidateCache
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

export default CacheProvider;
