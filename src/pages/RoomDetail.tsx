
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ChevronLeft, Heart, Settings, FileText, UserX, AlertCircle } from 'lucide-react';
import { PatientStatus } from '@/contexts/PatientContext';

const RoomDetail = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { getPatientByRoom, removeFromRoom, updateHeartRateLimits } = usePatients();

  const roomNumber = Number(roomId);
  const patient = getPatientByRoom(roomNumber);
  
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [minHeartRate, setMinHeartRate] = useState(patient?.minHeartRate || 60);
  const [maxHeartRate, setMaxHeartRate] = useState(patient?.maxHeartRate || 100);

  // Redirect if room not found or no patient in room
  if (isNaN(roomNumber) || !patient) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-lg font-medium">Quarto não encontrado ou vazio</h2>
            <p className="mt-1 text-sm text-gray-500">
              O quarto solicitado não existe ou não possui paciente vinculado.
            </p>
            <div className="mt-6">
              <Link to="/dashboard">
                <Button>Voltar ao Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSaveLimits = () => {
    if (patient) {
      updateHeartRateLimits(patient.id, minHeartRate, maxHeartRate);
      setLimitDialogOpen(false);
    }
  };

  const handleRemovePatient = () => {
    removeFromRoom(roomNumber);
    navigate('/dashboard');
  };

  const getStatusBadge = (status: PatientStatus) => {
    const styles: Record<PatientStatus, { color: string; bgColor: string }> = {
      normal: { color: 'text-status-normal', bgColor: 'bg-status-normal/10' },
      warning: { color: 'text-status-warning', bgColor: 'bg-status-warning/10' },
      alert: { color: 'text-status-alert', bgColor: 'bg-status-alert/10' },
      urgent: { color: 'text-status-urgent', bgColor: 'bg-status-urgent/10' },
      empty: { color: 'text-gray-500', bgColor: 'bg-gray-100' },
    };

    const statusText = {
      normal: 'Normal',
      warning: 'Atenção',
      alert: 'Alerta',
      urgent: 'Urgência',
      empty: 'Vazio',
    };

    const style = styles[status];
    return (
      <span className={`${style.color} ${style.bgColor} px-2 py-1 rounded-full text-xs font-medium`}>
        {statusText[status]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent hover:text-primary-blue"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-bold">Quarto {roomNumber}</h1>
                {getStatusBadge(patient.status)}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLimitDialogOpen(true)}
                >
                  <Settings className="mr-1 h-4 w-4" />
                  Configurar Limites
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <UserX className="mr-1 h-4 w-4" />
                      Desvincular
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Desvincular paciente do quarto?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá desvincular o paciente {patient.name} do quarto {roomNumber}. 
                        O paciente permanecerá cadastrado no sistema, mas não será mais monitorado neste quarto.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemovePatient} className="bg-red-600 hover:bg-red-700">
                        Desvincular
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Patient information */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-semibold mb-4">Informações do Paciente</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nome</label>
                    <p className="mt-1">{patient.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Idade</label>
                    <p className="mt-1">{patient.age} anos</p>
                  </div>
                  
                  {patient.diagnosis && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Diagnóstico</label>
                      <p className="mt-1">{patient.diagnosis}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Limites de Frequência Cardíaca</label>
                    <p className="mt-1">
                      {patient.minHeartRate} - {patient.maxHeartRate} bpm
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link to={`/patient/${patient.id}`}>
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Ficha Completa
                    </Button>
                  </Link>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Monitoramento Atual</h2>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <div className="text-center">
                    <Heart className={`mx-auto h-16 w-16 ${
                      patient.status === 'normal' ? 'text-status-normal' :
                      patient.status === 'warning' ? 'text-status-warning' :
                      patient.status === 'alert' ? 'text-status-alert' :
                      'text-status-urgent'
                    } ${patient.status !== 'normal' ? 'animate-pulse' : ''}`} />
                    
                    <div className="mt-4">
                      <p className="text-4xl font-bold">
                        {patient.currentHeartRate} <span className="text-xl font-normal text-gray-500">bpm</span>
                      </p>
                      
                      <p className="mt-2 text-sm text-gray-500">
                        Última atualização: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          patient.status === 'normal' ? 'bg-status-normal' :
                          patient.status === 'warning' ? 'bg-status-warning' :
                          patient.status === 'alert' ? 'bg-status-alert' :
                          'bg-status-urgent'
                        }`}
                        style={{ 
                          width: `${Math.min(100, Math.max(0, ((patient.currentHeartRate || 0) / patient.maxHeartRate) * 100))}%` 
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>{patient.minHeartRate} bpm</span>
                      <span>{patient.maxHeartRate} bpm</span>
                    </div>
                  </div>
                </div>
                
                {/* Recent Alerts */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Últimos Alertas</h3>
                  
                  {(patient.recentAlerts && patient.recentAlerts.length > 0) ? (
                    <div className="space-y-2">
                      {patient.recentAlerts.map((alert, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-100 text-sm">
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Nenhum alerta recente.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Limits configuration dialog */}
      <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Limites de Frequência Cardíaca</DialogTitle>
            <DialogDescription>
              Defina os limites mínimo e máximo para a frequência cardíaca do paciente.
              O sistema irá emitir alertas quando estes limites forem ultrapassados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="min-heart-rate">Frequência Cardíaca Mínima (bpm)</Label>
              <Input
                id="min-heart-rate"
                type="number"
                value={minHeartRate}
                onChange={(e) => setMinHeartRate(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="max-heart-rate">Frequência Cardíaca Máxima (bpm)</Label>
              <Input
                id="max-heart-rate"
                type="number"
                value={maxHeartRate}
                onChange={(e) => setMaxHeartRate(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLimitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLimits} className="bg-primary-blue hover:bg-primary-blue/90">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default RoomDetail;
