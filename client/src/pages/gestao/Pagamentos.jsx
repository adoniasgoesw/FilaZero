import React, { useState } from 'react';
import { CreditCard } from 'lucide-react'; // Icon for page and modal title
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormPayment from '../../components/forms/FormPayment';

function Pagamentos() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handlePaymentSave = (data) => {
    console.log('Forma de pagamento salva:', data);
    setIsAddModalOpen(false);
  };

  const handlePaymentCancel = () => {
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
            <SearchBar placeholder="Pesquisar formas de pagamento..." />
          </div>
          
          {/* Botão adicionar */}
          <AddButton 
            text="Pagamentos"
            color="purple"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className="px-4 md:px-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <p className="text-gray-600">Lista de formas de pagamento será exibida aqui...</p>
        </div>
      </div>

      {/* Modal de Adicionar Forma de Pagamento */}
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Forma de Pagamento"
        icon={CreditCard}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
      >
        <FormPayment
          onCancel={handlePaymentCancel}
          onSave={handlePaymentSave}
        />
      </BaseModal>
    </div>
  );
}

export default Pagamentos;
