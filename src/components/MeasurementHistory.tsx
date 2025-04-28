
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { Patient } from '@/contexts/PatientContext';
import { Button } from './ui/button';
import { Clock, CalendarDays, LineChart as LineChartIcon } from 'lucide-react';

interface MeasurementHistoryProps {
  patient: Patient;
  timeRange?: '24h' | '7d' | '30d';
  showFilters?: boolean;
  height?: number;
  expandable?: boolean;
}

// Generate mock data for the chart
const generateMockData = (patient: Patient, timeRange: '24h' | '7d' | '30d') => {
  const now = new Date();
  const data = [];
  const baseHeartRate = patient.currentHeartRate || 75;
  
  let interval: number;
  let dataPoints: number;
  let dateFormat: Intl.DateTimeFormatOptions;
  
  switch (timeRange) {
    case '24h':
      interval = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      dataPoints = 12;
      dateFormat = { hour: '2-digit', minute: '2-digit' };
      break;
    case '7d':
      interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      dataPoints = 7;
      dateFormat = { month: 'numeric', day: 'numeric' };
      break;
    case '30d':
      interval = 24 * 60 * 60 * 1000 * 2; // 2 days in milliseconds
      dataPoints = 15;
      dateFormat = { month: 'numeric', day: 'numeric' };
      break;
  }
  
  // Generate alerts at certain points
  let alertPoints = [];
  if (timeRange === '24h') {
    alertPoints = [2, 7]; // Alert at data points 2 and 7
  } else if (timeRange === '7d') {
    alertPoints = [1, 4]; // Alert at data points 1 and 4
  } else {
    alertPoints = [3, 10]; // Alert at data points 3 and 10
  }
  
  // Generate data
  for (let i = dataPoints; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval);
    const formattedTime = time.toLocaleDateString('pt-BR', dateFormat);
    
    // Generate a slightly random heart rate based on the patient's status
    let variation = 0;
    let heartRate;
    
    if (alertPoints.includes(i)) {
      // Create an out-of-range value for alert points
      if (Math.random() > 0.5) {
        heartRate = patient.maxHeartRate + Math.floor(Math.random() * 20) + 5;
      } else {
        heartRate = patient.minHeartRate - Math.floor(Math.random() * 15) - 5;
      }
    } else {
      // Generate normal variation
      if (patient.status === 'normal') {
        variation = Math.random() * 10 - 5; // -5 to +5
      } else if (patient.status === 'warning') {
        variation = Math.random() * 20 - 5; // -5 to +15
      } else if (patient.status === 'alert') {
        variation = Math.random() * 30 - 10; // -10 to +20
      } else if (patient.status === 'urgent') {
        variation = Math.random() * 40 - 15; // -15 to +25
      }
      
      heartRate = Math.round(baseHeartRate + variation);
    }
    
    // Add events for significant readings
    let event = null;
    if (alertPoints.includes(i)) {
      if (heartRate > patient.maxHeartRate) {
        event = 'Alerta de Taquicardia';
      } else if (heartRate < patient.minHeartRate) {
        event = 'Alerta de Bradicardia';
      }
    }
    
    data.push({
      time: formattedTime,
      heartRate: heartRate,
      min: patient.minHeartRate,
      max: patient.maxHeartRate,
      event: event,
    });
  }
  
  return data;
};

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({ 
  patient, 
  timeRange = '24h',
  showFilters = false,
  height = 300,
  expandable = false
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>(timeRange);
  const data = generateMockData(patient, selectedTimeRange);
  
  // Function to get heart rate color based on value
  const getHeartRateColor = (heartRate: number) => {
    if (heartRate < patient.minHeartRate || heartRate > patient.maxHeartRate) return '#c41c1c'; // out of range
    return '#3b82f6'; // normal
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Histórico de Medições</CardTitle>
          {expandable && (
            <Button variant="ghost" size="sm" asChild>
              <a href={`/patient/${patient.id}/history`}>
                <LineChartIcon className="h-4 w-4 mr-2" />
                Ver Histórico Completo
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="flex gap-2 mb-4">
            <Button 
              variant={selectedTimeRange === '24h' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedTimeRange('24h')}
            >
              <Clock className="h-4 w-4 mr-1" />
              24 horas
            </Button>
            <Button 
              variant={selectedTimeRange === '7d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedTimeRange('7d')}
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              7 dias
            </Button>
            <Button 
              variant={selectedTimeRange === '30d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedTimeRange('30d')}
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              30 dias
            </Button>
          </div>
        )}
        
        <div style={{ height: `${height}px` }}>
          <ChartContainer config={{
            heartRate: { theme: { light: '#3b82f6', dark: '#3b82f6' } },
            minLimit: { theme: { light: '#94a3b8', dark: '#94a3b8' } },
            maxLimit: { theme: { light: '#94a3b8', dark: '#94a3b8' } },
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  label={{ 
                    value: selectedTimeRange === '24h' ? 'Horário' : 'Data', 
                    position: 'insideBottomRight', 
                    offset: -5 
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'BPM', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip 
                  content={(props) => {
                    const { active, payload } = props;
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                          <p className="font-semibold">{data.time}</p>
                          <p className="text-blue-500 font-medium">
                            {data.heartRate} bpm
                          </p>
                          {data.event && (
                            <p className="text-red-600 text-xs mt-1 font-medium">
                              {data.event}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                {/* Reference lines for min and max heart rate */}
                <ReferenceLine y={patient.minHeartRate} stroke="#94a3b8" strokeDasharray="3 3" />
                <ReferenceLine y={patient.maxHeartRate} stroke="#94a3b8" strokeDasharray="3 3" />
                
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                  name="Frequência Cardíaca"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={(data: any) => {
                    const fill = getHeartRateColor(data.payload.heartRate);
                    const hasEvent = data.payload.event !== null;
                    
                    return (
                      <svg>
                        <circle 
                          r={hasEvent ? 6 : 4} 
                          strokeWidth={2} 
                          fill={fill}
                          stroke="#fff"
                          cx={data.cx}
                          cy={data.cy}
                        />
                        {hasEvent && (
                          <circle 
                            r={8} 
                            strokeWidth={2} 
                            fill="none"
                            stroke="#c41c1c"
                            strokeDasharray="2 2"
                            cx={data.cx}
                            cy={data.cy}
                          />
                        )}
                      </svg>
                    );
                  }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Este é um histórico simulado para demonstração do MVP.</p>
          <p>Os dados reais serão coletados quando o sistema estiver em produção.</p>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex justify-center gap-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs">Normal</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
            <span className="text-xs">Fora dos limites</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full border border-dashed border-gray-400 p-2 mr-2"></div>
            <span className="text-xs">Evento registrado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeasurementHistory;
