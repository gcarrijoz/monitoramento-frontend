import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import RoomCard from '@/components/RoomCard';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { getRoomsWithPatients, Room } from '@/services/roomService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUnassignedPatients, assignPatientToRoom } from '@/services/patientService';
import { useBPMs } from '@/hooks/useBPMs';

const Dashboard = () => {
  const { alerts } = usePatients();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [unassignedPatients, setUnassignedPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loadingPatients, setLoadingPatients] = useState<boolean>(false);
  const [patientBpmMap, setPatientBpmMap] = useState<Record<number, number>>({});

  
  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const data = await getRoomsWithPatients();
      setRooms(data);
    } catch (error) {
      toast.error('Erro ao carregar quartos');
      console.error('Erro ao carregar quartos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnassignedPatients = async () => {
    try {
      setLoadingPatients(true);
      const patients = await getUnassignedPatients();
      setUnassignedPatients(patients);
    } catch (error) {
      toast.error('Erro ao carregar pacientes sem quarto');
      console.error('Erro ao carregar pacientes sem quarto:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleAssignPatient = async () => {
    if (!selectedRoom?.id || !selectedPatientId) return;
    
    try {
      await assignPatientToRoom(selectedPatientId, selectedRoom.id);
      toast.success('Paciente atribuído ao quarto com sucesso!');
      loadRooms(); // Atualiza a lista de quartos
      setAssignDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao atribuir paciente ao quarto');
      console.error('Erro ao atribuir paciente ao quarto:', error);
    }
  };

  const openAssignDialog = (room: Room) => {
    setSelectedRoom(room);
    loadUnassignedPatients();
    setAssignDialogOpen(true);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const { bpmDataMap } = useBPMs();

  const occupiedRoomsCount = rooms.filter(room => !room.isAvailable).length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Quartos</h1>
            <p className="text-gray-500">Monitoramento em tempo real dos pacientes</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">            
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
              <span className="text-3xl font-bold">{occupiedRoomsCount}</span>
              <span className="text-sm text-gray-500 mb-1">de {rooms.length}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-medium text-gray-500">Alertas Ativos</h3>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-bold">{3}</span>
              {3 > 0 && (
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
          {rooms.map((room) => {
            const bpmData = bpmDataMap[room.id];
            return (
            <RoomCard 
              key={room.id}
              room={room}
              bpmData = {bpmData}
              onAssignClick={() => openAssignDialog(room)}
            />
          )})}
        </div>

        {/* Modal de Atribuição de Paciente */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Atribuir Paciente ao Quarto {selectedRoom?.number}
              </DialogTitle>
              <DialogDescription>
                Selecione um paciente para atribuir ao quarto.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              {loadingPatients ? (
                <div className="text-center py-4">Carregando pacientes disponíveis...</div>
              ) : unassignedPatients.length === 0 ? (
                <div className="text-center py-4">Não há pacientes sem quartos atribuídos.</div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Paciente
                    </label>
                    <Select onValueChange={(value) => setSelectedPatientId(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id || ''}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setAssignDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAssignPatient} 
                disabled={!selectedPatientId || loadingPatients}
              >
                Atribuir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Dashboard;