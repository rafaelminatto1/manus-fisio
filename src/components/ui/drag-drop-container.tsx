'use client'

import React, { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
  SortableContext as SortableContextType,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import {
  GripVertical,
  Plus,
  X,
  Check,
  AlertCircle,
  Move,
  Copy,
  Trash2,
  Edit3,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface DraggableItem {
  id: string
  title: string
  description?: string
  type?: string
  status?: 'active' | 'completed' | 'pending' | 'draft'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  tags?: string[]
  metadata?: Record<string, any>
}

interface DragDropContainerProps {
  items: DraggableItem[]
  onReorder: (items: DraggableItem[]) => void
  onItemEdit?: (item: DraggableItem) => void
  onItemDelete?: (itemId: string) => void
  onItemDuplicate?: (item: DraggableItem) => void
  onAddItem?: () => void
  layout?: 'vertical' | 'horizontal' | 'grid'
  className?: string
  itemClassName?: string
  showActions?: boolean
  allowAdd?: boolean
  allowDelete?: boolean
  allowEdit?: boolean
  allowDuplicate?: boolean
  emptyState?: React.ReactNode
  dragOverlay?: (item: DraggableItem) => React.ReactNode
}

// Componente de item arrastável
function DraggableItem({
  item,
  onEdit,
  onDelete,
  onDuplicate,
  showActions = true,
  className,
}: {
  item: DraggableItem
  onEdit?: (item: DraggableItem) => void
  onDelete?: (itemId: string) => void
  onDuplicate?: (item: DraggableItem) => void
  showActions?: boolean
  className?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'active': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'draft': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className={cn(
        'group relative',
        isDragging && 'opacity-50 z-50',
        className
      )}
    >
      <Card className={cn(
        'p-4 cursor-pointer transition-all duration-200',
        'hover:shadow-lg hover:border-primary/20',
        'border-2 border-transparent',
        isDragging && 'border-primary/50 shadow-xl'
      )}>
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className={cn(
              'mt-1 p-1 rounded opacity-0 group-hover:opacity-100',
              'transition-opacity duration-200 hover:bg-muted',
              'cursor-grab active:cursor-grabbing',
              'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Status & Priority */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.priority && (
                  <div className="flex items-center gap-1">
                    <div className={cn('w-2 h-2 rounded-full', getPriorityColor(item.priority))} />
                    <span className="text-xs text-muted-foreground capitalize">
                      {item.priority}
                    </span>
                  </div>
                )}
                {item.status && (
                  <Badge variant="outline" className={cn('text-xs', getStatusColor(item.status))}>
                    {item.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(item)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
              {onDuplicate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate(item)
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id)
                  }}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// Componente principal
export function DragDropContainer({
  items,
  onReorder,
  onItemEdit,
  onItemDelete,
  onItemDuplicate,
  onAddItem,
  layout = 'vertical',
  className,
  itemClassName,
  showActions = true,
  allowAdd = true,
  allowDelete = true,
  allowEdit = true,
  allowDuplicate = true,
  emptyState,
  dragOverlay,
}: DragDropContainerProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    const item = items.find(item => item.id === event.active.id)
    setDraggedItem(item || null)
  }, [items])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over?.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex)
        onReorder(newItems)
      }
    }

    setActiveId(null)
    setDraggedItem(null)
  }, [items, onReorder])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setDraggedItem(null)
  }, [])

  const sortingStrategy = layout === 'horizontal' 
    ? horizontalListSortingStrategy 
    : verticalListSortingStrategy

  const containerClasses = cn(
    'space-y-3',
    layout === 'horizontal' && 'flex space-x-3 space-y-0',
    layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 space-y-0',
    className
  )

  // Estado vazio
  if (items.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        {emptyState || (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Move className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Nenhum item encontrado</h3>
              <p className="text-muted-foreground">
                Comece adicionando um novo item à lista.
              </p>
            </div>
            {allowAdd && onAddItem && (
              <Button onClick={onAddItem} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com botão de adicionar */}
      {allowAdd && onAddItem && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'itens'}
          </p>
          <Button onClick={onAddItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      )}

      {/* Container de drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={items.map(item => item.id)} strategy={sortingStrategy}>
          <AnimatePresence mode="popLayout">
            <div className={containerClasses}>
              {items.map((item) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  onEdit={allowEdit ? onItemEdit : undefined}
                  onDelete={allowDelete ? onItemDelete : undefined}
                  onDuplicate={allowDuplicate ? onItemDuplicate : undefined}
                  showActions={showActions}
                  className={itemClassName}
                />
              ))}
            </div>
          </AnimatePresence>
        </SortableContext>

        {/* Overlay durante o drag */}
        <DragOverlay>
          {activeId && draggedItem ? (
            dragOverlay ? (
              dragOverlay(draggedItem)
            ) : (
              <div className="rotate-3 opacity-90">
                <DraggableItem
                  item={draggedItem}
                  showActions={false}
                  className="shadow-2xl"
                />
              </div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
} 