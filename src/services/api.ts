// src/services/api.ts
import axios from 'axios';

// Criação de uma instância do axios com as configurações padrão
const api = axios.create({
  baseURL: 'http://localhost:3000', // URL base da API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Se você quiser adicionar o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
