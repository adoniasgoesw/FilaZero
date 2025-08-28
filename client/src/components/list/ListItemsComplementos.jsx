import React from 'react';
import api from '../../services/api.js';

const ListItemsComplementos = ({ complementosSelecionados, complementos, onRemoverComplemento }) => {
  if (!complementosSelecionados || complementosSelecionados.length === 0) {
    return null;
  }

  // Buscar os dados completos dos complementos selecionados
  const complementosCompletos = complementosSelecionados.map(id => {
    const complemento = complementos.find(comp => comp.id === id);
    return complemento;
  }).filter(Boolean);

  return (
    <div className="mt-3">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Complementos Selecionados:</h4>
      <div className="space-y-2">
        {complementosCompletos.map((complemento) => (
          <div 
            key={complemento.id} 
            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{complemento.nome}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {formatarPreco(complemento.valor_venda)}
              </span>
                             <button
                 onClick={async () => {
                   try {
                     // Deletar do banco de dados
                     await api.delete(`/itens-complementos/${complemento.id}`);
                     // Chamar função de callback para atualizar estado local
                     onRemoverComplemento(complemento.id);
                   } catch (error) {
                     console.error('Erro ao deletar complemento:', error);
                   }
                 }}
                 className="text-red-500 hover:text-red-700 text-sm"
                 title="Remover complemento"
               >
                 <i className="fas fa-times"></i>
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Função para formatar preço
const formatarPreco = (preco) => {
  if (!preco) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(preco);
};

export default ListItemsComplementos;
