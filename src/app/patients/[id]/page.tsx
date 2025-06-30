'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { api } from '@/lib/api'

import { ExercisePlanTab } from '@/components/patients/ExercisePlanTab'
import { PatientRecordsTab } from '@/components/patients/PatientRecordsTab'

import type { Database } from '@/types/database.types'

type Patient = Database['public']['Tables']['patients']['Row']

// Helper para calcular idade
const calculateAge = (birthDate: string) => {
  if (!birthDate) return ''
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear()
  return age
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const {
    data: patient,
    isLoading,
    isError,
    error,
  } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await api.get(`/patients/${id}`)
      if (response.status === 404) {
        throw new Error('404')
      }
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao buscar detalhes do paciente.')
      }
      return response.json()
    },
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="flex-1 w-full rounded-lg" />
      </div>
    )
  }

  if (isError) {
    const isNotFound = error instanceof Error && error.message === '404'
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:gap-8 md:p-8">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTitle>
            {isNotFound ? 'Paciente Não Encontrado' : 'Ocorreu um Erro'}
          </AlertTitle>
          <AlertDescription>
            {isNotFound
              ? 'O paciente que você está procurando não existe ou foi removido.'
              : 'Não foi possível carregar os dados do paciente. Tente novamente mais tarde.'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => router.push('/patients')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Pacientes
        </Button>
      </div>
    )
  }

  if (!patient) {
    return null // ou um estado de 'sem dados' se preferir
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {patient.full_name}
        </h1>
        <Badge variant="outline" className="ml-auto sm:ml-0">
          {calculateAge(patient.birth_date)} anos
        </Badge>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          {/* Ações da página (Editar, Deletar) podem ser adicionadas aqui */}
        </div>
      </div>
      <Tabs defaultValue="records" className="w-full">
        <TabsList>
          <TabsTrigger value="records">Prontuários</TabsTrigger>
          <TabsTrigger value="exercise-plan">Plano de Exercícios</TabsTrigger>
          <TabsTrigger value="progress">Evolução</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>
        <TabsContent value="records">
          <PatientRecordsTab patientId={patient.id} />
        </TabsContent>
        <TabsContent value="exercise-plan">
          <ExercisePlanTab patientId={patient.id} />
        </TabsContent>
        <TabsContent value="progress">
          <div className="flex items-center justify-center rounded-lg border border-dashed shadow-sm h-60">
            <p>Em breve: Gráficos e dados sobre a evolução do tratamento.</p>
          </div>
        </TabsContent>
        <TabsContent value="documents">
           <div className="flex items-center justify-center rounded-lg border border-dashed shadow-sm h-60">
            <p>Em breve: Acesso a documentos, laudos e exames.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}