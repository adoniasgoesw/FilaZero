// src/routes/AppRoute.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import LandingPage from '../pages/Landing.jsx';
import Home from '../pages/Home.jsx';
import Historico from '../pages/Historico.jsx';
import Delivery from '../pages/Delivery.jsx';
import Ajuste from '../pages/Ajuste.jsx';

// Importar páginas de Gestão
import Usuarios from '../pages/gestao/Usuarios.jsx';
import Clientes from '../pages/gestao/Clientes.jsx';
import Pagamentos from '../pages/gestao/Pagamentos.jsx';
import Categorias from '../pages/gestao/Categorias.jsx';
import Produtos from '../pages/gestao/Produtos.jsx';

const AppRoute = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota raiz - sempre acessível */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Rota Home - protegida, só acessível após login */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota Histórico - protegida */}
          <Route 
            path="/historico" 
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota Delivery - protegida */}
          <Route 
            path="/delivery" 
            element={
              <ProtectedRoute>
                <Delivery />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota Ajuste - protegida */}
          <Route 
            path="/ajuste" 
            element={
              <ProtectedRoute>
                <Ajuste />
              </ProtectedRoute>
            } 
          />

          {/* Rotas de Gestão - protegidas */}
          <Route 
            path="/gestao/usuarios" 
            element={
              <ProtectedRoute>
                <Usuarios />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/gestao/clientes" 
            element={
              <ProtectedRoute>
                <Clientes />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/gestao/pagamentos" 
            element={
              <ProtectedRoute>
                <Pagamentos />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/gestao/categorias" 
            element={
              <ProtectedRoute>
                <Categorias />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/gestao/produtos" 
            element={
              <ProtectedRoute>
                <Produtos />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoute;
