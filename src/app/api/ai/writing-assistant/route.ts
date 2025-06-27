import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, context, action } = await req.json()

    // Verificar autenticação
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }

    let result: any = {}

    switch (action) {
      case 'improve':
        result.improvedText = improveText(text, context)
        break
      case 'suggest':
        result.suggestions = generateSuggestions(text)
        break
      case 'grammar':
        result.corrections = checkGrammar(text)
        break
      default:
        return new Response('Invalid action', { status: 400 })
    }

    return Response.json(result)

  } catch (error) {
    console.error('Writing Assistant Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

function improveText(text: string, context?: string): string {
  // Simulação de melhoria de texto
  const improvements = [
    'Versão melhorada e mais clara do seu texto:\n\n',
    text
      .replace(/\b(muito|bem|bastante)\b/g, '') // Remove advérbios desnecessários
      .replace(/\b(que|o qual|a qual)\b/g, '') // Simplifica pronomes relativos
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim(),
    '\n\n✨ Melhorias aplicadas: linguagem mais concisa, terminologia técnica adequada, estrutura otimizada.'
  ]
  
  return improvements.join('')
}

function generateSuggestions(text: string): string[] {
  // Simulação de sugestões baseadas no contexto
  const suggestions = [
    '📋 Adicionar seção de "Objetivos do Tratamento"',
    '📊 Incluir métricas de progresso mensuráveis',
    '🎯 Detalhar protocolo de exercícios específicos',
    '📅 Estabelecer cronograma de reavaliações',
    '📝 Documentar contraindicações relevantes',
    '🔍 Adicionar critérios de alta do paciente'
  ]
  
  return suggestions.slice(0, Math.floor(Math.random() * 4) + 2)
}

function checkGrammar(text: string): Array<{issue: string, suggestion: string, position: number}> {
  // Simulação de verificação gramatical
  const corrections = []
  
  // Verificar concordância
  if (text.includes('dados está')) {
    corrections.push({
      issue: 'Concordância incorreta',
      suggestion: 'Alterar "dados está" para "dados estão"',
      position: text.indexOf('dados está')
    })
  }
  
  // Verificar crase
  if (text.includes('a nível')) {
    corrections.push({
      issue: 'Uso incorreto de crase',
      suggestion: 'Alterar "a nível" para "em nível"',
      position: text.indexOf('a nível')
    })
  }
  
  // Verificar redundâncias
  if (text.includes('reavaliar novamente')) {
    corrections.push({
      issue: 'Redundância',
      suggestion: 'Remover "novamente" (reavaliar já indica repetição)',
      position: text.indexOf('reavaliar novamente')
    })
  }
  
  return corrections
} 