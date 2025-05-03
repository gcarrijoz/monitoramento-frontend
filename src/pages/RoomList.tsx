
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getAllRooms, Room } from '@/services/roomService';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bed, Edit, Plus, Search, User, UserX } from 'lucide-react';

const RoomList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Quartos</h1>
            <p className="text-gray-500">Gerencie todos os quartos do hospital</p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={() => navigate('/room-management')} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Gerenciar Quartos
            </Button>
          </div>
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
                              onClick={() => navigate(`/room/${room.id}`)}
                            >
                              <Bed className="h-4 w-4" />
                            </Button>
                            {room.isAvailable ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600"
                                onClick={() => navigate(`/assign-patient/${room.id}`)}
                              >
                                <User className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-orange-600"
                                onClick={() => navigate(`/room/${room.id}`)}
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/room-management')}
                            >
                              <Edit className="h-4 w-4" />
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
                  <p>Nenhum quarto cadastrado. Clique em "Gerenciar Quartos" para adicionar.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RoomList;
