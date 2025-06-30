import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    const body = await req.json();
    const { patientId, analysisType } = body;

    const insights = [{
      id: 'timeline_1',
      type: 'timeline',
      title: 'Previsão de Recuperação',
      description: 'Estimamos 4-6 semanas para recuperação completa',
      confidence: 87,
      timeframe: '4-6 semanas',
      priority: 'medium',
      metrics: { current: 70, predicted: 90, improvement: 20, unit: '% função' },
      recommendations: ['Manter exercícios', 'Intensificar funcionais'],
      riskFactors: [],
      evidenceBased: true
    }];

    return Response.json({ patientId, analysisType, insights, generatedAt: new Date().toISOString() })
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 })
  }
}
