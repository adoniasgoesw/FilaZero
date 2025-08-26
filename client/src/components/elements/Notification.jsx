import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const Notification = ({ 
  isOpen, 
  onClose, 
  message, 
  onConfirm, 
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning" // warning, success, error, info
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          borderColor: 'border-amber-200',
          confirmBg: 'bg-rose-500 hover:bg-rose-600', // Vermelho para exclusão
          cancelBg: 'bg-gray-500 hover:bg-gray-600'
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          borderColor: 'border-emerald-200',
          confirmBg: 'bg-emerald-500 hover:bg-emerald-600',
          cancelBg: 'bg-gray-500 hover:bg-gray-600'
        };
      case 'error':
        return {
          iconBg: 'bg-rose-100',
          iconColor: 'text-rose-600',
          borderColor: 'border-rose-200',
          confirmBg: 'bg-rose-500 hover:bg-rose-600',
          cancelBg: 'bg-gray-500 hover:bg-gray-600'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          confirmBg: 'bg-blue-500 hover:bg-blue-600',
          cancelBg: 'bg-gray-500 hover:bg-gray-600'
        };
      default:
        return {
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          borderColor: 'border-amber-200',
          confirmBg: 'bg-rose-500 hover:bg-rose-600', // Vermelho para exclusão
          cancelBg: 'bg-gray-500 hover:bg-gray-600'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Notificação */}
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              y: -50 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: -50 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-80 max-w-xs"
          >
            {/* Card da notificação */}
            <div className={`bg-white rounded-2xl shadow-2xl border-2 ${styles.borderColor} overflow-hidden`}>
                             {/* Ícone de exclamação no canto superior esquerdo - Girado */}
               <div className={`absolute -top-3 -left-3 w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center shadow-lg border-4 border-white`}>
                 <AlertTriangle className={`w-6 h-6 ${styles.iconColor} transform rotate-12`} />
               </div>
              
                             {/* Conteúdo */}
               <div className="pt-6 pb-4 px-5">
                 {/* Mensagem */}
                 <div className="text-center mb-4">
                   <p className="text-gray-800 text-base font-medium leading-relaxed">
                     {message}
                   </p>
                 </div>
                 
                 {/* Botões */}
                 <div className="flex space-x-3">
                   <button
                     onClick={onClose}
                     className={`flex-1 py-2.5 px-3 ${styles.cancelBg} text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md text-sm`}
                   >
                     {cancelText}
                   </button>
                   <button
                     onClick={onConfirm}
                     className={`flex-1 py-2.5 px-3 ${styles.confirmBg} text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md text-sm`}
                   >
                     {confirmText}
                   </button>
                 </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Notification;
