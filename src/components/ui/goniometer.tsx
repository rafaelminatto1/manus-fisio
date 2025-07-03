'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity, Save, RotateCcw } from 'lucide-react'

interface GoniometerProps {
  onSave?: (data: any) => void
  className?: string
}

interface GoniometerReading {
  joint: string
  movement: string
  activeRom: number
  passiveRom: number
  notes: string
  date: string
}

const joints = [
  { name: 'Ombro', movements: ['Flexão', 'Abdução', 'Rotação'] },
  { name: 'Cotovelo', movements: ['Flexão', 'Extensão'] },
  { name: 'Joelho', movements: ['Flexão', 'Extensão'] }
]

export function Goniometer({ onSave, className }: GoniometerProps) {
  const [joint, setJoint] = useState('Ombro')
  const [movement, setMovement] = useState('Flexão')
  const [activeRom, setActiveRom] = useState(0)
  const [passiveRom, setPassiveRom] = useState(0)
  const [notes, setNotes] = useState('')

  const currentJoint = joints.find(j => j.name === joint)

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Goniômetro Digital
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seleções */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Articulação</Label>
            <select
              value={joint}
              onChange={(e) => setJoint(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {joints.map((j) => (
                <option key={j.name} value={j.name}>{j.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Movimento</Label>
            <select
              value={movement}
              onChange={(e) => setMovement(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {currentJoint?.movements.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Medições */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>ROM Ativo (°)</Label>
            <Input
              type="number"
              value={activeRom}
              onChange={(e) => setActiveRom(Number(e.target.value))}
              min={0}
              max={180}
            />
          </div>
          <div>
            <Label>ROM Passivo (°)</Label>
            <Input
              type="number"
              value={passiveRom}
              onChange={(e) => setPassiveRom(Number(e.target.value))}
              min={0}
              max={180}
            />
          </div>
        </div>

        {/* Visualização simples */}
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl mb-2">📐</div>
          <div className="text-sm space-y-1">
            <div className="text-blue-600">Ativo: {activeRom}°</div>
            <div className="text-green-600">Passivo: {passiveRom}°</div>
          </div>
        </div>

        {/* Notas */}
        <div>
          <Label>Observações</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded-md h-20"
            placeholder="Adicione observações..."
          />
        </div>

        {/* Botões */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setActiveRom(0)
              setPassiveRom(0)
              setNotes('')
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Resetar
          </Button>
          <Button
            onClick={() => onSave?.({
              joint,
              movement,
              activeRom,
              passiveRom,
              notes,
              date: new Date().toISOString()
            })}
          >
            <Save className="h-4 w-4 mr-1" />
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para histórico de medições
export function GoniometerHistory({ 
  readings,
  className 
}: { 
  readings: GoniometerReading[]
  className?: string 
}) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>Histórico de Medições</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {readings.map((reading, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">
                    {reading.joint} - {reading.movement}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(reading.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    <span className="text-blue-600">Ativo: {reading.activeRom}°</span>
                    <br />
                    <span className="text-green-600">Passivo: {reading.passiveRom}°</span>
                  </div>
                </div>
              </div>
              {reading.notes && (
                <p className="text-sm text-gray-600 mt-2">{reading.notes}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 