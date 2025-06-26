import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, Users, Eye, Edit, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Comment {
  id: string
  content: string
  author_id: string
  author_name: string
  author_avatar?: string
  target_type: 'page' | 'task' | 'project'
  target_id: string
  parent_comment_id?: string
  mentions: string[]
  created_at: Date
  replies?: Comment[]
}

interface CollaborationPanelProps {
  targetType: 'page' | 'task' | 'project'
  targetId: string
  comments: Comment[]
  onAddComment: (content: string, parentId?: string) => void
  onMention: (userId: string) => void
  activeUsers: Array<{
    id: string
    name: string
    avatar?: string
    status: 'online' | 'editing' | 'viewing'
    cursor_position?: number
  }>
}

export function CollaborationPanel({
  targetType,
  targetId,
  comments,
  onAddComment,
  onMention,
  activeUsers
}: CollaborationPanelProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment)
      setNewComment('')
    }
  }

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      onAddComment(replyContent, parentId)
      setReplyContent('')
      setReplyingTo(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'editing':
        return <Edit className="h-3 w-3 text-blue-500" />
      case 'viewing':
        return <Eye className="h-3 w-3 text-green-500" />
      default:
        return <div className="h-2 w-2 bg-green-500 rounded-full" />
    }
  }

  const renderComments = (comments: Comment[], depth = 0) => {
    return comments.map((comment) => (
      <div key={comment.id} className={`space-y-2 ${depth > 0 ? 'ml-6 border-l border-border pl-4' : ''}`}>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
          <Avatar className="h-8 w-8">
            <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
              {comment.author_name.charAt(0).toUpperCase()}
            </div>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.author_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.created_at, { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="h-6 px-2 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Responder
              </Button>
              {comment.mentions.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {comment.mentions.length} menção(ões)
                </Badge>
              )}
            </div>
          </div>
        </div>

        {replyingTo === comment.id && (
          <div className="ml-11 space-y-2">
            <Textarea
              placeholder="Escreva sua resposta..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                <Send className="h-3 w-3 mr-1" />
                Responder
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setReplyingTo(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-2">
            {renderComments(comment.replies, depth + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="space-y-4">
      {/* Usuários Ativos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Colaboradores Ativos ({activeUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Avatar className="h-6 w-6">
                  <div className="h-6 w-6 bg-primary/20 rounded-full flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </Avatar>
                <span className="text-xs font-medium">{user.name}</span>
                {getStatusIcon(user.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comentários */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Comentários ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Novo Comentário */}
          <div className="space-y-2">
            <Textarea
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                Use @ para mencionar colaboradores
              </div>
              <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
                <Send className="h-3 w-3 mr-1" />
                Comentar
              </Button>
            </div>
          </div>

          {/* Lista de Comentários */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              renderComments(comments.filter(c => !c.parent_comment_id))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum comentário ainda</p>
                <p className="text-xs">Seja o primeiro a comentar!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
              <span>Dr. Silva editou o documento há 5 min</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span>Ana comentou há 10 min</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 bg-amber-500 rounded-full" />
              <span>Carlos visualizou há 15 min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 