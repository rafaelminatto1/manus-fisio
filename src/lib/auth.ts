import { NextRequest, NextResponse } from 'next/server';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server'; // Importando o cliente de servidor

export const createClient = supabaseCreateClient;
export const isMockMode = () => process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
export const mockUser = {
  id: 'mock-user',
  email: 'mock@mock.com',
  full_name: 'Usuário Mock',
  role: 'admin',
};

export async function authenticateRequest(req: NextRequest): Promise<NextResponse | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse('Unauthorized: Missing or invalid Authorization header', { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const supabase = createServerClient(); // Instancia o cliente de servidor
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Authentication error:', error?.message || 'User not found');
      return new NextResponse('Unauthorized: Invalid token', { status: 401 });
    }
    
    return null; // Autenticação bem-sucedida
  } catch (error) {
    console.error('Token validation failed:', error);
    return new NextResponse('Unauthorized: Token validation failed', { status: 401 });
  }
}