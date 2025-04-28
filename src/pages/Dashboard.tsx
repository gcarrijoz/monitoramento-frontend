
import React from 'react';
import Layout from '@/components/Layout';
import RoomCard from '@/components/RoomCard';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';

const Dashboard = () => {
  const { rooms, alerts } = usePatients();
  
  // Calculate stats
  const occupiedRooms = rooms.filter(room => room.status !== 'empty').length;
  const alertRooms = rooms.filter(room => ['warning', 'alert', 'urgent'].includes(room.status)).length;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Quartos</h1>
            <p className="text-gray-500">Monitoramento em tempo real dos pacientes</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Link to="/register-patient">
              <Button className="bg-primary-blue hover:bg-primary-blue/90 flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
            </Link>
            
            <Link to="/patients">
              <Button variant="outline" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Ver Pacientes
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {/* Summary cards */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-medium text-gray-500">Total de Quartos</h3>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold">{rooms.length}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-medium text-gray-500">Quartos Ocupados</h3>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold">{occupiedRooms}</span>
              <span className="text-sm text-gray-500 mb-1">de {rooms.length}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-medium text-gray-500">Alertas Ativos</h3>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold">{alertRooms}</span>
              {alertRooms > 0 && (
                <span className="text-xs mb-1 px-2 py-0.5 rounded-full bg-status-urgent/10 text-status-urgent">
                  Atenção necessária
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-medium text-gray-500">Notificações</h3>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold">{alerts.length}</span>
              <span className="text-xs mb-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                Últimas 24h
              </span>
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Todos os Quartos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.number} roomNumber={room.number} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
