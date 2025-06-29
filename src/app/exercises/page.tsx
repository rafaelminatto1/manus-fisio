'use client'

import React, { useState } from 'react'
import { ExerciseLibrary } from '@/components/exercises/exercise-library'
import { ExerciseForm } from '@/components/exercises/exercise-form'
import { PrescriptionForm } from '@/components/exercises/prescription-form'
import { useAuth } from '@/hooks/use-auth'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Tables } from '@/types/database.types'
import { toast } from 'sonner'

type Exercise = Tables<'exercises'>

type ViewMode = 'library' | 'create' | 'edit' | 'prescribe'

export default function ExercisesPage() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('library')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [loading, setLoading] = useState(false)

  const canManageExercises = user?.role === 'admin' || user?.role === 'mentor'

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

  const handleSaveExercise = async (exerciseData: Partial<Exercise>) => {
    try {
      setLoading(true)
      
      const url = selectedExercise 
        ? `/api/exercises/${selectedExercise.id}` 
        : '/api/exercises'
      
      const method = selectedExercise ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseData),
      })

      if (response.ok) {
        toast.success(
          selectedExercise 
            ? 'Exercício atualizado com sucesso!' 
            : 'Exercício criado com sucesso!'
        )
        setViewMode('library')
        setSelectedExercise(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao salvar exercício')
      }
    } catch (error) {
      console.error('Error saving exercise:', error)
      toast.error('Erro ao salvar exercício')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrescription = async (prescriptionData: any) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/exercise-prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      })

      if (response.ok) {
        toast.success('Exercício prescrito com sucesso!')
        setViewMode('library')
        setSelectedExercise(null)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao prescrever exercício')
      }
    } catch (error) {
      console.error('Error saving prescription:', error)
      toast.error('Erro ao prescrever exercício')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setViewMode('library')
    setSelectedExercise(null)
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
      case 'edit':
        return (
          <ExerciseForm
            exercise={selectedExercise || undefined}
            onSave={handleSaveExercise}
            onCancel={handleCancel}
            loading={loading}
          />
        )

      case 'prescribe':
        return selectedExercise ? (
          <PrescriptionForm
            exercise={selectedExercise}
            onSave={handleSavePrescription}
            onCancel={handleCancel}
            loading={loading}
          />
        ) : null

      default:
        return (
          <ExerciseLibrary
            onPrescribe={canManageExercises ? handlePrescribeExercise : undefined}
            showPrescribeButton={canManageExercises}
            canCreateExercise={canManageExercises}
            onCreateExercise={handleCreateExercise}
          />
        )
    }
  }

  return (
    <AuthGuard requireRole={['admin', 'mentor', 'intern']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </div>
    </AuthGuard>
  )
} 