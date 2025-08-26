import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import SearchBar from '../../components/layout/SearchBar';
import AddButton from '../../components/buttons/AddButton';
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:ml-20 p-6">
        {/* Header com ícone, barra de pesquisa e botão */}
        <div className="flex items-center justify-between w-full mb-6">
          {/* Ícone da página */}
          <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-7 h-7 text-pink-600" />
          </div>
          
          {/* Espaçamento */}
          <div className="flex-1 mx-6">
            <SearchBar />
          </div>
          
          {/* Botão ADD */}
          <div className="flex-shrink-0">
            <AddButton 
              onClick={openModal}
              text="Mais Pagamentos"
              className="bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 text-white"
            />
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
