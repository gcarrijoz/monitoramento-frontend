
import api from './api';

export interface Room {
  id?: number;
  sector: string;
  floor: number;
  number: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
  devices?: any[];
  roomHistory?: any[];
  alerts?: any[];
}

// Obter todos os quartos
export const getAllRooms = async (): Promise<Room[]> => {
  try {
    const response = await api.get('/rooms');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar quartos:', error);
    throw error;
  }
};

// Obter um quarto específico pelo ID
export const getRoomById = async (id: number): Promise<Room> => {
  try {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar quarto com ID ${id}:`, error);
    throw error;
  }
};

// Criar um novo quarto
export const createRoom = async (roomData: {
  sector: string;
  floor: number;
  number: string;
  isAvailable: boolean;
}): Promise<Room> => {
  try {
    const response = await api.post('/rooms', roomData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar quarto:', error);
    throw error;
  }
};

// Atualizar um quarto existente
export const updateRoom = async (id: number, roomData: Partial<Room>): Promise<Room> => {
  try {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar quarto com ID ${id}:`, error);
    throw error;
  }
};

// Excluir um quarto
export const deleteRoom = async (id: number): Promise<void> => {
  try {
    await api.delete(`/rooms/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir quarto com ID ${id}:`, error);
    throw error;
  }
};
