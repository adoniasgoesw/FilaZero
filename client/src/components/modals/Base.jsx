import React, { useState, useEffect } from 'react';
import CloseButton from '../buttons/Close';

const BaseModal = ({ isOpen, onClose, children, title = "Modal", icon: Icon, iconBgColor = "bg-blue-500", iconColor = "text-white" }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Tempo da animação
  };

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
        </div>
      </div>
    </>
  );
};

export default BaseModal;
