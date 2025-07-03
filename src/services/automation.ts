// 🤖 Sistema de Automação para Fisioterapia
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  isActive: boolean;
  executionCount: number;
}

export interface AutomationExecution {
  ruleId: string;
  triggeredAt: Date;
  status: 'success' | 'failed';
  result?: any;
}

export class AutomationEngine {
  private static rules: AutomationRule[] = [
    {
      id: 'reminder_exercises',
      name: 'Lembrete de Exercícios',
      description: 'Envia lembrete via WhatsApp para exercícios domiciliares',
      trigger: 'daily_09:00',
      isActive: true,
      executionCount: 0
    },
    {
      id: 'high_pain_alert',
      name: 'Alerta de Dor Elevada',
      description: 'Cria tarefa urgente quando dor > 7',
      trigger: 'pain_level_changed',
      isActive: true,
      executionCount: 0
    },
    {
      id: 'post_discharge_followup',
      name: 'Seguimento Pós-Alta',
      description: 'Agenda seguimento 1 semana após alta',
      trigger: 'treatment_completed',
      isActive: true,
      executionCount: 0
    },
    {
      id: 'weekly_report',
      name: 'Relatório Semanal',
      description: 'Gera relatório de progresso toda sexta',
      trigger: 'weekly_friday_18:00',
      isActive: true,
      executionCount: 0
    }
  ];

  private static executions: AutomationExecution[] = [];

  static async executeRule(ruleId: string, context?: any): Promise<AutomationExecution> {
    const rule = this.rules.find(r => r.id === ruleId);
    
    if (!rule || !rule.isActive) {
      throw new Error(`Regra ${ruleId} não encontrada ou inativa`);
    }

    const execution: AutomationExecution = {
      ruleId,
      triggeredAt: new Date(),
      status: 'success'
    };

    try {
      let result;

      switch (ruleId) {
        case 'reminder_exercises':
          result = await this.sendExerciseReminder(context);
          break;
        case 'high_pain_alert':
          result = await this.createHighPainAlert(context);
          break;
        case 'post_discharge_followup':
          result = await this.scheduleFollowup(context);
          break;
        case 'weekly_report':
          result = await this.generateWeeklyReport(context);
          break;
        default:
          result = { message: 'Regra executada com sucesso' };
      }

      execution.result = result;
      rule.executionCount++;

    } catch (error) {
      execution.status = 'failed';
      execution.result = { error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }

    this.executions.push(execution);
    return execution;
  }

  private static async sendExerciseReminder(context: any) {
    console.log('📱 Enviando lembrete de exercícios via WhatsApp');
    return {
      action: 'whatsapp_sent',
      message: '🏃‍♂️ Lembre-se de fazer seus exercícios domiciliares hoje!',
      sentTo: context?.patientPhone || 'paciente',
      sentAt: new Date()
    };
  }

  private static async createHighPainAlert(context: any) {
    console.log('⚠️ Criando alerta para dor elevada');
    return {
      action: 'task_created',
      taskId: `alert_${Date.now()}`,
      title: `Avaliar paciente ${context?.patientName} - Dor elevada (${context?.painLevel}/10)`,
      priority: 'urgent',
      createdAt: new Date()
    };
  }

  private static async scheduleFollowup(context: any) {
    console.log('📅 Agendando seguimento pós-alta');
    const followupDate = new Date();
    followupDate.setDate(followupDate.getDate() + 7);
    
    return {
      action: 'followup_scheduled',
      patientId: context?.patientId,
      scheduledDate: followupDate,
      type: 'phone_call',
      createdAt: new Date()
    };
  }

  private static async generateWeeklyReport(context: any) {
    console.log('📊 Gerando relatório semanal');
    return {
      action: 'report_generated',
      reportId: `weekly_${Date.now()}`,
      type: 'progress_summary',
      generatedAt: new Date(),
      recipients: ['fisioterapeuta', 'supervisor']
    };
  }

  static getActiveRules(): AutomationRule[] {
    return this.rules.filter(rule => rule.isActive);
  }

  static getExecutionHistory(ruleId?: string): AutomationExecution[] {
    if (ruleId) {
      return this.executions.filter(exec => exec.ruleId === ruleId);
    }
    return this.executions.slice(-20); // Últimas 20 execuções
  }

  static toggleRule(ruleId: string, isActive: boolean): boolean {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.isActive = isActive;
      return true;
    }
    return false;
  }

  static async processTrigger(triggerType: string, data: any): Promise<AutomationExecution[]> {
    const matchingRules = this.rules.filter(rule => 
      rule.isActive && rule.trigger === triggerType
    );

    const executions = [];
    for (const rule of matchingRules) {
      try {
        const execution = await this.executeRule(rule.id, data);
        executions.push(execution);
      } catch (error) {
        console.error(`Erro ao executar regra ${rule.id}:`, error);
      }
    }

    return executions;
  }

  static getStats() {
    const totalRules = this.rules.length;
    const activeRules = this.rules.filter(r => r.isActive).length;
    const totalExecutions = this.executions.length;
    const successfulExecutions = this.executions.filter(e => e.status === 'success').length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    return {
      totalRules,
      activeRules,
      totalExecutions,
      successfulExecutions,
      successRate: Math.round(successRate),
      lastExecution: this.executions.length > 0 ? 
        this.executions[this.executions.length - 1]?.triggeredAt : null
    };
  }
}
