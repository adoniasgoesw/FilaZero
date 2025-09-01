import React from 'react';
import { Truck } from 'lucide-react';

function Delivery() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com ícone e título */}
      <div className="pt-6 px-4 md:px-6">
        <div className="flex items-center gap-4">
          {/* Ícone da página */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <Truck size={24} />
          </div>
          
          {/* Título da página */}
          <h1 className="text-3xl font-bold text-gray-800">Delivery</h1>
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className="px-4 md:px-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <p className="text-gray-600">Configurações de delivery serão exibidas aqui...</p>
        </div>
      </div>
    </div>
  );
}

export default Delivery;
