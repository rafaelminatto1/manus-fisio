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
import { ArrowLeft, BookOpen, Save, X } from 'lucide-react'

interface NotebookFormData {
  title: string
  description: string
  category: string
  is_public: boolean
  tags: string[]
}

const CATEGORIES = [
  'Protocolos Clínicos',
  'Procedimentos',
  'Estudos de Caso',
  'Documentação',
  'Templates',
  'Pesquisa',
  'Outros'
]

export default function NewNotebook() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<NotebookFormData>({
    title: '',
    description: '',
    category: '',
    is_public: false,
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
      toast.error('Você precisa estar logado para criar um notebook')
      return
    }

    if (!formData.title.trim()) {
      toast.error('O título é obrigatório')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('notebooks')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          is_public: formData.is_public,
          tags: formData.tags,
          created_by: user.id,
          metadata: {
            created_at: new Date().toISOString(),
            template_type: 'clinical'
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
          entity_type: 'notebook',
          entity_id: data.id,
          details: {
            title: formData.title,
            category: formData.category
          }
        })

      toast.success('Notebook criado com sucesso!')
      router.push(`/notebooks/${data.id}`)
    } catch (error: any) {
      console.error('Erro ao criar notebook:', error)
      toast.error('Erro ao criar notebook: ' + error.message)
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
              <BookOpen className="h-6 w-6 text-blue-500" />
              <h1 className="text-2xl font-bold">Criar Novo Notebook</h1>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Notebook</CardTitle>
              <CardDescription>
                Crie um novo notebook para organizar protocolos, procedimentos ou documentação clínica.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Protocolo de Reabilitação Pós-Cirúrgica"
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
                    placeholder="Descreva o objetivo e conteúdo deste notebook..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Adicionar tag..."
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

                {/* Visibilidade */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                    disabled={isLoading}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_public" className="text-sm">
                    Tornar este notebook público (visível para toda a equipe)
                  </Label>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.title.trim()}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Criando...' : 'Criar Notebook'}
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
