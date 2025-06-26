import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Brain, 
  Sparkles, 
  X, 
  Filter,
  Clock,
  FileText,
  Users,
  FolderKanban,
  Calendar,
  Zap,
  ArrowRight,
  Star,
  TrendingUp,
  Mic,
  MicOff
} from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  content: string
  type: 'notebook' | 'project' | 'user' | 'event' | 'template'
  relevance: number
  aiSummary?: string
  lastModified: Date
  tags: string[]
  author?: string
  path: string
}

interface AISearchProps {
  isOpen: boolean
  onClose: () => void
}

export function AISearch({ isOpen, onClose }: AISearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchType, setSearchType] = useState<'all' | 'semantic' | 'recent'>('all')
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Protocolo de Reabilitação - TMJ',
      content: 'Protocolo completo para tratamento de disfunção temporomandibular incluindo exercícios de mobilização, fortalecimento e técnicas de relaxamento...',
      type: 'notebook',
      relevance: 95,
      aiSummary: 'Este protocolo é altamente relevante para casos de TMJ, incluindo 15 exercícios específicos e cronograma de 6 semanas.',
      lastModified: new Date(Date.now() - 86400000),
      tags: ['TMJ', 'reabilitação', 'exercícios', 'protocolo'],
      author: 'Dr. Rafael Santos',
      path: '/notebooks/tmj-protocol'
    },
    {
      id: '2',
      title: 'Projeto: Eficácia de Exercícios Proprioceptivos',
      content: 'Estudo sobre a eficácia de exercícios proprioceptivos na reabilitação de lesões de tornozelo em atletas...',
      type: 'project',
      relevance: 88,
      aiSummary: 'Pesquisa com 45 atletas mostrando 78% de melhora na estabilidade com exercícios proprioceptivos.',
      lastModified: new Date(Date.now() - 172800000),
      tags: ['propriocepção', 'tornozelo', 'atletas', 'pesquisa'],
      author: 'Dra. Maria Costa',
      path: '/projects/proprioceptive-study'
    },
    {
      id: '3',
      title: 'Ana Silva - Estagiária',
      content: 'Estagiária de fisioterapia especializada em neurologia, atualmente supervisionada por Dr. Carlos Lima...',
      type: 'user',
      relevance: 82,
      aiSummary: 'Estagiária com excelente desempenho em neurologia, 85% de progresso na supervisão.',
      lastModified: new Date(Date.now() - 259200000),
      tags: ['estagiária', 'neurologia', 'supervisão'],
      author: 'Sistema',
      path: '/team/ana-silva'
    },
    {
      id: '4',
      title: 'Template: Avaliação Postural',
      content: 'Template padronizado para avaliação postural incluindo medições angulares, testes funcionais e análise biomecânica...',
      type: 'template',
      relevance: 76,
      aiSummary: 'Template completo com 12 testes posturais e sistema de pontuação automática.',
      lastModified: new Date(Date.now() - 345600000),
      tags: ['avaliação', 'postura', 'biomecânica', 'template'],
      author: 'Dr. Rafael Santos',
      path: '/templates/postural-assessment'
    }
  ]

  // Smart suggestions based on context
  const smartSuggestions = [
    'Protocolos de reabilitação para joelho',
    'Exercícios para lombalgia crônica',
    'Avaliação neurológica pediátrica',
    'Supervisão de estagiários',
    'Relatórios de progresso',
    'Templates de avaliação',
    'Pesquisas em andamento',
    'Cronograma de supervisões'
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query)
    } else {
      setResults([])
      setSuggestions(smartSuggestions.slice(0, 4))
    }
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true)
    
    // Simulate AI-powered search
    setTimeout(() => {
      const filteredResults = mockResults
        .filter(result => 
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => b.relevance - a.relevance)

      // Add AI-enhanced results based on search type
      if (searchType === 'semantic') {
        // Simulate semantic search enhancements
        filteredResults.forEach(result => {
          result.aiSummary = `IA: ${result.aiSummary || 'Resultado relevante baseado em análise semântica do conteúdo.'}`
        })
      }

      setResults(filteredResults)
      setIsSearching(false)
    }, 800)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'notebook': return <FileText className="h-4 w-4 text-blue-500" />
      case 'project': return <FolderKanban className="h-4 w-4 text-green-500" />
      case 'user': return <Users className="h-4 w-4 text-purple-500" />
      case 'event': return <Calendar className="h-4 w-4 text-orange-500" />
      case 'template': return <Star className="h-4 w-4 text-yellow-500" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'notebook': return 'Notebook'
      case 'project': return 'Projeto'
      case 'user': return 'Usuário'
      case 'event': return 'Evento'
      case 'template': return 'Template'
      default: return type
    }
  }

  const handleResultClick = (result: SearchResult) => {
    console.log('Navigating to:', result.path)
    // Implement navigation logic here
    onClose()
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    // Implement voice search here
    if (!isListening) {
      console.log('Starting voice search...')
    } else {
      console.log('Stopping voice search...')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="flex items-start justify-center min-h-screen p-4 pt-20">
        <Card 
          className="w-full max-w-4xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Busca Inteligente
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                  <Sparkles className="h-3 w-3 mr-1" />
                  IA
                </Badge>
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search Input */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquise protocolos, projetos, usuários ou qualquer conteúdo..."
                  className="pl-10 pr-12 h-12 text-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              
              {/* Search Type Filters */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant={searchType === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchType('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={searchType === 'semantic' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchType('semantic')}
                  className="flex items-center gap-1"
                >
                  <Brain className="h-3 w-3" />
                  Semântica
                </Button>
                <Button
                  variant={searchType === 'recent' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchType('recent')}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  Recentes
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-y-auto max-h-96">
            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-muted-foreground">IA analisando conteúdo...</span>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {!query && suggestions.length > 0 && (
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Sugestões Inteligentes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="justify-start text-left h-auto p-3"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="space-y-1">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium truncate">{result.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(result.type)}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            {result.relevance}%
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {result.content}
                        </p>
                        
                        {result.aiSummary && (
                          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                Resumo IA
                              </span>
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {result.aiSummary}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {result.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {result.author && <span>{result.author}</span>}
                            <span>•</span>
                            <span>{result.lastModified.toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {query && !isSearching && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum resultado encontrado para "{query}"</p>
                <p className="text-sm mt-1">Tente termos diferentes ou use a busca semântica</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Hook para gerenciar busca com IA
export function useAISearch() {
  const [isOpen, setIsOpen] = useState(false)

  return {
    isOpen,
    openSearch: () => setIsOpen(true),
    closeSearch: () => setIsOpen(false),
    toggleSearch: () => setIsOpen(prev => !prev)
  }
} 