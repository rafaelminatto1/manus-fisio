import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import type { Database } from '@/types/database.types'

const patientUpdateSchema = z.object({
  full_name: z.string().min(3, 'Nome completo é obrigatório').optional(),
  birth_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data de nascimento inválida',
  }).optional(),
  gender: z.string().optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  initial_medical_history: z.string().optional(),
})


// GET a single patient by ID
export async function GET(
  request: Request
) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: 'ID do paciente não encontrado na URL.' }, { status: 400 });
  }

  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !patient) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

// UPDATE a patient by ID
export async function PUT(
  request: Request
) {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'ID do paciente não encontrado na URL.' }, { status: 400 });
    }

    try {
        const body = await request.json()
        const validation = patientUpdateSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 })
        }

        const { data: updatedPatient, error } = await supabase
            .from('patients')
            .update(validation.data)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: 'Erro ao atualizar paciente.' }, { status: 500 })
        }

        return NextResponse.json(updatedPatient)

    } catch (error) {
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
    }
}


// DELETE a patient by ID
export async function DELETE(
  request: Request
) {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'ID do paciente não encontrado na URL.' }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: 'Erro ao deletar paciente.' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Paciente deletado com sucesso' }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
    }
} 