import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { Database } from '@/types/database.types'

const recordSchema = z.object({
  content: z.any(), // O conteúdo do editor rico (Tiptap) é um JSON complexo
  session_date: z.string().optional(),
})

// GET all records for a specific patient
export async function GET(request: NextRequest) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )
  const url = new URL(request.url)
  // O ID do paciente é o penúltimo segmento da URL: /api/patients/{id}/records
  const pathSegments = url.pathname.split('/')
  const patientId = pathSegments[pathSegments.length - 2]

  if (!patientId) {
    return NextResponse.json({ error: 'ID do paciente não encontrado na URL.' }, { status: 400 })
  }

  try {
    const { data: records, error } = await supabase
      .from('patient_records')
      .select('*, created_by(full_name)') // Junta com a tabela de usuários para pegar o nome do fisio
      .eq('patient_id', patientId)
      .order('session_date', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar prontuários.' },
      { status: 500 }
    )
  }
}

// POST a new record for a specific patient
export async function POST(
  request: NextRequest
) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )
  const url = new URL(request.url)
  const pathSegments = url.pathname.split('/')
  const patientId = pathSegments[pathSegments.length - 2]

  if (!patientId) {
    return NextResponse.json({ error: 'ID do paciente não encontrado na URL.' }, { status: 400 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validation = recordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { content, session_date } = validation.data

    const { data: newRecord, error } = await supabase
      .from('patient_records')
      .insert({
        patient_id: patientId,
        created_by: user.id,
        content: content,
        session_date: session_date || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar prontuário.' },
      { status: 500 }
    )
  }
} 