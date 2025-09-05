import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 text-xs text-gray-500 flex items-center justify-between">
        <span>FilaZero</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </footer>
  );
};

export default Footer;




