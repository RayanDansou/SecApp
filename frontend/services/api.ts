/**
 * API Service - Centralized API calls
 * Will be extended in future phases
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token (Phase 1+)
api.interceptors.request.use(
  (config) => {
    // JWT token will be added here in Phase 1
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling will be enhanced in future phases
    return Promise.reject(error);
  }
);

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/healthz/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;