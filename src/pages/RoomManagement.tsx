
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { 
  getAllRooms, 
  createRoom, 
  updateRoom, 
  deleteRoom,
  Room as RoomType
} from '@/services/roomService';

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
  DialogTrigger,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Edit, Trash2, Search } from 'lucide-react';

// Schema de validação para o formulário
const roomSchema = z.object({
  sector: z.string().min(1, "O setor é obrigatório"),
  floor: z.number().min(0, "O andar deve ser maior ou igual a 0"),
  number: z.string().min(1, "O número do quarto é obrigatório"),
  isAvailable: z.boolean().default(true),
});

type RoomFormValues = z.infer<typeof roomSchema>;

const RoomManagement = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentRoom, setCurrentRoom] = useState<RoomType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [roomToDelete, setRoomToDelete] = useState<RoomType | null>(null);
  
  const navigate = useNavigate();
  
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      sector: '',
      floor: 0,
      number: '',
      isAvailable: true,
    },
  });
  
  // Carregar quartos
  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const data = await getAllRooms();
      setRooms(data);
    } catch (error) {
      toast.error('Erro ao carregar quartos');
      console.error('Erro ao carregar quartos:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadRooms();
  }, []);
  
  // Filtrar quartos baseado na pesquisa
  const filteredRooms = rooms.filter(
    (room) =>
      room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Abrir formulário para criar/editar
  const openRoomForm = (room?: RoomType) => {
    if (room) {
      setCurrentRoom(room);
      form.reset({
        sector: room.sector,
        floor: room.floor,
        number: room.number,
        isAvailable: room.isAvailable,
      });
    } else {
      setCurrentRoom(null);
      form.reset({
        sector: '',
        floor: 0,
        number: '',
        isAvailable: true,
      });
    }
    setDialogOpen(true);
  };
  
  // Enviar formulário
  const onSubmit = async (values: RoomFormValues) => {
    try {
      if (currentRoom?.id) {
        // Atualizar quarto existente
        await updateRoom(currentRoom.id, values);
        toast.success('Quarto atualizado com sucesso!');
      } else {
        // Criar novo quarto - garantindo que todos os campos necessários estão presentes
        await createRoom({
          sector: values.sector,
          floor: values.floor,
          number: values.number,
          isAvailable: values.isAvailable,
        });
        toast.success('Quarto criado com sucesso!');
      }
      setDialogOpen(false);
      loadRooms();
    } catch (error: any) {
      // Verificar se é um erro de validação (conflito de chave única)
      if (error.response?.status === 409) {
        toast.error('Já existe um quarto com este número no mesmo andar e setor.');
      } else {
        toast.error('Erro ao salvar quarto.');
      }
      console.error('Erro ao salvar quarto:', error);
    }
  };
  
  // Confirmar exclusão de quarto
  const confirmDelete = (room: RoomType) => {
    setRoomToDelete(room);
    setDeleteDialogOpen(true);
  };
  
  // Excluir quarto
  const handleDelete = async () => {
    if (!roomToDelete?.id) return;
    
    try {
      await deleteRoom(roomToDelete.id);
      toast.success('Quarto excluído com sucesso!');
      loadRooms();
    } catch (error) {
      toast.error('Erro ao excluir quarto');
      console.error('Erro ao excluir quarto:', error);
    } finally {
      setDeleteDialogOpen(false);
      setRoomToDelete(null);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Quartos</h1>
          <Button onClick={() => openRoomForm()}>
            <Plus className="mr-2 h-4 w-4" /> Novo Quarto
          </Button>
        </div>
        
        {/* Filtro de busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar quartos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Tabela de quartos */}
        <Card>
          <CardHeader>
            <CardTitle>Quartos</CardTitle>
            <CardDescription>
              Lista de todos os quartos registrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">Carregando...</div>
            ) : filteredRooms.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Andar</TableHead>
                      <TableHead>Número</TableHead>
                      <TableHead>Disponível</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.id}</TableCell>
                        <TableCell>{room.sector}</TableCell>
                        <TableCell>{room.floor}</TableCell>
                        <TableCell>{room.number}</TableCell>
                        <TableCell>
                          {room.isAvailable ? (
                            <span className="text-green-600">Sim</span>
                          ) : (
                            <span className="text-red-600">Não</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRoomForm(room)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => confirmDelete(room)}
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
                  <p>Nenhum quarto encontrado para "{searchTerm}"</p>
                ) : (
                  <p>Nenhum quarto cadastrado. Clique em "Novo Quarto" para adicionar.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Modal de criação/edição de quarto */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentRoom ? 'Editar Quarto' : 'Novo Quarto'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações abaixo para {currentRoom ? 'atualizar' : 'cadastrar'} um quarto.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor</FormLabel>
                      <FormControl>
                        <Input placeholder="A, B, UTI..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Informe o setor onde o quarto está localizado.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Andar</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          min={0}
                        />
                      </FormControl>
                      <FormDescription>
                        Informe o andar onde o quarto está localizado.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="101, 202..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Informe o número de identificação do quarto.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Disponível
                        </FormLabel>
                        <FormDescription>
                          Marque se o quarto está disponível para uso.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
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
                Tem certeza que deseja excluir o quarto {roomToDelete?.number} do setor {roomToDelete?.sector}?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Sim, excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default RoomManagement;
