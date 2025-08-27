import React from 'react';
import { Menu, Truck, MapPin, Settings } from 'lucide-react';

const DeliveryCards = () => {
  const cards = [
    {
      id: 'cardapio-digital',
      title: 'Cardápio Digital',
      description: 'Menu online e pedidos',
      icon: Menu,
      gradient: 'from-orange-300 to-orange-400',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-600',
      badgeValue: '85 pratos'
    },
    {
      id: 'entregadores',
      title: 'Entregadores',
      description: 'Gestão de delivery',
      icon: Truck,
      gradient: 'from-sky-300 to-sky-400',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-600',
      badgeValue: '12 ativos'
    },
    {
      id: 'mapa-entrega',
      title: 'Mapa Entrega',
      description: 'Rotas e localização',
      icon: MapPin,
      gradient: 'from-lime-300 to-lime-400',
      badgeBg: 'bg-lime-50',
      badgeText: 'text-lime-600',
      badgeValue: '8 rotas'
    },
    {
      id: 'configuracoes',
      title: 'Configurações',
      description: 'Sistema e preferências',
      icon: Settings,
      gradient: 'from-slate-300 to-slate-400',
      badgeBg: 'bg-slate-50',
      badgeText: 'text-slate-600',
      badgeValue: '25 opções'
    }
  ];

  const handleCardClick = (section) => {
    const messages = {
      'cardapio-digital': 'Carregando cardápio digital...',
      'entregadores': 'Gerenciando equipe de entregadores...',
      'mapa-entrega': 'Abrindo mapa de entregas...',
      'configuracoes': 'Acessando configurações do sistema...'
    };
    
    console.log(`Navegando para: ${section}`);
    // Aqui você pode adicionar a navegação real
    // navigate(`/delivery/${section}`);
  };

  return (
    <div className="w-full">
      {/* Grid responsivo: 2 colunas no mobile, 3 no tablet, 5 no desktop pequeno, 6 no desktop grande, máximo 7 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 max-w-7xl mx-auto">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div 
              key={card.id} 
              className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 w-full h-40 sm:h-44 md:h-48 card-hover cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 hover:scale-105"
              onClick={() => handleCardClick(card.id)}
            >
              <div className="flex flex-col items-center text-center h-full justify-between">
                {/* Ícone com gradiente */}
                <div className={`icon-container w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${card.gradient} transition-all duration-300 hover:rotate-2 hover:scale-110`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                
                {/* Título e descrição */}
                <div>
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-500 leading-tight">{card.description}</p>
                </div>
                
                {/* Badge com status */}
                <div className={`${card.badgeBg} rounded-md px-2 py-1`}>
                  <span className={`${card.badgeText} font-medium text-xs`}>{card.badgeValue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryCards;
