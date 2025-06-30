import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { z } from 'zod'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const WritingAssistantRequestSchema = z.object({
  text: z.string(),
  context: z.string().optional(),
  action: z.enum(['improve', 'suggest_goals', 'summarize']),
})

async function runAIAssistant(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error calling AI model:', error)
    throw new Error('Failed to get response from AI model.')
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await authenticateRequest(req)
    if (authError) {
      return authError
    }

    const body = await req.json()
    const { text, context, action } = WritingAssistantRequestSchema.parse(body)

    let resultText = ''
    const baseContext = `Você é um assistente de IA especializado em fisioterapia. Sua tarefa é ajudar fisioterapeutas a escrever documentação clínica de alta qualidade. Seja conciso, profissional e use terminologia adequada.`
    
    let prompt = ''

    switch (action) {
      case 'improve':
        prompt = `${baseContext}\n\nMelhore o seguinte texto de uma anotação clínica. Foque em clareza, concisão e profissionalismo. Contexto adicional: ${context || 'Nenhum'}.\n\nTexto para melhorar: "${text}"`
        resultText = await runAIAssistant(prompt)
        break
      case 'suggest_goals':
        prompt = `${baseContext}\n\nCom base na seguinte anotação clínica, sugira 3-4 objetivos de tratamento de curto prazo, seguindo o formato SMART (Específico, Mensurável, Atingível, Relevante, Temporal). Retorne apenas a lista de objetivos.\n\nContexto: "${text}"`
        resultText = await runAIAssistant(prompt)
        break
      case 'summarize':
        prompt = `${baseContext}\n\nResuma a seguinte anotação clínica em 2-3 frases curtas, destacando o estado atual do paciente, o tratamento aplicado e o plano futuro. Retorne apenas o resumo.\n\nContexto: "${text}"`
        resultText = await runAIAssistant(prompt)
        break
      default:
        return new Response('Invalid action', { status: 400 })
    }

    return NextResponse.json({ result: resultText })

  } catch (error) {
    console.error('Writing Assistant Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    return new Response('Internal Server Error', { status: 500 })
  }
} 