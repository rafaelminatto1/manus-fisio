'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Input } from './input'
import { Textarea } from './textarea'
import { Avatar } from './avatar'
import { Badge } from './badge'
import { 
  MessageSquare, 
  History, 
  Users, 
  Eye,
  Edit,
  Clock,
  Reply,
  MoreHorizontal,
  Pin,
  Trash2,
  User,
  Calendar
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

interface Comment {
  id: string
  user_id: string
  user_name: string
  user_avatar?: string
  content: string
  created_at: string
  updated_at?: string
  replies?: Comment[]
  is_pinned?: boolean
  document_id: string
  selection_text?: string
}

interface Version {
  id: string
  user_id: string
  user_name: string
  created_at: string
  changes_summary: string
  content_preview: string
  is_current: boolean
}

interface CollaborationPanelProps {
  documentId: string
  documentTitle: string
}

export function CollaborationPanel({ documentId, documentTitle }: CollaborationPanelProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'comments' | 'versions' | 'users'>('comments')
  const [comments, setComments] = useState<Comment[]>([])
  const [versions, setVersions] = useState<Version[]>([])
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCollaborationData()
    simulateActiveUsers()
  }, [documentId])

  const loadCollaborationData = async () => {
    try {
      setLoading(true)
      
      // Simular dados de colaboração
      const mockComments: Comment[] = [
        {
          id: '1',
          user_id: 'user1',
          user_name: 'Dr. Maria Silva',
          content: 'Excelente evolução do paciente! Sugiro aumentar a frequência dos exercícios de fortalecimento.',
          created_at: '2024-01-15T14:30:00Z',
          document_id: documentId,
          selection_text: 'exercícios de fortalecimento do quadríceps',
          is_pinned: true,
          replies: [
            {
              id: '1-1',
              user_id: 'user2',
              user_name: 'Fisio João Santos',
              content: 'Concordo! Vou ajustar o programa na próxima sessão.',
              created_at: '2024-01-15T15:00:00Z',
              document_id: documentId
            }
          ]
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Fisio João Santos',
          content: 'Paciente relatou diminuição da dor. Ótimo progresso!',
          created_at: '2024-01-15T16:20:00Z',
          document_id: documentId
        }
      ]

      const mockVersions: Version[] = [
        {
          id: 'v3',
          user_id: 'user1',
          user_name: 'Dr. Maria Silva',
          created_at: '2024-01-15T16:30:00Z',
          changes_summary: 'Adicionou novos exercícios e ajustou intensidade',
          content_preview: 'Programa atualizado com exercícios de propriocepção...',
          is_current: true
        },
        {
          id: 'v2',
          user_id: 'user2',
          user_name: 'Fisio João Santos',
          created_at: '2024-01-15T14:15:00Z',
          changes_summary: 'Corrigiu dados de avaliação inicial',
          content_preview: 'Avaliação postural corrigida, amplitude de movimento...',
          is_current: false
        },
        {
          id: 'v1',
          user_id: 'user1',
          user_name: 'Dr. Maria Silva',
          created_at: '2024-01-15T10:00:00Z',
          changes_summary: 'Versão inicial do documento',
          content_preview: 'Primeira avaliação do paciente João Silva...',
          is_current: false
        }
      ]

      setComments(mockComments)
      setVersions(mockVersions)
    } catch (error) {
      console.error('Erro ao carregar dados de colaboração:', error)
      toast.error('Erro ao carregar dados de colaboração')
    } finally {
      setLoading(false)
    }
  }

  const simulateActiveUsers = () => {
    const mockUsers = [
      { id: 'user1', name: 'Dr. Maria Silva', status: 'editing', last_seen: new Date() },
      { id: 'user2', name: 'Fisio João Santos', status: 'viewing', last_seen: new Date(Date.now() - 5 * 60 * 1000) },
      { id: 'user3', name: 'Recep. Ana Costa', status: 'idle', last_seen: new Date(Date.now() - 15 * 60 * 1000) }
    ]
    setActiveUsers(mockUsers)
  }

  const addComment = async () => {
    if (!newComment.trim() || !user) return

    const comment: Comment = {
      id: Date.now().toString(),
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email || 'Usuário',
      content: newComment,
      created_at: new Date().toISOString(),
      document_id: documentId
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')
    toast.success('Comentário adicionado!')
  }

  const addReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email || 'Usuário',
      content: replyContent,
      created_at: new Date().toISOString(),
      document_id: documentId
    }

    setComments(prev => prev.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        }
      }
      return comment
    }))

    setReplyContent('')
    setReplyingTo(null)
    toast.success('Resposta adicionada!')
  }

  const togglePin = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, is_pinned: !comment.is_pinned }
        : comment
    ))
  }

  const restoreVersion = async (versionId: string) => {
    if (!confirm('Tem certeza que deseja restaurar esta versão? As alterações atuais serão perdidas.')) {
      return
    }

    // Simular restauração de versão
    setVersions(prev => prev.map(version => ({
      ...version,
      is_current: version.id === versionId
    })))

    toast.success('Versão restaurada com sucesso!')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`
    return date.toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'editing': return 'bg-green-500'
      case 'viewing': return 'bg-blue-500'
      case 'idle': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'editing': return 'Editando'
      case 'viewing': return 'Visualizando'
      case 'idle': return 'Inativo'
      default: return 'Desconhecido'
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Colaboração</CardTitle>
        <CardDescription className="truncate">
          {documentTitle}
        </CardDescription>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'comments' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Comentários
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'versions' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
          >
            <History className="h-4 w-4" />
            Versões
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users' 
                ? 'bg-background shadow-sm' 
                : 'hover:bg-background/50'
            }`}
          >
            <Users className="h-4 w-4" />
            Usuários
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Tab: Comentários */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {/* Novo Comentário */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Adicione um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <Button 
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="w-full"
                  >
                    Comentar
                  </Button>
                </div>

                {/* Lista de Comentários */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      <div className={`p-3 rounded-lg border ${comment.is_pinned ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20' : 'border-border'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <div className="bg-primary text-primary-foreground text-xs flex items-center justify-center h-full w-full">
                                {comment.user_name.charAt(0).toUpperCase()}
                              </div>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.user_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                            {comment.is_pinned && (
                              <Pin className="h-3 w-3 text-yellow-600" />
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePin(comment.id)}
                            className="h-6 w-6 p-0"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {comment.selection_text && (
                          <div className="mb-2 p-2 bg-muted rounded text-xs italic">
                            "{comment.selection_text}"
                          </div>
                        )}
                        
                        <p className="text-sm">{comment.content}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(comment.id)}
                            className="h-6 text-xs"
                          >
                            <Reply className="h-3 w-3 mr-1" />
                            Responder
                          </Button>
                        </div>

                        {/* Respostas */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-muted space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="p-2 bg-muted/50 rounded">
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-5 w-5">
                                    <div className="bg-secondary text-secondary-foreground text-xs flex items-center justify-center h-full w-full">
                                      {reply.user_name.charAt(0).toUpperCase()}
                                    </div>
                                  </Avatar>
                                  <span className="text-xs font-medium">{reply.user_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(reply.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Campo de Resposta */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 space-y-2">
                            <Textarea
                              placeholder="Escreva sua resposta..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="min-h-[60px] resize-none text-sm"
                            />
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => addReply(comment.id)}
                                disabled={!replyContent.trim()}
                                size="sm"
                              >
                                Responder
                              </Button>
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  setReplyingTo(null)
                                  setReplyContent('')
                                }}
                                size="sm"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Versões */}
            {activeTab === 'versions' && (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div 
                    key={version.id}
                    className={`p-3 rounded-lg border ${version.is_current ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <div className="bg-primary text-primary-foreground text-xs flex items-center justify-center h-full w-full">
                            {version.user_name.charAt(0).toUpperCase()}
                          </div>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{version.user_name}</span>
                            {version.is_current && (
                              <Badge variant="default" className="text-xs">
                                Atual
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(version.created_at)}
                          </span>
                        </div>
                      </div>
                      {!version.is_current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreVersion(version.id)}
                          className="text-xs"
                        >
                          Restaurar
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-sm font-medium mb-1">{version.changes_summary}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {version.content_preview}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Usuários */}
            {activeTab === 'users' && (
              <div className="space-y-3">
                {activeUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <div className="bg-primary text-primary-foreground text-sm flex items-center justify-center h-full w-full">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </Avatar>
                      <div 
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getStatusText(user.status)} • {formatDate(user.last_seen.toISOString())}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 