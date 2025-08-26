import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import { Truck as TruckIcon } from 'lucide-react';

const Delivery = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:ml-20 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <TruckIcon className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Delivery;
