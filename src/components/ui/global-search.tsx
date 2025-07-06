import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  FileText, 
  Users, 
  FolderKanban, 
  Calendar,
  Settings,
  Clock,
  ArrowRight,
  Command
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  title: string
  description: string
  type: 'notebook' | 'project' | 'user' | 'calendar' | 'setting'
  url: string
  lastModified?: Date
  tags?: string[]
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Mock search results - em produção seria conectado ao Supabase
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Protocolo de Reabilitação - Joelho',
      description: 'Protocolo completo para reabilitação pós-cirúrgica de joelho',
      type: 'notebook',
      url: '/notebooks/1',
      lastModified: new Date(Date.now() - 1000 * 60 * 30),
      tags: ['protocolo', 'joelho', 'reabilitação']
    },
    {
      id: '2',
      title: 'Projeto Supervisão Estagiários',
      description: 'Gestão e acompanhamento dos estagiários de fisioterapia',
      type: 'project',
      url: '/projects/2',
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2),
      tags: ['supervisão', 'estagiários']
    },
    {
      id: '3',
      title: 'Dr. Maria Santos',
      description: 'Fisioterapeuta especialista em neurologia - Mentor',
      type: 'user',
      url: '/team',
      tags: ['mentor', 'neurologia']
    },
    {
      id: '4',
      title: 'Consulta com João Silva',
      description: 'Sessão de fisioterapia agendada para hoje às 14h',
      type: 'calendar',
      url: '/calendar',
      lastModified: new Date(Date.now() + 1000 * 60 * 60 * 2),
      tags: ['consulta', 'hoje']
    },
    {
      id: '5',
      title: 'Configurações LGPD',
      description: 'Gerenciar consentimentos e privacidade dos dados',
      type: 'setting',
      url: '/settings',
      tags: ['lgpd', 'privacidade']
    }
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length > 2) {
      setLoading(true)
      // Simular delay de busca
      const timer = setTimeout(() => {
        const filtered = mockResults.filter(result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase()) ||
          result.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
        setResults(filtered)
        setSelectedIndex(0)
        setLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelectResult(results[selectedIndex])
        }
        break
      case 'Escape':
        onClose()
        break
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.url)
    onClose()
    setQuery('')
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'notebook':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'project':
        return <FolderKanban className="h-4 w-4 text-green-500" />
      case 'user':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'calendar':
        return <Calendar className="h-4 w-4 text-orange-500" />
      case 'setting':
        return <Settings className="h-4 w-4 text-gray-500" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      notebook: 'Notebook',
      project: 'Projeto',
      user: 'Usuário',
      calendar: 'Calendário',
      setting: 'Configuração'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="flex items-start justify-center pt-20">
        <Card 
          className="w-full max-w-2xl mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-0">
            {/* Search Input */}
            <div className="flex items-center p-4 border-b">
              <Search className="h-5 w-5 text-muted-foreground mr-3" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar notebooks, projetos, usuários..."
                className="border-0 focus-visible:ring-0 text-lg"
              />
              <div className="flex items-center gap-1 ml-3 text-xs text-muted-foreground">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘</kbd>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">K</kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent mx-auto mb-2" />
                  Buscando...
                </div>
              )}

              {!loading && query.length > 2 && results.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum resultado encontrado para "{query}"</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="py-2">
                  {results.map((result, index) => (
                    <div
                      key={result.id}
                      className={`flex items-center p-3 mx-2 rounded-lg cursor-pointer transition-colors ${
                        index === selectedIndex 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectResult(result)}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{result.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(result.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </p>
                        
                        {result.tags && (
                          <div className="flex items-center gap-1 mt-2">
                            {result.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {result.lastModified && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {result.lastModified > new Date() 
                              ? `Em ${Math.ceil((result.lastModified.getTime() - Date.now()) / (1000 * 60 * 60))}h`
                              : `Há ${Math.ceil((Date.now() - result.lastModified.getTime()) / (1000 * 60))} min`
                            }
                          </div>
                        )}
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {query.length <= 2 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Command className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">Digite pelo menos 3 caracteres para buscar</p>
                  <div className="text-xs space-y-1">
                    <p>• Notebooks e protocolos</p>
                    <p>• Projetos e tarefas</p>
                    <p>• Usuários e equipe</p>
                    <p>• Eventos e configurações</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-3 bg-muted/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">↑↓</kbd>
                    <span>navegar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">↵</kbd>
                    <span>selecionar</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">esc</kbd>
                    <span>fechar</span>
                  </div>
                </div>
                <div className="text-xs">
                  {results.length > 0 && `${results.length} resultado${results.length !== 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Hook para atalho de teclado global
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    openSearch: () => setIsOpen(true),
    closeSearch: () => setIsOpen(false)
  }
} 