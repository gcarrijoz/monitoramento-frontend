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
  Patient,
  assignPatientToRoom,
  unassignPatient,
  getAllPatientsWithRooms
} from '@/services/patientService';
import { getAvailableRooms, Room } from '@/services/roomService';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Link as LinkIcon, Unlink, User, Bed } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const patientSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(11, "CPF deve ter 11 dígitos"),
  gender: z.string().min(1, "O gênero é obrigatório"),
  dateOfBirth: z.string().min(1, "A data de nascimento é obrigatória"),
  minHeartRate: z.number().min(0, "Valor mínimo deve ser maior ou igual a 0").default(55),
  maxHeartRate: z.number().min(0, "Valor máximo deve ser maior ou igual a 0").default(120)
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
  const [unassignDialogOpen, setUnassignDialogOpen] = useState<boolean>(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [patientToAssign, setPatientToAssign] = useState<Patient | null>(null);
  const [patientToUnassign, setPatientToUnassign] = useState<Patient | null>(null);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [availableRoomsDialogOpen, setAvailableRoomsDialogOpen] = useState<boolean>(false);
  const [roomSearchTerm, setRoomSearchTerm] = useState('');
  
  const navigate = useNavigate();
  
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      cpf: '',
      gender: '',
      dateOfBirth: '',
      minHeartRate: 55,
      maxHeartRate: 120,
    },
  });

  // Carregar pacientes
  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const data = await getAllPatientsWithRooms();
      setPatients(data.filter(patient => patient.status !== 'inactive'));
    } catch (error) {
      toast.error('Erro ao carregar pacientes');
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar quartos disponíveis
  const loadAvailableRooms = async () => {
    try {
      setLoadingRooms(true);
      const rooms = await getAvailableRooms();
      setAvailableRooms(rooms);
    } catch (error) {
      toast.error('Erro ao carregar quartos disponíveis');
      console.error('Erro ao carregar quartos disponíveis:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableRooms = availableRooms.filter(room =>
    room.number.toLowerCase().includes(roomSearchTerm.toLowerCase()) ||
    room.sector.toLowerCase().includes(roomSearchTerm.toLowerCase())
  );

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  // Abrir modal de quartos disponíveis
  const openAvailableRoomsModal = async (patient?: Patient) => {
    try {
      setLoadingRooms(true);
      if (patient) {
        setPatientToAssign(patient);
      }
      const rooms = await getAvailableRooms();
      setAvailableRooms(rooms);
      setAvailableRoomsDialogOpen(true);
    } catch (error) {
      toast.error('Erro ao carregar quartos disponíveis');
      console.error('Erro:', error);
    } finally {
      setLoadingRooms(false);
    }
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
        await updatePatient(currentPatient.id, values);
        toast.success('Paciente atualizado com sucesso!');
      } else {
        const newPatient: Omit<Patient, 'id'> = {
          name: values.name,
          cpf: values.cpf,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth,
          minHeartRate: values.minHeartRate,
          maxHeartRate: values.maxHeartRate
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

  // Confirmar desvinculação de quarto
  const confirmUnassign = (patient: Patient) => {
    setPatientToUnassign(patient);
    setUnassignDialogOpen(true);
  };

  // Desvincular paciente do quarto
  const handleUnassignPatient = async () => {
    if (!patientToUnassign?.id) return;
    
    try {
      await unassignPatient(patientToUnassign.id);
      toast.success('Paciente desvinculado do quarto com sucesso!');
      loadPatients();
    } catch (error) {
      toast.error('Erro ao desvincular paciente do quarto');
      console.error('Erro ao desvincular paciente do quarto:', error);
    } finally {
      setUnassignDialogOpen(false);
      setPatientToUnassign(null);
    }
  };

  // Atribuir paciente a quarto
  const handleAssignRoom = async (roomId: number) => {
    if (!patientToAssign?.id) return;
    
    try {
      await assignPatientToRoom(patientToAssign.id, roomId);
      toast.success('Paciente atribuído ao quarto com sucesso!');
      loadPatients();
      setAvailableRoomsDialogOpen(false);
      setPatientToAssign(null);
    } catch (error) {
      toast.error('Erro ao atribuir paciente ao quarto');
      console.error('Erro ao atribuir paciente ao quarto:', error);
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
            <Button 
              variant="outline" 
              onClick={() => openAvailableRoomsModal()}
              className="flex items-center"
            >
              <Bed className="mr-2 h-4 w-4" />
              Quartos Disponíveis
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
                              <span className="text-primary-blue">
                                <strong>Setor:</strong> {patient.room.sector} | <strong>Andar:</strong> {patient.room.floor} | <strong>Número:</strong> {patient.room.number}
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
                                onClick={() => confirmUnassign(patient)}
                              >
                                <Unlink className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openAvailableRoomsModal(patient)}
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
                              onClick={() => confirmDelete(patient)}
                              className="text-red-600"
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
                            {...field}
                            value={field.value || 60} 
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? 60 : Number(value));
                            }}
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
                          {...field}
                          value={field.value || 100} // Garante que nunca será vazio
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? 100 : Number(value));
                          }}
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
        
        {/* Modal de Quartos Disponíveis */}
        <Dialog open={availableRoomsDialogOpen} onOpenChange={setAvailableRoomsDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {patientToAssign ? (
                  <div className="flex items-center gap-2">
                    <span>Atribuir quarto a:</span>
                    <Badge variant="outline">
                      <User className="h-4 w-4 mr-2" />
                      {patientToAssign.name}
                    </Badge>
                  </div>
                ) : (
                  'Quartos Disponíveis'
                )}
              </DialogTitle>
              <DialogDescription>
                {availableRooms.length} quarto(s) disponível(is) para alocação
              </DialogDescription>
            </DialogHeader>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar quartos por número ou setor..."
                  value={roomSearchTerm}
                  onChange={(e) => setRoomSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="py-2">
              {loadingRooms ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-2">Carregando quartos...</span>
                </div>
              ) : filteredAvailableRooms.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Bed className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="font-medium">
                    {roomSearchTerm ? 
                      'Nenhum quarto encontrado para sua busca' : 
                      'Nenhum quarto disponível no momento'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {roomSearchTerm ? 
                      'Tente buscar por outro termo' : 
                      'Todos os quartos estão ocupados'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-md max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Setor</TableHead>
                        <TableHead>Andar</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Status</TableHead>
                        {patientToAssign && <TableHead className="text-right">Ação</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAvailableRooms.map((room) => (
                        <TableRow key={room.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{room.sector}</TableCell>
                          <TableCell>{room.floor}º</TableCell>
                          <TableCell>{room.number}</TableCell>
                          <TableCell>
                            <Badge variant={room.isAvailable ? "default" : "destructive"}>
                              {room.isAvailable ? "Disponível" : "Ocupado"}
                            </Badge>
                          </TableCell>
                          {patientToAssign && (
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => handleAssignRoom(room.id)}
                              >
                                Atribuir
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => {
                  setAvailableRoomsDialogOpen(false);
                  setPatientToAssign(null);
                  setRoomSearchTerm('');
                }}
                className="min-w-[100px]"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Diálogo de confirmação para desvincular paciente do quarto */}
        <AlertDialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Desvincular paciente do quarto</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja desvincular o paciente {patientToUnassign?.name} do quarto?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnassignPatient}>
                Sim, desvincular
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default PatientList;