
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Heart, Edit } from 'lucide-react';

const PatientList = () => {
  const { patients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusClasses = {
    normal: 'text-status-normal',
    warning: 'text-status-warning',
    alert: 'text-status-alert',
    urgent: 'text-status-urgent',
    empty: 'text-gray-400',
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Listagem de Pacientes</h1>
            <p className="text-gray-500">Gerenciamento e visualização de todos os pacientes</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link to="/register-patient">
              <Button className="bg-primary-blue hover:bg-primary-blue/90">
                <Plus className="mr-2 h-4 w-4" />
                Novo Paciente
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar paciente por nome..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Quarto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Freq. Cardíaca</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.age} anos</TableCell>
                      <TableCell>
                        {patient.roomNumber ? (
                          <Link 
                            to={`/room/${patient.roomNumber}`} 
                            className="text-primary-blue hover:underline"
                          >
                            {patient.roomNumber}
                          </Link>
                        ) : (
                          <span className="text-gray-400">Não alocado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Heart 
                            className={`h-4 w-4 mr-1.5 ${statusClasses[patient.status]} ${patient.status !== 'normal' && patient.status !== 'empty' ? 'animate-pulse' : ''}`}
                            fill={patient.status !== 'empty' ? 'currentColor' : 'none'} 
                          />
                          <span className={statusClasses[patient.status]}>
                            {patient.status === 'normal' ? 'Normal' :
                             patient.status === 'warning' ? 'Atenção' :
                             patient.status === 'alert' ? 'Alerta' :
                             patient.status === 'urgent' ? 'Urgente' :
                             'Não monitorado'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.currentHeartRate ? `${patient.currentHeartRate} bpm` : '--'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link to={`/patient/${patient.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Nenhum paciente encontrado para "{searchTerm}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientList;
