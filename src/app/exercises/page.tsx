'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus, Play, Filter, Heart, Clock, Users, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { ExerciseLibrary } from '@/components/exercises/exercise-library'
import { ExerciseForm } from '@/components/exercises/exercise-form'
import { PrescriptionForm } from '@/components/exercises/prescription-form'

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
  is_favorite?: boolean
}

interface Protocol {
  id: string
  name: string
  description: string
  condition: string
  exercises: Exercise[]
  duration_weeks: number
  sessions_per_week: number
}

type ViewMode = 'library' | 'create' | 'edit' | 'prescribe' | 'protocols'

// Categorias anatômicas inspiradas no Lumi Dashboard
const anatomicalRegions = [
  'Todos',
  'Cervical', 
  'Membros Superiores',
  'Tronco',
  'Membros Inferiores',
  'Mobilidade Geral',
  'Core/Estabilização'
]

// Dados simulados expandidos para demonstração
const mockExercises: Exercise[] = [
  {
    id: '1',
    name: 'Rotação Cervical Ativa',
    description: 'Exercício de mobilidade para melhora da amplitude de movimento cervical. Realizar movimentos lentos e controlados.',
    category: 'Mobilidade',
    anatomical_region: 'Cervical',
    video_url: 'https://youtube.com/watch?v=demo1',
    difficulty_level: 1,
    duration: 20,
    muscle_group: 'Músculos cervicais',
    indications: 'Rigidez cervical, torticolo, tensão muscular',
    contraindications: 'Instabilidade cervical, vertigem severa',
    is_favorite: true
  },
  {
    id: '2',
    name: 'Retração Cervical',
    description: 'Exercício para fortalecimento da musculatura cervical profunda e correção postural.',
    category: 'Fortalecimento',
    anatomical_region: 'Cervical',
    difficulty_level: 2,
    duration: 15,
    muscle_group: 'Flexores profundos do pescoço',
    indications: 'Postura anteriorizada da cabeça, dor cervical',
    contraindications: 'Lesões cervicais agudas',
    is_favorite: false
  },
  {
    id: '3',
    name: 'Elevação de Ombros',
    description: 'Fortalecimento do trapézio superior e mobilização da cintura escapular.',
    category: 'Fortalecimento',
    anatomical_region: 'Membros Superiores',
    difficulty_level: 2,
    duration: 30,
    muscle_group: 'Trapézio superior, elevador da escápula',
    indications: 'Fraqueza do trapézio, dor no ombro',
    contraindications: 'Síndrome do impacto severa',
    is_favorite: false
  },
  {
    id: '4',
    name: 'Prancha Lateral',
    description: 'Exercício isométrico para fortalecimento do core e estabilização lateral do tronco.',
    category: 'Estabilização',
    anatomical_region: 'Core/Estabilização',
    difficulty_level: 4,
    duration: 45,
    muscle_group: 'Oblíquos, quadrado lombar, glúteo médio',
    indications: 'Instabilidade lombar, fraqueza do core',
    contraindications: 'Dor lombar aguda, lesões no punho',
    is_favorite: true
  },
  {
    id: '5',
    name: 'Agachamento Funcional',
    description: 'Movimento funcional para fortalecimento de membros inferiores e melhora da mobilidade.',
    category: 'Funcional',
    anatomical_region: 'Membros Inferiores',
    difficulty_level: 3,
    duration: 40,
    muscle_group: 'Quadríceps, glúteos, isquiotibiais',
    indications: 'Fraqueza de MMII, melhora funcional',
    contraindications: 'Gonartrose severa, lesões meniscais agudas',
    is_favorite: false
  }
]

// Protocolos pré-definidos
const mockProtocols: Protocol[] = [
  {
    id: '1',
    name: 'Protocolo Cervicalgia',
    description: 'Protocolo completo para tratamento de dor cervical com foco em mobilidade e fortalecimento.',
    condition: 'Cervicalgia',
    exercises: mockExercises.filter(ex => ex.anatomical_region === 'Cervical'),
    duration_weeks: 4,
    sessions_per_week: 3
  },
  {
    id: '2',
    name: 'Protocolo Core Stability',
    description: 'Programa de estabilização do core para prevenção e tratamento de dor lombar.',
    condition: 'Lombalgia',
    exercises: mockExercises.filter(ex => ex.anatomical_region === 'Core/Estabilização'),
    duration_weeks: 6,
    sessions_per_week: 2
  }
]

export default function ExercisesPage() {
  const [exercises] = useState<Exercise[]>(mockExercises)
  const [protocols] = useState<Protocol[]>(mockProtocols)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('Todos')
  const [viewMode, setViewMode] = useState<ViewMode>('library')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.muscle_group?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = selectedRegion === 'Todos' || exercise.anatomical_region === selectedRegion
    return matchesSearch && matchesRegion
  })

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

  const handleCreateExercise = () => {
    setSelectedExercise(null)
    setViewMode('create')
  }

  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setViewMode('edit')
  }

  const handlePrescribeExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setViewMode('prescribe')
  }

  const handleSaveExercise = (exercise: any) => {
    // Ensure the exercise has an ID for the exercises list
    const exerciseWithId = {
      ...exercise,
      id: exercise.id || Date.now().toString()
    }
    
    // In a real app, you would save to database here
    toast.success('Exercício salvo com sucesso!')
    setViewMode('library')
  }

  const handleSavePrescription = (prescription: any) => {
    toast.success('Prescrição criada com sucesso!')
    setViewMode('library')
  }

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <ExerciseForm
          exercise={selectedExercise || undefined}
          onSave={handleSaveExercise}
          onCancel={() => setViewMode('library')}
        />
      </div>
    )
  }

  if (viewMode === 'prescribe' && selectedExercise) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <PrescriptionForm
          exercise={selectedExercise}
          onSave={handleSavePrescription}
          onCancel={() => setViewMode('library')}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Exercícios</h1>
          <p className="text-muted-foreground">
            Sistema completo de exercícios, protocolos e prescrições para fisioterapia
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode('protocols')}>
            <BookOpen className="mr-2 h-4 w-4" />
            Protocolos
          </Button>
          <Button onClick={handleCreateExercise}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Exercício
          </Button>
        </div>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Biblioteca</TabsTrigger>
          <TabsTrigger value="protocols">Protocolos</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescrições Ativas</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          {/* Filtros e Busca */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar exercícios por nome, descrição ou grupo muscular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {anatomicalRegions.map((region) => (
                <Button
                  key={region}
                  variant={selectedRegion === region ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRegion(region)}
                  className="whitespace-nowrap"
                >
                  {region}
                </Button>
              ))}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Exercícios</p>
                    <p className="text-2xl font-bold">{exercises.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Favoritos</p>
                    <p className="text-2xl font-bold">{exercises.filter(e => e.is_favorite).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Com Vídeo</p>
                    <p className="text-2xl font-bold">{exercises.filter(e => e.video_url).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Protocolos</p>
                    <p className="text-2xl font-bold">{protocols.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Exercícios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <Card key={exercise.id} className="hover:shadow-lg transition-all duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {exercise.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
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
                    <div className="flex gap-1">
                      {exercise.is_favorite && (
                        <Heart className="h-4 w-4 text-red-500 fill-current" />
                      )}
                      {exercise.video_url && (
                        <div className="relative">
                          <Play className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {exercise.description}
                  </p>
                  
                  <div className="space-y-2">
                    {exercise.muscle_group && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{exercise.muscle_group}</span>
                      </div>
                    )}
                    {exercise.duration && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{exercise.duration} segundos</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleEditExercise(exercise)}
                    >
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePrescribeExercise(exercise)}
                    >
                      Prescrever
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum exercício encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou criar um novo exercício.
              </p>
              <Button onClick={handleCreateExercise}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Exercício
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="protocols" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Protocolos de Tratamento</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Protocolo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {protocols.map((protocol) => (
              <Card key={protocol.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{protocol.name}</span>
                    <Badge variant="outline">{protocol.condition}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {protocol.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{protocol.duration_weeks} semanas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{protocol.sessions_per_week}x/semana</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{protocol.exercises.length} exercícios</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Ver Detalhes
                    </Button>
                    <Button size="sm" className="flex-1">
                      Aplicar Protocolo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Prescrições Ativas</h3>
            <p className="text-muted-foreground">
              Aqui você verá todas as prescrições ativas dos seus pacientes.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 