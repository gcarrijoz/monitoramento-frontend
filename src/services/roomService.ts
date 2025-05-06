
import { PatientStatus } from '@/contexts/PatientContext';
import api from './api';

export interface Patient {
  id: number;
  name: string;
  maxHeartRate?: number;
  minHeartRate?: number;
  status?: PatientStatus;
}
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
  patient?: Patient | null;
}

// Obter todos os quartos
export const getAllRooms = async (): Promise<Room[]> => {
  try {
    const response = await api.get('/room');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar quartos:', error);
    throw error;
  }
};

// Obter um quarto específico pelo ID
export const getRoomById = async (id: number): Promise<Room> => {
  try {
    const response = await api.get(`/room/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar quarto com ID ${id}:`, error);
    throw error;
  }
};

// Criar um novo quarto
export const createRoom = async (roomData: Room): Promise<Room> => {
  try {
    const response = await api.post('/room', roomData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar quarto:', error);
    throw error;
  }
};

// Atualizar um quarto existente
export const updateRoom = async (id: number, roomData: Partial<Room>): Promise<Room> => {
  try {
    const response = await api.put(`/room/${id}`, roomData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar quarto com ID ${id}:`, error);
    throw error;
  }
};

// Excluir um quarto
export const deleteRoom = async (id: number): Promise<void> => {
  try {
    await api.delete(`/room/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir quarto com ID ${id}:`, error);
    throw error;
  }
};

// Obter quartos disponíveis
export const getAvailableRooms = async (): Promise<Room[]> => {
  try {
    const response = await api.get('/room/available');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar quartos disponíveis:', error);
    throw error;
  }
};


export const unassignPatientFromRoom = async (roomId: number): Promise<void> => {
  try {
    await api.put(`/room-history/exit/room/${roomId}`);
  } catch (error) {
    console.error(`Erro ao desvincular paciente do quarto ${roomId}:`, error);
    throw error;
  }
};

export const getRoomsWithPatients = async (): Promise<Room[]> => {
  const response = await api.get('/room/with-patients');
  return response.data;
};
