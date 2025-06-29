'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Play, Plus, Filter } from 'lucide-react'
import { Tables } from '@/types/database.types'

type Exercise = Tables<'exercises'> & {
  created_by_user?: { full_name: string; email: string }
}

interface ExerciseLibraryProps {
  onPrescribe?: (exercise: Exercise) => void
  showPrescribeButton?: boolean
  canCreateExercise?: boolean
  onCreateExercise?: () => void
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

export function ExerciseLibrary({ 
  onPrescribe, 
  showPrescribeButton = false,
  canCreateExercise = false,
  onCreateExercise 
}: ExerciseLibraryProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')

  useEffect(() => {
    fetchExercises()
  }, [selectedCategory, selectedDifficulty, searchTerm])

  const fetchExercises = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/exercises?${params}`)
      if (response.ok) {
        const data = await response.json()
        setExercises(data)
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string | null) => {
    const diff = difficulties.find(d => d.value === difficulty)
    return diff?.label || 'Não definido'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Exercícios</h1>
          <p className="text-gray-600">Gerencie e prescreva exercícios para seus pacientes</p>
        </div>
        {canCreateExercise && (
          <Button onClick={onCreateExercise} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Exercício
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Buscar por nome
              </label>
              <Input
                placeholder="Digite o nome do exercício..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Categoria
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Dificuldade
              </label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as dificuldades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as dificuldades</SelectItem>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Exercícios */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {exercise.category || 'Sem categoria'}
                    </CardDescription>
                  </div>
                  {exercise.video_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => window.open(exercise.video_url!, '_blank')}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exercise.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {exercise.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {exercise.difficulty && (
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {getDifficultyLabel(exercise.difficulty)}
                      </Badge>
                    )}
                    {exercise.muscle_group && (
                      <Badge variant="outline">
                        {exercise.muscle_group}
                      </Badge>
                    )}
                  </div>

                  {(exercise.sets || exercise.repetitions || exercise.duration_minutes) && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {exercise.sets && <div>Séries: {exercise.sets}</div>}
                      {exercise.repetitions && <div>Repetições: {exercise.repetitions}</div>}
                      {exercise.duration_minutes && <div>Duração: {exercise.duration_minutes}min</div>}
                    </div>
                  )}

                  {showPrescribeButton && onPrescribe && (
                    <Button 
                      className="w-full mt-3"
                      onClick={() => onPrescribe(exercise)}
                    >
                      Prescrever
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && exercises.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum exercício encontrado</p>
            <p className="text-gray-400 text-sm mt-2">
              Tente ajustar os filtros ou criar um novo exercício
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 