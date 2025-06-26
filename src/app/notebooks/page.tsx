'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/auth'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Users,
  Lock,
  Globe,
  Clock,
  FileText,
  Stethoscope,
  Brain,
  Heart,
  Activity,
  Edit3,
  Save,
  X,
  ArrowLeft,
  User,
  Calendar
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Loading } from '@/components/ui/loading'
import RichEditor from '@/components/editor/rich-editor'
import { TemplatesSelector, Template } from '@/components/editor/templates'

// Types for real data
interface Notebook {
  id: string
  title: string
  description: string | null
  content: string | null
  template_type: string | null
  page_count: number
  created_at: string
  updated_at: string
  owner_id: string
  owner?: {
    full_name: string
    email: string
  }
  is_public?: boolean
}

interface NotebookTemplate {
  id: string
  title: string
  description: string
  icon: string
  category: string
  color: string
}

// Mock data fallback
const MOCK_NOTEBOOKS: Notebook[] = [
  {
    id: '1',
    title: 'Protocolos de Fisioterapia Respiratória',
    description: 'Técnicas e exercícios para reabilitação pulmonar',
    content: '<h1>Protocolos de Fisioterapia Respiratória</h1><p>Conteúdo do protocolo...</p>',
    template_type: 'avaliacao',
    page_count: 15,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    owner_id: 'user1',
    owner: {
      full_name: 'Dr. Rafael Minatto',
      email: 'rafael.minatto@yahoo.com.br'
    },
    is_public: false
  },
  {
    id: '2',
    title: 'Avaliação Neurológica Pediátrica',
    description: 'Protocolos específicos para avaliação infantil',
    content: '<h1>Avaliação Neurológica</h1><p>Procedimentos para crianças...</p>',
    template_type: 'avaliacao',
    page_count: 8,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-18T16:45:00Z',
    owner_id: 'user1',
    owner: {
      full_name: 'Dr. Rafael Minatto',
      email: 'rafael.minatto@yahoo.com.br'
    },
    is_public: false
  }
]

const notebookTemplates: NotebookTemplate[] = [
  {
    id: 'template-1',
    title: 'Protocolo de Avaliação',
    description: 'Template para criar protocolos de avaliação fisioterapêutica',
    icon: '📋',
    category: 'Avaliação',
    color: 'blue'
  },
  {
    id: 'template-2',
    title: 'Plano de Tratamento',
    description: 'Template para documentar planos de tratamento',
    icon: '🎯',
    category: 'Tratamento',
    color: 'green'
  },
  {
    id: 'template-3',
    title: 'Relatório de Evolução',
    description: 'Template para relatórios de acompanhamento',
    icon: '📈',
    category: 'Acompanhamento',
    color: 'orange'
  },
  {
    id: 'template-4',
    title: 'Protocolo de Exercícios',
    description: 'Template para documentar protocolos de exercícios',
    icon: '🏃',
    category: 'Exercícios',
    color: 'purple'
  }
]

export default function NotebooksPage() {
  const { user, loading: authLoading } = useAuth()
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null)
  const [editorContent, setEditorContent] = useState('')
  const [notebookTitle, setNotebookTitle] = useState('')
  const [notebookDescription, setNotebookDescription] = useState('')

  const supabase = createClient()
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL

  useEffect(() => {
    if (!authLoading) {
      loadNotebooks()
    }
  }, [authLoading])

  const loadNotebooks = async () => {
    try {
      setLoading(true)
      
      if (!user) {
        setNotebooks(MOCK_NOTEBOOKS)
        return
      }

      const { data, error } = await supabase
        .from('notebooks')
        .select(`
          *,
          owner:users!notebooks_owner_id_fkey(full_name, email)
        `)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar notebooks:', error)
        setNotebooks(MOCK_NOTEBOOKS)
        return
      }

      setNotebooks(data || [])
    } catch (error) {
      console.error('Erro:', error)
      setNotebooks(MOCK_NOTEBOOKS)
    } finally {
      setLoading(false)
    }
  }

  const createNotebook = async (template?: any) => {
    try {
      if (!user) {
        // Modo mock - simular criação
        const newNotebook: Notebook = {
          id: Date.now().toString(),
          title: template ? template.title : 'Novo Notebook',
          description: template ? template.description : '',
          content: '',
          template_type: template ? template.category : null,
          page_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: 'user1',
          owner: {
            full_name: 'Dr. Rafael Minatto',
            email: 'rafael.minatto@yahoo.com.br'
          },
          is_public: false
        }

        setNotebooks(prev => [newNotebook, ...prev])
        return
      }

      // Modo real com Supabase
      const notebookData = {
        title: template ? template.title : 'Novo Notebook',
        description: template ? template.description : '',
        content: '',
        template_type: template ? template.category : null,
        page_count: 0,
        owner_id: user.id,
        is_public: false
      }

      const { error } = await supabase
        .from('notebooks')
        .insert([notebookData])

      if (error) throw error

      await loadNotebooks()
    } catch (error) {
      console.error('Erro ao criar notebook:', error)
    }
  }

  const handleCreateNotebook = () => {
    setEditingNotebook(null)
    setNotebookTitle('')
    setNotebookDescription('')
    setEditorContent('')
    setShowTemplates(true)
  }

  const handleSelectTemplate = (template: Template) => {
    setEditorContent(template.content)
    setNotebookTitle(template.name)
    setNotebookDescription(template.description)
    setShowTemplates(false)
    setShowEditor(true)
  }

  const handleEditNotebook = (notebook: Notebook) => {
    setEditingNotebook(notebook)
    setNotebookTitle(notebook.title)
    setNotebookDescription(notebook.description || '')
    setEditorContent(notebook.content || '')
    setShowEditor(true)
  }

  const handleSaveNotebook = async () => {
    try {
      if (!user) {
        // Modo mock - simular salvamento
        const newNotebook: Notebook = {
          id: Date.now().toString(),
          title: notebookTitle,
          description: notebookDescription,
          content: editorContent,
          template_type: 'custom',
          page_count: Math.ceil(editorContent.length / 1000),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: 'user1',
          owner: {
            full_name: 'Dr. Rafael Minatto',
            email: 'rafael.minatto@yahoo.com.br'
          },
          is_public: false
        }

        if (editingNotebook) {
          setNotebooks(prev => prev.map(n => 
            n.id === editingNotebook.id 
              ? { ...newNotebook, id: editingNotebook.id, created_at: editingNotebook.created_at }
              : n
          ))
        } else {
          setNotebooks(prev => [newNotebook, ...prev])
        }

        setShowEditor(false)
        return
      }

      // Modo real com Supabase
      const notebookData = {
        title: notebookTitle,
        description: notebookDescription,
        content: editorContent,
        template_type: 'custom',
        page_count: Math.ceil(editorContent.length / 1000),
        owner_id: user.id,
        is_public: false
      }

      if (editingNotebook) {
        const { error } = await supabase
          .from('notebooks')
          .update(notebookData)
          .eq('id', editingNotebook.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('notebooks')
          .insert([notebookData])

        if (error) throw error
      }

      await loadNotebooks()
      setShowEditor(false)
    } catch (error) {
      console.error('Erro ao salvar notebook:', error)
    }
  }

  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notebook.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading || loading) {
    return <Loading />
  }

  // Modo Editor
  if (showEditor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowEditor(false)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Notebooks
          </Button>
          
          <div className="space-y-4 mb-6">
            <Input
              placeholder="Título do notebook"
              value={notebookTitle}
              onChange={(e) => setNotebookTitle(e.target.value)}
              className="text-lg font-semibold"
            />
            <Input
              placeholder="Descrição (opcional)"
              value={notebookDescription}
              onChange={(e) => setNotebookDescription(e.target.value)}
            />
          </div>
        </div>

        <RichEditor
          content={editorContent}
          onChange={setEditorContent}
          placeholder="Comece a escrever seu protocolo..."
          className="mb-6"
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowEditor(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSaveNotebook}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Notebook
          </Button>
        </div>
      </div>
    )
  }

  // Modo Seleção de Templates
  if (showTemplates) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setShowTemplates(false)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Notebooks
          </Button>
        </div>

        <TemplatesSelector 
          onSelectTemplate={handleSelectTemplate}
        />

        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowTemplates(false)
              setShowEditor(true)
            }}
          >
            Começar do Zero
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Notebooks</h1>
              <p className="text-muted-foreground mt-2">
                Organize protocolos, avaliações e documentos clínicos
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Templates
              </Button>
              <Button onClick={() => createNotebook()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Notebook
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar notebooks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Notebooks Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotebooks.map((notebook) => (
              <Card key={notebook.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{notebook.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {notebook.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {notebook.template_type || 'custom'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mr-2" />
                      {notebook.page_count} páginas
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      {notebook.owner?.full_name || 'Usuário'}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(notebook.updated_at).toLocaleDateString('pt-BR')}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditNotebook(notebook)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditNotebook(notebook)}
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredNotebooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum notebook encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Tente ajustar sua pesquisa' : 'Comece criando seu primeiro notebook'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateNotebook}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Notebook
                </Button>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 