import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Users, CreditCard, Tag, Package } from 'lucide-react';

const GestaoCards = () => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'usuarios',
      title: 'Usuários',
      description: 'Gerencie contas e permissões',
      icon: UserCheck,
      gradient: 'from-indigo-300 to-indigo-400',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-600',
      badgeValue: '127 ativos',
      route: '/gestao/usuarios'
    },
    {
      id: 'clientes',
      title: 'Clientes',
      description: 'Cadastro e histórico',
      icon: Users,
      gradient: 'from-teal-300 to-teal-400',
      badgeBg: 'bg-green-50',
      badgeText: 'text-green-600',
      badgeValue: '2.543 cadastrados',
      route: '/gestao/clientes'
    },
    {
      id: 'pagamentos',
      title: 'Pagamentos',
      description: 'Métodos de pagamento',
      icon: CreditCard,
      gradient: 'from-pink-300 to-pink-400',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-600',
      badgeValue: '8 métodos',
      route: '/gestao/pagamentos'
    },
    {
      id: 'categorias',
      title: 'Categorias',
      description: 'Organize produtos',
      icon: Tag,
      gradient: 'from-cyan-300 to-cyan-400',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-600',
      badgeValue: '24 categorias',
      route: '/gestao/categorias'
    },
    {
      id: 'produtos',
      title: 'Produtos',
      description: 'Catálogo e estoque',
      icon: Package,
      gradient: 'from-purple-300 to-purple-400',
      badgeBg: 'bg-red-50',
      badgeText: 'text-red-600',
      badgeValue: '1.892 itens',
      route: '/gestao/produtos'
    }
  ];

  const handleCardClick = (section, route) => {
    console.log(`Navegando para: ${section}`);
    console.log(`Rota: ${route}`);
    
    // Navegar para a página correspondente
    navigate(route);
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
              onClick={() => handleCardClick(card.id, card.route)}
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
                
                {/* Badge com estatística */}
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

export default GestaoCards;
