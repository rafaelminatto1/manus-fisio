'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect, lazy, Suspense } from 'react'
import { X, Send, Loader2, Copy, ChevronDown, MessageSquare, Brain, BarChart3, Sparkles, User, Bot } from 'lucide-react'
import { useAIAssistant } from '@/contexts/AIAssistantContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { AIErrorBoundary } from '@/components/ui/error-boundary'

// Lazy load heavy components
const ReactMarkdown = lazy(() => import('react-markdown'))
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter').then(module => ({ default: module.Prism })))

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  patientId?: string
  projectId?: string
  contextType?: 'general' | 'patient_analysis' | 'treatment_planning'
}

// Memoized message component for better performance
const MessageComponent = React.memo(({ 
  message, 
  onCopy, 
  isLatest 
}: { 
  message: any
  onCopy: (content: string) => void
  isLatest: boolean
}) => {
  const isUser = message.role === 'user'
  const timestamp = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className={cn(
      "flex gap-3 p-3 rounded-lg transition-colors",
      isUser ? "bg-primary/5 ml-8" : "bg-muted/30 mr-8"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isUser ? 'Você' : 'Assistente IA'} • {timestamp}
          </span>
          
          {message.metadata?.confidence && (
            <Badge variant="outline" className="text-xs">
              Confiança: {Math.round(message.metadata.confidence * 100)}%
            </Badge>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <Suspense fallback={<div className="text-sm">{message.content}</div>}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </Suspense>
        </div>
        
        {message.metadata?.type && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {message.metadata.type === 'recommendation' && <Brain className="w-3 h-3" />}
            {message.metadata.type === 'analysis' && <BarChart3 className="w-3 h-3" />}
            {message.metadata.type === 'insight' && <Sparkles className="w-3 h-3" />}
            <span className="capitalize">{message.metadata.type}</span>
          </div>
        )}
        
        {message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <strong>Fontes:</strong> {message.metadata.sources.join(', ')}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {message.metadata?.keywords && message.metadata.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {message.metadata.keywords.slice(0, 3).map((keyword: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy(message.content)}
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copiar mensagem</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
})

MessageComponent.displayName = 'MessageComponent'

// Memoized quick actions component
const QuickActions = React.memo(({ 
  onAction, 
  patientId, 
  disabled 
}: { 
  onAction: (message: string) => void
  patientId?: string
  disabled: boolean
}) => {
  const actions = useMemo(() => [
    {
      label: 'Insights do Paciente',
      message: patientId 
        ? `Gere insights sobre o paciente ${patientId}` 
        : 'Como posso analisar o progresso de um paciente?',
      icon: Brain,
      enabled: true
    },
    {
      label: 'Recomendações',
      message: 'Quais exercícios você recomenda para dor lombar?',
      icon: Sparkles,
      enabled: true
    },
    {
      label: 'Analytics',
      message: 'Mostre um resumo dos dados de desempenho da clínica',
      icon: BarChart3,
      enabled: true
    }
  ], [patientId])

  return (
    <div className="grid grid-cols-1 gap-2 p-3 border-t">
      <div className="text-xs font-medium text-muted-foreground mb-2">
        Ações Rápidas
      </div>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.message)}
          disabled={disabled || !action.enabled}
          className="justify-start h-8 text-xs"
        >
          <action.icon className="w-3 h-3 mr-2" />
          {action.label}
        </Button>
      ))}
    </div>
  )
})

QuickActions.displayName = 'QuickActions'

export const AIAssistant = React.memo<AIAssistantProps>(({ 
  isOpen, 
  onClose, 
  className,
  patientId,
  projectId,
  contextType = 'general'
}) => {
  const { 
    state, 
    sendMessage, 
    createConversation, 
    setActiveConversation,
    getActiveConversation 
  } = useAIAssistant()
  
  const [inputMessage, setInputMessage] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Memoized active conversation
  const activeConversation = useMemo(() => {
    return getActiveConversation()
  }, [state.activeConversationId, state.conversations, getActiveConversation])

  // Memoized messages
  const messages = useMemo(() => {
    return activeConversation?.messages || []
  }, [activeConversation?.messages])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    })
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      // Delay scroll to ensure DOM is updated
      const timeoutId = setTimeout(scrollToBottom, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [messages.length, scrollToBottom])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [isOpen])

  // Create conversation if none exists
  useEffect(() => {
    if (isOpen && !activeConversation) {
      const context = {
        patientId,
        projectId,
        type: contextType
      }
      createConversation('Nova Conversa', context)
    }
  }, [isOpen, activeConversation, createConversation, patientId, projectId, contextType])

  // Memoized handlers
  const handleSendMessage = useCallback(async () => {
    const message = inputMessage.trim()
    if (!message || state.isLoading) return

    setInputMessage('')
    setShowQuickActions(false)
    
    try {
      await sendMessage(message)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }, [inputMessage, state.isLoading, sendMessage])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const handleQuickAction = useCallback((message: string) => {
    setInputMessage(message)
    setShowQuickActions(false)
    // Auto-send quick actions
    setTimeout(() => {
      if (inputRef.current) {
        handleSendMessage()
      }
    }, 100)
  }, [handleSendMessage])

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      // You could add a toast notification here
      console.log('Mensagem copiada!')
    }).catch(console.error)
  }, [])

  // Memoized conversation title
  const conversationTitle = useMemo(() => {
    if (contextType === 'patient_analysis' && patientId) {
      return `Análise - Paciente ${patientId}`
    }
    if (contextType === 'treatment_planning') {
      return 'Planejamento de Tratamento'
    }
    return 'Assistente IA'
  }, [contextType, patientId])

  if (!isOpen) return null

  return (
    <AIErrorBoundary>
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-96 bg-background border-l shadow-2xl",
        "transform transition-transform duration-300 ease-in-out",
        "flex flex-col max-h-screen",
        "lg:w-[420px]",
        className
      )}>
        {/* Header */}
        <Card className="rounded-none border-0 border-b">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">
                    {conversationTitle}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {state.isLoading ? 'Digitando...' : 'Online'}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Messages */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1 p-3"
          >
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">
                    Olá! Como posso ajudar você hoje?
                  </p>
                  <p className="text-xs mt-2">
                    Faça perguntas sobre fisioterapia, análise de pacientes ou gestão da clínica.
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <MessageComponent
                    key={message.id}
                    message={message}
                    onCopy={handleCopyMessage}
                    isLatest={index === messages.length - 1}
                  />
                ))
              )}
              
              {state.isLoading && (
                <div className="flex gap-3 p-3 rounded-lg bg-muted/30 mr-8">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Processando sua solicitação...
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          {showQuickActions && messages.length === 0 && (
            <QuickActions
              onAction={handleQuickAction}
              patientId={patientId}
              disabled={state.isLoading}
            />
          )}

          {/* Error Display */}
          {state.error && (
            <div className="p-3 border-t bg-destructive/10">
              <p className="text-sm text-destructive">
                {state.error}
              </p>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t bg-background">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                disabled={state.isLoading}
                className="flex-1"
                maxLength={2000}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || state.isLoading}
                size="sm"
                className="px-3"
              >
                {state.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {inputMessage.length > 1800 && (
              <p className="text-xs text-muted-foreground mt-1">
                {2000 - inputMessage.length} caracteres restantes
              </p>
            )}
          </div>
        </div>
      </div>
    </AIErrorBoundary>
  )
})

AIAssistant.displayName = 'AIAssistant'

export default AIAssistant