import React from 'react';
import { Settings, Users, CreditCard, Tag, Box, FileText, MapPin, Truck, Cog, BarChart3, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/cards/Profile';
import Base from '../components/cards/Base';

function Config() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com ícone e título */}
      <div className="pt-6 px-4 md:px-6">
        <div className="flex items-center gap-4">
          {/* Ícone da página */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <Settings size={24} />
          </div>
          
          {/* Título da página */}
          <h1 className="text-3xl font-bold text-gray-800">Ajuste</h1>
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className="px-4 md:px-6 mt-8 space-y-8">
        {/* Sessão: Perfil */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Perfil</h2>
          <Profile />
        </div>

        {/* Sessão: Gestão */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestão</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Base 
              icon={Users}
              title="Clientes"
              description="Gerenciar clientes"
              iconColor="green"
              onClick={() => navigate('/gestao/clientes')}
            />
            <Base 
              icon={CreditCard}
              title="Pagamentos"
              description="Formas de pagamento"
              iconColor="purple"
              onClick={() => navigate('/gestao/pagamentos')}
            />
            <Base 
              icon={Users}
              title="Usuários"
              description="Gerenciar usuários"
              iconColor="indigo"
              onClick={() => navigate('/gestao/usuarios')}
            />
            <Base 
              icon={Tag}
              title="Categorias"
              description="Organizar produtos"
              iconColor="orange"
              onClick={() => navigate('/gestao/categorias')}
            />
            <Base 
              icon={Box}
              title="Produtos"
              description="Gerenciar produtos"
              iconColor="red"
              onClick={() => navigate('/gestao/produtos')}
            />
          </div>
        </div>

        {/* Sessão: Delivery */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Base 
              icon={FileText}
              title="Cardápio Digital"
              description="Menu online"
              iconColor="teal"
              onClick={() => console.log('Cardápio Digital')}
            />
            <Base 
              icon={MapPin}
              title="Área de Entrega"
              description="Zonas de entrega"
              iconColor="cyan"
              onClick={() => console.log('Área de Entrega')}
            />
            <Base 
              icon={Truck}
              title="Entregadores"
              description="Gerenciar entregadores"
              iconColor="amber"
              onClick={() => console.log('Entregadores')}
            />
            <Base 
              icon={Cog}
              title="Configurações"
              description="Configurar delivery"
              iconColor="slate"
              onClick={() => console.log('Configurações Delivery')}
            />
            <div></div> {/* Espaçador para manter o grid de 5 colunas */}
          </div>
        </div>

        {/* Sessão: Administração */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Administração</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Base 
              icon={BarChart3}
              title="Painel Administrativo"
              description="Dashboard de controle"
              iconColor="violet"
              onClick={() => console.log('Painel Administrativo')}
            />
            <Base 
              icon={Calculator}
              title="Caixa"
              description="Controle financeiro"
              iconColor="emerald"
              onClick={() => console.log('Caixa')}
            />
            <div></div> {/* Espaçador para manter o grid de 5 colunas */}
            <div></div> {/* Espaçador para manter o grid de 5 colunas */}
            <div></div> {/* Espaçador para manter o grid de 5 colunas */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Config;
