import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { NotificationsPanel } from '@/components/ui/notifications-panel'
import { cn } from '@/lib/utils'
import { 
  Home,
  BookOpen, 
  Target,
  Users,
  Calendar,
  Settings,
  Bell,
  Search,
  Plus,
  Heart,
  LogOut,
  BarChart3,
  Monitor,
  Activity,
  HardDrive,
  MessageSquare,
  ClipboardList,
  LayoutGrid
} from 'lucide-react'

const navigationItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: Home,
    badge: null
  },
  {
    href: '/notebooks',
    label: 'Notebooks',
    icon: BookOpen,
    badge: null
  },
  {
    href: '/projects',
    label: 'Projetos',
    icon: Target,
    badge: '12'
  },
  {
    href: '/patients',
    label: 'Pacientes',
    icon: Users,
    badge: null
  },
  {
    href: '/exercises',
    label: 'Exercícios',
    icon: Activity,
    badge: null
  },
  {
    href: '/team',
    label: 'Equipe',
    icon: Users,
    badge: '5'
  },
  {
    href: '/calendar',
    label: 'Calendário',
    icon: Calendar,
    badge: null
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    badge: null
  },
  {
    href: '/system-monitor',
    label: 'Monitor Sistema',
    icon: Monitor,
    badge: null
  },
  {
    href: '/backup',
    label: 'Backup',
    icon: HardDrive,
    badge: null
  },
  {
    href: '/collaboration',
    label: 'Colaboração',
    icon: MessageSquare,
    badge: null
  },
  {
    href: '/tasks',
    label: 'Tarefas',
    icon: LayoutGrid,
    badge: null
  }
]

const quickActions = [
  {
    href: '/notebooks',
    label: 'Novo Notebook',
    icon: BookOpen
  },
  {
    href: '/projects',
    label: 'Novo Projeto',
    icon: Target
  },
  {
    href: '/calendar',
    label: 'Agendar',
    icon: Calendar
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="sidebar w-64 p-4 flex flex-col h-full bg-gradient-to-b from-background to-background/95 border-r border-border/50">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 animate-fade-in-up">
        <div className="relative">
          <Heart className="h-8 w-8 text-medical-500 animate-float" />
          <div className="absolute inset-0 h-8 w-8 text-medical-500/20 animate-pulse"></div>
        </div>
        <h1 className="text-xl font-bold text-foreground bg-gradient-to-r from-medical-600 to-medical-500 bg-clip-text text-transparent">
          Manus Fisio
        </h1>
      </div>
      
      {/* Quick Search */}
      <Button variant="outline" className="w-full justify-start mb-6" size="sm">
        <Search className="mr-2 h-4 w-4" />
        Buscar...
        <kbd className="ml-auto text-xs text-muted-foreground">⌘K</kbd>
      </Button>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <EnhancedButton 
                variant={isActive ? "medical" : "ghost"} 
                className={cn(
                  "w-full justify-start group hover-lift animate-fade-in-up",
                  isActive && "shadow-lg shadow-medical-500/25 bg-gradient-to-r from-medical-500 to-medical-600"
                )}
                size="sm"
                animation="scale"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <item.icon className={cn(
                  "mr-2 h-4 w-4 transition-all duration-200",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
                )} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className={cn(
                      "ml-auto text-xs transition-all duration-200 animate-pulse-slow",
                      isActive && "bg-white/20 text-white border-white/30"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </EnhancedButton>
            </Link>
          )
        })}
      </nav>

      {/* Quick Actions */}
      <div className="mt-auto pt-4 border-t">
        <h3 className="font-semibold text-sm text-muted-foreground mb-3">AÇÕES RÁPIDAS</h3>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* User Profile / Settings */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-medical-500 flex items-center justify-center text-white text-sm font-medium">
            {user?.full_name ? getUserInitials(user.full_name) : 'U'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">
              {user?.full_name || 'Usuário'}
            </div>
            <div className="text-xs text-muted-foreground">
              {user?.role === 'admin' ? 'Administrador' :
               user?.role === 'mentor' ? 'Fisioterapeuta' :
               user?.role === 'intern' ? 'Estagiário' : 'Usuário'}
            </div>
          </div>
          {/* Painel de Notificações Inteligente */}
          <NotificationsPanel className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
} 