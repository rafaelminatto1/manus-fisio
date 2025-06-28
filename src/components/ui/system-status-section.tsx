
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export function SystemStatusSection() {
  return (
    <Card className="mb-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-slate-50 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Sistema Manus Fisio - Status Completo</span>
            </CardTitle>
            <CardDescription className="text-slate-300">
              Todas as 5 fases de desenvolvimento concluídas com sucesso
            </CardDescription>
          </div>
          <Badge className="bg-green-500/20 text-green-400">
            100% Implementado
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">✅</div>
            <p className="text-slate-300">Fase 1</p>
            <p className="text-xs text-slate-400">Calendário</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">✅</div>
            <p className="text-slate-300">Fase 2</p>
            <p className="text-xs text-slate-400">Notificações</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">✅</div>
            <p className="text-slate-300">Fase 3</p>
            <p className="text-xs text-slate-400">Analytics</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">✅</div>
            <p className="text-slate-300">Fase 4</p>
            <p className="text-xs text-slate-400">IA Avançada</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">✅</div>
            <p className="text-slate-300">Fase 5</p>
            <p className="text-xs text-slate-400">UI/UX</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">🚀 Pronto para produção com todas as funcionalidades</span>
            <span className="text-green-400">Build: 0 warnings, 0 errors</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
