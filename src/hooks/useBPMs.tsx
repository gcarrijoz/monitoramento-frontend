// hooks/useBPMs.ts
import { useEffect, useState } from 'react';
import { socket } from '@/services/socketService';

type Patient = {
  id: number;
  name: string;
  cpf: string;
};

type Room = {
  id: number;
  sector: string;
  floor: number;
  number: string;
};

type BPMData = {
  bpm: number | null;
  event: string;
  patient?: Patient;
  room?: Room;
  serverTimestamp: string;
  status?: 'connected' | 'disconnected' | 'connection_lost' | 'zero_bpm';
  message?: string;
};

export function useBPMs() {
  const [bpmDataMap, setBpmDataMap] = useState<Record<number, BPMData>>({});
  const [connectionStatus, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const handleConnect = () => setStatus('connected');
    const handleDisconnect = () => setStatus('disconnected');
    
    const handleBPMUpdate = (data: BPMData) => {
      if (data.event === 'bpm_update' && data.room?.id) {
        setBpmDataMap(prev => ({
          ...prev,
          [data.room.id]: {
            ...data,
            status: data.status || (data.bpm !== null ? 'connected' : 'disconnected')
          },
        }));
      }
    };

    const handleSensorStatus = (data: {
      event: string;
      macAddress: string;
      status: string;
      timestamp: string;
      room?: Room;
    }) => {
      if (data.event === 'sensor_status' && data.room?.id) {
        setBpmDataMap(prev => ({
          ...prev,
          [data.room.id]: {
            bpm: null,
            event: 'sensor_status',
            status: data.status === 'timeout' ? 'connection_lost' : 'disconnected',
            message: data.status === 'timeout' ? 'Perda de Conexão' : 'Sensor desconectado',
            serverTimestamp: data.timestamp,
            room: data.room
          },
        }));
      }
    };

    // Configura os listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('bpm_update', handleBPMUpdate);
    socket.on('sensor_status', handleSensorStatus);

    // Conecta manualmente se não estiver conectado
    if (!socket.connected) {
      setStatus('connecting');
      socket.connect();
    }

    return () => {
      // Remove os listeners ao desmontar
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('bpm_update', handleBPMUpdate);
      socket.off('sensor_status', handleSensorStatus);
    };
  }, []);

  return { bpmDataMap, connectionStatus };
}