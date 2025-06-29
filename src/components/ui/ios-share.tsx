'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/cn'
import { Share, Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface IOSShareProps {
  url?: string
  title?: string
  text?: string
  className?: string
}

export function IOSShare({ 
  url = window.location.href, 
  title = 'Manus Fisio',
  text = 'Sistema de Gestão Clínica',
  className 
}: IOSShareProps) {
  const [copied, setCopied] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  React.useEffect(() => {
    const userAgent = navigator.userAgent
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent))
  }, [])

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
      } catch (error) {
        console.log('Share cancelled or failed:', error)
      }
    }
  }, [title, text, url])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [url])

  const supportsNativeShare = typeof navigator.share === 'function' && isIOS

  if (!isIOS) return null

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
          <Share className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">Compartilhar</h3>
          <p className="text-sm text-muted-foreground">
            Compartilhe com sua equipe
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {supportsNativeShare && (
          <Button
            onClick={handleNativeShare}
            className="w-full justify-start ios-button"
            variant="outline"
          >
            <Share className="h-4 w-4 mr-3" />
            Compartilhar via iOS
            <Badge variant="secondary" className="ml-auto">iOS</Badge>
          </Button>
        )}
        
        <Button
          onClick={handleCopyLink}
          className="w-full justify-start"
          variant="outline"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-3 text-green-600" />
              <span className="text-green-600">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-3" />
              Copiar Link
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
