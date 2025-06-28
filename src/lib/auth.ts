import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types'; // Assumindo que você tem este tipo

// Configuração do Supabase para o lado do servidor
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar a service role key para validação de token no backend
);

export async function authenticateRequest(req: NextRequest): Promise<NextResponse | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse('Unauthorized: Missing or invalid Authorization header', { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validar o token JWT usando o Supabase Auth
    // Nota: Para validação de token de sessão de usuário, o ideal é usar supabase.auth.getUser()
    // que verifica o token e retorna o usuário.
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Authentication error:', error?.message || 'User not found');
      return new NextResponse('Unauthorized: Invalid token', { status: 401 });
    }

    // Se a autenticação for bem-sucedida, você pode anexar o objeto 'user' à requisição
    // ou retornar o 'user' para ser usado na rota.
    // Para Next.js, como 'req' é imutável, você pode retornar o user e a rota o utiliza.
    // Por simplicidade, aqui retornamos null para sucesso e a rota pode inferir o usuário
    // ou você pode modificar esta função para retornar { user: user } em caso de sucesso.
    // Por enquanto, vamos manter o null para sucesso e a rota fará a própria validação.
    return null; // Autenticação bem-sucedida
  } catch (error) {
    console.error('Token validation failed:', error);
    return new NextResponse('Unauthorized: Token validation failed', { status: 401 });
  }
}