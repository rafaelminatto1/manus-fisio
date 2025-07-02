'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings,
  Brain,
  ArrowLeft,
  Target,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';

export default function AIAutomationPage() {
  const [activeTab, setActiveTab] = useState('ai-assistant');
  
  // Estados para IA
  const [aiProfile, setAiProfile] = useState({
    age: '',
    condition: '',
    severity: '',
    painLevel: '',
    lifestyle: ''
  });
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Estados para Automação
  const [automationRules, setAutomationRules] = useState([
    {
      id: 'reminder_exercises',
      name: 'Lembrete de Exercícios',
      description: 'Envia lembrete via WhatsApp para exercícios domiciliares',
      trigger: 'daily_09:00',
      isActive: true,
      executionCount: 45,
      icon: MessageCircle
    },
    {
      id: 'high_pain_alert',
      name: 'Alerta de Dor Elevada',
      description: 'Cria tarefa urgente quando dor > 7',
      trigger: 'pain_level_changed',
      isActive: true,
      executionCount: 12,
      icon: AlertCircle
    },
    {
      id: 'post_discharge_followup',
      name: 'Seguimento Pós-Alta',
      description: 'Agenda seguimento 1 semana após alta',
      trigger: 'treatment_completed',
      isActive: true,
      executionCount: 8,
      icon: Calendar
    },
    {
      id: 'weekly_report',
      name: 'Relatório Semanal',
      description: 'Gera relatório de progresso toda sexta',
      trigger: 'weekly_friday_18:00',
      isActive: false,
      executionCount: 4,
      icon: FileText
    }
  ]);

  const [automationStats] = useState({
    totalRules: 4,
    activeRules: 3,
    totalExecutions: 69,
    successfulExecutions: 65,
    successRate: 94,
    lastExecution: new Date()
  });

  // Funções da IA
  const generateAIRecommendation = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockRecommendation = {
      exercises: ['Alongamento Lombar', 'Ponte Glúteo', 'Cat-Cow'],
      videos: ['Lombar Básico', 'Core Fortalecimento'],
      frequency: 3,
      duration: 8,
      confidence: 87,
      reasoning: `Baseado no diagnóstico de ${aiProfile.condition} (severidade: ${aiProfile.severity}), recomendo 3x por semana durante 8 semanas. A idade foi considerada para uma progressão gradual.`
    };
    
    setAiRecommendation(mockRecommendation);
    setIsGenerating(false);
  };

  const isProfileComplete = () => {
    return Object.values(aiProfile).every(value => value !== '');
  };

  // Funções da Automação
  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
  };

  const executeRule = async (ruleId: string) => {
    const rule = automationRules.find(r => r.id === ruleId);
    if (!rule) return;

    // Simular execução
    setAutomationRules(prev => prev.map(r => 
      r.id === ruleId 
        ? { ...r, executionCount: r.executionCount + 1 }
        : r
    ));

    // Feedback visual
    console.log(`✅ Regra "${rule.name}" executada com sucesso!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bot className="h-8 w-8 text-blue-600" />
              🤖 IA & Automação
            </h1>
            <p className="text-gray-600 mt-1">
              Sistema inteligente para otimizar seu workflow clínico
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Assistente de IA
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automação
            </TabsTrigger>
          </TabsList>

          {/* IA Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-6">
            {!aiRecommendation ? (
              <div className="space-y-6">
                {/* Introdução IA */}
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Brain className="h-10 w-10 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-blue-900">
                          Assistente de IA para Fisioterapia
                        </CardTitle>
                        <p className="text-blue-700 mt-2">
                          Sistema inteligente que analisa o perfil do paciente e gera recomendações 
                          personalizadas baseadas em evidências clínicas.
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Formulário IA */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Perfil do Paciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Idade</label>
                        <input
                          type="number"
                          placeholder="Ex: 45"
                          className="w-full p-2 border rounded-lg"
                          value={aiProfile.age}
                          onChange={(e) => setAiProfile({...aiProfile, age: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Condição</label>
                        <select
                          className="w-full p-2 border rounded-lg"
                          value={aiProfile.condition}
                          onChange={(e) => setAiProfile({...aiProfile, condition: e.target.value})}
                        >
                          <option value="">Selecione</option>
                          <option value="lombalgia">Lombalgia</option>
                          <option value="cervicalgia">Cervicalgia</option>
                          <option value="ombro">Ombro</option>
                          <option value="joelho">Joelho</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Severidade</label>
                        <select
                          className="w-full p-2 border rounded-lg"
                          value={aiProfile.severity}
                          onChange={(e) => setAiProfile({...aiProfile, severity: e.target.value})}
                        >
                          <option value="">Selecione</option>
                          <option value="mild">Leve</option>
                          <option value="moderate">Moderada</option>
                          <option value="severe">Severa</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Dor (0-10)</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          placeholder="Ex: 6"
                          className="w-full p-2 border rounded-lg"
                          value={aiProfile.painLevel}
                          onChange={(e) => setAiProfile({...aiProfile, painLevel: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Estilo de Vida</label>
                      <select
                        className="w-full p-2 border rounded-lg"
                        value={aiProfile.lifestyle}
                        onChange={(e) => setAiProfile({...aiProfile, lifestyle: e.target.value})}
                      >
                        <option value="">Selecione</option>
                        <option value="sedentary">Sedentário</option>
                        <option value="active">Ativo</option>
                        <option value="very_active">Muito Ativo</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span>Status: {isProfileComplete() ? 'Completo' : 'Incompleto'}</span>
                      <Badge variant={isProfileComplete() ? 'default' : 'secondary'}>
                        {Object.values(aiProfile).filter(v => v).length}/5
                      </Badge>
                    </div>

                    <Button 
                      onClick={generateAIRecommendation}
                      disabled={!isProfileComplete() || isGenerating}
                      className="w-full"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processando IA...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          🚀 Gerar Recomendação
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Resultado da IA */
              <div className="space-y-6">
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Brain className="h-6 w-6 text-blue-600" />
                        <div>
                          <CardTitle className="text-blue-900">Recomendação de IA</CardTitle>
                          <p className="text-sm text-blue-700">
                            Confiança: {aiRecommendation.confidence}%
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => setAiRecommendation(null)}
                      >
                        Nova Consulta
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-purple-50">
                    <CardContent className="p-4 text-center">
                      <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        {aiRecommendation.frequency}x
                      </div>
                      <p className="text-sm text-purple-700">por semana</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {aiRecommendation.duration}
                      </div>
                      <p className="text-sm text-green-700">semanas</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50">
                    <CardContent className="p-4 text-center">
                      <Target className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">
                        {aiRecommendation.exercises.length}
                      </div>
                      <p className="text-sm text-orange-700">exercícios</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Exercícios Recomendados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {aiRecommendation.exercises.map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2 p-2 bg-orange-50 rounded">
                          <CheckCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">{ex}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Vídeos Educativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {aiRecommendation.videos.map((video, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2 p-2 bg-red-50 rounded">
                          <MessageCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm">{video}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-amber-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900">
                      <Lightbulb className="h-5 w-5" />
                      Justificativa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-800">{aiRecommendation.reasoning}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            {/* Stats de Automação */}
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
                        {automationStats.activeRules}/{automationStats.totalRules}
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
                        {automationStats.totalExecutions}
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
                        {automationStats.successRate}%
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
                      <p className="text-sm font-medium text-orange-600">30min atrás</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Regras de Automação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  Regras de Automação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {automationRules.map((rule) => {
                  const IconComponent = rule.icon;
                  return (
                    <div 
                      key={rule.id}
                      className={`p-4 rounded-lg border ${
                        rule.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            rule.isActive ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{rule.name}</h4>
                              <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                                {rule.isActive ? 'Ativa' : 'Inativa'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{rule.description}</p>
                            <p className="text-xs text-gray-500">
                              Execuções: {rule.executionCount}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => toggleAutomationRule(rule.id)}
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
                  );
                })}
              </CardContent>
            </Card>

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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 