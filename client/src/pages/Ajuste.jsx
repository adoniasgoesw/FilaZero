import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import ProfileCard from '../components/cards/ProfileCard';
import GestaoCards from '../components/cards/GestaoCards';
import AdministracaoCards from '../components/cards/AdministracaoCards';
import DeliveryCards from '../components/cards/DeliveryCards';
import { Settings as SettingsIcon } from 'lucide-react';

const Ajuste = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:ml-20 p-6">
        {/* Header com ícone e título */}
        <div className="flex items-center w-full mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <SettingsIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 ml-4">Ajuste</h1>
        </div>

        {/* Cards organizados verticalmente no canto esquerdo */}
        <div className="space-y-6 max-w-6xl mb-20 sm:mb-24 md:mb-32 lg:mb-20">
          {/* Card de Perfil */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Perfil</h3>
            <ProfileCard />
          </div>

          {/* Cards de Gestão */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Gestão</h3>
            <GestaoCards />
          </div>

          {/* Cards de Administração */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Administração</h3>
            <AdministracaoCards />
          </div>

          {/* Cards de Delivery */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Delivery</h3>
            <DeliveryCards />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ajuste;
