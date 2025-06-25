'use client'

import { Alert, AlertDescription } from './alert'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { ExternalLink, Database, Settings, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export function SetupNotice() {
  const [dismissed, setDismissed] = useState(false)
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'

  if (!isMockMode || dismissed) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">Modo Desenvolvimento</CardTitle>
            </div>
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-600">
              Mock Data
            </Badge>
          </div>
          <CardDescription>
            Sistema funcionando com dados simulados
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <Alert className="border-blue-200/30 bg-blue-50/50">
            <Database className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Para dados reais, configure o Supabase seguindo o arquivo <strong>PROXIMOS_PASSOS.md</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Próximos passos:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                Criar projeto no Supabase
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                Atualizar .env.local
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                Remover MOCK_AUTH=true
              </li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setDismissed(true)}
            >
              Entendi
            </Button>
            <Button 
              size="sm" 
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() => window.open('https://supabase.com', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Supabase
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 