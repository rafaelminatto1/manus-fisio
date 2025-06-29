'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Patient, PatientRecord, UserProfile } from '@/types/database'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
  } from "@/components/ui/dialog"
import RichEditor from '@/components/editor/rich-editor'

// Corrigindo a interface para aceitar um objeto de usuário ou um UUID como string
interface RecordWithUser extends Omit<PatientRecord, 'created_by'> {
    created_by: Pick<UserProfile, 'full_name'> | string | null
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<RecordWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function fetchPatient() {
      try {
        setLoading(true)
        const response = await fetch(`/api/patients/${id}`)
        if (!response.ok) {
          throw new Error('Falha ao buscar detalhes do paciente.')
        }
        const data = await response.json()
        setPatient(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    async function fetchRecords() {
        try {
            setLoadingRecords(true)
            const response = await fetch(`/api/patients/${id}/records`)
            if (!response.ok) {
                throw new Error('Falha ao buscar prontuários.')
            }
            const data = await response.json()
            setRecords(data)
        } catch (err: any) {
            // Não tratar como erro fatal, pode não haver prontuários
            console.error(err)
        } finally {
            setLoadingRecords(false)
        }
    }

    fetchPatient()
    fetchRecords()
  }, [id])
  
  const handleDelete = async () => {
    try {
        const response = await fetch(`/api/patients/${id}`, {
            method: 'DELETE',
        })

        if (!response.ok) {
            throw new Error('Falha ao deletar o paciente.')
        }

        toast.success('Paciente deletado com sucesso.')
        router.push('/patients')

    } catch (error: any) {
        toast.error(error.message || 'Falha ao deletar o paciente.')
    }
  }
  
  const handleNewRecord = async (content: any) => {
    try {
        const response = await fetch(`/api/patients/${id}/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        })

        if (!response.ok) {
            throw new Error('Falha ao salvar o prontuário.')
        }

        const newRecord = await response.json();
        // Adiciona o novo prontuário no topo da lista
        // Ajustando o tipo para corresponder à interface RecordWithUser
        const newRecordWithUser: RecordWithUser = {
            ...newRecord,
            created_by: { full_name: 'Você' } // Placeholder
        }
        setRecords(prevRecords => [newRecordWithUser, ...prevRecords]);

        toast.success('Novo prontuário salvo.')

        return true; // Indica sucesso para o editor
    } catch (error: any) {
         toast.error(error.message || 'Falha ao salvar o prontuário.')
        return false; // Indica falha para o editor
    }
  }

  if (loading) {
    return <div className="text-center p-10">Carregando...</div>
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>
  }

  if (!patient) {
    return <div className="text-center p-10">Paciente não encontrado.</div>
  }

  return (
    <div className="space-y-6">
      <Link href="/patients" className="flex items-center text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a lista de pacientes
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex-1">
            <h1 className="text-3xl font-bold">{patient.full_name}</h1>
            <p className="text-muted-foreground">ID: {patient.id}</p>
        </div>
        <div className='flex space-x-2'>
            <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Deletar
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Você tem certeza?</DialogTitle>
                    <DialogDescription>
                        Essa ação não pode ser desfeita. Isso irá deletar permanentemente o paciente
                        e todos os seus prontuários associados.
                    </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="button" onClick={handleDelete} variant='destructive'>
                            Deletar
                        </Button>
                    </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Paciente</CardTitle>
          <CardDescription>Informações demográficas e de contato.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
              <p>{patient.full_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
              <p>{format(new Date(patient.birth_date || ''), 'dd/MM/yyyy')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Gênero</p>
              <p>
                <Badge variant="secondary">{patient.gender}</Badge>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">CPF</p>
              <p>{patient.cpf || 'Não informado'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Telefone</p>
              <p>{patient.phone || 'Não informado'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{patient.email || 'Não informado'}</p>
            </div>
             <div className="md:col-span-3 space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Endereço</p>
              <p>{patient.address || 'Não informado'}</p>
            </div>
             <div className="border-t md:col-span-3 pt-4"></div>
             <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Contato de Emergência</p>
              <p>{patient.emergency_contact_name || 'Não informado'}</p>
            </div>
             <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Telefone de Emergência</p>
              <p>{patient.emergency_contact_phone || 'Não informado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Prontuário Eletrônico</CardTitle>
          <CardDescription>Adicione uma nova evolução ou veja o histórico de sessões.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className='mb-6 border-b pb-6'>
                <h3 className='text-lg font-semibold mb-2'>Nova Sessão</h3>
                <RichEditor onSave={handleNewRecord} />
            </div>
            
            <h3 className='text-lg font-semibold mb-4'>Histórico de Sessões</h3>
            {loadingRecords ? (
                <p>Carregando prontuários...</p>
            ) : records.length === 0 ? (
                <p className="text-muted-foreground">Nenhum prontuário encontrado para este paciente.</p>
            ) : (
                <div className="space-y-4">
                    {records.map(record => (
                        <div key={record.id} className="border-l-4 pl-4">
                            <p className="text-sm font-semibold">
                                {format(new Date(record.session_date), 'dd/MM/yyyy HH:mm')} - 
                                <span className='text-muted-foreground'> Dr(a). {
                                    (typeof record.created_by === 'object' && record.created_by?.full_name) 
                                        ? record.created_by.full_name 
                                        : 'Desconhecido'
                                }</span>
                            </p>
                            {/* Idealmente, teríamos um renderizador de JSON do Tiptap aqui */}
                            <div className='prose prose-sm dark:prose-invert max-w-none mt-2'>
                                <pre className='text-xs whitespace-pre-wrap'><code>{JSON.stringify(record.content, null, 2)}</code></pre>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>

    </div>
  )
} 