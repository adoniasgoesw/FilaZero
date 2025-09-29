import React, { useState, useEffect, useCallback, useRef } from 'react';
import CloseButton from '../buttons/Close';
import CancelButton from '../buttons/Cancel';
import SaveButton from '../buttons/Save';

const BaseModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  children, 
  title = "Modal", 
  subtitle = null,
  icon: Icon, 
  iconBgColor = "bg-blue-500", 
  iconColor = "text-white",
  headerContent = null,
  showButtons = true,
  hideDefaultButtons = false,
  saveText = "Salvar",
  cancelText = "Cancelar",
  isLoading = false,
  printButton = null,
  showBorder = false
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

  // Listener único para evento de sucesso do formulário
  useEffect(() => {
    const handleModalSaveSuccess = (event) => {
      console.log('🎉 Evento modalSaveSuccess recebido:', event.detail);
      console.log('🔍 onSave disponível:', !!onSave);
      if (onSave) {
        console.log('✅ Chamando onSave com dados:', event.detail);
        onSave(event.detail);
      }
      
      // Fechar o modal após o sucesso
      console.log('🔒 Fechando modal após sucesso...');
      handleClose();
    };

    if (isOpen) {
      window.addEventListener('modalSaveSuccess', handleModalSaveSuccess);
    }

    return () => {
      window.removeEventListener('modalSaveSuccess', handleModalSaveSuccess);
    };
  }, [isOpen, onSave, handleClose]);

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      <div
        className="fixed inset-0 z-[999999] bg-black/40"
        onClick={handleClose}
      />

      {/* Modal base com animação de gaveta */}
      <div
        className={`fixed top-0 right-0 h-full z-[1000000] transition-transform duration-300 ease-in-out w-full sm:w-1/2 lg:w-[40%] xl:w-[35%] max-w-2xl ${
          isAnimating ? 'transform translate-x-0' : 'transform translate-x-full'
        }`}
      >
        <div ref={modalRef} className={`h-full bg-white shadow-2xl flex flex-col relative z-[60] ${showBorder ? 'border border-gray-200' : ''}`}>
          {/* Borda esquerda mais grossa - apenas quando showBorder for true */}
          {showBorder && (
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-800"></div>
          )}
          {/* Header do modal */}
          {headerContent && headerContent.props.children && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex-1 min-w-0 pr-3">{headerContent}</div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {printButton}
                <CloseButton onClick={handleClose} />
              </div>
            </div>
          )}
          
          {!headerContent && (title || Icon) && (
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {Icon && (
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${iconBgColor} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{title}</h2>
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-gray-500 font-medium italic mt-1 truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {printButton}
                <CloseButton onClick={handleClose} />
              </div>
            </div>
          )}

          {/* Conteúdo do modal */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {children}
          </div>

          {/* Footer com botões (se showButtons for true e hideDefaultButtons for false) */}
          {showButtons && !hideDefaultButtons && (
            <div className="border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
              <div className="flex justify-end gap-3 w-1/2 ml-auto">
                <CancelButton 
                  onClick={handleClose} 
                  disabled={isLoading}
                  className="flex-1 px-6 py-2 text-sm"
                >
                  {cancelText}
                </CancelButton>
                <SaveButton 
                  onClick={() => {
                    console.log('🔘 Botão Salvar clicado no modal');
                    // Encontrar o formulário dentro do modal e submeter (escopo do modal)
                    const form = modalRef.current ? modalRef.current.querySelector('.modal-form') : document.querySelector('.modal-form');
                    console.log('📋 Formulário encontrado:', form);
                    if (form) {
                      console.log('📝 Submetendo formulário...');
                      form.requestSubmit();
                    } else {
                      console.log('❌ Formulário não encontrado, fechando modal...');
                      // Se não há formulário, apenas fechar o modal
                      handleClose();
                    }
                  }} 
                  disabled={isLoading}
                  className="flex-1 px-6 py-2 text-sm"
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
