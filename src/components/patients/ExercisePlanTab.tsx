'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlayCircle } from 'lucide-react'

// Definindo os tipos com base na consulta da API
type ExerciseDetails = {
  id: string;
  name: string;
  description: string | null;
  video_url: string | null;
  category: string | null;
}

type Prescription = {
  id: string;
  sets: number | null;
  repetitions: number | null;
  frequency: string | null;
  notes: string | null;
  exercise: ExerciseDetails | null;
}

async function fetchPrescriptions(patientId: string): Promise<Prescription[]> {
  const response = await fetch(`/api/patients/${patientId}/prescriptions`);
  if (!response.ok) {
    throw new Error('Falha ao buscar prescrições de exercícios.');
  }
  return response.json();
}

export function ExercisePlanTab({ patientId }: { patientId: string }) {
  const { data: prescriptions, isLoading, error } = useQuery({
    queryKey: ['exercisePrescriptions', patientId],
    queryFn: () => fetchPrescriptions(patientId),
    enabled: !!patientId, // Só executa a query se patientId existir
  });

  if (isLoading) {
    return <div className="text-center p-4">Carregando plano de exercícios...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{(error as Error).message}</div>;
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
        <Card>
            <CardHeader><CardTitle>Plano de Exercícios</CardTitle></CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Nenhum exercício prescrito para este paciente no momento.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-4">
      {prescriptions.map(({ id, exercise, sets, repetitions, frequency, notes }) => {
        if (!exercise) return null;
        
        return (
          <Card key={id}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{exercise.name}</CardTitle>
                        <CardDescription>{exercise.description}</CardDescription>
                    </div>
                    {exercise.video_url && (
                        <a href={exercise.video_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                                <PlayCircle className="mr-2 h-4 w-4"/> Ver Vídeo
                            </Button>
                        </a>
                    )}
                </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Séries</p>
                  <p>{sets || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Repetições</p>
                  <p>{repetitions || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold">Frequência</p>
                  <p>{frequency || 'N/A'}</p>
                </div>
                {exercise.category && (
                    <div>
                        <p className="font-semibold">Categoria</p>
                        <p><Badge variant="secondary">{exercise.category}</Badge></p>
                    </div>
                )}
              </div>
              {notes && (
                <div className="mt-4">
                  <p className="font-semibold">Instruções Adicionais</p>
                  <p className="text-muted-foreground text-sm">{notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 