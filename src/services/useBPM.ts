import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  path: '/websocket',
  transports: ['websocket'],
});

export function useBPM() {
  const [bpm, setBpm] = useState<number | null>(null);
  const [connectionStatus, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    const handleBPMUpdate = (data: { bpm: number }) => {
      console.log('Dado válido recebido:', data);
      setBpm(data.bpm);
      setStatus('connected');
    };

    socket.on('connect', () => setStatus('connected'));
    socket.on('disconnect', () => setStatus('disconnected'));
    socket.on('bpm_update', handleBPMUpdate);

    return () => {
      socket.off('bpm_update', handleBPMUpdate);
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return { bpm, connectionStatus };
}
