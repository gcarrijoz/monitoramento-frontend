import React from 'react';
import { Card, CardDescription } from '@/components/ui/card';
import { Heart, WifiOff, Skull } from 'lucide-react';
import { Room } from '@/services/roomService';
import { useAlarmSound } from '@/hooks/useAlarmSound';

type PatientStatus = 'normal' | 'warning' | 'urgent' | 'empty' | 'disconnected' | 'no_signal';

interface RoomCardProps {
  room: Room;
  bpmData?: {
    bpm: number | null;
    status?: string;
    message?: string;
    patient?: {
      id: number;
      name: string;
    };
    room?: {
      id: number;
    };
  };
  onAssignClick: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, bpmData, onAssignClick }) => {
  const determineStatus = (): PatientStatus => {
    if (!room.patient) return 'empty';
    if (bpmData?.status === 'connection_lost') return 'disconnected';
    if (bpmData?.status === 'zero_bpm') return 'no_signal';

    const maxHeartRate = room.patient.maxHeartRate ? room.patient.maxHeartRate : 120;
    const minHeartRate = room.patient.minHeartRate ? room.patient.minHeartRate : 55;
    
    if (bpmData?.bpm) {
      if (bpmData.bpm > maxHeartRate || bpmData.bpm < minHeartRate) return 'urgent';
      if (bpmData.bpm > (maxHeartRate - 0.1*(maxHeartRate)) || bpmData.bpm < (minHeartRate + 0.1*(minHeartRate))) return 'warning';
      return 'normal';
    }
    
    return 'normal';
  };
  
  const status = determineStatus();

  const statusColors: Record<PatientStatus, { 
    bg: string; 
    text: string; 
    border: string; 
    animation?: string;
    alarm?: boolean;
  }> = {
    normal: { bg: 'bg-status-normal/10', text: 'text-status-normal', border: 'border-status-normal' },
    warning: { bg: 'bg-status-warning/10', text: 'text-status-warning', border: 'border-status-warning' },
    urgent: { 
      bg: 'bg-status-urgent/10', 
      text: 'text-status-urgent', 
      border: 'border-status-urgent', 
      animation: 'animate-pulse',
      alarm: true
    },
    empty: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' },
    disconnected: { 
      bg: 'bg-gray-200', 
      text: 'text-gray-700', 
      border: 'border-gray-400',
      animation: 'animate-pulse'
    },
    no_signal: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-red-600',
      animation: 'animate-pulse',
      alarm: true
    }
  };

  const statusLabels: Record<PatientStatus, string> = {
    normal: 'Normal',
    warning: 'Atenção',
    urgent: 'Urgente',
    empty: 'Vazio',
    disconnected: 'Sem Conexão',
    no_signal: 'Urgente'
  };

  const statusStyle = statusColors[status];
  const isAlarmActive = status === 'urgent' || status === 'no_signal';
  useAlarmSound(isAlarmActive);

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${statusStyle.border} ${statusStyle.bg} overflow-hidden ${statusStyle.animation || ''}`}
      onClick={() => !room.patient && onAssignClick()}
    >
      {/* Overlay de caveira apenas para status no_signal */}
      {status === 'no_signal' && (
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Skull className="h-16 w-16 text-gray-700" />
        </div>
      )}

      <div className={`relative z-10 p-4 ${status === 'no_signal' ? 'bg-black/80' : ''}`}>
        <div className="flex justify-between items-start">
          <h3 className={`text-xl font-bold ${status === 'no_signal' ? 'text-white' : ''}`}>
            Quarto {room.number}
          </h3>
          <span className={`text-sm font-normal px-2 py-1 rounded ${
            status === 'no_signal' ? 'bg-black/50 text-white' : 'bg-white/50'
          }`}>
            {room.sector}
          </span>
        </div>
        
        <CardDescription className={status === 'no_signal' ? 'text-gray-300' : ''}>
          {room.floor}º andar • {room.patient ? 'Ocupado' : 'Disponível'}
        </CardDescription>
        
        {room.patient ? (
          <div className="mt-3 space-y-2">
            <p className={`font-medium truncate ${status === 'no_signal' ? 'text-white' : ''}`}>
              {room.patient.name}
            </p>
            
            <div className="flex items-center relative">
              {/* Ícone do coração para todos os status exceto disconnected e no_signal */}
              {status !== 'disconnected' && status !== 'no_signal' && (
                <Heart 
                  className={`h-5 w-5 mr-1 ${statusStyle.text} ${statusStyle.animation || ''}`} 
                  fill={status !== 'empty' ? 'currentColor' : 'none'} 
                />
              )}
              
              {/* Ícone do WiFi para status disconnected */}
              {status === 'disconnected' && (
                <WifiOff className={`h-5 w-5 mr-1 ${statusStyle.text}`} />
              )}
              
              {/* Ícone da caveira para status no_signal */}
              {status === 'no_signal' && (
                <Skull className="h-5 w-5 mr-1 text-white" />
              )}
              
              <span className={`${statusStyle.text} font-semibold`}>
                {status === 'disconnected' 
                  ? 'Perda de Conexão' 
                  : status === 'no_signal'
                    ? 'PACIENTE SEM SINAL'
                  : bpmData?.bpm 
                    ? `${bpmData.bpm} bpm` 
                    : 'Sensor desconectado'}
              </span>
              
              <div className={`absolute right-0 bottom-0 ${statusStyle.text} p-1 text-xs font-medium`}>
                {statusLabels[status]}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-gray-500 text-sm">Quarto vazio</p>
            <button 
              className="text-sm text-primary-blue hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onAssignClick();
              }}
            >
              Vincular paciente
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RoomCard;