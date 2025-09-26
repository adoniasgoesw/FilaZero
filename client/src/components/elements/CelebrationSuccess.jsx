import React, { useEffect, useState } from 'react';

const CelebrationSuccess = ({ onComplete }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Iniciar animação de confetes
    setShowConfetti(true);
    
    // Mostrar mensagem após um pequeno delay
    setTimeout(() => {
      setShowMessage(true);
    }, 300);

    // Esconder confetes e mostrar login após 3 segundos
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    // Chamar onComplete após 4 segundos para mostrar o form de login
    setTimeout(() => {
      onComplete();
    }, 4000);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      {/* Confetes */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      {/* Mensagem de sucesso */}
      {showMessage && (
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-slide-up">
            Parabéns!
          </h1>
          <p className="text-2xl text-gray-700 animate-slide-up-delay">
            Conta criada com sucesso
          </p>
        </div>
      )}
    </div>
  );
};

// Componente individual de confete
const ConfettiPiece = ({ index }) => {
  const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
  const shapes = ['circle', 'square', 'triangle'];
  
  const color = colors[index % colors.length];
  const shape = shapes[index % shapes.length];
  
  // Gerar ângulo aleatório para explosão em 360°
  const angle = Math.random() * 360;
  const distance = 200 + Math.random() * 300; // Distância variável
  
  // Calcular posição final baseada no ângulo
  const endX = Math.cos(angle * Math.PI / 180) * distance;
  const endY = Math.sin(angle * Math.PI / 180) * distance;
  
  const delay = Math.random() * 0.5;
  const duration = 1.5 + Math.random() * 1;

  return (
    <div
      className={`absolute animate-confetti-explode`}
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        '--end-x': `${endX}px`,
        '--end-y': `${endY}px`,
      }}
    >
      <div
        className={`w-3 h-3 ${shape === 'circle' ? 'rounded-full' : shape === 'triangle' ? 'transform rotate-45' : ''}`}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}`,
        }}
      />
    </div>
  );
};

export default CelebrationSuccess;
