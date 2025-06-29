import { NextRequest, NextResponse } from 'next/server'
import { supabasePrincipal as supabase } from '@/lib/supabase'
import { Tables, TablesInsert } from '@/types/database.types'

type ExercisePrescription = Tables<'exercise_prescriptions'>
type ExercisePrescriptionInsert = TablesInsert<'exercise_prescriptions'>

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const patientId = searchParams.get('patient_id')
    const prescribedBy = searchParams.get('prescribed_by')
    const status = searchParams.get('status')

    let query = supabase
      .from('exercise_prescriptions')
      .select(`
        *,
        patient:patients!exercise_prescriptions_patient_id_fkey(id, full_name, email),
        exercise:exercises!exercise_prescriptions_exercise_id_fkey(id, name, description, category, difficulty, video_url),
        prescribed_by_user:users!exercise_prescriptions_prescribed_by_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (patientId) {
      query = query.eq('patient_id', patientId)
    }

    if (prescribedBy) {
      query = query.eq('prescribed_by', prescribedBy)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: prescriptions, error } = await query

    if (error) {
      console.error('Error fetching prescriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
    }

    return NextResponse.json(prescriptions)
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

    // Verificar se o usuário tem permissão para prescrever exercícios (admin ou mentor)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !['admin', 'mentor'].includes(userData.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const prescriptionData: ExercisePrescriptionInsert = {
      patient_id: body.patient_id,
      exercise_id: body.exercise_id,
      prescribed_by: user.id,
      observations: body.observations || null,
      prescribed_sets: body.prescribed_sets || null,
      prescribed_repetitions: body.prescribed_repetitions || null,
      prescribed_duration_minutes: body.prescribed_duration_minutes || null,
      frequency_per_week: body.frequency_per_week || 3,
      start_date: body.start_date || null,
      end_date: body.end_date || null
    }

    const { data: prescription, error } = await supabase
      .from('exercise_prescriptions')
      .insert(prescriptionData)
      .select(`
        *,
        patient:patients!exercise_prescriptions_patient_id_fkey(id, full_name, email),
        exercise:exercises!exercise_prescriptions_exercise_id_fkey(id, name, description, category, difficulty, video_url),
        prescribed_by_user:users!exercise_prescriptions_prescribed_by_fkey(full_name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating prescription:', error)
      return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
    }

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 