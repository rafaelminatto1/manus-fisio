'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Clock, 
  Activity, 
  Lightbulb,
  CheckCircle,
  Video,
  Dumbbell,
  ArrowLeft,
  Target,
  TrendingUp
} from 'lucide-react';
import { AIEngine, PatientProfile, AIRecommendation } from '@/services/ai';
import Link from 'next/link';

export default function AITestPage() {
  const [profile, setProfile] = useState<Partial<PatientProfile>>({});
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!isComplete()) return;
    
    setIsGenerating(true);
    
    // Simular processamento de IA
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    try {
      const result = AIEngine.generateRecommendation(profile as PatientProfile);
      setRecommendation(result);
    } catch (error) {
      console.error('Erro ao gerar recomendação:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isComplete = () => {
    return profile.age && profile.condition && profile.severity && 
           profile.painLevel !== undefined && profile.lifestyle;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Alta Confiança';
    if (confidence >= 60) return 'Confiança Moderada';
    return 'Baixa Confiança - Avaliação Presencial Recomendada';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard-pro">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🤖 Teste do Sistema de IA
            </h1>
            <p className="text-gray-600 mt-1">
              Sistema inteligente de recomendações para fisioterapia
            </p>
          </div>
        </div>

        {recommendation ? (
          <div className="space-y-6">
            {/* Status da Recomendação */}
            <Card className={order-2 }>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Brain className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-blue-900">
                        Recomendação de IA Gerada
                      </CardTitle>
                      <p className="text-blue-700 mt-1">
                        {getConfidenceLabel(recommendation.confidence)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setRecommendation(null)}
                  >
                    Nova Consulta
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress 
                      value={recommendation.confidence} 
                      className="h-3"
                    />
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {recommendation.confidence}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Resumo do Tratamento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Clock className="h-5 w-5" />
                    Frequência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {recommendation.frequency}x
                    </div>
                    <p className="text-purple-700 text-sm">por semana</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <TrendingUp className="h-5 w-5" />
                    Duração
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {recommendation.duration}
                    </div>
                    <p className="text-green-700 text-sm">semanas</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <Target className="h-5 w-5" />
                    Exercícios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {recommendation.exercises.length}
                    </div>
                    <p className="text-orange-700 text-sm">recomendados</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes dos Exercícios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-orange-600" />
                    Exercícios Recomendados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendation.exercises.map((exercise, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100"
                      >
                        <div className="p-1 bg-orange-100 rounded">
                          <CheckCircle className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-orange-900">
                            {exercise.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-orange-700">Exercício terapêutico</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-red-600" />
                    Vídeos Educativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendation.videos.map((video, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100"
                      >
                        <div className="p-1 bg-red-100 rounded">
                          <Video className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-red-900">
                            {video.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="text-xs text-red-700">Material educativo</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Justificativa da IA */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  Justificativa Clínica da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-amber-200">
                  <p className="text-amber-800 leading-relaxed">
                    {recommendation.reasoning}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Aplicar ao Paciente
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <Target className="h-4 w-4 mr-2" />
                Personalizar Protocolo
              </Button>
              <Button variant="outline" size="lg" className="flex-1">
                <Video className="h-4 w-4 mr-2" />
                Ver Vídeos
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Introdução */}
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
                      personalizadas baseadas em evidências clínicas e protocolos estabelecidos.
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Formulário de Perfil */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Perfil do Paciente
                </CardTitle>
                <p className="text-gray-600 mt-1">
                  Preencha as informações do paciente para gerar uma recomendação personalizada
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dados Básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade do Paciente</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Ex: 45"
                      value={profile.age || ''}
                      onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || undefined})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condição/Diagnóstico Principal</Label>
                    <Select 
                      value={profile.condition} 
                      onValueChange={(v) => setProfile({...profile, condition: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a condição" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lombalgia">Lombalgia</SelectItem>
                        <SelectItem value="cervicalgia">Cervicalgia</SelectItem>
                        <SelectItem value="ombro">Síndrome do Ombro</SelectItem>
                        <SelectItem value="joelho">Lesão no Joelho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Severidade e Dor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severidade da Condição</Label>
                    <Select 
                      value={profile.severity} 
                      onValueChange={(v: any) => setProfile({...profile, severity: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a severidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mild">Leve</SelectItem>
                        <SelectItem value="moderate">Moderada</SelectItem>
                        <SelectItem value="severe">Severa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pain">Nível de Dor Atual (0-10)</Label>
                    <Input
                      id="pain"
                      type="number"
                      min="0"
                      max="10"
                      placeholder="Ex: 6"
                      value={profile.painLevel || ''}
                      onChange={(e) => setProfile({...profile, painLevel: parseInt(e.target.value) || undefined})}
                    />
                  </div>
                </div>

                {/* Estilo de Vida */}
                <div className="space-y-2">
                  <Label htmlFor="lifestyle">Estilo de Vida do Paciente</Label>
                  <Select 
                    value={profile.lifestyle} 
                    onValueChange={(v: any) => setProfile({...profile, lifestyle: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estilo de vida" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentário</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="very_active">Muito Ativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status do Perfil */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isComplete() ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Activity className="h-6 w-6 text-amber-600" />
                      )}
                      <div>
                        <p className="font-medium">
                          {isComplete() ? 'Perfil Completo' : 'Perfil Incompleto'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {isComplete() 
                            ? 'Todos os dados necessários foram preenchidos' 
                            : 'Preencha todos os campos para continuar'
                          }
                        </p>
                      </div>
                    </div>
                    <Badge variant={isComplete() ? 'default' : 'secondary'} className="text-lg px-3 py-1">
                      {Object.values(profile).filter(v => v !== undefined && v !== '').length}/5
                    </Badge>
                  </div>
                </div>

                {/* Botão de Gerar */}
                <Button 
                  onClick={handleGenerate}
                  disabled={!isComplete() || isGenerating}
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processando com IA...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-3" />
                      🚀 Gerar Recomendação de IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Informações do Sistema */}
            <Card className="border-gray-200 bg-gray-50">
              <CardHeader>
                <CardTitle className="text-gray-800">ℹ️ Como Funciona</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-blue-100 rounded">
                      <Brain className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Análise Inteligente</p>
                      <p className="text-gray-600">Sistema analisa o perfil e condição do paciente</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-green-100 rounded">
                      <Target className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Protocolo Personalizado</p>
                      <p className="text-gray-600">Gera recomendações baseadas em evidências</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="p-1 bg-purple-100 rounded">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Aplicação Clínica</p>
                      <p className="text-gray-600">Protocolo pronto para aplicar no tratamento</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
