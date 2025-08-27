import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/layout/SearchBar';
import AddButton from '../../components/buttons/AddButton';
import BackButton from '../../components/buttons/BackButton';
import BaseModal from '../../components/modals/Base';
import FormPagamentos from '../../components/forms/FormPagamentos';
import { CreditCard } from 'lucide-react';

const Pagamentos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (formData) => {
    console.log('Dados do pagamento:', formData);
    // Aqui você implementará a lógica para salvar o pagamento
    closeModal();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
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
              <SearchBar placeholder="Buscar pagamentos..." />
            </div>
            
            {/* Botão ADD */}
            <div className="flex-shrink-0">
              <AddButton 
                onClick={openModal}
                text="Mais Pagamentos"
                className="bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 text-white h-12"
              />
            </div>
          </div>
        </div>

        {/* Título da página com ícone */}
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 text-pink-600" />
            </div>
            <h1 className="text-lg font-semibold text-gray-800 ml-3">Pagamentos</h1>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Conteúdo da página de pagamentos */}
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg">Funcionalidade de pagamentos em desenvolvimento</p>
          </div>
        </div>
      </div>
      
      {/* Modal com Formulário */}
      <BaseModal 
        isOpen={isModalOpen} 
        onClose={closeModal}
      >
        <FormPagamentos onClose={closeModal} onSubmit={handleSubmit} />
      </BaseModal>
    </div>
  );
};

export default Pagamentos;
