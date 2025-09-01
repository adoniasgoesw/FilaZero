import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/layout/SearchBar';
import AddButton from '../../components/buttons/AddButton';
import BackButton from '../../components/buttons/BackButton';
import BaseModal from '../../components/modals/Base';
import FormUsuarios from '../../components/forms/FormUsuarios';
import { UserCheck } from 'lucide-react';

const Usuarios = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (formData) => {
    console.log('Dados do usuário:', formData);
    // Aqui você implementará a lógica para salvar o usuário
    closeModal();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Container fixo para elementos que não devem rolar */}
        <div className="sticky top-0 z-10 bg-gray-50">
          {/* Header com botão voltar, barra de pesquisa e botão */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Botão Voltar */}
              <div className="flex-shrink-0">
                <BackButton 
                  onClick={() => window.history.back()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 h-12 px-4"
                />
              </div>
              
              {/* Barra de pesquisa */}
              <div className="flex-1 mx-6">
                <SearchBar placeholder="Buscar usuários..." />
              </div>
              
              {/* Botão ADD */}
              <div className="flex-shrink-0">
                <AddButton 
                  onClick={openModal}
                  text="Mais Usuários"
                  className="bg-gradient-to-r from-indigo-300 to-indigo-400 hover:from-indigo-400 hover:to-indigo-500 text-white h-12"
                />
              </div>
            </div>
          </div>

          {/* Título da página com ícone */}
          <div className="bg-white px-4 sm:px-6 py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <h1 className="text-lg font-semibold text-gray-800 ml-3">Usuários</h1>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal - Apenas o conteúdo rola */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Conteúdo da página de usuários */}
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">Funcionalidade de usuários em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal com Formulário */}
      <BaseModal 
        isOpen={isModalOpen} 
        onClose={closeModal}
      >
        <FormUsuarios onClose={closeModal} onSubmit={handleSubmit} />
      </BaseModal>
    </div>
  );
};

export default Usuarios;
