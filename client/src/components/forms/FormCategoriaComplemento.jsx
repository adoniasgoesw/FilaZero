import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import AddButton from '../buttons/Add';
import ValidationNotification from '../elements/ValidationNotification';
import { useFormValidation } from '../../hooks/useFormValidation';

const FormCategoriaComplemento = ({ onClose, onDataChange, onAdicionarComplemento, categoria = null, complementosTemporarios = [] }) => {
  const [formData, setFormData] = useState({
    nome: '',
    quantidadeMinima: '',
    quantidadeMaxima: '',
    preenchimentoObrigatorio: false
  });
  
  const [complementosLocais, setComplementosLocais] = useState(complementosTemporarios);

  // Hook de validação
  const {
    errors,
    showNotification,
    clearError,
    getFieldError,
    setShowNotification
  } = useFormValidation();

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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 sm:p-3 mb-3">
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
            Nome da Categoria
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => {
              handleInputChange('nome', e.target.value);
              clearError('nome');
            }}
            className={`w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              getFieldError('nome') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Bebidas, Acompanhamentos, Sobremesas"
          />
          {getFieldError('nome') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('nome')}</p>
          )}
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
              value={formData.quantidadeMinima}
              onChange={(e) => {
                handleInputChange('quantidadeMinima', e.target.value);
                clearError('quantidadeMinima');
              }}
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
              value={formData.quantidadeMaxima}
              onChange={(e) => {
                handleInputChange('quantidadeMaxima', e.target.value);
                clearError('quantidadeMaxima');
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
            />
          </div>
        </div>

        {/* Checkbox para preenchimento obrigatório */}
        <div className="flex items-center">
          <div className="relative">
            <input
              type="checkbox"
              id="preenchimentoObrigatorio"
              checked={formData.preenchimentoObrigatorio}
              onChange={() => handleCheckboxChange('preenchimentoObrigatorio')}
              className="h-5 w-5 appearance-none rounded-lg border-2 border-gray-300 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-blue-200"
            />
            {formData.preenchimentoObrigatorio && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
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

      {/* Notificação de Validação */}
      <ValidationNotification
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        errors={errors}
        title="Campos obrigatórios não preenchidos"
      />
    </div>
  );
};

export default FormCategoriaComplemento;
