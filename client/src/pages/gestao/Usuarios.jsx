import React, { useState } from 'react';
import { User } from 'lucide-react'; // Icon for page and modal title
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormUser from '../../components/forms/FormUser';

function Usuarios() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleUserSave = (data) => {
    console.log('Usuário salvo:', data);
    setIsAddModalOpen(false);
  };

  const handleUserCancel = () => {
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
            <SearchBar placeholder="Pesquisar usuários..." />
          </div>
          
          {/* Botão adicionar */}
          <AddButton 
            text="Usuários"
            color="indigo"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className="px-4 md:px-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <p className="text-gray-600">Lista de usuários será exibida aqui...</p>
        </div>
      </div>

      {/* Modal de Adicionar Usuário */}
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Usuário"
        icon={User}
        iconBgColor="bg-indigo-500"
        iconColor="text-white"
      >
        <FormUser
          onCancel={handleUserCancel}
          onSave={handleUserSave}
        />
      </BaseModal>
    </div>
  );
}

export default Usuarios;
