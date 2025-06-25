import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  MapPin,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Video,
  User,
  GraduationCap,
  Filter
} from 'lucide-react'

// Mock data para eventos do calendário
const events = [
  {
    id: '1',
    title: 'Supervisão - Maria Silva',
    type: 'supervision',
    time: '09:00',
    duration: '60 min',
    mentor: 'Dr. Rafael Santos',
    intern: 'Maria Silva',
    location: 'Sala 201',
    status: 'confirmed',
    mode: 'presential'
  },
  {
    id: '2',
    title: 'Avaliação Prática - Pedro Alves',
    type: 'evaluation',
    time: '11:00',
    duration: '90 min',
    mentor: 'Dr. Rafael Santos',
    intern: 'Pedro Alves',
    location: 'Sala de Prática',
    status: 'confirmed',
    mode: 'presential'
  },
  {
    id: '3',
    title: 'Sessão de Neurológica - Paciente João',
    type: 'session',
    time: '14:00',
    duration: '45 min',
    therapist: 'Dra. Ana Lima',
    patient: 'João Silva',
    location: 'Sala 105',
    status: 'confirmed',
    mode: 'presential'
  },
  {
    id: '4',
    title: 'Reunião de Equipe',
    type: 'meeting',
    time: '16:00',
    duration: '60 min',
    participants: ['Dr. Santos', 'Dra. Lima', 'Maria Silva'],
    location: 'Sala de Reuniões',
    status: 'pending',
    mode: 'hybrid'
  },
  {
    id: '5',
    title: 'Supervisão Online - Carlos Torres',
    type: 'supervision',
    time: '10:30',
    duration: '45 min',
    mentor: 'Dra. Ana Lima',
    intern: 'Carlos Torres',
    location: 'Online',
    status: 'confirmed',
    mode: 'online'
  }
]

const currentDate = new Date(2024, 0, 16) // 16 de Janeiro de 2024
const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const eventTypes = {
  supervision: { label: 'Supervisão', color: 'bg-medical-100 border-medical-300 text-medical-800', icon: GraduationCap },
  evaluation: { label: 'Avaliação', color: 'bg-warning-100 border-warning-300 text-warning-800', icon: CheckCircle2 },
  session: { label: 'Sessão', color: 'bg-success-100 border-success-300 text-success-800', icon: User },
  meeting: { label: 'Reunião', color: 'bg-secondary-100 border-secondary-300 text-secondary-800', icon: Users },
}

function EventCard({ event }: { event: any }) {
  const eventConfig = eventTypes[event.type as keyof typeof eventTypes]
  const EventIcon = eventConfig.icon

  return (
    <Card className={`hover:shadow-md transition-shadow border-l-4 ${eventConfig.color}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <EventIcon className="h-4 w-4" />
            <Badge variant="outline" className="text-xs">
              {eventConfig.label}
            </Badge>
            {event.mode === 'online' && (
              <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                <Video className="mr-1 h-3 w-3" />
                Online
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{event.time}</span>
          </div>
        </div>
        <CardTitle className="text-sm font-medium">{event.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-2">
        <div className="text-xs space-y-1">
          {event.mentor && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3 w-3 text-muted-foreground" />
              <span>Mentor: {event.mentor}</span>
            </div>
          )}
          {event.intern && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span>Estagiário: {event.intern}</span>
            </div>
          )}
          {event.therapist && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span>Fisioterapeuta: {event.therapist}</span>
            </div>
          )}
          {event.patient && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span>Paciente: {event.patient}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{event.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Badge 
            variant={event.status === 'confirmed' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {event.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
          </Badge>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MessageSquare className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <AlertCircle className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CalendarDay({ day, isToday, events }: { day: number, isToday: boolean, events: any[] }) {
  return (
    <div className={`min-h-[120px] p-2 border border-border ${isToday ? 'bg-medical-50 border-medical-300' : 'bg-background'}`}>
      <div className={`text-sm font-medium mb-2 ${isToday ? 'text-medical-700' : 'text-foreground'}`}>
        {day}
      </div>
      <div className="space-y-1">
        {events.slice(0, 2).map(event => (
          <div 
            key={event.id}
            className={`text-xs p-1 rounded border-l-2 ${eventTypes[event.type as keyof typeof eventTypes].color}`}
          >
            <div className="font-medium truncate">{event.time}</div>
            <div className="truncate">{event.title}</div>
          </div>
        ))}
        {events.length > 2 && (
          <div className="text-xs text-muted-foreground">
            +{events.length - 2} mais
          </div>
        )}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const today = 16
  const daysInMonth = new Date(2024, 1, 0).getDate()
  const firstDayOfWeek = new Date(2024, 0, 1).getDay()
  
  const calendarDays = []
  
  // Dias vazios do início do mês
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = day === 16 ? events : [] // Apenas o dia 16 tem eventos para demonstração
    calendarDays.push({ day, events: dayEvents })
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="sidebar w-64 p-4">
        <div className="flex items-center gap-2 mb-8">
          <Calendar className="h-8 w-8 text-medical-500" />
          <h1 className="text-xl font-bold text-foreground">Manus Fisio</h1>
        </div>
        
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Notebooks
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Projetos
          </Button>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Equipe
          </Button>
          <Button variant="default" className="w-full justify-start" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Calendário
          </Button>
        </nav>

        {/* Mini Calendar */}
        <div className="mt-8">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">NAVEGAÇÃO</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              Hoje
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              Esta Semana
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              Este Mês
            </Button>
          </div>
        </div>

        {/* Event Types Filter */}
        <div className="mt-8">
          <h3 className="font-semibold text-sm text-muted-foreground mb-3">TIPOS DE EVENTO</h3>
          <div className="space-y-2">
            {Object.entries(eventTypes).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <config.icon className="h-3 w-3" />
                <span className="text-sm">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="navbar p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Calendário</h2>
                <p className="text-muted-foreground">Agenda de supervisões e sessões</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-medium min-w-[150px] text-center">
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                Visualizações
              </Button>
              <Button className="btn-medical">
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Button>
            </div>
          </div>
        </header>

        {/* Calendar Grid */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Header dos dias da semana */}
            {days.map(day => (
              <div key={day} className="bg-muted p-3 text-center text-sm font-medium">
                {day}
              </div>
            ))}
            
            {/* Dias do calendário */}
            {calendarDays.map((dayData, index) => (
              <div key={index}>
                {dayData ? (
                  <CalendarDay 
                    day={dayData.day} 
                    isToday={dayData.day === today}
                    events={dayData.events}
                  />
                ) : (
                  <div className="min-h-[120px] bg-muted/50"></div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Events Sidebar */}
      <div className="w-80 p-4 border-l bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Eventos de Hoje</h3>
          <Badge variant="secondary">{events.length}</Badge>
        </div>
        
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button className="w-full btn-medical">
            <Plus className="mr-2 h-4 w-4" />
            Agendar Evento
          </Button>
        </div>
      </div>
    </div>
  )
} 