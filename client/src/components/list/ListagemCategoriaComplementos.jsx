import React, { useState } from 'react';
import { Power, PowerOff, Plus, Trash2, Check } from 'lucide-react';
import AddButton from '../buttons/AddButton';

const ListagemCategoriaComplementos = ({ 
  categorias, 
  categoriasEditadas,
  setCategoriasEditadas,
  onToggleStatus, 
  onAdicionarComplemento,
  onEditarCategoria,
  onDeletarCategoria 
}) => {

  // Função para atualizar campo editado
  const atualizarCampo = (index, campo, valor) => {
    setCategoriasEditadas(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [campo]: valor
      }
    }));
  };



  if (!categorias || categorias.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Plus className="w-6 h-6 text-orange-600" />
        </div>
        <p className="text-sm text-gray-600">Nenhuma categoria criada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
             {categorias.map((categoria, index) => {
         // Sempre usar dados editados se existirem, senão usar os originais
         const dadosAtuais = categoriasEditadas[index] || categoria;
         
         return (
           <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm relative">
                           {/* Status no canto superior direito */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => onToggleStatus(index)}
                  className="flex items-center space-x-2 px-2 py-1 text-xs font-medium rounded-md transition-colors hover:bg-gray-50"
                  title={categoria.status ? 'Desativar' : 'Ativar'}
                >
                  {categoria.status ? (
                    <>
                      <Power className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Ativo</span>
                    </>
                  ) : (
                    <>
                      <PowerOff className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">Inativo</span>
                    </>
                  )}
                </button>
              </div>

             

            <div className="space-y-2">
                             {/* Nome da Categoria - SEMPRE EDITÁVEL */}
               <div>
                 <label className="block text-xs font-medium text-gray-700 mb-1">
                   Nome da Categoria *
                 </label>
                 <input
                   type="text"
                   value={dadosAtuais.nome}
                   onChange={(e) => atualizarCampo(index, 'nome', e.target.value)}
                   className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                 />
               </div>

                                            {/* Quantidade Mínima e Máxima - SEMPRE EDITÁVEIS */}
               <div className="flex items-end space-x-3">
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">
                     Qtd. Min
                   </label>
                   <input
                     type="number"
                     value={dadosAtuais.quantidade_minima}
                     onChange={(e) => atualizarCampo(index, 'quantidade_minima', parseInt(e.target.value) || 0)}
                     min="0"
                     className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">
                     Qtd. Max
                   </label>
                   <input
                     type="number"
                     value={dadosAtuais.quantidade_maxima}
                     onChange={(e) => atualizarCampo(index, 'quantidade_maxima', parseInt(e.target.value) || 0)}
                     min="0"
                     className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                   />
                 </div>
               </div>

                                            {/* Checkbox Preenchimento Obrigatório - SEMPRE EDITÁVEL */}
               <div className="flex items-center space-x-2">
                 <input
                   type="checkbox"
                   checked={dadosAtuais.preenchimento_obrigatorio}
                   onChange={(e) => atualizarCampo(index, 'preenchimento_obrigatorio', e.target.checked)}
                   className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                 />
                 <span className="text-xs text-gray-700">
                   Preenchimento obrigatório
                 </span>
               </div>

                             {/* Footer com Botões */}
               <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                 {/* Botão Deletar no canto inferior esquerdo */}
                 <button
                   onClick={() => onDeletarCategoria(categoria.id, index)}
                   className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                   title="Deletar categoria"
                 >
                   <Trash2 className="w-3 h-3" />
                   <span>Deletar</span>
                 </button>

                 {/* Botão Adicionar Complementos no canto inferior direito */}
                 <AddButton
                   onClick={() => onAdicionarComplemento(dadosAtuais)}
                   text="Adicionar Complementos"
                   className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white"
                 />
               </div>
             </div>
           </div>
         );
       })}
     </div>
   );
 };

export default ListagemCategoriaComplementos;
