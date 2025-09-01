import React, { useState } from 'react';
import { Users } from 'lucide-react'; // Icon for page and modal title
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormClient from '../../components/forms/FormClient';

function Clientes() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleClientSave = (data) => {
    console.log('Cliente salvo:', data);
    setIsAddModalOpen(false);
  };

  const handleClientCancel = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:min-h-screen">
      {/* Header - fixo apenas em mobile */}
      <div className="fixed md:relative top-0 left-0 right-0 md:left-auto md:right-auto z-50 md:z-auto bg-white px-4 md:px-6 py-4">
        <div className="flex items-center gap-3 w-full">
          {/* Botão voltar */}
          <BackButton />
          
          {/* Barra de pesquisa */}
          <div className="flex-1 min-w-0">
            <SearchBar placeholder="Pesquisar clientes..." />
          </div>
          
          {/* Botão adicionar */}
          <AddButton 
            text="Clientes"
            color="green"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Título fixo */}
      <div className="fixed md:relative top-16 md:top-auto left-0 right-0 md:left-auto md:right-auto z-40 md:z-auto bg-white px-4 md:px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-green-500" />
          Clientes
        </h1>
      </div>

      {/* Área de conteúdo com rolagem */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 mt-32 md:mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <p className="text-gray-600">Lista de clientes será exibida aqui...</p>
        </div>
      </div>

      {/* Modal de Adicionar Cliente */}
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Cliente"
        icon={Users}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      >
        <FormClient
          onCancel={handleClientCancel}
          onSave={handleClientSave}
        />
      </BaseModal>
    </div>
  );
}

export default Clientes;
