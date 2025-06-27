'use client'

import { useState, useCallback } from 'react'
import { useChat } from 'ai/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  context?: string
  metadata?: Record<string, any>
}

export interface AIRecommendation {
  id: string
  type: 'project' | 'notebook' | 'task' | 'mentorship'
  title: string
  description: string
  confidence: number
  reasoning: string
  actionable: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface SemanticSearchResult {
  id: string
  type: 'notebook' | 'project' | 'event' | 'user'
  title: string
  content: string
  relevance: number
  metadata: Record<string, any>
}

export interface PredictiveInsight {
  id: string
  category: 'performance' | 'completion' | 'resource' | 'risk'
  prediction: string
  confidence: number
  timeframe: string
  impact: 'low' | 'medium' | 'high'
  recommendations: string[]
}

// Hook para chat inteligente com IA
export function useAIChat(initialSystemPrompt?: string) {
  const { user } = useAuth()
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    append,
    setMessages
  } = useChat({
    api: '/api/ai/chat',
    initialMessages: initialSystemPrompt ? [{
      id: 'system',
      role: 'system',
      content: initialSystemPrompt,
    }] : [],
    headers: {
      'Authorization': `Bearer ${user?.id}`,
    },
  })

  const clearChat = useCallback(() => {
    setMessages(initialSystemPrompt ? [{
      id: 'system',
      role: 'system',
      content: initialSystemPrompt,
    }] : [])
  }, [setMessages, initialSystemPrompt])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    append,
    clearChat,
  }
}

// Hook para assistente de escrita
export function useWritingAssistant() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const improveText = useCallback(async (text: string, context?: string) => {
    if (!user) throw new Error('User not authenticated')
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/writing-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          text,
          context,
          action: 'improve'
        }),
      })

      if (!response.ok) throw new Error('Failed to improve text')
      
      const data = await response.json()
      return data.improvedText
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const generateSuggestions = useCallback(async (prompt: string, type: 'notebook' | 'project' | 'general' = 'general') => {
    if (!user) throw new Error('User not authenticated')
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/writing-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          prompt,
          type,
          action: 'suggest'
        }),
      })

      if (!response.ok) throw new Error('Failed to generate suggestions')
      
      const data = await response.json()
      return data.suggestions
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const checkGrammar = useCallback(async (text: string) => {
    if (!user) throw new Error('User not authenticated')
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/writing-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          text,
          action: 'grammar'
        }),
      })

      if (!response.ok) throw new Error('Failed to check grammar')
      
      const data = await response.json()
      return data.corrections
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return {
    improveText,
    generateSuggestions,
    checkGrammar,
    isLoading,
  }
}

// Hook para busca semântica
export function useSemanticSearch() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['semantic-search-ready', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      // Verificar se o índice semântico está pronto
      const response = await fetch('/api/ai/semantic-search/status', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      })
      
      if (!response.ok) throw new Error('Failed to check search status')
      
      const data = await response.json()
      return data.ready
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}

export function useSemanticSearchQuery() {
  const { user } = useAuth()
  const [isSearching, setIsSearching] = useState(false)

  const search = useCallback(async (query: string, filters?: {
    type?: string[]
    dateRange?: { start: Date; end: Date }
    limit?: number
  }): Promise<SemanticSearchResult[]> => {
    if (!user) throw new Error('User not authenticated')
    
    setIsSearching(true)
    try {
      const response = await fetch('/api/ai/semantic-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          query,
          filters,
        }),
      })

      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      return data.results
    } finally {
      setIsSearching(false)
    }
  }, [user])

  return {
    search,
    isSearching,
  }
}

// Hook para recomendações inteligentes
export function useAIRecommendations() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['ai-recommendations', user?.id],
    queryFn: async (): Promise<AIRecommendation[]> => {
      if (!user) throw new Error('User not authenticated')

      const response = await fetch('/api/ai/recommendations', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch recommendations')
      
      const data = await response.json()
      return data.recommendations
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 15, // 15 minutos
  })
}

// Hook para insights preditivos
export function usePredictiveInsights() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['predictive-insights', user?.id],
    queryFn: async (): Promise<PredictiveInsight[]> => {
      if (!user) throw new Error('User not authenticated')

      const response = await fetch('/api/ai/predictive-insights', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      })

      if (!response.ok) throw new Error('Failed to fetch insights')
      
      const data = await response.json()
      return data.insights
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 30, // 30 minutos
  })
}

// Hook para análise de sentimento
export function useSentimentAnalysis() {
  const { user } = useAuth()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeSentiment = useCallback(async (text: string) => {
    if (!user) throw new Error('User not authenticated')
    
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) throw new Error('Failed to analyze sentiment')
      
      const data = await response.json()
      return {
        sentiment: data.sentiment, // 'positive' | 'negative' | 'neutral'
        confidence: data.confidence,
        emotions: data.emotions,
      }
    } finally {
      setIsAnalyzing(false)
    }
  }, [user])

  return {
    analyzeSentiment,
    isAnalyzing,
  }
}

// Hook para auto-completar inteligente
export function useAIAutoComplete() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const getCompletions = useCallback(async (
    text: string,
    context?: string,
    type?: 'notebook' | 'project' | 'comment'
  ) => {
    if (!user) throw new Error('User not authenticated')
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          text,
          context,
          type,
        }),
      })

      if (!response.ok) throw new Error('Failed to get completions')
      
      const data = await response.json()
      return data.completions
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return {
    getCompletions,
    isLoading,
  }
}

// Hook para resumos automáticos
export function useAISummarization() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const summarize = useCallback(async (
    content: string,
    type: 'brief' | 'detailed' | 'bullet-points' = 'brief',
    maxLength?: number
  ) => {
    if (!user) throw new Error('User not authenticated')
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          content,
          type,
          maxLength,
        }),
      })

      if (!response.ok) throw new Error('Failed to summarize')
      
      const data = await response.json()
      return data.summary
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return {
    summarize,
    isLoading,
  }
} 