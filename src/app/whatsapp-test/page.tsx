'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function WhatsAppTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Função para testar conexão
  const testConnection = async () => {
    setIsLoading(true);
    addTestResult('🔍 Testando conexão com Twilio...');
    
    try {
      const response = await fetch('/api/whatsapp/send', { method: 'GET' });
      const result = await response.json();
      
      if (result.success) {
        addTestResult('✅ Conexão com WhatsApp funcionando!');
        toast.success('Conexão estabelecida com sucesso!');
      } else {
        addTestResult(`❌ Falha na conexão: ${result.message}`);
        toast.error('Falha na conexão');
      }
    } catch (error) {
      addTestResult(`❌ Erro de conexão: ${error}`);
      toast.error('Erro ao testar conexão');
    }
    setIsLoading(false);
  };

  // Função para adicionar resultado de teste
  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Função para enviar lembrete de teste
  const sendTestReminder = async () => {
    setIsLoading(true);
    addTestResult('📱 Enviando lembrete de teste...');
    
    const testData = {
      type: 'appointment-reminder',
      patientName: 'João da Silva',
      patientPhone: '+5511999999999', // Substitua pelo seu número
      appointmentDate: '15/01/2025',
      appointmentTime: '14:00',
      clinicName: 'Manus Fisio',
      clinicAddress: 'Rua das Flores, 123 - São Paulo'
    };

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        addTestResult('✅ Lembrete enviado com sucesso!');
        toast.success('Lembrete enviado!');
      } else {
        addTestResult(`❌ Erro ao enviar: ${result.error}`);
        toast.error(`Erro: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Erro de envio: ${error}`);
      toast.error('Erro ao enviar lembrete');
    }
    setIsLoading(false);
  };

  // Função para enviar prescrição de teste
  const sendTestPrescription = async () => {
    setIsLoading(true);
    addTestResult('💊 Enviando prescrição de teste...');
    
    const testData = {
      type: 'exercise-prescription',
      patientName: 'Maria Santos',
      patientPhone: '+5511999999999', // Substitua pelo seu número
      exercises: [
        'Alongamento cervical - 3 séries de 15 segundos',
        'Fortalecimento do core - 2 séries de 10 repetições',
        'Caminhada leve - 20 minutos diários'
      ],
      notes: 'Evite movimentos bruscos. Em caso de dor, suspenda o exercício.'
    };

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        addTestResult('✅ Prescrição enviada com sucesso!');
        toast.success('Prescrição enviada!');
      } else {
        addTestResult(`❌ Erro ao enviar: ${result.error}`);
        toast.error(`Erro: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Erro de envio: ${error}`);
      toast.error('Erro ao enviar prescrição');
    }
    setIsLoading(false);
  };

  // Limpar resultados
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🔧 Teste WhatsApp Integration</h1>
        <p className="text-muted-foreground">
          Teste as funcionalidades de WhatsApp do Manus Fisio
        </p>
      </div>

      {/* Instruções de Configuração */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">📋 Antes de Testar</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>Configure as variáveis no <code>.env.local</code>:</li>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><code>TWILIO_ACCOUNT_SID=your_account_sid</code></li>
              <li><code>TWILIO_AUTH_TOKEN=your_auth_token</code></li>
              <li><code>TWILIO_WHATSAPP_FROM=whatsapp:+14155238886</code></li>
            </ul>
            <li>Conecte seu WhatsApp ao sandbox da Twilio</li>
            <li>Substitua os números de telefone pelos seus números de teste</li>
          </ol>
        </CardContent>
      </Card>

      {/* Botões de Teste */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          variant="outline"
          size="lg"
          className="h-20"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🔍</div>
            <div>Testar Conexão</div>
          </div>
        </Button>

        <Button 
          onClick={sendTestReminder} 
          disabled={isLoading}
          variant="outline"
          size="lg"
          className="h-20"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">🏥</div>
            <div>Lembrete de Consulta</div>
          </div>
        </Button>

        <Button 
          onClick={sendTestPrescription} 
          disabled={isLoading}
          variant="outline"
          size="lg"
          className="h-20"
        >
          <div className="text-center">
            <div className="text-2xl mb-1">💊</div>
            <div>Prescrição de Exercícios</div>
          </div>
        </Button>
      </div>

      {/* Status de Loading */}
      {isLoading && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="text-center py-8">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-yellow-800">Processando...</p>
          </CardContent>
        </Card>
      )}

      {/* Resultados dos Testes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>📊 Resultados dos Testes</CardTitle>
          <Button 
            onClick={clearResults} 
            variant="outline" 
            size="sm"
            disabled={testResults.length === 0}
          >
            Limpar
          </Button>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum teste executado ainda. Execute um teste acima para ver os resultados.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {result}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>ℹ️ Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">✅ Se funcionar:</h4>
            <p className="text-green-700 text-sm">
              Você receberá mensagens WhatsApp no número conectado ao sandbox. 
              A integração está pronta para uso!
            </p>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">❌ Se não funcionar:</h4>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• Verifique as credenciais no .env.local</li>
              <li>• Confirme se seu WhatsApp está conectado ao sandbox</li>
              <li>• Verifique os logs do console para mais detalhes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 