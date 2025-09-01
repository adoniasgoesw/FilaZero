import React, { useState } from 'react';
import { History, Calculator } from 'lucide-react';
import SearchBar from '../components/layout/SeachBar';
import OpenButton from '../components/buttons/Open';
import BaseModal from '../components/modals/Base';
import FormCaixa from '../components/forms/FormCaixa';

function Historic() {
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);

  const handleCaixaSave = (data) => {
    console.log('Caixa aberto:', data);
    setIsOpenModalOpen(false);
  };

  const handleCaixaCancel = () => {
    setIsOpenModalOpen(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:min-h-screen">
      {/* Header - fixo apenas em mobile */}
      <div className="fixed md:relative top-0 left-0 right-0 md:left-auto md:right-auto z-50 md:z-auto bg-white px-4 md:px-6 py-4">
        <div className="flex items-center gap-3 w-full">
          {/* Ícone da página */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <History size={24} />
          </div>
          
          {/* Barra de pesquisa */}
          <div className="flex-1 min-w-0">
            <SearchBar placeholder="Pesquisar histórico..." />
          </div>
          
          {/* Botão Open reduzido */}
          <OpenButton onClick={() => setIsOpenModalOpen(true)} />
        </div>
      </div>

      {/* Área de conteúdo com rolagem */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 mt-16 md:mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <p className="text-gray-600">Histórico será exibido aqui...</p>
        </div>
      </div>

      {/* Modal de Abrir Caixa */}
      <BaseModal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        title="Abrir Caixa"
        icon={Calculator}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
      >
        <FormCaixa
          onCancel={handleCaixaCancel}
          onSave={handleCaixaSave}
        />
      </BaseModal>
    </div>
  );
}

export default Historic;
