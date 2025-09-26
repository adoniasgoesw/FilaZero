import React, { useState } from 'react';
import { Settings, Users, CreditCard, Tag, Box, FileText, MapPin, Truck, BarChart3, Calculator, Cog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/cards/Profile';
import Base from '../components/cards/Base';
import DevelopmentDialog from '../components/elements/DevelopmentDialog';

function Config() {
  const navigate = useNavigate();
  const [showDevelopmentDialog, setShowDevelopmentDialog] = useState(false);
  const [developmentTitle, setDevelopmentTitle] = useState('');
  const [developmentMessage, setDevelopmentMessage] = useState('');

  const handleDevelopmentClick = (title, message) => {
    setDevelopmentTitle(title);
    setDevelopmentMessage(message);
    setShowDevelopmentDialog(true);
  };


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
              onClick={() => handleDevelopmentClick('Cardápio Digital em Desenvolvimento', 'A funcionalidade de cardápio digital está sendo desenvolvida e permitirá criar menus online interativos para seus clientes.')}
            />
            <Base 
              icon={MapPin}
              title="Área de Entrega"
              description="Zonas de entrega"
              iconColor="cyan"
              onClick={() => handleDevelopmentClick('Área de Entrega em Desenvolvimento', 'A gestão de áreas de entrega está sendo desenvolvida e permitirá configurar zonas de entrega, valores de frete e horários de funcionamento.')}
            />
            <Base 
              icon={Truck}
              title="Entregadores"
              description="Gerenciar entregadores"
              iconColor="amber"
              onClick={() => handleDevelopmentClick('Entregadores em Desenvolvimento', 'A gestão de entregadores está sendo desenvolvida e permitirá cadastrar, gerenciar e acompanhar a performance dos entregadores.')}
            />
            <Base 
              icon={Cog}
              title="Configurações"
              description="Configurar delivery"
              iconColor="slate"
              onClick={() => handleDevelopmentClick('Configurações de Delivery em Desenvolvimento', 'As configurações específicas de delivery estão sendo desenvolvidas e incluirão taxas, horários e regras de entrega.')}
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
              onClick={() => handleDevelopmentClick('Painel Administrativo em Desenvolvimento', 'O painel administrativo está sendo desenvolvido e incluirá dashboards avançados, relatórios detalhados e métricas de performance do negócio.')}
            />
            <Base 
              icon={Calculator}
              title="Caixa"
              description="Controle financeiro"
              iconColor="emerald"
              onClick={() => navigate('/administracao/caixas')}
            />
            <div></div> {/* Espaçador para manter o grid de 5 colunas */}
            <div></div> {/* Espaçador para manter o grid de 5 colunas */}
            <div></div> {/* Espaçador para manter o grid de 5 colunas */}
          </div>
        </div>

      </div>

      {/* Diálogo de desenvolvimento */}
      <DevelopmentDialog
        isOpen={showDevelopmentDialog}
        onClose={() => setShowDevelopmentDialog(false)}
        title={developmentTitle}
        message={developmentMessage}
      />

    </div>
  );
}

export default Config;