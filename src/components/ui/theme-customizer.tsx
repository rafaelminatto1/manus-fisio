import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Eye, 
  Zap, 
  Heart,
  Sparkles,
  Settings,
  X,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react'

interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
  accentColor: string
  borderRadius: number
  fontSize: number
  spacing: number
  animations: boolean
  reducedMotion: boolean
  highContrast: boolean
  customCss: string
}

interface ThemeCustomizerProps {
  isOpen: boolean
  onClose: () => void
}

export function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const [config, setConfig] = useState<ThemeConfig>({
    mode: 'dark',
    primaryColor: '#0ea5e9', // Medical blue
    accentColor: '#10b981', // Medical green
    borderRadius: 8,
    fontSize: 14,
    spacing: 16,
    animations: true,
    reducedMotion: false,
    highContrast: false,
    customCss: ''
  })

  const [previewMode, setPreviewMode] = useState(false)

  // Predefined color schemes
  const colorSchemes = [
    { name: 'Médico Clássico', primary: '#0ea5e9', accent: '#10b981', description: 'Azul médico com verde saúde' },
    { name: 'Fisio Moderno', primary: '#8b5cf6', accent: '#f59e0b', description: 'Roxo vibrante com laranja energia' },
    { name: 'Clínica Serena', primary: '#06b6d4', accent: '#84cc16', description: 'Cyan calmo com verde lima' },
    { name: 'Reabilitação', primary: '#ec4899', accent: '#14b8a6', description: 'Rosa motivador com teal' },
    { name: 'Neurológico', primary: '#6366f1', accent: '#f97316', description: 'Índigo neuronal com laranja' },
    { name: 'Ortopédico', primary: '#059669', accent: '#dc2626', description: 'Verde ósseo com vermelho músculo' }
  ]

  // Apply theme changes
  useEffect(() => {
    if (previewMode) {
      const root = document.documentElement
      
      // Apply CSS custom properties
      root.style.setProperty('--primary-hue', getHue(config.primaryColor))
      root.style.setProperty('--accent-hue', getHue(config.accentColor))
      root.style.setProperty('--border-radius', `${config.borderRadius}px`)
      root.style.setProperty('--font-size-base', `${config.fontSize}px`)
      root.style.setProperty('--spacing-base', `${config.spacing}px`)
      
      // Apply theme mode
      root.classList.remove('light', 'dark')
      if (config.mode === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.add(isDark ? 'dark' : 'light')
      } else {
        root.classList.add(config.mode)
      }

      // Apply accessibility settings
      if (config.reducedMotion) {
        root.style.setProperty('--animation-duration', '0s')
      } else {
        root.style.setProperty('--animation-duration', config.animations ? '0.3s' : '0s')
      }

      if (config.highContrast) {
        root.classList.add('high-contrast')
      } else {
        root.classList.remove('high-contrast')
      }
    }
  }, [config, previewMode])

  const getHue = (hexColor: string): string => {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    
    let hue = 0
    if (diff !== 0) {
      if (max === r) hue = ((g - b) / diff) % 6
      else if (max === g) hue = (b - r) / diff + 2
      else hue = (r - g) / diff + 4
    }
    
    return Math.round(hue * 60).toString()
  }

  const applyColorScheme = (scheme: typeof colorSchemes[0]) => {
    setConfig(prev => ({
      ...prev,
      primaryColor: scheme.primary,
      accentColor: scheme.accent
    }))
  }

  const resetToDefault = () => {
    setConfig({
      mode: 'dark',
      primaryColor: '#0ea5e9',
      accentColor: '#10b981',
      borderRadius: 8,
      fontSize: 14,
      spacing: 16,
      animations: true,
      reducedMotion: false,
      highContrast: false,
      customCss: ''
    })
  }

  const exportTheme = () => {
    const themeData = JSON.stringify(config, null, 2)
    const blob = new Blob([themeData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'manus-fisio-theme.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string)
          setConfig(imported)
        } catch (error) {
          alert('Erro ao importar tema. Verifique o formato do arquivo.')
        }
      }
      reader.readAsText(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card 
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Personalização de Tema
                <Badge variant={previewMode ? "default" : "secondary"}>
                  {previewMode ? "Preview Ativo" : "Preview Desativado"}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? "Desativar" : "Ativar"} Preview
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-8">
              {/* Color Schemes */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Esquemas de Cores Predefinidos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {colorSchemes.map((scheme) => (
                    <Card 
                      key={scheme.name}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => applyColorScheme(scheme)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex gap-1">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: scheme.primary }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: scheme.accent }}
                            />
                          </div>
                          <span className="font-medium text-sm">{scheme.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{scheme.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Theme Mode */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Modo do Tema</h3>
                <div className="flex gap-4">
                  {[
                    { mode: 'light', icon: Sun, label: 'Claro' },
                    { mode: 'dark', icon: Moon, label: 'Escuro' },
                    { mode: 'auto', icon: Monitor, label: 'Automático' }
                  ].map(({ mode, icon: Icon, label }) => (
                    <Button
                      key={mode}
                      variant={config.mode === mode ? "default" : "outline"}
                      onClick={() => setConfig(prev => ({ ...prev, mode: mode as any }))}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Cores Personalizadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cor Primária</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-12 rounded-lg border cursor-pointer"
                      />
                      <span className="text-sm font-mono">{config.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cor de Destaque</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-12 h-12 rounded-lg border cursor-pointer"
                      />
                      <span className="text-sm font-mono">{config.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography & Spacing */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tipografia e Espaçamento</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tamanho da Fonte: {config.fontSize}px
                    </label>
                    <Slider
                      value={[config.fontSize]}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, fontSize: value[0] }))}
                      min={12}
                      max={18}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Raio das Bordas: {config.borderRadius}px
                    </label>
                    <Slider
                      value={[config.borderRadius]}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, borderRadius: value[0] }))}
                      min={0}
                      max={16}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Espaçamento Base: {config.spacing}px
                    </label>
                    <Slider
                      value={[config.spacing]}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, spacing: value[0] }))}
                      min={8}
                      max={24}
                      step={2}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Accessibility */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Acessibilidade</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Animações</label>
                      <p className="text-xs text-muted-foreground">Ativar transições e animações</p>
                    </div>
                    <Switch
                      checked={config.animations}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, animations: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Movimento Reduzido</label>
                      <p className="text-xs text-muted-foreground">Para sensibilidade ao movimento</p>
                    </div>
                    <Switch
                      checked={config.reducedMotion}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, reducedMotion: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Alto Contraste</label>
                      <p className="text-xs text-muted-foreground">Aumentar contraste para melhor legibilidade</p>
                    </div>
                    <Switch
                      checked={config.highContrast}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, highContrast: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button onClick={resetToDefault} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar Padrão
                </Button>
                
                <Button onClick={exportTheme} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Tema
                </Button>
                
                <label className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Tema
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importTheme}
                    className="hidden"
                  />
                </label>
                
                <Button 
                  onClick={() => {
                    // Save to localStorage
                    localStorage.setItem('manus-theme-config', JSON.stringify(config))
                    onClose()
                  }}
                  className="ml-auto"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Salvar Tema
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Hook para gerenciar temas
export function useThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false)

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('manus-theme-config')
    if (saved) {
      try {
        const config = JSON.parse(saved)
        // Apply saved theme
        const root = document.documentElement
        root.style.setProperty('--primary-hue', getHue(config.primaryColor))
        root.style.setProperty('--accent-hue', getHue(config.accentColor))
        // ... apply other settings
      } catch (error) {
        console.error('Error loading saved theme:', error)
      }
    }
  }, [])

  const getHue = (hexColor: string): string => {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    
    let hue = 0
    if (diff !== 0) {
      if (max === r) hue = ((g - b) / diff) % 6
      else if (max === g) hue = (b - r) / diff + 2
      else hue = (r - g) / diff + 4
    }
    
    return Math.round(hue * 60).toString()
  }

  return {
    isOpen,
    openThemeCustomizer: () => setIsOpen(true),
    closeThemeCustomizer: () => setIsOpen(false)
  }
} 