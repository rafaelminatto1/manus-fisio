'use client'

import { Sidebar } from '@/components/navigation/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { NotificationsPanel, mockNotifications } from '@/components/ui/notifications-panel'
import { GlobalSearch, useGlobalSearch } from '@/components/ui/global-search'
import { KeyboardShortcuts, useKeyboardShortcuts } from '@/components/ui/keyboard-shortcuts'
import { useAuth } from '@/hooks/use-auth'
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  ChevronDown,
  Keyboard,
  Command
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const router = useRouter()

  // Hooks para sistemas avançados
  const { isOpen: searchOpen, openSearch, closeSearch } = useGlobalSearch()
  const { isOpen: shortcutsOpen, openShortcuts, closeShortcuts } = useKeyboardShortcuts()

  const unreadCount = notifications.filter(n => !n.read).length

  // Navegação por atalhos
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Não processar se estiver em um input
      const activeElement = document.activeElement
      if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
        return
      }

      // Atalhos de navegação com G + letra
      if (e.key === 'g' || e.key === 'G') {
        const handleSecondKey = (e2: KeyboardEvent) => {
          switch (e2.key.toLowerCase()) {
            case 'h':
              router.push('/')
              break
            case 'n':
              router.push('/notebooks')
              break
            case 'p':
              router.push('/projects')
              break
            case 't':
              router.push('/team')
              break
            case 'c':
              router.push('/calendar')
              break
            case 's':
              router.push('/settings')
              break
          }
          document.removeEventListener('keydown', handleSecondKey)
        }
        document.addEventListener('keydown', handleSecondKey)
        
        // Remove listener após 2 segundos
        setTimeout(() => {
          document.removeEventListener('keydown', handleSecondKey)
        }, 2000)
      }

      // Atalho para mostrar shortcuts
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        openShortcuts()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router, openShortcuts])

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
                  placeholder="Buscar... (⌘K)" 
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400 cursor-pointer"
                  onClick={openSearch}
                  readOnly
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">K</kbd>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Keyboard Shortcuts */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={openShortcuts}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
                title="Atalhos de teclado (?)"
              >
                <Keyboard className="h-5 w-5" />
              </Button>

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
                onClick={() => router.push('/settings')}
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
                          onClick={() => router.push('/settings')}
                          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configurações
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={openShortcuts}
                          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Keyboard className="h-4 w-4 mr-2" />
                          Atalhos
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

          {/* Quick Navigation Hint */}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>Pressione</span>
              <kbd className="px-1 py-0.5 bg-slate-800 rounded text-xs">G</kbd>
              <span>+</span>
              <kbd className="px-1 py-0.5 bg-slate-800 rounded text-xs">H</kbd>
              <span>para Dashboard</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-slate-800 rounded text-xs">?</kbd>
              <span>para ver todos os atalhos</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Advanced Panels */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteNotification={handleDeleteNotification}
      />

      <GlobalSearch
        isOpen={searchOpen}
        onClose={closeSearch}
      />

      <KeyboardShortcuts
        isOpen={shortcutsOpen}
        onClose={closeShortcuts}
      />
    </div>
  )
} 