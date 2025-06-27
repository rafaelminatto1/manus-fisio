'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/cn'
import { Bell, BellOff, Check, X, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function IOSPushNotifications() {
  const [permission, setPermission] = useState('default')
  const [isIOS, setIsIOS] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent))
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    
    setIsLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        new Notification('Manus Fisio', {
          body: 'Notificações ativadas! 🎉',
          icon: '/icons/icon-192x192.png'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isIOS) return null

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-full',
            permission === 'granted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          )}>
            {permission === 'granted' ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-semibold">Notificações Push</h3>
            <p className="text-sm text-muted-foreground">iOS Push Notifications</p>
          </div>
        </div>
        
        {permission === 'granted' && (
          <Badge variant="outline" className="text-green-600">
            <Check className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        )}
      </div>

      {permission === 'default' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-900">
              Ative as notificações para receber lembretes importantes
            </p>
          </div>
          
          <Button
            onClick={requestPermission}
            disabled={isLoading}
            className="w-full ios-button"
          >
            {isLoading ? 'Solicitando...' : 'Ativar Notificações'}
          </Button>
        </div>
      )}
    </Card>
  )
}
