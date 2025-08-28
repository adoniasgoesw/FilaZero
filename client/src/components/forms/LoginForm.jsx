// src/components/forms/LoginForm.jsx
import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import API from '../../services/api.js';
import Loading from '../elements/Loading.jsx';
import PasswordToggleButton from '../buttons/PasswordToggleButton';
import SubmitButton from '../buttons/SubmitButton';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);

  const [loadingStatus, setLoadingStatus] = useState(null); // 'loading', 'success', 'error'
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingStatus('loading');
    setLoadingMessage('');

    try {
      const response = await API.post('/login', { cpf, senha });
      
      if (response.data.success) {
        console.log('Login bem-sucedido:', response.data);
        
        // Salvar dados no localStorage através do contexto
        const loginSuccess = login(
          response.data.data.usuario,
          response.data.data.estabelecimento
        );
        
        if (loginSuccess) {
          setLoadingStatus('success');
          setLoadingMessage('Acesso permitido!');
          
          // Redirecionar para Home após 2 segundos
          setTimeout(() => {
            navigate('/home');
          }, 2000);
        } else {
          setLoadingStatus('error');
          setLoadingMessage('Erro ao salvar dados de login');
        }
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setLoadingStatus('error');
      setLoadingMessage(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const formatCPF = (value) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e) => {
    const value = e.target.value;
    const formatted = formatCPF(value);
    setCpf(formatted);
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full p-8">
      {/* Header com ícone e título */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Login</h1>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        {/* Campo CPF */}
        <div className="space-y-2">
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
            CPF
          </label>
          <div className="relative">
            <input
              type="text"
              id="cpf"
              value={cpf}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              maxLength="14"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
          </div>
        </div>

        {/* Campo Senha */}
        <div className="space-y-2">
          <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <div className="relative">
            <input
              type={showSenha ? 'text' : 'password'}
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
            />
            <PasswordToggleButton
              isVisible={showSenha}
              onClick={() => setShowSenha(!showSenha)}
              size="md"
            />
          </div>
        </div>

        {/* Link Esqueci a Senha */}
        <div className="text-right">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            Esqueci minha senha
          </a>
        </div>

        {/* Botão de Acessar */}
        <div className="pt-4">
          <SubmitButton
            isLoading={loadingStatus === 'loading'}
            variant="primary"
            size="md"
          >
            Acessar
          </SubmitButton>
        </div>

        {/* Divisor */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">ou</span>
          </div>
        </div>

        {/* Link de Cadastro */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Não possui uma conta?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
              Realizar cadastro
            </a>
          </span>
        </div>
      </form>

      {/* Componente de Loading - Posicionado centralmente sobre o formulário */}
      {loadingStatus && (
        <Loading 
          status={loadingStatus} 
          message={loadingMessage} 
        />
      )}
    </div>
  );
};

export default LoginForm;
