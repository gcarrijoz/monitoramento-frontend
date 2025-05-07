import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import { Heart } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth(); // Função de Signup no AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await register(name, email, password);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout requireAuth={false}>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg animate-fade-in">
          <div className="text-center">
            <div className="flex justify-center">
              <Heart className="h-12 w-12 text-primary-blue" />
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              <span className="text-primary-blue">Batimentos</span>
              <span className="text-gray-900">3000</span>
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Sistema de Monitoramento de Pacientes
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@hospital.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-primary-blue hover:bg-primary-blue/90"
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
          <div className="text-center text-sm text-gray-500">
              <p className="mt-2">
                Já possui conta? <a href="/login" className='text-blue-500'>Faça login</a>
              </p>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
