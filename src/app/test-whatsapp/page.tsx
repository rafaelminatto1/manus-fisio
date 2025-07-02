'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function TestWhatsAppPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Estados para diferentes tipos de mensagem
  const [reminderData, setReminderData] = useState({
    patientName: 'João Silva',
    patientPhone: '+5511999999999',
    appointmentDate: '15/01/2025',
    appointmentTime: '14:00',
    clinicName: 'Manus Fisio',
    clinicAddress: 'Rua das Flores, 123 - São Paulo'
  });

  const [prescriptionData, setPrescriptionData] = useState({
    patientName: 'Maria Santos',
    patientPhone: '+5511888888888',
    exercises: [
      'Alongamento cervical - 3 séries de 15 segundos',
      'Fortalecimento do core - 2 séries de 10 repetições',
      'Caminhada leve - 20 minutos diários'
    ],
    notes: 'Evite movimentos bruscos. Em caso de dor, suspenda o exercício.'
  });

  const [genericData, setGenericData] = useState({
    to: '+5511777777777',
    body: 'Olá! Esta é uma mensagem de teste do Manus Fisio. 👋'
  });

  // Função para testar conexão
  const testConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/send', { method: 'GET' });
      const result = await response.json();
      
      if (result.success) {
        toast.success('✅ Conexão com WhatsApp funcionando!');
      } else {
        toast.error('❌ Falha na conexão com WhatsApp');
      }
    } catch (error) {
      toast.error('❌ Erro ao testar conexão');
    }
    setIsLoading(false);
  };

  // Função para enviar mensagem
  const sendMessage = async (type: string, data: any) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('✅ Mensagem enviada com sucesso!');
      } else {
        toast.error(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      toast.error('❌ Erro ao enviar mensagem');
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🔧 Teste WhatsApp Integration</h1>
        <p className="text-muted-foreground">
          Teste as funcionalidades de WhatsApp do Manus Fisio
        </p>
      </div>

      {/* Botão de teste de conexão */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Conectividade</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testConnection} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testando...' : '🔍 Testar Conexão com WhatsApp'}
          </Button>
        </CardContent>
      </Card>

      {/* Abas para diferentes tipos de mensagem */}
      <Tabs defaultValue="reminder" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reminder">Lembrete</TabsTrigger>
          <TabsTrigger value="prescription">Exercícios</TabsTrigger>
          <TabsTrigger value="confirmation">Confirmação</TabsTrigger>
          <TabsTrigger value="generic">Genérica</TabsTrigger>
        </TabsList>

        {/* Aba Lembrete de Consulta */}
        <TabsContent value="reminder">
          <Card>
            <CardHeader>
              <CardTitle>🏥 Lembrete de Consulta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Nome do Paciente</Label>
                  <Input
                    id="patientName"
                    value={reminderData.patientName}
                    onChange={(e) => setReminderData({...reminderData, patientName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="patientPhone">Telefone</Label>
                  <Input
                    id="patientPhone"
                    value={reminderData.patientPhone}
                    onChange={(e) => setReminderData({...reminderData, patientPhone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="appointmentDate">Data</Label>
                  <Input
                    id="appointmentDate"
                    value={reminderData.appointmentDate}
                    onChange={(e) => setReminderData({...reminderData, appointmentDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="appointmentTime">Horário</Label>
                  <Input
                    id="appointmentTime"
                    value={reminderData.appointmentTime}
                    onChange={(e) => setReminderData({...reminderData, appointmentTime: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="clinicName">Nome da Clínica</Label>
                <Input
                  id="clinicName"
                  value={reminderData.clinicName}
                  onChange={(e) => setReminderData({...reminderData, clinicName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="clinicAddress">Endereço (opcional)</Label>
                <Input
                  id="clinicAddress"
                  value={reminderData.clinicAddress}
                  onChange={(e) => setReminderData({...reminderData, clinicAddress: e.target.value})}
                />
              </div>
              <Button 
                onClick={() => sendMessage('appointment-reminder', reminderData)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Enviando...' : '📱 Enviar Lembrete'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Prescrição de Exercícios */}
        <TabsContent value="prescription">
          <Card>
            <CardHeader>
              <CardTitle>💪 Prescrição de Exercícios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prescPatientName">Nome do Paciente</Label>
                  <Input
                    id="prescPatientName"
                    value={prescriptionData.patientName}
                    onChange={(e) => setPrescriptionData({...prescriptionData, patientName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="prescPatientPhone">Telefone</Label>
                  <Input
                    id="prescPatientPhone"
                    value={prescriptionData.patientPhone}
                    onChange={(e) => setPrescriptionData({...prescriptionData, patientPhone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="exercises">Exercícios (um por linha)</Label>
                <Textarea
                  id="exercises"
                  rows={5}
                  value={prescriptionData.exercises.join('\n')}
                  onChange={(e) => setPrescriptionData({
                    ...prescriptionData, 
                    exercises: e.target.value.split('\n').filter(ex => ex.trim())
                  })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={prescriptionData.notes}
                  onChange={(e) => setPrescriptionData({...prescriptionData, notes: e.target.value})}
                />
              </div>
              <Button 
                onClick={() => sendMessage('exercise-prescription', prescriptionData)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Enviando...' : '📱 Enviar Prescrição'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Confirmação */}
        <TabsContent value="confirmation">
          <Card>
            <CardHeader>
              <CardTitle>✅ Confirmação de Agendamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Paciente</Label>
                  <Input defaultValue="Carlos Silva" id="confPatientName" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input defaultValue="+5511666666666" id="confPatientPhone" />
                </div>
                <div>
                  <Label>Data</Label>
                  <Input defaultValue="20/01/2025" id="confDate" />
                </div>
                <div>
                  <Label>Horário</Label>
                  <Input defaultValue="10:30" id="confTime" />
                </div>
              </div>
              <Button 
                onClick={() => {
                  const data = {
                    patientName: (document.getElementById('confPatientName') as HTMLInputElement).value,
                    patientPhone: (document.getElementById('confPatientPhone') as HTMLInputElement).value,
                    appointmentDate: (document.getElementById('confDate') as HTMLInputElement).value,
                    appointmentTime: (document.getElementById('confTime') as HTMLInputElement).value,
                  };
                  sendMessage('appointment-confirmation', data);
                }}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Enviando...' : '📱 Enviar Confirmação'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Mensagem Genérica */}
        <TabsContent value="generic">
          <Card>
            <CardHeader>
              <CardTitle>💬 Mensagem Genérica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="genericTo">Telefone</Label>
                <Input
                  id="genericTo"
                  value={genericData.to}
                  onChange={(e) => setGenericData({...genericData, to: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="genericBody">Mensagem</Label>
                <Textarea
                  id="genericBody"
                  rows={4}
                  value={genericData.body}
                  onChange={(e) => setGenericData({...genericData, body: e.target.value})}
                />
              </div>
              <Button 
                onClick={() => sendMessage('generic', genericData)}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Enviando...' : '📱 Enviar Mensagem'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Instruções</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Configure suas credenciais da Twilio no arquivo <code>.env.local</code></li>
            <li>Conecte seu WhatsApp ao sandbox da Twilio</li>
            <li>Teste a conexão primeiro</li>
            <li>Use seu próprio número de telefone para receber as mensagens de teste</li>
            <li>Verifique se os números estão no formato correto (+5511999999999)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
} 