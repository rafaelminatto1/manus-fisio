'use client'

import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { useDeleteEvent, useUsers, CalendarEvent } from '@/hooks/use-calendar-events'
import { useAuth } from '@/hooks/use-auth'

interface EventDetailsModalProps {
  open: boolean
  onClose: () => void
  event: CalendarEvent | null
  onEdit: (event: CalendarEvent) => void
}

export function EventDetailsModal({ open, onClose, event, onEdit }: EventDetailsModalProps) {
  const { user } = useAuth()
  const { data: users = [] } = useUsers()
  const deleteEventMutation = useDeleteEvent()

  if (!event) return null

  const isOwner = event.created_by === user?.id
  const canEdit = isOwner || user?.role === 'admin'

  const eventTypeLabels = {
    appointment: 'Consulta',
    supervision: 'Supervisão', 
    meeting: 'Reunião',
    break: 'Pausa',
  }

  const eventTypeColors = {
    appointment: 'bg-blue-100 text-blue-800',
    supervision: 'bg-green-100 text-green-800',
    meeting: 'bg-yellow-100 text-yellow-800',
    break: 'bg-red-100 text-red-800',
  }

  const attendeeUsers = users.filter((user: any) => event.attendees.includes(user.id))
  const creator = users.find((user: any) => user.id === event.created_by)

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await deleteEventMutation.mutateAsync(event.id)
        onClose()
      } catch (error) {
        console.error('Erro ao excluir evento:', error)
      }
    }
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: ptBR })
  }

  const getDuration = () => {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    const diffMs = end.getTime() - start.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours > 0) {
      return `${diffHours}h${diffMinutes > 0 ? ` ${diffMinutes}min` : ''}`
    }
    return `${diffMinutes}min`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalhes do Evento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Título e tipo */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{event.title}</h3>
            <Badge className={eventTypeColors[event.event_type]}>
              {eventTypeLabels[event.event_type]}
            </Badge>
          </div>

          {/* Data e hora */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Data e Horário</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>{formatDate(event.start_time)}</p>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>
                  {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  <span className="text-muted-foreground ml-2">({getDuration()})</span>
                </span>
              </div>
            </div>
          </Card>

          {/* Local */}
          {event.location && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Local</span>
              </div>
              <p className="text-sm">{event.location}</p>
            </Card>
          )}

          {/* Descrição */}
          {event.description && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Descrição</span>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </Card>
          )}

          {/* Criado por */}
          {creator && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Criado por</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={creator.avatar_url || ''} />
                  <AvatarFallback>
                    {creator.full_name.split(' ').map((n: any) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{creator.full_name}</p>
                  <p className="text-xs text-muted-foreground">{creator.email}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Participantes */}
          {attendeeUsers.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  Participantes ({attendeeUsers.length})
                </span>
              </div>
              <div className="space-y-2">
                {attendeeUsers.map((attendee: any) => (
                  <div key={attendee.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={attendee.avatar_url || ''} />
                      <AvatarFallback>
                        {attendee.full_name.split(' ').map((n: any) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attendee.full_name}</p>
                      <p className="text-xs text-muted-foreground">{attendee.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {attendee.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Informações do evento */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Criado em: {format(new Date(event.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            {event.updated_at !== event.created_at && (
              <p>Atualizado em: {format(new Date(event.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          
          {canEdit && (
            <>
              <Button
                variant="outline"
                onClick={() => onEdit(event)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteEventMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteEventMutation.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 