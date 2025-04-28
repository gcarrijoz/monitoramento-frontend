
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Patient } from '@/contexts/PatientContext';

interface MeasurementHistoryProps {
  patient: Patient;
}

// Generate mock data for the chart
const generateMockData = (patient: Patient) => {
  const now = new Date();
  const data = [];
  const baseHeartRate = patient.currentHeartRate || 75;
  
  // Generate data for the last 24 hours in 2-hour intervals
  for (let i = 12; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
    const hourMinute = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Generate a slightly random heart rate based on the patient's status
    let variation = 0;
    if (patient.status === 'normal') {
      variation = Math.random() * 10 - 5; // -5 to +5
    } else if (patient.status === 'warning') {
      variation = Math.random() * 20 - 5; // -5 to +15
    } else if (patient.status === 'alert') {
      variation = Math.random() * 30 - 10; // -10 to +20
    } else if (patient.status === 'urgent') {
      variation = Math.random() * 40 - 15; // -15 to +25
    }
    
    const heartRate = Math.round(baseHeartRate + variation);
    
    data.push({
      time: hourMinute,
      heartRate: heartRate,
      min: patient.minHeartRate,
      max: patient.maxHeartRate,
    });
  }
  
  return data;
};

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({ patient }) => {
  const data = generateMockData(patient);
  
  // Function to get heart rate color based on value
  const getHeartRateColor = (heartRate: number) => {
    if (heartRate < patient.minHeartRate) return '#c41c1c'; // below min
    if (heartRate > patient.maxHeartRate) return '#c41c1c'; // above max
    return '#3b82f6'; // normal
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Histórico de Medições</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
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
                  label={{ value: 'Horário', position: 'insideBottomRight', offset: -5 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ value: 'BPM', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 10', 'dataMax + 10']}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                  name="Frequência Cardíaca"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={(data: any) => {
                    return (
                      <circle 
                        r={4} 
                        strokeWidth={2} 
                        fill={getHeartRateColor(data.payload.heartRate)}
                        stroke="#fff"
                        cx={data.cx}
                        cy={data.cy}
                      />
                    );
                  }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  isAnimationActive={true}
                />
                <Line 
                  type="monotone" 
                  dataKey="min" 
                  name="Limite Mínimo"
                  stroke="#94a3b8" 
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="max" 
                  name="Limite Máximo"
                  stroke="#94a3b8" 
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Este é um histórico simulado para demonstração do MVP.</p>
          <p>Os dados reais serão coletados quando o sistema estiver em produção.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeasurementHistory;
