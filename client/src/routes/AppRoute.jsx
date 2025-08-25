// src/routes/AppRoute.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import LandingPage from '../pages/Landing.jsx';
import Home from '../pages/Home.jsx';

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
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoute;
