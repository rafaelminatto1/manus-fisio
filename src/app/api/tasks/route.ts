import { createServerClient } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

// GET: Fetch all tasks
export async function GET() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:users(id, full_name, avatar_url),
      creator:users(id, full_name, avatar_url)
    `)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST: Create a new task
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const taskData = (await req.json()) as TaskInsert;

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...taskData, created_by: user.id })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PATCH: Update an existing task (including drag and drop reordering)
export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, ...updateData } = (await req.json()) as { id: string } & TaskUpdate;

  // Handle reordering multiple tasks at once
  if (Array.isArray(updateData) && id === undefined) {
    const updates = updateData.map(task => 
      supabase.from('tasks').update({ status: task.status, order_index: task.order_index }).eq('id', task.id)
    );
    const results = await Promise.all(updates);
    const firstError = results.find(res => res.error);

    if (firstError) {
      console.error('Error batch updating tasks:', firstError.error);
      return NextResponse.json({ error: firstError.error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Tasks reordered successfully' });
  }
  
  // Handle updating a single task
  if (!id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE: Delete a task
export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Task deleted successfully' });
} 