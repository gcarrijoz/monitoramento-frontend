
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { usePatients } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const EditPatient = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { getPatient, updatePatient } = usePatients();

  const patient = patientId ? getPatient(patientId) : undefined;

  const [formData, setFormData] = useState({
    name: '',
    age: 0,
    birthDate: '',
    diagnosis: '',
    minHeartRate: 60,
    maxHeartRate: 100,
  });

  // Load patient data when component mounts
  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        age: patient.age,
        birthDate: patient.birthDate,
        diagnosis: patient.diagnosis || '',
        minHeartRate: patient.minHeartRate,
        maxHeartRate: patient.maxHeartRate,
      });
    }
  }, [patient]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle number inputs
    if (name === 'age' || name === 'minHeartRate' || name === 'maxHeartRate') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate heart rate limits
    if (formData.minHeartRate >= formData.maxHeartRate) {
      toast.error('O limite mínimo de batimentos deve ser menor que o limite máximo.');
      return;
    }

    if (formData.minHeartRate < 30 || formData.maxHeartRate > 220) {
      toast.error('Os limites de batimentos devem estar entre 30 e 220 bpm.');
      return;
    }

    // Validate name
    if (!formData.name.trim()) {
      toast.error('O nome do paciente é obrigatório.');
      return;
    }

    // Update patient info
    updatePatient(patientId!, formData);
    navigate(`/patient/${patientId}`);
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Editar Informações do Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nome do paciente"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Idade"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthDate">Data de Nascimento</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      placeholder="Data de Nascimento"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="diagnosis">Diagnóstico</Label>
                  <Textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    placeholder="Diagnóstico (opcional)"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Limites de Frequência Cardíaca (bpm)</Label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="minHeartRate" className="text-sm text-gray-500">Mínimo</Label>
                      <Input
                        id="minHeartRate"
                        name="minHeartRate"
                        type="number"
                        value={formData.minHeartRate}
                        onChange={handleChange}
                        placeholder="Mínimo"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxHeartRate" className="text-sm text-gray-500">Máximo</Label>
                      <Input
                        id="maxHeartRate"
                        name="maxHeartRate"
                        type="number"
                        value={formData.maxHeartRate}
                        onChange={handleChange}
                        placeholder="Máximo"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-primary-blue hover:bg-primary-blue/90">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditPatient;
