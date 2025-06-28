import { NextRequest } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    // Simular recomendações baseadas em IA
    const recommendations = [
      {
        id: '1',
        type: 'project',
        title: 'Otimizar Protocolo de Reabilitação',
        description: 'Com base nos dados, pacientes com lesões similares respondem melhor a exercícios funcionais nas primeiras 3 semanas.',
        confidence: 87,
        reasoning: 'Análise de 150+ casos similares mostra 23% melhora no tempo de recuperação',
        actionable: true,
        priority: 'high'
      },
      {
        id: '2',
        type: 'notebook',
        title: 'Padronizar Documentação de Avaliação',
        description: 'Criar template para avaliação inicial que inclua escalas de dor e testes funcionais específicos.',
        confidence: 92,
        reasoning: 'Templates estruturados reduzem tempo de documentação em 40%',
        actionable: true,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'mentorship',
        title: 'Revisar Cronograma de Supervisão',
        description: 'Estagiários com supervisão semanal mostram 35% melhor performance em avaliações.',
        confidence: 78,
        reasoning: 'Dados históricos de 24 meses de programa de estágio',
        actionable: true,
        priority: 'medium'
      },
      {
        id: '4',
        type: 'task',
        title: 'Implementar Sistema de Feedback',
        description: 'Pacientes que recebem feedback estruturado têm 28% maior aderência ao tratamento.',
        confidence: 84,
        reasoning: 'Meta-análise de estudos sobre aderência em fisioterapia',
        actionable: true,
        priority: 'high'
      }
    ]

    return Response.json({ recommendations })

  } catch (error) {
    console.error('Recommendations Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 