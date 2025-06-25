'use client'

import { Sidebar } from '@/components/navigation/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

  const handleSignOut = async () => {
    await signOut()
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
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Search */}
              <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pacientes, protocolos..."
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-medical-500 rounded-full text-xs"></span>
                </Button>

                {/* User Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-medical-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium leading-none">
                          {user?.full_name || 'Usuário'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {showUserMenu && (
                    <Card className="absolute right-0 top-full mt-2 w-72 z-50">
                      <CardContent className="p-4 space-y-4">
                        {/* User Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{user?.full_name}</h4>
                            {getRoleBadge(user?.role || 'guest')}
                          </div>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                          {user?.crefito && (
                            <p className="text-xs text-muted-foreground">CREFITO: {user.crefito}</p>
                          )}
                          {user?.specialty && (
                            <p className="text-xs text-muted-foreground">Especialidade: {user.specialty}</p>
                          )}
                          {user?.university && (
                            <p className="text-xs text-muted-foreground">
                              {user.university} - {user.semester}º semestre
                            </p>
                          )}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                          <Button variant="ghost" className="w-full justify-start" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Configurações
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive hover:text-destructive" 
                            size="sm"
                            onClick={handleSignOut}
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

          {/* Main Content */}
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
} 