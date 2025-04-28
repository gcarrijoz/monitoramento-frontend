
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'nurse' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // Mock user data (in a real app, this would come from an API)
  const mockUsers = [
    {
      id: '1',
      name: 'Dr. Maria Silva',
      email: 'maria@hospital.com',
      password: 'password123',
      role: 'doctor' as const,
    },
    {
      id: '2',
      name: 'Enf. João Santos',
      email: 'joao@hospital.com',
      password: 'password123',
      role: 'nurse' as const,
    },
  ];

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      toast.success(`Bem-vindo(a), ${foundUser.name}!`);
      return true;
    } else {
      toast.error('E-mail ou senha inválidos');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast.info('Você saiu do sistema');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
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
