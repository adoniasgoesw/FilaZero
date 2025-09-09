import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import AddButton from '../buttons/Add';

const FormCategoriaComplemento = ({ onClose, onDataChange, onAdicionarComplemento, categoria = null, complementosTemporarios = [] }) => {
  const [formData, setFormData] = useState({
    nome: '',
    quantidadeMinima: '',
    quantidadeMaxima: '',
    preenchimentoObrigatorio: false
  });
  
  const [complementosLocais, setComplementosLocais] = useState(complementosTemporarios);

  // Sincronizar complementos locais com props
  useEffect(() => {
    setComplementosLocais(complementosTemporarios);
  }, [complementosTemporarios]);

  // Escutar eventos de atualização de complementos temporários
  useEffect(() => {
    const handleComplementosTemporariosAtualizados = (event) => {
      // Atualizar complementos locais com todos os complementos temporários
      const todosComplementos = event.detail.complementosTemporarios || [];
      setComplementosLocais(todosComplementos);
    };

    window.addEventListener('complementosTemporariosAtualizados', handleComplementosTemporariosAtualizados);
    
    return () => {
      window.removeEventListener('complementosTemporariosAtualizados', handleComplementosTemporariosAtualizados);
    };
  }, []);

  const handleInputChange = (field, value) => {
    const newData = {
      ...formData,
      [field]: value
    };
    setFormData(newData);
    
    // Notificar o componente pai sobre mudanças
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const handleCheckboxChange = (field) => {
    const newData = {
      ...formData,
      [field]: !formData[field]
    };
    setFormData(newData);
    
    // Notificar o componente pai sobre mudanças
    if (onDataChange) {
      onDataChange(newData);
    }
  };



  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
      {/* Header do card - mais compacto */}
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Formulário */}
      <div className="space-y-2">
        {/* Nome da categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Categoria <span className="text-red-500">*</span>
          </label>
                      <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Bebidas, Acompanhamentos, Sobremesas"
            />
        </div>

        {/* Grid para quantidade mínima e máxima */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Quantidade Mínima <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.quantidadeMinima}
              onChange={(e) => handleInputChange('quantidadeMinima', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Quantidade Máxima <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantidadeMaxima}
              onChange={(e) => handleInputChange('quantidadeMaxima', e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
              required
            />
          </div>
        </div>

        {/* Checkbox para preenchimento obrigatório */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="preenchimentoObrigatorio"
            checked={formData.preenchimentoObrigatorio}
            onChange={() => handleCheckboxChange('preenchimentoObrigatorio')}
            className="h-4 w-4 appearance-none rounded-full border-2 border-blue-500 checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
          />
          <label htmlFor="preenchimentoObrigatorio" className="ml-2 text-xs font-medium text-gray-700">
            Preenchimento Obrigatório
          </label>
        </div>

        {/* Listagem de complementos temporários */}
        {(() => {
          const complementosFiltrados = complementosLocais.filter(comp => {
            // Se a categoria tem ID, é uma categoria existente
            if (categoria?.id) {
              return comp.categoria_temporaria?.id === categoria.id;
            }
            // Se não tem ID, é uma categoria em criação - comparar por nome
            return comp.categoria_temporaria?.nome === formData.nome || 
                   comp.categoria_temporaria?.nome === categoria?.nome;
          });
          
          return complementosFiltrados.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                {complementosFiltrados.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <span className="text-sm font-light text-gray-700 tracking-wide">{item.complemento_nome}</span>
                    <span className="text-sm font-light text-gray-500 tracking-wide">
                      R$ {parseFloat(item.complemento_valor).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

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
  );
};

export default FormCategoriaComplemento;
