import { z } from 'zod';

// Tipos para o protocolo MCP
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPToolCall {
  name: string;
  arguments: any;
}

export interface MCPToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export interface MCPCapabilities {
  tools: Record<string, any>;
}

export interface MCPServerInfo {
  name: string;
  version: string;
}

// Cliente MCP para o sistema Manus Fisio
export class ManusFisioMCPClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  // Obter capacidades do servidor MCP
  async getCapabilities(): Promise<{ capabilities: MCPCapabilities; serverInfo: MCPServerInfo }> {
    const response = await fetch(`${this.baseUrl}/api/mcp/capabilities`);
    if (!response.ok) {
      throw new Error(`Failed to get capabilities: ${response.statusText}`);
    }
    return response.json();
  }

  // Listar todas as ferramentas disponíveis
  async listTools(): Promise<{ tools: MCPTool[] }> {
    const response = await fetch(`${this.baseUrl}/api/mcp/tools/list`);
    if (!response.ok) {
      throw new Error(`Failed to list tools: ${response.statusText}`);
    }
    return response.json();
  }

  // Executar uma ferramenta específica
  async callTool(name: string, args: any): Promise<MCPToolResult> {
    const response = await fetch(`${this.baseUrl}/api/mcp/tools/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        arguments: args,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to call tool ${name}: ${response.statusText}`);
    }

    return response.json();
  }

  // Métodos de conveniência para ferramentas específicas

  // Agenda
  async getCalendarEvents(filters?: {
    start_date?: string;
    end_date?: string;
    event_type?: 'consulta' | 'avaliacao' | 'retorno' | 'procedimento';
    therapist_id?: string;
  }): Promise<MCPToolResult> {
    return this.callTool('get_calendar_events', filters || {});
  }

  async createCalendarEvent(event: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    event_type: 'consulta' | 'avaliacao' | 'retorno' | 'procedimento';
    patient_id?: string;
    therapist_id?: string;
  }): Promise<MCPToolResult> {
    return this.callTool('create_calendar_event', event);
  }

  // Pacientes
  async searchPatients(query: string, limit?: number): Promise<MCPToolResult> {
    return this.callTool('search_patients', { query, limit });
  }

  async createPatient(patient: {
    name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    address?: string;
  }): Promise<MCPToolResult> {
    return this.callTool('create_patient', patient);
  }

  // Tarefas
  async getTasks(filters?: {
    status?: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
    priority?: 'baixa' | 'media' | 'alta' | 'urgente';
    assigned_to?: string;
    limit?: number;
  }): Promise<MCPToolResult> {
    return this.callTool('get_tasks', filters || {});
  }

  async createTask(task: {
    title: string;
    description?: string;
    priority: 'baixa' | 'media' | 'alta' | 'urgente';
    status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
    assigned_to?: string;
    due_date?: string;
  }): Promise<MCPToolResult> {
    return this.callTool('create_task', task);
  }

  // Analytics
  async getDashboardStats(): Promise<MCPToolResult> {
    return this.callTool('get_dashboard_stats', {});
  }

  // Sistema
  async systemHealthCheck(): Promise<MCPToolResult> {
    return this.callTool('system_health_check', {});
  }
}

// Instância singleton do cliente MCP
export const mcpClient = new ManusFisioMCPClient();

// Hook para usar o cliente MCP em componentes React
export function useMCPClient() {
  return mcpClient;
}

// Utilitários para validação de dados
export const MCPSchemas = {
  Event: z.object({
    title: z.string(),
    description: z.string().optional(),
    start_time: z.string(),
    end_time: z.string(),
    event_type: z.enum(['consulta', 'avaliacao', 'retorno', 'procedimento']),
    patient_id: z.string().uuid().optional(),
    therapist_id: z.string().uuid().optional(),
  }),

  Patient: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    birth_date: z.string().optional(),
    address: z.string().optional(),
  }),

  Task: z.object({
    title: z.string(),
    description: z.string().optional(),
    priority: z.enum(['baixa', 'media', 'alta', 'urgente']),
    status: z.enum(['pendente', 'em_andamento', 'concluida', 'cancelada']),
    assigned_to: z.string().uuid().optional(),
    due_date: z.string().optional(),
  }),
};

// Exemplo de uso:
/*
import { mcpClient } from '@/lib/mcp-client';

// Verificar saúde do sistema
const health = await mcpClient.systemHealthCheck();
console.log(health.content[0].text);

// Buscar eventos de hoje
const today = new Date().toISOString().split('T')[0];
const events = await mcpClient.getCalendarEvents({
  start_date: today,
  end_date: today
});

// Criar novo paciente
const newPatient = await mcpClient.createPatient({
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '(11) 99999-9999'
});
*/ 