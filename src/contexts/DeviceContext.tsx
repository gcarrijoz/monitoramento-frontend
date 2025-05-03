
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Device {
  id: number;
  macAddress: string;
  description?: string;
  isActive: boolean;
  roomId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DeviceContextType {
  devices: Device[];
  addDevice: (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDevice: (id: number, deviceData: Partial<Device>) => void;
  deleteDevice: (id: number) => void;
  getDevice: (id: number) => Device | undefined;
  assignDeviceToRoom: (deviceId: number, roomId: number) => void;
  unassignDevice: (deviceId: number) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

// Mock data
const mockDevices: Device[] = [
  {
    id: 1,
    macAddress: "AA:BB:CC:DD:EE:11",
    description: "Monitor cardíaco principal - Cardiologia",
    isActive: true,
    roomId: 101,
    createdAt: new Date(2025, 3, 15),
    updatedAt: new Date(2025, 3, 15)
  },
  {
    id: 2,
    macAddress: "AA:BB:CC:DD:EE:22",
    description: "Monitor cardíaco secundário - Cardiologia",
    isActive: true,
    roomId: 102,
    createdAt: new Date(2025, 3, 15),
    updatedAt: new Date(2025, 3, 15)
  },
  {
    id: 3,
    macAddress: "AA:BB:CC:DD:EE:33",
    description: "Monitor cardíaco - Pneumologia",
    isActive: true,
    roomId: 103,
    createdAt: new Date(2025, 3, 15),
    updatedAt: new Date(2025, 3, 15)
  },
  {
    id: 4,
    macAddress: "AA:BB:CC:DD:EE:44",
    description: "Monitor cardíaco de reserva",
    isActive: false,
    roomId: null,
    createdAt: new Date(2025, 3, 15),
    updatedAt: new Date(2025, 3, 15)
  },
  {
    id: 5,
    macAddress: "AA:BB:CC:DD:EE:55",
    description: "Monitor cardíaco portátil",
    isActive: true,
    roomId: null,
    createdAt: new Date(2025, 3, 15),
    updatedAt: new Date(2025, 3, 15)
  }
];

interface DeviceProviderProps {
  children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
  const [devices, setDevices] = useState<Device[]>(mockDevices);

  const addDevice = (deviceData: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newDevice: Device = {
      ...deviceData,
      id: Math.max(0, ...devices.map(d => d.id)) + 1,
      isActive: deviceData.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    setDevices([...devices, newDevice]);
    toast.success(`Dispositivo com MAC ${deviceData.macAddress} adicionado com sucesso!`);
  };

  const updateDevice = (id: number, deviceData: Partial<Device>) => {
    setDevices(
      devices.map((device) =>
        device.id === id
          ? { ...device, ...deviceData, updatedAt: new Date() }
          : device
      )
    );
    toast.success('Informações do dispositivo atualizadas!');
  };

  const deleteDevice = (id: number) => {
    setDevices(devices.filter((device) => device.id !== id));
    toast.success('Dispositivo removido com sucesso!');
  };

  const getDevice = (id: number) => {
    return devices.find((device) => device.id === id);
  };

  const assignDeviceToRoom = (deviceId: number, roomId: number) => {
    // Check if another device is already assigned to this room
    const existingDevice = devices.find(d => d.roomId === roomId);
    
    if (existingDevice) {
      // Unassign the existing device
      setDevices(
        devices.map(device => 
          device.id === existingDevice.id 
            ? { ...device, roomId: null, updatedAt: new Date() } 
            : device
        )
      );
    }

    // Assign the new device
    setDevices(
      devices.map((device) =>
        device.id === deviceId
          ? { ...device, roomId: roomId, updatedAt: new Date() }
          : device
      )
    );
    toast.success(`Dispositivo vinculado ao quarto ${roomId} com sucesso!`);
  };

  const unassignDevice = (deviceId: number) => {
    setDevices(
      devices.map((device) =>
        device.id === deviceId
          ? { ...device, roomId: null, updatedAt: new Date() }
          : device
      )
    );
    toast.success('Dispositivo desvinculado do quarto com sucesso!');
  };

  return (
    <DeviceContext.Provider
      value={{
        devices,
        addDevice,
        updateDevice,
        deleteDevice,
        getDevice,
        assignDeviceToRoom,
        unassignDevice,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return context;
}
