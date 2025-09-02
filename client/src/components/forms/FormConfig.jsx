import React, { useState } from 'react';
import { Settings } from 'lucide-react';


const FormConfig = () => {
  const [formData, setFormData] = useState({
    mesasEnabled: true,
    comandosEnabled: true,
    quantidadeMesas: 10,
    quantidadeComandos: 5,
    prefixoComando: 'CMD'
  });

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Conteúdo do formulário */}
      <div className="flex-1 space-y-8">
        {/* Configuração de Mesas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Configuração de Mesas
          </h3>
          
          <div className="space-y-4">
            {/* Habilitar Mesas */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Habilitar Mesas
              </label>
              <button
                type="button"
                onClick={() => handleToggle('mesasEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.mesasEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.mesasEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Quantidade de Mesas */}
            {formData.mesasEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade de Mesas
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantidadeMesas}
                  onChange={(e) => handleInputChange('quantidadeMesas', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Configuração de Comandos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            Configuração de Comandos
          </h3>
          
          <div className="space-y-4">
            {/* Habilitar Comandos */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Habilitar Comandos
              </label>
              <button
                type="button"
                onClick={() => handleToggle('comandosEnabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.comandosEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.comandosEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Configurações de Comandos */}
            {formData.comandosEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade de Comandos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantidadeComandos}
                    onChange={(e) => handleInputChange('quantidadeComandos', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prefixo de Comando
                  </label>
                  <input
                    type="text"
                    value={formData.prefixoComando}
                    onChange={(e) => handleInputChange('prefixoComando', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: CMD"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


    </form>
  );
};

export default FormConfig;
