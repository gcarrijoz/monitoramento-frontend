
import api from './api';

export interface Patient {
  id?: string;
  name: string;
  cpf: string;
  gender: string;
  dateOfBirth: string;
  minHeartRate?: number | null;
  maxHeartRate?: number | null;
  roomId?: number | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Obter todos os pacientes
export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    const response = await api.get('/patient');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    throw error;
  }
};

// Obter um paciente específico pelo ID
export const getPatientById = async (id: string): Promise<Patient> => {
  try {
    const response = await api.get(`/patient/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar paciente com ID ${id}:`, error);
    throw error;
  }
};

// Criar um novo paciente
export const createPatient = async (patientData: Omit<Patient, 'id'>): Promise<Patient> => {
  try {
    const response = await api.post('/patient', patientData);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    throw error;
  }
};

// Atualizar um paciente existente
export const updatePatient = async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
  try {
    const response = await api.put(`/patient/${id}`, patientData);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar paciente com ID ${id}:`, error);
    throw error;
  }
};

// Excluir um paciente (soft delete)
export const deletePatient = async (id: string): Promise<void> => {
  try {
    await api.delete(`/patient/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir paciente com ID ${id}:`, error);
    throw error;
  }
};

// Obter pacientes sem quarto atribuído
export const getUnassignedPatients = async (): Promise<Patient[]> => {
  try {
    const response = await api.get('/patient/unassigned');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pacientes sem quarto:', error);
    throw error;
  }
};

// Atribuir paciente a um quarto
export const assignPatientToRoom = async (patientId: string, roomId: number): Promise<Patient> => {
  try {
    const response = await api.post(`/patient/${patientId}/assign`, { roomId });
    return response.data;
  } catch (error) {
    console.error(`Erro ao atribuir paciente ${patientId} ao quarto ${roomId}:`, error);
    throw error;
  }
};

// Remover paciente de um quarto
export const unassignPatient = async (patientId: string): Promise<Patient> => {
  try {
    const response = await api.post(`/patient/${patientId}/unassign`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao desvincular paciente ${patientId} do quarto:`, error);
    throw error;
  }
};
