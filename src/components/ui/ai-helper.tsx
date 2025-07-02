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
  Dumbbell
} from 'lucide-react';
import { AIEngine, PatientProfile, AIRecommendation } from '@/services/ai';

export function AIHelper() {
  const [profile, setProfile] = useState<Partial<PatientProfile>>({});
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!isComplete()) return;
    
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = AIEngine.generateRecommendation(profile as PatientProfile);
    setRecommendation(result);
    setIsGenerating(false);
  };

  const isComplete = () => {
    return profile.age && profile.condition && profile.severity && 
           profile.painLevel !== undefined && profile.lifestyle;
  };

  if (recommendation) {
    return (
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-blue-900">Recomendação de IA</CardTitle>
                <p className="text-sm text-blue-700">Confiança: {recommendation.confidence}%</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={recommendation.confidence} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-xl font-bold text-purple-600">
                    {recommendation.frequency}x
                  </div>
                  <p className="text-sm text-purple-700">por semana</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-xl font-bold text-green-600">
                    {recommendation.duration}
                  </div>
                  <p className="text-sm text-green-700">semanas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-orange-600" />
                Exercícios ({recommendation.exercises.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendation.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">
                      {ex.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-red-600" />
              Vídeos Recomendados ({recommendation.videos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendation.videos.map((video, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-red-50 rounded border border-red-100">
                  <Video className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">
                    {video.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              Justificativa da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 leading-relaxed">{recommendation.reasoning}</p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Aplicar Recomendação
          </Button>
          <Button variant="outline" onClick={() => setRecommendation(null)}>
            Nova Consulta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-blue-900">
                🤖 Assistente de IA para Fisioterapia
              </CardTitle>
              <p className="text-blue-700 mt-1">
                Recomendações personalizadas baseadas em evidências clínicas
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Perfil do Paciente
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Preencha os dados para gerar uma recomendação personalizada
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severidade</Label>
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

          <div className="space-y-2">
            <Label htmlFor="lifestyle">Estilo de Vida</Label>
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

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isComplete() ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Activity className="h-5 w-5 text-amber-600" />
              )}
              <span className="font-medium">
                {isComplete() ? 'Perfil Completo' : 'Perfil Incompleto'}
              </span>
            </div>
            <Badge variant={isComplete() ? 'default' : 'secondary'}>
              {Object.values(profile).filter(v => v !== undefined && v !== '').length}/5
            </Badge>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={!isComplete() || isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando IA...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                🚀 Gerar Recomendação de IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
