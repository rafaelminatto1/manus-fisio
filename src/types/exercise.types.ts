export interface Exercise {
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

export interface Protocol {
  id: string
  name: string
  description: string
  condition: string
  exercises: Exercise[]
  duration_weeks: number
  sessions_per_week: number
}

export interface PrescriptionData {
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

export interface Patient {
  id: string
  name: string
  email?: string
}

export type ViewMode = 'library' | 'create' | 'edit' | 'prescribe' | 'protocols'

export const anatomicalRegions = [
  'Cervical', 
  'Membros Superiores',
  'Tronco',
  'Membros Inferiores',
  'Mobilidade Geral',
  'Core/Estabilização'
]

export const categories = [
  'Fortalecimento',
  'Mobilidade', 
  'Alongamento',
  'Estabilização',
  'Coordenação',
  'Equilíbrio',
  'Funcional'
]

export const difficultyLevels = [
  { value: 1, label: 'Muito Fácil' },
  { value: 2, label: 'Fácil' },
  { value: 3, label: 'Moderado' },
  { value: 4, label: 'Difícil' },
  { value: 5, label: 'Muito Difícil' }
] 