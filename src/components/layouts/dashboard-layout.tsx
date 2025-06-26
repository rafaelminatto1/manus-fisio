'use client'

import { Sidebar } from '@/components/navigation/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { NotificationsPanel, mockNotifications } from '@/components/ui/notifications-panel'
import { useAuth } from '@/hooks/use-auth'
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrador', variant: 'default' as const },
      mentor: { label: 'Mentor', variant: 'secondary' as const },
      intern: { label: 'Estagiário', variant: 'outline' as const },
      guest: { label: 'Visitante', variant: 'destructive' as const },
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.guest
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowNotifications(true)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Settings */}
              <Button 
                variant="ghost" 
                size="icon"
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <div className="h-8 w-8 rounded-full bg-medical-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">
                    {(user as any)?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <Card className="absolute right-0 top-full mt-2 w-48 z-50 bg-slate-900 border-slate-700">
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-sm text-slate-400">
                          {user?.email}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Perfil
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configurações
                        </Button>
                        <hr className="border-slate-700" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={signOut}
                          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteNotification={handleDeleteNotification}
      />
    </div>
  )
} 