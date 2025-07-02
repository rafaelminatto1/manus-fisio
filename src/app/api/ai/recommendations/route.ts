import { NextRequest, NextResponse } from 'next/server';
import { AIEngine, PatientProfile } from '@/services/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile } = body;

    // Validar dados obrigatórios
    if (!profile || !profile.age || !profile.condition || !profile.severity || 
        profile.painLevel === undefined || !profile.lifestyle) {
      return NextResponse.json(
        { error: 'Dados do perfil incompletos' },
        { status: 400 }
      );
    }

    // Gerar recomendação usando IA
    const recommendation = AIEngine.generateRecommendation(profile as PatientProfile);

    // Log para auditoria
    console.log('🤖 IA Recommendation Generated:', {
      condition: profile.condition,
      severity: profile.severity,
      confidence: recommendation.confidence,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      recommendation,
      metadata: {
        generated_at: new Date().toISOString(),
        engine_version: '1.0',
        profile_completeness: 100
      }
    });

  } catch (error) {
    console.error('❌ Erro ao gerar recomendação de IA:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: '🤖 API de Recomendações de IA - Manus Fisio',
    version: '1.0',
    endpoints: {
      'POST /api/ai/recommendations': 'Gerar recomendação baseada no perfil do paciente'
    },
    status: 'ativo',
    features: [
      'Análise inteligente de perfil',
      'Recomendações personalizadas',
      'Base de conhecimento clínico',
      'Score de confiança',
      'Justificativa baseada em evidências'
    ]
  });
} 