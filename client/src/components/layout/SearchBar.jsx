import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = "Digite para pesquisar..." }) => {
  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-12 pr-6 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white hover:border-gray-300 shadow-sm"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
