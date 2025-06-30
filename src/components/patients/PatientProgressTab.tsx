"use client"

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TrendingUp, Calendar, Activity, Target } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import type { Database } from '@/types/database.types'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface PatientRecord {
  id: string
  patient_id: string
  record_type: string
  content: string
  session_date: string
  created_at: string
}

interface ExercisePrescription {
  id: string
  patient_id: string
  exercise_name: string
  status: string
  created_at: string
}

interface ProgressData {
  records: PatientRecord[]
  prescriptions: ExercisePrescription[]
}

export function PatientProgressTab({ patientId }: { patientId: string }) {
  const {
    data: progressData,
    isLoading,
    isError,
    error,
  } = useQuery<ProgressData>({
    queryKey: ['patient-progress', patientId],
    queryFn: async () => {
      const [recordsResponse, prescriptionsResponse] = await Promise.all([
        fetch(`/api/patients/${patientId}/records`),
        fetch(`/api/patients/${patientId}/prescriptions`),
      ])

      if (!recordsResponse.ok || !prescriptionsResponse.ok) {
        throw new Error('Falha ao buscar dados de progresso')
      }

      const [records, prescriptions] = await Promise.all([
        recordsResponse.json(),
        prescriptionsResponse.json(),
      ])

      return { records, prescriptions }
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <TrendingUp className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Dados de Progresso</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!progressData) {
    return (
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertTitle>Dados Insuficientes</AlertTitle>
        <AlertDescription>
          Não há dados suficientes para gerar gráficos de evolução.
        </AlertDescription>
      </Alert>
    )
  }

  const { records, prescriptions } = progressData

  // Preparar dados para gráfico de sessões ao longo do tempo
  const sessionsData = {
    labels: records.slice(0, 10).reverse().map(record => 
      new Date(record.session_date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    ),
    datasets: [
      {
        label: 'Sessões Realizadas',
        data: records.slice(0, 10).reverse().map((_, index) => index + 1),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  }

  // Preparar dados para gráfico de exercícios prescritos
  const exercisesData = {
    labels: ['Ativos', 'Concluídos', 'Pausados'],
    datasets: [
      {
        label: 'Exercícios',
        data: [
          prescriptions.filter(p => p.status === 'active').length,
          prescriptions.filter(p => p.status === 'completed').length,
          prescriptions.filter(p => p.status === 'paused').length,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 191, 36, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(251, 191, 36)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">
              Desde o início do tratamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercícios Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptions.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Prescrições em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptions.length > 0 
                ? Math.round((prescriptions.filter(p => p.status === 'completed').length / prescriptions.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Exercícios concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Sessão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.length > 0 && records[0]?.session_date
                ? new Date(records[0].session_date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Data da última consulta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução das Sessões</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length > 0 ? (
              <Line data={sessionsData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhuma sessão registrada ainda
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Exercícios</CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length > 0 ? (
              <Bar data={exercisesData} options={barChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Nenhum exercício prescrito ainda
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline de sessões recentes */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sessões Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {records.slice(0, 5).map((record, index) => (
                <div key={record.id} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Sessão de {new Date(record.session_date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.created_at || '').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}