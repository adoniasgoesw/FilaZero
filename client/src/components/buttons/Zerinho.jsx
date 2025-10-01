import React from 'react';
import { Bot } from 'lucide-react';

const ZerinhoButton = ({ onClick, isOpen = false }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-gray-900 hover:bg-gray-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
      aria-label="Abrir chat com Zerinho"
    >
      <div className="relative">
        {/* Ícone do Zerinho - robô virtual */}
        <Bot className="w-6 h-6" />
        {/* Indicador de notificação */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
      </div>
    </button>
  );
};

export default ZerinhoButton;
