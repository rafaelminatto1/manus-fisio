import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ✅ OTIMIZAÇÃO: Tipos explícitos para evitar erros de TypeScript
interface NotebookItem {
  id: string
  title: string
  content: string
  created_at: string
  [key: string]: any
}

interface ProjectItem {
  id: string
  title: string
  description: string
  created_at: string
  [key: string]: any
}

interface TaskItem {
  id: string
  title: string
  description: string
  created_at: string
  [key: string]: any
}

export async function POST(request: NextRequest) {
  try {
    const { query, type, limit = 10 } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Buscar em diferentes tabelas baseado no tipo
    let notebooks: NotebookItem[] | null = null
    let projects: ProjectItem[] | null = null
    let tasks: TaskItem[] | null = null

    if (!type || type === 'all' || type === 'notebook') {
      const { data } = await supabase
        .from('notebooks')
        .select('id, title, content, created_at')
        .textSearch('content', query)
        .limit(limit)
      notebooks = data
    }

    if (!type || type === 'all' || type === 'project') {
      const { data } = await supabase
        .from('projects')
        .select('id, title, description, created_at')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit)
      projects = data
    }

    if (!type || type === 'all' || type === 'task') {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, description, created_at')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit)
      tasks = data
    }

    // Combinar resultados e calcular relevância
    const results = [
      ...(notebooks || []).map((item: NotebookItem) => ({
        id: item.id,
        type: 'notebook',
        title: item.title,
        content: item.content?.substring(0, 200) + '...',
        relevance: calculateRelevance(query, item.title + ' ' + item.content),
        created_at: item.created_at
      })),
      ...(projects || []).map((item: ProjectItem) => ({
        id: item.id,
        type: 'project',
        title: item.title,
        content: item.description?.substring(0, 200) + '...',
        relevance: calculateRelevance(query, item.title + ' ' + item.description),
        created_at: item.created_at
      })),
      ...(tasks || []).map((item: TaskItem) => ({
        id: item.id,
        type: 'task',
        title: item.title,
        content: item.description?.substring(0, 200) + '...',
        relevance: calculateRelevance(query, item.title + ' ' + item.description),
        created_at: item.created_at
      }))
    ]

    // Ordenar por relevância
    results.sort((a, b) => b.relevance - a.relevance)

    return NextResponse.json({
      results: results.slice(0, limit),
      total: results.length,
      query
    })

  } catch (error) {
    console.error('Semantic search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ✅ OTIMIZAÇÃO: Função melhorada de cálculo de relevância
function calculateRelevance(query: string, content: string): number {
  if (!content) return 0
  
  const queryLower = query.toLowerCase()
  const contentLower = content.toLowerCase()
  
  // Pontuação base por presença da query
  let score = 0
  
  // Exact match no título (peso maior)
  if (contentLower.includes(queryLower)) {
    score += 10
  }
  
  // Palavras individuais
  const queryWords = queryLower.split(' ').filter(word => word.length > 2)
  queryWords.forEach(word => {
    if (contentLower.includes(word)) {
      score += 2
    }
  })
  
  // Proximidade das palavras (bonus se estão próximas)
  if (queryWords.length > 1) {
    const positions = queryWords.map(word => contentLower.indexOf(word))
    if (positions.every(pos => pos !== -1)) {
      const maxDistance = Math.max(...positions) - Math.min(...positions)
      if (maxDistance < 100) {
        score += 5 - (maxDistance / 20)
      }
    }
  }
  
  return score
} 