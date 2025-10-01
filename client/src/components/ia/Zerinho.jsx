import React, { useState, useEffect, useRef } from 'react';
import { Bot, X } from 'lucide-react';
import { processChatMessage } from '../../services/api';
import SendButton from '../buttons/Send';

const Zerinho = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Olá! Eu sou o Zerinho, seu assistente virtual do FilaZero! Como posso te ajudar hoje?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll automático para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // IA do Zerinho - Chama o backend com NLP.js
  const getZerinhoResponse = async (userMessage) => {
    try {
      console.log('🤖 Zerinho AI - Enviando mensagem para backend:', userMessage);
      const response = await processChatMessage(userMessage);
      
      if (response.success) {
        console.log('🤖 Zerinho AI - Resposta recebida:', response.data.message);
        return response.data.message;
      } else {
        console.error('❌ Zerinho AI - Erro na resposta:', response.message);
        return "Ops! Algo deu errado aqui. Vou chamar alguém do suporte técnico para te ajudar! 🔧";
      }
    } catch (error) {
      console.error('❌ Zerinho AI - Erro na comunicação:', error);
      return "Ops! Algo deu errado aqui. Vou chamar alguém do suporte técnico para te ajudar! 🔧";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userText = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // IA do Zerinho responde
    try {
      const botResponse = await getZerinhoResponse(userText);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Ops! Algo deu errado aqui. Vou chamar alguém do suporte técnico para te ajudar! 🔧",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header do Chat */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold">Zerinho</h3>
            <p className="text-xs text-gray-300">Assistente Virtual</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
          >
            <div
                  className={`max-w-xs px-3 py-2 rounded-2xl ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-900 text-white'
                  }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Indicador de digitação */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Zerinho está digitando</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Referência para scroll automático */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de mensagem */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isTyping}
          />
          <SendButton
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            isLoading={isTyping}
          />
        </div>
      </div>
    </div>
  );
};

export default Zerinho;
