'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  TrendingUp,
  Activity,
  RefreshCw,
  BarChart3,
  Heart,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/cn'

interface PatientAIInsightsProps {
  patientId: string
}

export function PatientAIInsights({ patientId }: PatientAIInsightsProps) {
  const [activeTab, setActiveTab] = useState('recommendations')
  const [isLoading, setIsLoading] = useState(false)

  const mockRecommendations = [
    {
      id: 'ex1',
      name: 'Fortalecimento de Quadríceps',
      description: 'Exercício isométrico para fortalecimento do músculo quadríceps',
      sets: 3,
      repetitions: 15,
      duration: 30,
      confidence: 95,
      reasoning: 'Altamente recomendado para lombalgia devido ao fortalecimento do core'
    }
  ]

  const mockInsights = [
    {
      id: 'timeline_1',
      title: 'Previsão de Recuperação',
      description: 'Baseado na evolução atual, estimamos 4-6 semanas para recuperação completa',
      confidence: 87,
      current: 70,
      predicted: 90,
      improvement: 20
    }
  ]

  const loadAIInsights = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Insights atualizados com sucesso!')
    } catch (error) {
      toast.error('Erro ao carregar insights')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Insights com IA</h2>
            <p className="text-sm text-muted-foreground">
              Análise inteligente e recomendações personalizadas
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={loadAIInsights}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">
            <Sparkles className="h-4 w-4 mr-2" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="insights">
            <BarChart3 className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Activity className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {mockRecommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      {recommendation.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{recommendation.sets}</div>
                        <div className="text-xs text-muted-foreground">Séries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{recommendation.repetitions}</div>
                        <div className="text-xs text-muted-foreground">Repetições</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{recommendation.duration}s</div>
                        <div className="text-xs text-muted-foreground">Duração</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Justificativa da IA
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {recommendation.reasoning}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {recommendation.confidence}% confiança
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {mockInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {insight.current}%
                        </div>
                        <div className="text-xs text-muted-foreground">Atual</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {insight.predicted}%
                        </div>
                        <div className="text-xs text-muted-foreground">Previsto</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          +{insight.improvement}%
                        </div>
                        <div className="text-xs text-muted-foreground">Melhora</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Confiança da previsão</span>
                        <span>{insight.confidence}%</span>
                      </div>
                      <Progress value={insight.confidence} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Evolução Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">85%</div>
                    <div className="text-sm text-muted-foreground">Progresso Geral</div>
                  </div>
                  <Progress value={85} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Satisfação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">92%</div>
                    <div className="text-sm text-muted-foreground">Satisfação com Tratamento</div>
                  </div>
                  <Progress value={92} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
