
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const AssignPatientToRoom = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { getPatient, rooms, assignRoom } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  
  const patient = patientId ? getPatient(patientId) : undefined;
  
  // Filter only empty rooms
  const availableRooms = rooms.filter(room => room.status === 'empty');
  const filteredRooms = availableRooms.filter(room => 
    room.number.toString().includes(searchTerm)
  );

  // Handle room assignment
  const handleAssignRoom = (roomNumber: number) => {
    if (patientId) {
      assignRoom(patientId, roomNumber);
      navigate(`/patient/${patientId}`);
    }
  };

  if (!patient) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h2 className="text-lg font-medium">Paciente não encontrado</h2>
            <div className="mt-6">
              <Link to="/patients">
                <Button>Voltar para Listagem</Button>
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
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Vincular {patient.name} a um Quarto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full max-w-sm mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar quarto por número..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número do Quarto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                      <TableRow key={room.number}>
                        <TableCell className="font-medium">Quarto {room.number}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            Disponível
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm"
                            onClick={() => handleAssignRoom(room.number)}
                            className="bg-primary-blue hover:bg-primary-blue/90"
                          >
                            Vincular Paciente
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        <p className="text-gray-500">
                          {searchTerm ? `Nenhum quarto encontrado para "${searchTerm}"` : 'Nenhum quarto disponível no momento'}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AssignPatientToRoom;
