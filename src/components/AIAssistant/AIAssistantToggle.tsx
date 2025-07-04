'use client'

import React from 'react'
import { MessageCircle, Brain, Sparkles } from 'lucide-react'

interface AIAssistantToggleProps {
  isOpen: boolean
  onClick: () => void
  hasNewInsights?: boolean
  className?: string
}

export default function AIAssistantToggle({ 
  isOpen, 
  onClick, 
  hasNewInsights = false,
  className = ''
}: AIAssistantToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-4 right-4 z-40
        bg-gradient-to-r from-blue-600 to-purple-600 
        text-white rounded-full p-4 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 
        hover:scale-110 
        focus:outline-none focus:ring-4 focus:ring-blue-300
        ${isOpen ? 'scale-95 opacity-75' : ''}
        ${className}
      `}
      aria-label={isOpen ? 'Fechar Assistente IA' : 'Abrir Assistente IA'}
    >
      <div className="relative">
        {isOpen ? (
          <Brain className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
        
        {/* Indicador de novos insights */}
        {hasNewInsights && !isOpen && (
          <>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
              !
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300 animate-pulse" />
          </>
        )}
        
        {/* Animação de pulso quando tem insights */}
        {hasNewInsights && !isOpen && (
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {isOpen ? 'Fechar Assistente' : 'Assistente IA'}
        <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </button>
  )
} 