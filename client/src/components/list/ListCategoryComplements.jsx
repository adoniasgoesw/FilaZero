import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import AddButton from '../buttons/Add';
import DeleteButton from '../buttons/Delete';
import ConfirmDelete from '../elements/ConfirmDelete';

const ListCategoryComplements = ({ produtoId, onCategoriaEdit, onCategoriaDelete, onAdicionarComplemento }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoria: null });
  const [deleting, setDeleting] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [editData, setEditData] = useState({});
  const [complementosPorCategoria, setComplementosPorCategoria] = useState({});

  // Buscar complementos de uma categoria
  const fetchComplementosCategoria = async (categoriaId) => {
    try {
      const response = await api.get(`/itens-complementos/categoria/${categoriaId}`);
      if (response.success) {
        setComplementosPorCategoria(prev => ({
          ...prev,
          [categoriaId]: response.data
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar complementos da categoria:', error);
    }
  };

  // Função para recarregar complementos de uma categoria específica
  const recarregarComplementosCategoria = async (categoriaId) => {
    await fetchComplementosCategoria(categoriaId);
  };

  // Buscar categorias do produto
  const fetchCategorias = async () => {
    if (!produtoId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/categorias-complementos/${produtoId}`);
      
      if (response.success) {
        setCategorias(response.data);
        console.log('✅ Categorias carregadas:', response.data.length);
        
        // Buscar complementos para cada categoria
        for (const categoria of response.data) {
          await fetchComplementosCategoria(categoria.id);
        }
      } else {
        throw new Error(response.message || 'Erro ao carregar categorias');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      setError(error.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, [produtoId]);

  // Escutar eventos de atualização de complementos
  useEffect(() => {
    const handleComplementosAtualizados = (event) => {
      const { categoriaId } = event.detail;
      if (categoriaId) {
        recarregarComplementosCategoria(categoriaId);
      }
    };

    const handleCategoriasAtualizadas = () => {
      // Recarregar todas as categorias e seus complementos
      fetchCategorias();
    };

    window.addEventListener('complementosAtualizados', handleComplementosAtualizados);
    window.addEventListener('categoriasAtualizadas', handleCategoriasAtualizadas);
    
    return () => {
      window.removeEventListener('complementosAtualizados', handleComplementosAtualizados);
      window.removeEventListener('categoriasAtualizadas', handleCategoriasAtualizadas);
    };
  }, []);

  // Função para iniciar edição
  const handleEdit = (categoria) => {
    setEditingCategoria(categoria.id);
    setEditData(prev => ({
      ...prev,
      [categoria.id]: {
        nome: categoria.nome,
        quantidadeMinima: categoria.quantidade_minima || '',
        quantidadeMaxima: categoria.quantidade_maxima || '',
        preenchimentoObrigatorio: categoria.preenchimento_obrigatorio || false
      }
    }));
  };

  // Função para salvar edição
  const handleSaveEdit = async (categoriaId) => {
    try {
      const dadosCategoria = editData[categoriaId];
      if (!dadosCategoria) {
        console.error('Dados de edição não encontrados para categoria:', categoriaId);
        return;
      }

      const response = await api.put(`/categorias-complementos/${categoriaId}`, {
        nome: dadosCategoria.nome,
        quantidade_minima: dadosCategoria.quantidadeMinima,
        quantidade_maxima: dadosCategoria.quantidadeMaxima,
        preenchimento_obrigatorio: dadosCategoria.preenchimentoObrigatorio
      });

      if (response.success) {
        // Atualizar a lista local
        setCategorias(prev => prev.map(cat => 
          cat.id === categoriaId 
            ? { ...cat, ...response.data }
            : cat
        ));
        
        setEditingCategoria(null);
        // Remover apenas os dados de edição desta categoria específica
        setEditData(prev => {
          const newData = { ...prev };
          delete newData[categoriaId];
          return newData;
        });
        
        if (onCategoriaEdit) {
          onCategoriaEdit(response.data);
        }
        
        console.log('✅ Categoria editada:', response.data);
      }
    } catch (error) {
      console.error('❌ Erro ao editar categoria:', error);
      setError('Erro ao editar categoria: ' + error.message);
    }
  };

  // Função para cancelar edição
  const handleCancelEdit = (categoriaId) => {
    setEditingCategoria(null);
    // Remover apenas os dados de edição desta categoria específica
    setEditData(prev => {
      const newData = { ...prev };
      delete newData[categoriaId];
      return newData;
    });
  };

  // Função para deletar categoria
  const handleDelete = async (categoria) => {
    try {
      setDeleting(true);
      const response = await api.delete(`/categorias-complementos/${categoria.id}`);
      
      if (response.success) {
        // Remover categoria da lista local
        setCategorias(prev => prev.filter(cat => cat.id !== categoria.id));
        
        // Remover dados de edição desta categoria
        setEditData(prev => {
          const newData = { ...prev };
          delete newData[categoria.id];
          return newData;
        });
        
        // Fechar modal
        setDeleteModal({ isOpen: false, categoria: null });
        
        // Chamar callback para notificação
        if (onCategoriaDelete) {
          onCategoriaDelete(categoria);
        }
        
        console.log('✅ Categoria deletada:', categoria.nome);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar categoria:', error);
      setError('Erro ao deletar categoria: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteComplemento = async (itemComplemento) => {
    try {
      const response = await api.delete(`/itens-complementos/${itemComplemento.id}`);
      
      if (response.success) {
        // Remover complemento da listagem local
        setComplementosPorCategoria(prev => ({
          ...prev,
          [itemComplemento.categoria_id]: prev[itemComplemento.categoria_id]?.filter(
            item => item.id !== itemComplemento.id
          ) || []
        }));
        
        console.log('✅ Complemento removido da categoria:', itemComplemento.complemento_nome);
      }
    } catch (error) {
      console.error('❌ Erro ao remover complemento da categoria:', error);
      setError('Erro ao remover complemento: ' + error.message);
    }
  };

  // Função para atualizar dados de edição
  const updateEditData = (field, value, categoriaId) => {
    // Buscar a categoria atual para obter os valores base
    const categoriaAtual = categorias.find(cat => cat.id === categoriaId);
    
    // Se não há dados de edição para esta categoria, inicializar com dados da categoria
    if (!editData[categoriaId]) {
      editData[categoriaId] = {
        nome: categoriaAtual?.nome || '',
        quantidadeMinima: categoriaAtual?.quantidade_minima || '',
        quantidadeMaxima: categoriaAtual?.quantidade_maxima || '',
        preenchimentoObrigatorio: categoriaAtual?.preenchimento_obrigatorio || false
      };
    }
    
    // Atualizar apenas o campo específico para esta categoria
    const newEditData = {
      ...editData,
      [categoriaId]: {
        ...editData[categoriaId],
        [field]: value
      }
    };
    
    setEditData(newEditData);
    
    // Notificar o componente pai sobre mudanças
    if (onCategoriaEdit) {
      onCategoriaEdit(categoriaId, newEditData[categoriaId]);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 mb-4">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Carregando categorias...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 mb-4">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <Plus className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar categorias</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCategorias}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (categorias.length === 0) {
    return null; // Não mostra nada se não há categorias
  }

  return (
    <div className="space-y-3">
      {categorias.map((categoria) => (
        <div key={categoria.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
          {/* Header do card */}
          <div className="flex items-center justify-end mb-2">
            <DeleteButton 
              onClick={() => setDeleteModal({ isOpen: true, categoria })}
              size="sm"
              variant="outline"
              title="Excluir categoria"
            />
          </div>

          {/* Conteúdo do card */}
          <div className="space-y-2">
            {/* Nome da categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Categoria
              </label>
              <input
                type="text"
                value={editData[categoria.id]?.nome !== undefined ? editData[categoria.id].nome : categoria.nome}
                onChange={(e) => updateEditData('nome', e.target.value, categoria.id)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Bebidas, Acompanhamentos, Sobremesas"
              />
            </div>

            {/* Grid para quantidade mínima e máxima */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantidade Mínima
                </label>
                <input
                  type="number"
                  min="0"
                  value={editData[categoria.id]?.quantidadeMinima !== undefined ? editData[categoria.id].quantidadeMinima : (categoria.quantidade_minima || '')}
                  onChange={(e) => updateEditData('quantidadeMinima', e.target.value, categoria.id)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantidade Máxima
                </label>
                <input
                  type="number"
                  min="1"
                  value={editData[categoria.id]?.quantidadeMaxima !== undefined ? editData[categoria.id].quantidadeMaxima : (categoria.quantidade_maxima || '')}
                  onChange={(e) => updateEditData('quantidadeMaxima', e.target.value, categoria.id)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Checkbox para preenchimento obrigatório */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`preenchimento-${categoria.id}`}
                checked={editData[categoria.id]?.preenchimentoObrigatorio !== undefined ? editData[categoria.id].preenchimentoObrigatorio : categoria.preenchimento_obrigatorio}
                onChange={(e) => updateEditData('preenchimentoObrigatorio', e.target.checked, categoria.id)}
                className="h-4 w-4 appearance-none rounded-full border-2 border-blue-500 checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
              />
              <label htmlFor={`preenchimento-${categoria.id}`} className="ml-2 text-xs font-medium text-gray-700">
                Preenchimento Obrigatório
              </label>
            </div>

            {/* Listagem de complementos da categoria */}
                    {complementosPorCategoria[categoria.id] && complementosPorCategoria[categoria.id].length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              {complementosPorCategoria[categoria.id].map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <span className="text-sm font-light text-gray-700 tracking-wide">{item.complemento_nome}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-light text-gray-500 tracking-wide">
                      R$ {parseFloat(item.complemento_valor).toFixed(2).replace('.', ',')}
                    </span>
                    <DeleteButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteComplemento(item)}
                      title="Remover complemento da categoria"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

            {/* Botão Adicionar Complemento */}
            <div className="pt-3 border-t border-gray-200">
              <AddButton
                text="Adicionar Complemento"
                color="blue"
                onClick={() => onAdicionarComplemento(categoria)}
                className="w-full justify-center h-10 text-xs font-medium py-2 whitespace-nowrap"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Modal de confirmação de exclusão */}
      <ConfirmDelete
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, categoria: null })}
        onConfirm={() => handleDelete(deleteModal.categoria)}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${deleteModal.categoria?.nome}"? Esta ação não pode ser desfeita.`}
        isLoading={deleting}
      />
    </div>
  );
};

export default ListCategoryComplements;
