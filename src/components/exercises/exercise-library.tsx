'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Play, Heart, Filter } from 'lucide-react'

interface Exercise {
  id: string
  name: string
  description: string
  category: string
  video_url?: string
  difficulty_level: number
  duration?: number
  is_favorite?: boolean
}

interface ExerciseLibraryProps {
  onSelectExercise?: (exercise: Exercise) => void
  selectedExercises?: string[]
  mode?: 'select' | 'view'
}

// Dados simulados para demonstração
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Flexão de Braço Modificada',
    description: 'Exercício para fortalecimento do peitoral e tríceps, adaptado para iniciantes.',
    category: 'Fortalecimento',
    video_url: 'https://example.com/video1',
    difficulty_level: 2,
    duration: 30,
    is_favorite: false
  },
  {
    id: '2',
    name: 'Alongamento Cervical',
    description: 'Exercício de mobilidade para redução de tensão na região cervical.',
    category: 'Mobilidade',
    difficulty_level: 1,
    duration: 20,
    is_favorite: true
  },
  {
    id: '3',
    name: 'Agachamento Assistido',
    description: 'Fortalecimento de membros inferiores com apoio.',
    category: 'Fortalecimento',
    difficulty_level: 3,
    duration: 45,
    is_favorite: false
  }
]

const categories = ['Todos', 'Fortalecimento', 'Mobilidade', 'Alongamento', 'Estabilização']

export function ExerciseLibrary({ 
  onSelectExercise, 
  selectedExercises = [], 
  mode = 'view' 
}: ExerciseLibraryProps) {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || exercise.category === selectedCategory
    const matchesFavorites = !showFavoritesOnly || exercise.is_favorite
    return matchesSearch && matchesCategory && matchesFavorites
  })

  const toggleFavorite = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, is_favorite: !ex.is_favorite } : ex
    ))
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-yellow-100 text-yellow-800'
      case 3: return 'bg-orange-100 text-orange-800'
      case 4: return 'bg-red-100 text-red-800'
      case 5: return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar exercícios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Heart className={`mr-2 h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favoritos
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de Exercícios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => (
          <Card 
            key={exercise.id} 
            className={`hover:shadow-md transition-shadow ${
              selectedExercises.includes(exercise.id) ? 'ring-2 ring-primary' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{exercise.category}</Badge>
                    <Badge className={getDifficultyColor(exercise.difficulty_level)}>
                      {getDifficultyText(exercise.difficulty_level)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFavorite(exercise.id)}
                  >
                    <Heart className={`h-4 w-4 ${exercise.is_favorite ? 'fill-current text-red-500' : ''}`} />
                  </Button>
                  {exercise.video_url && (
                    <Button size="sm" variant="ghost">
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {exercise.description}
              </p>
              
              {exercise.duration && (
                <div className="text-xs text-muted-foreground">
                  Duração: {exercise.duration} segundos
                </div>
              )}

              {mode === 'select' ? (
                <Button 
                  size="sm" 
                  className="w-full"
                  variant={selectedExercises.includes(exercise.id) ? 'secondary' : 'default'}
                  onClick={() => onSelectExercise?.(exercise)}
                >
                  {selectedExercises.includes(exercise.id) ? 'Selecionado' : 'Selecionar'}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Editar
                  </Button>
                  <Button size="sm" className="flex-1">
                    Prescrever
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum exercício encontrado com os filtros aplicados.
          </p>
        </div>
      )}
    </div>
  )
}