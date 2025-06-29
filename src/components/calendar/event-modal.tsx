'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, Users, Type, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  useCreateEvent,
  useUpdateEvent,
  useUsers,
  CalendarEvent,
  CreateEventData,
} from '@/hooks/use-calendar-events'

// User interface for typing
interface User {
  id: string
  full_name: string
  email: string
  role: string
  avatar_url?: string
}

// Schema de validação
const eventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  start_time: z.string().min(1, 'Data/hora de início é obrigatória'),
  end_time: z.string().min(1, 'Data/hora de fim é obrigatória'),
  event_type: z.enum(['appointment', 'supervision', 'meeting', 'break']),
  location: z.string().optional(),
  attendees: z.array(z.string()).default([]),
}).refine((data) => {
  const start = new Date(data.start_time)
  const end = new Date(data.end_time)
  return end > start
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['end_time'],
})

type EventFormData = z.infer<typeof eventSchema>

interface EventModalProps {
  open: boolean
  onClose: () => void
  event?: CalendarEvent | null
}

export function EventModal({ open, onClose, event }: EventModalProps) {
  const isEditing = !!event?.id
  const { data: users = [] } = useUsers()
  const createEventMutation = useCreateEvent()
  const updateEventMutation = useUpdateEvent()

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      event_type: 'appointment',
      location: '',
      attendees: [],
    },
  })

  // Atualizar form quando evento mudar
  React.useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description || '',
        start_time: format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm"),
        event_type: event.event_type,
        location: event.location || '',
        attendees: event.attendees,
      })
    } else {
      form.reset({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        event_type: 'appointment',
        location: '',
        attendees: [],
      })
    }
  }, [event, form])

  const onSubmit = async (data: EventFormData) => {
    try {
      if (isEditing && event) {
        await updateEventMutation.mutateAsync({
          id: event.id,
          ...data,
        })
      } else {
        await createEventMutation.mutateAsync(data as CreateEventData)
      }
      onClose()
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
    }
  }

  const handleAddAttendee = (userId: string) => {
    const currentAttendees = form.getValues('attendees')
    if (!currentAttendees.includes(userId)) {
      form.setValue('attendees', [...currentAttendees, userId])
    }
  }

  const handleRemoveAttendee = (userId: string) => {
    const currentAttendees = form.getValues('attendees')
    form.setValue('attendees', currentAttendees.filter(id => id !== userId))
  }

  const selectedAttendees = form.watch('attendees')
  const selectedUsers = users.filter((user: User) => selectedAttendees.includes(user.id))
  const availableUsers = users.filter((user: User) => !selectedAttendees.includes(user.id))

  const eventTypeLabels = {
    appointment: 'Consulta',
    supervision: 'Supervisão',
    meeting: 'Reunião',
    break: 'Pausa',
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Título *
            </Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Digite o título do evento"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Tipo de evento */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tipo de Evento
            </Label>
            <Select
              value={form.watch('event_type')}
              onValueChange={(value) => form.setValue('event_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data e hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Início *
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                {...form.register('start_time')}
              />
              {form.formState.errors.start_time && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.start_time.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Fim *
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                {...form.register('end_time')}
              />
              {form.formState.errors.end_time && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.end_time.message}
                </p>
              )}
            </div>
          </div>

          {/* Local */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Local
            </Label>
            <Input
              id="location"
              {...form.register('location')}
              placeholder="Sala, endereço ou local do evento"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição
            </Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Detalhes adicionais sobre o evento"
              rows={3}
            />
          </div>

          {/* Participantes */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participantes
            </Label>

            {/* Participantes selecionados */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Participantes selecionados:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user: User) => (
                    <Badge
                      key={user.id}
                      variant="secondary"
                      className="flex items-center gap-2 pr-1"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>
                          {user.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{user.full_name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveAttendee(user.id)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionar participantes */}
            {availableUsers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Adicionar participantes:</p>
                <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                  {availableUsers.map((user: User) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                      onClick={() => handleAddAttendee(user.id)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>
                          {user.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending || updateEventMutation.isPending}
            >
              {createEventMutation.isPending || updateEventMutation.isPending
                ? 'Salvando...'
                : isEditing
                ? 'Atualizar'
                : 'Criar Evento'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 