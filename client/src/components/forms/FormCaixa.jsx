import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react'; // Icon for modal title


const FormCaixa = () => {
  const [formData, setFormData] = useState({
    valorAbertura: '',
    valorTotal: '',
    cedulas: {
      '200': 0,
      '100': 0,
      '50': 0,
      '20': 0,
      '10': 0,
      '5': 0,
      '2': 0,
      '1': 0
    },
    moedas: {
      '1.00': 0,
      '0.50': 0,
      '0.25': 0,
      '0.10': 0,
      '0.05': 0,
      '0.01': 0
    }
  });

  // Calcular valor total automaticamente
  useEffect(() => {
    let total = parseFloat(formData.valorAbertura) || 0;
    
    // Soma das cédulas
    Object.entries(formData.cedulas).forEach(([valor, quantidade]) => {
      total += parseFloat(valor) * quantidade;
    });
    
    // Soma das moedas
    Object.entries(formData.moedas).forEach(([valor, quantidade]) => {
      total += parseFloat(valor) * quantidade;
    });
    
    setFormData(prev => ({
      ...prev,
      valorTotal: total.toFixed(2)
    }));
  }, [formData.valorAbertura, formData.cedulas, formData.moedas]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCedulaChange = (valor, quantidade) => {
    setFormData(prev => ({
      ...prev,
      cedulas: {
        ...prev.cedulas,
        [valor]: parseInt(quantidade) || 0
      }
    }));
  };

  const handleMoedaChange = (valor, quantidade) => {
    setFormData(prev => ({
      ...prev,
      moedas: {
        ...prev.moedas,
        [valor]: parseInt(quantidade) || 0
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.valorAbertura || parseFloat(formData.valorAbertura) <= 0) {
      alert('Valor de abertura é obrigatório e deve ser maior que zero!');
      return;
    }
    // Disparar evento para o BaseModal fechar
    window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: formData }));
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form">
      {/* Conteúdo do formulário */}
      <div className="flex-1 space-y-6">
        {/* Valores principais */}
        <div className="grid grid-cols-2 gap-4">
          {/* Valor de Abertura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor de Abertura <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.valorAbertura}
              onChange={(e) => handleInputChange('valorAbertura', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="R$ 0,00"
            />
          </div>

          {/* Valor Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Total
            </label>
            <input
              type="text"
              value={`R$ ${formData.valorTotal}`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">Calculado automaticamente</p>
          </div>
        </div>

        {/* Cédulas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Cédulas
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(formData.cedulas).map(([valor, quantidade]) => (
              <div key={valor} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  R$ {valor},00
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantidade}
                  onChange={(e) => handleCedulaChange(valor, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500">
                  Total: R$ {(parseFloat(valor) * quantidade).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Moedas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Moedas
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(formData.moedas).map(([valor, quantidade]) => (
              <div key={valor} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  R$ {valor}
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantidade}
                  onChange={(e) => handleMoedaChange(valor, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500">
                  Total: R$ {(parseFloat(valor) * quantidade).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>


    </form>
  );
};

export default FormCaixa;

