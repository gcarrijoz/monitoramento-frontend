
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Heart, Home, Edit } from 'lucide-react';
import MeasurementHistory from '@/components/MeasurementHistory';

const PatientDetail = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { getPatient, rooms } = usePatients();

  const patient = patientId ? getPatient(patientId) : undefined;
  
  // Get available rooms (empty rooms)
  const availableRooms = rooms.filter(room => room.status === 'empty');

  if (!patient) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <h2 className="text-lg font-medium">Paciente não encontrado</h2>
            <div className="mt-6">
              <Link to="/patients">
                <Button>Voltar para Listagem</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const statusColors = {
    normal: 'text-status-normal',
    warning: 'text-status-warning',
    alert: 'text-status-alert',
    urgent: 'text-status-urgent',
    empty: 'text-gray-400',
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Patient info */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Informações do Paciente</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Nome</h3>
                    <p className="text-lg font-semibold">{patient.name}</p>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Idade</h3>
                      <p>{patient.age} anos</p>
                    </div>
                    {patient.birthDate && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Data de Nascimento</h3>
                        <p>{new Date(patient.birthDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {patient.diagnosis && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Diagnóstico</h3>
                      <p>{patient.diagnosis}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Limites de Frequência Cardíaca
                    </h3>
                    <p>
                      {patient.minHeartRate} - {patient.maxHeartRate} bpm
                    </p>
                  </div>

                  <div className="pt-2">
                    <h3 className="text-sm font-medium text-gray-500">Quarto</h3>
                    {patient.roomNumber ? (
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-2 text-primary-blue" />
                          <Link
                            to={`/room/${patient.roomNumber}`}
                            className="text-primary-blue hover:underline font-medium"
                          >
                            Quarto {patient.roomNumber}
                          </Link>
                        </div>
                        <div className="flex items-center">
                          <Heart 
                            className={`h-4 w-4 mr-1.5 ${statusColors[patient.status]} ${patient.status !== 'normal' && patient.status !== 'empty' ? 'animate-pulse' : ''}`}
                            fill={patient.status !== 'empty' ? 'currentColor' : 'none'} 
                          />
                          <span className={`text-sm ${statusColors[patient.status]}`}>
                            {patient.currentHeartRate || '--'} bpm
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500">Não alocado</span>
                        {availableRooms.length > 0 ? (
                          <Link to={`/assign-patient/${patient.id}`}>
                            <Button variant="outline" size="sm">
                              Vincular a um quarto
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-amber-600">Sem quartos disponíveis</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4">
              <Link to={`/edit-patient/${patient.id}`}>
                <Button 
                  className="w-full bg-primary-blue hover:bg-primary-blue/90"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Informações
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column - History and vitals */}
          <div className="md:col-span-2">
            {patient.status !== 'empty' ? (
              <MeasurementHistory patient={patient} />
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Histórico de Medições</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <p className="text-gray-500 mb-4">
                        Este paciente não está alocado em nenhum quarto.
                      </p>
                      <p className="text-gray-500">
                        Vincule-o a um quarto para iniciar o monitoramento.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDetail;
