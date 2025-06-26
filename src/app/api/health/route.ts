import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Verificar conexão com Supabase
    const { data: healthCheck, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single()

    if (error) {
      console.error('Health check failed:', error)
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          timestamp: new Date().toISOString(),
          error: 'Database connection failed',
          details: error.message
        },
        { status: 503 }
      )
    }

    // Verificar se há dados básicos
    const { data: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' })

    const { data: projectCount } = await supabase
      .from('projects')
      .select('id', { count: 'exact' })

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: true,
        users: userCount?.length || 0,
        projects: projectCount?.length || 0
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Permitir CORS para monitoramento externo
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
} 