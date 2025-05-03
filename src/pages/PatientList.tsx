import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/Layout';
import {
  getAllPatients,
  createPatient,
  updatePatient,
  deletePatient,
  Patient
} from '@/services/patientService';
import { toast } from 'sonner';
import { differenceInYears } from 'date-fns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Link as LinkIcon, Unlink } from 'lucide-react';

// Schema de validação para o formulário
const patientSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(11, "CPF deve ter 11 dígitos"),
  gender: z.string().min(1, "O gênero é obrigatório"),
  dateOfBirth: z.string().min(1, "A data de nascimento é obrigatória"),
  minHeartRate: z.number().min(0, "Valor mínimo deve ser maior ou igual a 0").optional(),
  maxHeartRate: z.number().min(0, "Valor máximo deve ser maior ou igual a 0").optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  
  const navigate = useNavigate();
  
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      cpf: '',
      gender: '',
      dateOfBirth: '',
      minHeartRate: undefined,
      maxHeartRate: undefined,
    },
  });

  // Carregar pacientes
  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const data = await getAllPatients();
      setPatients(data.filter(patient => patient.status !== 'inactive'));
    } catch (error) {
      toast.error('Erro ao carregar pacientes');
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  // Abrir formulário para criar/editar
  const openPatientForm = (patient?: Patient) => {
    if (patient) {
      setCurrentPatient(patient);

      const formattedDate = patient.dateOfBirth 
      ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
      : '';

      form.reset({
        name: patient.name,
        cpf: patient.cpf,
        gender: patient.gender,
        dateOfBirth: formattedDate,
        minHeartRate: patient.minHeartRate || undefined,
        maxHeartRate: patient.maxHeartRate || undefined,
      });
    } else {
      setCurrentPatient(null);
      form.reset({
        name: '',
        cpf: '',
        gender: '',
        dateOfBirth: '',
        minHeartRate: undefined,
        maxHeartRate: undefined,
      });
    }
    setDialogOpen(true);
  };

  // Enviar formulário
  const onSubmit = async (values: PatientFormValues) => {
    try {
      if (currentPatient?.id) {
        // Atualizar paciente existente
        await updatePatient(currentPatient.id, values);
        toast.success('Paciente atualizado com sucesso!');
      } else {
        const newPatient: Omit<Patient, 'id'> = {
          name: values.name,
          cpf: values.cpf,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth,
          minHeartRate: values.minHeartRate || null,
          maxHeartRate: values.maxHeartRate || null
        };
        await createPatient(newPatient);
        toast.success('Paciente criado com sucesso!');
      }
      setDialogOpen(false);
      loadPatients();
    } catch (error: any) {
      toast.error('Erro ao salvar paciente');
      console.error('Erro ao salvar paciente:', error);
    }
  };

  // Confirmar exclusão
  const confirmDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  // Executar exclusão
  const handleDelete = async () => {
    if (!patientToDelete?.id) return;
        
    try {
      await deletePatient(patientToDelete.id);
      toast.success('Paciente excluído com sucesso!');
      loadPatients();
    } catch (error) {
      toast.error('Erro ao excluir paciente');
      console.error('Erro ao excluir paciente:', error);
    } finally {
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
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
            <Button onClick={() => openPatientForm()} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </div>
        </div>
        
        {/* Filtro de busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar paciente por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Tabela de pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes</CardTitle>
            <CardDescription>
              Lista de todos os pacientes registrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">Carregando...</div>
            ) : filteredPatients.length > 0 ? (
              <div className="rounded-md border">
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
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.name}</TableCell>
                        <TableCell>{calculateAge(patient.dateOfBirth)} anos</TableCell>
                        <TableCell>
                          {patient.roomId ? (
                            <span 
                              className="text-primary-blue hover:underline cursor-pointer"
                              onClick={() => navigate(`/room/${patient.roomId}`)}
                            >
                              {patient.roomId}
                            </span>
                          ) : (
                            <span className="text-gray-400">Não alocado</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {patient.roomId ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Lógica para desvincular o paciente do quarto
                                  toast.info('Funcionalidade de desvincular em desenvolvimento');
                                }}
                              >
                                <Unlink className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/assign-patient-to-room/${patient.id}`)}
                              >
                                <LinkIcon className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPatientForm(patient)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => confirmDelete(patient)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                {searchTerm ? (
                  <p>Nenhum paciente encontrado para "{searchTerm}"</p>
                ) : (
                  <p>Nenhum paciente cadastrado. Clique em "Novo Paciente" para adicionar.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Modal de criação/edição de paciente */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentPatient ? 'Editar Paciente' : 'Novo Paciente'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para {currentPatient ? 'atualizar' : 'cadastrar'} um paciente.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <FormControl>
                        <Input placeholder="Masculino, Feminino, Outro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minHeartRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência Cardíaca Mínima</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="60"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="maxHeartRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência Cardíaca Máxima</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de confirmação de exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o paciente {patientToDelete?.name}?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-red-600 hover:bg-red-700"
              >
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default PatientList;