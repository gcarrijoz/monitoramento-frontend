import { useBPM } from '../services/useBPM';

export function BPMDisplay() {
  const { bpm, connectionStatus } = useBPM();

  return (
    <div className={`p-4 rounded-lg shadow ${
      connectionStatus === 'connected' ? 'bg-green-50' : 'bg-yellow-50'
    }`}>
      <h2 className="text-xl font-bold">Monitor Cardíaco</h2>
      <p className="text-2xl mt-2">
        {bpm !== null ? `${bpm} BPM` : 'Aguardando dados...'}
      </p>
      <p className="text-xs mt-1">
        Status: {connectionStatus === 'connected' ? '✅ Conectado' : '🔄 Conectando...'}
      </p>
    </div>
  );
}
