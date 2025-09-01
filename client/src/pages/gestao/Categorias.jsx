import React, { useState } from 'react';
import { Tag } from 'lucide-react'; // Icon for page and modal title
import SearchBar from '../../components/layout/SeachBar';
import BackButton from '../../components/buttons/Back';
import AddButton from '../../components/buttons/Add';
import BaseModal from '../../components/modals/Base';
import FormCategory from '../../components/forms/FormCategory';

function Categorias() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleCategorySave = (data) => {
    console.log('Categoria salva:', data);
    setIsAddModalOpen(false);
  };

  const handleCategoryCancel = () => {
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
            <SearchBar placeholder="Pesquisar categorias..." />
          </div>
          
          {/* Botão adicionar */}
          <AddButton 
            text="Categorias"
            color="orange"
            onClick={() => setIsAddModalOpen(true)}
          />
        </div>
      </div>

      {/* Conteúdo da página */}
      <div className="px-4 md:px-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <p className="text-gray-600">Lista de categorias será exibida aqui...</p>
        </div>
      </div>

      {/* Modal de Adicionar Categoria */}
      <BaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Cadastrar Categoria"
        icon={Tag}
        iconBgColor="bg-orange-500"
        iconColor="text-white"
      >
        <FormCategory
          onCancel={handleCategoryCancel}
          onSave={handleCategorySave}
        />
      </BaseModal>
    </div>
  );
}

export default Categorias;
