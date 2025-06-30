'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  Activity,
  Target,
  Clock,
  Heart
} from 'lucide-react'

interface PatientStats {
  totalPatients: number
  activePatients: number
  completedTreatments: number
  averageSessionsPerPatient: number
  mostCommonConditions: Array<{
    condition: string
    count: number
    percentage: number
  }>
  treatmentEffectiveness: Array<{
    condition: string
    successRate: number
    averageSessions: number
  }>
  weeklyStats: Array<{
    week: string
    sessions: number
    newPatients: number
  }>
}

const mockData: PatientStats = {
  totalPatients: 156,
  activePatients: 89,
  completedTreatments: 67,
  averageSessionsPerPatient: 12.5,
  mostCommonConditions: [
    { condition: 'Lombalgia', count: 45, percentage: 28.8 },
    { condition: 'Cervicalgia', count: 32, percentage: 20.5 },
    { condition: 'Gonartrose', count: 28, percentage: 17.9 },
    { condition: 'Tendinite Ombro', count: 24, percentage: 15.4 },
    { condition: 'Outros', count: 27, percentage: 17.3 }
  ],
  treatmentEffectiveness: [
    { condition: 'Lombalgia', successRate: 87, averageSessions: 14 },
    { condition: 'Cervicalgia', successRate: 92, averageSessions: 10 },
    { condition: 'Gonartrose', successRate: 76, averageSessions: 18 },
    { condition: 'Tendinite Ombro', successRate: 84, averageSessions: 12 }
  ],
  weeklyStats: [
    { week: 'Sem 1', sessions: 67, newPatients: 8 },
    { week: 'Sem 2', sessions: 73, newPatients: 5 },
    { week: 'Sem 3', sessions: 69, newPatients: 7 },
    { week: 'Sem 4', sessions: 81, newPatients: 12 }
  ]
}

export function PhysioAnalytics() {
  const completionRate = (mockData.completedTreatments / mockData.totalPatients) * 100
  const activeRate = (mockData.activePatients / mockData.totalPatients) * 100

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-2xl font-bold">{mockData.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12% </span>
              <span className="text-gray-500">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
                <p className="text-2xl font-bold">{mockData.activePatients}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2">
              <Progress value={activeRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{activeRate.toFixed(1)}% do total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Altas Concluídas</p>
                <p className="text-2xl font-bold">{mockData.completedTreatments}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{completionRate.toFixed(1)}% taxa de conclusão</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Média Sessões/Paciente</p>
                <p className="text-2xl font-bold">{mockData.averageSessionsPerPatient}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500">-2.1 </span>
              <span className="text-gray-500">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Condições Mais Comuns */}
      <Card>
        <CardHeader>
          <CardTitle>Condições Mais Tratadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.mostCommonConditions.map((condition, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{condition.condition}</p>
                    <p className="text-sm text-gray-500">{condition.count} pacientes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{condition.percentage}%</p>
                  <Progress value={condition.percentage} className="w-20 h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Efetividade do Tratamento */}
      <Card>
        <CardHeader>
          <CardTitle>Efetividade dos Tratamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.treatmentEffectiveness.map((treatment, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{treatment.condition}</h4>
                    <p className="text-sm text-gray-500">
                      Média de {treatment.averageSessions} sessões
                    </p>
                  </div>
                  <Badge 
                    variant={treatment.successRate >= 85 ? 'default' : 'secondary'}
                    className={treatment.successRate >= 85 ? 'bg-green-500' : ''}
                  >
                    {treatment.successRate}% sucesso
                  </Badge>
                </div>
                <Progress value={treatment.successRate} className="h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Semanais */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.weeklyStats.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{week.week}</p>
                  <p className="text-sm text-gray-500">
                    {week.sessions} sessões • {week.newPatients} novos pacientes
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <Calendar className="h-4 w-4 text-blue-500 mx-auto" />
                    <p className="text-xs mt-1">{week.sessions}</p>
                  </div>
                  <div className="text-center">
                    <Heart className="h-4 w-4 text-red-500 mx-auto" />
                    <p className="text-xs mt-1">+{week.newPatients}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 