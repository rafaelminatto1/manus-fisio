'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Save, X } from 'lucide-react'
import { Tables } from '@/types/database.types'

type Exercise = Tables<'exercises'>

interface ExerciseFormProps {
  exercise?: Exercise
  onSave: (exercise: Partial<Exercise>) => void
  onCancel: () => void
  loading?: boolean
}

const categories = [
  'Fortalecimento',
  'Mobilidade',
  'Alongamento',
  'Coordenação',
  'Equilíbrio',
  'Respiratório',
  'Cardiovascular'
]

const difficulties = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' }
]

const muscleGroups = [
  'Membros Superiores',
  'Membros Inferiores',
  'Core/Abdome',
  'Coluna Vertebral',
  'Pescoço',
  'Tórax',
  'Corpo Todo'
]

export function ExerciseForm({ exercise, onSave, onCancel, loading = false }: ExerciseFormProps) {
  const [formData, setFormData] = useState({
    name: exercise?.name || '',
    description: exercise?.description || '',
    category: exercise?.category || '',
    difficulty: exercise?.difficulty || '',
    video_url: exercise?.video_url || '',
    muscle_group: exercise?.muscle_group || '',
    duration_minutes: exercise?.duration_minutes?.toString() || '',
    repetitions: exercise?.repetitions?.toString() || '',
    sets: exercise?.sets?.toString() || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do exercício é obrigatório'
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória'
    }

    if (formData.video_url && !isValidUrl(formData.video_url)) {
      newErrors.video_url = 'URL do vídeo deve ser válida'
    }

    if (formData.duration_minutes && isNaN(Number(formData.duration_minutes))) {
      newErrors.duration_minutes = 'Duração deve ser um número'
    }

    if (formData.repetitions && isNaN(Number(formData.repetitions))) {
      newErrors.repetitions = 'Repetições deve ser um número'
    }

    if (formData.sets && isNaN(Number(formData.sets))) {
      newErrors.sets = 'Séries deve ser um número'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const exerciseData: Partial<Exercise> = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      category: formData.category || null,
      difficulty: formData.difficulty || null,
      video_url: formData.video_url.trim() || null,
      muscle_group: formData.muscle_group || null,
      duration_minutes: formData.duration_minutes ? Number(formData.duration_minutes) : null,
      repetitions: formData.repetitions ? Number(formData.repetitions) : null,
      sets: formData.sets ? Number(formData.sets) : null
    }

    onSave(exerciseData)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{exercise ? 'Editar Exercício' : 'Novo Exercício'}</CardTitle>
        <CardDescription>
          {exercise 
            ? 'Atualize as informações do exercício' 
            : 'Preencha os dados para criar um novo exercício'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Exercício *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Agachamento com apoio"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva como executar o exercício, posicionamento, cuidados..."
              rows={4}
            />
          </div>

          {/* Categoria e Dificuldade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grupo Muscular e URL do Vídeo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="muscle_group">Grupo Muscular</Label>
              <Select value={formData.muscle_group} onValueChange={(value) => handleChange('muscle_group', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o grupo muscular" />
                </SelectTrigger>
                <SelectContent>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">URL do Vídeo</Label>
              <Input
                id="video_url"
                type="url"
                value={formData.video_url}
                onChange={(e) => handleChange('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className={errors.video_url ? 'border-red-500' : ''}
              />
              {errors.video_url && <p className="text-sm text-red-500">{errors.video_url}</p>}
            </div>
          </div>

          {/* Parâmetros do Exercício */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Séries Sugeridas</Label>
              <Input
                id="sets"
                type="number"
                min="1"
                value={formData.sets}
                onChange={(e) => handleChange('sets', e.target.value)}
                placeholder="Ex: 3"
                className={errors.sets ? 'border-red-500' : ''}
              />
              {errors.sets && <p className="text-sm text-red-500">{errors.sets}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="repetitions">Repetições Sugeridas</Label>
              <Input
                id="repetitions"
                type="number"
                min="1"
                value={formData.repetitions}
                onChange={(e) => handleChange('repetitions', e.target.value)}
                placeholder="Ex: 12"
                className={errors.repetitions ? 'border-red-500' : ''}
              />
              {errors.repetitions && <p className="text-sm text-red-500">{errors.repetitions}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duração (minutos)</Label>
              <Input
                id="duration_minutes"
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) => handleChange('duration_minutes', e.target.value)}
                placeholder="Ex: 5"
                className={errors.duration_minutes ? 'border-red-500' : ''}
              />
              {errors.duration_minutes && <p className="text-sm text-red-500">{errors.duration_minutes}</p>}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar Exercício'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 