"use client"

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FileWarning, VenetianMask } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Badge } from '@/components/ui/badge'

interface PatientRecord {
  id: string
  patient_id: string
  session_date: string
  content: any
  created_at: string
  created_by: {
    full_name: string | null
  } | null
}

// Dados simulados para demonstração
const mockRecords: PatientRecord[] = [
  {
    id: '1',
    patient_id: '1',
    session_date: '2024-01-20',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Paciente apresentou melhora significativa na amplitude de movimento do ombro direito. ' },
            { type: 'text', text: 'Realizou todos os exercícios prescritos sem relato de dor.' }
          ]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Objetivos para próxima sessão: aumentar carga dos exercícios de fortalecimento.' }
          ]
        }
      ]
    },
    created_at: '2024-01-20T10:00:00Z',
    created_by: {
      full_name: 'Dr. João Silva'
    }
  },
  {
    id: '2',
    patient_id: '1',
    session_date: '2024-01-18',
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Primeira sessão de fisioterapia. Paciente relatou dor moderada (5/10) no ombro direito.' },
            { type: 'text', text: 'Iniciado protocolo de mobilização passiva e exercícios de alongamento.' }
          ]
        }
      ]
    },
    created_at: '2024-01-18T14:00:00Z',
    created_by: {
      full_name: 'Dr. João Silva'
    }
  }
]

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
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockRecords.filter(record => record.patient_id === patientId)
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
