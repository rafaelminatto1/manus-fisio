import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Grid3X3, 
  Plus, 
  Settings, 
  X, 
  GripVertical,
  Activity,
  Users,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Clock,
  Heart,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'

interface Widget {
  id: string
  type: string
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  visible: boolean
  config: Record<string, any>
}

interface WidgetData {
  [key: string]: any
}

interface DashboardWidgetsProps {
  isEditMode: boolean
  onToggleEditMode: () => void
}

export function DashboardWidgets({ isEditMode, onToggleEditMode }: DashboardWidgetsProps) {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'stats-overview',
      type: 'stats',
      title: 'Visão Geral',
      size: 'large',
      position: { x: 0, y: 0 },
      visible: true,
      config: {}
    },
    {
      id: 'recent-activities',
      type: 'activities',
      title: 'Atividades Recentes',
      size: 'medium',
      position: { x: 1, y: 0 },
      visible: true,
      config: {}
    },
    {
      id: 'upcoming-events',
      type: 'calendar',
      title: 'Próximos Eventos',
      size: 'medium',
      position: { x: 0, y: 1 },
      visible: true,
      config: {}
    },
    {
      id: 'team-performance',
      type: 'performance',
      title: 'Performance da Equipe',
      size: 'medium',
      position: { x: 1, y: 1 },
      visible: true,
      config: {}
    },
    {
      id: 'quick-actions',
      type: 'actions',
      title: 'Ações Rápidas',
      size: 'small',
      position: { x: 2, y: 0 },
      visible: true,
      config: {}
    },
    {
      id: 'notifications-summary',
      type: 'notifications',
      title: 'Resumo de Notificações',
      size: 'small',
      position: { x: 2, y: 1 },
      visible: true,
      config: {}
    }
  ])

  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [widgetData, setWidgetData] = useState<WidgetData>({})

  // Mock data para os widgets
  useEffect(() => {
    setWidgetData({
      stats: {
        notebooks: 24,
        projects: 8,
        activeInterns: 12,
        completedTasks: 156,
        totalTasks: 189,
        activeMentorships: 15
      },
      activities: [
        { id: 1, type: 'notebook', message: 'Protocolo de reabilitação atualizado', time: '5 min atrás' },
        { id: 2, type: 'project', message: 'Nova tarefa criada no projeto supervisão', time: '15 min atrás' },
        { id: 3, type: 'user', message: 'Ana Costa fez login', time: '30 min atrás' }
      ],
      calendar: [
        { id: 1, title: 'Supervisão - João Silva', time: '14:00', type: 'supervision' },
        { id: 2, title: 'Reunião de equipe', time: '16:30', type: 'meeting' },
        { id: 3, title: 'Avaliação - Maria Santos', time: 'Amanhã 09:00', type: 'evaluation' }
      ],
      performance: {
        productivity: 87,
        satisfaction: 94,
        completion: 82,
        growth: 15
      }
    })
  }, [])

  const availableWidgets = [
    { type: 'stats', title: 'Estatísticas', icon: BarChart3, description: 'Números gerais do sistema' },
    { type: 'activities', title: 'Atividades', icon: Activity, description: 'Ações recentes dos usuários' },
    { type: 'calendar', title: 'Calendário', icon: Calendar, description: 'Próximos eventos e compromissos' },
    { type: 'performance', title: 'Performance', icon: TrendingUp, description: 'Métricas de desempenho' },
    { type: 'actions', title: 'Ações Rápidas', icon: Zap, description: 'Botões para ações frequentes' },
    { type: 'notifications', title: 'Notificações', icon: AlertTriangle, description: 'Resumo de alertas' },
    { type: 'chart', title: 'Gráfico', icon: LineChart, description: 'Visualizações de dados' },
    { type: 'weather', title: 'Clima', icon: Heart, description: 'Condições climáticas' },
    { type: 'finance', title: 'Financeiro', icon: DollarSign, description: 'Resumo financeiro' }
  ]

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ))
  }

  const addWidget = (type: string) => {
    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      title: availableWidgets.find(w => w.type === type)?.title || type,
      size: 'medium',
      position: { x: 0, y: 0 },
      visible: true,
      config: {}
    }
    setWidgets(prev => [...prev, newWidget])
  }

  const removeWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId))
  }

  const renderWidget = (widget: Widget) => {
    if (!widget.visible) return null

    const sizeClasses = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-1', 
      large: 'col-span-3 row-span-1'
    }

    return (
      <Card 
        key={widget.id}
        className={`${sizeClasses[widget.size]} ${isEditMode ? 'border-dashed border-2 border-primary/50' : ''} ${
          draggedWidget === widget.id ? 'opacity-50' : ''
        }`}
        draggable={isEditMode}
        onDragStart={() => setDraggedWidget(widget.id)}
        onDragEnd={() => setDraggedWidget(null)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {isEditMode && <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />}
              {widget.title}
            </CardTitle>
            {isEditMode && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleWidgetVisibility(widget.id)}
                >
                  {widget.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeWidget(widget.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {renderWidgetContent(widget)}
        </CardContent>
      </Card>
    )
  }

  const renderWidgetContent = (widget: Widget) => {
    switch (widget.type) {
      case 'stats':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{widgetData.stats?.notebooks || 0}</div>
              <div className="text-xs text-muted-foreground">Notebooks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{widgetData.stats?.projects || 0}</div>
              <div className="text-xs text-muted-foreground">Projetos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{widgetData.stats?.activeInterns || 0}</div>
              <div className="text-xs text-muted-foreground">Estagiários</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{widgetData.stats?.activeMentorships || 0}</div>
              <div className="text-xs text-muted-foreground">Mentorias</div>
            </div>
          </div>
        )

      case 'activities':
        return (
          <div className="space-y-3">
            {widgetData.activities?.slice(0, 3).map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )

      case 'calendar':
        return (
          <div className="space-y-3">
            {widgetData.calendar?.slice(0, 3).map((event: any) => (
              <div key={event.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.type}
                </Badge>
              </div>
            ))}
          </div>
        )

      case 'performance':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Produtividade</span>
                <span className="text-sm font-medium">{widgetData.performance?.productivity || 0}%</span>
              </div>
              <Progress value={widgetData.performance?.productivity || 0} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Satisfação</span>
                <span className="text-sm font-medium">{widgetData.performance?.satisfaction || 0}%</span>
              </div>
              <Progress value={widgetData.performance?.satisfaction || 0} className="h-2" />
            </div>
          </div>
        )

      case 'actions':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-auto p-3">
              <div className="text-center">
                <Plus className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs">Novo</div>
              </div>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3">
              <div className="text-center">
                <Calendar className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs">Agendar</div>
              </div>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3">
              <div className="text-center">
                <Users className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs">Equipe</div>
              </div>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3">
              <div className="text-center">
                <Settings className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs">Config</div>
              </div>
            </Button>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Não lidas</span>
              <Badge variant="destructive">3</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Urgentes</span>
              <Badge variant="warning">1</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total hoje</span>
              <Badge variant="secondary">12</Badge>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center text-muted-foreground">
            <div className="text-sm">Widget: {widget.type}</div>
            <div className="text-xs">Conteúdo em desenvolvimento</div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Widget Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Personalizado</h2>
        <div className="flex items-center gap-3">
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={onToggleEditMode}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            {isEditMode ? "Finalizar Edição" : "Personalizar"}
          </Button>
        </div>
      </div>

      {/* Add Widget Panel */}
      {isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableWidgets.map((widgetType) => (
                <Button
                  key={widgetType.type}
                  variant="outline"
                  onClick={() => addWidget(widgetType.type)}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <widgetType.icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="text-sm font-medium">{widgetType.title}</div>
                    <div className="text-xs text-muted-foreground">{widgetType.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map(renderWidget)}
      </div>

      {/* Widget Visibility Panel */}
      {isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visibilidade dos Widgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {widgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{widget.title}</span>
                    <Badge variant="outline" className="text-xs">{widget.size}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWidgetVisibility(widget.id)}
                    >
                      {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWidget(widget.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Hook para gerenciar widgets
export function useDashboardWidgets() {
  const [isEditMode, setIsEditMode] = useState(false)

  return {
    isEditMode,
    toggleEditMode: () => setIsEditMode(prev => !prev)
  }
} 