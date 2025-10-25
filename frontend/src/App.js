import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Pages CHEF_PROJET
import AvailableQuestionnaires from './pages/chef_projet/AvailableQuestionnaires';
import FillQuestionnaire from './pages/chef_projet/FillQuestionnaire';
import MyResponses from './pages/chef_projet/MyResponses';
import ResponseDetail from './pages/chef_projet/ResponseDetail';

// Pages ANALYSTE
import SubmittedResponses from './pages/analyste/SubmittedResponses';

// Pages BUSINESS_OWNER
import ValidatedResponses from './pages/business_owner/ValidatedResponses';

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

            {/* Routes CHEF_PROJET */}
            <Route
              path="/available-questionnaires"
              element={
                <ProtectedRoute allowedRoles={['CHEF_PROJET']}>
                  <AvailableQuestionnaires />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fill-questionnaire/:id"
              element={
                <ProtectedRoute allowedRoles={['CHEF_PROJET']}>
                  <FillQuestionnaire />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-responses"
              element={
                <ProtectedRoute allowedRoles={['CHEF_PROJET']}>
                  <MyResponses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/response/:id"
              element={
                <ProtectedRoute allowedRoles={['CHEF_PROJET', 'ANALYSTE', 'BUSINESS_OWNER']}>
                  <ResponseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/response/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['CHEF_PROJET']}>
                  <FillQuestionnaire />
                </ProtectedRoute>
              }
            />

            {/* Routes ANALYSTE */}
            <Route
              path="/analyste/submitted-responses"
              element={
                <ProtectedRoute allowedRoles={['ANALYSTE']}>
                  <SubmittedResponses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyste/response/:id"
              element={
                <ProtectedRoute allowedRoles={['ANALYSTE']}>
                  <ResponseDetail />
                </ProtectedRoute>
              }
            />

            {/* Routes BUSINESS_OWNER */}
            <Route
              path="/business-owner/validated-responses"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                  <ValidatedResponses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business-owner/response/:id"
              element={
                <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                  <ResponseDetail />
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
