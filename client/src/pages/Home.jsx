import React, { useState } from 'react';
import { Home as HomeIcon, Settings } from 'lucide-react';
import SearchBar from '../components/layout/SeachBar';
import ConfigButton from '../components/buttons/Config';
import BaseModal from '../components/modals/Base';
import FormConfig from '../components/forms/FormConfig';

function Home() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const handleConfigSave = (data) => {
    console.log('Configurações salvas:', data);
    setIsConfigModalOpen(false);
  };

  const handleConfigCancel = () => {
    setIsConfigModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com ícone, barra de pesquisa e botão de configuração */}
      <div className="pt-6 px-4 md:px-6">
        <div className="flex items-center gap-3 w-full">
          {/* Ícone da página */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HomeIcon size={24} />
          </div>
          
          {/* Barra de pesquisa */}
          <div className="flex-1 min-w-0">
            <SearchBar placeholder="Pesquisar..." />
          </div>
          
          {/* Botão de configuração */}
          <ConfigButton onClick={() => setIsConfigModalOpen(true)} />
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className="px-4 md:px-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <p className="text-gray-600">Conteúdo da página Home será exibido aqui...</p>
        </div>
      </div>

      {/* Modal de Configurações */}
      <BaseModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configurações"
        icon={Settings}
      >
        <FormConfig 
          onCancel={handleConfigCancel}
          onSave={handleConfigSave}
        />
      </BaseModal>
    </div>
  );
}

export default Home;
