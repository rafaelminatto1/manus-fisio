'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Save } from 'lucide-react'

interface RichEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
}

const RichEditor = ({
  content = '',
  onChange,
  placeholder = 'Comece a escrever seu protocolo...',
  className = ''
}: RichEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
  })

  if (!editor) {
    return <div className="p-4">Carregando editor...</div>
  }

  return (
    <div className={`border border-border rounded-lg bg-background ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-border p-3 flex flex-wrap gap-1">
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-96 focus:outline-none"
      />

      {/* Footer */}
      <div className="border-t border-border p-2 flex justify-between items-center text-sm text-muted-foreground">
        <div>
          {editor.storage.characterCount.characters()}/10000 caracteres
        </div>
        <Button size="sm">
          <Save className="h-4 w-4 mr-1" />
          Salvar
        </Button>
      </div>
    </div>
  )
}

export default RichEditor
