'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/hooks/use-auth'
import { 
  ArrowLeft, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Save,
  Stethoscope,
  GraduationCap,
  FileCheck,
  Coffee
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default function NewEventPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<'appointment' | 'supervision' | 'meeting' | 'break'>('appointment')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState<Date>()
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [attendees, setAttendees] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !date || !new Date(`${format(date, 'yyyy-MM-dd')} ${startTime}`).toISOString() || !new Date(`${format(date, 'yyyy-MM-dd')} ${endTime}`).toISOString()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Usuário não autenticado')
        return
      }

      const eventData = {
        title: title.trim(),
        description: description.trim() || null,
        start_time: new Date(`${format(date, 'yyyy-MM-dd')} ${startTime}`).toISOString(),
        end_time: new Date(`${format(date, 'yyyy-MM-dd')} ${endTime}`).toISOString(),
        event_type: eventType,
        location: location.trim() || null,
        attendees: attendees.split(',').map(email => email.trim()).filter(Boolean),
        created_by: user.id,
        metadata: {
          created_from: 'calendar_new_page'
        }
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventData)
        .select()
        .single()

      if (error) throw error

      // Criar notificação de sucesso
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: '📅 Evento criado com sucesso',
          message: `"${title}" foi agendado para ${format(new Date(new Date(eventData.start_time).toISOString()), 'PPp', { locale: ptBR })}`,
          type: 'success',
          metadata: {
            event_id: data.id,
            event_type: eventType
          }
        })

      toast.success('Evento criado com sucesso!')
      router.push(`/calendar?highlight=${data.id}`)
      
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      toast.error('Erro ao criar evento. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return Stethoscope
      case 'supervision': return GraduationCap
      case 'meeting': return FileCheck
      case 'break': return Coffee
      default: return CalendarIcon
    }
  }

  const getEventTypeName = (type: string) => {
    switch (type) {
      case 'appointment': return 'Consulta/Atendimento'
      case 'supervision': return 'Supervisão'
      case 'meeting': return 'Reunião'
      case 'break': return 'Pausa/Descanso'
      default: return 'Outro'
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Criar Novo Evento</h1>
              <p className="text-muted-foreground">
                Agende consultas, supervisões e reuniões
              </p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Informações do Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título *</label>
                  <Input
                    placeholder="Ex: Consulta - João Silva"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Tipo de Evento</label>
                  <Select value={eventType} onValueChange={(v: any) => setEventType(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appointment">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          Consulta/Atendimento
                        </div>
                      </SelectItem>
                      <SelectItem value="supervision">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Supervisão
                        </div>
                      </SelectItem>
                      <SelectItem value="meeting">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4" />
                          Reunião
                        </div>
                      </SelectItem>
                      <SelectItem value="break">
                        <div className="flex items-center gap-2">
                          <Coffee className="h-4 w-4" />
                          Pausa/Descanso
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    placeholder="Detalhes adicionais sobre o evento..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Data *</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full mt-1 justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Local</label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Sala 101"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Horário de Início</label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Horário de Término</label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Participantes</label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="email1@exemplo.com, email2@exemplo.com"
                      value={attendees}
                      onChange={(e) => setAttendees(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Separe múltiplos emails com vírgula
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSubmit}
                    disabled={!title.trim() || !date || !new Date(`${format(date, 'yyyy-MM-dd')} ${startTime}`).toISOString() || !new Date(`${format(date, 'yyyy-MM-dd')} ${endTime}`).toISOString()}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Criar Evento
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 