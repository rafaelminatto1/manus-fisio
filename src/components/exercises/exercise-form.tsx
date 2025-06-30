'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'

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

interface ExerciseFormProps {
  exercise?: Exercise
  onSave: (exercise: Exercise) => void
  onCancel: () => void
}

const categories = [
  'Fortalecimento',
  'Mobilidade', 
  'Alongamento',
  'Estabilização',
  'Coordenação',
  'Equilíbrio',
  'Funcional'
]

const anatomicalRegions = [
  'Cervical', 
  'Membros Superiores',
  'Tronco',
  'Membros Inferiores',
  'Mobilidade Geral',
  'Core/Estabilização'
]

const difficultyLevels = [
  { value: 1, label: 'Muito Fácil' },
  { value: 2, label: 'Fácil' },
  { value: 3, label: 'Moderado' },
  { value: 4, label: 'Difícil' },
  { value: 5, label: 'Muito Difícil' }
]

export function ExerciseForm({ exercise, onSave, onCancel }: ExerciseFormProps) {
  const [formData, setFormData] = useState<Exercise>({
    name: exercise?.name || '',
    description: exercise?.description || '',
    category: exercise?.category || '',
    anatomical_region: exercise?.anatomical_region || '',
    video_url: exercise?.video_url || '',
    difficulty_level: exercise?.difficulty_level || 1,
    duration: exercise?.duration || undefined,
    muscle_group: exercise?.muscle_group || '',
    indications: exercise?.indications || '',
    contraindications: exercise?.contraindications || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nome do exercício é obrigatório')
      return
    }

    if (!formData.category) {
      toast.error('Categoria é obrigatória')
      return
    }

    if (!formData.anatomical_region) {
      toast.error('Região anatômica é obrigatória')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSave({
        ...formData,
        id: exercise?.id || Date.now().toString()
      })
      
      toast.success(exercise ? 'Exercício atualizado!' : 'Exercício criado!')
    } catch (error) {
      toast.error('Erro ao salvar exercício')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof Exercise, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <h1 className="text-2xl font-bold tracking-tight">
            {exercise ? 'Editar Exercício' : 'Novo Exercício'}
          </h1>
          <p className="text-muted-foreground">
            {exercise ? 'Atualize as informações do exercício' : 'Adicione um novo exercício à biblioteca'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Exercício</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Exercício *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Ex: Rotação Cervical Ativa"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="muscle_group">Grupo Muscular</Label>
                  <Input
                    id="muscle_group"
                    value={formData.muscle_group}
                    onChange={(e) => handleChange('muscle_group', e.target.value)}
                    placeholder="Ex: Músculos cervicais, Trapézio superior"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Descreva detalhadamente como executar o exercício, posição inicial, movimento e posição final..."
                  rows={4}
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Categorization */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Classificação</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="anatomical_region">Região Anatômica *</Label>
                  <Select 
                    value={formData.anatomical_region} 
                    onValueChange={(value) => handleChange('anatomical_region', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a região anatômica" />
                    </SelectTrigger>
                    <SelectContent>
                      {anatomicalRegions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Nível de Dificuldade *</Label>
                  <Select 
                    value={formData.difficulty_level.toString()} 
                    onValueChange={(value) => handleChange('difficulty_level', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value.toString()}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duração Sugerida (segundos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration || ''}
                    onChange={(e) => handleChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Ex: 30"
                    min="1"
                    max="300"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Clinical Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informações Clínicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="indications">Indicações</Label>
                  <Textarea
                    id="indications"
                    value={formData.indications}
                    onChange={(e) => handleChange('indications', e.target.value)}
                    placeholder="Ex: Rigidez cervical, torticolo, tensão muscular..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contraindications">Contraindicações</Label>
                  <Textarea
                    id="contraindications"
                    value={formData.contraindications}
                    onChange={(e) => handleChange('contraindications', e.target.value)}
                    placeholder="Ex: Instabilidade cervical, vertigem severa..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Media */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Mídia</h3>
              
              <div className="space-y-2">
                <Label htmlFor="video_url">URL do Vídeo Demonstrativo</Label>
                <Input
                  id="video_url"
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => handleChange('video_url', e.target.value)}
                  placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                />
                <p className="text-xs text-muted-foreground">
                  Adicione um link para vídeo demonstrativo do exercício (YouTube, Vimeo, etc.)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {exercise ? 'Atualizar Exercício' : 'Criar Exercício'}
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
  )
} 