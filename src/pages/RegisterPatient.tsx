
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft } from 'lucide-react';

const RegisterPatient = () => {
  const navigate = useNavigate();
  const { addPatient, rooms } = usePatients();
  
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<number | string>('');
  const [diagnosis, setDiagnosis] = useState('');
  const [minHeartRate, setMinHeartRate] = useState(60);
  const [maxHeartRate, setMaxHeartRate] = useState(100);
  const [roomNumber, setRoomNumber] = useState<number | ''>('');
  
  // Filter only empty rooms
  const availableRooms = rooms.filter(room => room.status === 'empty');
  
  const calculateAge = (birthDateString: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBirthDate = e.target.value;
    setBirthDate(newBirthDate);
    
    if (newBirthDate) {
      setAge(calculateAge(newBirthDate));
    } else {
      setAge('');
    }
  };
  
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = e.target.value;
    setAge(newAge === '' ? '' : Number(newAge));
    
    // Clear birthdate if age is edited manually
    if (newAge !== '') {
      setBirthDate('');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPatient = {
      name,
      birthDate,
      age: Number(age),
      diagnosis: diagnosis || undefined,
      minHeartRate,
      maxHeartRate,
      roomNumber: roomNumber || null,
      status: 'normal' as const,
    };
    
    addPatient(newPatient);
    
    // Navigate to patient list after registering
    navigate('/patients');
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
            <div>
              <h1 className="text-2xl font-bold">Cadastrar Novo Paciente</h1>
              <p className="text-gray-500 mt-1">
                Preencha os dados do paciente para iniciar o monitoramento
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome Completo*</Label>
                    <Input
                      id="name"
                      placeholder="Ex: João da Silva"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={handleBirthDateChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="age">Idade*</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Ex: 65"
                        required
                        value={age}
                        onChange={handleAgeChange}
                        min={0}
                        max={120}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="diagnosis">Diagnóstico</Label>
                    <Textarea
                      id="diagnosis"
                      placeholder="Ex: Hipertensão, Pós-operatório..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="room">Quarto (opcional)</Label>
                    <select
                      id="room"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value ? Number(e.target.value) : '')}
                    >
                      <option value="">Selecione um quarto</option>
                      {availableRooms.map((room) => (
                        <option key={room.number} value={room.number}>
                          Quarto {room.number}
                        </option>
                      ))}
                    </select>
                    {availableRooms.length === 0 && (
                      <p className="text-sm text-amber-600 mt-1">
                        Não há quartos disponíveis no momento.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Limites de Frequência Cardíaca*</h3>
                    <p className="text-xs text-gray-500 mb-2">
                      Defina os valores para disparo de alertas
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minHeartRate">Mínimo (bpm)</Label>
                        <Input
                          id="minHeartRate"
                          type="number"
                          required
                          value={minHeartRate}
                          onChange={(e) => setMinHeartRate(Number(e.target.value))}
                          min={30}
                          max={maxHeartRate}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="maxHeartRate">Máximo (bpm)</Label>
                        <Input
                          id="maxHeartRate"
                          type="number"
                          required
                          value={maxHeartRate}
                          onChange={(e) => setMaxHeartRate(Number(e.target.value))}
                          min={minHeartRate}
                          max={220}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate(-1)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary-blue hover:bg-primary-blue/90"
                >
                  Salvar Paciente
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPatient;
