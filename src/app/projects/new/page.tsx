'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/auth'
import { toast } from 'sonner'
import { ArrowLeft, FolderKanban, Save, X, Calendar, User } from 'lucide-react'

interface ProjectFormData {
  title: string
  description: string
  status: string
  priority: string
  start_date: string
  end_date: string
  tags: string[]
}

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planejamento' },
  { value: 'active', label: 'Ativo' },
  { value: 'on_hold', label: 'Em Espera' },
  { value: 'completed', label: 'Concluído' }
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
]

export default function NewProject() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Você precisa estar logado para criar um projeto')
      return
    }

    if (!formData.title.trim()) {
      toast.error('O título é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          tags: formData.tags,
          created_by: user.id,
          metadata: {
            created_at: new Date().toISOString(),
            project_type: 'clinical'
          }
        })
        .select()
        .single()

      if (error) throw error

      // Log da atividade
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: 'create',
          entity_type: 'project',
          entity_id: data.id,
          details: {
            title: formData.title,
            status: formData.status,
            priority: formData.priority
          }
        })

      toast.success('Projeto criado com sucesso!')
      router.push(`/projects/${data.id}`)
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error)
      toast.error('Erro ao criar projeto: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <FolderKanban className="h-6 w-6 text-green-500" />
              <h1 className="text-2xl font-bold">Criar Novo Projeto</h1>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Projeto</CardTitle>
              <CardDescription>
                Crie um novo projeto clínico para organizar tarefas, procedimentos e acompanhamento de pacientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Projeto *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Reabilitação Pós-Cirúrgica - Paciente João Silva"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva os objetivos, procedimentos e metas deste projeto..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isLoading}
                    rows={4}
                  />
                </div>

                {/* Status e Prioridade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Datas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Data de Início</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">Data Prevista de Conclusão</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      disabled={isLoading}
                      min={formData.start_date}
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Ex: ortopedia, reabilitação, pós-cirúrgico..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={isLoading || !tagInput.trim()}
                    >
                      Adicionar
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500"
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Informações Adicionais */}
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    📋 Próximos Passos
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Após criar o projeto, você poderá adicionar tarefas e colaboradores</li>
                    <li>• Configure marcos e prazos importantes</li>
                    <li>• Associe pacientes e documentos relevantes</li>
                    <li>• Monitore o progresso através do dashboard</li>
                  </ul>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.title.trim()}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Criando...' : 'Criar Projeto'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
