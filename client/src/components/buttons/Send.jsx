import React from 'react';
import { Send, Loader2 } from 'lucide-react';

const SendButton = ({ onClick, disabled = false, isLoading = false, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors w-10 h-10 flex items-center justify-center ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
    </button>
  );
};

export default SendButton;