'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, TestTube } from 'lucide-react'

interface FunctionalTest {
  id: string
  name: string
  description: string
  category: 'Neurológico' | 'Ortopédico' | 'Postural' | 'Funcional'
  region: string
  procedure: string[]
  interpretations: {
    positive: string
    negative: string
  }
}

const functionalTests: FunctionalTest[] = [
  {
    id: 'lasegue',
    name: 'Teste de Lasègue',
    description: 'Avalia comprometimento do nervo ciático',
    category: 'Neurológico',
    region: 'Lombar/MMII',
    procedure: [
      'Paciente em decúbito dorsal',
      'Elevar o membro inferior estendido',
      'Observar aparecimento de dor',
      'Anotar ângulo em que aparece a dor'
    ],
    interpretations: {
      positive: 'Dor irradiada para MMII entre 30-70° - suspeita de compressão radicular',
      negative: 'Ausência de dor irradiada - teste normal'
    }
  },
  {
    id: 'phalen',
    name: 'Teste de Phalen',
    description: 'Avalia síndrome do túnel do carpo',
    category: 'Neurológico',
    region: 'Punho/Mão',
    procedure: [
      'Paciente flexiona punhos a 90°',
      'Manter posição por 1 minuto',
      'Observar sintomas nas mãos'
    ],
    interpretations: {
      positive: 'Formigamento/dormência no território do mediano - síndrome do túnel do carpo',
      negative: 'Ausência de sintomas - teste normal'
    }
  },
  {
    id: 'thomas',
    name: 'Teste de Thomas',
    description: 'Avalia encurtamento do psoas',
    category: 'Ortopédico',
    region: 'Quadril',    
    procedure: [
      'Paciente sentado na borda da maca',
      'Flexionar um quadril ao peito',
      'Deitar mantendo flexão',
      'Observar posição do membro contralateral'
    ],
    interpretations: {
      positive: 'Membro contralateral em flexão - encurtamento do psoas',
      negative: 'Membro contralateral estendido - flexibilidade normal'
    }
  }
]

interface TestResult {
  testId: string
  result: 'positive' | 'negative' | 'inconclusive'
  notes: string
  date: string
}

interface FunctionalTestsProps {
  onSaveResult?: (result: TestResult) => void
  patientResults?: TestResult[]
  className?: string
}

export function FunctionalTests({ 
  onSaveResult, 
  patientResults = [], 
  className 
}: FunctionalTestsProps) {
  const [selectedTest, setSelectedTest] = useState<FunctionalTest | null>(null)
  const [currentResult, setCurrentResult] = useState<'positive' | 'negative' | 'inconclusive' | null>(null)
  const [notes, setNotes] = useState('')

  const handleSaveResult = () => {
    if (!selectedTest || !currentResult) return
    
    const result: TestResult = {
      testId: selectedTest.id,
      result: currentResult,
      notes,
      date: new Date().toISOString()
    }
    
    onSaveResult?.(result)
    setCurrentResult(null)
    setNotes('')
    setSelectedTest(null)
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'positive':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'negative':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inconclusive':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Neurológico': return 'bg-purple-100 text-purple-800'
      case 'Ortopédico': return 'bg-blue-100 text-blue-800'
      case 'Postural': return 'bg-green-100 text-green-800'
      case 'Funcional': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Lista de Testes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Testes Funcionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {functionalTests.map((test) => {
              const hasResult = patientResults.find(r => r.testId === test.id)
              
              return (
                <div
                  key={test.id}
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition-colors',
                    selectedTest?.id === test.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{test.name}</h3>
                      <p className="text-sm text-gray-600">{test.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasResult && getResultIcon(hasResult.result)}
                      <Badge className={getCategoryColor(test.category)}>
                        {test.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Região: {test.region}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Teste Selecionado */}
      {selectedTest && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTest.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Procedimento:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {selectedTest.procedure.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="font-medium mb-2">Interpretação:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <strong>Positivo:</strong> {selectedTest.interpretations.positive}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <strong>Negativo:</strong> {selectedTest.interpretations.negative}
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div>
              <h4 className="font-medium mb-2">Resultado do Teste:</h4>
              <div className="flex gap-2 mb-3">
                <Button
                  size="sm"
                  variant={currentResult === 'positive' ? 'default' : 'outline'}
                  onClick={() => setCurrentResult('positive')}
                  className="text-red-600"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Positivo
                </Button>
                <Button
                  size="sm"
                  variant={currentResult === 'negative' ? 'default' : 'outline'}
                  onClick={() => setCurrentResult('negative')}
                  className="text-green-600"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Negativo
                </Button>
                <Button
                  size="sm"
                  variant={currentResult === 'inconclusive' ? 'default' : 'outline'}
                  onClick={() => setCurrentResult('inconclusive')}
                  className="text-yellow-600"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Inconclusivo
                </Button>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Observações:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border rounded-md h-20"
                placeholder="Adicione observações sobre o teste..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTest(null)
                  setCurrentResult(null)
                  setNotes('')
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveResult}
                disabled={!currentResult}
              >
                Salvar Resultado
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Resultados */}
      {patientResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patientResults.map((result, index) => {
                const test = functionalTests.find(t => t.id === result.testId)
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{test?.name}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(result.date).toLocaleDateString('pt-BR')}
                      </div>
                      {result.notes && (
                        <div className="text-xs text-gray-500 mt-1">{result.notes}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getResultIcon(result.result)}
                      <span className="text-sm capitalize">{result.result}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 