
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, BarChart4, Clock, RefreshCw, Settings as SettingsIcon, Heart } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-500">Ajustes e preferências do sistema</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Parâmetros de Monitoramento
              </CardTitle>
              <CardDescription>
                Configurações gerais para limites de alerta padrão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Limites Padrão para Novos Pacientes</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Mínimo (bpm)</label>
                      <input
                        type="number"
                        defaultValue={60}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Máximo (bpm)</label>
                      <input
                        type="number"
                        defaultValue={100}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full bg-primary-blue hover:bg-primary-blue/90">
                  Salvar Parâmetros
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardContent>
              <div className="mt-8 bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-medium mb-1">Usuário Atual</h3>
                <p className="text-sm text-gray-500">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-sm text-gray-500">{user?.email || 'Email não disponível'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
