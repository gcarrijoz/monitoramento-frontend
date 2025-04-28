import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  ChevronUp, 
  ChevronDown, 
  Filter,
  Bed, 
  AirVent, 
  WifiHigh,
  Plug, 
  LampDesk,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RoomList = () => {
  const { rooms, toggleRoomActive } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [floorFilter, setFloorFilter] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [bathroomFilter, setBathroomFilter] = useState<boolean | null>(null);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [roomInfoDialog, setRoomInfoDialog] = useState<{
    isOpen: boolean;
    roomNumber: number | null;
  }>({
    isOpen: false,
    roomNumber: null,
  });
  
  // Get unique sectors and floors for filter options
  const sectors = [...new Set(rooms.map(room => room.sector))];
  const floors = [...new Set(rooms.map(room => room.floor))];
  
  // Sort the rooms based on current sort configuration
  const sortedRooms = [...rooms].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let comparison = 0;
    if (sortConfig.key === 'number') {
      comparison = a.number - b.number;
    } else if (sortConfig.key === 'sector') {
      comparison = a.sector.localeCompare(b.sector);
    } else if (sortConfig.key === 'floor') {
      comparison = a.floor - b.floor;
    } else if (sortConfig.key === 'status') {
      comparison = a.status.localeCompare(b.status);
    }
    
    return sortConfig.direction === 'ascending' ? comparison : -comparison;
  });
  
  // Filter rooms based on search term and selected filters
  const filteredRooms = sortedRooms.filter(room => {
    const matchesSearch = 
      room.number.toString().includes(searchTerm) || 
      room.sector.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSector = sectorFilter === null || room.sector === sectorFilter;
    const matchesFloor = floorFilter === null || room.floor === floorFilter;
    const matchesBathroom = bathroomFilter === null || room.hasBathroom === bathroomFilter;
    const matchesActive = activeFilter === null || room.active === activeFilter;
    
    return matchesSearch && matchesSector && matchesFloor && matchesBathroom && matchesActive;
  });
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };
  
  const getStatusBadge = (status: string, active: boolean) => {
    if (!active) return <Badge variant="outline" className="text-gray-400 bg-gray-100">Desativado</Badge>;
    
    switch (status) {
      case 'normal':
        return <Badge className="bg-status-normal">Normal</Badge>;
      case 'warning':
        return <Badge className="bg-status-warning">Atenção</Badge>;
      case 'alert':
        return <Badge className="bg-status-alert">Alerta</Badge>;
      case 'urgent':
        return <Badge className="bg-status-urgent">Urgência</Badge>;
      default:
        return <Badge className="bg-gray-200 text-gray-600">Vazio</Badge>;
    }
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSectorFilter(null);
    setFloorFilter(null);
    setBathroomFilter(null);
    setActiveFilter(null);
  };
  
  const showRoomInfo = (roomNumber: number) => {
    setRoomInfoDialog({
      isOpen: true,
      roomNumber,
    });
  };
  
  const handleToggleActive = (roomNumber: number, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleRoomActive(roomNumber);
  };
  
  const currentRoom = roomInfoDialog.roomNumber !== null 
    ? rooms.find(room => room.number === roomInfoDialog.roomNumber) 
    : null;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Listagem de Quartos</h1>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar quartos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 rounded-md border border-gray-200 text-sm"
                value={sectorFilter || ''}
                onChange={(e) => setSectorFilter(e.target.value || null)}
              >
                <option value="">Todos os setores</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
              
              <select
                className="px-3 py-2 rounded-md border border-gray-200 text-sm"
                value={floorFilter || ''}
                onChange={(e) => setFloorFilter(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Todos os andares</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}º Andar
                  </option>
                ))}
              </select>
              
              <select
                className="px-3 py-2 rounded-md border border-gray-200 text-sm"
                value={bathroomFilter === null ? '' : bathroomFilter ? 'true' : 'false'}
                onChange={(e) => {
                  if (e.target.value === '') setBathroomFilter(null);
                  else setBathroomFilter(e.target.value === 'true');
                }}
              >
                <option value="">Banheiro: Todos</option>
                <option value="true">Com Banheiro</option>
                <option value="false">Sem Banheiro</option>
              </select>
              
              <select
                className="px-3 py-2 rounded-md border border-gray-200 text-sm"
                value={activeFilter === null ? '' : activeFilter ? 'true' : 'false'}
                onChange={(e) => {
                  if (e.target.value === '') setActiveFilter(null);
                  else setActiveFilter(e.target.value === 'true');
                }}
              >
                <option value="">Status: Todos</option>
                <option value="true">Ativados</option>
                <option value="false">Desativados</option>
              </select>
              
              <Button variant="outline" size="sm" onClick={resetFilters} className="whitespace-nowrap">
                <Filter className="h-4 w-4 mr-1" />
                Limpar filtros
              </Button>
            </div>
          </div>
        </div>
        
        {/* Room table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer w-20"
                  onClick={() => requestSort('number')}
                >
                  <div className="flex items-center">
                    Quarto {getSortIndicator('number')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => requestSort('sector')}
                >
                  <div className="flex items-center">
                    Setor {getSortIndicator('sector')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => requestSort('floor')}
                >
                  <div className="flex items-center">
                    Andar {getSortIndicator('floor')}
                  </div>
                </TableHead>
                <TableHead>Equipamentos</TableHead>
                <TableHead>Banheiro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ativar/Desativar</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                    Nenhum quarto encontrado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => (
                  <TableRow 
                    key={room.number} 
                    className={`${!room.active ? 'bg-gray-50 text-gray-400' : ''} cursor-pointer hover:bg-gray-50`}
                    onClick={() => showRoomInfo(room.number)}
                  >
                    <TableCell className="font-medium">{room.number}</TableCell>
                    <TableCell>{room.sector}</TableCell>
                    <TableCell>{room.floor}º</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {room.hasEquipment.length > 0 ? (
                          <span className="text-xs text-gray-600">{room.hasEquipment.length} equip.</span>
                        ) : (
                          <span className="text-xs text-gray-400">Nenhum</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {room.hasBathroom ? (
                        <AirVent className="h-4 w-4 text-teal-500" />
                      ) : (
                        <span className="text-xs text-gray-400">Não</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(room.status, room.active)}</TableCell>
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={room.active}
                          onCheckedChange={() => toggleRoomActive(room.number)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/room/${room.number}`} onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm">
                            Detalhes
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="p-4 border-t text-sm text-gray-500">
            Total: {filteredRooms.length} quartos
          </div>
        </div>
      </div>
      
      {/* Room Info Dialog */}
      <Dialog open={roomInfoDialog.isOpen} onOpenChange={(open) => setRoomInfoDialog({ isOpen: open, roomNumber: roomInfoDialog.roomNumber })}>
        {currentRoom && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div>
                  Quarto {currentRoom.number} {!currentRoom.active && <span className="text-sm font-normal text-gray-400 ml-2">(Desativado)</span>}
                </div>
                <div>
                  {getStatusBadge(currentRoom.status, currentRoom.active)}
                </div>
              </DialogTitle>
              <DialogDescription>
                {currentRoom.sector} - {currentRoom.floor}º Andar
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Equipment */}
              <div>
                <Label className="text-sm text-gray-500">Equipamentos Disponíveis</Label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {currentRoom.hasEquipment.length > 0 ? (
                    currentRoom.hasEquipment.map((equipment, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                        {equipment === 'Monitor cardíaco' ? (
                          <AirVent className="h-4 w-4 text-blue-500" />
                        ) : equipment.includes('Respirador') ? (
                          <LampDesk className="h-4 w-4 text-green-500" />
                        ) : equipment.includes('Oxigênio') ? (
                          <Plug className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <WifiHigh className="h-4 w-4 text-purple-500" />
                        )}
                        <span className="text-sm">{equipment}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-sm text-gray-400 italic">
                      Nenhum equipamento registrado
                    </div>
                  )}
                </div>
              </div>
              
              {/* Bathroom */}
              <div>
                <Label className="text-sm text-gray-500">Instalações</Label>
                <div className="mt-1 flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                  {currentRoom.hasBathroom ? (
                    <>
                      <AirVent className="h-4 w-4 text-teal-500" />
                      <span className="text-sm">Banheiro privativo</span>
                    </>
                  ) : (
                    <>
                      <AirVent className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Sem banheiro privativo</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Bed status */}
              <div>
                <Label className="text-sm text-gray-500">Estado Atual</Label>
                <div className="mt-1 flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                  <Bed className={`h-4 w-4 ${currentRoom.status === 'empty' ? 'text-gray-400' : 'text-primary-blue'}`} />
                  <span className="text-sm">
                    {currentRoom.status === 'empty' ? 'Leito vazio' : 'Paciente ocupando o leito'}
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                variant="outline"
                onClick={(e) => handleToggleActive(currentRoom.number, e)}
                className={currentRoom.active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'}
              >
                {currentRoom.active ? 'Desativar Quarto' : 'Ativar Quarto'}
              </Button>
              
              <Link to={`/room/${currentRoom.number}`}>
                <Button variant="default">Ver Detalhes</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </Layout>
  );
};

export default RoomList;
