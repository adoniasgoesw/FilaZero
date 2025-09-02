import React, { useState, useEffect, useCallback } from 'react';
import CloseButton from '../buttons/Close';
import CancelButton from '../buttons/Cancel';
import SaveButton from '../buttons/Save';

const BaseModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title = "Modal", 
  icon: Icon, 
  iconBgColor = "bg-blue-500", 
  iconColor = "text-white",
  showButtons = true,
  onSave,
  saveText = "Salvar",
  cancelText = "Cancelar",
  isLoading = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Tempo da animação
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Escutar evento de sucesso do formulário
  useEffect(() => {
    const handleSaveSuccess = (event) => {
      if (onSave) {
        onSave(event.detail);
      }
      // Fechar modal após salvar com sucesso
      handleClose();
    };

    if (isOpen) {
      window.addEventListener('modalSaveSuccess', handleSaveSuccess);
    }

    return () => {
      window.removeEventListener('modalSaveSuccess', handleSaveSuccess);
    };
  }, [isOpen, onSave, handleClose]);

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      <div
        className="fixed inset-0 z-40"
        onClick={handleClose}
      />

      {/* Modal base com animação de gaveta */}
      <div
        className={`fixed top-0 right-0 h-full z-50 transition-transform duration-300 ease-in-out w-full sm:w-1/2 lg:w-[35%] ${
          isAnimating ? 'transform translate-x-0' : 'transform translate-x-full'
        }`}
      >
        <div className="h-full bg-white shadow-2xl flex flex-col">
          {/* Header do modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center shadow-sm`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
              )}
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            </div>
            <CloseButton onClick={handleClose} />
          </div>

          {/* Conteúdo do modal */}
          <div className="flex-1 p-6 overflow-y-auto">
            {children}
          </div>

          {/* Footer com botões (se showButtons for true) */}
          {showButtons && (
            <div className="border-t border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-4">
                <CancelButton onClick={handleClose} disabled={isLoading}>
                  {cancelText}
                </CancelButton>
                <SaveButton 
                  onClick={() => {
                    // Encontrar o formulário dentro do modal e submeter
                    const form = document.querySelector('.modal-form');
                    if (form) {
                      form.requestSubmit();
                    }
                  }} 
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : saveText}
                </SaveButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BaseModal;
