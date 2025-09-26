import React, { useState, useEffect } from 'react';
import { ChefHat, Search, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import SearchBar from '../components/layout/SeachBar';
import DevelopmentDialog from '../components/elements/DevelopmentDialog';

const Cozinha = () => {
  const [search, setSearch] = useState('');
  const [showDevelopmentDialog, setShowDevelopmentDialog] = useState(false);

  useEffect(() => {
    // Mostrar o diálogo de desenvolvimento automaticamente
    setShowDevelopmentDialog(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com barra de pesquisa */}
      <div className="bg-white sticky top-0 z-40">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <SearchBar 
              placeholder="Pesquisar pedidos..."
              value={search}
              onChange={setSearch}
            />
          </div>
        </div>
      </div>

      {/* Título com ícone */}
      <div className="px-4 md:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shadow-sm">
            <ChefHat className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cozinha</h1>
            <p className="text-sm text-gray-500">Controle de pedidos e preparação</p>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Em Preparo</span>
            </div>
            <div className="text-2xl font-bold text-orange-800">0</div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Prontos</span>
            </div>
            <div className="text-2xl font-bold text-green-800">0</div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total Hoje</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">0</div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Área da Cozinha</h3>
          <p className="text-gray-500">
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          </p>
        </div>
      </div>

      {/* Diálogo de desenvolvimento */}
      <DevelopmentDialog
        isOpen={showDevelopmentDialog}
        onClose={() => setShowDevelopmentDialog(false)}
        title="Área da Cozinha em Desenvolvimento"
        message="A funcionalidade da cozinha está sendo desenvolvida e incluirá controle de pedidos em tempo real, gestão de preparação, notificações automáticas e muito mais."
      />
    </div>
  );
};

export default Cozinha;