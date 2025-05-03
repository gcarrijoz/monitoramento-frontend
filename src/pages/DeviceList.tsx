
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useDevices, Device } from '@/contexts/DeviceContext';
import { usePatients } from '@/contexts/PatientContext';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const DeviceList = () => {
  // Context and state
  const { devices, addDevice, updateDevice, deleteDevice, assignDeviceToRoom, unassignDevice } = useDevices();
  const { rooms } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    macAddress: '',
    description: '',
    isActive: true,
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  
  // Filtered devices based on search term
  const filteredDevices = devices.filter(device =>
    device.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (device.description && device.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Available rooms (not already assigned)
  const availableRooms = rooms.filter(room => room.active);
  
  // Reset form
  const resetForm = () => {
    setFormData({
      macAddress: '',
      description: '',
      isActive: true,
    });
    setCurrentDevice(null);
  };

  // Open dialog for new device
  const openNewDeviceDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open dialog to edit device
  const openEditDeviceDialog = (device: Device) => {
    setCurrentDevice(device);
    setFormData({
      macAddress: device.macAddress,
      description: device.description || '',
      isActive: device.isActive,
    });
    setIsDialogOpen(true);
  };

  // Open dialog to assign device to room
  const openAssignDialog = (device: Device) => {
    setCurrentDevice(device);
    setSelectedRoomId('');
    setIsAssignDialogOpen(true);
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, isActive: checked });
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate MAC address
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(formData.macAddress)) {
      toast.error('O endereço MAC deve estar no formato XX:XX:XX:XX:XX:XX');
      return;
    }
    
    if (currentDevice) {
      // Update device
      updateDevice(currentDevice.id, {
        macAddress: formData.macAddress,
        description: formData.description,
        isActive: formData.isActive,
      });
    } else {
      // Create new device
      addDevice({
        macAddress: formData.macAddress,
        description: formData.description,
        isActive: formData.isActive,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  // Handle device assignment
  const handleAssignDevice = () => {
    if (currentDevice && selectedRoomId) {
      assignDeviceToRoom(currentDevice.id, parseInt(selectedRoomId));
      setIsAssignDialogOpen(false);
      setCurrentDevice(null);
      setSelectedRoomId('');
    } else {
      toast.error('Selecione um quarto para vincular o dispositivo');
    }
  };

  // Handle device unassignment
  const handleUnassignDevice = (deviceId: number) => {
    unassignDevice(deviceId);
  };

  // Get room number for a device
  const getRoomNumber = (roomId?: number | null) => {
    if (!roomId) return null;
    const room = rooms.find(r => r.number === roomId);
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

        {/* Search and filters */}
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
        
        {/* Devices Table */}
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
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            Quarto {getRoomNumber(device.roomId)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {device.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                            Inativo
                          </span>
                        )}
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
                              onClick={() => openAssignDialog(device)}
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
                                  onClick={() => deleteDevice(device.id)}
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
        
        {/* Assign Device to Room Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vincular Dispositivo ao Quarto</DialogTitle>
              <DialogDescription>
                Selecione um quarto para vincular o dispositivo {currentDevice?.macAddress}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="roomSelect">Selecione o Quarto</Label>
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                  <SelectTrigger id="roomSelect">
                    <SelectValue placeholder="Selecione um quarto" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map(room => (
                      <SelectItem key={room.number} value={room.number.toString()}>
                        Quarto {room.number} - {room.sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2 text-sm text-amber-600">
                <div className="flex items-start">
                  <Cpu className="h-4 w-4 mr-2 mt-0.5" />
                  <p>
                    Ao vincular este dispositivo a um quarto, qualquer outro dispositivo já vinculado
                    ao mesmo quarto será automaticamente desvinculado.
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAssignDevice}
                className="bg-primary-blue hover:bg-primary-blue/90"
                disabled={!selectedRoomId}
              >
                Vincular
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default DeviceList;
