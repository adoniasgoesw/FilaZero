import React from 'react';
import { Plus } from 'lucide-react';

const AddButton = ({ text = "Adicionar", color = "blue", onClick, className = "" }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-500 hover:bg-blue-600",
      green: "bg-green-500 hover:bg-green-600",
      purple: "bg-purple-500 hover:bg-purple-600",
      indigo: "bg-indigo-500 hover:bg-indigo-600",
      orange: "bg-orange-500 hover:bg-orange-600",
      red: "bg-red-500 hover:bg-red-600",
      teal: "bg-teal-500 hover:bg-teal-600",
      cyan: "bg-cyan-500 hover:bg-cyan-600",
      amber: "bg-amber-500 hover:bg-amber-600",
      slate: "bg-slate-500 hover:bg-slate-600",
      violet: "bg-violet-500 hover:bg-violet-600",
      emerald: "bg-emerald-500 hover:bg-emerald-600"
    };
    return colors[color] || colors.blue;
  };

  return (
    <button
      onClick={onClick}
      className={`h-12 w-12 sm:w-auto px-3 sm:px-4 ${getColorClasses(color)} text-white text-sm font-medium rounded-xl flex items-center justify-center sm:justify-start gap-2 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      title={`Adicionar ${text}`}
    >
      <Plus size={16} />
      <span className="hidden sm:inline">{text}</span>
    </button>
  );
};

export default AddButton;
