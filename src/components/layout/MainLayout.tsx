import { AIAssistant, AIAssistantToggle } from '@/components/AIAssistant'
import { useState, ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... existing sidebar and content ... */}
      
      {/* AI Assistant Integration */}
      <AIAssistantToggle
        isOpen={isAIAssistantOpen}
        onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
        hasNewInsights={false} // TODO: Implementar lógica de novos insights
      />
      
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
      
      {/* ... rest of existing code ... */}
    </div>
  )
} 