'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { type PhysiotherapyEvaluation } from '@/types/database.types' // Assumindo que o tipo existe

// Definindo um tipo mais completo para o formulário, que pode incluir dados do paciente
export interface EvaluationFormData extends Partial<PhysiotherapyEvaluation> {
  patientName?: string;
}

export function usePatientEvaluation(patientId: string, evaluationId?: string) {
  const supabase = createClient()
  const [evaluationData, setEvaluationData] = useState<EvaluationFormData | null>(null)
  const [patientName, setPatientName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvaluationData = useCallback(async () => {
    if (!patientId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Buscar nome do paciente
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('name')
        .eq('id', patientId)
        .single()

      if (patientError) throw new Error(`Erro ao buscar paciente: ${patientError.message}`)
      setPatientName(patientData?.name ?? 'Paciente não encontrado')

      // 2. Buscar avaliação existente (se houver um evaluationId)
      let evaluationResult: PhysiotherapyEvaluation | null = null
      if (evaluationId) {
        const { data, error: evalError } = await supabase
          .from('physiotherapy_evaluations')
          .select('*')
          .eq('id', evaluationId)
          .single()
        if (evalError) console.warn(`Nenhuma avaliação encontrada para o ID ${evaluationId}, criando uma nova.`)
        else evaluationResult = data
      }

      if (evaluationResult) {
        setEvaluationData(evaluationResult)
      } else {
        // Preenche com valores padrão se for uma nova avaliação
        setEvaluationData({
          patient_id: patientId,
          evaluation_date: new Date().toISOString().split('T')[0],
          // ... outros valores padrão
        })
      }
    } catch (err: any) {
      setError(err.message)
      toast.error('Falha ao carregar dados da avaliação.')
    } finally {
      setLoading(false)
    }
  }, [patientId, evaluationId, supabase])

  useEffect(() => {
    fetchEvaluationData()
  }, [fetchEvaluationData])

  const saveEvaluation = useCallback(async (data: EvaluationFormData) => {
    setIsSaving(true)
    setError(null)

    try {
      const evaluationToSave = { ...data }
      // Remover campos que não pertencem à tabela
      delete evaluationToSave.patientName

      const { data: savedData, error: saveError } = await supabase
        .from('physiotherapy_evaluations')
        .upsert(evaluationToSave, { onConflict: 'id' }) // Usa upsert para criar ou atualizar
        .select()
        .single()

      if (saveError) throw saveError

      toast.success('Avaliação salva com sucesso!')
      return savedData
    } catch (err: any) {
      setError(err.message)
      toast.error(`Erro ao salvar avaliação: ${err.message}`)
      return null
    } finally {
      setIsSaving(false)
    }
  }, [supabase])

  return {
    evaluationData,
    setEvaluationData,
    patientName,
    loading,
    isSaving,
    error,
    saveEvaluation,
  }
} 