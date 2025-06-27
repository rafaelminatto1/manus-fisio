'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Table as TableIcon,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Save,
  Users,
  Eye,
  Settings,
  Palette,
  FileText,
  Stethoscope,
  Activity,
  Heart,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Printer,
  Download,
  Share2,
  History,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/cn'

// Templates específicos para fisioterapia
const PHYSIO_TEMPLATES = {
  avaliacao_inicial: {
    name: 'Avaliação Inicial',
    icon: Stethoscope,
    content: `<h1>Avaliação Fisioterapêutica Inicial</h1>

<h2>Dados do Paciente</h2>
<p><strong>Nome:</strong> [Nome do paciente]<br>
<strong>Data de Nascimento:</strong> [DD/MM/AAAA]<br>
<strong>Profissão:</strong> [Profissão]<br>
<strong>Data da Avaliação:</strong> [DD/MM/AAAA]</p>

<h2>Queixa Principal</h2>
<p>[Descrição da queixa principal do paciente]</p>

<h2>História da Doença Atual (HDA)</h2>
<p>[Histórico detalhado da condição atual]</p>

<h2>História Médica Pregressa</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">Cirurgias anteriores</li>
  <li data-type="taskItem" data-checked="false">Medicamentos em uso</li>
  <li data-type="taskItem" data-checked="false">Alergias</li>
  <li data-type="taskItem" data-checked="false">Comorbidades</li>
</ul>

<h2>Exame Físico</h2>

<h3>Inspeção</h3>
<ul>
  <li><strong>Postura:</strong> [Descrição]</li>
  <li><strong>Marcha:</strong> [Descrição]</li>
  <li><strong>Deformidades:</strong> [Descrição]</li>
</ul>

<h3>Palpação</h3>
<ul>
  <li><strong>Pontos dolorosos:</strong> [Localização]</li>
  <li><strong>Tensão muscular:</strong> [Avaliação]</li>
  <li><strong>Temperatura:</strong> [Normal/Alterada]</li>
</ul>

<h3>Amplitude de Movimento (ADM)</h3>
<table>
  <thead>
    <tr>
      <th>Movimento</th>
      <th>Ativo</th>
      <th>Passivo</th>
      <th>Observações</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Flexão</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Extensão</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>Rotação</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

<h2>Diagnóstico Fisioterapêutico</h2>
<p>[Diagnóstico baseado na avaliação]</p>

<h2>Objetivos do Tratamento</h2>
<ol>
  <li>[Objetivo 1]</li>
  <li>[Objetivo 2]</li>
  <li>[Objetivo 3]</li>
</ol>

<hr>
<p><strong>Fisioterapeuta:</strong> [Nome]<br>
<strong>CREFITO:</strong> [Número]<br>
<strong>Data:</strong> [DD/MM/AAAA]</p>`
  },
  
  evolucao: {
    name: 'Evolução',
    icon: TrendingUp,
    content: `<h1>Evolução Fisioterapêutica</h1>

<p><strong>Paciente:</strong> [Nome]<br>
<strong>Data:</strong> [DD/MM/AAAA]<br>
<strong>Sessão:</strong> [Número da sessão]</p>

<h2>Queixas do Dia</h2>
<p>[Relato do paciente sobre sintomas atuais]</p>

<h2>Avaliação Subjetiva</h2>
<ul>
  <li><strong>Dor (EVA 0-10):</strong> [Nota]</li>
  <li><strong>Funcionalidade:</strong> [Descrição]</li>
  <li><strong>Sono:</strong> [Qualidade]</li>
  <li><strong>Humor:</strong> [Estado]</li>
</ul>

<h2>Intervenções Realizadas</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">[Técnica/exercício 1] - [Parâmetros]</li>
  <li data-type="taskItem" data-checked="false">[Técnica/exercício 2] - [Parâmetros]</li>
  <li data-type="taskItem" data-checked="false">[Técnica/exercício 3] - [Parâmetros]</li>
</ul>

<h2>Resposta ao Tratamento</h2>
<p>[Observações sobre a resposta do paciente]</p>

<h2>Orientações Domiciliares</h2>
<ol>
  <li>[Orientação 1]</li>
  <li>[Orientação 2]</li>
  <li>[Orientação 3]</li>
</ol>

<hr>
<p><strong>Fisioterapeuta:</strong> [Nome]<br>
<strong>Assinatura:</strong> ___________________</p>`
  },

  programa_exercicios: {
    name: 'Programa de Exercícios',
    icon: Activity,
    content: `<h1>Programa de Exercícios Domiciliares</h1>

<p><strong>Paciente:</strong> [Nome]<br>
<strong>Condição:</strong> [Diagnóstico]<br>
<strong>Data de Prescrição:</strong> [DD/MM/AAAA]</p>

<blockquote>
<p>⚠️ <strong>IMPORTANTE:</strong> Interrompa os exercícios se sentir dor intensa e procure orientação profissional.</p>
</blockquote>

<h2>Exercícios Prescritos</h2>

<h3>1. [Nome do Exercício]</h3>
<ul>
  <li><strong>Objetivo:</strong> [Finalidade do exercício]</li>
  <li><strong>Posição inicial:</strong> [Descrição]</li>
  <li><strong>Execução:</strong> [Passo a passo]</li>
  <li><strong>Séries:</strong> [Número] x <strong>Repetições:</strong> [Número]</li>
  <li><strong>Observações:</strong> [Cuidados especiais]</li>
</ul>

<h2>Sinais de Alerta</h2>
<p>🚨 <strong>Procure ajuda imediatamente se apresentar:</strong></p>
<ul>
  <li>Dor intensa ou súbita</li>
  <li>Dormência ou formigamento</li>
  <li>Inchaço excessivo</li>
  <li>Perda de movimento</li>
</ul>

<hr>
<p><strong>Fisioterapeuta:</strong> [Nome]<br>
<strong>CREFITO:</strong> [Número]<br>
<strong>Contato:</strong> [Telefone/Email]</p>`
  },

  alta_fisioterapeutica: {
    name: 'Alta Fisioterapêutica',
    icon: CheckCircle,
    content: `<h1>Relatório de Alta Fisioterapêutica</h1>

<p><strong>Paciente:</strong> [Nome completo]<br>
<strong>Data de Nascimento:</strong> [DD/MM/AAAA]<br>
<strong>Diagnóstico:</strong> [CID-10 e descrição]<br>
<strong>Período de Tratamento:</strong> [Data início] a [Data fim]<br>
<strong>Total de Sessões:</strong> [Número]</p>

<h2>Resumo do Caso</h2>
<p>[Breve histórico da condição e tratamento]</p>

<h2>Evolução do Quadro</h2>

<h3>Avaliação Inicial</h3>
<ul>
  <li><strong>Dor (EVA):</strong> [Valor inicial]</li>
  <li><strong>ADM:</strong> [Limitações iniciais]</li>
  <li><strong>Força muscular:</strong> [Déficits iniciais]</li>
  <li><strong>Capacidade funcional:</strong> [Limitações]</li>
</ul>

<h3>Avaliação Final</h3>
<ul>
  <li><strong>Dor (EVA):</strong> [Valor final]</li>
  <li><strong>ADM:</strong> [Ganhos obtidos]</li>
  <li><strong>Força muscular:</strong> [Melhoras]</li>
  <li><strong>Capacidade funcional:</strong> [Progressos]</li>
</ul>

<h2>Objetivos Alcançados</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true">[Objetivo 1] - <strong>Atingido completamente</strong></li>
  <li data-type="taskItem" data-checked="true">[Objetivo 2] - <strong>Atingido parcialmente</strong></li>
  <li data-type="taskItem" data-checked="true">[Objetivo 3] - <strong>Atingido completamente</strong></li>
</ul>

<h2>Orientações para Continuidade</h2>
<h3>Exercícios de Manutenção</h3>
<ol>
  <li>[Exercício 1] - [Frequência]</li>
  <li>[Exercício 2] - [Frequência]</li>
  <li>[Exercício 3] - [Frequência]</li>
</ol>

<h2>Prognóstico</h2>
<p>[Expectativa de evolução e manutenção dos ganhos]</p>

<hr>
<p><strong>Fisioterapeuta Responsável:</strong> [Nome]<br>
<strong>CREFITO:</strong> [Número]<br>
<strong>Data da Alta:</strong> [DD/MM/AAAA]<br>
<strong>Assinatura:</strong> ___________________</p>

<blockquote>
<p>📋 <strong>Para o paciente:</strong> Mantenha este documento e siga as orientações. Em caso de dúvidas, entre em contato conosco.</p>
</blockquote>`
  }
}

interface AdvancedRichEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  editable?: boolean
  showToolbar?: boolean
  showTemplates?: boolean
  documentId?: string
  className?: string
}

export function AdvancedRichEditor({
  content = '',
  onChange,
  placeholder = 'Comece a escrever...',
  editable = true,
  showToolbar = true,
  showTemplates = true,
  documentId,
  className
}: AdvancedRichEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextStyle,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: 50000,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
      
      // Atualizar estatísticas
      const stats = editor.storage.characterCount
      setWordCount(stats.words())
      setCharCount(stats.characters())
      setReadingTime(Math.ceil(stats.words() / 200)) // 200 palavras por minuto
    },
  })

  // Funções do editor
  const insertTemplate = useCallback((template: any) => {
    if (editor) {
      editor.chain().focus().setContent(template.content).run()
      setShowTemplateDialog(false)
      toast.success(`Template "${template.name}" inserido com sucesso!`)
    }
  }, [editor])

  const insertTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  }, [editor])

  const insertImage = useCallback(() => {
    const url = window.prompt('URL da imagem:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const saveDocument = useCallback(async () => {
    if (editor && !isSaving) {
      setIsSaving(true)
      try {
        const content = editor.getHTML()
        // Simular salvamento
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success('Documento salvo com sucesso!')
      } catch (error) {
        toast.error('Erro ao salvar documento')
      } finally {
        setIsSaving(false)
      }
    }
  }, [editor, isSaving])

  const exportToPDF = useCallback(() => {
    if (editor) {
      const content = editor.getHTML()
      // Implementar exportação para PDF
      toast.success('Exportando para PDF...')
    }
  }, [editor])

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Toolbar */}
      {showToolbar && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Formatação básica */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant={editor.isActive('bold') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Negrito"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('italic') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Itálico"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('strike') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                title="Riscado"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('highlight') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                title="Destacar"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </div>

            {/* Títulos */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                title="Título 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Título 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                title="Título 3"
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Alinhamento */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                title="Alinhar à esquerda"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                title="Centralizar"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                title="Alinhar à direita"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Listas */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Lista com marcadores"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Lista numerada"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('taskList') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                title="Lista de tarefas"
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
            </div>

            {/* Inserções */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={insertTable}
                title="Inserir tabela"
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={insertImage}
                title="Inserir imagem"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                title="Citação"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Desfazer"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Refazer"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {/* Salvar e Exportar */}
            <div className="flex items-center gap-1 border-r pr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={saveDocument}
                disabled={isSaving}
                title="Salvar documento"
              >
                <Save className="h-4 w-4" />
                {isSaving && <span className="ml-1">...</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportToPDF}
                title="Exportar PDF"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Templates */}
            {showTemplates && (
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Templates de Fisioterapia</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(PHYSIO_TEMPLATES).map(([key, template]) => {
                      const IconComponent = template.icon
                      return (
                        <Card
                          key={key}
                          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => insertTemplate(template)}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-8 w-8 text-blue-600" />
                            <div>
                              <h3 className="font-medium">{template.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Template profissional para {template.name.toLowerCase()}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </Card>
      )}

      {/* Editor */}
      <Card className="relative">
        <div className="p-6">
          <EditorContent 
            editor={editor} 
            className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]"
          />
        </div>

        {/* Bubble Menu */}
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="flex items-center gap-1 bg-black text-white rounded-lg px-2 py-1 shadow-lg"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                "text-white hover:bg-gray-700 h-8 w-8 p-0",
                editor.isActive('bold') && "bg-gray-700"
              )}
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                "text-white hover:bg-gray-700 h-8 w-8 p-0",
                editor.isActive('italic') && "bg-gray-700"
              )}
            >
              <Italic className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={cn(
                "text-white hover:bg-gray-700 h-8 w-8 p-0",
                editor.isActive('highlight') && "bg-gray-700"
              )}
            >
              <Palette className="h-3 w-3" />
            </Button>
          </BubbleMenu>
        )}

        {/* Floating Menu */}
        {editor && (
          <FloatingMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="flex items-center gap-1 bg-white border rounded-lg px-2 py-1 shadow-lg"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Título 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Lista"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              title="Lista de tarefas"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Citação"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </FloatingMenu>
        )}
      </Card>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {wordCount} palavras
          </span>
          <span>{charCount} caracteres</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime} min de leitura
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Fisioterapia
          </Badge>
          {documentId && (
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Colaborativo
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
} 