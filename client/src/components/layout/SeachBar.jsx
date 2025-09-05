import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = "Pesquisar..." }) => {
  return (
    <div className="relative flex-1 w-full">
      <div className="relative h-12 md:h-12">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full h-full pl-10 pr-4 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 shadow-sm"
        />
      </div>
    </div>
  );
};

export default SearchBar;
