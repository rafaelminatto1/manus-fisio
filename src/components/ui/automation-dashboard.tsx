'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageCircle,
  Calendar,
  FileText,
  Activity,
  TrendingUp,
  Settings
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  isActive: boolean;
  executionCount: number;
}

interface AutomationStats {
  totalRules: number;
  activeRules: number;
  totalExecutions: number;
  successfulExecutions: number;
  successRate: number;
  lastExecution: Date | null;
}

export function AutomationDashboard() {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'reminder_exercises',
      name: 'Lembrete de Exercícios',
      description: 'Envia lembrete via WhatsApp para exercícios domiciliares',
      trigger: 'daily_09:00',
      isActive: true,
      executionCount: 45
    },
    {
      id: 'high_pain_alert',
      name: 'Alerta de Dor Elevada',
      description: 'Cria tarefa urgente quando dor > 7',
      trigger: 'pain_level_changed',
      isActive: true,
      executionCount: 12
    },
    {
      id: 'post_discharge_followup',
      name: 'Seguimento Pós-Alta',
      description: 'Agenda seguimento 1 semana após alta',
      trigger: 'treatment_completed',
      isActive: true,
      executionCount: 8
    },
    {
      id: 'weekly_report',
      name: 'Relatório Semanal',
      description: 'Gera relatório de progresso toda sexta',
      trigger: 'weekly_friday_18:00',
      isActive: false,
      executionCount: 4
    }
  ]);

  const [stats, setStats] = useState<AutomationStats>({
    totalRules: 4,
    activeRules: 3,
    totalExecutions: 69,
    successfulExecutions: 65,
    successRate: 94,
    lastExecution: new Date()
  });

  const [recentExecutions, setRecentExecutions] = useState([
    {
      id: '1',
      ruleName: 'Lembrete de Exercícios',
      status: 'success',
      executedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
      result: 'WhatsApp enviado para 12 pacientes'
    },
    {
      id: '2',
      ruleName: 'Alerta de Dor Elevada',
      status: 'success',
      executedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
      result: 'Tarefa criada para Maria Silva (dor 8/10)'
    },
    {
      id: '3',
      ruleName: 'Seguimento Pós-Alta',
      status: 'success',
      executedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h atrás
      result: 'Seguimento agendado para João Santos'
    }
  ]);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
    
    // Atualizar stats
    const updatedRules = rules.map(rule => 
      rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
    );
    const activeCount = updatedRules.filter(r => r.isActive).length;
    setStats(prev => ({ ...prev, activeRules: activeCount }));
  };

  const executeRule = async (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    // Simular execução
    const newExecution = {
      id: Date.now().toString(),
      ruleName: rule.name,
      status: 'success' as const,
      executedAt: new Date(),
      result: `Execução manual de "${rule.name}" realizada com sucesso`
    };

    setRecentExecutions(prev => [newExecution, ...prev.slice(0, 4)]);
    
    // Atualizar contadores
    setRules(prev => prev.map(r => 
      r.id === ruleId 
        ? { ...r, executionCount: r.executionCount + 1 }
        : r
    ));

    setStats(prev => ({
      ...prev,
      totalExecutions: prev.totalExecutions + 1,
      successfulExecutions: prev.successfulExecutions + 1,
      lastExecution: new Date()
    }));
  };

  const getRuleIcon = (ruleId: string) => {
    switch (ruleId) {
      case 'reminder_exercises':
        return <MessageCircle className="h-4 w-4" />;
      case 'high_pain_alert':
        return <AlertCircle className="h-4 w-4" />;
      case 'post_discharge_followup':
        return <Calendar className="h-4 w-4" />;
      case 'weekly_report':
        return <FileText className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      'daily_09:00': 'Diário às 09:00',
      'pain_level_changed': 'Mudança na dor',
      'treatment_completed': 'Tratamento concluído',
      'weekly_friday_18:00': 'Sexta às 18:00'
    };
    return labels[trigger] || trigger;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            🤖 Sistema de Automação
          </h2>
          <p className="text-gray-600 mt-1">
            Gerencie automações para otimizar seu workflow clínico
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Regras Ativas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.activeRules}/{stats.totalRules}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Execuções</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalExecutions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.successRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Última Execução</p>
                <p className="text-sm font-medium text-orange-600">
                  {stats.lastExecution ? formatTimeAgo(stats.lastExecution) : 'Nunca'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regras de Automação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              Regras de Automação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className={`p-4 rounded-lg border ${
                  rule.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      rule.isActive ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {getRuleIcon(rule.id)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'} className="text-xs">
                          {rule.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Trigger: {getTriggerLabel(rule.trigger)}</span>
                        <span>Execuções: {rule.executionCount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => executeRule(rule.id)}
                      disabled={!rule.isActive}
                    >
                      Executar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Execuções Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Execuções Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentExecutions.map((execution) => (
              <div 
                key={execution.id}
                className="p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded ${
                      execution.status === 'success' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {execution.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {execution.ruleName}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        {execution.result}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(execution.executedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {recentExecutions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma execução recente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 flex-col gap-2"
              onClick={() => executeRule('reminder_exercises')}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Enviar Lembretes</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => executeRule('weekly_report')}
            >
              <FileText className="h-5 w-5" />
              <span>Gerar Relatório</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
            >
              <Settings className="h-5 w-5" />
              <span>Nova Automação</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 