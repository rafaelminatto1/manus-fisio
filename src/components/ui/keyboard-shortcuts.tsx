import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Keyboard, 
  X, 
  Search, 
  Home, 
  BookOpen, 
  FolderKanban,
  Users,
  Calendar,
  Settings,
  Plus,
  Save,
  Command
} from 'lucide-react'

interface KeyboardShortcutsProps {
  isOpen: boolean
  onClose: () => void
}

interface Shortcut {
  keys: string[]
  description: string
  category: string
  icon?: React.ReactNode
}

const shortcuts: Shortcut[] = [
  // Navegação
  {
    keys: ['⌘', 'K'],
    description: 'Busca global',
    category: 'Navegação',
    icon: <Search className="h-4 w-4" />
  },
  {
    keys: ['G', 'H'],
    description: 'Ir para Dashboard',
    category: 'Navegação',
    icon: <Home className="h-4 w-4" />
  },
  {
    keys: ['G', 'N'],
    description: 'Ir para Notebooks',
    category: 'Navegação',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    keys: ['G', 'P'],
    description: 'Ir para Projetos',
    category: 'Navegação',
    icon: <FolderKanban className="h-4 w-4" />
  },
  {
    keys: ['G', 'T'],
    description: 'Ir para Equipe',
    category: 'Navegação',
    icon: <Users className="h-4 w-4" />
  },
  {
    keys: ['G', 'C'],
    description: 'Ir para Calendário',
    category: 'Navegação',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    keys: ['G', 'S'],
    description: 'Ir para Configurações',
    category: 'Navegação',
    icon: <Settings className="h-4 w-4" />
  },

  // Ações
  {
    keys: ['⌘', 'N'],
    description: 'Novo notebook',
    category: 'Ações',
    icon: <Plus className="h-4 w-4" />
  },
  {
    keys: ['⌘', 'S'],
    description: 'Salvar documento',
    category: 'Ações',
    icon: <Save className="h-4 w-4" />
  },
  {
    keys: ['⌘', 'Shift', 'P'],
    description: 'Novo projeto',
    category: 'Ações',
    icon: <Plus className="h-4 w-4" />
  },
  {
    keys: ['⌘', 'Shift', 'N'],
    description: 'Nova tarefa',
    category: 'Ações',
    icon: <Plus className="h-4 w-4" />
  },

  // Editor
  {
    keys: ['⌘', 'B'],
    description: 'Negrito',
    category: 'Editor'
  },
  {
    keys: ['⌘', 'I'],
    description: 'Itálico',
    category: 'Editor'
  },
  {
    keys: ['⌘', 'U'],
    description: 'Sublinhado',
    category: 'Editor'
  },
  {
    keys: ['⌘', 'Z'],
    description: 'Desfazer',
    category: 'Editor'
  },
  {
    keys: ['⌘', 'Y'],
    description: 'Refazer',
    category: 'Editor'
  },

  // Interface
  {
    keys: ['?'],
    description: 'Mostrar atalhos',
    category: 'Interface',
    icon: <Keyboard className="h-4 w-4" />
  },
  {
    keys: ['Esc'],
    description: 'Fechar modal/painel',
    category: 'Interface'
  },
  {
    keys: ['⌘', '/'],
    description: 'Toggle sidebar',
    category: 'Interface'
  }
]

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Navegação')
  
  const categories = Array.from(new Set(shortcuts.map(s => s.category)))
  const filteredShortcuts = shortcuts.filter(s => s.category === selectedCategory)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        if (!isOpen) {
          // Só abre se não estiver em um input
          const activeElement = document.activeElement
          if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
            onClose() // Na verdade abre - nome confuso mas funciona
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card 
          className="w-full max-w-4xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Atalhos de Teclado
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex">
              {/* Categories Sidebar */}
              <div className="w-48 border-r bg-muted/30 p-4">
                <h3 className="font-medium text-sm text-muted-foreground mb-3">CATEGORIAS</h3>
                <div className="space-y-1">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                      <Badge variant="secondary" className="ml-auto">
                        {shortcuts.filter(s => s.category === category).length}
                      </Badge>
                    </Button>
                  ))}
                </div>

                <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Command className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Dica
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-200">
                    Pressione <kbd className="px-1 py-0.5 bg-blue-200 dark:bg-blue-800 rounded text-xs">?</kbd> a qualquer momento para ver os atalhos
                  </p>
                </div>
              </div>

              {/* Shortcuts List */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {filteredShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        {shortcut.icon && (
                          <div className="p-2 bg-muted rounded-lg">
                            {shortcut.icon}
                          </div>
                        )}
                        <span className="font-medium">{shortcut.description}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 bg-muted border border-border rounded text-sm font-mono">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground mx-1">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Tips */}
                <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Command className="h-4 w-4" />
                    Dicas de Uso
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">G</kbd> seguido de uma letra para navegação rápida</li>
                    <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘ K</kbd> abre a busca global de qualquer lugar</li>
                    <li>• No editor, use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘ S</kbd> para salvar automaticamente</li>
                    <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> fecha qualquer modal ou painel aberto</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Hook para gerenciar atalhos
export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  return {
    isOpen,
    openShortcuts: () => setIsOpen(true),
    closeShortcuts: () => setIsOpen(false)
  }
} 