'use client'

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react'

// Tipos para o assistente IA
export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    type?: 'insight' | 'recommendation' | 'analysis' | 'general'
    patientId?: string
    confidence?: number
    sources?: string[]
  }
}

export interface AIConversation {
  id: string
  title: string
  messages: AIMessage[]
  createdAt: Date
  updatedAt: Date
  context?: {
    patientId?: string
    projectId?: string
    type?: 'general' | 'patient_analysis' | 'treatment_planning'
  }
}

export interface AIAssistantState {
  conversations: AIConversation[]
  activeConversationId: string | null
  isLoading: boolean
  error: string | null
  settings: {
    autoInsights: boolean
    language: 'pt' | 'en'
    theme: 'light' | 'dark' | 'auto'
    voice: boolean
    notifications: boolean
  }
  insights: {
    patientInsights: Record<string, any>
    treatmentRecommendations: Record<string, any>
    predictiveAnalytics: Record<string, any>
  }
}

// Ações do reducer
type AIAssistantAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CREATE_CONVERSATION'; payload: { title: string; context?: AIConversation['context'] } }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Omit<AIMessage, 'id' | 'timestamp'> } }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<AIConversation> } }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AIAssistantState['settings']> }
  | { type: 'SET_INSIGHTS'; payload: { type: keyof AIAssistantState['insights']; data: any } }
  | { type: 'CLEAR_CONVERSATIONS' }
  | { type: 'CLEANUP_OLD_CONVERSATIONS'; payload: number } // Nova ação para limpeza

// Estado inicial
const initialState: AIAssistantState = {
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  error: null,
  settings: {
    autoInsights: true,
    language: 'pt',
    theme: 'auto',
    voice: false,
    notifications: true
  },
  insights: {
    patientInsights: {},
    treatmentRecommendations: {},
    predictiveAnalytics: {}
  }
}

// Função para gerar IDs únicos mais robustos
const generateUniqueId = (prefix: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const counter = Math.random().toString(36).substring(2, 5)
  return `${prefix}_${timestamp}_${random}_${counter}`
}

// Reducer otimizado
const aiAssistantReducer = (state: AIAssistantState, action: AIAssistantAction): AIAssistantState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }

    case 'CREATE_CONVERSATION': {
      const newConversation: AIConversation = {
        id: generateUniqueId('conv'),
        title: action.payload.title,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        context: action.payload.context
      }
      
      // Limitar número de conversas (máximo 50)
      const conversations = state.conversations.length >= 50 
        ? [newConversation, ...state.conversations.slice(0, 49)]
        : [newConversation, ...state.conversations]
      
      return {
        ...state,
        conversations,
        activeConversationId: newConversation.id
      }
    }

    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload }

    case 'ADD_MESSAGE': {
      const { conversationId, message } = action.payload
      const newMessage: AIMessage = {
        ...message,
        id: generateUniqueId('msg'),
        timestamp: new Date()
      }

      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages.slice(-100), newMessage], // Limitar a 100 mensagens por conversa
                updatedAt: new Date()
              }
            : conv
        )
      }
    }

    case 'UPDATE_CONVERSATION': {
      const { id, updates } = action.payload
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === id ? { ...conv, ...updates, updatedAt: new Date() } : conv
        )
      }
    }

    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        activeConversationId: state.activeConversationId === action.payload ? null : state.activeConversationId
      }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      }

    case 'SET_INSIGHTS': {
      const { type, data } = action.payload
      return {
        ...state,
        insights: {
          ...state.insights,
          [type]: { ...state.insights[type], ...data }
        }
      }
    }

    case 'CLEAR_CONVERSATIONS':
      return {
        ...state,
        conversations: [],
        activeConversationId: null
      }

    case 'CLEANUP_OLD_CONVERSATIONS': {
      const maxAge = action.payload // em dias
      const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000)
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.updatedAt > cutoffDate)
      }
    }

    default:
      return state
  }
}

// Contexto
interface AIAssistantContextType {
  state: AIAssistantState
  dispatch: React.Dispatch<AIAssistantAction>
  
  // Ações de conveniência memoizadas
  createConversation: (title: string, context?: AIConversation['context']) => string
  sendMessage: (content: string, conversationId?: string) => Promise<void>
  setActiveConversation: (id: string) => void
  deleteConversation: (id: string) => void
  updateSettings: (settings: Partial<AIAssistantState['settings']>) => void
  clearError: () => void
  cleanupOldConversations: (maxAgeDays: number) => void
  
  // Integração com APIs
  getPatientInsights: (patientId: string) => Promise<any>
  getTreatmentRecommendations: (patientId: string) => Promise<any>
  getPredictiveAnalytics: (patientId: string) => Promise<any>
  
  // Utilitários memoizados
  getActiveConversation: () => AIConversation | null
  getConversationsByContext: (context: AIConversation['context']) => AIConversation[]
}

const AIAssistantContext = createContext<AIAssistantContextType | null>(null)

interface AIAssistantProviderProps {
  children: ReactNode
}

export const AIAssistantProvider = React.memo(function AIAssistantProvider({ children }: AIAssistantProviderProps) {
  const [state, dispatch] = useReducer(aiAssistantReducer, initialState)

  // Ações memoizadas para evitar re-renders
  const createConversation = useCallback((title: string, context?: AIConversation['context']) => {
    const id = generateUniqueId('conv')
    dispatch({ type: 'CREATE_CONVERSATION', payload: { title, context } })
    return id
  }, [])

  const sendMessage = useCallback(async (content: string, conversationId?: string) => {
    const targetConversationId = conversationId || state.activeConversationId
    if (!targetConversationId) return

    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      // Adicionar mensagem do usuário
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          conversationId: targetConversationId,
          message: { role: 'user', content }
        }
      })

      // Buscar contexto da conversa
      const conversation = state.conversations.find(c => c.id === targetConversationId)
      const history = conversation?.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })) || []

      // Chamar API com throttling
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          context: conversation?.context,
          history
        }),
        signal: AbortSignal.timeout(30000) // Timeout de 30s
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()

      // Adicionar resposta da IA
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          conversationId: targetConversationId,
          message: {
            role: 'assistant',
            content: data.response,
            metadata: data.metadata
          }
        }
      })

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.activeConversationId, state.conversations])

  const setActiveConversation = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: id })
  }, [])

  const deleteConversation = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: id })
  }, [])

  const updateSettings = useCallback((settings: Partial<AIAssistantState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }, [])

  const cleanupOldConversations = useCallback((maxAgeDays: number) => {
    dispatch({ type: 'CLEANUP_OLD_CONVERSATIONS', payload: maxAgeDays })
  }, [])

  // APIs com cache simples
  const apiCache = useMemo(() => new Map<string, { data: any; timestamp: number }>(), [])

  const getPatientInsights = useCallback(async (patientId: string) => {
    const cacheKey = `insights_${patientId}`
    const cached = apiCache.get(cacheKey)
    
    // Cache por 5 minutos
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data
    }

    try {
      const response = await fetch(`/api/ai/predictive-analytics?patientId=${patientId}`)
      const data = await response.json()
      
      apiCache.set(cacheKey, { data, timestamp: Date.now() })
      dispatch({ type: 'SET_INSIGHTS', payload: { type: 'patientInsights', data: { [patientId]: data } } })
      
      return data
    } catch (error) {
      console.error('Erro ao buscar insights:', error)
      return null
    }
  }, [apiCache])

  const getTreatmentRecommendations = useCallback(async (patientId: string) => {
    const cacheKey = `recommendations_${patientId}`
    const cached = apiCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data
    }

    try {
      const response = await fetch(`/api/ai/recommendations?patientId=${patientId}`)
      const data = await response.json()
      
      apiCache.set(cacheKey, { data, timestamp: Date.now() })
      dispatch({ type: 'SET_INSIGHTS', payload: { type: 'treatmentRecommendations', data: { [patientId]: data } } })
      
      return data
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error)
      return null
    }
  }, [apiCache])

  const getPredictiveAnalytics = useCallback(async (patientId: string) => {
    const cacheKey = `analytics_${patientId}`
    const cached = apiCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return cached.data
    }

    try {
      const response = await fetch(`/api/analytics/summary?patientId=${patientId}`)
      const data = await response.json()
      
      apiCache.set(cacheKey, { data, timestamp: Date.now() })
      dispatch({ type: 'SET_INSIGHTS', payload: { type: 'predictiveAnalytics', data: { [patientId]: data } } })
      
      return data
    } catch (error) {
      console.error('Erro ao buscar analytics:', error)
      return null
    }
  }, [apiCache])

  // Utilitários memoizados
  const getActiveConversation = useCallback(() => {
    return state.conversations.find(conv => conv.id === state.activeConversationId) || null
  }, [state.conversations, state.activeConversationId])

  const getConversationsByContext = useCallback((context: AIConversation['context']) => {
    return state.conversations.filter(conv => 
      conv.context?.type === context?.type && 
      conv.context?.patientId === context?.patientId
    )
  }, [state.conversations])

  // Limpeza automática de conversas antigas (executar uma vez por dia)
  React.useEffect(() => {
    const interval = setInterval(() => {
      cleanupOldConversations(30) // Remove conversas com mais de 30 dias
    }, 24 * 60 * 60 * 1000) // 24 horas

    return () => clearInterval(interval)
  }, [cleanupOldConversations])

  // Valor do contexto memoizado
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    createConversation,
    sendMessage,
    setActiveConversation,
    deleteConversation,
    updateSettings,
    clearError,
    cleanupOldConversations,
    getPatientInsights,
    getTreatmentRecommendations,
    getPredictiveAnalytics,
    getActiveConversation,
    getConversationsByContext
  }), [
    state,
    createConversation,
    sendMessage,
    setActiveConversation,
    deleteConversation,
    updateSettings,
    clearError,
    cleanupOldConversations,
    getPatientInsights,
    getTreatmentRecommendations,
    getPredictiveAnalytics,
    getActiveConversation,
    getConversationsByContext
  ])

  return (
    <AIAssistantContext.Provider value={contextValue}>
      {children}
    </AIAssistantContext.Provider>
  )
})

export function useAIAssistant() {
  const context = useContext(AIAssistantContext)
  if (!context) {
    throw new Error('useAIAssistant deve ser usado dentro de AIAssistantProvider')
  }
  return context
}

// Hooks especializados para performance
export const useAIAssistantState = () => {
  const { state } = useAIAssistant()
  return state
}

export const useAIAssistantActions = () => {
  const { 
    createConversation, 
    sendMessage, 
    setActiveConversation, 
    deleteConversation, 
    updateSettings,
    clearError 
  } = useAIAssistant()
  
  return useMemo(() => ({
    createConversation,
    sendMessage,
    setActiveConversation,
    deleteConversation,
    updateSettings,
    clearError
  }), [createConversation, sendMessage, setActiveConversation, deleteConversation, updateSettings, clearError])
}