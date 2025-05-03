
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from '@/components/ui/table';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Link as LinkIcon, 
  Unlink 
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInYears } from 'date-fns';

interface PatientData {
  id: string;
  name: string;
  cpf: string;
  gender: string;
  birthDate: string;
  minHeartRate?: number | null;
  maxHeartRate?: number | null;
  roomNumber?: number | null;
}

const PatientList = () => {
  const { patients, updatePatient } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    return differenceInYears(new Date(), new Date(birthDate));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      // Using status to implement a soft delete approach
      updatePatient(id, { status: 'empty' });
      toast.success('Paciente excluído com sucesso');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Listagem de Pacientes</h1>
            <p className="text-gray-500">Gerenciamento e visualização de todos os pacientes</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
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
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{calculateAge(patient.birthDate)} anos</TableCell>
                      <TableCell>
                        {patient.roomNumber ? (
                          <Link 
                            to={`/room/${patient.roomNumber}`} 
                            className="text-primary-blue hover:underline flex items-center"
                          >
                            <span>{patient.roomNumber}</span>
                          </Link>
                        ) : (
                          <span className="text-gray-400">Não alocado</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Link to={`/edit-patient/${patient.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {patient.roomNumber ? (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                // Lógica para desvincular o paciente do quarto
                                toast.info('Funcionalidade de desvincular em desenvolvimento');
                              }}
                            >
                              <Unlink className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Link to={`/assign-patient-to-room/${patient.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <LinkIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(patient.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      {searchTerm ? `Nenhum paciente encontrado para "${searchTerm}"` : 'Nenhum paciente cadastrado'}
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
