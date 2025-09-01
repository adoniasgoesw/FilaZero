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
    <div className="min-h-screen bg-gray-50">
      {/* Header com botão voltar, barra de pesquisa e botão adicionar */}
      <div className="pt-6 px-4 md:px-6">
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

      {/* Conteúdo da página */}
      <div className="px-4 md:px-6 mt-8">
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
