// hooks/useBPMs.ts
import { useEffect, useState } from 'react';
import { socket } from '@/services/socketService'; // Importe o socket.io-client configurado

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
  bpm: number;
  event: string;
  patient: Patient;
  room: Room;
  serverTimestamp: string;
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
          [data.room.id]: data,
        }));
      }
    };

    // Configura os listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('bpm_update', handleBPMUpdate);
    socket.on('sensor_status', handleDisconnect);

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
    };
  }, []);

  return { bpmDataMap, connectionStatus };
}