import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { Database } from '@/types/database.types'

const patientSchema = z.object({
  full_name: z.string().min(3, 'Nome completo é obrigatório'),
  birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data de nascimento inválida',
  }),
  gender: z.string().optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  initial_medical_history: z.string().optional(),
})

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    let query = supabase
      .from('patients')
      .select('id, full_name, email, phone, birth_date, created_at')
      .order('created_at', { ascending: false })

    if (search) {
      // Using ilike for case-insensitive search
      query = query.ilike('full_name', `%${search}%`)
    }

    const { data: patients, error } = await query

    if (error) {
      console.error('Erro ao buscar pacientes:', error)
      throw error
    }

    return NextResponse.json(patients)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar pacientes.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validation = patientSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const { data: newPatient, error } = await supabase
      .from('patients')
      .insert({ ...validation.data, created_by: user.id })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar paciente:', error)
      // TODO: Adicionar verificação de erro mais específica, ex: CPF duplicado
      throw error
    }

    return NextResponse.json(newPatient, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor ao criar paciente.' },
      { status: 500 }
    )
  }
} 