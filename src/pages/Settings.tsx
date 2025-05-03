
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
                <Bell className="h-5 w-5 mr-2" />
                Preferências de Notificações
              </CardTitle>
              <CardDescription>
                Configure como você deseja receber os alertas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Alertas sonoros</h3>
                    <p className="text-sm text-gray-500">Tocar som quando houver alerta urgente</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" id="sound-alert" className="sr-only peer" defaultChecked />
                    <label
                      htmlFor="sound-alert"
                      className="h-6 w-11 bg-gray-200 peer-checked:bg-primary-blue rounded-full cursor-pointer transition-colors relative inline-block peer-disabled:opacity-50"
                    >
                      <span className="h-5 w-5 bg-white absolute rounded-full top-0.5 left-0.5 transition-transform peer-checked:translate-x-5" />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificações push</h3>
                    <p className="text-sm text-gray-500">Receber notificações mesmo fora do app</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" id="push-notif" className="sr-only peer" />
                    <label
                      htmlFor="push-notif"
                      className="h-6 w-11 bg-gray-200 peer-checked:bg-primary-blue rounded-full cursor-pointer transition-colors relative inline-block peer-disabled:opacity-50"
                    >
                      <span className="h-5 w-5 bg-white absolute rounded-full top-0.5 left-0.5 transition-transform peer-checked:translate-x-5" />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Alerta por e-mail</h3>
                    <p className="text-sm text-gray-500">Enviar resumo de alertas por e-mail</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" id="email-alert" className="sr-only peer" />
                    <label
                      htmlFor="email-alert"
                      className="h-6 w-11 bg-gray-200 peer-checked:bg-primary-blue rounded-full cursor-pointer transition-colors relative inline-block peer-disabled:opacity-50"
                    >
                      <span className="h-5 w-5 bg-white absolute rounded-full top-0.5 left-0.5 transition-transform peer-checked:translate-x-5" />
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                
                <div>
                  <h3 className="font-medium mb-2">Sensibilidade de Alertas</h3>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="medium"
                  >
                    <option value="low">Baixa (menos alertas)</option>
                    <option value="medium">Média (padrão)</option>
                    <option value="high">Alta (mais alertas)</option>
                  </select>
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
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Preferências gerais da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <BarChart4 className="h-5 w-5 mt-0.5 text-primary-blue mr-2" />
                    <div>
                      <h3 className="font-medium">Exibição de Dados</h3>
                      <p className="text-sm text-gray-500 mb-4">Preferências para gráficos e tabelas</p>
                      <Button size="sm" variant="outline">Configurar</Button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <RefreshCw className="h-5 w-5 mt-0.5 text-primary-blue mr-2" />
                    <div>
                      <h3 className="font-medium">Taxa de Atualização</h3>
                      <p className="text-sm text-gray-500 mb-4">Frequência de leitura dos dados</p>
                      <Button size="sm" variant="outline">Configurar</Button>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mt-0.5 text-primary-blue mr-2" />
                    <div>
                      <h3 className="font-medium">Horários de Alertas</h3>
                      <p className="text-sm text-gray-500 mb-4">Configuração de janelas de tempo</p>
                      <Button size="sm" variant="outline">Configurar</Button>
                    </div>
                  </div>
                </div>
              </div>
              
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
