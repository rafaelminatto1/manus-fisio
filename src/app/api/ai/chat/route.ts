import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting simples em memória (em produção, usar Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Configurações de rate limiting
const RATE_LIMIT = {
  maxRequests: 20, // máximo 20 requests
  windowMs: 15 * 60 * 1000, // por 15 minutos
  maxTokens: 50000, // máximo de tokens por usuário por hora
  maxMessageLength: 2000, // máximo de caracteres por mensagem
  maxHistoryLength: 20 // máximo de mensagens no histórico
}

// Cache simples para respostas (em produção, usar Redis)
const responseCache = new Map<string, { response: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Validação com Zod
const ChatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(RATE_LIMIT.maxMessageLength, `Mensagem muito longa (máximo ${RATE_LIMIT.maxMessageLength} caracteres)`)
    .refine((msg) => msg.trim().length > 0, 'Mensagem não pode conter apenas espaços'),
  conversationId: z.string().optional(),
  context: z.object({
    patientId: z.string().optional(),
    projectId: z.string().optional(),
    type: z.enum(['general', 'patient_analysis', 'treatment_planning']).optional()
  }).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(RATE_LIMIT.maxMessageLength)
  })).max(RATE_LIMIT.maxHistoryLength, `Histórico muito longo (máximo ${RATE_LIMIT.maxHistoryLength} mensagens)`).optional()
})

// Sistema de prompt especializado em fisioterapia
const PHYSIOTHERAPY_SYSTEM_PROMPT = `
Você é um assistente de IA especializado em fisioterapia e gestão de clínicas de fisioterapia.

ESPECIALIDADES:
- Análise de condições musculoesqueléticas
- Prescrição de exercícios terapêuticos
- Planejamento de tratamentos
- Gestão de pacientes e clínicas
- Interpretação de avaliações físicas
- Recomendações baseadas em evidências

DIRETRIZES:
1. Sempre forneça informações baseadas em evidências científicas
2. Seja claro sobre limitações e quando recomendar consulta presencial
3. Use linguagem profissional mas acessível
4. Inclua disclaimers quando apropriado
5. Foque em tratamentos conservadores e não invasivos
6. Considere fatores como idade, condição física e histórico médico

FORMATO DE RESPOSTA:
- Seja conciso mas completo
- Use listas quando apropriado
- Inclua confiança na resposta (0-1)
- Identifique o tipo de resposta (insight, recomendação, análise, geral)
- Cite fontes quando relevante

IMPORTANTE: Você não substitui consulta médica presencial. Sempre recomende avaliação profissional para casos complexos.
`

// Função para obter IP do cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const parts = forwarded.split(',');
    if (parts.length > 0 && typeof parts[0] === 'string') {
      return parts[0].trim();
    }
  }
  
  if (typeof realIP === 'string' && realIP.length > 0) {
    return realIP;
  }
  
  return 'unknown';
}

// Função de rate limiting
function checkRateLimit(clientIP: string, tokenCount: number = 0): { allowed: boolean; error?: string } {
  const now = Date.now()
  const clientLimit = rateLimitMap.get(clientIP)
  
  if (!clientLimit || now > clientLimit.resetTime) {
    // Reset ou primeira requisição
    rateLimitMap.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    })
    return { allowed: true }
  }
  
  if (clientLimit.count >= RATE_LIMIT.maxRequests) {
    const resetIn = Math.ceil((clientLimit.resetTime - now) / 1000 / 60)
    return { 
      allowed: false, 
      error: `Rate limit excedido. Tente novamente em ${resetIn} minutos.` 
    }
  }
  
  // Incrementa contador
  clientLimit.count++
  rateLimitMap.set(clientIP, clientLimit)
  
  return { allowed: true }
}

// Função para sanitizar texto
function sanitizeInput(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim()
}

// Função para gerar chave de cache
function generateCacheKey(message: string, context?: any): string {
  const normalizedMessage = message.toLowerCase().trim()
  const contextKey = context ? JSON.stringify(context) : ''
  return `${normalizedMessage}_${contextKey}`
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Verificar IP e rate limiting
    const clientIP = getClientIP(request)
    const rateLimitCheck = checkRateLimit(clientIP)
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { 
          status: 429,
          headers: {
            'Retry-After': '900', // 15 minutos
            'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }

    // Validar dados de entrada
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'JSON inválido' },
        { status: 400 }
      )
    }

    const validation = ChatRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      )
    }

    const { message, context, history = [] } = validation.data

    // Sanitizar entrada
    const sanitizedMessage = sanitizeInput(message)
    if (!sanitizedMessage) {
      return NextResponse.json(
        { error: 'Mensagem inválida após sanitização' },
        { status: 400 }
      )
    }

    // Verificar cache
    const cacheKey = generateCacheKey(sanitizedMessage, context)
    const cached = responseCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        ...cached.response,
        cached: true,
        processingTime: Date.now() - startTime
      })
    }

    // Construir contexto baseado no tipo de conversa
    let contextualPrompt = PHYSIOTHERAPY_SYSTEM_PROMPT

    if (context?.type === 'patient_analysis') {
      contextualPrompt += `\n\nCONTEXTO: Você está analisando dados de um paciente específico. Foque em insights clínicos, progressos e recomendações personalizadas.`
    } else if (context?.type === 'treatment_planning') {
      contextualPrompt += `\n\nCONTEXTO: Você está ajudando no planejamento de tratamento. Foque em protocolos, exercícios e cronogramas de reabilitação.`
    }

    // Sanitizar histórico
    const sanitizedHistory = history.map(msg => ({
      role: msg.role,
      content: sanitizeInput(msg.content)
    })).filter(msg => msg.content.length > 0)

    // Construir mensagens para a API
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: contextualPrompt },
      ...sanitizedHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: sanitizedMessage }
    ]

    // Verificar se tem API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Configuração da API não encontrada' },
        { status: 500 }
      )
    }

    // Chamar OpenAI com timeout e retry
    let completion: OpenAI.Chat.Completions.ChatCompletion | undefined
    let retryCount = 0
    const maxRetries = 2

    while (retryCount <= maxRetries) {
      try {
        completion = await Promise.race([
          openai.chat.completions.create({
            model: 'gpt-4',
            messages,
            max_tokens: 1000,
            temperature: 0.7,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 30000)
          )
        ]) as OpenAI.Chat.Completions.ChatCompletion
        break // Sucesso, sair do loop
      } catch (error) {
        retryCount++
        if (retryCount > maxRetries) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
    }

    if (!completion) {
      throw new Error('Falha ao obter resposta da IA')
    }

    const response = completion!.choices[0]?.message?.content

    if (!response) {
      throw new Error('Resposta vazia da IA')
    }

    // Analisar o tipo de resposta e confiança
    const responseMetadata = analyzeResponse(response, sanitizedMessage, context)

    const result = {
      response: response.trim(),
      metadata: responseMetadata,
      usage: completion.usage,
      model: 'gpt-4',
      processingTime: Date.now() - startTime,
      cached: false
    }

    // Armazenar no cache
    responseCache.set(cacheKey, { response: result, timestamp: Date.now() })

    // Limpar cache antigo periodicamente
    if (responseCache.size > 1000) {
      const now = Date.now()
      for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          responseCache.delete(key)
        }
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro no chat AI:', error)
    
    // Diferentes tipos de erro
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Configuração da API inválida' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'Limite de uso da API atingido. Tente novamente mais tarde.' },
          { status: 429 }
        )
      }
      
      if (error.message.includes('Timeout')) {
        return NextResponse.json(
          { error: 'Timeout na resposta da IA. Tente uma pergunta mais simples.' },
          { status: 408 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        processingTime: Date.now() - startTime
      },
      { status: 500 }
    )
  }
}

// Função para analisar a resposta e extrair metadados (otimizada)
function analyzeResponse(response: string, userMessage: string, context?: any) {
  const metadata: any = {
    type: 'general',
    confidence: 0.8,
    sources: [],
    keywords: []
  }

  // Cache de strings em lowercase para evitar múltiplas conversões
  const lowerResponse = response.toLowerCase()
  const lowerMessage = userMessage.toLowerCase()

  // Detectar tipo de resposta baseado no conteúdo
  if (lowerMessage.includes('exercício') || lowerMessage.includes('treino') || 
      lowerResponse.includes('exercício') || lowerResponse.includes('movimento')) {
    metadata.type = 'recommendation'
    metadata.confidence = 0.9
  } else if (lowerMessage.includes('diagnóstico') || lowerMessage.includes('avaliação') ||
             lowerResponse.includes('análise') || lowerResponse.includes('condição')) {
    metadata.type = 'analysis'
    metadata.confidence = 0.85
  } else if (lowerMessage.includes('insight') || lowerMessage.includes('progresso') ||
             lowerResponse.includes('insight') || lowerResponse.includes('melhora')) {
    metadata.type = 'insight'
    metadata.confidence = 0.8
  }

  // Extrair palavras-chave relevantes (otimizado)
  const keywords = extractKeywords(lowerMessage + ' ' + lowerResponse)
  metadata.keywords = keywords

  // Ajustar confiança baseado no contexto
  if (context?.type === 'patient_analysis') {
    metadata.confidence = Math.min(metadata.confidence + 0.1, 1.0)
  }

  // Adicionar fontes baseadas no tipo
  if (metadata.type === 'recommendation') {
    metadata.sources = ['Diretrizes de Fisioterapia', 'Evidências Clínicas']
  } else if (metadata.type === 'analysis') {
    metadata.sources = ['Avaliação Clínica', 'Protocolos Diagnósticos']
  }

  return metadata
}

// Função para extrair palavras-chave relevantes (otimizada)
function extractKeywords(text: string): string[] {
  const physiotherapyKeywords = [
    'dor', 'movimento', 'exercício', 'reabilitação', 'fortalecimento',
    'flexibilidade', 'mobilidade', 'amplitude', 'postura', 'equilíbrio',
    'coordenação', 'resistência', 'alongamento', 'massagem', 'terapia',
    'lesão', 'trauma', 'inflamação', 'articulação', 'músculo',
    'tendão', 'ligamento', 'coluna', 'joelho', 'ombro', 'quadril',
    'tornozelo', 'cervical', 'lombar', 'torácica'
  ]

  // Usar Set para evitar duplicatas e melhorar performance
  const foundKeywords = new Set<string>()
  
  for (const keyword of physiotherapyKeywords) {
    if (text.includes(keyword)) {
      foundKeywords.add(keyword)
      if (foundKeywords.size >= 5) break // Limitar a 5 palavras-chave
    }
  }

  return Array.from(foundKeywords)
} 