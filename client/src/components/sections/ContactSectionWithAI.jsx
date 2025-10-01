import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Mail, Phone, MapPin, MessageCircle, Loader2, Bot, Smile } from 'lucide-react';
import api, { processChatMessage } from '../../services/api';
import BaseModal from '../modals/Base';
import ConfirmDialog from '../elements/ConfirmDialog';
import SendButton from '../buttons/Send';
import CloseButton from '../buttons/Close';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    restaurante: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  // Funções do chat
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now(),
      text: chatMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userText = chatMessage;
    setChatMessage('');
    setIsTyping(true);

    // IA do Zerinho responde
    try {
      const botResponse = await getZerinhoResponse(userText);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Ops! Algo deu errado aqui. Vou chamar alguém do suporte técnico para te ajudar! 🔧",
        sender: 'bot',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/contato', formData);
      
      if (response.success) {
        setShowConfirmDialog(true);
        setFormData({
          nome: '',
          email: '',
          whatsapp: '',
          restaurante: '',
          mensagem: ''
        });
      } else {
        console.error('Erro ao enviar mensagem:', response.message);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl px-4 text-gray-600 max-w-3xl mx-auto">
            Tem alguma dúvida? Quer saber mais sobre o FilaZero? 
            Nossa equipe está pronta para te ajudar!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Formulário de Contato */}
          <Card className="p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
              Envie sua Mensagem
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm sm:text-sm font-medium mb-2 block text-gray-700">
                    Nome Completo *
                  </label>
                  <Input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="text-sm h-10 sm:h-11"
                  />
                </div>
                
                <div>
                  <label className="text-sm sm:text-sm font-medium mb-2 block text-gray-700">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="text-sm h-10 sm:h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm sm:text-sm font-medium mb-2 block text-gray-700">
                    WhatsApp
                  </label>
                  <Input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="text-sm h-10 sm:h-11"
                  />
                </div>
                
                <div>
                  <label className="text-sm sm:text-sm font-medium mb-2 block text-gray-700">
                    Nome do Restaurante
                  </label>
                  <Input
                    type="text"
                    value={formData.restaurante}
                    onChange={(e) => handleInputChange('restaurante', e.target.value)}
                    placeholder="Nome do seu estabelecimento"
                    className="text-sm h-10 sm:h-11"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm sm:text-sm font-medium mb-2 block text-gray-700">
                  Mensagem *
                </label>
                <Textarea
                  value={formData.mensagem}
                  onChange={(e) => handleInputChange('mensagem', e.target.value)}
                  placeholder="Conte-nos como podemos te ajudar..."
                  required
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Enviando...
                  </div>
                ) : (
                  'Enviar Mensagem'
                )}
              </Button>
            </form>
          </Card>

          {/* Informações de Contato */}
          <div className="space-y-6 sm:space-y-8">
            {/* Informações de Contato */}
            <Card className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Informações de Contato
              </h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Email</h4>
                    <p className="text-sm text-gray-600 break-all">adoniasgoes86@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">WhatsApp</h4>
                    <p className="text-sm text-gray-600">(43) 99961-8852</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Localização</h4>
                    <p className="text-sm text-gray-600">Ortigueira, PR - Brasil</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Ações Rápidas */}
            <div className="space-y-4">
              <Card className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Suporte Rápido</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Precisa de ajuda imediata? Fale com o Zerinho, nosso assistente virtual!
                </p>
                <Button
                  onClick={() => setShowChatModal(true)}
                  className="text-sm w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Falar com Zerinho
                </Button>
              </Card>

              <Card className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <Smile className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Teste Grátis</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Experimente o FilaZero por 30 dias sem compromisso!
                </p>
                <Button
                  onClick={() => window.dispatchEvent(new CustomEvent('openRegisterModal'))}
                  className="text-sm w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  Começar Teste Grátis
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Chat */}
      <BaseModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        title=""
        icon={null}
        hideDefaultButtons={true}
        showButtons={false}
        headerContent={<div></div>}
        showBorder={false}
      >
        <div className="h-[500px] flex flex-col">
          {/* Header do Chat */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Zerinho</h3>
            </div>
            <CloseButton onClick={() => setShowChatModal(false)} />
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Olá! Eu sou o Zerinho</h4>
                <p className="text-gray-600">Como posso te ajudar hoje?</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
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
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm text-blue-700 font-medium">Zerinho está digitando</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer customizado com input de mensagem e botão Send - fixado no bottom exato */}
          <div 
            className="absolute -bottom-10 left-0 right-0 p-3 border-t border-gray-200 bg-white"
            style={{ 
              position: 'sticky', 
              bottom: 0, 
              zIndex: 10,
              margin: 0,
              transform: 'none'
            }}
          >
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1 text-sm"
                disabled={isTyping}
              />
              <SendButton
                onClick={handleSendMessage}
                disabled={!chatMessage.trim() || isTyping}
                className="px-4"
              />
            </div>
          </div>
        </div>
      </BaseModal>

      {/* Diálogo de Confirmação */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Mensagem Enviada!"
        message="Obrigado pelo seu contato! Nossa equipe responderá em breve."
        confirmText="Entendi"
        onConfirm={() => setShowConfirmDialog(false)}
      />
    </section>
  );
};

export default ContactSection;

