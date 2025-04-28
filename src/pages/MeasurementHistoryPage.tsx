
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import MeasurementHistory from '@/components/MeasurementHistory';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock, Heart, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const MeasurementHistoryPage = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { getPatient } = usePatients();
  
  const patient = patientId ? getPatient(patientId) : undefined;
  
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
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold mb-1">Histórico de Medições</h1>
                <div className="text-gray-500 flex items-center">
                  <Link to={`/patient/${patient.id}`} className="hover:underline hover:text-primary-blue">
                    {patient.name}
                  </Link>
                  <span className="mx-1">•</span>
                  <div className="flex items-center">
                    <Heart 
                      className={`h-4 w-4 mr-1 ${statusColors[patient.status]} ${patient.status !== 'normal' && patient.status !== 'empty' ? 'animate-pulse' : ''}`}
                      fill={patient.status !== 'empty' ? 'currentColor' : 'none'} 
                    />
                    <span className={`${statusColors[patient.status]}`}>
                      {patient.currentHeartRate || '--'} bpm
                    </span>
                  </div>
                </div>
              </div>
              
              {patient.roomNumber && (
                <Link to={`/room/${patient.roomNumber}`}>
                  <Button variant="outline" size="sm">
                    Quarto {patient.roomNumber}
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6 flex justify-between items-center">
                    <div className="space-x-2">
                      <span className="text-sm font-medium text-gray-500">Limites de Frequência Cardíaca:</span>
                      <span className="text-sm font-semibold">{patient.minHeartRate} - {patient.maxHeartRate} bpm</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Atualizado em: {new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <Separator className="mb-6" />
                  <MeasurementHistory 
                    patient={patient} 
                    showFilters={true}
                    timeRange="24h"
                    height={400}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Eventos Significativos</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-2">Data/Hora</th>
                      <th className="pb-2">Leitura</th>
                      <th className="pb-2">Evento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200">
                      <td className="py-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          28/04/2025 14:30
                        </div>
                      </td>
                      <td className="py-3 text-red-600 font-medium">118 bpm</td>
                      <td className="py-3">Taquicardia detectada</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="py-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          28/04/2025 03:15
                        </div>
                      </td>
                      <td className="py-3 text-red-600 font-medium">52 bpm</td>
                      <td className="py-3">Bradicardia detectada</td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td className="py-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          27/04/2025 19:45
                        </div>
                      </td>
                      <td className="py-3 text-red-600 font-medium">105 bpm</td>
                      <td className="py-3">Limite superior excedido</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MeasurementHistoryPage;
