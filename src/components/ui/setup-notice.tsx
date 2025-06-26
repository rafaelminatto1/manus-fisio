'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { ExternalLink, Database, Settings, CheckCircle, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export function SetupNotice() {
  const [dismissed, setDismissed] = useState(false)
  const hasSupabaseCredentials = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const isMockMode = process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' || !hasSupabaseCredentials

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
          <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">
              {!hasSupabaseCredentials ? 'Configuração do Supabase Necessária' : 'Modo de Demonstração'}
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              {!hasSupabaseCredentials ? (
                <div className="space-y-2">
                  <p>
                    <Database className="inline h-4 w-4 mr-1" />
                    As credenciais do Supabase não foram encontradas. O sistema está funcionando em modo mock.
                  </p>
                  <div className="text-sm space-y-1">
                    <p><strong>Para configurar o Supabase:</strong></p>
                    <ol className="list-decimal list-inside ml-4 space-y-1">
                      <li>Crie um arquivo <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env.local</code> na raiz do projeto</li>
                      <li>Adicione suas credenciais do Supabase (veja <code>CREDENCIAIS_CONFIGURADAS.md</code>)</li>
                      <li>Reinicie o servidor com <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">npm run dev</code></li>
                    </ol>
                  </div>
                </div>
              ) : (
                <p>
                  <Settings className="inline h-4 w-4 mr-1" />
                  Você está usando dados de demonstração. Para usar dados reais, descomente NEXT_PUBLIC_MOCK_AUTH no arquivo .env.local
                </p>
              )}
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