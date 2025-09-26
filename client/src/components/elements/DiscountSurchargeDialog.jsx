import React, { useState } from 'react';
import { Percent, DollarSign, X } from 'lucide-react';

const DiscountSurchargeDialog = ({ 
  isOpen, 
  onClose, 
  onApply, 
  type = 'discount', // 'discount' ou 'surcharge'
  currentValue = 0, // Valor atual do desconto/acréscimo
  currentIsPercentage = false, // Se o valor atual é em porcentagem
  isLoading = false 
}) => {
  const [value, setValue] = useState('');
  const [isPercentage, setIsPercentage] = useState(false);

  const handleApply = () => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
      alert('Por favor, insira um valor válido');
      return;
    }
    onApply(numericValue, isPercentage);
  };

  const handleClose = () => {
    setValue('');
    setIsPercentage(false);
    onClose();
  };

  // Quando o dialog abre, preencher com o valor e tipo atuais
  React.useEffect(() => {
    if (isOpen) {
      if (currentValue > 0) {
        setValue(currentValue.toString());
        setIsPercentage(currentIsPercentage);
      } else {
        setValue('0');
        setIsPercentage(false);
      }
    }
  }, [isOpen, currentValue, currentIsPercentage]);

  const isDiscount = type === 'discount';
  const title = isDiscount ? 'Desconto' : 'Acréscimo';
  const icon = isDiscount ? Percent : DollarSign;
  const iconColor = isDiscount ? 'text-green-600' : 'text-amber-600';
  const iconBg = isDiscount ? 'bg-green-100' : 'bg-amber-100';
  const buttonColor = isDiscount ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600';

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] bg-black/40" onClick={handleClose} />

      {/* Dialog */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
                <span className={iconColor}>
                  {React.createElement(icon, { className: "w-5 h-5" })}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500">
                  {isPercentage ? 'Valor em porcentagem' : 'Valor em reais'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Tipo de valor - botões simplificados */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo de valor</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPercentage(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    !isPercentage
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-medium">Reais</span>
                </button>
                <button
                  onClick={() => setIsPercentage(true)}
                  className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    isPercentage
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  <span className="text-sm font-medium">Porcentagem</span>
                </button>
              </div>
            </div>

            {/* Input de valor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {isDiscount ? 'Valor do desconto' : 'Valor do acréscimo'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder={isPercentage ? "Ex: 10" : "Ex: 5.50"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                  {isPercentage ? '%' : 'R$'}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Digite 0 para remover o {isDiscount ? 'desconto' : 'acréscimo'}
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={isLoading || !value || isNaN(parseFloat(value)) || parseFloat(value) < 0}
              className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50 ${buttonColor}`}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscountSurchargeDialog;