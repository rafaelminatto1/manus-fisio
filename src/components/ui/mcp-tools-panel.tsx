'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar,
  Users,
  CheckSquare,
  BarChart3,
  Activity,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useMCPClient, MCPToolResult } from '@/lib/mcp-client';

interface MCPToolsPanelProps {
  className?: string;
}

export default function MCPToolsPanel({ className }: MCPToolsPanelProps) {
  const mcpClient = useMCPClient();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MCPToolResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados para formulários
  const [searchQuery, setSearchQuery] = useState('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    event_type: 'consulta' as const,
  });
  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'media' as const,
    status: 'pendente' as const,
  });

  const executeToolCall = async (toolCall: () => Promise<MCPToolResult>, successMessage?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await toolCall();
      setResult(result);
      if (successMessage) {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Verificar saúde do sistema ao carregar
  useEffect(() => {
    executeToolCall(() => mcpClient.systemHealthCheck());
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Painel de Ferramentas MCP
          </CardTitle>
          <CardDescription>
            Interface para testar e usar as ferramentas do Model Context Protocol do sistema Manus Fisio
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="calendar">Agenda</TabsTrigger>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Sistema */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={() => executeToolCall(() => mcpClient.systemHealthCheck())}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verificar Saúde do Sistema
                </Button>
                <Button 
                  onClick={() => executeToolCall(() => mcpClient.getDashboardStats())}
                  disabled={loading}
                  variant="outline"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Obter Estatísticas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agenda */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Gestão de Agenda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={() => executeToolCall(() => mcpClient.getCalendarEvents())}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Listar Todos os Eventos
                </Button>
                <Button 
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    executeToolCall(() => mcpClient.getCalendarEvents({
                      start_date: today,
                      end_date: today
                    }));
                  }}
                  disabled={loading}
                  variant="outline"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Eventos de Hoje
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Novo Evento
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="event-title">Título</Label>
                    <Input
                      id="event-title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Consulta João Silva"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-type">Tipo</Label>
                    <Select 
                      value={newEvent.event_type} 
                      onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, event_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulta">Consulta</SelectItem>
                        <SelectItem value="avaliacao">Avaliação</SelectItem>
                        <SelectItem value="retorno">Retorno</SelectItem>
                        <SelectItem value="procedimento">Procedimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="event-start">Data/Hora Início</Label>
                    <Input
                      id="event-start"
                      type="datetime-local"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-end">Data/Hora Fim</Label>
                    <Input
                      id="event-end"
                      type="datetime-local"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="event-description">Descrição</Label>
                    <Textarea
                      id="event-description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição opcional do evento"
                    />
                  </div>
                </div>
                <Button 
                  className="mt-3"
                  onClick={() => {
                    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
                      setError('Preencha todos os campos obrigatórios');
                      return;
                    }
                    executeToolCall(() => mcpClient.createCalendarEvent({
                      ...newEvent,
                      start_time: new Date(newEvent.start_time).toISOString(),
                      end_time: new Date(newEvent.end_time).toISOString(),
                    }));
                  }}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Evento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pacientes */}
        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Gestão de Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar paciente por nome, email ou telefone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    if (!searchQuery.trim()) {
                      setError('Digite um termo de busca');
                      return;
                    }
                    executeToolCall(() => mcpClient.searchPatients(searchQuery));
                  }}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Cadastrar Novo Paciente
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="patient-name">Nome</Label>
                    <Input
                      id="patient-name"
                      value={newPatient.name}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient-email">Email</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="patient-phone">Telefone</Label>
                    <Input
                      id="patient-phone"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <Button 
                  className="mt-3"
                  onClick={() => {
                    if (!newPatient.name.trim()) {
                      setError('Nome é obrigatório');
                      return;
                    }
                    executeToolCall(() => mcpClient.createPatient(newPatient));
                  }}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar Paciente
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tarefas */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Gestão de Tarefas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={() => executeToolCall(() => mcpClient.getTasks())}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Todas as Tarefas
                </Button>
                <Button 
                  onClick={() => executeToolCall(() => mcpClient.getTasks({ status: 'pendente' }))}
                  disabled={loading}
                  variant="outline"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Pendentes
                </Button>
                <Button 
                  onClick={() => executeToolCall(() => mcpClient.getTasks({ priority: 'urgente' }))}
                  disabled={loading}
                  variant="outline"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Urgentes
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Nova Tarefa
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="task-title">Título</Label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Verificar equipamento ultrassom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-priority">Prioridade</Label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="task-description">Descrição</Label>
                    <Textarea
                      id="task-description"
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição detalhada da tarefa"
                    />
                  </div>
                </div>
                <Button 
                  className="mt-3"
                  onClick={() => {
                    if (!newTask.title.trim()) {
                      setError('Título é obrigatório');
                      return;
                    }
                    executeToolCall(() => mcpClient.createTask(newTask));
                  }}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Tarefa
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics e Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => executeToolCall(() => mcpClient.getDashboardStats())}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Obter Estatísticas Gerais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resultado */}
      {(result || error) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : result ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {result.content[0]?.text || 'Resultado vazio'}
                </pre>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 