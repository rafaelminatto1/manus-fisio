import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { z } from 'zod'
import { createServerAuthClient } from '@/lib/auth-server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Database } from '@/types/database.types'

// Initialize Supabase and Google AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// This is the original mock implementation to ensure the app remains functional
// while the type generation issue is being resolved.

const ExerciseRecommendationRequestSchema = z.object({
  patientId: z.string(),
  condition: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe']),
  goals: z.array(z.string()),
})

interface ExerciseRecommendation {
  id: string
  name: string
  description: string
  category: string
  difficulty: number
  duration: number
  sets: number
  repetitions: number
  confidence: number
  reasoning: string
  contraindications: string[]
  progressionSteps: string[]
  expectedOutcomes: string[]
}

// Mock exercise database
const exerciseDatabase = [
  {
    id: 'ex1',
    name: 'Fortalecimento de Quadríceps',
    description: 'Exercício isométrico para fortalecimento do músculo quadríceps',
    category: 'Fortalecimento',
    difficulty: 2,
    duration: 30,
    sets: 3,
    repetitions: 15,
    indications: ['lombalgia', 'instabilidade_joelho', 'atrofia_muscular'],
    contraindications: ['lesao_ligamento_cruzado_aguda', 'inflamacao_articular_ativa'],
    muscleGroups: ['quadriceps', 'gluteos'],
    equipment: ['nenhum'],
    progressionSteps: [
      'Iniciar com contrações de 5 segundos',
      'Progredir para 10 segundos',
      'Adicionar peso quando apropriado'
    ]
  },
  {
    id: 'ex2',
    name: 'Mobilização Cervical',
    description: 'Exercícios de mobilização para região cervical',
    category: 'Mobilização',
    difficulty: 1,
    duration: 20,
    sets: 2,
    repetitions: 10,
    indications: ['cervicalgia', 'tensao_muscular', 'limitacao_movimento'],
    contraindications: ['hernia_cervical_aguda', 'instabilidade_cervical'],
    muscleGroups: ['cervical', 'trapezio'],
    equipment: ['nenhum'],
    progressionSteps: [
      'Movimentos passivos assistidos',
      'Movimentos ativos livres',
      'Exercícios de resistência leve'
    ]
  },
  {
    id: 'ex3',
    name: 'Estabilização Core',
    description: 'Exercícios para estabilização da musculatura do core',
    category: 'Estabilização',
    difficulty: 3,
    duration: 45,
    sets: 3,
    repetitions: 12,
    indications: ['lombalgia', 'instabilidade_tronco', 'pos_cirurgia_lombar'],
    contraindications: ['hernia_discal_aguda', 'dor_aguda_lombar'],
    muscleGroups: ['core', 'multifidos', 'diafragma'],
    equipment: ['bola_suica'],
    progressionSteps: [
      'Exercícios estáticos básicos',
      'Exercícios dinâmicos controlados',
      'Exercícios funcionais complexos'
    ]
  },
  {
    id: 'ex4',
    name: 'Propriocepção de Tornozelo',
    description: 'Exercícios proprioceptivos para reabilitação de tornozelo',
    category: 'Propriocepção',
    difficulty: 2,
    duration: 25,
    sets: 3,
    repetitions: 8,
    indications: ['entorse_tornozelo', 'instabilidade_tornozelo', 'pos_imobilizacao'],
    contraindications: ['fratura_nao_consolidada', 'inflamacao_aguda'],
    muscleGroups: ['fibulares', 'tibial_anterior', 'gastrocnemio'],
    equipment: ['disco_proprioceptivo', 'bosu'],
    progressionSteps: [
      'Apoio bipodal em superfície estável',
      'Apoio unipodal em superfície estável',
      'Apoio unipodal em superfície instável'
    ]
  },
  {
    id: 'ex5',
    name: 'Alongamento Isquiotibiais',
    description: 'Alongamento específico para musculatura posterior da coxa',
    category: 'Alongamento',
    difficulty: 1,
    duration: 30,
    sets: 3,
    repetitions: 1,
    indications: ['encurtamento_isquiotibiais', 'lombalgia', 'preparacao_esportiva'],
    contraindications: ['lesao_muscular_aguda', 'neuropatia_ciatica_aguda'],
    muscleGroups: ['isquiotibiais', 'gastrocnemio'],
    equipment: ['nenhum'],
    progressionSteps: [
      'Alongamento passivo assistido',
      'Alongamento ativo',
      'Alongamento com facilitação neuromuscular'
    ]
  }
]

function generateRecommendations(
  condition: string,
  severity: string,
  goals: string[],
  limitations: string[] = [],
  previousExercises: string[] = []
): ExerciseRecommendation[] {
  // AI-powered recommendation logic
  const recommendations: ExerciseRecommendation[] = []
  
  // Filter exercises based on condition
  const relevantExercises = exerciseDatabase.filter(exercise => 
    exercise.indications.some(indication => 
      indication.toLowerCase().includes(condition.toLowerCase()) ||
      condition.toLowerCase().includes(indication.toLowerCase())
    )
  )

  // Score exercises based on multiple factors
  const scoredExercises = relevantExercises.map(exercise => {
    let score = 0
    let reasoning = []

    // Base relevance score
    const relevanceScore = exercise.indications.filter(indication =>
      indication.toLowerCase().includes(condition.toLowerCase())
    ).length * 20
    score += relevanceScore
    reasoning.push(`Relevância para ${condition}: ${relevanceScore}%`)

    // Severity adjustment
    const severityMultiplier = severity === 'mild' ? 1.2 : severity === 'moderate' ? 1.0 : 0.8
    score *= severityMultiplier
    reasoning.push(`Ajuste por severidade (${severity}): ${Math.round((severityMultiplier - 1) * 100)}%`)

    // Goals alignment
    const goalAlignment = goals.filter(goal => 
      exercise.category.toLowerCase().includes(goal.toLowerCase()) ||
      goal.toLowerCase().includes(exercise.category.toLowerCase())
    ).length * 15
    score += goalAlignment
    if (goalAlignment > 0) {
      reasoning.push(`Alinhamento com objetivos: +${goalAlignment}%`)
    }

    // Contraindications check
    const hasContraindications = limitations.some(limitation =>
      exercise.contraindications.some(contra =>
        contra.toLowerCase().includes(limitation.toLowerCase())
      )
    )
    if (hasContraindications) {
      score *= 0.3
      reasoning.push('Redução por contraindicações: -70%')
    }

    // Previous exercises diversity
    if (previousExercises.includes(exercise.id)) {
      score *= 0.7
      reasoning.push('Redução por repetição: -30%')
    }

    // Difficulty appropriateness
    const difficultyScore = severity === 'mild' && exercise.difficulty <= 2 ? 10 :
                           severity === 'moderate' && exercise.difficulty <= 3 ? 10 :
                           severity === 'severe' && exercise.difficulty <= 2 ? 10 : 0
    score += difficultyScore
    if (difficultyScore > 0) {
      reasoning.push(`Dificuldade apropriada: +${difficultyScore}%`)
    }

    return {
      ...exercise,
      confidence: Math.min(Math.round(score), 100),
      reasoning: reasoning.join('; '),
      expectedOutcomes: generateExpectedOutcomes(exercise, condition, severity)
    }
  })

  // Sort by confidence and take top recommendations
  const topExercises = scoredExercises
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)

  return topExercises.map(exercise => ({
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    category: exercise.category,
    difficulty: exercise.difficulty,
    duration: exercise.duration,
    sets: exercise.sets,
    repetitions: exercise.repetitions,
    confidence: exercise.confidence,
    reasoning: exercise.reasoning,
    contraindications: exercise.contraindications,
    progressionSteps: exercise.progressionSteps,
    expectedOutcomes: exercise.expectedOutcomes
  }))
}

function generateExpectedOutcomes(exercise: any, condition: string, severity: string): string[] {
  const outcomes = []
  
  switch (exercise.category) {
    case 'Fortalecimento':
      outcomes.push('Aumento da força muscular em 2-4 semanas')
      outcomes.push('Melhora da estabilidade articular')
      outcomes.push('Redução do risco de lesões')
      break
    case 'Mobilização':
      outcomes.push('Aumento da amplitude de movimento')
      outcomes.push('Redução da rigidez articular')
      outcomes.push('Melhora da função articular')
      break
    case 'Estabilização':
      outcomes.push('Melhora do controle motor')
      outcomes.push('Aumento da propriocepção')
      outcomes.push('Redução de compensações posturais')
      break
    case 'Propriocepção':
      outcomes.push('Melhora do equilíbrio')
      outcomes.push('Redução do risco de re-lesão')
      outcomes.push('Aumento da confiança no movimento')
      break
    case 'Alongamento':
      outcomes.push('Aumento da flexibilidade')
      outcomes.push('Redução da tensão muscular')
      outcomes.push('Melhora da postura')
      break
  }

  // Add condition-specific outcomes
  if (condition.toLowerCase().includes('dor')) {
    outcomes.push('Redução da dor em 1-3 semanas')
  }
  if (condition.toLowerCase().includes('lombalgia')) {
    outcomes.push('Melhora da função lombar')
  }

  return outcomes
}

async function fetchAllExercises() {
  const supabase = await createServerAuthClient()
  const { data, error } = await supabase.from('exercises').select('id, name, description, category, difficulty_level')
  if (error) {
    console.error('Error fetching exercises from DB:', error)
    throw new Error('Falha ao buscar exercícios do banco de dados.')
  }
  return data
}

export async function POST(req: NextRequest) {
  try {
    const authError = await authenticateRequest(req)
    if (authError) return authError

    const body = await req.json()
    const { patientId, condition, severity, goals } = ExerciseRecommendationRequestSchema.parse(body)

    const recommendations = generateRecommendations(
      condition,
      severity,
      goals,
    )

    return NextResponse.json({
      patientId,
      condition,
      recommendations,
    })

  } catch (error) {
    console.error('Exercise Recommendation Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    return new Response('Internal Server Error', { status: 500 })
  }
} 