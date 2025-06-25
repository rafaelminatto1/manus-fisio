import { Heart } from 'lucide-react'

export function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <Heart className="h-12 w-12 text-medical-500 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-white">Manus Fisio</h2>
        <p className="text-slate-400">Carregando sistema...</p>
        <div className="w-8 h-1 bg-medical-500 rounded-full mx-auto animate-pulse"></div>
      </div>
    </div>
  )
} 