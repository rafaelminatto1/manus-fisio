'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Save, Sparkles, BrainCircuit, TextSelect } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface RichEditorProps {
  content?: string
  onChange?: (content: string) => void
  onSave?: (content: any) => Promise<boolean>
  placeholder?: string
  className?: string
}

const RichEditor = ({
  content = '',
  onChange,
  onSave,
  placeholder = 'Comece a escrever seu protocolo...',
  className = ''
}: RichEditorProps) => {
  const [isAiLoading, setIsAiLoading] = useState(false)
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

  const handleSave = async () => {
    if (onSave && editor) {
        const success = await onSave(editor.getJSON());
        if (success) {
            editor.commands.clearContent();
        }
    }
  }

  const handleAiAction = async (action: 'improve' | 'suggest_goals' | 'summarize') => {
    if (!editor || isAiLoading) return;

    const text = editor.getText();
    if (text.trim().length < 20) {
      toast.error('O texto é muito curto para uma ação de IA.');
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await fetch('/api/ai/writing-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, action }),
      });

      if (!response.ok) {
        throw new Error('Falha ao se comunicar com o assistente de IA.');
      }

      const { result } = await response.json();
      
      // Append or replace content based on action
      const currentContent = editor.getHTML();
      const newContent = `${currentContent}<br><p><strong>Assistente de IA (${action}):</strong></p><p>${result.replace(/\n/g, '<br>')}</p>`;
      editor.commands.setContent(newContent);

      toast.success('Sugestão da IA aplicada com sucesso!');
    } catch (error) {
      console.error('AI Action Error:', error);
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsAiLoading(false);
    }
  };

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
        <div className="flex items-center gap-1 pl-2 border-l ml-2">
           <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiAction('improve')}
            disabled={isAiLoading}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Melhorar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiAction('suggest_goals')}
            disabled={isAiLoading}
          >
            <BrainCircuit className="h-4 w-4 mr-1" />
            Sugerir Metas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiAction('summarize')}
            disabled={isAiLoading}
          >
            <TextSelect className="h-4 w-4 mr-1" />
            Resumir
          </Button>
        </div>
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
        <Button size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-1" />
          Salvar
        </Button>
      </div>
    </div>
  )
}

export default RichEditor
