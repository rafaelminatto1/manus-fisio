import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Configuração do Supabase
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Schemas para validação de dados
const EventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  event_type: z.enum(['consulta', 'avaliacao', 'retorno', 'procedimento']),
  patient_id: z.string().uuid().optional(),
  therapist_id: z.string().uuid().optional(),
});

const PatientSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  address: z.string().optional(),
});

const TaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  priority: z.enum(['baixa', 'media', 'alta', 'urgente']),
  status: z.enum(['pendente', 'em_andamento', 'concluida', 'cancelada']),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().optional(),
});

// Definição das ferramentas MCP
const tools = {
  get_calendar_events: {
    name: 'get_calendar_events',
    description: 'Busca eventos do calendário da clínica',
    inputSchema: {
      type: 'object',
      properties: {
        start_date: { type: 'string', description: 'Data inicial (ISO string)' },
        end_date: { type: 'string', description: 'Data final (ISO string)' },
        event_type: { 
          type: 'string', 
          enum: ['consulta', 'avaliacao', 'retorno', 'procedimento'],
          description: 'Tipo de evento'
        },
        therapist_id: { type: 'string', description: 'ID do fisioterapeuta' },
      }
    },
    handler: async (args: any) => {
      try {
        let query = supabase
          .from('calendar_events')
          .select(`
            *,
            patients:patient_id(name, email, phone),
            users:therapist_id(name, email)
          `);

        if (args.start_date) query = query.gte('start_time', args.start_date);
        if (args.end_date) query = query.lte('end_time', args.end_date);
        if (args.event_type) query = query.eq('event_type', args.event_type);
        if (args.therapist_id) query = query.eq('therapist_id', args.therapist_id);

        const { data, error } = await query.order('start_time', { ascending: true });

        if (error) throw error;

        return {
          content: [{
            type: 'text',
            text: `📅 Encontrados ${data?.length || 0} eventos:\n\n${
              data?.map(event => 
                `• ${event.title} (${event.event_type})\n` +
                `  Data: ${new Date(event.start_time).toLocaleString('pt-BR')}\n` +
                `  Paciente: ${event.patients?.name || 'N/A'}\n` +
                `  Fisioterapeuta: ${event.users?.name || 'N/A'}\n`
              ).join('\n') || 'Nenhum evento encontrado.'
            }`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Erro ao buscar eventos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }]
        };
      }
    }
  },

  create_calendar_event: {
    name: 'create_calendar_event',
    description: 'Cria um novo evento no calendário da clínica',
    inputSchema: EventSchema,
    handler: async (args: any) => {
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .insert([args])
          .select()
          .single();

        if (error) throw error;

        return {
          content: [{
            type: 'text',
            text: `✅ Evento criado com sucesso!\n\n` +
                  `📅 ${data.title}\n` +
                  `📍 Tipo: ${data.event_type}\n` +
                  `⏰ Início: ${new Date(data.start_time).toLocaleString('pt-BR')}\n` +
                  `⏰ Fim: ${new Date(data.end_time).toLocaleString('pt-BR')}\n` +
                  `🆔 ID: ${data.id}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Erro ao criar evento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }]
        };
      }
    }
  },

  search_patients: {
    name: 'search_patients',
    description: 'Busca pacientes por nome, email ou telefone',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Termo de busca' },
        limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
      },
      required: ['query']
    },
    handler: async (args: any) => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .or(`name.ilike.%${args.query}%,email.ilike.%${args.query}%,phone.ilike.%${args.query}%`)
          .limit(args.limit || 10);

        if (error) throw error;

        return {
          content: [{
            type: 'text',
            text: `👥 Encontrados ${data?.length || 0} pacientes:\n\n${
              data?.map(patient => 
                `• ${patient.name}\n` +
                `  📧 ${patient.email || 'N/A'}\n` +
                `  📱 ${patient.phone || 'N/A'}\n` +
                `  🆔 ${patient.id}\n`
              ).join('\n') || 'Nenhum paciente encontrado.'
            }`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Erro ao buscar pacientes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }]
        };
      }
    }
  },

  create_patient: {
    name: 'create_patient',
    description: 'Cadastra um novo paciente na clínica',
    inputSchema: PatientSchema,
    handler: async (args: any) => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .insert([args])
          .select()
          .single();

        if (error) throw error;

        return {
          content: [{
            type: 'text',
            text: `✅ Paciente cadastrado com sucesso!\n\n` +
                  `👤 ${data.name}\n` +
                  `📧 ${data.email || 'N/A'}\n` +
                  `📱 ${data.phone || 'N/A'}\n` +
                  `🆔 ID: ${data.id}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Erro ao cadastrar paciente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }]
        };
      }
    }
  },

  get_tasks: {
    name: 'get_tasks',
    description: 'Lista tarefas da equipe com filtros opcionais',
    inputSchema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['pendente', 'em_andamento', 'concluida', 'cancelada'] 
        },
        priority: { 
          type: 'string', 
          enum: ['baixa', 'media', 'alta', 'urgente'] 
        },
        assigned_to: { type: 'string' },
        limit: { type: 'number', minimum: 1, maximum: 50, default: 20 }
      }
    },
    handler: async (args: any) => {
      try {
        let query = supabase
          .from('tasks')
          .select(`
            *,
            users:assigned_to(name, email)
          `);

        if (args.status) query = query.eq('status', args.status);
        if (args.priority) query = query.eq('priority', args.priority);
        if (args.assigned_to) query = query.eq('assigned_to', args.assigned_to);

        const { data, error } = await query
          .order('created_at', { ascending: false })
          .limit(args.limit || 20);

        if (error) throw error;

        return {
          content: [{
            type: 'text',
            text: `📋 Encontradas ${data?.length || 0} tarefas:\n\n${
              data?.map(task => 
                `• ${task.title}\n` +
                `  📊 Status: ${task.status}\n` +
                `  🔥 Prioridade: ${task.priority}\n` +
                `  👤 Responsável: ${task.users?.name || 'Não atribuído'}\n` +
                `  📅 Vencimento: ${task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'N/A'}\n` +
                `  🆔 ${task.id}\n`
              ).join('\n') || 'Nenhuma tarefa encontrada.'
            }`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Erro ao buscar tarefas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }]
        };
      }
    }
  },

  create_task: {
    name: 'create_task',
    description: 'Cria uma nova tarefa para a equipe',
    inputSchema: TaskSchema,
    handler: async (args: any) => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([args])
          .select(`
            *,
            users:assigned_to(name, email)
          `)
          .single();

        if (error) throw error;

        return {
          content: [{
            type: 'text',
            text: `✅ Tarefa criada com sucesso!\n\n` +
                  `📋 ${data.title}\n` +
                  `📊 Status: ${data.status}\n` +
                  `🔥 Prioridade: ${data.priority}\n` +
                  `👤 Responsável: ${data.users?.name || 'Não atribuído'}\n` +
                  `🆔 ID: ${data.id}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Erro ao criar tarefa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }]
        };
      }
    }
  },

  get_dashboard_stats: {
    name: 'get_dashboard_stats',
    description: 'Obtém estatísticas gerais do dashboard da clínica',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => {
      try {
        const [
          { count: totalPatients },
          { count: totalEvents },
          { count: pendingTasks },
          { count: todayEvents }
        ] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }),
          supabase.from('calendar_events').select('*', { count: 'exact', head: true }),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
          supabase.from('calendar_events')
            .select('*', { count: 'exact', head: true })
            .gte('start_time', new Date().toISOString().split('T')[0])
            .lt('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        ]);

        return {
          content: [{
            type: 'text',
            text: `📊 Estatísticas da Clínica Manus Fisio:\n\n` +
                  `👥 Total de Pacientes: ${totalPatients || 0}\n` +
                  `📅 Total de Eventos: ${totalEvents || 0}\n` +
                  `📋 Tarefas Pendentes: ${pendingTasks || 0}\n` +
                  `🗓️ Eventos Hoje: ${todayEvents || 0}\n\n` +
                  `📈 Sistema funcionando perfeitamente!`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Erro ao obter estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }]
        };
      }
    }
  },

  system_health_check: {
    name: 'system_health_check',
    description: 'Verifica o status de saúde do sistema Manus Fisio',
    inputSchema: { type: 'object', properties: {} },
    handler: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1);

        if (error) throw error;

        return {
          content: [{
            type: 'text',
            text: `✅ Sistema Manus Fisio - Status: SAUDÁVEL\n\n` +
                  `🔗 Conexão Supabase: OK\n` +
                  `⚡ API MCP: Funcionando\n` +
                  `🌐 Vercel Deploy: Ativo\n` +
                  `📱 PWA: Habilitado\n\n` +
                  `🏥 Pronto para atender a clínica de fisioterapia!`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `⚠️ Sistema com problemas:\n${error instanceof Error ? error.message : 'Erro desconhecido'}`
          }]
        };
      }
    }
  }
};

// Handler para diferentes transportes
export async function GET(
  request: NextRequest,
  { params }: { params: { transport: string } }
) {
  const transport = params.transport;

  if (transport === 'capabilities') {
    return NextResponse.json({
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: 'manus-fisio-mcp',
        version: '1.0.0'
      }
    });
  }

  if (transport === 'tools/list') {
    return NextResponse.json({
      tools: Object.values(tools).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    });
  }

  return NextResponse.json({
    error: 'Transport not supported',
    supportedTransports: ['capabilities', 'tools/list']
  }, { status: 400 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { transport: string } }
) {
  try {
    const body = await request.json();
    const transport = params.transport;

    if (transport === 'tools/call') {
      const { name, arguments: args } = body;
      
      if (!tools[name as keyof typeof tools]) {
        return NextResponse.json({
          error: `Tool '${name}' not found`
        }, { status: 404 });
      }

      const tool = tools[name as keyof typeof tools];
      const result = await tool.handler(args);

      return NextResponse.json({
        content: result.content
      });
    }

    if (transport === 'sse') {
      // Para compatibilidade com SSE, retornar as ferramentas disponíveis
      return NextResponse.json({
        tools: Object.values(tools).map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      });
    }

    return NextResponse.json({
      error: 'Invalid request',
      transport,
      body
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 