'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/auth'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  User, 
  Stethoscope,
  Users,
  AlertCircle,
  CheckCircle,
  Video,
  MapPin,
  Edit,
  Trash2,
  TrendingUp,
  BarChart3,
  Download
} from 'lucide-react'
import { format, addDays, startOfWeek, startOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek as getStartOfWeek, endOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Tipos expandidos
interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: 'supervision' | 'appointment' | 'meeting' | 'evaluation' | 'treatment'
  start_time: string
  end_time: string
  location?: string
  patient_name?: string
  intern_id?: string
  mentor_id?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

interface CalendarStats {
  total_events: number
  supervisions_today: number
  appointments_week: number
  completion_rate: number
  avg_session_duration: number
}

// Mock data expandido
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Supervisão - Protocolo ATM',
    description: 'Acompanhamento do estagiário no protocolo de articulação temporomandibular',
    type: 'supervision',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    end_time: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    location: 'Sala 3',
    patient_name: 'Maria Santos',
    intern_id: 'intern-1',
    mentor_id: 'mentor-1',
    status: 'scheduled',
    notes: 'Primeira supervisão no protocolo ATM',
    created_by: 'mentor-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Avaliação - João Silva',
    description: 'Primeira consulta fisioterapêutica - lombalgia crônica',
    type: 'evaluation',
    start_time: new Date(Date.now() + 172800000).toISOString(),
    end_time: new Date(Date.now() + 172800000 + 3600000).toISOString(),
    location: 'Consultório 1',
    patient_name: 'João Silva',
    status: 'scheduled',
    created_by: 'mentor-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Reunião Multidisciplinar',
    description: 'Discussão de casos complexos da semana',
    type: 'meeting',
    start_time: new Date(Date.now() + 259200000).toISOString(),
    end_time: new Date(Date.now() + 259200000 + 5400000).toISOString(),
    location: 'Sala de Reuniões',
    status: 'scheduled',
    created_by: 'admin-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockStats: CalendarStats = {
  total_events: 45,
  supervisions_today: 3,
  appointments_week: 28,
  completion_rate: 94.5,
  avg_session_duration: 52
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents)
  const [stats, setStats] = useState<CalendarStats>(mockStats)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'appointment' as CalendarEvent['type'],
    start_time: '',
    end_time: '',
    location: '',
    patient_name: '',
    intern_id: '',
    status: 'scheduled' as CalendarEvent['status'],
    notes: ''
  })

  const supabase = createClient()
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

  useEffect(() => {
    if (!isMockMode) {
      loadEvents()
      loadStats()
    }
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          intern:intern_id(full_name),
          mentor:mentor_id(full_name)
        `)
        .order('start_time', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Carregar estatísticas do banco de dados
      const { data, error } = await supabase
        .rpc('get_calendar_stats')

      if (error) throw error
      setStats(data || mockStats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const createEvent = async () => {
    try {
      if (!formData.title || !formData.start_time) return

      const newEvent: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'> = {
        ...formData,
        created_by: user?.id || 'mock-user'
      }

      if (isMockMode) {
        const mockEvent: CalendarEvent = {
          ...newEvent,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setEvents(prev => [...prev, mockEvent])
      } else {
        const { data, error } = await supabase
          .from('calendar_events')
          .insert([newEvent])
          .select()
          .single()

        if (error) throw error
        setEvents(prev => [...prev, data])
      }

      setShowEventForm(false)
      resetForm()
      if (!isMockMode) loadStats()
    } catch (error) {
      console.error('Erro ao criar evento:', error)
    }
  }

  const updateEventStatus = async (eventId: string, status: CalendarEvent['status']) => {
    try {
      if (isMockMode) {
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, status, updated_at: new Date().toISOString() }
            : event
        ))
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', eventId)

        if (error) throw error
        await loadEvents()
        await loadStats()
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'appointment',
      start_time: '',
      end_time: '',
      location: '',
      patient_name: '',
      intern_id: '',
      status: 'scheduled',
      notes: ''
    })
  }

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'supervision':
        return <Users className="h-4 w-4" />
      case 'appointment':
        return <Clock className="h-4 w-4" />
      case 'meeting':
        return <Video className="h-4 w-4" />
      case 'evaluation':
        return <Stethoscope className="h-4 w-4" />
      case 'treatment':
        return <User className="h-4 w-4" />
      default:
        return <CalendarIcon className="h-4 w-4" />
    }
  }

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'supervision':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'appointment':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'meeting':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'evaluation':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'treatment':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_time), date)
    )
  }

  const generateCalendarDays = () => {
    const start = getStartOfWeek(startOfMonth(selectedDate))
    const end = endOfWeek(start)
    return eachDayOfInterval({ start, end })
  }

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Eventos</p>
              <p className="text-2xl font-bold">{stats.total_events}</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Supervisões Hoje</p>
              <p className="text-2xl font-bold">{stats.supervisions_today}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Consultas/Semana</p>
              <p className="text-2xl font-bold">{stats.appointments_week}</p>
            </div>
            <Stethoscope className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa Conclusão</p>
              <p className="text-2xl font-bold">{stats.completion_rate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duração Média</p>
              <p className="text-2xl font-bold">{stats.avg_session_duration}min</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMonthView = () => {
    const days = generateCalendarDays()
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="bg-card border rounded-lg p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dayEvents = getEventsForDate(day)
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, selectedDate)
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  isToday ? 'bg-primary/10 border-primary' : ''
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded text-center ${getEventTypeColor(event.type)}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEvent(event)
                      }}
                    >
                      {event.title.substring(0, 12)}...
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayEvents.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderEventForm = () => (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Novo Evento</CardTitle>
        <CardDescription>Criar um novo evento no calendário</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Título</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título do evento"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as CalendarEvent['type'] }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supervision">Supervisão</SelectItem>
                <SelectItem value="appointment">Consulta</SelectItem>
                <SelectItem value="meeting">Reunião</SelectItem>
                <SelectItem value="evaluation">Avaliação</SelectItem>
                <SelectItem value="treatment">Tratamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Descrição</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição do evento"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Data/Hora Início</label>
            <Input
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Data/Hora Fim</label>
            <Input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Local</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Local do evento"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Paciente</label>
            <Input
              value={formData.patient_name}
              onChange={(e) => setFormData(prev => ({ ...prev, patient_name: e.target.value }))}
              placeholder="Nome do paciente"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Observações</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Observações adicionais"
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowEventForm(false)}>
            Cancelar
          </Button>
          <Button onClick={createEvent}>
            Criar Evento
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderEventDetails = () => {
    if (!selectedEvent) return null

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getEventTypeIcon(selectedEvent.type)}
              {selectedEvent.title}
            </CardTitle>
            <Badge className={getStatusColor(selectedEvent.status)}>
              {selectedEvent.status}
            </Badge>
          </div>
          <CardDescription>
            {format(new Date(selectedEvent.start_time), 'PPP', { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Horário</p>
            <p className="text-sm">
              {format(new Date(selectedEvent.start_time), 'HH:mm')} - {format(new Date(selectedEvent.end_time), 'HH:mm')}
            </p>
          </div>

          {selectedEvent.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Descrição</p>
              <p className="text-sm">{selectedEvent.description}</p>
            </div>
          )}

          {selectedEvent.location && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Local</p>
              <p className="text-sm flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {selectedEvent.location}
              </p>
            </div>
          )}

          {selectedEvent.patient_name && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paciente</p>
              <p className="text-sm">{selectedEvent.patient_name}</p>
            </div>
          )}

          {selectedEvent.notes && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Observações</p>
              <p className="text-sm">{selectedEvent.notes}</p>
            </div>
          )}

          <div className="flex gap-2">
            {selectedEvent.status === 'scheduled' && (
              <Button 
                size="sm" 
                onClick={() => updateEventStatus(selectedEvent.id, 'in_progress')}
              >
                Iniciar
              </Button>
            )}
            {selectedEvent.status === 'in_progress' && (
              <Button 
                size="sm" 
                onClick={() => updateEventStatus(selectedEvent.id, 'completed')}
              >
                Concluir
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSelectedEvent(null)}
            >
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Calendário</h2>
              <p className="text-muted-foreground">
                Gerencie supervisionamentos, consultas e eventos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={() => setShowEventForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {renderStatsCards()}

          {/* View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Mês
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Semana
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Dia
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
              >
                ← Anterior
              </Button>
              <span className="text-lg font-semibold min-w-[200px] text-center">
                {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
              >
                Próximo →
              </Button>
            </div>
          </div>

          {/* Calendar and Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {renderMonthView()}
            </div>
            <div className="space-y-4">
              {showEventForm && renderEventForm()}
              {selectedEvent && renderEventDetails()}
            </div>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>Eventos programados para os próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  .filter(event => new Date(event.start_time) > new Date())
                  .slice(0, 5)
                  .map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getEventTypeColor(event.type)}`}>
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(event.start_time), 'PPP HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}