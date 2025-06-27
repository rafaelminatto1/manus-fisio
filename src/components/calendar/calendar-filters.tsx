'use client'

import React from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUsers } from '@/hooks/use-calendar-events'

interface CalendarFiltersProps {
  filters: {
    eventTypes: string[]
    attendees: string[]
  }
  onFiltersChange: (filters: { eventTypes: string[]; attendees: string[] }) => void
}

export function CalendarFilters({ filters, onFiltersChange }: CalendarFiltersProps) {
  const { data: users = [] } = useUsers()

  const eventTypeLabels = {
    appointment: 'Consultas',
    supervision: 'Supervisões',
    meeting: 'Reuniões',
    break: 'Pausas',
  }

  const eventTypeColors = {
    appointment: '#3b82f6',
    supervision: '#10b981',
    meeting: '#f59e0b',
    break: '#ef4444',
  }

  const handleEventTypeToggle = (eventType: string) => {
    const newEventTypes = filters.eventTypes.includes(eventType)
      ? filters.eventTypes.filter(type => type !== eventType)
      : [...filters.eventTypes, eventType]
    
    onFiltersChange({
      ...filters,
      eventTypes: newEventTypes,
    })
  }

  const handleAttendeeToggle = (userId: string) => {
    const newAttendees = filters.attendees.includes(userId)
      ? filters.attendees.filter(id => id !== userId)
      : [...filters.attendees, userId]
    
    onFiltersChange({
      ...filters,
      attendees: newAttendees,
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      eventTypes: [],
      attendees: [],
    })
  }

  const hasActiveFilters = filters.eventTypes.length > 0 || filters.attendees.length > 0

  const selectedUsers = users.filter(user => filters.attendees.includes(user.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filtros</span>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filtro por tipo de evento */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Tipos de Evento</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(eventTypeLabels).map(([type, label]) => {
            const isSelected = filters.eventTypes.includes(type)
            return (
              <Button
                key={type}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleEventTypeToggle(type)}
                className="flex items-center gap-2"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: eventTypeColors[type as keyof typeof eventTypeColors] }}
                />
                {label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Filtro por participantes */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Participantes</h4>
        
        {/* Participantes selecionados */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedUsers.map((user) => (
              <Badge
                key={user.id}
                variant="secondary"
                className="flex items-center gap-2 pr-1"
              >
                <Avatar className="h-4 w-4">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {user.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{user.full_name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleAttendeeToggle(user.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Seletor de participantes */}
        <Select onValueChange={handleAttendeeToggle}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecionar participante..." />
          </SelectTrigger>
          <SelectContent>
            {users
              .filter(user => !filters.attendees.includes(user.id))
              .map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {user.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resumo dos filtros ativos */}
      {hasActiveFilters && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {filters.eventTypes.length > 0 && (
              <span>
                {filters.eventTypes.length} tipo{filters.eventTypes.length > 1 ? 's' : ''} de evento
              </span>
            )}
            {filters.eventTypes.length > 0 && filters.attendees.length > 0 && ' • '}
            {filters.attendees.length > 0 && (
              <span>
                {filters.attendees.length} participante{filters.attendees.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
} 