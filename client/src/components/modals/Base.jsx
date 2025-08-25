// src/components/modals/Base.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseButton from '../buttons/CloseButton.jsx';

const BaseModal = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-0 right-0 h-full w-[35%] bg-white shadow-xl z-50"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.5
          }}
        >
          <CloseButton onClick={onClose} />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BaseModal;
