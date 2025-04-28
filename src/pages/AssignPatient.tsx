
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Search, Plus } from 'lucide-react';

const AssignPatient = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { patients, assignRoom, getRoom } = usePatients();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const roomNumber = Number(roomId);
  const room = getRoom(roomNumber);
  
  // Filter patients who aren't assigned to any room
  const availablePatients = patients.filter(
    patient => patient.roomNumber === null || patient.roomNumber === undefined
  );
  
  // Filter based on search
  const filteredPatients = availablePatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAssignPatient = (patientId: string) => {
    assignRoom(patientId, roomNumber);
    navigate(`/room/${roomNumber}`);
  };
  
  // If room not found or has a patient already
  if (isNaN(roomNumber) || !room || room.patientId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h2 className="text-lg font-medium">Quarto não encontrado ou já ocupado</h2>
            <div className="mt-6">
              <Link to="/dashboard">
                <Button>Voltar ao Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent hover:text-primary-blue"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Vincular Paciente ao Quarto {roomNumber}</h1>
            <p className="text-gray-500 mt-1">
              Selecione um paciente para vincular a este quarto ou cadastre um novo
            </p>
            
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar paciente por nome..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Link to="/register-patient">
                <Button className="bg-primary-blue hover:bg-primary-blue/90 whitespace-nowrap">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Paciente
                </Button>
              </Link>
            </div>
            
            <div className="mt-6 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Diagnóstico</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{patient.age} anos</TableCell>
                        <TableCell>{patient.diagnosis || '-'}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm"
                            onClick={() => handleAssignPatient(patient.id)}
                            className="bg-primary-blue hover:bg-primary-blue/90"
                          >
                            Vincular ao Quarto
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10">
                        <div className="flex flex-col items-center">
                          <p className="text-gray-500 mb-4">
                            {searchTerm
                              ? `Nenhum paciente encontrado para "${searchTerm}"`
                              : 'Não há pacientes disponíveis para vinculação'}
                          </p>
                          <Link to="/register-patient">
                            <Button>
                              <Plus className="mr-2 h-4 w-4" />
                              Cadastrar Novo Paciente
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssignPatient;
