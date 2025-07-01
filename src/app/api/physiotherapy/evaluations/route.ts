import { NextResponse } from 'next/server'
import { createServerAuthClient } from '@/lib/auth-server'
import { PhysiotherapyEvaluation } from '@/types/database.types'

// GET - Buscar avaliações de um paciente
export async function GET(request: Request) {
  try {
    const supabase = await createServerAuthClient()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId é obrigatório' },
        { status: 400 }
      )
    }

    const { data: evaluations, error } = await supabase
      .from('physiotherapy_evaluations')
      .select(`
        *,
        evaluator:users!evaluator_id(full_name, email),
        patient:patients(full_name, email)
      `)
      .eq('patient_id', patientId)
      .order('evaluation_date', { ascending: false })

    if (error) {
      console.error('Erro ao buscar avaliações:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar avaliações' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: evaluations
    })

  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova avaliação fisioterapêutica
export async function POST(request: Request) {
  try {
    const supabase = await createServerAuthClient()
    const body = await request.json()

    // Validação básica
    const { patientId, mainComplaint, evaluatorId } = body
    if (!patientId || !mainComplaint || !evaluatorId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: patientId, mainComplaint, evaluatorId' },
        { status: 400 }
      )
    }

    // Preparar dados da avaliação
    const evaluationData = {
      patient_id: patientId,
      evaluator_id: evaluatorId,
      evaluation_date: body.evaluationDate || new Date().toISOString().split('T')[0],
      main_complaint: mainComplaint,
      pain_scale_initial: body.painScale || 0,
      pain_location: body.painLocation || null,
      pain_characteristics: body.painCharacteristics || null,
      medical_history: body.medicalHistory || null,
      previous_treatments: body.previousTreatments || null,
      medications: body.medications || null,
      lifestyle_factors: body.lifestyleFactors || null,
      posture_analysis: body.postureAnalysis || null,
      muscle_strength: body.muscleStrength || {},
      range_of_motion: body.rangeOfMotion || {},
      functional_tests: body.functionalTests || {},
      clinical_diagnosis: body.clinicalDiagnosis || null,
      physiotherapy_diagnosis: body.physiotherapyDiagnosis || null,
      treatment_goals: body.treatmentGoals || [],
      estimated_sessions: body.estimatedSessions || null,
      frequency_per_week: body.frequencyPerWeek || null
    }

    const { data: evaluation, error } = await supabase
      .from('physiotherapy_evaluations')
      .insert([evaluationData])
      .select(`
        *,
        evaluator:users!evaluator_id(full_name, email),
        patient:patients(full_name, email)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar avaliação:', error)
      return NextResponse.json(
        { error: 'Erro ao criar avaliação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '✅ Avaliação fisioterapêutica criada com sucesso!',
      data: evaluation
    }, { status: 201 })

  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar avaliação existente
export async function PUT(request: Request) {
  try {
    const supabase = await createServerAuthClient()
    const body = await request.json()
    const { evaluationId, ...updateData } = body

    if (!evaluationId) {
      return NextResponse.json(
        { error: 'evaluationId é obrigatório' },
        { status: 400 }
      )
    }

    // Converter campos para o formato do banco
    const dbUpdateData = {
      ...updateData.mainComplaint && { main_complaint: updateData.mainComplaint },
      ...updateData.painScale !== undefined && { pain_scale_initial: updateData.painScale },
      ...updateData.painLocation && { pain_location: updateData.painLocation },
      ...updateData.painCharacteristics && { pain_characteristics: updateData.painCharacteristics },
      ...updateData.medicalHistory && { medical_history: updateData.medicalHistory },
      ...updateData.previousTreatments && { previous_treatments: updateData.previousTreatments },
      ...updateData.medications && { medications: updateData.medications },
      ...updateData.lifestyleFactors && { lifestyle_factors: updateData.lifestyleFactors },
      ...updateData.postureAnalysis && { posture_analysis: updateData.postureAnalysis },
      ...updateData.muscleStrength && { muscle_strength: updateData.muscleStrength },
      ...updateData.rangeOfMotion && { range_of_motion: updateData.rangeOfMotion },
      ...updateData.functionalTests && { functional_tests: updateData.functionalTests },
      ...updateData.clinicalDiagnosis && { clinical_diagnosis: updateData.clinicalDiagnosis },
      ...updateData.physiotherapyDiagnosis && { physiotherapy_diagnosis: updateData.physiotherapyDiagnosis },
      ...updateData.treatmentGoals && { treatment_goals: updateData.treatmentGoals },
      ...updateData.estimatedSessions !== undefined && { estimated_sessions: updateData.estimatedSessions },
      ...updateData.frequencyPerWeek !== undefined && { frequency_per_week: updateData.frequencyPerWeek },
      updated_at: new Date().toISOString()
    }

    const { data: evaluation, error } = await supabase
      .from('physiotherapy_evaluations')
      .update(dbUpdateData)
      .eq('id', evaluationId)
      .select(`
        *,
        evaluator:users!evaluator_id(full_name, email),
        patient:patients(full_name, email)
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar avaliação:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar avaliação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '✅ Avaliação atualizada com sucesso!',
      data: evaluation
    })

  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 