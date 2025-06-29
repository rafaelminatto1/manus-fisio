'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface PrescriptionFormProps {
  exercise: any
  onSave: (prescription: any) => void
  onCancel: () => void
  loading?: boolean
}

export function PrescriptionForm({ exercise, onSave, onCancel, loading = false }: PrescriptionFormProps) {
  return (
    <div>
      <h2>Prescrever Exercício: {exercise.name}</h2>
      <Button onClick={() => onSave({})}>Prescrever</Button>
      <Button onClick={onCancel}>Cancelar</Button>
    </div>
  )
}
