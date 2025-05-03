// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import api from '../services/api'; // Importando o arquivo da API

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log(response); // Verifique a resposta aqui
      const { token, user } = response.data;
  
      // Armazenar o token no localStorage
      localStorage.setItem('token', token);
  
      setUser(user);
      toast.success(`Bem-vindo(a), ${user.name}!`);
      return true;
    } catch (error) {
      console.error(error); // Log do erro
      toast.error('E-mail ou senha inválidos');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);

      setUser(user);
      toast.success(`Cadastro realizado! Bem-vindo(a), ${user.name}`);
      return true;
    } catch (error) {
      toast.error('Erro ao cadastrar usuário');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Você saiu do sistema');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
