import api from './api';

export interface Device {
  id?: number;
  macAddress: string;
  description?: string | null;
  isActive: boolean;
  roomId?: number | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  room?: {
    sector: string;
    floor: number;
    number: string;
  } | null;
}

// Obter todos os dispositivos
export const getAllDevices = async (): Promise<Device[]> => {
  try {
    const response = await api.get('/device');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dispositivos:', error);
    throw error;
  }
};

// Obter dispositivos com informações de quarto
export const getAllDevicesWithRooms = async (): Promise<Device[]> => {
  try {
    const response = await api.get('/device/with-rooms');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dispositivos com quartos:', error);
    throw error;
  }
};

// Obter um dispositivo específico pelo ID
export const getDeviceById = async (id: number): Promise<Device> => {
  try {
    const response = await api.get(`/device/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar dispositivo com ID ${id}:`, error);
    throw error;
  }
};

// Criar um novo dispositivo
export const createDevice = async (deviceData: Omit<Device, 'id'>): Promise<Device> => {
  try {
    // Validação do MAC address
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(deviceData.macAddress)) {
      throw new Error('Formato de MAC address inválido');
    }

    const response = await api.post('/device', deviceData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar dispositivo:', error);
    throw error;
  }
};

// Atualizar um dispositivo existente
export const updateDevice = async (id: number, deviceData: Partial<Device>): Promise<Device> => {
  try {
    // Se estiver atualizando o MAC address, validar o formato
    if (deviceData.macAddress) {
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macRegex.test(deviceData.macAddress)) {
        throw new Error('Formato de MAC address inválido');
      }
    }

    const response = await api.put(`/device/${id}`, deviceData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar dispositivo com ID ${id}:`, error);
    throw error;
  }
};

// Excluir um dispositivo
export const deleteDevice = async (id: number): Promise<void> => {
  try {
    await api.delete(`/device/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir dispositivo com ID ${id}:`, error);
    throw error;
  }
};

// Obter dispositivos não atribuídos a quartos
export const getUnassignedDevices = async (): Promise<Device[]> => {
  try {
    const response = await api.get('/device/unassigned');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dispositivos sem quarto:', error);
    throw error;
  }
};

// Desvincular dispositivo de um quarto
export const unassignDevice = async (deviceId: number): Promise<Device> => {
  try {
    const response = await api.post(`/device/unassign/${deviceId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao desvincular dispositivo ${deviceId} do quarto:`, error);
    throw error;
  }
};

// Atribuir dispositivo a um quarto
export const assignDeviceToRoom = async (deviceId: number, roomId: number): Promise<void> => {
  try {
    await api.post('/device/assignment', {
      deviceId,
      roomId
    });
  } catch (error) {
    console.error('Erro ao atribuir dispositivo ao quarto:', error);
    throw error;
  }
};

// Obter histórico de atribuições de um dispositivo
export const getDeviceAssignmentHistory = async (deviceId: number): Promise<any[]> => {
  try {
    const response = await api.get(`/device/${deviceId}/assignment-history`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar histórico do dispositivo ${deviceId}:`, error);
    throw error;
  }
};