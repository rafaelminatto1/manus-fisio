'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dumbbell, Play, Clock, Target } from 'lucide-react'

interface ExercisePrescription {
  id: string
  sets: number
  repetitions: number
  frequency: string
  notes?: string
  exercise: {
    id: string
    name: string
    description: string
    video_url?: string
    category: string
  }
}

export function ExercisePlanTab({ patientId }: { patientId: string }) {
  const {
    data: prescriptions,
    isLoading,
    isError,
    error,
  } = useQuery<ExercisePrescription[]>({
    queryKey: ['patient-prescriptions', patientId],
    queryFn: async () => {
      // Dados simulados para demonstração
      return [
        {
          id: '1',
          sets: 3,
          repetitions: 15,
          frequency: '2x por dia',
          notes: 'Iniciar com movimento lento e controlado',
          exercise: {
            id: 'ex1',
            name: 'Flexão de Braço Modificada',
            description: 'Exercício para fortalecimento do peitoral e tríceps, adaptado para iniciantes.',
            video_url: 'https://example.com/video1',
            category: 'Fortalecimento'
          }
        },
        {
          id: '2',
          sets: 2,
          repetitions: 20,
          frequency: '1x por dia',
          notes: 'Manter respiração controlada durante o movimento',
          exercise: {
            id: 'ex2',
            name: 'Alongamento Cervical',
            description: 'Exercício de mobilidade para redução de tensão na região cervical.',
            category: 'Mobilidade'
          }
        },
        {
          id: '3',
          sets: 4,
          repetitions: 12,
          frequency: '3x por semana',
          exercise: {
            id: 'ex3',
            name: 'Agachamento Assistido',
            description: 'Fortalecimento de membros inferiores com apoio.',
            category: 'Fortalecimento'
          }
        }
      ]
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <Dumbbell className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Exercícios</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <Alert>
        <Target className="h-4 w-4" />
        <AlertTitle>Nenhum Exercício Prescrito</AlertTitle>
        <AlertDescription>
          Este paciente ainda não possui exercícios prescritos no plano de tratamento.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Plano de Exercícios Atual</h3>
        <Badge variant="outline">
          {prescriptions.length} exercício{prescriptions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{prescription.exercise.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {prescription.exercise.category}
                  </Badge>
                </div>
                {prescription.exercise.video_url && (
                  <div className="flex items-center space-x-2">
                    <Play className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600">Vídeo disponível</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {prescription.exercise.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Séries</p>
                    <p className="text-lg font-bold">{prescription.sets}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Dumbbell className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Repetições</p>
                    <p className="text-lg font-bold">{prescription.repetitions}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Frequência</p>
                    <p className="text-lg font-bold">{prescription.frequency}</p>
                  </div>
                </div>
              </div>

              {prescription.notes && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm">
                    <strong>Observações:</strong> {prescription.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 