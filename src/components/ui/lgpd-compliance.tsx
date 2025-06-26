import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  UserX
} from 'lucide-react'

interface LGPDComplianceProps {
  userId: string
  userEmail: string
  onExportData: () => void
  onDeleteAccount: () => void
  onUpdateConsent: (category: string, consent: boolean) => void
  complianceScore: number
  consents: Record<string, boolean>
  dataRetentionDays: number
  lastDataExport?: Date
  activityLogs: Array<{
    id: string
    action: string
    timestamp: Date
    resource: string
    ip_address: string
  }>
}

export function LGPDCompliance({
  userId,
  userEmail,
  onExportData,
  onDeleteAccount,
  onUpdateConsent,
  complianceScore,
  consents,
  dataRetentionDays,
  lastDataExport,
  activityLogs
}: LGPDComplianceProps) {
  const [showActivityLogs, setShowActivityLogs] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const consentCategories = [
    {
      id: 'essential',
      title: 'Funcionalidades Essenciais',
      description: 'Dados necessários para o funcionamento básico do sistema',
      required: true
    },
    {
      id: 'analytics',
      title: 'Analytics e Métricas',
      description: 'Coleta de dados para melhorar a experiência do usuário',
      required: false
    },
    {
      id: 'marketing',
      title: 'Comunicações de Marketing',
      description: 'Envio de emails promocionais e atualizações do produto',
      required: false
    },
    {
      id: 'research',
      title: 'Pesquisa e Desenvolvimento',
      description: 'Uso de dados anonimizados para pesquisa clínica',
      required: false
    }
  ]

  const getComplianceStatus = (score: number) => {
    if (score >= 95) return { status: 'Excelente', color: 'bg-green-500', icon: CheckCircle }
    if (score >= 80) return { status: 'Bom', color: 'bg-blue-500', icon: Shield }
    if (score >= 60) return { status: 'Atenção', color: 'bg-amber-500', icon: AlertTriangle }
    return { status: 'Crítico', color: 'bg-red-500', icon: AlertTriangle }
  }

  const compliance = getComplianceStatus(complianceScore)
  const ComplianceIcon = compliance.icon

  return (
    <div className="space-y-6">
      {/* Status de Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status de Compliance LGPD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ComplianceIcon className="h-5 w-5 text-green-500" />
              <span className="font-medium">Score: {complianceScore}%</span>
            </div>
            <Badge className={compliance.color}>
              {compliance.status}
            </Badge>
          </div>
          <Progress value={complianceScore} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Seu nível de conformidade com a Lei Geral de Proteção de Dados
          </p>
        </CardContent>
      </Card>

      {/* Gerenciamento de Consentimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Consentimentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {consentCategories.map((category) => (
            <div key={category.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{category.title}</h4>
                  {category.required && (
                    <Badge variant="secondary" className="text-xs">
                      Obrigatório
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
              <Switch
                checked={consents[category.id] || category.required}
                onCheckedChange={(checked) => onUpdateConsent(category.id, checked)}
                disabled={category.required}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Direitos do Titular */}
      <Card>
        <CardHeader>
          <CardTitle>Seus Direitos como Titular dos Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exportar Dados */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Exportar Meus Dados</h4>
                <p className="text-sm text-muted-foreground">
                  Baixe todos os seus dados em formato JSON
                </p>
                {lastDataExport && (
                  <p className="text-xs text-muted-foreground">
                    Último export: {lastDataExport.toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            <Button onClick={onExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Visualizar Logs */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-medium">Logs de Acesso</h4>
                <p className="text-sm text-muted-foreground">
                  Visualize quem acessou seus dados e quando
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowActivityLogs(!showActivityLogs)} 
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showActivityLogs ? 'Ocultar' : 'Visualizar'}
            </Button>
          </div>

          {/* Excluir Conta */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
            <div className="flex items-center gap-3">
              <UserX className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-medium text-red-700">Excluir Minha Conta</h4>
                <p className="text-sm text-red-600">
                  Remove permanentemente todos os seus dados
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setConfirmDelete(true)} 
              variant="destructive"
              disabled={confirmDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>

          {confirmDelete && (
            <Alert className="border-red-200 bg-red-50/50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                <div className="space-y-2">
                  <p className="font-medium">Tem certeza que deseja excluir sua conta?</p>
                  <p className="text-sm">Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.</p>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={onDeleteAccount}
                    >
                      Sim, excluir permanentemente
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Retenção de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Política de Retenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              Seus dados são mantidos por <strong>{dataRetentionDays} dias</strong> após a inatividade.
            </p>
            <p className="text-xs text-muted-foreground">
              Dados anonimizados podem ser mantidos para fins de pesquisa conforme sua autorização.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logs de Atividade */}
      {showActivityLogs && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Logs de Acesso aos Seus Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex-1">
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground"> em {log.resource}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>{log.timestamp.toLocaleString('pt-BR')}</div>
                    <div>IP: {log.ip_address}</div>
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum log de acesso encontrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 