'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Calendar, Clock, Target, TrendingUp, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Tables } from '@/types/database.types'

type ExercisePrescription = Tables<'exercise_prescriptions'> & {
  exercise: Tables<'exercises'>
  prescribed_by_user: { full_name: string; email: string }
}

type ExerciseExecution = Tables<'exercise_executions'> & {
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

export function PatientPrescriptions({ 
  patientId, 
  patientName, 
  canPrescribe = false,
  onAddPrescription 
}: PatientPrescriptionsProps) {
  const [prescriptions, setPrescriptions] = useState<ExercisePrescription[]>([])
  const [executions, setExecutions] = useState<ExerciseExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    fetchPrescriptions()
    fetchExecutions()
  }, [patientId])

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch(`/api/exercise-prescriptions?patient_id=${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    }
  }

  const fetchExecutions = async () => {
    try {
      const response = await fetch(`/api/exercise-executions?patient_id=${patientId}&limit=50`)
      if (response.ok) {
        const data = await response.json()
        setExecutions(data)
      }
    } catch (error) {
      console.error('Error fetching executions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'completed': return 'Concluído'
      case 'suspended': return 'Suspenso'
      default: return 'Indefinido'
    }
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy': return 'Fácil'
      case 'medium': return 'Médio'
      case 'hard': return 'Difícil'
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
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
                <p className="text-sm text-gray-600">Dor Média</p>
                <p className="text-2xl font-bold text-orange-600">
                  {executions.length > 0 
                    ? (executions.reduce((sum, e) => sum + (e.pain_level || 0), 0) / executions.length).toFixed(1)
                    : '0'
                  }/10
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Adesão Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {activePrescriptions.length > 0
                    ? Math.round(activePrescriptions.reduce((sum, p) => sum + getAdherencePercentage(p), 0) / activePrescriptions.length)
                    : 0
                  }%
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Ativas ({activePrescriptions.length})</TabsTrigger>
          <TabsTrigger value="completed">Concluídas ({completedPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspensas ({suspendedPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="executions">Execuções Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Nenhuma prescrição ativa</p>
              </CardContent>
            </Card>
          ) : (
            activePrescriptions.map((prescription) => (
              <PrescriptionCard 
                key={prescription.id} 
                prescription={prescription}
                executionCount={getExecutionCount(prescription.id)}
                averagePainLevel={getAveragePainLevel(prescription.id)}
                adherencePercentage={getAdherencePercentage(prescription)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Nenhuma prescrição concluída</p>
              </CardContent>
            </Card>
          ) : (
            completedPrescriptions.map((prescription) => (
              <PrescriptionCard 
                key={prescription.id} 
                prescription={prescription}
                executionCount={getExecutionCount(prescription.id)}
                averagePainLevel={getAveragePainLevel(prescription.id)}
                adherencePercentage={getAdherencePercentage(prescription)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="suspended" className="space-y-4">
          {suspendedPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Nenhuma prescrição suspensa</p>
              </CardContent>
            </Card>
          ) : (
            suspendedPrescriptions.map((prescription) => (
              <PrescriptionCard 
                key={prescription.id} 
                prescription={prescription}
                executionCount={getExecutionCount(prescription.id)}
                averagePainLevel={getAveragePainLevel(prescription.id)}
                adherencePercentage={getAdherencePercentage(prescription)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          {recentExecutions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Nenhuma execução registrada</p>
              </CardContent>
            </Card>
          ) : (
            recentExecutions.map((execution) => (
              <ExecutionCard key={execution.id} execution={execution} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )

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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3">
                {prescription.exercise.name}
                {prescription.exercise.video_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(prescription.exercise.video_url!, '_blank')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
              <CardDescription>
                Prescrito por {prescription.prescribed_by_user.full_name} em{' '}
                {format(new Date(prescription.prescription_date!), "dd/MM/yyyy", { locale: ptBR })}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(prescription.status)}>
              {getStatusLabel(prescription.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{prescription.exercise.category}</Badge>
              <Badge className={getDifficultyColor(prescription.exercise.difficulty)}>
                {getDifficultyLabel(prescription.exercise.difficulty)}
              </Badge>
              <Badge variant="outline">
                {prescription.frequency_per_week}x por semana
              </Badge>
            </div>

            {/* Parâmetros */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {prescription.prescribed_sets && (
                <div>
                  <span className="text-gray-600">Séries:</span>
                  <span className="ml-1 font-medium">{prescription.prescribed_sets}</span>
                </div>
              )}
              {prescription.prescribed_repetitions && (
                <div>
                  <span className="text-gray-600">Repetições:</span>
                  <span className="ml-1 font-medium">{prescription.prescribed_repetitions}</span>
                </div>
              )}
              {prescription.prescribed_duration_minutes && (
                <div>
                  <span className="text-gray-600">Duração:</span>
                  <span className="ml-1 font-medium">{prescription.prescribed_duration_minutes}min</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Execuções:</span>
                <span className="ml-1 font-medium">{executionCount}</span>
              </div>
            </div>

            {/* Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Adesão ao tratamento</span>
                <span>{Math.round(adherencePercentage)}%</span>
              </div>
              <Progress value={adherencePercentage} className="h-2" />
            </div>

            {/* Métricas */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Dor média: {averagePainLevel ? `${averagePainLevel}/10` : 'N/A'}
              </span>
              {prescription.end_date && (
                <span>
                  Fim previsto: {format(new Date(prescription.end_date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              )}
            </div>

            {/* Observações */}
            {prescription.observations && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">Observações:</span>
                <p className="text-gray-600 mt-1">{prescription.observations}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  function ExecutionCard({ execution }: { execution: ExerciseExecution }) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium">{execution.prescription.exercise.name}</h4>
              <p className="text-sm text-gray-600">
                {format(new Date(execution.execution_date!), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div className="text-right text-sm">
              {execution.pain_level !== null && (
                <div className="text-gray-600">
                  Dor: <span className="font-medium">{execution.pain_level}/10</span>
                </div>
              )}
              {execution.difficulty_level !== null && (
                <div className="text-gray-600">
                  Dificuldade: <span className="font-medium">{execution.difficulty_level}/5</span>
                </div>
              )}
            </div>
          </div>
          
          {execution.patient_feedback && (
            <div className="mt-3 text-sm">
              <span className="font-medium text-gray-700">Feedback:</span>
              <p className="text-gray-600 mt-1">{execution.patient_feedback}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
} 