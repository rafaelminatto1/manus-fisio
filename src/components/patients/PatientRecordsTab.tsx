"use client"

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FileWarning, VenetianMask } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import type { Database } from '@/types/database.types'
import { Badge } from '@/components/ui/badge'

type PatientRecord = Database['public']['Tables']['patient_records']['Row'] & {
  created_by: {
    full_name: string | null
  } | null
}

// Um componente "somente leitura" para renderizar o conteúdo do prontuário
const ReadOnlyEditor = ({ content }: { content: any }) => {
  const editor = useEditor({
    editable: false,
    content: content,
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none text-sm',
      },
    },
  })

  return <EditorContent editor={editor} />
}

export function PatientRecordsTab({ patientId }: { patientId: string }) {
  const {
    data: records,
    isLoading,
    isError,
    error,
  } = useQuery<PatientRecord[]>({
    queryKey: ['patient-records', patientId],
    queryFn: async () => {
      const response = await api.get(`/patients/${patientId}/records`)
      if (!response.ok) {
        throw new Error('Falha ao buscar prontuários')
      }
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <FileWarning className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Prontuários</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!records || records.length === 0) {
    return (
      <Alert>
        <VenetianMask className="h-4 w-4" />
        <AlertTitle>Nenhum Registro Encontrado</AlertTitle>
        <AlertDescription>
          Este paciente ainda não possui prontuários registrados no sistema.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {records.map((record) => (
        <Card key={record.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              Sessão de {new Date(record.session_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            </CardTitle>
            <Badge variant="outline">
              {record.created_by?.full_name ?? 'Profissional não identificado'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <ReadOnlyEditor content={record.content} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
