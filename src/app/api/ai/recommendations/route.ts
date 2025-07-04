import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createServerAuthClient } from '@/lib/auth-server';
import { z } from 'zod';

const RecommendationRequestSchema = z.object({
  patientId: z.string(),
  context: z.enum(['treatment', 'exercise', 'lifestyle', 'followup', 'general']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  includeExercises: z.boolean().optional().default(true),
  includeLifestyle: z.boolean().optional().default(true),
  maxRecommendations: z.number().min(1).max(20).optional().default(10)
});

interface AIRecommendation {
  id: string;
  type: 'exercise' | 'treatment' | 'lifestyle' | 'followup' | 'medication' | 'referral';
  title: string;
  description: string;
  rationale: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  timeframe: string;
  category: string;
  actionItems: string[];
  expectedOutcome: string;
  contraindications: string[];
  evidenceLevel: 'low' | 'moderate' | 'high';
  tags: string[];
  createdAt: string;
}

async function generateAIRecommendations(
  patientId: string,
  context: string,
  patientData: any,
  options: {
    priority?: string;
    includeExercises: boolean;
    includeLifestyle: boolean;
    maxRecommendations: number;
  }
): Promise<AIRecommendation[]> {
  const recommendations: AIRecommendation[] = [];
  const currentDate = new Date();

  // Analyze patient data to generate contextual recommendations
  const hasEvaluations = patientData.physiotherapy_evaluations?.length > 0;
  const hasPrescriptions = patientData.exercise_prescriptions?.length > 0;
  const mainComplaint = hasEvaluations ? patientData.physiotherapy_evaluations[0]?.main_complaint : null;
  const painScale = hasEvaluations ? patientData.physiotherapy_evaluations[0]?.pain_scale_initial : null;

  // Generate exercise recommendations
  if (options.includeExercises && context !== 'lifestyle') {
    if (mainComplaint?.toLowerCase().includes('lombar') || mainComplaint?.toLowerCase().includes('costas')) {
      recommendations.push({
        id: `rec_exercise_${patientId}_${Date.now()}_1`,
        type: 'exercise',
        title: 'Programa de Estabilização Lombar',
        description: 'Implementar exercícios de estabilização do core para fortalecer a musculatura profunda da coluna',
        rationale: 'Baseado na queixa principal de dor lombar, exercícios de estabilização são fundamentais para reduzir episódios de dor e melhorar a função',
        priority: painScale > 7 ? 'high' : 'medium',
        confidence: 88,
        timeframe: '2-4 semanas',
        category: 'Fortalecimento',
        actionItems: [
          'Iniciar com exercícios isométricos básicos',
          'Progredir para exercícios dinâmicos após 1 semana',
          'Incluir exercícios funcionais na 3ª semana',
          'Monitorar tolerância e ajustar intensidade'
        ],
        expectedOutcome: 'Redução da dor em 30-50% e melhora da estabilidade funcional',
        contraindications: ['Dor aguda severa', 'Instabilidade vertebral não diagnosticada'],
        evidenceLevel: 'high',
        tags: ['lombar', 'core', 'estabilização', 'fortalecimento'],
        createdAt: currentDate.toISOString()
      });
    }

    if (mainComplaint?.toLowerCase().includes('cervical') || mainComplaint?.toLowerCase().includes('pescoço')) {
      recommendations.push({
        id: `rec_exercise_${patientId}_${Date.now()}_2`,
        type: 'exercise',
        title: 'Mobilização e Fortalecimento Cervical',
        description: 'Programa combinado de mobilização articular e fortalecimento da musculatura cervical',
        rationale: 'Disfunções cervicais respondem bem à combinação de mobilização e fortalecimento específico',
        priority: 'medium',
        confidence: 85,
        timeframe: '3-6 semanas',
        category: 'Mobilização',
        actionItems: [
          'Iniciar com mobilização passiva suave',
          'Introduzir exercícios ativos após redução da dor',
          'Progressão para fortalecimento isométrico',
          'Incluir exercícios posturais'
        ],
        expectedOutcome: 'Melhora da amplitude de movimento e redução da tensão muscular',
        contraindications: ['Instabilidade cervical', 'Radiculopatia aguda'],
        evidenceLevel: 'high',
        tags: ['cervical', 'mobilização', 'postura'],
        createdAt: currentDate.toISOString()
      });
    }
  }

  // Generate treatment recommendations
  if (context === 'treatment' || context === 'general') {
    recommendations.push({
      id: `rec_treatment_${patientId}_${Date.now()}_1`,
      type: 'treatment',
      title: 'Reavaliação Funcional Periódica',
      description: 'Implementar avaliações funcionais regulares para monitorar progresso e ajustar tratamento',
      rationale: 'Avaliações periódicas permitem ajustes precisos no plano de tratamento baseados na evolução do paciente',
      priority: 'medium',
      confidence: 92,
      timeframe: 'A cada 2-3 semanas',
      category: 'Avaliação',
      actionItems: [
        'Agendar reavaliação a cada 2-3 semanas',
        'Aplicar escalas funcionais padronizadas',
        'Documentar mudanças objetivas',
        'Ajustar plano conforme evolução'
      ],
      expectedOutcome: 'Otimização do plano de tratamento e melhores resultados funcionais',
      contraindications: [],
      evidenceLevel: 'high',
      tags: ['avaliação', 'monitoramento', 'progresso'],
      createdAt: currentDate.toISOString()
    });

    if (painScale > 6) {
      recommendations.push({
        id: `rec_treatment_${patientId}_${Date.now()}_2`,
        type: 'treatment',
        title: 'Protocolo de Controle da Dor',
        description: 'Implementar estratégias multimodais para controle da dor antes de progredir para exercícios mais intensos',
        rationale: 'Controle adequado da dor é fundamental para participação efetiva no programa de reabilitação',
        priority: 'high',
        confidence: 90,
        timeframe: '1-2 semanas',
        category: 'Controle da Dor',
        actionItems: [
          'Aplicar modalidades físicas (gelo/calor)',
          'Técnicas de relaxamento e respiração',
          'Educação sobre manejo da dor',
          'Considerar modalidades eletroterapêuticas'
        ],
        expectedOutcome: 'Redução da dor para níveis funcionais (< 4/10)',
        contraindications: ['Contraindicações específicas às modalidades'],
        evidenceLevel: 'moderate',
        tags: ['dor', 'modalidades', 'educação'],
        createdAt: currentDate.toISOString()
      });
    }
  }

  // Generate lifestyle recommendations
  if (options.includeLifestyle) {
    recommendations.push({
      id: `rec_lifestyle_${patientId}_${Date.now()}_1`,
      type: 'lifestyle',
      title: 'Educação Postural e Ergonômica',
      description: 'Programa educacional sobre postura adequada e ergonomia no trabalho e atividades diárias',
      rationale: 'Modificações posturais e ergonômicas são essenciais para prevenção de recidivas e manutenção dos ganhos terapêuticos',
      priority: 'medium',
      confidence: 87,
      timeframe: 'Contínuo',
      category: 'Educação',
      actionItems: [
        'Avaliar posto de trabalho e atividades diárias',
        'Fornecer orientações ergonômicas específicas',
        'Ensinar exercícios de pausa no trabalho',
        'Criar lembretes para correção postural'
      ],
      expectedOutcome: 'Redução de fatores de risco e prevenção de recidivas',
      contraindications: [],
      evidenceLevel: 'moderate',
      tags: ['educação', 'postura', 'ergonomia', 'prevenção'],
      createdAt: currentDate.toISOString()
    });

    recommendations.push({
      id: `rec_lifestyle_${patientId}_${Date.now()}_2`,
      type: 'lifestyle',
      title: 'Programa de Atividade Física Regular',
      description: 'Desenvolvimento de rotina de atividade física adaptada às condições e preferências do paciente',
      rationale: 'Atividade física regular é fundamental para manutenção da saúde musculoesquelética e prevenção de recidivas',
      priority: 'medium',
      confidence: 85,
      timeframe: 'Longo prazo',
      category: 'Atividade Física',
      actionItems: [
        'Avaliar preferências e limitações do paciente',
        'Recomendar atividades apropriadas',
        'Estabelecer metas graduais e realistas',
        'Monitorar aderência e progressão'
      ],
      expectedOutcome: 'Melhora da condição física geral e qualidade de vida',
      contraindications: ['Limitações médicas específicas'],
      evidenceLevel: 'high',
      tags: ['atividade física', 'condicionamento', 'qualidade de vida'],
      createdAt: currentDate.toISOString()
    });
  }

  // Generate follow-up recommendations
  if (context === 'followup' || context === 'general') {
    recommendations.push({
      id: `rec_followup_${patientId}_${Date.now()}_1`,
      type: 'followup',
      title: 'Protocolo de Acompanhamento Pós-Alta',
      description: 'Estabelecer plano de acompanhamento após conclusão do tratamento intensivo',
      rationale: 'Acompanhamento pós-alta reduz significativamente as taxas de recidiva e mantém os ganhos obtidos',
      priority: 'medium',
      confidence: 88,
      timeframe: '3-6 meses pós-alta',
      category: 'Acompanhamento',
      actionItems: [
        'Agendar consulta de revisão em 1 mês',
        'Consulta de seguimento em 3 meses',
        'Avaliação final em 6 meses',
        'Disponibilizar canal de comunicação para dúvidas'
      ],
      expectedOutcome: 'Manutenção dos ganhos terapêuticos e prevenção de recidivas',
      contraindications: [],
      evidenceLevel: 'moderate',
      tags: ['acompanhamento', 'prevenção', 'manutenção'],
      createdAt: currentDate.toISOString()
    });
  }

  // Filter by priority if specified
  if (options.priority) {
    return recommendations
      .filter(rec => rec.priority === options.priority)
      .slice(0, options.maxRecommendations);
  }

  // Sort by priority and confidence, then limit
  return recommendations
    .sort((a, b) => {
      const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    })
    .slice(0, options.maxRecommendations);
}

export async function POST(req: NextRequest) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    const body = await req.json();
    const { 
      patientId, 
      context, 
      priority, 
      includeExercises, 
      includeLifestyle, 
      maxRecommendations 
    } = RecommendationRequestSchema.parse(body);

    const supabase = await createServerAuthClient();
    
    // Fetch comprehensive patient data
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        physiotherapy_evaluations(*),
        exercise_prescriptions(*)
      `)
      .eq('id', patientId)
      .single();

    if (patientError) {
      console.error('Error fetching patient data:', patientError);
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Generate AI-powered recommendations
    const recommendations = await generateAIRecommendations(
      patientId,
      context,
      patientData,
      {
        priority,
        includeExercises,
        includeLifestyle,
        maxRecommendations
      }
    );

    // Generate summary statistics
    const summary = {
      totalRecommendations: recommendations.length,
      highPriorityCount: recommendations.filter(r => r.priority === 'high' || r.priority === 'urgent').length,
      averageConfidence: Math.round(recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length),
      categories: [...new Set(recommendations.map(r => r.category))],
      evidenceLevels: {
        high: recommendations.filter(r => r.evidenceLevel === 'high').length,
        moderate: recommendations.filter(r => r.evidenceLevel === 'moderate').length,
        low: recommendations.filter(r => r.evidenceLevel === 'low').length
      }
    };

    return NextResponse.json({
      patientId,
      context,
      summary,
      recommendations,
      generatedAt: new Date().toISOString(),
      metadata: {
        version: '2.0',
        aiModel: 'clinical-recommendations-v2',
        dataQuality: 'high'
      }
    });

  } catch (error) {
    console.error('AI Recommendations Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
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