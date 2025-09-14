import React, { useState, useEffect, useCallback, useRef } from 'react';
import CloseButton from '../buttons/Close';
import CancelButton from '../buttons/Cancel';
import SaveButton from '../buttons/Save';

const BaseModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title = "Modal", 
  subtitle = null,
  icon: Icon, 
  iconBgColor = "bg-blue-500", 
  iconColor = "text-white",
  headerContent = null,
  showButtons = true,
  hideDefaultButtons = false,
  onSave,
  saveText = "Salvar",
  cancelText = "Cancelar",
  isLoading = false,
  printButton = null
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef(null);

  const handleClose = useCallback(() => {
    // Disparar evento para permitir interceptação
    const cancelEvent = new CustomEvent('modalCancel', { 
      detail: { canClose: true },
      cancelable: true 
    });
    
    // Verificar se algum listener cancelou o evento
    const wasCancelled = !window.dispatchEvent(cancelEvent);
    
    // Se o evento foi cancelado, não fechar o modal
    if (wasCancelled || cancelEvent.defaultPrevented) {
      return;
    }
    
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
        className="fixed inset-0 z-[998] bg-black/40"
        onClick={handleClose}
      />

      {/* Modal base com animação de gaveta */}
      <div
        className={`fixed top-0 right-0 h-full z-[999] transition-transform duration-300 ease-in-out w-full sm:w-1/2 lg:w-[35%] ${
          isAnimating ? 'transform translate-x-0' : 'transform translate-x-full'
        }`}
      >
        <div ref={modalRef} className="h-full bg-white shadow-2xl flex flex-col">
          {/* Header do modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {headerContent ? (
              <div className="flex-1 min-w-0 pr-3">{headerContent}</div>
            ) : (
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                  {subtitle && (
                    <p className="text-sm text-gray-500 font-medium italic mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              {printButton}
              <CloseButton onClick={handleClose} />
            </div>
          </div>

          {/* Conteúdo do modal */}
          <div className="flex-1 p-6 overflow-y-auto">
            {children}
          </div>

          {/* Footer com botões (se showButtons for true e hideDefaultButtons for false) */}
          {showButtons && !hideDefaultButtons && (
            <div className="border-t border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-4">
                <CancelButton onClick={handleClose} disabled={isLoading}>
                  {cancelText}
                </CancelButton>
                <SaveButton 
                  onClick={() => {
                    // Encontrar o formulário dentro do modal e submeter (escopo do modal)
                    const form = modalRef.current ? modalRef.current.querySelector('.modal-form') : document.querySelector('.modal-form');
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
