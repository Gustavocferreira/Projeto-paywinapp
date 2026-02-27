/**
 * API Client - Axios instance configurado
 * Comunicação com APIs Python e Go
 */

import axios, { AxiosInstance } from 'axios';

const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
const GO_API_URL = process.env.NEXT_PUBLIC_GO_API_URL || 'http://localhost:8080';

// Python API Client (operações principais)
export const pythonApi: AxiosInstance = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Go API Client (rotas de alta performance)
export const goApi: AxiosInstance = axios.create({
  baseURL: GO_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adicionar token de autenticação
pythonApi.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

goApi.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - tratamento de erros
pythonApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default { pythonApi, goApi };
