import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Lightbulb,
  FileText,
  Users,
  Calendar,
  Zap,
  Brain,
  Heart,
  Activity,
  Target,
  BookOpen,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Star
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  actions?: Array<{
    label: string
    action: string
    icon?: React.ReactNode
  }>
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
  isMinimized: boolean
}

export function AIAssistant({ isOpen, onClose, onMinimize, isMinimized }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Olá! Sou o Manus AI, seu assistente especializado em fisioterapia. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
      suggestions: [
        'Criar protocolo de reabilitação',
        'Sugerir exercícios para lombalgia',
        'Agendar supervisão de estagiário',
        'Revisar relatório de progresso'
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Predefined responses for physiotherapy context
  const aiResponses = {
    'protocolo': {
      content: 'Posso ajudá-lo a criar um protocolo de reabilitação personalizado. Para qual condição específica você precisa? Por exemplo: lesão de joelho, AVC, lombalgia, ou outra condição?',
      suggestions: ['Protocolo para joelho', 'Protocolo neurológico', 'Protocolo lombar', 'Protocolo ombro'],
      actions: [
        { label: 'Abrir Templates', action: 'open-templates', icon: <FileText className="h-4 w-4" /> },
        { label: 'Ver Protocolos Existentes', action: 'view-protocols', icon: <BookOpen className="h-4 w-4" /> }
      ]
    },
    'exercícios': {
      content: 'Claro! Posso sugerir exercícios específicos baseados na condição do paciente. Qual é a área de foco? Tenho protocolos para fortalecimento, mobilidade, equilíbrio e condicionamento cardiovascular.',
      suggestions: ['Exercícios para lombar', 'Fortalecimento de joelho', 'Mobilidade de ombro', 'Equilíbrio para idosos'],
      actions: [
        { label: 'Biblioteca de Exercícios', action: 'exercise-library', icon: <Activity className="h-4 w-4" /> },
        { label: 'Criar Plano Personalizado', action: 'create-plan', icon: <Target className="h-4 w-4" /> }
      ]
    },
    'agendar': {
      content: 'Vou ajudá-lo com o agendamento. Que tipo de compromisso você precisa marcar? Posso sugerir horários disponíveis baseados na agenda atual.',
      suggestions: ['Supervisão de estagiário', 'Avaliação de paciente', 'Reunião de equipe', 'Sessão de tratamento'],
      actions: [
        { label: 'Abrir Calendário', action: 'open-calendar', icon: <Calendar className="h-4 w-4" /> },
        { label: 'Ver Disponibilidade', action: 'check-availability', icon: <Users className="h-4 w-4" /> }
      ]
    },
    'relatório': {
      content: 'Posso auxiliar na elaboração de relatórios de progresso. Que tipo de relatório você precisa? Tenho templates para evolução de pacientes, avaliação de estagiários e relatórios de supervisão.',
      suggestions: ['Relatório de evolução', 'Avaliação de estagiário', 'Relatório de supervisão', 'Relatório LGPD'],
      actions: [
        { label: 'Templates de Relatório', action: 'report-templates', icon: <FileText className="h-4 w-4" /> },
        { label: 'Gerar Relatório', action: 'generate-report', icon: <Zap className="h-4 w-4" /> }
      ]
    },
    'default': {
      content: 'Entendi! Como especialista em fisioterapia, posso ajudá-lo com protocolos de reabilitação, sugestões de exercícios, agendamentos, relatórios e muito mais. O que você gostaria de fazer?',
      suggestions: ['Criar protocolo', 'Sugerir exercícios', 'Agendar compromisso', 'Gerar relatório'],
      actions: [
        { label: 'Explorar Funcionalidades', action: 'explore-features', icon: <Lightbulb className="h-4 w-4" /> }
      ]
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate AI processing
    setTimeout(() => {
      const response = generateAIResponse(messageText)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 1500)
  }

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase()
    
    let responseData = aiResponses.default
    
    if (lowerMessage.includes('protocolo') || lowerMessage.includes('reabilitação')) {
      responseData = aiResponses.protocolo
    } else if (lowerMessage.includes('exercício') || lowerMessage.includes('exercitar')) {
      responseData = aiResponses.exercícios
    } else if (lowerMessage.includes('agendar') || lowerMessage.includes('marcar') || lowerMessage.includes('horário')) {
      responseData = aiResponses.agendar
    } else if (lowerMessage.includes('relatório') || lowerMessage.includes('relatório') || lowerMessage.includes('progresso')) {
      responseData = aiResponses.relatório
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: responseData.content,
      timestamp: new Date(),
      suggestions: responseData.suggestions,
      actions: responseData.actions
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion)
  }

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action)
    // Implement action handlers here
    const actionMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Ação "${action}" executada com sucesso! Como posso ajudá-lo mais?`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, actionMessage])
  }

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    // Implement speech recognition here
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Chat limpo! Como posso ajudá-lo agora?',
        timestamp: new Date(),
        suggestions: [
          'Criar protocolo de reabilitação',
          'Sugerir exercícios',
          'Agendar supervisão',
          'Gerar relatório'
        ]
      }
    ])
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'} shadow-2xl`}>
        {/* Header */}
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="relative">
                <Bot className="h-6 w-6 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              Manus AI
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={toggleVoice}>
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onMinimize}>
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 p-4 overflow-y-auto max-h-96">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      
                      {/* Suggestions */}
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium opacity-80">Sugestões:</div>
                          <div className="flex flex-wrap gap-1">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Actions */}
                      {message.actions && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium opacity-80">Ações rápidas:</div>
                          <div className="space-y-1">
                            {message.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs h-8"
                                onClick={() => handleActionClick(action.action)}
                              >
                                {action.icon}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">Manus AI está digitando...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={clearChat}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <div className="text-xs text-muted-foreground flex-1">
                  Especialista em fisioterapia • Sempre atualizado
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Digite sua pergunta sobre fisioterapia..."
                    className="pr-10"
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
                <Button onClick={() => handleSend()} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// Hook para gerenciar AI Assistant
export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  return {
    isOpen,
    isMinimized,
    openAssistant: () => {
      setIsOpen(true)
      setIsMinimized(false)
    },
    closeAssistant: () => setIsOpen(false),
    minimizeAssistant: () => setIsMinimized(true),
    toggleAssistant: () => setIsOpen(prev => !prev)
  }
} 