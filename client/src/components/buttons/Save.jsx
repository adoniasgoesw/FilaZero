import React from 'react';
import { Save } from 'lucide-react';

const SaveButton = ({ onClick, className = "", disabled = false, type = "button", iconOnly = false }) => {
  if (iconOnly) {
    // Versão apenas com ícone (para página Categorias)
    return (
      <button
        type={type}
        onClick={type === "submit" ? undefined : onClick}
        disabled={disabled}
        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white ${className}`}
        title="Salvar"
      >
        <Save size={20} />
      </button>
    );
  }

  // Versão padrão (texto "Salvar" sem ícone)
  return (
    <button
      type={type}
      onClick={type === "submit" ? undefined : onClick}
      disabled={disabled}
      className={`w-full px-8 py-3 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-medium ${className}`}
    >
      Salvar
    </button>
  );
};

export default SaveButton;
