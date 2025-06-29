import { NextRequest, NextResponse } from 'next/server'
import { supabasePrincipal as supabase } from '@/lib/supabase'
import { Tables, TablesInsert } from '@/types/database.types'

type ExerciseExecution = Tables<'exercise_executions'>
type ExerciseExecutionInsert = TablesInsert<'exercise_executions'>

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const prescriptionId = searchParams.get('prescription_id')
    const patientId = searchParams.get('patient_id')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('exercise_executions')
      .select(`
        *,
        prescription:exercise_prescriptions!exercise_executions_prescription_id_fkey(
          id,
          patient:patients!exercise_prescriptions_patient_id_fkey(id, full_name),
          exercise:exercises!exercise_prescriptions_exercise_id_fkey(id, name, category)
        )
      `)
      .order('execution_date', { ascending: false })

    if (prescriptionId) {
      query = query.eq('prescription_id', prescriptionId)
    }

    if (patientId) {
      query = query.eq('prescription.patient_id', patientId)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: executions, error } = await query

    if (error) {
      console.error('Error fetching executions:', error)
      return NextResponse.json({ error: 'Failed to fetch executions' }, { status: 500 })
    }

    return NextResponse.json(executions)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se a prescrição existe e se o usuário tem permissão
    const { data: prescription, error: prescriptionError } = await supabase
      .from('exercise_prescriptions')
      .select(`
        *,
        patient:patients!exercise_prescriptions_patient_id_fkey(id)
      `)
      .eq('id', body.prescription_id)
      .single()

    if (prescriptionError || !prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    const executionData: ExerciseExecutionInsert = {
      prescription_id: body.prescription_id,
      execution_date: body.execution_date || new Date().toISOString(),
      completed_sets: body.completed_sets || null,
      completed_repetitions: body.completed_repetitions || null,
      completed_duration_minutes: body.completed_duration_minutes || null,
      pain_level: body.pain_level || null,
      difficulty_level: body.difficulty_level || null,
      patient_feedback: body.patient_feedback || null,
      notes: body.notes || null
    }

    const { data: execution, error } = await supabase
      .from('exercise_executions')
      .insert(executionData)
      .select(`
        *,
        prescription:exercise_prescriptions!exercise_executions_prescription_id_fkey(
          id,
          patient:patients!exercise_prescriptions_patient_id_fkey(id, full_name),
          exercise:exercises!exercise_prescriptions_exercise_id_fkey(id, name, category)
        )
      `)
      .single()

    if (error) {
      console.error('Error creating execution:', error)
      return NextResponse.json({ error: 'Failed to create execution' }, { status: 500 })
    }

    return NextResponse.json(execution, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 