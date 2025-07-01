import { useState, useCallback } from 'react'
import { PhysiotherapyEvaluation } from '@/types/database.types'
import { toast } from 'sonner'

interface EvaluationData {
  patientId: string
  evaluatorId: string
  mainComplaint: string
  painScale?: number
  painLocation?: string
  painCharacteristics?: string
  medicalHistory?: string
  previousTreatments?: string
  medications?: string
  lifestyleFactors?: string
  postureAnalysis?: string
  muscleStrength?: Record<string, string>
  rangeOfMotion?: any[]
  functionalTests?: any[]
  clinicalDiagnosis?: string
  physiotherapyDiagnosis?: string
  treatmentGoals?: string[]
  estimatedSessions?: number
  frequencyPerWeek?: number
}

interface UsePhysiotherapyReturn {
  // Estados
  evaluations: PhysiotherapyEvaluation[]
  isLoading: boolean
  error: string | null

  // Funções
  createEvaluation: (data: EvaluationData) => Promise<PhysiotherapyEvaluation | null>
  updateEvaluation: (evaluationId: string, data: Partial<EvaluationData>) => Promise<PhysiotherapyEvaluation | null>
  fetchEvaluations: (patientId: string) => Promise<void>
  clearError: () => void
}

export function usePhysiotherapy(): UsePhysiotherapyReturn {
  const [evaluations, setEvaluations] = useState<PhysiotherapyEvaluation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar avaliações de um paciente
  const fetchEvaluations = useCallback(async (patientId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/physiotherapy/evaluations?patientId=${patientId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar avaliações')
      }

      setEvaluations(result.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast.error('❌ Erro ao carregar avaliações', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Criar nova avaliação
  const createEvaluation = useCallback(async (data: EvaluationData): Promise<PhysiotherapyEvaluation | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/physiotherapy/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar avaliação')
      }

      toast.success('✅ Avaliação criada com sucesso!', {
        description: 'Dados salvos no prontuário do paciente'
      })

      // Atualizar lista local
      setEvaluations(prev => [result.data, ...prev])

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast.error('❌ Erro ao criar avaliação', {
        description: errorMessage
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Atualizar avaliação existente
  const updateEvaluation = useCallback(async (
    evaluationId: string, 
    data: Partial<EvaluationData>
  ): Promise<PhysiotherapyEvaluation | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/physiotherapy/evaluations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ evaluationId, ...data }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar avaliação')
      }

      toast.success('✅ Avaliação atualizada!', {
        description: 'Alterações salvas com sucesso'
      })

      // Atualizar lista local
      setEvaluations(prev => 
        prev.map(evaluation => evaluation.id === evaluationId ? result.data : evaluation)
      )

      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast.error('❌ Erro ao atualizar avaliação', {
        description: errorMessage
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Estados
    evaluations,
    isLoading,
    error,

    // Funções
    createEvaluation,
    updateEvaluation,
    fetchEvaluations,
    clearError,
  }
}

// Hook específico para métricas de fisioterapia
export function usePhysiotherapyMetrics() {
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    activePatients: 0,
    completedEvaluations: 0,
    averagePainReduction: 0,
    mostCommonConditions: [] as { condition: string; count: number }[],
    weeklyStats: [] as { week: string; evaluations: number; prescriptions: number }[]
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true)
    try {
      // TODO: Implementar API para métricas
      // const response = await fetch('/api/physiotherapy/metrics')
      // const data = await response.json()
      
      // Mock data por enquanto
      const mockMetrics = {
        totalPatients: 156,
        activePatients: 89,
        completedEvaluations: 234,
        averagePainReduction: 4.2,
        mostCommonConditions: [
          { condition: 'Lombalgia', count: 45 },
          { condition: 'Cervicalgia', count: 32 },
          { condition: 'Gonartrose', count: 28 },
          { condition: 'Ombro Doloroso', count: 21 }
        ],
        weeklyStats: [
          { week: 'Sem 1', evaluations: 12, prescriptions: 8 },
          { week: 'Sem 2', evaluations: 15, prescriptions: 12 },
          { week: 'Sem 3', evaluations: 18, prescriptions: 14 },
          { week: 'Sem 4', evaluations: 14, prescriptions: 11 }
        ]
      }
      
      setMetrics(mockMetrics)
    } catch (error) {
      console.error('Erro ao buscar métricas:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    metrics,
    isLoading,
    fetchMetrics
  }
} 