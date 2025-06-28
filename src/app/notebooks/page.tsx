'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
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
import { CollaborationPanel } from '@/components/ui/collaboration-panel'
import { useNotebooksQuery } from '@/hooks/use-notebooks-query'
import { useCreateNotebookMutation, useUpdateNotebookMutation } from '@/hooks/use-notebook-mutations'
// Interface Notebook será tipada pelo próprio hook

export default function NotebooksPage() {
  const [showEditor, setShowEditor] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingNotebook, setEditingNotebook] = useState<any>(null)
  const [notebookTitle, setNotebookTitle] = useState('')
  const [notebookDescription, setNotebookDescription] = useState('')
  const [editorContent, setEditorContent] = useState('')
  
  const { data: notebooks = [], isLoading, error } = useNotebooksQuery()
  const createNotebookMutation = useCreateNotebookMutation()
  const updateNotebookMutation = useUpdateNotebookMutation()

  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notebook.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateNotebook = () => {
    setEditingNotebook(null)
    setNotebookTitle('')
    setNotebookDescription('')
    setEditorContent('')
    setShowEditor(true)
  }

  const handleEditNotebook = (notebook: any) => {
    setEditingNotebook(notebook)
    setNotebookTitle(notebook.title)
    setNotebookDescription(notebook.description || '')
    setEditorContent(notebook.content || '')
    setShowEditor(true)
  }

  const handleSelectTemplate = (template: any) => {
    setNotebookTitle(template.name || template.title || '')
    setNotebookDescription(template.description || '')
    setEditorContent(template.content || '')
    setShowTemplates(false)
    setShowEditor(true)
  }

  const handleSaveNotebook = () => {
    if (!notebookTitle.trim()) return

    const notebookData = {
      title: notebookTitle,
      description: notebookDescription,
      content: editorContent,
    }

    if (editingNotebook) {
      updateNotebookMutation.mutate({ id: editingNotebook.id, ...notebookData })
    } else {
      createNotebookMutation.mutate(notebookData)
    }
    
    setShowEditor(false)
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Principal */}
          <div className="lg:col-span-2">
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

          {/* Painel de Colaboração */}
          <div className="lg:col-span-1">
            <CollaborationPanel
              documentId={editingNotebook?.id || 'new'}
              documentTitle={editingNotebook?.title || 'Novo Notebook'}
            />
          </div>
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
              <Button onClick={handleCreateNotebook}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Notebook
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive text-sm">{error.message}</p>
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