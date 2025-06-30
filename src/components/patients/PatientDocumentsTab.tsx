"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  FileImage, 
  FileX, 
  Plus,
  Calendar,
  User
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface PatientDocument {
  id: string
  patient_id: string
  filename: string
  original_name: string
  file_type: string
  file_size: number
  document_type: string
  upload_date: string
  uploaded_by: string
  description?: string
}

const DOCUMENT_TYPES = [
  { value: 'exam', label: 'Exame' },
  { value: 'report', label: 'Laudo' },
  { value: 'prescription', label: 'Receita' },
  { value: 'image', label: 'Imagem' },
  { value: 'other', label: 'Outros' },
]

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <FileImage className="h-5 w-5" />
  return <FileText className="h-5 w-5" />
}

export function PatientDocumentsTab({ patientId }: { patientId: string }) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('')
  const [description, setDescription] = useState('')
  
  const queryClient = useQueryClient()

  const {
    data: documents,
    isLoading,
    isError,
    error,
  } = useQuery<PatientDocument[]>({
    queryKey: ['patient-documents', patientId],
    queryFn: async () => {
      // Por enquanto, vamos simular dados já que não temos a API de documentos ainda
      return []
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      // Simulação de upload - em produção, isso seria uma chamada real para a API
      await new Promise(resolve => setTimeout(resolve, 2000))
      return { success: true }
    },
    onSuccess: () => {
      toast.success('Documento enviado com sucesso!')
      setIsUploadDialogOpen(false)
      setSelectedFile(null)
      setDocumentType('')
      setDescription('')
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] })
    },
    onError: () => {
      toast.error('Erro ao enviar documento. Tente novamente.')
    },
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tamanho do arquivo (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo permitido: 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (!selectedFile || !documentType) {
      toast.error('Por favor, selecione um arquivo e o tipo de documento.')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('document_type', documentType)
    formData.append('description', description)
    formData.append('patient_id', patientId)

    uploadMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <FileX className="h-4 w-4" />
        <AlertTitle>Erro ao Carregar Documentos</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Ocorreu um erro inesperado.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Documentos do Paciente</h3>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Novo Documento</DialogTitle>
              <DialogDescription>
                Faça o upload de exames, laudos ou outros documentos relacionados ao paciente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Arquivo</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFile.name} - {formatFileSize(selectedFile.size)}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="document-type">Tipo de Documento</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Descrição do documento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? 'Enviando...' : 'Enviar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {documents && documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(doc.file_type)}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-medium truncate">
                        {doc.original_name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {doc.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {doc.description}
                  </p>
                )}
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(doc.upload_date).toLocaleDateString('pt-BR')}
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="mr-1 h-3 w-3" />
                    Ver
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="mr-1 h-3 w-3" />
                    Baixar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Este paciente ainda não possui documentos anexados. Clique no botão acima para adicionar o primeiro documento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 