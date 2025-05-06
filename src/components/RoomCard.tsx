import React from 'react';
import { Card, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Room } from '@/services/roomService';
import { useAlarmSound } from '@/hooks/useAlarmSound';

type PatientStatus = 'normal' | 'warning' | 'urgent' | 'empty';

interface RoomCardProps {
  room: Room;
  bpmData?: {
    bpm: number;
    patient: {
      id: number;
      name: string;
    };
    room: {
      id: number;
    };
  };
  onAssignClick: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, bpmData, onAssignClick }) => {
  // Determina o status com base no BPM (se existir) ou empty se não tiver paciente
  const determineStatus = (): PatientStatus => {
    if (!room.patient) return 'empty';

    const maxHeartRate = room.patient.maxHeartRate ? room.patient.maxHeartRate : 120;
    const minHeartRate =  room.patient.minHeartRate ? room.patient.minHeartRate : 55;
    
    if (bpmData?.bpm) {
      if (bpmData.bpm > maxHeartRate || bpmData.bpm < minHeartRate) return 'urgent';
      if (bpmData.bpm > (maxHeartRate - 0.1*(maxHeartRate)) || bpmData.bpm < (minHeartRate + 0.1*(minHeartRate))) return 'warning';
      return 'normal';
    }
    
    return 'normal'; // Status padrão quando tem paciente mas não tem dados de BPM
  };

  

  const status = determineStatus();

  console.log(room.patient)
  
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
  };

  const statusLabels: Record<PatientStatus, string> = {
    normal: 'Normal',
    warning: 'Atenção',
    urgent: 'Urgente',
    empty: 'Vazio',
  };

  const statusStyle = statusColors[status];

  const handleCardClick = () => {
    if (!room.patient) {
      onAssignClick();
    }
  };

  const isAlarmActive = status === 'urgent';
  useAlarmSound(isAlarmActive);

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${statusStyle.border} ${statusStyle.bg} overflow-hidden ${statusStyle.animation || ''}`}
      onClick={handleCardClick}
    >      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold">Quarto {room.number}</h3>
          <span className="text-sm font-normal bg-white bg-opacity-50 px-2 py-1 rounded">
            {room.sector}
          </span>
        </div>
        <CardDescription>
          {room.floor}º andar • {room.patient ? 'Ocupado' : 'Disponível'}
        </CardDescription>
        
        {room.patient ? (
          <div className="mt-3 space-y-2">
            <p className="font-medium truncate">{room.patient.name}</p>
            
            <div className="flex items-center relative">
              {bpmData && (
                <Heart 
                  className={`h-5 w-5 mr-1 ${statusStyle.text} ${statusStyle.animation || ''}`} 
                  fill={status !== 'empty' ? 'currentColor' : 'none'} 
                />
              )}
              
              <span className={`${statusStyle.text} font-semibold`}>
                {bpmData?.bpm ? `${bpmData.bpm} bpm` : 'Sensor desconectado'}
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