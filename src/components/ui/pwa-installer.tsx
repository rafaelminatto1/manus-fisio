'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, 
  Download, 
  Share,
  Check,
  X,
  Wifi,
  Zap,
  Clock,
  Shield
} from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallerProps {
  className?: string
}

export function PWAInstaller({ className }: PWAInstallerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    // Detectar se já está em modo standalone
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isRunningStandalone)

    // Verificar se já está instalado
    if (isRunningStandalone || (window.navigator as any).standalone) {
      setIsInstalled(true)
      return
    }

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    // Listener para após instalação
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Mostrar prompt para iOS após 30 segundos se não estiver instalado
    if (isIOSDevice && !isRunningStandalone) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 30000)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice

    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Mostrar novamente em 7 dias
    localStorage.setItem('pwa-dismissed', Date.now().toString())
  }

  // Não mostrar se já estiver instalado ou se foi dispensado recentemente
  const dismissedTime = localStorage.getItem('pwa-dismissed')
  if (isInstalled || isStandalone) return null
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 7 * 24 * 60 * 60 * 1000) return null
  if (!showPrompt) return null

  const benefits = [
    {
      icon: Zap,
      title: 'Acesso Rápido',
      description: 'Abra direto da tela inicial, sem navegador'
    },
    {
      icon: Wifi,
      title: 'Funciona Offline',
      description: 'Consulte dados mesmo sem internet'
    },
    {
      icon: Clock,
      title: 'Mais Rápido',
      description: 'Carregamento instantâneo'
    },
    {
      icon: Shield,
      title: 'Mais Seguro',
      description: 'Dados protegidos e criptografados'
    }
  ]

  return (
    <div className={`fixed bottom-4 right-4 max-w-sm z-50 ${className}`}>
      <Card className="shadow-lg border-2 border-medical-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-medical-600" />
              Instalar App
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Badge className="bg-medical-100 text-medical-800 w-fit">
            Recomendado para Fisioterapeutas
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Instale o app para uma experiência mais rápida e prática no atendimento aos pacientes.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <benefit.icon className="h-6 w-6 text-medical-600 mx-auto mb-1" />
                <div className="text-xs font-medium">{benefit.title}</div>
                <div className="text-xs text-gray-500">{benefit.description}</div>
              </div>
            ))}
          </div>

          {isIOS ? (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Share className="h-4 w-4" />
                  Como instalar no iOS:
                </p>
                <ol className="text-xs space-y-1 text-gray-700">
                  <li>1. Toque no botão "Compartilhar" do Safari</li>
                  <li>2. Selecione "Adicionar à Tela de Início"</li>
                  <li>3. Toque em "Adicionar"</li>
                </ol>
              </div>
              
              <EnhancedButton
                onClick={() => setShowPrompt(false)}
                leftIcon={<Check className="h-4 w-4" />}
                variant="medical"
                className="w-full"
              >
                Entendi
              </EnhancedButton>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
              >
                Agora Não
              </Button>
              <EnhancedButton
                onClick={handleInstallClick}
                leftIcon={<Download className="h-4 w-4" />}
                variant="medical"
                className="flex-1"
                disabled={!deferredPrompt}
              >
                Instalar
              </EnhancedButton>
            </div>
          )}

          <div className="text-xs text-center text-gray-500">
            Gratuito • Sem anúncios • Dados seguros
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook para verificar status de instalação
export function usePWAInstallation() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Verificar se está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone
      setIsInstalled(isStandalone || isIOSStandalone)
    }

    checkInstalled()

    // Listener para prompt de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    
    if (choiceResult.outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsInstallable(false)
      return true
    }
    
    return false
  }

  return {
    isInstalled,
    isInstallable,
    promptInstall
  }
} 