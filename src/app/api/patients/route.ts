import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/types/database.types';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('full_name', { ascending: true });

    if (search) {
      query = query.ilike('full_name', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching patients:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();
  
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newPatient = await request.json();

    try {
        const { data, error } = await supabase
        .from('patients')
        .insert({ ...newPatient, created_by: session.user.id })
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  
      return NextResponse.json(data, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 