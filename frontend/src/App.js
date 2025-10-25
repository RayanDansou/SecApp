import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Questionnaires from './pages/Questionnaires';
import QuestionnaireDetail from './pages/QuestionnaireDetail';
import QuestionnaireForm from './pages/QuestionnaireForm';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Routes protégées */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Routes Questionnaires */}
            <Route
              path="/questionnaires"
              element={
                <ProtectedRoute>
                  <Questionnaires />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questionnaires/new"
              element={
                <ProtectedRoute>
                  <QuestionnaireForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questionnaires/:id"
              element={
                <ProtectedRoute>
                  <QuestionnaireDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/questionnaires/:id/edit"
              element={
                <ProtectedRoute>
                  <QuestionnaireForm />
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 - Page non trouvée */}
            <Route
              path="*"
              element={
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100vh',
                  flexDirection: 'column'
                }}>
                  <h1>404 - Page non trouvée</h1>
                  <p>La page que vous recherchez n'existe pas.</p>
                </div>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
