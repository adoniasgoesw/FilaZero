import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCategorias, useProdutos } from '../contexts/CacheContext';

export const usePainelItens = (estabelecimentoId) => {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  
  // Usar hooks de cache
  const { categorias, loadCategorias } = useCategorias(estabelecimentoId);
  const { produtos, loadProdutos } = useProdutos(estabelecimentoId);

  // Carregar dados do cache
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
    isLoading: false, // Cache sempre disponível
    error: null
  };
};

export default usePainelItens;
