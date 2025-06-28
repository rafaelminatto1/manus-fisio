'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { 
  ArrowLeft, 
  FileText, 
  Stethoscope, 
  Brain, 
  Heart, 
  Activity,
  Users,
  Calendar,
  Target,
  ClipboardList,
  Save,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { useCreateNotebookMutation } from '@/hooks/use-notebook-mutations'

// Templates específicos para fisioterapia
const FISIO_TEMPLATES = [
  {
    id: 'protocolo-reabilitacao',
    name: 'Protocolo de Reabilitação',
    description: 'Template estruturado para protocolos de reabilitação ortopédica',
    icon: Activity,
    category: 'clinical',
    content: `# Protocolo de Reabilitação

## 📋 Dados do Paciente
- **Nome:** 
- **Idade:** 
- **Diagnóstico:** 
- **Data de Início:** 

## 🎯 Objetivos do Tratamento
1. 
2. 
3. 

## 💪 Exercícios Prescritos

### Fase 1 - Inicial (Semanas 1-2)
- **Exercício 1:** 
  - Séries: 
  - Repetições: 
  - Carga: 
- **Exercício 2:** 

### Fase 2 - Intermediária (Semanas 3-4)
- **Exercício 1:** 

### Fase 3 - Avançada (Semanas 5-6)
- **Exercício 1:** 

## 📈 Progressão Esperada
- **Semana 1-2:** 
- **Semana 3-4:** 
- **Semana 5-6:** 

## ✅ Critérios de Alta
1. 
2. 
3. `
  },
  {
    id: 'avaliacao-estagiario',
    name: 'Avaliação de Estagiário',
    description: 'Formulário para avaliação de desempenho de estagiários',
    icon: Users,
    category: 'education',
    content: `# Avaliação de Estagiário

## 👤 Informações do Estagiário
- **Nome:** 
- **Universidade:** 
- **Período:** 
- **Supervisor:** 

## 🎯 Competências Técnicas

### Avaliação Clínica
- **Anamnese:** ⭐⭐⭐⭐⭐
- **Exame Físico:** ⭐⭐⭐⭐⭐
- **Diagnóstico Funcional:** ⭐⭐⭐⭐⭐

### Técnicas Terapêuticas
- **Exercícios Terapêuticos:** ⭐⭐⭐⭐⭐
- **Terapia Manual:** ⭐⭐⭐⭐⭐
- **Recursos Físicos:** ⭐⭐⭐⭐⭐

### Habilidades Interpessoais
- **Comunicação com Pacientes:** ⭐⭐⭐⭐⭐
- **Trabalho em Equipe:** ⭐⭐⭐⭐⭐
- **Ética Profissional:** ⭐⭐⭐⭐⭐

## 📝 Áreas de Melhoria
1. 
2. 
3. 

## 🎯 Plano de Desenvolvimento
1. 
2. 
3. 

## 💬 Feedback do Supervisor
`
  },
  {
    id: 'plano-tratamento',
    name: 'Plano de Tratamento',
    description: 'Template para elaboração de planos de tratamento fisioterapêutico',
    icon: Target,
    category: 'clinical',
    content: `# Plano de Tratamento Fisioterapêutico

## 📋 Informações do Paciente
- **Nome:** 
- **Idade:** 
- **Profissão:** 
- **Diagnóstico Médico:** 

## 🔍 Diagnóstico Fisioterapêutico
- **Disfunção Principal:** 
- **Disfunções Secundárias:** 
- **Prognóstico:** 

## 🎯 Metas Funcionais

### Curto Prazo (2-4 semanas)
1. 
2. 
3. 

### Médio Prazo (1-2 meses)
1. 
2. 
3. 

### Longo Prazo (3-6 meses)
1. 
2. 
3. 

## 🛠️ Intervenções Planejadas

### Recursos Terapêuticos
- **Cinesioterapia:** 
- **Terapia Manual:** 
- **Eletroterapia:** 
- **Outras:** 

### Frequência de Tratamento
- **Sessões por semana:** 
- **Duração da sessão:** 
- **Tempo total estimado:** 

## 📅 Cronograma de Reavaliação
- **1ª Reavaliação:** 
- **2ª Reavaliação:** 
- **Reavaliação Final:** 

## 📋 Orientações Domiciliares
1. 
2. 
3. `
  },
  {
    id: 'relatorio-progresso',
    name: 'Relatório de Progresso',
    description: 'Template para acompanhamento da evolução do paciente',
    icon: Heart,
    category: 'clinical',
    content: `# Relatório de Progresso

## 📋 Dados da Sessão
- **Data:** 
- **Paciente:** 
- **Sessão nº:** 
- **Fisioterapeuta:** 

## 📈 Status Atual do Paciente

### Avaliação Subjetiva
- **Queixas do Paciente:** 
- **Nível de Dor (0-10):** 
- **Limitações Funcionais:** 

### Avaliação Objetiva
- **ADM (Amplitude de Movimento):** 
- **Força Muscular:** 
- **Funcionalidade:** 
- **Outros Achados:** 

## 🔄 Evolução desde Última Avaliação

### Melhorias Observadas
1. 
2. 
3. 

### Dificuldades Encontradas
1. 
2. 
3. 

## 🛠️ Ajustes no Tratamento
- **Exercícios Modificados:** 
- **Novos Recursos:** 
- **Orientações Atualizadas:** 

## 🎯 Próximos Passos
1. 
2. 
3. 

## 📅 Próxima Sessão
- **Data:** 
- **Foco:** 
- **Objetivos:** `
  },
  {
    id: 'estudo-caso',
    name: 'Estudo de Caso',
    description: 'Template para documentação de estudos de caso clínicos',
    icon: Brain,
    category: 'research',
    content: `# Estudo de Caso Clínico

## 📋 Apresentação do Caso
- **Idade:** 
- **Sexo:** 
- **Profissão:** 
- **Queixa Principal:** 

## 📖 História Clínica

### História da Doença Atual
- **Início dos Sintomas:** 
- **Evolução:** 
- **Tratamentos Anteriores:** 

### História Pregressa
- **Doenças Relevantes:** 
- **Cirurgias:** 
- **Medicamentos:** 

## 🔍 Exame Físico

### Inspeção
- **Postura:** 
- **Marcha:** 
- **Deformidades:** 

### Palpação
- **Pontos Dolorosos:** 
- **Temperatura:** 
- **Edema:** 

### Testes Específicos
- **Teste 1:** 
- **Teste 2:** 
- **Teste 3:** 

## 🎯 Raciocínio Clínico

### Hipóteses Diagnósticas
1. 
2. 
3. 

### Diagnóstico Fisioterapêutico
- **Principal:** 
- **Secundário:** 

## 💡 Plano Terapêutico
- **Objetivos:** 
- **Intervenções:** 
- **Prognóstico:** 

## 📊 Resultados
- **Desfecho:** 
- **Aprendizados:** 
- **Considerações:** `
  }
]

export default function NewNotebookPage() {
  const router = useRouter()
  const { user } = useAuth()
  const createNotebookMutation = useCreateNotebookMutation()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [isPublic, setIsPublic] = useState(false)

  const handleCreateNotebook = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório')
      return
    }

    const template = FISIO_TEMPLATES.find(t => t.id === selectedTemplate)
    
    try {
      const notebook = await createNotebookMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        content: template?.content || '',
        template_type: selectedTemplate || null,
        is_public: isPublic
      })

      toast.success('Notebook criado com sucesso!')
      router.push(`/notebooks/${notebook.id}`)
    } catch (error) {
      toast.error('Erro ao criar notebook')
      console.error('Error creating notebook:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'clinical': return 'bg-blue-100 text-blue-800'
      case 'education': return 'bg-green-100 text-green-800'
      case 'research': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'clinical': return 'Clínico'
      case 'education': return 'Educação'
      case 'research': return 'Pesquisa'
      default: return 'Geral'
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Criar Novo Notebook</h1>
              <p className="text-muted-foreground">
                Crie um notebook usando templates específicos para fisioterapia
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Título *</label>
                    <Input
                      placeholder="Ex: Protocolo de Reabilitação Pós-Cirúrgica"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      placeholder="Breve descrição do conteúdo do notebook..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">Visibilidade:</label>
                    <Select value={isPublic ? 'public' : 'private'} onValueChange={(v) => setIsPublic(v === 'public')}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Privado</SelectItem>
                        <SelectItem value="public">Público</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Templates de Fisioterapia
                  </CardTitle>
                  <CardDescription>
                    Escolha um template específico para começar com uma estrutura organizada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FISIO_TEMPLATES.map((template) => {
                      const Icon = template.icon
                      return (
                        <div
                          key={template.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedTemplate === template.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-sm">{template.name}</h3>
                                <Badge className={`text-xs ${getCategoryColor(template.category)}`}>
                                  {getCategoryName(template.category)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Opção em branco */}
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === '' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate('')}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm mb-1">Notebook em Branco</h3>
                          <p className="text-xs text-muted-foreground">
                            Comece com um documento completamente vazio
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateNotebook}
                  disabled={!title.trim() || createNotebookMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {createNotebookMutation.isPending ? 'Criando...' : 'Criar Notebook'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTemplate ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const template = FISIO_TEMPLATES.find(t => t.id === selectedTemplate)
                          if (!template) return null
                          const Icon = template.icon
                          return (
                            <>
                              <Icon className="h-5 w-5 text-blue-600" />
                              <span className="font-medium">{template.name}</span>
                            </>
                          )
                        })()}
                      </div>
                      <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md max-h-64 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-xs">
                          {FISIO_TEMPLATES.find(t => t.id === selectedTemplate)?.content.slice(0, 500)}
                          {(FISIO_TEMPLATES.find(t => t.id === selectedTemplate)?.content.length || 0) > 500 && '...'}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">
                        Selecione um template para ver o preview
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 