
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, FileText, MessageSquare, Shield, Zap } from 'lucide-react'

export function EnhancedFeaturesSection() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-50">🚀 Funcionalidades Avançadas - Fase 6</h2>
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
          Recém Implementadas
        </Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-sm text-slate-50">Relatórios IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-300 mb-2">
              Geração automática de relatórios com insights de IA
            </p>
            <div className="flex items-center text-xs text-blue-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Implementado</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <CardTitle className="text-sm text-slate-50">Backup Inteligente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-300 mb-2">
              Sistema de backup com criptografia e verificação
            </p>
            <div className="flex items-center text-xs text-green-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Implementado</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-sm text-slate-50">WhatsApp Business</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-300 mb-2">
              Notificações automáticas para pacientes
            </p>
            <div className="flex items-center text-xs text-purple-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Implementado</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/20 border-orange-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-orange-400" />
              <CardTitle className="text-sm text-slate-50">Otimização IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-300 mb-2">
              Performance e workflows otimizados automaticamente
            </p>
            <div className="flex items-center text-xs text-orange-400">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Implementado</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
