import React from 'react';
import { AlertCircle, Code, Wrench } from 'lucide-react';

const DevelopmentDialog = ({ 
  isOpen, 
  onClose, 
  title = "Área em Desenvolvimento",
  message = "Esta funcionalidade está sendo desenvolvida e estará disponível em breve.",
  showIcon = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center p-6 border-b border-gray-200">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            {showIcon ? (
              <Wrench className="w-8 h-8 text-orange-600" />
            ) : (
              <Code className="w-8 h-8 text-orange-600" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {title}
          </h2>
          
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
            <span className="text-sm text-gray-600">Em Desenvolvimento</span>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800">
              <strong>O que esperar:</strong> Esta funcionalidade será implementada nas próximas atualizações do sistema.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full bg-orange-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentDialog;
