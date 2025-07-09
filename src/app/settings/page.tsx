'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AuthGuard } from '@/components/auth/auth-guard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LGPDCompliance } from '@/components/ui/lgpd-compliance'
import { useAuth } from '@/hooks/use-auth-fixed'
import { 
  Settings as SettingsIcon, 
  Shield, 
  User, 
  Bell,
  Download,
  Trash2
} from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  
  // Mock LGPD data
  const mockConsents = {
    essential: true,
    analytics: true,
    marketing: false,
    research: true
  }

  const mockActivityLogs = [
    {
      id: '1',
      action: 'login',
      timestamp: new Date(),
      resource: 'dashboard',
      ip_address: '192.168.1.100'
    },
    {
      id: '2',
      action: 'view',
      timestamp: new Date(Date.now() - 3600000),
      resource: 'notebook',
      ip_address: '192.168.1.100'
    },
    {
      id: '3',
      action: 'edit',
      timestamp: new Date(Date.now() - 7200000),
      resource: 'project',
      ip_address: '192.168.1.100'
    }
  ]

  const handleExportData = () => {
    // Mock export functionality
    const userData = {
      user: user,
      notebooks: [],
      projects: [],
      tasks: [],
      comments: [],
      activityLogs: mockActivityLogs
    }
    
    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `manus-fisio-dados-${user?.email}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteAccount = () => {
    // This would implement actual account deletion
    alert('Funcionalidade de exclusão de conta seria implementada aqui com confirmação adicional.')
  }

  const handleUpdateConsent = (category: string, consent: boolean) => {
    // This would update consent in the database
    console.log(`Updating consent for ${category}: ${consent}`)
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="h-8 w-8" />
              Configurações
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas configurações pessoais, privacidade e compliance LGPD.
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacidade
              </TabsTrigger>
              <TabsTrigger value="lgpd" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                LGPD
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Perfil</CardTitle>
                  <CardDescription>
                    Suas informações pessoais e profissionais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nome Completo</label>
                      <p className="text-sm text-muted-foreground">{user?.full_name || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-muted-foreground">{user?.email || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <p className="text-sm text-muted-foreground">{user?.role || 'Não informado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">CREFITO</label>
                      <p className="text-sm text-muted-foreground">{user?.crefito || 'Não informado'}</p>
                    </div>
                  </div>
                  <Button>Editar Perfil</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Notificação</CardTitle>
                  <CardDescription>
                    Configure como e quando você deseja receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configurações de notificação serão implementadas aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Privacidade</CardTitle>
                  <CardDescription>
                    Controle quem pode ver suas informações e atividades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configurações de privacidade serão implementadas aqui.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* LGPD Tab */}
            <TabsContent value="lgpd" className="space-y-6">
              <LGPDCompliance
                userId={user?.id || ''}
                userEmail={user?.email || ''}
                onExportData={handleExportData}
                onDeleteAccount={handleDeleteAccount}
                onUpdateConsent={handleUpdateConsent}
                complianceScore={98}
                consents={mockConsents}
                dataRetentionDays={365}
                lastDataExport={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)} // 30 days ago
                activityLogs={mockActivityLogs}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
} 