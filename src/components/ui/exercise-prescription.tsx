'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Brain, 
  Play, 
  Plus, 
  Star,
  Clock,
  Target,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface Exercise {
  id: string
  name: string
  description: string
  category: string
  difficulty: number
  duration: number
  videoUrl?: string
  indications: string[]
  contraindications: string[]
  aiScore?: number
  aiReason?: string
}

interface ExercisePrescription {
  exerciseId: string
  sets: number
  repetitions: number
  frequency: string
  notes: string
  progression: 'maintain' | 'increase' | 'decrease'
}

const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Fortalecimento Cervical Isométrico',
    description: 'Exercício de resistência para músculos cervicais profundos',
    category: 'Fortalecimento',
    difficulty: 2,
    duration: 30,
    indications: ['cervicalgia', 'instabilidade_cervical'],
    contraindications: ['fratura_cervical', 'instabilidade_grave'],
    aiScore: 95,
    aiReason: 'Altamente recomendado para cervicalgia crônica com base em 500+ casos similares'
  },
  {
    id: '2',
    name: 'Alongamento Posterior Cervical',
    description: 'Alongamento da musculatura posterior do pescoço',
    category: 'Alongamento',
    difficulty: 1,
    duration: 45,
    indications: ['tensao_cervical', 'cefaleia_tensional'],
    contraindications: ['hipermobilidade'],
    aiScore: 88,
    aiReason: 'Excelente para alívio de tensão muscular baseado em evidências'
  }
]

interface ExercisePrescriptionProps {
  patientId: string
  patientDiagnosis?: string
  onSavePrescription?: (prescriptions: ExercisePrescription[]) => void
}

export function ExercisePrescriptionComponent({ 
  patientId, 
  patientDiagnosis = 'cervicalgia',
  onSavePrescription 
}: ExercisePrescriptionProps) {
  const [selectedExercises, setSelectedExercises] = useState<ExercisePrescription[]>([])
  const [showAIRecommendations, setShowAIRecommendations] = useState(true)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const handleAddExercise = (exercise: Exercise) => {
    const newPrescription: ExercisePrescription = {
      exerciseId: exercise.id,
      sets: 3,
      repetitions: 10,
      frequency: '2x por dia',
      notes: '',
      progression: 'maintain'
    }
    setSelectedExercises([...selectedExercises, newPrescription])
  }

  const handleUpdatePrescription = (index: number, updates: Partial<ExercisePrescription>) => {
    const updated = [...selectedExercises]
    updated[index] = { ...updated[index], ...updates }
    setSelectedExercises(updated)
  }

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
  }

  const generateAIRecommendations = async () => {
    setIsGeneratingAI(true)
    // Simular chamada para API de IA
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGeneratingAI(false)
  }

  const getExerciseById = (id: string) => mockExercises.find(ex => ex.id === id)

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800'
    if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Fácil'
    if (difficulty <= 3) return 'Moderado'
    return 'Difícil'
  }

  return (
    <div className="space-y-6">
      {/* Recomendações IA */}
      {showAIRecommendations && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Recomendações Inteligentes
              <Badge variant="secondary" className="ml-2">IA</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-blue-700">
                Baseado no diagnóstico <strong>{patientDiagnosis}</strong> e em dados de 1000+ pacientes similares
              </p>
              
              <div className="grid gap-4">
                {mockExercises.map((exercise) => (
                  <div key={exercise.id} className="bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{exercise.name}</h4>
                          <Badge className={getDifficultyColor(exercise.difficulty)}>
                            {getDifficultyLabel(exercise.difficulty)}
                          </Badge>
                          {exercise.aiScore && exercise.aiScore > 90 && (
                            <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Top IA
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                        
                        {exercise.aiReason && (
                          <div className="bg-purple-50 p-2 rounded text-xs text-purple-700 mb-2">
                            <strong>💡 IA:</strong> {exercise.aiReason}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {exercise.duration}s
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {exercise.category}
                          </span>
                          {exercise.aiScore && (
                            <span className="flex items-center gap-1 text-purple-600">
                              <Zap className="h-3 w-3" />
                              {exercise.aiScore}% match
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {exercise.videoUrl && (
                          <Button size="sm" variant="outline">
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                        <EnhancedButton
                          size="sm"
                          onClick={() => handleAddExercise(exercise)}
                          leftIcon={<Plus className="h-3 w-3" />}
                          disabled={selectedExercises.some(p => p.exerciseId === exercise.id)}
                        >
                          {selectedExercises.some(p => p.exerciseId === exercise.id) ? 'Adicionado' : 'Adicionar'}
                        </EnhancedButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <EnhancedButton
                  variant="outline"
                  onClick={generateAIRecommendations}
                  loading={isGeneratingAI}
                  loadingText="Gerando recomendações..."
                  leftIcon={<Brain className="h-4 w-4" />}
                >
                  Gerar Mais Recomendações IA
                </EnhancedButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercícios Prescritos */}
      <Card>
        <CardHeader>
          <CardTitle>Prescrição de Exercícios</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum exercício prescrito ainda</p>
              <p className="text-sm">Use as recomendações IA acima para começar</p>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedExercises.map((prescription, index) => {
                const exercise = getExerciseById(prescription.exerciseId)
                if (!exercise) return null

                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium">{exercise.name}</h4>
                        <p className="text-sm text-gray-600">{exercise.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveExercise(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`sets-${index}`}>Séries</Label>
                        <Input
                          id={`sets-${index}`}
                          type="number"
                          value={prescription.sets}
                          onChange={(e) => handleUpdatePrescription(index, { sets: parseInt(e.target.value) })}
                          min={1}
                          max={10}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`reps-${index}`}>Repetições</Label>
                        <Input
                          id={`reps-${index}`}
                          type="number"
                          value={prescription.repetitions}
                          onChange={(e) => handleUpdatePrescription(index, { repetitions: parseInt(e.target.value) })}
                          min={1}
                          max={50}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`freq-${index}`}>Frequência</Label>
                        <select
                          id={`freq-${index}`}
                          value={prescription.frequency}
                          onChange={(e) => handleUpdatePrescription(index, { frequency: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="1x por dia">1x por dia</option>
                          <option value="2x por dia">2x por dia</option>
                          <option value="3x por semana">3x por semana</option>
                          <option value="Diário">Diário</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`prog-${index}`}>Progressão</Label>
                        <select
                          id={`prog-${index}`}
                          value={prescription.progression}
                          onChange={(e) => handleUpdatePrescription(index, { progression: e.target.value as any })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="maintain">Manter</option>
                          <option value="increase">Aumentar</option>
                          <option value="decrease">Diminuir</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor={`notes-${index}`}>Observações</Label>
                      <textarea
                        id={`notes-${index}`}
                        value={prescription.notes}
                        onChange={(e) => handleUpdatePrescription(index, { notes: e.target.value })}
                        className="w-full p-2 border rounded-md h-20"
                        placeholder="Orientações específicas, cuidados, progressão..."
                      />
                    </div>

                    {/* Alertas */}
                    {exercise.contraindications.length > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-yellow-800">
                          <strong>Contraindicações:</strong> {exercise.contraindications.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {selectedExercises.length > 0 && (
            <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
              <Button variant="outline">
                Pré-visualizar Receita
              </Button>
              <EnhancedButton
                onClick={() => onSavePrescription?.(selectedExercises)}
                leftIcon={<CheckCircle className="h-4 w-4" />}
                variant="medical"
              >
                Salvar Prescrição
              </EnhancedButton>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 