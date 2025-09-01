import React, { useState } from 'react';
import { Package } from 'lucide-react'; // Icon for page and modal title
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormProduct from '../../components/forms/FormProduct';

function Produtos() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleProductSave = (data) => {
    console.log('Produto salvo:', data);
    setIsAddModalOpen(false);
  };

  const handleProductCancel = () => {
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
            <SearchBar placeholder="Pesquisar produtos..." />
          </div>
          
          {/* Botão adicionar */}
          <AddButton 
            text="Produtos"
            color="red"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className="px-4 md:px-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <p className="text-gray-600">Lista de produtos será exibida aqui...</p>
        </div>
      </div>

      {/* Modal de Adicionar Produto */}
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Produto"
        icon={Package}
        iconBgColor="bg-red-500"
        iconColor="text-white"
      >
        <FormProduct
          onCancel={handleProductCancel}
          onSave={handleProductSave}
        />
      </BaseModal>
    </div>
  );
}

export default Produtos;
