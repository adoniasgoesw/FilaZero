import React from 'react';
import Dashboard from '../elements/Dashboard';
import AccessButton from '../buttons/Access';

const HeroSect = ({ onPrimaryClick }) => {
  return (
    <section className="relative min-h-[80vh] bg-gradient-to-br from-slate-50 to-slate-200 overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-white/50 rounded-2xl floating"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-white/40 rounded-full floating-delayed"></div>
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-white/40 rounded-3xl floating"></div>
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-white/30 blob"></div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[70vh]">
          <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <div className="mb-6">
              <div className="flex items-center justify-center lg:justify-start mb-3">
                <svg className="w-10 h-10 mr-3 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-800">FilaZero</h1>
              </div>
              <div className="w-16 h-0.5 bg-blue-500 mx-auto lg:mx-0"></div>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Seu cliente <span className="text-blue-500">não espera</span>,<br />
              seu sistema <span className="text-gray-600">também não</span>
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed mx-auto lg:mx-0">
              Revolucione seu negócio alimentício com o sistema de gestão mais rápido e intuitivo do mercado
            </p>

            <div className="flex gap-4 justify-center lg:justify-start">
              <AccessButton onClick={onPrimaryClick} variant="blue">Começar Agora</AccessButton>
            </div>
          </div>

          <div className="lg:w-1/2 flex justify-center">
            <Dashboard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSect;


