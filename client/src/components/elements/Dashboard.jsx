import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-3d bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Dashboard FilaZero</h3>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl text-white">
          <div className="text-2xl font-bold">127</div>
          <div className="text-sm opacity-80">Pedidos Hoje</div>
        </div>
        <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-4 rounded-xl text-white">
          <div className="text-2xl font-bold">R$ 2.847</div>
          <div className="text-sm opacity-80">Faturamento</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700 mb-3">Pedidos em Andamento</h4>

        <div className="order-item bg-gray-50 p-3 rounded-lg border-l-4 border-amber-500">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-800">#001 - Pizza Margherita</div>
              <div className="text-sm text-gray-500">Mesa 5 • 15:30</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">R$ 32,90</div>
              <div className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Preparando</div>
            </div>
          </div>
        </div>

        <div className="order-item bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-800">#002 - Hambúrguer Especial</div>
              <div className="text-sm text-gray-500">Delivery • 15:45</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">R$ 28,50</div>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Novo</div>
            </div>
          </div>
        </div>

        <div className="order-item bg-gray-50 p-3 rounded-lg border-l-4 border-emerald-500">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-800">#003 - Açaí Completo</div>
              <div className="text-sm text-gray-500">Balcão • 16:00</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-800">R$ 15,90</div>
              <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Pronto</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


