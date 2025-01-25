import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={
          isAuthenticated ? (
            <Layout>
              <Chat />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        <Route path="/login" element={
          !isAuthenticated ? (
            <Login />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        <Route path="/register" element={
          !isAuthenticated ? (
            <Register />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* Özel rotalar */}
        <Route path="/chat" element={
          <PrivateRoute>
            <Layout>
              <Chat />
            </Layout>
          </PrivateRoute>
        } />

        {/* 404 sayfası */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-gray-600">Sayfa bulunamadı</p>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App; 