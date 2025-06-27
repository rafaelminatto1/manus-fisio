'use client'

import React, { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Filter, Download, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCalendarEvents, useRealtimeEvents, CalendarEvent } from '@/hooks/use-calendar-events'
import { EventModal } from './event-modal'
import { EventDetailsModal } from './event-details-modal'
import { CalendarFilters } from './calendar-filters'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Configuração do localizador para português
const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Mensagens em português
const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+ Ver mais (${total})`,
}

// Cores por tipo de evento
const eventTypeColors = {
  appointment: '#3b82f6', // Azul
  supervision: '#10b981', // Verde
  meeting: '#f59e0b',     // Amarelo
  break: '#ef4444',       // Vermelho
}

interface CalendarViewProps {
  className?: string
}

export function CalendarView({ className }: CalendarViewProps) {
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    eventTypes: [] as string[],
    attendees: [] as string[],
  })

  // Hooks
  const { data: events = [], isLoading, error } = useCalendarEvents()
  useRealtimeEvents() // Eventos em tempo real

  // Transformar eventos para o formato do react-big-calendar
  const calendarEvents = useMemo(() => {
    return events
      .filter(event => {
        // Aplicar filtros
        if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.event_type)) {
          return false
        }
        if (filters.attendees.length > 0) {
          const hasAttendee = filters.attendees.some(attendeeId => 
            event.attendees.includes(attendeeId) || event.created_by === attendeeId
          )
          if (!hasAttendee) return false
        }
        return true
      })
      .map(event => ({
        id: event.id,
        title: event.title,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        resource: event,
      }))
  }, [events, filters])

  // Handlers
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource)
    setShowDetailsModal(true)
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setEditingEvent({
      id: '',
      title: '',
      description: '',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      event_type: 'appointment',
      location: '',
      attendees: [],
      created_by: '',
      created_at: '',
      updated_at: '',
    })
    setShowEventModal(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEventModal(true)
    setShowDetailsModal(false)
  }

  const handleCloseModal = () => {
    setShowEventModal(false)
    setEditingEvent(null)
  }

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedEvent(null)
  }

  // Estilo customizado para eventos
  const eventStyleGetter = (event: any) => {
    const eventType = event.resource.event_type
    const backgroundColor = eventTypeColors[eventType as keyof typeof eventTypeColors] || '#6b7280'
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px',
      },
    }
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          Erro ao carregar eventos. Tente novamente.
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className="text-muted-foreground">
            Gerencie seus eventos e compromissos
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* TODO: Implementar exportação */}}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          
          <Button
            onClick={() => setShowEventModal(true)}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card className="p-4">
          <CalendarFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </Card>
      )}

      {/* Legenda de tipos de evento */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(eventTypeColors).map(([type, color]) => (
          <Badge
            key={type}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            {type === 'appointment' && 'Consulta'}
            {type === 'supervision' && 'Supervisão'}
            {type === 'meeting' && 'Reunião'}
            {type === 'break' && 'Pausa'}
          </Badge>
        ))}
      </div>

      {/* Calendário */}
      <Card className="p-4">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-[600px]">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              messages={messages}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              popup
              eventPropGetter={eventStyleGetter}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              step={30}
              timeslots={2}
              min={new Date(2024, 0, 1, 7, 0)} // 7:00 AM
              max={new Date(2024, 0, 1, 22, 0)} // 10:00 PM
              formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }) =>
                  `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
                agendaTimeFormat: 'HH:mm',
                agendaTimeRangeFormat: ({ start, end }) =>
                  `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
              }}
              culture="pt-BR"
            />
          </div>
        )}
      </Card>

      {/* Modal para criar/editar evento */}
      <EventModal
        open={showEventModal}
        onClose={handleCloseModal}
        event={editingEvent}
      />

      {/* Modal para detalhes do evento */}
      <EventDetailsModal
        open={showDetailsModal}
        onClose={handleCloseDetailsModal}
        event={selectedEvent}
        onEdit={handleEditEvent}
      />
    </div>
  )
} 