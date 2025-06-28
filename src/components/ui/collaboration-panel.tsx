'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Input }n from './input'
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
import { 
  useCommentsQuery, 
  useAddCommentMutation, 
  useVersionsQuery, 
  useRestoreVersionMutation, 
  useActiveUsersSubscription, 
  Comment, 
  Version 
} from '@/hooks/use-collaboration-data'

interface CollaborationPanelProps {
  documentId: string
  documentTitle: string
}

export function CollaborationPanel({ documentId, documentTitle }: CollaborationPanelProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'comments' | 'versions' | 'users'>('comments')
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  // React Query Hooks
  const { data: comments, isLoading: isLoadingComments, error: commentsError } = useCommentsQuery(documentId)
  const { data: versions, isLoading: isLoadingVersions, error: versionsError } = useVersionsQuery(documentId)
  const { data: activeUsers, isLoading: isLoadingActiveUsers } = useActiveUsersSubscription(documentId)

  const addCommentMutation = useAddCommentMutation()
  const restoreVersionMutation = useRestoreVersionMutation()

  const isLoading = isLoadingComments || isLoadingVersions || isLoadingActiveUsers;
  const error = commentsError || versionsError; // Combine errors for display

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    addCommentMutation.mutate({
      document_id: documentId,
      content: newComment,
      // user_id, user_name, created_at will be handled by the mutation hook
    }, {
      onSuccess: () => {
        setNewComment('')
      }
    })
  }

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return

    addCommentMutation.mutate({
      document_id: documentId,
      content: replyContent,
      parent_id: parentId, // Assuming your comment table supports parent_id for replies
    }, {
      onSuccess: () => {
        setReplyContent('')
        setReplyingTo(null)
      }
    })
  }

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Tem certeza que deseja restaurar esta versão? As alterações atuais serão perdidas.')) {
      return
    }

    restoreVersionMutation.mutate({ versionId, documentId })
  }

  // Placeholder for togglePin - needs backend implementation
  const togglePin = (commentId: string) => {
    toast.info('Funcionalidade de fixar comentário ainda não implementada no backend.')
    // You would typically have a mutation here to update the comment's is_pinned status in the database
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
        {isLoading ? (
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
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    size="sm"
                    className="w-full"
                  >
                    {addCommentMutation.isPending ? 'Adicionando...' : 'Comentar'}
                  </Button>
                </div>

                {/* Lista de Comentários */}
                <div className="space-y-4">
                  {(comments || []).map((comment) => (
                    <div key={comment.id} className="space-y-3">
                      <div className={`p-3 rounded-lg border ${comment.is_pinned ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20' : 'border-border'}`}>
                        <div className="flex items-center justify-between mb-2">
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
                                onClick={() => handleAddReply(comment.id)}
                                disabled={!replyContent.trim() || addCommentMutation.isPending}
                                size="sm"
                              >
                                {addCommentMutation.isPending ? 'Adicionando...' : 'Responder'}
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
                {(versions || []).map((version) => (
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
                          onClick={() => handleRestoreVersion(version.id)}
                          className="text-xs"
                          disabled={restoreVersionMutation.isPending}
                        >
                          {restoreVersionMutation.isPending ? 'Restaurando...' : 'Restaurar'}
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
                {(activeUsers || []).map((user) => (
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