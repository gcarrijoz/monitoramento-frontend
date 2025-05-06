import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Link as LinkIcon, Unlink, Cpu } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import {
  Device,
  getAllDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  assignDeviceToRoom,
  unassignDevice,
  getAllDevicesWithRooms
} from '@/services/deviceService';
import { Room, getAllRooms, getRoomWithoutDevices } from '@/services/roomService';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';

const DeviceList = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [roomsDialogOpen, setRoomsDialogOpen] = useState(false);
  const [deviceToAssign, setDeviceToAssign] = useState<Device | null>(null);

  const [formData, setFormData] = useState({
    macAddress: '',
    description: '',
    isActive: true,
  });

  // Carregar dispositivos e quartos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [devicesData, roomsData] = await Promise.all([
          getAllDevicesWithRooms(),
          getRoomWithoutDevices()
        ]);
        setDevices(devicesData);
        setRooms(roomsData);
      } catch (error) {
        toast.error('Erro ao carregar dados');
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredDevices = devices.filter(device =>
    device.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (device.description && device.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const resetForm = () => {
    setFormData({
      macAddress: '',
      description: '',
      isActive: true,
    });
    setCurrentDevice(null);
  };

  const openNewDeviceDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDeviceDialog = (device: Device) => {
    setCurrentDevice(device);
    setFormData({
      macAddress: device.macAddress,
      description: device.description || '',
      isActive: device.isActive,
    });
    setIsDialogOpen(true);
  };

  const openRoomsModal = (device: Device) => {
    setDeviceToAssign(device);
    setRoomsDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(formData.macAddress)) {
      toast.error('O endereço MAC deve estar no formato XX:XX:XX:XX:XX:XX');
      return;
    }
    
    try {
      if (currentDevice) {
        const updatedDevice = await updateDevice(currentDevice.id, {
          macAddress: formData.macAddress,
          description: formData.description,
          isActive: formData.isActive,
        });
        setDevices(devices.map(d => d.id === currentDevice.id ? updatedDevice : d));
      } else {
        const newDevice = await createDevice({
          macAddress: formData.macAddress,
          description: formData.description,
          isActive: formData.isActive,
        });
        setDevices([...devices, newDevice]);
      }
      
      setIsDialogOpen(false);
      resetForm();
      toast.success('Dispositivo salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar dispositivo');
      console.error('Erro:', error);
    }
  };

  const handleAssignToRoom = async (roomId: number) => {
    if (!deviceToAssign) return;
    
    try {
      await assignDeviceToRoom(deviceToAssign.id, roomId);
      // Atualizar lista de dispositivos
      const updatedDevices = await getAllDevicesWithRooms();
      setDevices(updatedDevices);
      
      toast.success(`Dispositivo vinculado ao quarto ${roomId} com sucesso!`);
      setRoomsDialogOpen(false);
      setDeviceToAssign(null);
    } catch (error) {
      toast.error('Erro ao vincular dispositivo ao quarto');
      console.error('Erro:', error);
    }
  };

  const handleUnassignDevice = async (deviceId: number) => {
    try {
      await unassignDevice(deviceId);
      // Atualizar lista de dispositivos
      const updatedDevices = await getAllDevicesWithRooms();
      setDevices(updatedDevices);
      
      toast.success('Dispositivo desvinculado com sucesso!');
    } catch (error) {
      toast.error('Erro ao desvincular dispositivo');
      console.error('Erro:', error);
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    try {
      await deleteDevice(deviceId);
      setDevices(devices.filter(d => d.id !== deviceId));
      toast.success('Dispositivo excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir dispositivo');
      console.error('Erro:', error);
    }
  };

  const getRoomNumber = (roomId?: number | null) => {
    if (!roomId) return null;
    const room = rooms.find(r => r.id === roomId);
    return room ? room.number : null;
  };



  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Dispositivos</h1>
            <p className="text-gray-500">Cadastro e monitoramento dos dispositivos de medição</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button 
              className="bg-primary-blue hover:bg-primary-blue/90 flex items-center"
              onClick={openNewDeviceDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Dispositivo
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por MAC ou descrição..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Endereço MAC</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Quarto</TableHead>
                    <TableHead className="w-[100px] text-center">Status</TableHead>
                    <TableHead className="w-[200px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.length > 0 ? (
                    filteredDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-mono">{device.macAddress}</TableCell>
                        <TableCell>{device.description || '-'}</TableCell>
                        <TableCell>
                          {device.roomId ? (
                            <span className="text-primary-blue">
                            <strong>Setor:</strong> {device.room.sector} | <strong>Andar:</strong> {device.room.floor} | <strong>Número:</strong> {device.room.number}
                          </span>
                          ) : (
                            <span className="text-gray-400">Não vinculado</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={device.isActive ? "default" : "destructive"}>
                            {device.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDeviceDialog(device)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            {device.roomId ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnassignDevice(device.id)}
                              >
                                <Unlink className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRoomsModal(device)}
                                disabled={!device.isActive}
                              >
                                <LinkIcon className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 border-red-200 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o dispositivo {device.macAddress}?
                                    {device.roomId && (
                                      <p className="mt-2 text-red-500">
                                        Atenção: Este dispositivo está vinculado ao Quarto {getRoomNumber(device.roomId)}.
                                      </p>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteDevice(device.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum dispositivo encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {/* Add/Edit Device Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentDevice ? 'Editar Dispositivo' : 'Adicionar Novo Dispositivo'}
              </DialogTitle>
              <DialogDescription>
                {currentDevice 
                  ? 'Atualize as informações do dispositivo.'
                  : 'Preencha as informações para cadastrar um novo dispositivo.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="macAddress">Endereço MAC <span className="text-red-500">*</span></Label>
                  <Input
                    id="macAddress"
                    name="macAddress"
                    placeholder="Ex: AA:BB:CC:DD:EE:FF"
                    value={formData.macAddress}
                    onChange={handleFormChange}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Formato: XX:XX:XX:XX:XX:XX
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Descrição do dispositivo"
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Dispositivo ativo
                  </Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary-blue hover:bg-primary-blue/90"
                >
                  {currentDevice ? 'Salvar Alterações' : 'Cadastrar Dispositivo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Rooms Assignment Dialog */}
        <Dialog open={roomsDialogOpen} onOpenChange={setRoomsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {deviceToAssign && (
                  <div className="flex items-center gap-2">
                    <span>Vincular dispositivo:</span>
                    <Badge variant="outline">
                      <Cpu className="h-4 w-4 mr-2" />
                      {deviceToAssign.macAddress}
                    </Badge>
                  </div>
                )}
              </DialogTitle>
              <DialogDescription>
                Selecione um quarto para vincular o dispositivo
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="border rounded-md max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setor</TableHead>
                    <TableHead>Andar</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id} className="hover:bg-gray-50">
                      <TableCell>{room.sector}</TableCell>
                      <TableCell>{room.floor}º</TableCell>
                      <TableCell>Quarto {room.number}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleAssignToRoom(room.id)}
                        >
                          Vincular
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => {
                  setRoomsDialogOpen(false);
                  setDeviceToAssign(null);
                }}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default DeviceList;