
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

export type PatientStatus = 'normal' | 'warning' | 'alert' | 'urgent' | 'empty';

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  age: number;
  diagnosis?: string;
  minHeartRate: number;
  maxHeartRate: number;
  roomNumber?: number | null;
  currentHeartRate?: number;
  status: PatientStatus;
  recentAlerts?: Alert[];
}

export interface Room {
  number: number;
  patientId?: string;
  status: PatientStatus;
  active: boolean;
  sector: string;
  floor: number;
  hasEquipment: string[];
  hasBathroom: boolean;
}

export interface Alert {
  id: string;
  patientId: string;
  roomNumber: number;
  type: 'warning' | 'alert' | 'urgent';
  message: string;
  timestamp: Date;
  viewed: boolean;
}

interface PatientContextType {
  patients: Patient[];
  rooms: Room[];
  alerts: Alert[];
  addPatient: (patient: Omit<Patient, 'id'>) => void;
  updatePatient: (id: string, patientData: Partial<Patient>) => void;
  assignRoom: (patientId: string, roomNumber: number) => void;
  removeFromRoom: (roomNumber: number) => void;
  getPatient: (id: string) => Patient | undefined;
  getPatientByRoom: (roomNumber: number) => Patient | undefined;
  updateHeartRateLimits: (patientId: string, min: number, max: number) => void;
  getRoom: (roomNumber: number) => Room | undefined;
  toggleRoomActive: (roomNumber: number) => void;
  updateRoom: (roomNumber: number, roomData: Partial<Room>) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Mock data
const mockRooms: Room[] = [
  {
    number: 101,
    status: 'empty',
    active: true,
    sector: 'Cardiologia',
    floor: 1,
    hasEquipment: ['Monitor cardíaco', 'Respirador'],
    hasBathroom: true
  },
  {
    number: 102,
    status: 'alert',
    active: true,
    sector: 'Cardiologia',
    floor: 1,
    hasEquipment: ['Monitor cardíaco', 'Oxigênio'],
    hasBathroom: true
  },
  {
    number: 103,
    status: 'urgent',
    active: true,
    sector: 'Cardiologia',
    floor: 1,
    hasEquipment: ['Monitor cardíaco', 'Respirador', 'Bomba de Infusão'],
    hasBathroom: true
  },
  {
    number: 104,
    status: 'empty',
    active: false,
    sector: 'Cardiologia',
    floor: 1,
    hasEquipment: ['Monitor cardíaco'],
    hasBathroom: false
  },
  {
    number: 201,
    status: 'empty',
    active: true,
    sector: 'Pneumologia',
    floor: 2,
    hasEquipment: ['Monitor cardíaco', 'Respirador'],
    hasBathroom: true
  },
  {
    number: 202,
    status: 'empty',
    active: true,
    sector: 'Pneumologia',
    floor: 2,
    hasEquipment: ['Monitor cardíaco'],
    hasBathroom: true
  },
  {
    number: 203,
    status: 'empty',
    active: false,
    sector: 'Pneumologia',
    floor: 2,
    hasEquipment: ['Monitor cardíaco', 'Respirador'],
    hasBathroom: false
  },
  {
    number: 204,
    status: 'empty',
    active: true,
    sector: 'Pneumologia',
    floor: 2,
    hasEquipment: ['Monitor cardíaco', 'Oxigênio'],
    hasBathroom: true
  },
  {
    number: 301,
    status: 'empty',
    active: true,
    sector: 'Neurologia',
    floor: 3,
    hasEquipment: ['Monitor cardíaco', 'Monitor de Pressão Intracraniana'],
    hasBathroom: true
  },
  {
    number: 302,
    status: 'empty',
    active: true,
    sector: 'Neurologia',
    floor: 3,
    hasEquipment: ['Monitor cardíaco'],
    hasBathroom: true
  },
  {
    number: 303,
    status: 'empty',
    active: false,
    sector: 'Neurologia',
    floor: 3,
    hasEquipment: ['Monitor cardíaco', 'Respirador'],
    hasBathroom: false
  },
  {
    number: 304,
    status: 'empty',
    active: true,
    sector: 'Neurologia',
    floor: 3,
    hasEquipment: ['Monitor cardíaco', 'Respirador', 'Bomba de Infusão'],
    hasBathroom: true
  }
];

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Carlos Mendes',
    birthDate: '1950-05-23',
    age: 74,
    diagnosis: 'Hipertensão',
    minHeartRate: 60,
    maxHeartRate: 90,
    roomNumber: 101,
    currentHeartRate: 72,
    status: 'normal',
  },
  {
    id: '2',
    name: 'Ana Ferreira',
    birthDate: '1978-02-14',
    age: 46,
    diagnosis: 'Pós-operatório',
    minHeartRate: 65,
    maxHeartRate: 100,
    roomNumber: 102,
    currentHeartRate: 115,
    status: 'alert',
  },
  {
    id: '3',
    name: 'Eduardo Santos',
    birthDate: '1965-12-01',
    age: 59,
    diagnosis: 'Arritmia',
    minHeartRate: 55,
    maxHeartRate: 90,
    roomNumber: 103,
    currentHeartRate: 48,
    status: 'urgent',
  },
];

// Update room status based on patient assignments
mockPatients.forEach(patient => {
  if (patient.roomNumber) {
    const roomIndex = mockRooms.findIndex(room => room.number === patient.roomNumber);
    if (roomIndex !== -1) {
      mockRooms[roomIndex].patientId = patient.id;
      mockRooms[roomIndex].status = patient.status;
    }
  }
});

// Generate some mock alerts
const mockAlerts: Alert[] = [
  {
    id: '1',
    patientId: '2',
    roomNumber: 102,
    type: 'alert',
    message: 'Frequência cardíaca acima do limite estabelecido: 115 bpm',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    viewed: false,
  },
  {
    id: '2',
    patientId: '3',
    roomNumber: 103,
    type: 'urgent',
    message: 'Frequência cardíaca MUITO ABAIXO do limite estabelecido: 48 bpm',
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    viewed: false,
  },
];

interface PatientProviderProps {
  children: ReactNode;
}

export function PatientProvider({ children }: PatientProviderProps) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const addPatient = (patientData: Omit<Patient, 'id'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(), // Simple ID generation
    };
    setPatients([...patients, newPatient]);
    toast.success(`Paciente ${patientData.name} cadastrado com sucesso!`);
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    setPatients(
      patients.map((patient) =>
        patient.id === id ? { ...patient, ...patientData } : patient
      )
    );
    toast.success('Informações do paciente atualizadas!');
  };

  const assignRoom = (patientId: string, roomNumber: number) => {
    // Update rooms
    setRooms(
      rooms.map((room) => {
        if (room.number === roomNumber) {
          // Find patient to get their status
          const patient = patients.find(p => p.id === patientId);
          return {
            ...room,
            patientId,
            status: patient?.status || 'normal',
          };
        }
        return room;
      })
    );

    // Update patient
    setPatients(
      patients.map((patient) => {
        if (patient.id === patientId) {
          return { ...patient, roomNumber };
        }
        // If this patient was in this room before, remove the assignment
        if (patient.roomNumber === roomNumber) {
          return { ...patient, roomNumber: null };
        }
        return patient;
      })
    );

    toast.success(`Paciente alocado ao quarto ${roomNumber}`);
  };

  const removeFromRoom = (roomNumber: number) => {
    // Find patient in this room
    const patient = patients.find((p) => p.roomNumber === roomNumber);
    
    // Update room status
    setRooms(
      rooms.map((room) => {
        if (room.number === roomNumber) {
          return {
            ...room,
            patientId: undefined,
            status: 'empty',
          };
        }
        return room;
      })
    );

    // Update patient if found
    if (patient) {
      setPatients(
        patients.map((p) => {
          if (p.id === patient.id) {
            return { ...p, roomNumber: null };
          }
          return p;
        })
      );

      toast.info(`Paciente ${patient.name} desvinculado do quarto ${roomNumber}`);
    }
  };

  const getPatient = (id: string) => {
    return patients.find((patient) => patient.id === id);
  };

  const getPatientByRoom = (roomNumber: number) => {
    const patient = patients.find((patient) => patient.roomNumber === roomNumber);
    return patient;
  };

  const updateHeartRateLimits = (patientId: string, min: number, max: number) => {
    setPatients(
      patients.map((patient) => {
        if (patient.id === patientId) {
          return { ...patient, minHeartRate: min, maxHeartRate: max };
        }
        return patient;
      })
    );
    toast.success('Limites de frequência cardíaca atualizados!');
  };

  const getRoom = (roomNumber: number) => {
    return rooms.find((room) => room.number === roomNumber);
  };

  const toggleRoomActive = (roomNumber: number) => {
    setRooms(
      rooms.map((room) => {
        if (room.number === roomNumber) {
          const newActive = !room.active;
          // If room is becoming inactive and has a patient, remove patient
          if (!newActive && room.patientId) {
            const patientToUpdate = patients.find(p => p.roomNumber === roomNumber);
            if (patientToUpdate) {
              setPatients(
                patients.map(p => 
                  p.id === patientToUpdate.id ? { ...p, roomNumber: null } : p
                )
              );
              toast.info(`Paciente ${patientToUpdate.name} desvinculado do quarto ${roomNumber} devido à desativação`);
            }
            return {
              ...room,
              active: newActive,
              patientId: undefined,
              status: 'empty'
            };
          }
          return { ...room, active: newActive };
        }
        return room;
      })
    );
    const action = rooms.find(r => r.number === roomNumber)?.active ? 'desativado' : 'ativado';
    toast.success(`Quarto ${roomNumber} ${action} com sucesso!`);
  };

  const updateRoom = (roomNumber: number, roomData: Partial<Room>) => {
    setRooms(
      rooms.map((room) =>
        room.number === roomNumber ? { ...room, ...roomData } : room
      )
    );
    toast.success(`Informações do quarto ${roomNumber} atualizadas!`);
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        rooms,
        alerts,
        addPatient,
        updatePatient,
        assignRoom,
        removeFromRoom,
        getPatient,
        getPatientByRoom,
        updateHeartRateLimits,
        getRoom,
        toggleRoomActive,
        updateRoom,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
}
