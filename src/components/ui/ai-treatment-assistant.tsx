'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Clock, 
  Activity, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Video,
  Dumbbell
} from 'lucide-react';
import { AIEngine, PatientProfile, AIRecommendation } from '@/services/ai';

interface AITreatmentAssistantProps {
  patientId?: string;
  onRecommendationGenerated?: (recommendation: AIRecommendation) => void;
  className?: string;
}

export function AITreatmentAssistant({ 
  patientId, 
  onRecommendationGenerated,
  className = "" 
}: AITreatmentAssistantProps) {
  const [profile, setProfile] = useState<Partial<PatientProfile>>({
    age: undefined,
    condition: '',
    severity: undefined,
    painLevel: undefined,
    lifestyle: undefined
  });
  
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'profile' | 'recommendation'>('profile');

  const handleGenerateRecommendation = async () => {
    if (!isProfileComplete()) return;
    
    setIsGenerating(true);
    
    // Simular processamento de IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const aiRecommendation = AIEngine.generateRecommendation(profile as PatientProfile);
      setRecommendation(aiRecommendation);
      setStep('recommendation');
      onRecommendationGenerated?.(aiRecommendation);
    } catch (error) {
      console.error('Erro ao gerar recomendação:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isProfileComplete = () => {
    return profile.age && 
           profile.condition && 
           profile.severity && 
           profile.painLevel !== undefined && 
           profile.lifestyle;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Alta Confiança';
    if (confidence >= 60) return 'Confiança Moderada';
    return 'Baixa Confiança';
  };

  if (step === 'recommendation' && recommendation) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header da Recomendação */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-900">Recomendação de IA Gerada</CardTitle>
                <p className="text-sm text-blue-700 mt-1">
                  Baseada em evidências clínicas e perfil do paciente
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getConfidenceColor(recommendation.confidence)}>
                  {getConfidenceLabel(recommendation.confidence)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {recommendation.confidence}% confiança
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStep('profile')}
              >
                Ajustar Perfil
              </Button>
            </div>
            <Progress 
              value={recommendation.confidence} 
              className="mt-3"
            />
          </CardContent>
        </Card>

        {/* Plano de Tratamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frequência e Duração */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-purple-600" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">Frequência</p>
                  <p className="text-sm text-purple-700">Sessões por semana</p>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {recommendation.frequency}x
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Duração</p>
                  <p className="text-sm text-green-700">Tempo estimado</p>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {recommendation.duration} sem
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercícios Recomendados */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dumbbell className="h-5 w-5 text-orange-600" />
                Exercícios ({recommendation.exercises.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendation.exercises.map((exercise, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">
                      {exercise.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vídeos Recomendados */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-red-600" />
              Vídeos Educativos ({recommendation.videos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendation.videos.map((video, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100"
                >
                  <div className="p-2 bg-red-100 rounded">
                    <Video className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-red-900 text-sm">
                      {video.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-red-700">Vídeo educativo</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Justificativa da IA */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-900">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              Justificativa da Recomendação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 leading-relaxed">
              {recommendation.reasoning}
            </p>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3">
          <Button className="flex-1" size="lg">
            <CheckCircle className="h-4 w-4 mr-2" />
            Aplicar Recomendação
          </Button>
          <Button variant="outline" size="lg">
            <Target className="h-4 w-4 mr-2" />
            Personalizar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-blue-900">
                Assistente de IA para Tratamento
              </CardTitle>
              <p className="text-blue-700 mt-1">
                Gere recomendações personalizadas baseadas em evidências clínicas
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
          <p className="text-sm text-gray-600">
            Preencha as informações para gerar uma recomendação personalizada
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
              <Label htmlFor="condition">Condição/Diagnóstico</Label>
              <Select 
                value={profile.condition} 
                onValueChange={(value) => setProfile({...profile, condition: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a condição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lombalgia">Lombalgia</SelectItem>
                  <SelectItem value="cervicalgia">Cervicalgia</SelectItem>
                  <SelectItem value="ombro">Síndrome do Ombro</SelectItem>
                  <SelectItem value="joelho">Lesão no Joelho</SelectItem>
                  <SelectItem value="outras">Outras Condições</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Severidade e Dor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severidade</Label>
              <Select 
                value={profile.severity} 
                onValueChange={(value: any) => setProfile({...profile, severity: value})}
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
              <Label htmlFor="pain">Nível de Dor (0-10)</Label>
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
            <Label htmlFor="lifestyle">Estilo de Vida</Label>
            <Select 
              value={profile.lifestyle} 
              onValueChange={(value: any) => setProfile({...profile, lifestyle: value})}
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

          <Separator />

          {/* Status do Perfil */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isProfileComplete() ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              )}
              <span className="font-medium">
                {isProfileComplete() ? 'Perfil Completo' : 'Perfil Incompleto'}
              </span>
            </div>
            <Badge variant={isProfileComplete() ? 'default' : 'secondary'}>
              {Object.values(profile).filter(v => v !== undefined && v !== '').length}/5
            </Badge>
          </div>

          {/* Botão de Gerar */}
          <Button 
            onClick={handleGenerateRecommendation}
            disabled={!isProfileComplete() || isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Gerando Recomendação...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Gerar Recomendação de IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 