import React, { useState } from 'react';
import ZerinhoButton from '../buttons/Zerinho';
import Zerinho from './Zerinho';

const ZerinhoChat = ({ isLanding = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <ZerinhoButton onClick={handleToggle} isOpen={isOpen} isLanding={isLanding} />
      <Zerinho isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default ZerinhoChat;
