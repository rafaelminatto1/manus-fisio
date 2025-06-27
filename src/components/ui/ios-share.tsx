'use client'

import React, { useState, useCallback } from 'react'
import { cn } from '@/lib/cn'
import { Share, Copy, Mail, MessageSquare, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ShareData {
  title?: string
  text?: string
  url?: string
}

interface IOSShareProps {
  data: ShareData
  onShare?: (method: string) => void
  className?: string
}

export function IOSShare({ data, onShare, className }: IOSShareProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [hasNativeShare, setHasNativeShare] = useState(false)

  React.useEffect(() => {
    const userAgent = navigator.userAgent
    const iosDetected = /iPad|iPhone|iPod/.test(userAgent)
    const nativeShareSupported = 'share' in navigator
    
    setIsIOS(iosDetected)
    setHasNativeShare(nativeShareSupported)
  }, [])

  const handleNativeShare = useCallback(async () => {
    if (!hasNativeShare) return
    
    setIsSharing(true)
    try {
      await navigator.share(data)
      onShare?.('native')
    } catch (error) {
      console.error('Erro ao compartilhar:', error)
    } finally {
      setIsSharing(false)
    }
  }, [data, hasNativeShare, onShare])

  const handleCopyLink = useCallback(async () => {
    try {
      const textToCopy = data.url || data.text || ''
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      onShare?.('copy')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }, [data, onShare])

  if (!isIOS) return null

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      <div className=\
flex
items-center
gap-3\>
        <div className=\p-2
bg-blue-100
text-blue-600
rounded-full\>
          <Share className=\h-5
w-5\ />
        </div>
        <div>
          <h3 className=\font-semibold\>Compartilhar</h3>
          <p className=\text-sm
text-muted-foreground\>
            {data.title || 'Conteúdo do Manus Fisio'}
          </p>
        </div>
      </div>

      <div className=\space-y-2\>
        {hasNativeShare && (
          <Button
            onClick={handleNativeShare}
            disabled={isSharing}
            className=\w-full
ios-button
justify-start\
            variant=\outline\
          >
            <Share className=\h-4
w-4
mr-3\ />
            {isSharing ? 'Compartilhando...' : 'Compartilhar (Nativo)'}
            <Badge variant=\secondary\ className=\ml-auto\>iOS</Badge>
          </Button>
        )}

        <Button
          onClick={handleCopyLink}
          className=\w-full
ios-button
justify-start\
          variant=\outline\
        >
          {copied ? (
            <>
              <Check className=\h-4
w-4
mr-3
text-green-600\ />
              <span className=\text-green-600\>Copiado!</span>
            </>
          ) : (
            <>
              <Copy className=\h-4
w-4
mr-3\ />
              Copiar Link
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
