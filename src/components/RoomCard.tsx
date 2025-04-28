
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { usePatients, PatientStatus } from '@/contexts/PatientContext';
import { Heart } from 'lucide-react';

interface RoomCardProps {
  roomNumber: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ roomNumber }) => {
  const { getRoom, getPatientByRoom } = usePatients();
  const navigate = useNavigate();
  
  const room = getRoom(roomNumber);
  const patient = room?.patientId ? getPatientByRoom(roomNumber) : undefined;
  
  const statusColors: Record<PatientStatus, { bg: string; text: string; border: string; animation?: string }> = {
    normal: { bg: 'bg-status-normal/10', text: 'text-status-normal', border: 'border-status-normal' },
    warning: { bg: 'bg-status-warning/10', text: 'text-status-warning', border: 'border-status-warning' },
    alert: { bg: 'bg-status-alert/10', text: 'text-status-alert', border: 'border-status-alert', animation: 'animate-pulse' },
    urgent: { bg: 'bg-status-urgent/10', text: 'text-status-urgent', border: 'border-status-urgent', animation: 'animate-pulse' },
    empty: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300' },
  };

  const statusLabels: Record<PatientStatus, string> = {
    normal: 'Normal',
    warning: 'Atenção',
    alert: 'Alerta',
    urgent: 'Urgente',
    empty: 'Vazio',
  };

  const status = room?.status || 'empty';
  const statusStyle = statusColors[status];

  const handleCardClick = () => {
    if (room?.patientId) {
      // If there's a patient, go to the patient's detail page
      navigate(`/room/${roomNumber}`);
    } else {
      // If room is empty, go to patient assignment page
      navigate(`/assign-patient/${roomNumber}`);
    }
  };

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${statusStyle.border} ${statusStyle.bg} overflow-hidden`}
      onClick={handleCardClick}
    >
      <div className={`absolute right-0 top-0 ${statusStyle.text} p-1 text-xs font-medium`}>
        {statusLabels[status]}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold">{roomNumber}</h3>
        </div>
        
        {patient ? (
          <div className="mt-3 space-y-2">
            <p className="font-medium truncate">{patient.name}</p>
            
            <div className="flex items-center">
              <Heart 
                className={`h-5 w-5 mr-1 ${statusStyle.text} ${statusStyle.animation || ''}`} 
                fill={status !== 'empty' ? 'currentColor' : 'none'} 
              />
              <span className={`${statusStyle.text} font-semibold`}>
                {patient.currentHeartRate || '--'} bpm
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-gray-500 text-sm">Quarto vazio</p>
            <button className="text-sm text-primary-blue hover:underline">
              Vincular paciente
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RoomCard;
