import { NextRequest, NextResponse } from 'next/server'
import { supabasePrincipal as supabase } from '@/lib/supabase'
import { Tables, TablesInsert } from '@/types/database.types'

type Exercise = Tables<'exercises'>
type ExerciseInsert = TablesInsert<'exercises'>

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')

    let query = supabase
      .from('exercises')
      .select(`
        *,
        created_by_user:users!exercises_created_by_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: exercises, error } = await query

    if (error) {
      console.error('Error fetching exercises:', error)
      return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
    }

    return NextResponse.json(exercises)
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

    // Verificar se o usuário tem permissão para criar exercícios (admin ou mentor)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !['admin', 'mentor'].includes(userData.role || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const exerciseData: ExerciseInsert = {
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      difficulty: body.difficulty || null,
      video_url: body.video_url || null,
      muscle_group: body.muscle_group || null,
      duration_minutes: body.duration_minutes || null,
      repetitions: body.repetitions || null,
      sets: body.sets || null,
      created_by: user.id
    }

    const { data: exercise, error } = await supabase
      .from('exercises')
      .insert(exerciseData)
      .select(`
        *,
        created_by_user:users!exercises_created_by_fkey(full_name, email)
      `)
      .single()

    if (error) {
      console.error('Error creating exercise:', error)
      return NextResponse.json({ error: 'Failed to create exercise' }, { status: 500 })
    }

    return NextResponse.json(exercise, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 