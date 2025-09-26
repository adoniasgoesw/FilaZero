import React from 'react';
import Dashboard from './Dashboard';

const DesktopMoldura = () => {
  return (
    <div className="relative perspective-1000">
      {/* Moldura do computador/tablet */}
      <div className="relative transform rotate-y-12 rotate-x-6 hover:rotate-y-6 hover:rotate-x-3 transition-transform duration-700 ease-out scale-80 sm:scale-85 md:scale-90 lg:scale-100">
        {/* Tela do computador */}
        <div className="bg-gray-800 rounded-2xl p-2 sm:p-3 md:p-4 shadow-2xl">
          {/* Barra superior do computador */}
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <div className="flex space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-white text-xs sm:text-sm font-medium hidden sm:block">FilaZero - Ponto de Atendimento</div>
            <div className="text-white text-xs sm:text-sm">
              {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          <div className="bg-white rounded-lg overflow-hidden h-[380px] sm:h-[400px] md:h-[420px] lg:h-[420px]">
            <Dashboard />
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-blue-500/20 rounded-full animate-bounce" />
        <div className="absolute -bottom-1 sm:-bottom-2 -left-1 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 bg-green-500/20 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default DesktopMoldura;
