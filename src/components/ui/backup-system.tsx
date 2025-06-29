'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Progress } from './progress'
import { Badge } from './badge'
import { 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Database,
  HardDrive,
  Calendar
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface BackupInfo {
  id: string
  name: string
  size: number
  created_at: string
  type: 'automatic' | 'manual'
  status: 'completed' | 'in_progress' | 'failed'
  tables_count: number
}

interface BackupProgress {
  total: number
  completed: number
  current_table: string
  status: string
}

export function BackupSystem() {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [backupProgress, setBackupProgress] = useState<BackupProgress | null>(null)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)
  const [nextAutoBackup, setNextAutoBackup] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBackups()
    calculateNextAutoBackup()
  }, [])

  const loadBackups = async () => {
    try {
      setLoading(true)
      
      // Simular carregamento de backups do Supabase Storage
      const mockBackups: BackupInfo[] = [
        {
          id: '1',
          name: 'backup_2024_01_15_10_30',
          size: 2.5 * 1024 * 1024, // 2.5MB
          created_at: '2024-01-15T10:30:00Z',
          type: 'automatic',
          status: 'completed',
          tables_count: 8
        },
        {
          id: '2',
          name: 'backup_manual_2024_01_14_16_45',
          size: 2.3 * 1024 * 1024, // 2.3MB
          created_at: '2024-01-14T16:45:00Z',
          type: 'manual',
          status: 'completed',
          tables_count: 8
        },
        {
          id: '3',
          name: 'backup_2024_01_13_10_30',
          size: 2.1 * 1024 * 1024, // 2.1MB
          created_at: '2024-01-13T10:30:00Z',
          type: 'automatic',
          status: 'completed',
          tables_count: 7
        }
      ]

      setBackups(mockBackups)
    } catch (error) {
      console.error('Erro ao carregar backups:', error)
      toast.error('Erro ao carregar lista de backups')
    } finally {
      setLoading(false)
    }
  }

  const calculateNextAutoBackup = () => {
    const now = new Date()
    const next = new Date(now)
    next.setDate(next.getDate() + 1)
    next.setHours(10, 30, 0, 0) // Próximo backup às 10:30
    setNextAutoBackup(next)
  }

  const createBackup = async (type: 'manual' | 'automatic' = 'manual') => {
    try {
      setIsCreatingBackup(true)
      setBackupProgress({
        total: 8,
        completed: 0,
        current_table: 'usuarios',
        status: 'Iniciando backup...'
      })

      // Simular processo de backup
      const tables = ['usuarios', 'pacientes', 'consultas', 'exercicios', 'evolucoes', 'pagamentos', 'configuracoes', 'notificacoes']
      
      for (let i = 0; i < tables.length; i++) {
        setBackupProgress({
          total: tables.length,
          completed: i,
          current_table: tables[i] ?? '',
          status: `Fazendo backup da tabela: ${tables[i] ?? ''}`
        })
        
        // Simular tempo de processamento
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Criar novo backup
      const newBackup: BackupInfo = {
        id: Date.now().toString(),
        name: `backup_${type}_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_')}`,
        size: Math.random() * 3 * 1024 * 1024, // Tamanho aleatório até 3MB
        created_at: new Date().toISOString(),
        type,
        status: 'completed',
        tables_count: tables.length
      }

      setBackups(prev => [newBackup, ...prev])
      
      setBackupProgress({
        total: tables.length,
        completed: tables.length,
        current_table: '',
        status: 'Backup concluído com sucesso!'
      })

      toast.success('Backup criado com sucesso!')
      
      setTimeout(() => {
        setBackupProgress(null)
      }, 2000)

    } catch (error) {
      console.error('Erro ao criar backup:', error)
      toast.error('Erro ao criar backup')
      setBackupProgress(null)
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const restoreBackup = async (backupId: string) => {
    if (!confirm('Tem certeza que deseja restaurar este backup? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      setIsRestoring(true)
      
      // Simular processo de restauração
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success('Backup restaurado com sucesso!')
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
      toast.error('Erro ao restaurar backup')
    } finally {
      setIsRestoring(false)
    }
  }

  const downloadBackup = async (backupId: string, backupName: string) => {
    try {
      // Simular download do backup
      const blob = new Blob(['Dados do backup simulados'], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${backupName}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Download do backup iniciado!')
    } catch (error) {
      console.error('Erro ao baixar backup:', error)
      toast.error('Erro ao baixar backup')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sistema de Backup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles de Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sistema de Backup
          </CardTitle>
          <CardDescription>
            Gerencie backups automáticos e manuais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status do Backup Automático */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Backup Automático</p>
                <p className="text-sm text-muted-foreground">
                  {autoBackupEnabled ? 'Ativado' : 'Desativado'} • 
                  Próximo: {nextAutoBackup?.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <Badge variant={autoBackupEnabled ? 'default' : 'secondary'}>
              {autoBackupEnabled ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          {/* Progresso do Backup */}
          {backupProgress && (
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm font-medium">{backupProgress.status}</span>
              </div>
              <Progress 
                value={(backupProgress.completed / backupProgress.total) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {backupProgress.completed} de {backupProgress.total} tabelas processadas
                {backupProgress.current_table && ` • Atual: ${backupProgress.current_table}`}
              </p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button 
              onClick={() => createBackup('manual')}
              disabled={isCreatingBackup || isRestoring}
              className="flex items-center gap-2"
            >
              <HardDrive className="h-4 w-4" />
              Criar Backup Manual
            </Button>
            <Button 
              variant="outline"
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {autoBackupEnabled ? 'Desativar' : 'Ativar'} Auto Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>
            {backups.length} backup{backups.length !== 1 ? 's' : ''} disponível{backups.length !== 1 ? 'is' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.map((backup) => (
              <div 
                key={backup.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    backup.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' :
                    backup.status === 'in_progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' :
                    'bg-red-100 text-red-600 dark:bg-red-900/20'
                  }`}>
                    {backup.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                     backup.status === 'in_progress' ? <Clock className="h-4 w-4" /> :
                     <AlertCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{backup.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatDate(backup.created_at)}</span>
                      <span>{formatFileSize(backup.size)}</span>
                      <span>{backup.tables_count} tabelas</span>
                      <Badge variant={backup.type === 'automatic' ? 'secondary' : 'outline'}>
                        {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadBackup(backup.id, backup.name)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => restoreBackup(backup.id)}
                    disabled={isRestoring}
                    className="flex items-center gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    Restaurar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 