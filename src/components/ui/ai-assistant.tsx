'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  useAIChat, 
  useWritingAssistant, 
  useSemanticSearchQuery,
  useAIRecommendations,
  usePredictiveInsights,
  useSentimentAnalysis,
  useAIAutoComplete,
  useAISummarization
} from '@/hooks/use-ai'
import {
  Bot,
  Send,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Search,
  Brain,
  TrendingUp,
  Lightbulb,
  Wand2,
  FileText,
  MessageSquare,
  Zap,
  Target,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Download,
  Share,
  BookOpen,
  PenTool,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/cn'

interface AIAssistantProps {
  className?: string
  initialMode?: 'chat' | 'writing' | 'search' | 'insights'
  context?: string
  isOpen?: boolean
  onClose?: () => void
  onMinimize?: () => void
  isMinimized?: boolean
}

// Hook para gerenciar o estado do AI Assistant
export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const openAssistant = () => {
    setIsOpen(true)
    setIsMinimized(false)
  }

  const closeAssistant = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const minimizeAssistant = () => {
    setIsMinimized(true)
  }

  const toggleAssistant = () => {
    if (isOpen) {
      closeAssistant()
    } else {
      openAssistant()
    }
  }

  return {
    isOpen,
    isMinimized,
    openAssistant,
    closeAssistant,
    minimizeAssistant,
    toggleAssistant
  }
}

const SYSTEM_PROMPTS = {
  general: `Você é um assistente inteligente especializado em fisioterapia e gestão clínica. 
           Ajude com notebooks, projetos, agendamentos e análises. 
           Seja conciso, prático e sempre focado na área da saúde.`,
  
  writing: `Você é um assistente de escrita especializado em documentação médica e fisioterapia.
            Ajude a melhorar textos, corrigir gramática e sugerir conteúdo relevante.
            Mantenha terminologia médica adequada e linguagem profissional.`,
  
  analysis: `Você é um analista de dados especializado em métricas de clínicas de fisioterapia.
             Interprete dados, identifique tendências e forneça insights acionáveis.
             Foque em KPIs relevantes para gestão clínica e performance da equipe.`,
}

export function AIAssistant({ 
  className, 
  initialMode = 'chat', 
  context,
  isOpen = false,
  onClose,
  onMinimize,
  isMinimized = false
}: AIAssistantProps) {
  const [mode, setMode] = useState(initialMode)
  const [isExpanded, setIsExpanded] = useState(false)
  const [writingText, setWritingText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Hooks de IA
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading: chatLoading,
    clearChat,
    append
  } = useAIChat(SYSTEM_PROMPTS.general)

  const { 
    improveText, 
    generateSuggestions, 
    checkGrammar, 
    isLoading: writingLoading 
  } = useWritingAssistant()

  const { search, isSearching } = useSemanticSearchQuery()
  const { data: recommendations } = useAIRecommendations()
  const { data: insights } = usePredictiveInsights()
  const { analyzeSentiment, isAnalyzing } = useSentimentAnalysis()
  const { getCompletions } = useAIAutoComplete()
  const { summarize, isLoading: summaryLoading } = useAISummarization()

  // Auto scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Síntese de voz
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // Reconhecimento de voz
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = 'pt-BR'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        if (mode === 'chat') {
          append({ role: 'user', content: transcript })
        } else if (mode === 'writing') {
          setWritingText(prev => prev + ' ' + transcript)
        } else if (mode === 'search') {
          setSearchQuery(transcript)
        }
      }

      recognition.start()
    } else {
      toast.error('Reconhecimento de voz não suportado neste navegador')
    }
  }

  // Handlers
  const handleImproveText = async () => {
    if (!writingText.trim()) return
    
    try {
      const improved = await improveText(writingText, context)
      setWritingText(improved)
      toast.success('Texto melhorado com sucesso!')
    } catch (error) {
      toast.error('Erro ao melhorar texto')
    }
  }

  const handleGenerateSuggestions = async () => {
    if (!writingText.trim()) return
    
    try {
      const suggestions = await generateSuggestions(writingText, 'notebook')
      // Mostrar sugestões em um modal ou lista
      toast.success(`${suggestions.length} sugestões geradas!`)
    } catch (error) {
      toast.error('Erro ao gerar sugestões')
    }
  }

  const handleSemanticSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      const results = await search(searchQuery)
      // Processar e mostrar resultados
      toast.success(`${results.length} resultados encontrados!`)
    } catch (error) {
      toast.error('Erro na busca semântica')
    }
  }

  const handleSummarize = async () => {
    if (!writingText.trim()) return
    
    try {
      const summary = await summarize(writingText, 'brief')
      // Mostrar resumo
      toast.success('Resumo gerado com sucesso!')
    } catch (error) {
      toast.error('Erro ao gerar resumo')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para a área de transferência!')
  }

  // Use external control quando fornecido, senão use estado interno
  const isAssistantOpen = isOpen !== undefined ? isOpen : isExpanded
  const handleClose = onClose || (() => setIsExpanded(false))
  const handleMinimize = onMinimize || (() => setIsExpanded(false))

  if (!isAssistantOpen) {
    return (
      <motion.div
        className={cn("fixed bottom-4 right-4 z-50", className)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsExpanded(true)}
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn("fixed bottom-4 right-4 z-50", className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Card className="w-96 h-[600px] flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-semibold">AI Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <Button size="sm" variant="ghost" onClick={stopSpeaking}>
                <VolumeX className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleClose}>
              ×
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 m-2">
            <TabsTrigger value="chat" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="writing" className="text-xs">
              <PenTool className="h-3 w-3 mr-1" />
              Escrita
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs">
              <Search className="h-3 w-3 mr-1" />
              Busca
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.filter(m => m.role !== 'system').map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-muted'
                  )}>
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={atomOneDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            )
                          }
                        }}
                        className="prose prose-sm max-w-none"
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-muted-foreground/20">
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(message.content)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => speak(message.content)}>
                          <Volume2 className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">U</span>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {chatLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Digite sua mensagem..."
                  disabled={chatLoading}
                  className="flex-1"
                />
                <Button size="sm" onClick={startListening} disabled={isListening}>
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button type="submit" size="sm" disabled={chatLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="flex justify-between items-center mt-2">
                <Button size="sm" variant="ghost" onClick={clearChat}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
                <span className="text-xs text-muted-foreground">
                  {messages.filter(m => m.role !== 'system').length} mensagens
                </span>
              </div>
            </div>
          </TabsContent>

          {/* Writing Tab */}
          <TabsContent value="writing" className="flex-1 flex flex-col p-4">
            <div className="space-y-4 flex-1">
              <Textarea
                value={writingText}
                onChange={(e) => setWritingText(e.target.value)}
                placeholder="Cole ou digite seu texto aqui para melhorar, corrigir ou analisar..."
                className="min-h-[200px] resize-none"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm" 
                  onClick={handleImproveText}
                  disabled={writingLoading || !writingText.trim()}
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Melhorar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleGenerateSuggestions}
                  disabled={writingLoading || !writingText.trim()}
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Sugestões
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => checkGrammar(writingText)}
                  disabled={writingLoading || !writingText.trim()}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Gramática
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleSummarize}
                  disabled={summaryLoading || !writingText.trim()}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Resumir
                </Button>
              </div>
              
              {writingLoading && (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Processando...</span>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="flex-1 flex flex-col p-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca semântica inteligente..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch()}
                />
                <Button 
                  size="sm"
                  onClick={handleSemanticSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {isSearching && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Buscando...</span>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                💡 Use busca semântica para encontrar conteúdo relacionado por significado, não apenas palavras-chave.
              </div>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="flex-1 flex flex-col p-4">
            <div className="space-y-4">
              {/* Recomendações */}
              {recommendations && recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    Recomendações
                  </h4>
                  <div className="space-y-2">
                    {recommendations.slice(0, 3).map((rec) => (
                      <Card key={rec.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{rec.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                          </div>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                            {rec.confidence}%
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights Preditivos */}
              {insights && insights.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Insights Preditivos
                  </h4>
                  <div className="space-y-2">
                    {insights.slice(0, 2).map((insight) => (
                      <Card key={insight.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{insight.prediction}</p>
                            <p className="text-xs text-muted-foreground mt-1">{insight.timeframe}</p>
                          </div>
                          <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                            {insight.confidence}%
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  )
} 