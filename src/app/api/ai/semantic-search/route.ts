import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { query, filters } = await req.json()

    // Verificar autenticação
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Buscar em notebooks
    const { data: notebooks } = await supabase
      .from('notebooks')
      .select('id, title, content, created_at')
      .ilike('title', `%${query}%`)
      .limit(5)

    // Buscar em projetos
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, description, created_at')
      .ilike('title', `%${query}%`)
      .limit(5)

    // Buscar em eventos
    const { data: events } = await supabase
      .from('calendar_events')
      .select('id, title, description, created_at')
      .ilike('title', `%${query}%`)
      .limit(5)

    // Buscar em usuários
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, role, created_at')
      .ilike('full_name', `%${query}%`)
      .limit(5)

    // Combinar resultados e calcular relevância
    const results = [
      ...(notebooks || []).map(item => ({
        id: item.id,
        type: 'notebook',
        title: item.title,
        content: item.content || '',
        relevance: calculateRelevance(query, item.title + ' ' + (item.content || '')),
        metadata: { created_at: item.created_at }
      })),
      ...(projects || []).map(item => ({
        id: item.id,
        type: 'project',
        title: item.title,
        content: item.description || '',
        relevance: calculateRelevance(query, item.title + ' ' + (item.description || '')),
        metadata: { created_at: item.created_at }
      })),
      ...(events || []).map(item => ({
        id: item.id,
        type: 'event',
        title: item.title,
        content: item.description || '',
        relevance: calculateRelevance(query, item.title + ' ' + (item.description || '')),
        metadata: { created_at: item.created_at }
      })),
      ...(users || []).map(item => ({
        id: item.id,
        type: 'user',
        title: item.full_name,
        content: `Função: ${item.role}`,
        relevance: calculateRelevance(query, item.full_name),
        metadata: { role: item.role, created_at: item.created_at }
      }))
    ]

    // Ordenar por relevância
    results.sort((a, b) => b.relevance - a.relevance)

    return Response.json({ 
      results: results.slice(0, filters?.limit || 10),
      total: results.length,
      query
    })

  } catch (error) {
    console.error('Semantic Search Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

function calculateRelevance(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(' ')
  const textWords = text.toLowerCase().split(' ')
  
  let matches = 0
  let exactMatches = 0
  
  queryWords.forEach(queryWord => {
    textWords.forEach(textWord => {
      if (textWord.includes(queryWord)) {
        matches++
        if (textWord === queryWord) {
          exactMatches++
        }
      }
    })
  })
  
  // Calcular relevância (0-1)
  const relevance = (matches * 0.5 + exactMatches * 1) / queryWords.length
  return Math.min(relevance, 1)
} 