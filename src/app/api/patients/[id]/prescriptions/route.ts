import { createServerClient } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database.types';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient();
  const patientId = params.id;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Aqui, idealmente, haveria uma verificação se o usuário logado
  // (seja ele um fisioterapeuta ou o próprio paciente) tem permissão para ver essas prescrições.
  // Por enquanto, vamos permitir o acesso se estiver logado.

  const { data, error } = await supabase
    .from('exercise_prescriptions')
    .select(`
      id,
      sets,
      repetitions,
      frequency,
      notes,
      exercise:exercises (
        id,
        name,
        description,
        video_url,
        category
      )
    `)
    .eq('patient_id', patientId);

  if (error) {
    console.error('Error fetching exercise prescriptions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
} 