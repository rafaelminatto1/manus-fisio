'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Plus, Search, Filter, Users, Lock, Globe } from 'lucide-react'

// Mock data - In production this would come from Supabase
const mockNotebooks = [
  {
    id: 1,
    title: 'Protocolos de Reabilitação',
    description: 'Protocolos padronizados para diferentes tipos de reabilitação',
    icon: '🏥',
    category: 'protocols',
    isPublic: true,
    collaborators: 3,
    pages: 12,
    lastUpdated: '2024-01-15',
    author: 'Dr. Rafael Santos'
  },
  {
    id: 2,
    title: 'Fisioterapia Neurológica',
    description: 'Técnicas e abordagens para reabilitação neurológica',
    icon: '🧠',
    category: 'specialties',
    isPublic: true,
    collaborators: 2,
    pages: 8,
    lastUpdated: '2024-01-14',
    author: 'Dra. Ana Lima'
  },
  {
    id: 3,
    title: 'Material Didático',
    description: 'Conteúdo educacional para estagiários e supervisão',
    icon: '📚',
    category: 'education',
    isPublic: false,
    collaborators: 5,
    pages: 15,
    lastUpdated: '2024-01-13',
    author: 'Dr. Rafael Santos'
  },
  {
    id: 4,
    title: 'Avaliação de Estagiários',
    description: 'Formulários e critérios para avaliação de competências',
    icon: '📋',
    category: 'evaluation',
    isPublic: false,
    collaborators: 1,
    pages: 6,
    lastUpdated: '2024-01-12',
    author: 'Administrador'
  }
]

const categories = [
  { value: 'all', label: 'Todas as categorias' },
  { value: 'protocols', label: 'Protocolos' },
  { value: 'specialties', label: 'Especialidades' },
  { value: 'education', label: 'Educação' },
  { value: 'evaluation', label: 'Avaliação' },
  { value: 'research', label: 'Pesquisa' }
]

export default function NotebooksPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-medical-500" />
                Notebooks
              </h1>
              <p className="text-muted-foreground">
                Organize e compartilhe conhecimento clínico de forma estruturada
              </p>
            </div>
            <Button className="btn-medical">
              <Plus className="h-4 w-4 mr-2" />
              Novo Notebook
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar notebooks por título ou descrição..." 
                    className="pl-8"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notebooks Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockNotebooks.map((notebook) => (
              <Card key={notebook.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{notebook.icon}</span>
                      <div className="flex items-center gap-2">
                        {notebook.isPublic ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {categories.find(c => c.value === notebook.category)?.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{notebook.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {notebook.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{notebook.pages} páginas</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{notebook.collaborators}</span>
                      </div>
                    </div>

                    {/* Author and Date */}
                    <div className="text-xs text-muted-foreground">
                      <p>Por {notebook.author}</p>
                      <p>Atualizado em {new Date(notebook.lastUpdated).toLocaleDateString('pt-BR')}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Abrir
                      </Button>
                      <Button variant="ghost" size="sm">
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {mockNotebooks.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum notebook encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando seu primeiro notebook para organizar o conhecimento clínico.
                </p>
                <Button className="btn-medical">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Notebook
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 