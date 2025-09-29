import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

export const usePainelItens = (estabelecimentoId) => {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  
  // Estados para dados (busca direta da API)
  const [categorias, setCategorias] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para carregar categorias da API
  const loadCategorias = useCallback(async () => {
    if (!estabelecimentoId) return;
    
    try {
      const response = await api.get(`/categorias/${estabelecimentoId}`);
      if (response.success) {
        setCategorias(response.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  }, [estabelecimentoId]);

  // Função para carregar produtos da API
  const loadProdutos = useCallback(async () => {
    if (!estabelecimentoId) return;
    
    try {
      const response = await api.get(`/produtos/${estabelecimentoId}`);
      if (response.success) {
        setProdutos(response.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    }
  }, [estabelecimentoId]);

  // Carregar dados da API
  useEffect(() => {
    if (estabelecimentoId) {
      loadCategorias();
      loadProdutos();
    }
  }, [estabelecimentoId, loadCategorias, loadProdutos]);

  // Filtrar produtos por categoria selecionada
  useEffect(() => {
    if (categoriaSelecionada) {
      const filtrados = produtos.filter(produto => 
        produto.categoria_id === categoriaSelecionada.id
      );
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados(produtos);
    }
  }, [categoriaSelecionada, produtos]);

  // Selecionar categoria
  const selecionarCategoria = useCallback((categoria) => {
    setCategoriaSelecionada(categoria);
  }, []);

  // Limpar seleção de categoria
  const limparSelecaoCategoria = useCallback(() => {
    setCategoriaSelecionada(null);
  }, []);

  // Obter categorias ativas
  const categoriasAtivas = useMemo(() => {
    return categorias.filter(categoria => categoria.status === true);
  }, [categorias]);

  // Obter produtos ativos
  const produtosAtivos = useMemo(() => {
    return produtosFiltrados.filter(produto => produto.status === true);
  }, [produtosFiltrados]);

  return {
    // Dados
    categorias: categoriasAtivas,
    produtos: produtosAtivos,
    categoriaSelecionada,
    
    // Ações
    selecionarCategoria,
    limparSelecaoCategoria,
    
    // Estados
    isLoading: false,
    error: null
  };
};

export default usePainelItens;
