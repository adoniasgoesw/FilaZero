import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react'; // Icon for page and modal title
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormUser from '../../components/forms/FormUser';
import DevelopmentDialog from '../../components/elements/DevelopmentDialog';

function Usuarios() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showDevelopmentDialog, setShowDevelopmentDialog] = useState(false);

  // Mostrar o diálogo de desenvolvimento automaticamente
  useEffect(() => {
    setShowDevelopmentDialog(true);
  }, []);

  const handleUserSave = (data) => {
    console.log('Usuário salvo:', data);
    setIsAddModalOpen(false);
  };

  const handleUserCancel = () => {
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

      {/* Título fixo */}
      <div className="fixed md:relative top-16 md:top-auto left-0 right-0 md:left-auto md:right-auto z-40 md:z-auto bg-white px-4 md:px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-500" />
          Usuários
        </h1>
      </div>

      {/* Área de conteúdo com rolagem */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 mt-32 md:mt-8">
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

      {/* Diálogo de desenvolvimento */}
      <DevelopmentDialog
        isOpen={showDevelopmentDialog}
        onClose={() => setShowDevelopmentDialog(false)}
        title="Área de Usuários em Desenvolvimento"
        message="A funcionalidade de gerenciamento de usuários está sendo desenvolvida e incluirá cadastro de funcionários, controle de permissões, gestão de acessos e muito mais."
      />
    </div>
  );
}

export default Usuarios;
