import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Command, 
  Search, 
  Plus, 
  FileText, 
  FolderKanban,
  Users,
  Calendar,
  Settings,
  Bell,
  Download,
  Upload,
  Save,
  Copy,
  Trash2,
  Edit,
  Eye,
  Share,
  ArrowRight,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CommandAction {
  id: string
  title: string
  description: string
  category: string
  icon: React.ReactNode
  action: () => void
  keywords: string[]
  shortcut?: string[]
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredCommands, setFilteredCommands] = useState<CommandAction[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Definir comandos disponíveis
  const commands: CommandAction[] = [
    // Navegação
    {
      id: 'nav-dashboard',
      title: 'Ir para Dashboard',
      description: 'Visualizar estatísticas e resumo geral',
      category: 'Navegação',
      icon: <Command className="h-4 w-4" />,
      action: () => router.push('/'),
      keywords: ['dashboard', 'home', 'início', 'principal'],
      shortcut: ['G', 'H']
    },
    {
      id: 'nav-notebooks',
      title: 'Ir para Notebooks',
      description: 'Gerenciar documentos e protocolos',
      category: 'Navegação',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/notebooks'),
      keywords: ['notebooks', 'documentos', 'protocolos', 'notas'],
      shortcut: ['G', 'N']
    },
    {
      id: 'nav-projects',
      title: 'Ir para Projetos',
      description: 'Gerenciar projetos e tarefas',
      category: 'Navegação',
      icon: <FolderKanban className="h-4 w-4" />,
      action: () => router.push('/projects'),
      keywords: ['projetos', 'tarefas', 'kanban', 'gestão'],
      shortcut: ['G', 'P']
    },
    {
      id: 'nav-team',
      title: 'Ir para Equipe',
      description: 'Gerenciar mentores e estagiários',
      category: 'Navegação',
      icon: <Users className="h-4 w-4" />,
      action: () => router.push('/team'),
      keywords: ['equipe', 'mentores', 'estagiários', 'supervisão'],
      shortcut: ['G', 'T']
    },
    {
      id: 'nav-calendar',
      title: 'Ir para Calendário',
      description: 'Visualizar e agendar consultas',
      category: 'Navegação',
      icon: <Calendar className="h-4 w-4" />,
      action: () => router.push('/calendar'),
      keywords: ['calendário', 'agenda', 'consultas', 'horários'],
      shortcut: ['G', 'C']
    },
    {
      id: 'nav-settings',
      title: 'Ir para Configurações',
      description: 'Ajustar preferências e LGPD',
      category: 'Navegação',
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push('/settings'),
      keywords: ['configurações', 'ajustes', 'lgpd', 'privacidade'],
      shortcut: ['G', 'S']
    },

    // Criação
    {
      id: 'create-notebook',
      title: 'Novo Notebook',
      description: 'Criar um novo documento ou protocolo',
      category: 'Criação',
      icon: <Plus className="h-4 w-4" />,
      action: () => router.push('/notebooks?new=true'),
      keywords: ['novo', 'notebook', 'documento', 'protocolo', 'criar'],
      shortcut: ['⌘', 'N']
    },
    {
      id: 'create-project',
      title: 'Novo Projeto',
      description: 'Iniciar um novo projeto ou supervisão',
      category: 'Criação',
      icon: <FolderKanban className="h-4 w-4" />,
      action: () => router.push('/projects?new=true'),
      keywords: ['novo', 'projeto', 'supervisão', 'criar'],
      shortcut: ['⌘', 'Shift', 'P']
    },
    {
      id: 'create-appointment',
      title: 'Agendar Consulta',
      description: 'Marcar nova consulta ou sessão',
      category: 'Criação',
      icon: <Calendar className="h-4 w-4" />,
      action: () => router.push('/calendar?new=true'),
      keywords: ['agendar', 'consulta', 'sessão', 'horário', 'novo'],
      shortcut: ['⌘', 'Shift', 'A']
    },

    // Ações
    {
      id: 'search-global',
      title: 'Busca Global',
      description: 'Pesquisar em todo o sistema',
      category: 'Ações',
      icon: <Search className="h-4 w-4" />,
      action: () => {
        onClose()
        // Trigger global search
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
      },
      keywords: ['buscar', 'pesquisar', 'encontrar', 'procurar'],
      shortcut: ['⌘', 'K']
    },
    {
      id: 'notifications',
      title: 'Ver Notificações',
      description: 'Abrir painel de notificações',
      category: 'Ações',
      icon: <Bell className="h-4 w-4" />,
      action: () => {
        onClose()
        // Trigger notifications
        setTimeout(() => {
          const bellButton = document.querySelector('[data-notifications-trigger]') as HTMLButtonElement
          bellButton?.click()
        }, 100)
      },
      keywords: ['notificações', 'avisos', 'alertas', 'mensagens']
    },

    // Dados
    {
      id: 'export-data',
      title: 'Exportar Dados',
      description: 'Baixar dados pessoais (LGPD)',
      category: 'Dados',
      icon: <Download className="h-4 w-4" />,
      action: () => router.push('/settings?tab=lgpd'),
      keywords: ['exportar', 'baixar', 'dados', 'lgpd', 'backup']
    },
    {
      id: 'import-data',
      title: 'Importar Dados',
      description: 'Carregar dados de backup',
      category: 'Dados',
      icon: <Upload className="h-4 w-4" />,
      action: () => router.push('/settings?tab=profile'),
      keywords: ['importar', 'carregar', 'restaurar', 'backup']
    },

    // Sistema
    {
      id: 'keyboard-shortcuts',
      title: 'Ver Atalhos',
      description: 'Mostrar todos os atalhos de teclado',
      category: 'Sistema',
      icon: <Zap className="h-4 w-4" />,
      action: () => {
        onClose()
        setTimeout(() => {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
        }, 100)
      },
      keywords: ['atalhos', 'shortcuts', 'teclado', 'comandos'],
      shortcut: ['?']
    }
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length > 0) {
      const filtered = commands.filter(command =>
        command.title.toLowerCase().includes(query.toLowerCase()) ||
        command.description.toLowerCase().includes(query.toLowerCase()) ||
        command.keywords.some(keyword => 
          keyword.toLowerCase().includes(query.toLowerCase())
        )
      )
      setFilteredCommands(filtered)
      setSelectedIndex(0)
    } else {
      // Mostrar comandos mais usados quando não há busca
      const popularCommands = commands.filter(cmd => 
        ['nav-dashboard', 'nav-notebooks', 'create-notebook', 'search-global', 'keyboard-shortcuts'].includes(cmd.id)
      )
      setFilteredCommands(popularCommands)
      setSelectedIndex(0)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          onClose()
          setQuery('')
        }
        break
      case 'Escape':
        onClose()
        setQuery('')
        break
    }
  }

  const executeCommand = (command: CommandAction) => {
    command.action()
    onClose()
    setQuery('')
  }

  const categories = Array.from(new Set(filteredCommands.map(cmd => cmd.category)))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="flex items-start justify-center pt-20">
        <Card 
          className="w-full max-w-2xl mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center p-4 border-b bg-muted/30">
              <Command className="h-5 w-5 text-primary mr-3" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite um comando ou pesquise..."
                className="border-0 focus-visible:ring-0 text-lg bg-transparent"
              />
              <div className="flex items-center gap-1 ml-3 text-xs text-muted-foreground">
                <kbd className="px-2 py-1 bg-background rounded text-xs">⌘</kbd>
                <kbd className="px-2 py-1 bg-background rounded text-xs">P</kbd>
              </div>
            </div>

            {/* Commands */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Command className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum comando encontrado</p>
                </div>
              ) : (
                <div className="py-2">
                  {categories.map(category => (
                    <div key={category} className="mb-4">
                      <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide bg-muted/50">
                        {category}
                      </div>
                      {filteredCommands
                        .filter(cmd => cmd.category === category)
                        .map((command, index) => {
                          const globalIndex = filteredCommands.indexOf(command)
                          return (
                            <div
                              key={command.id}
                              className={`flex items-center p-3 mx-2 rounded-lg cursor-pointer transition-colors ${
                                globalIndex === selectedIndex 
                                  ? 'bg-primary/10 border border-primary/20' 
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => executeCommand(command)}
                            >
                              <div className="flex-shrink-0 mr-3 p-2 bg-muted rounded-lg">
                                {command.icon}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{command.title}</h4>
                                  {command.shortcut && (
                                    <div className="flex items-center gap-1">
                                      {command.shortcut.map((key, keyIndex) => (
                                        <React.Fragment key={keyIndex}>
                                          <kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">
                                            {key}
                                          </kbd>
                                          {keyIndex < command.shortcut!.length - 1 && (
                                            <span className="text-muted-foreground">+</span>
                                          )}
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {command.description}
                                </p>
                              </div>
                              
                              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            </div>
                          )
                        })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-3 bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded">↑↓</kbd>
                    <span>navegar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded">↵</kbd>
                    <span>executar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded">esc</kbd>
                    <span>fechar</span>
                  </div>
                </div>
                <div>
                  {filteredCommands.length} comando{filteredCommands.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Hook para gerenciar command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    openCommandPalette: () => setIsOpen(true),
    closeCommandPalette: () => setIsOpen(false)
  }
} 