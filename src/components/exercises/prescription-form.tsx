'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock, Users, Play, ArrowLeft, Check } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Exercise {
  id?: string
  name: string
  description: string
  category: string
  anatomical_region: string
  video_url?: string
  difficulty_level: number
  duration?: number
  muscle_group?: string
  indications?: string
  contraindications?: string
}

interface Patient {
  id: string
  name: string
  email?: string
}

interface PrescriptionData {
  patient_id: string
  exercise_id: string
  prescribed_sets: number
  prescribed_repetitions: number
  prescribed_duration_minutes?: number
  frequency_per_week: number
  start_date: Date
  end_date?: Date
  observations: string
}

interface PrescriptionFormProps {
  exercise: Exercise
  onSave: (prescription: PrescriptionData) => void
  onCancel: () => void
  loading?: boolean
}

// Mock patients data - In real app, this would come from API
const mockPatients: Patient[] = [
  { id: '1', name: 'João Silva', email: 'joao@email.com' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com' },
  { id: '3', name: 'Pedro Oliveira', email: 'pedro@email.com' },
]

export function PrescriptionForm({ exercise, onSave, onCancel, loading = false }: PrescriptionFormProps) {
  const [formData, setFormData] = useState<PrescriptionData>({
    patient_id: '',
    exercise_id: exercise.id || '',
    prescribed_sets: exercise.category === 'Estabilização' ? 1 : 3,
    prescribed_repetitions: exercise.category === 'Estabilização' ? 1 : 10,
    prescribed_duration_minutes: exercise.duration ? Math.ceil(exercise.duration / 60) : undefined,
    frequency_per_week: 3,
    start_date: new Date(),
    end_date: undefined,
    observations: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    if (formData.patient_id) {
      const patient = mockPatients.find(p => p.id === formData.patient_id)
      setSelectedPatient(patient || null)
    }
  }, [formData.patient_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patient_id) {
      toast.error('Selecione um paciente')
      return
    }

    if (formData.prescribed_sets < 1) {
      toast.error('Número de séries deve ser maior que 0')
      return
    }

    if (formData.prescribed_repetitions < 1) {
      toast.error('Número de repetições deve ser maior que 0')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onSave(formData)
      
      toast.success('Prescrição criada com sucesso!')
    } catch (error) {
      toast.error('Erro ao criar prescrição')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof PrescriptionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 border-green-200'
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 3: return 'bg-orange-100 text-orange-800 border-orange-200'
      case 4: return 'bg-red-100 text-red-800 border-red-200'
      case 5: return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1: return 'Muito Fácil'
      case 2: return 'Fácil'
      case 3: return 'Moderado'
      case 4: return 'Difícil'
      case 5: return 'Muito Difícil'
      default: return 'Não definido'
    }
  }

  const calculateEndDate = () => {
    if (formData.start_date && formData.frequency_per_week) {
      const weeksToComplete = Math.ceil(24 / formData.frequency_per_week) // Assuming 24 sessions
      const endDate = new Date(formData.start_date)
      endDate.setDate(endDate.getDate() + (weeksToComplete * 7))
      return endDate
    }
    return undefined
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prescrever Exercício</h1>
          <p className="text-muted-foreground">
            Configure os parâmetros da prescrição para o paciente
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Detalhes do Exercício
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{exercise.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {exercise.anatomical_region}
                  </Badge>
                  <Badge 
                    className={`text-xs border ${getDifficultyColor(exercise.difficulty_level)}`}
                    variant="outline"
                  >
                    {getDifficultyText(exercise.difficulty_level)}
                  </Badge>
                  {exercise.category && (
                    <Badge variant="outline" className="text-xs">
                      {exercise.category}
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {exercise.description}
              </p>

              {exercise.muscle_group && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Músculos:</span>
                  <span className="font-medium">{exercise.muscle_group}</span>
                </div>
              )}

              {exercise.duration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duração sugerida:</span>
                  <span className="font-medium">{exercise.duration} segundos</span>
                </div>
              )}

              {exercise.indications && (
                <div>
                  <h4 className="font-medium text-sm text-green-700 mb-1">Indicações:</h4>
                  <p className="text-xs text-green-600">{exercise.indications}</p>
                </div>
              )}

              {exercise.contraindications && (
                <div>
                  <h4 className="font-medium text-sm text-red-700 mb-1">Contraindicações:</h4>
                  <p className="text-xs text-red-600">{exercise.contraindications}</p>
                </div>
              )}

              {exercise.video_url && (
                <Button variant="outline" size="sm" className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Assistir Vídeo Demonstrativo
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prescription Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Prescrição</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select 
                    value={formData.patient_id} 
                    onValueChange={(value) => handleChange('patient_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{patient.name}</span>
                            {patient.email && (
                              <span className="text-xs text-muted-foreground">{patient.email}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Exercise Parameters */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Parâmetros do Exercício</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sets">Séries *</Label>
                      <Input
                        id="sets"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.prescribed_sets}
                        onChange={(e) => handleChange('prescribed_sets', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repetitions">Repetições *</Label>
                      <Input
                        id="repetitions"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.prescribed_repetitions}
                        onChange={(e) => handleChange('prescribed_repetitions', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duração (minutos)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="60"
                        value={formData.prescribed_duration_minutes || ''}
                        onChange={(e) => handleChange('prescribed_duration_minutes', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência por Semana *</Label>
                    <Select 
                      value={formData.frequency_per_week.toString()} 
                      onValueChange={(value) => handleChange('frequency_per_week', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1x por semana</SelectItem>
                        <SelectItem value="2">2x por semana</SelectItem>
                        <SelectItem value="3">3x por semana</SelectItem>
                        <SelectItem value="4">4x por semana</SelectItem>
                        <SelectItem value="5">5x por semana</SelectItem>
                        <SelectItem value="6">6x por semana</SelectItem>
                        <SelectItem value="7">Diariamente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Schedule */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Cronograma</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data de Início *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.start_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.start_date ? (
                              format(formData.start_date, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.start_date}
                            onSelect={(date) => handleChange('start_date', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Data de Término (Estimada)</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">
                          {calculateEndDate() ? (
                            format(calculateEndDate()!, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            'Será calculada automaticamente'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Observations */}
                <div className="space-y-2">
                  <Label htmlFor="observations">Observações e Instruções Especiais</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => handleChange('observations', e.target.value)}
                    placeholder="Instruções específicas, adaptações, cuidados especiais..."
                    rows={4}
                  />
                </div>

                {/* Summary */}
                {selectedPatient && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Resumo da Prescrição</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Paciente:</strong> {selectedPatient.name}</p>
                      <p><strong>Exercício:</strong> {exercise.name}</p>
                      <p><strong>Dosagem:</strong> {formData.prescribed_sets} séries × {formData.prescribed_repetitions} repetições</p>
                      {formData.prescribed_duration_minutes && (
                        <p><strong>Duração:</strong> {formData.prescribed_duration_minutes} minutos por sessão</p>
                      )}
                      <p><strong>Frequência:</strong> {formData.frequency_per_week}x por semana</p>
                      <p><strong>Início:</strong> {format(formData.start_date, "dd/MM/yyyy", { locale: ptBR })}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formData.patient_id} 
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Criando Prescrição...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Criar Prescrição
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel} 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
