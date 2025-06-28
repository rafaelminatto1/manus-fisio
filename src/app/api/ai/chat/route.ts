import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { z } from 'zod'

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
});

// Configuração da OpenAI (simulada - para demo)
const fakeOpenAI = {
  chat: {
    completions: {
      create: async (params: any) => {
        // Simulação de resposta da IA para demo
        const userMessage = params.messages[params.messages.length - 1]?.content || ''
        
        let response = ''
        
        if (userMessage.toLowerCase().includes('fisioterapia')) {
          response = `Como especialista em fisioterapia, posso ajudar você com:

🏥 **Avaliação e Diagnóstico**
- Análise postural
- Testes funcionais
- Identificação de disfunções

💪 **Tratamentos Especializados**
- Exercícios terapêuticos
- Técnicas manuais
- Eletroterapia

📋 **Gestão Clínica**
- Planejamento de sessões
- Acompanhamento de evolução
- Documentação médica

Sobre o que específico você gostaria de saber?`
        } else if (userMessage.toLowerCase().includes('projeto') || userMessage.toLowerCase().includes('notebook')) {
          response = `Vou ajudar você com gestão de projetos e notebooks! 📚

**Para Projetos:**
- Definição de objetivos claros
- Cronograma realista
- Acompanhamento de progresso
- Gestão de equipe

**Para Notebooks:**
- Estruturação de conteúdo
- Templates médicos
- Documentação eficiente
- Organização de informações

Qual aspecto você gostaria de explorar?`
        } else if (userMessage.toLowerCase().includes('analytics') || userMessage.toLowerCase().includes('dados')) {
          response = `Análise de dados é fundamental para uma clínica eficiente! 📊

**Métricas Importantes:**
- Taxa de satisfação dos pacientes
- Tempo médio de tratamento
- Eficácia dos protocolos
- Performance da equipe

**Insights Acionáveis:**
- Identificar padrões de melhora
- Otimizar agendamentos
- Reduzir tempo de espera
- Melhorar resultados

Que tipo de análise você precisa?`
        } else {
          response = `Olá! Sou seu assistente especializado em fisioterapia e gestão clínica. 🤖

Posso ajudar com:
- 🏥 Questões sobre fisioterapia
- 📋 Gestão de projetos e notebooks
- 📊 Análise de dados e métricas
- 📝 Redação e documentação médica
- 📅 Organização de agenda e equipe

Como posso ajudar você hoje?`
        }

        return {
          choices: [{
            message: {
              content: response,
              role: 'assistant'
            }
          }]
        }
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await authenticateRequest(req);
    if (authError) {
      return authError;
    }

    const body = await req.json();
    const { messages } = ChatRequestSchema.parse(body);

    // Simular streaming de resposta
    const completion = await fakeOpenAI.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const responseText = completion.choices?.[0]?.message?.content || 'Desculpe, não foi possível gerar uma resposta. Tente novamente.'

    // Simular streaming
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const words = responseText.split(' ')
        let index = 0

        const interval = setInterval(() => {
          if (index < words.length) {
            const chunk = words[index] + ' '
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
            index++
          } else {
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            controller.close()
            clearInterval(interval)
          }
        }, 50) // 50ms entre palavras
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (error) {
    console.error('AI Chat Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
} 