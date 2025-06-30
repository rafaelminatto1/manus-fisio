'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Calendar, Clock, Target, TrendingUp, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Exercise {
  id: string
  name: string
  description: string
  category: string
  video_url?: string
  difficulty_level: number
  duration?: number
}

interface ExercisePrescription {
  id: string
  patient_id: string
  exercise_id: string
  exercise: Exercise
  prescribed_by_user: { full_name: string; email: string }
  sets?: number
  repetitions?: number
  frequency_per_week?: number
  status: 'active' | 'completed' | 'suspended'
  start_date?: string
  end_date?: string
  created_at?: string
  updated_at?: string
}

interface ExerciseExecution {
  id: string
  prescription_id: string
  execution_date?: string
  pain_level?: number
  notes?: string
  prescription: {
    id: string
    exercise: { id: string; name: string; category: string }
  }
}

interface PatientPrescriptionsProps {
  patientId: string
  patientName: string
  canPrescribe?: boolean
  onAddPrescription?: () => void
}

// Dados simulados para demonstração
const mockPrescriptions: ExercisePrescription[] = [
  {
    id: '1',
    patient_id: '1',
    exercise_id: '1',
    exercise: {
      id: '1',
      name: 'Flexão de Braço Modificada',
      description: 'Exercício para fortalecimento do peitoral e tríceps',
      category: 'Fortalecimento',
      difficulty_level: 2,
      duration: 30
    },
    prescribed_by_user: { full_name: 'Dr. João Silva', email: 'joao@clinica.com' },
    sets: 3,
    repetitions: 10,
    frequency_per_week: 3,
    status: 'active',
    start_date: '2024-01-15',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    patient_id: '1',
    exercise_id: '2',
    exercise: {
      id: '2',
      name: 'Alongamento Cervical',
      description: 'Exercício de mobilidade para região cervical',
      category: 'Mobilidade',
      difficulty_level: 1,
      duration: 20
    },
    prescribed_by_user: { full_name: 'Dr. João Silva', email: 'joao@clinica.com' },
    sets: 2,
    repetitions: 15,
    frequency_per_week: 5,
    status: 'active',
    start_date: '2024-01-10',
    created_at: '2024-01-10T14:00:00Z'
  }
]

const mockExecutions: ExerciseExecution[] = [
  {
    id: '1',
    prescription_id: '1',
    execution_date: '2024-01-20T09:00:00Z',
    pain_level: 2,
    notes: 'Executado sem dificuldades',
    prescription: {
      id: '1',
      exercise: { id: '1', name: 'Flexão de Braço Modificada', category: 'Fortalecimento' }
    }
  },
  {
    id: '2',
    prescription_id: '2',
    execution_date: '2024-01-20T10:00:00Z',
    pain_level: 1,
    notes: 'Boa amplitude de movimento',
    prescription: {
      id: '2',
      exercise: { id: '2', name: 'Alongamento Cervical', category: 'Mobilidade' }
    }
  }
]

export function PatientPrescriptions({ 
  patientId, 
  patientName, 
  canPrescribe = false,
  onAddPrescription 
}: PatientPrescriptionsProps) {
  const [prescriptions] = useState<ExercisePrescription[]>(mockPrescriptions)
  const [executions] = useState<ExerciseExecution[]>(mockExecutions)
  const [activeTab, setActiveTab] = useState('active')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'completed': return 'Concluído'
      case 'suspended': return 'Suspenso'
      default: return 'Indefinido'
    }
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-yellow-100 text-yellow-800'
      case 3: return 'bg-orange-100 text-orange-800'
      case 4: return 'bg-red-100 text-red-800'
      case 5: return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Muito Fácil'
      case 2: return 'Fácil'
      case 3: return 'Moderado'
      case 4: return 'Difícil'
      case 5: return 'Muito Difícil'
      default: return 'Não definido'
    }
  }

  const getExecutionCount = (prescriptionId: string) => {
    return executions.filter(exec => exec.prescription_id === prescriptionId).length
  }

  const getAveragePainLevel = (prescriptionId: string) => {
    const prescriptionExecutions = executions.filter(exec => exec.prescription_id === prescriptionId)
    if (prescriptionExecutions.length === 0) return null
    
    const totalPain = prescriptionExecutions.reduce((sum, exec) => sum + (exec.pain_level || 0), 0)
    return (totalPain / prescriptionExecutions.length).toFixed(1)
  }

  const getAdherencePercentage = (prescription: ExercisePrescription) => {
    const startDate = new Date(prescription.start_date || prescription.created_at!)
    const endDate = prescription.end_date ? new Date(prescription.end_date) : new Date()
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const expectedExecutions = Math.ceil((daysDiff / 7) * (prescription.frequency_per_week || 3))
    const actualExecutions = getExecutionCount(prescription.id)
    
    return expectedExecutions > 0 ? Math.min(100, (actualExecutions / expectedExecutions) * 100) : 0
  }

  const activePrescriptions = prescriptions.filter(p => p.status === 'active')
  const completedPrescriptions = prescriptions.filter(p => p.status === 'completed')
  const suspendedPrescriptions = prescriptions.filter(p => p.status === 'suspended')

  const recentExecutions = executions
    .sort((a, b) => new Date(b.execution_date!).getTime() - new Date(a.execution_date!).getTime())
    .slice(0, 10)

  function PrescriptionCard({ 
    prescription, 
    executionCount, 
    averagePainLevel, 
    adherencePercentage 
  }: {
    prescription: ExercisePrescription
    executionCount: number
    averagePainLevel: string | null
    adherencePercentage: number
  }) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{prescription.exercise.name}</CardTitle>
              <CardDescription className="mt-1">
                {prescription.exercise.category} • Prescrito por {prescription.prescribed_by_user.full_name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(prescription.status)}>
                {getStatusLabel(prescription.status)}
              </Badge>
              <Badge className={getDifficultyColor(prescription.exercise.difficulty_level)}>
                {getDifficultyLabel(prescription.exercise.difficulty_level)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{prescription.exercise.description}</p>
            
            {/* Protocolo */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Séries:</span>
                <p className="text-gray-600">{prescription.sets || 'Não definido'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Repetições:</span>
                <p className="text-gray-600">{prescription.repetitions || 'Não definido'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Frequência:</span>
                <p className="text-gray-600">{prescription.frequency_per_week || 0}x/semana</p>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Execuções</span>
                </div>
                <p className="text-xl font-bold text-blue-600">{executionCount}</p>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Aderência</span>
                </div>
                <p className="text-xl font-bold text-green-600">{adherencePercentage.toFixed(0)}%</p>
              </div>
              
              {averagePainLevel && (
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Dor Média</span>
                  </div>
                  <p className="text-xl font-bold text-orange-600">{averagePainLevel}/10</p>
                </div>
              )}
            </div>

            {/* Progresso */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso da Aderência</span>
                <span className="text-sm text-gray-600">{adherencePercentage.toFixed(0)}%</span>
              </div>
              <Progress value={adherencePercentage} className="h-2" />
            </div>

            {/* Datas */}
            <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Iniciado: {prescription.start_date ? format(new Date(prescription.start_date), 'dd/MM/yyyy', { locale: ptBR }) : 'Não definido'}
              </div>
              {prescription.exercise.video_url && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open(prescription.exercise.video_url!, '_blank')}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Ver Vídeo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  function ExecutionCard({ execution }: { execution: ExerciseExecution }) {
    return (
      <Card className="hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{execution.prescription.exercise.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{execution.prescription.exercise.category}</p>
              {execution.notes && (
                <p className="text-sm text-gray-500 mt-2">{execution.notes}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {execution.execution_date ? format(new Date(execution.execution_date), 'dd/MM HH:mm', { locale: ptBR }) : 'Data não definida'}
              </div>
              {execution.pain_level !== null && execution.pain_level !== undefined && (
                <Badge variant="outline" className="mt-1">
                  Dor: {execution.pain_level}/10
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exercícios Prescritos</h2>
          <p className="text-gray-600">Paciente: {patientName}</p>
        </div>
        {canPrescribe && onAddPrescription && (
          <Button onClick={onAddPrescription} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Prescrever Exercício
          </Button>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prescrições Ativas</p>
                <p className="text-2xl font-bold text-green-600">{activePrescriptions.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Execuções (7 dias)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {executions.filter(e => 
                    new Date(e.execution_date!).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                  ).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aderência Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {activePrescriptions.length > 0 
                    ? Math.round(activePrescriptions.reduce((acc, p) => acc + getAdherencePercentage(p), 0) / activePrescriptions.length)
                    : 0}%
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dor Média</p>
                <p className="text-2xl font-bold text-orange-600">
                  {executions.length > 0 
                    ? (executions.reduce((acc, e) => acc + (e.pain_level || 0), 0) / executions.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Ativas ({activePrescriptions.length})</TabsTrigger>
          <TabsTrigger value="completed">Concluídas ({completedPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspensas ({suspendedPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="executions">Execuções Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhuma prescrição ativa</p>
                <p className="text-gray-400 text-sm mt-2">
                  {canPrescribe ? 'Clique em "Prescrever Exercício" para adicionar exercícios' : 'Aguarde prescrições do fisioterapeuta'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activePrescriptions.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  executionCount={getExecutionCount(prescription.id)}
                  averagePainLevel={getAveragePainLevel(prescription.id)}
                  adherencePercentage={getAdherencePercentage(prescription)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhuma prescrição concluída</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedPrescriptions.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  executionCount={getExecutionCount(prescription.id)}
                  averagePainLevel={getAveragePainLevel(prescription.id)}
                  adherencePercentage={getAdherencePercentage(prescription)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="suspended" className="space-y-4">
          {suspendedPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhuma prescrição suspensa</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {suspendedPrescriptions.map((prescription) => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  executionCount={getExecutionCount(prescription.id)}
                  averagePainLevel={getAveragePainLevel(prescription.id)}
                  adherencePercentage={getAdherencePercentage(prescription)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {recentExecutions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 text-lg">Nenhuma execução registrada</p>
                <p className="text-gray-400 text-sm mt-2">
                  As execuções de exercícios aparecerão aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentExecutions.map((execution) => (
                <ExecutionCard key={execution.id} execution={execution} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 