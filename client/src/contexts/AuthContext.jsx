// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [establishment, setEstablishment] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar se há dados salvos no localStorage ao inicializar
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const savedUser = localStorage.getItem('filaZero_user');
        const savedEstablishment = localStorage.getItem('filaZero_establishment');
        
        if (savedUser && savedEstablishment) {
          const userData = JSON.parse(savedUser);
          const establishmentData = JSON.parse(savedEstablishment);
          
          setUser(userData);
          setEstablishment(establishmentData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Limpar dados corrompidos
        localStorage.removeItem('filaZero_user');
        localStorage.removeItem('filaZero_establishment');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Função para fazer login
  const login = (userData, establishmentData) => {
    try {
      // Salvar dados no localStorage
      localStorage.setItem('filaZero_user', JSON.stringify(userData));
      localStorage.setItem('filaZero_establishment', JSON.stringify(establishmentData));
      
      // Atualizar estado
      setUser(userData);
      setEstablishment(establishmentData);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados de login:', error);
      return false;
    }
  };

  // Função para fazer logout
  const logout = () => {
    try {
      // Limpar dados do localStorage
      localStorage.removeItem('filaZero_user');
      localStorage.removeItem('filaZero_establishment');
      
      // Limpar estado
      setUser(null);
      setEstablishment(null);
      setIsAuthenticated(false);
      
      return true;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return false;
    }
  };

  // Função para verificar se o token ainda é válido (opcional)
  const checkTokenValidity = async () => {
    // Aqui você pode implementar uma verificação de token com o backend
    // Por enquanto, vamos apenas verificar se os dados existem
    const savedUser = localStorage.getItem('filaZero_user');
    const savedEstablishment = localStorage.getItem('filaZero_establishment');
    
    if (!savedUser || !savedEstablishment) {
      logout();
      return false;
    }
    
    return true;
  };

  const value = {
    user,
    establishment,
    isAuthenticated,
    loading,
    login,
    logout,
    checkTokenValidity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
