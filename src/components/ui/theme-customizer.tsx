'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Settings,
  Check,
  RefreshCw,
  Download,
  Upload,
  Paintbrush,
  Contrast,
  Type,
  Zap,
  Eye,
  Sliders,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Wand2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  accentColor: string
  backgroundColor: string
  borderRadius: number
  fontSize: number
  animations: boolean
  reducedMotion: boolean
  highContrast: boolean
  customColors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
  }
  typography: {
    fontFamily: string
    fontSize: number
    lineHeight: number
    fontWeight: number
  }
  spacing: {
    scale: number
    compact: boolean
  }
  effects: {
    blur: boolean
    shadows: boolean
    gradients: boolean
    animations: boolean
  }
}

const defaultTheme: ThemeConfig = {
  mode: 'system',
  primaryColor: '#3b82f6',
  accentColor: '#0ea5e9',
  backgroundColor: '#ffffff',
  borderRadius: 8,
  fontSize: 14,
  animations: true,
  reducedMotion: false,
  highContrast: false,
  customColors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    accent: '#0ea5e9',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f1f5f9',
    border: '#e2e8f0',
  },
  typography: {
    fontFamily: 'Inter',
    fontSize: 14,
    lineHeight: 1.5,
    fontWeight: 400,
  },
  spacing: {
    scale: 1,
    compact: false,
  },
  effects: {
    blur: true,
    shadows: true,
    gradients: true,
    animations: true,
  },
}

const presetThemes = [
  {
    name: 'Clássico',
    description: 'Tema padrão com cores equilibradas',
    preview: ['#3b82f6', '#ffffff', '#0f172a'],
    config: defaultTheme,
  },
  {
    name: 'Médico',
    description: 'Tema especializado para área médica',
    preview: ['#0ea5e9', '#f0f9ff', '#0c4a6e'],
    config: {
      ...defaultTheme,
      primaryColor: '#0ea5e9',
      accentColor: '#06b6d4',
      customColors: {
        ...defaultTheme.customColors,
        primary: '#0ea5e9',
        accent: '#06b6d4',
        background: '#f0f9ff',
        muted: '#e0f2fe',
      },
    },
  },
  {
    name: 'Natureza',
    description: 'Tons verdes inspirados na natureza',
    preview: ['#22c55e', '#f0fdf4', '#14532d'],
    config: {
      ...defaultTheme,
      primaryColor: '#22c55e',
      accentColor: '#16a34a',
      customColors: {
        ...defaultTheme.customColors,
        primary: '#22c55e',
        accent: '#16a34a',
        background: '#f0fdf4',
        muted: '#dcfce7',
      },
    },
  },
  {
    name: 'Profissional',
    description: 'Tema escuro para ambientes profissionais',
    preview: ['#6366f1', '#0f172a', '#e2e8f0'],
    config: {
      ...defaultTheme,
      mode: 'dark' as const,
      primaryColor: '#6366f1',
      accentColor: '#8b5cf6',
      backgroundColor: '#0f172a',
      customColors: {
        ...defaultTheme.customColors,
        primary: '#6366f1',
        accent: '#8b5cf6',
        background: '#0f172a',
        foreground: '#e2e8f0',
        muted: '#1e293b',
        border: '#334155',
      },
    },
  },
  {
    name: 'Sunset',
    description: 'Gradientes quentes e vibrantes',
    preview: ['#f59e0b', '#fef3c7', '#92400e'],
    config: {
      ...defaultTheme,
      primaryColor: '#f59e0b',
      accentColor: '#ef4444',
      customColors: {
        ...defaultTheme.customColors,
        primary: '#f59e0b',
        accent: '#ef4444',
        background: '#fef3c7',
        muted: '#fde68a',
      },
      effects: {
        ...defaultTheme.effects,
        gradients: true,
      },
    },
  },
  {
    name: 'Minimalista',
    description: 'Design limpo e minimalista',
    preview: ['#000000', '#ffffff', '#6b7280'],
    config: {
      ...defaultTheme,
      primaryColor: '#000000',
      accentColor: '#6b7280',
      borderRadius: 4,
      customColors: {
        ...defaultTheme.customColors,
        primary: '#000000',
        accent: '#6b7280',
        background: '#ffffff',
        foreground: '#000000',
        muted: '#f9fafb',
        border: '#e5e7eb',
      },
      effects: {
        ...defaultTheme.effects,
        shadows: false,
        gradients: false,
      },
      spacing: {
        ...defaultTheme.spacing,
        compact: true,
      },
    },
  },
]

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(defaultTheme)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('presets')
  const [expandedSections, setExpandedSections] = useState<string[]>(['colors'])

  // Aplicar tema ao documento
  useEffect(() => {
    if (previewMode) {
      applyThemeToDocument(currentTheme)
    }
  }, [currentTheme, previewMode])

  const applyThemeToDocument = (theme: ThemeConfig) => {
    const root = document.documentElement
    
    // Aplicar cores customizadas
    Object.entries(theme.customColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
    
    // Aplicar configurações de tipografia
    root.style.setProperty('--font-size', `${theme.typography.fontSize}px`)
    root.style.setProperty('--line-height', theme.typography.lineHeight.toString())
    root.style.setProperty('--font-weight', theme.typography.fontWeight.toString())
    
    // Aplicar raio de borda
    root.style.setProperty('--border-radius', `${theme.borderRadius}px`)
    
    // Aplicar escala de espaçamento
    root.style.setProperty('--spacing-scale', theme.spacing.scale.toString())
    
    // Aplicar modo de cor
    root.classList.toggle('dark', theme.mode === 'dark')
    
    // Aplicar efeitos
    root.classList.toggle('no-animations', !theme.effects.animations)
    root.classList.toggle('reduced-motion', theme.reducedMotion)
    root.classList.toggle('high-contrast', theme.highContrast)
  }

  const handleThemeChange = (newTheme: Partial<ThemeConfig>) => {
    setCurrentTheme(prev => ({ ...prev, ...newTheme }))
  }

  const handlePresetSelect = (preset: typeof presetThemes[0]) => {
    setCurrentTheme(preset.config)
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const resetTheme = () => {
    setCurrentTheme(defaultTheme)
  }

  const exportTheme = () => {
    const dataStr = JSON.stringify(currentTheme, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'manus-theme.json'
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedTheme = JSON.parse(e.target?.result as string)
          setCurrentTheme(importedTheme)
        } catch (error) {
          console.error('Erro ao importar tema:', error)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <>
      {/* Botão para abrir o customizador */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Palette className="h-4 w-4 mr-2" />
        Personalizar
      </Button>

      {/* Modal do customizador */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-4 md:inset-8 lg:inset-16"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="h-full flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Wand2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Personalizador de Tema</h2>
                      <p className="text-sm text-muted-foreground">
                        Customize a aparência do seu sistema
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {previewMode ? 'Parar Preview' : 'Preview'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                    <div className="flex h-full">
                      {/* Sidebar */}
                      <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="presets">Presets</TabsTrigger>
                          <TabsTrigger value="custom">Custom</TabsTrigger>
                        </TabsList>

                        <TabsContent value="presets" className="space-y-4">
                          <div className="space-y-3">
                            {presetThemes.map((preset, index) => (
                              <motion.div
                                key={preset.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Card
                                  className={cn(
                                    'p-4 cursor-pointer transition-all duration-200',
                                    'hover:shadow-md hover:border-primary/20',
                                    currentTheme.customColors.primary === preset.config.customColors.primary &&
                                    'border-primary shadow-md'
                                  )}
                                  onClick={() => handlePresetSelect(preset)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                      {preset.preview.map((color, i) => (
                                        <div
                                          key={i}
                                          className="w-4 h-4 rounded-full border border-border"
                                          style={{ backgroundColor: color }}
                                        />
                                      ))}
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-medium">{preset.name}</h3>
                                      <p className="text-xs text-muted-foreground">
                                        {preset.description}
                                      </p>
                                    </div>
                                    {currentTheme.customColors.primary === preset.config.customColors.primary && (
                                      <Check className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="custom" className="space-y-4">
                          {/* Seção de Cores */}
                          <div className="space-y-3">
                            <Button
                              variant="ghost"
                              className="w-full justify-between p-2"
                              onClick={() => toggleSection('colors')}
                            >
                              <div className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Cores
                              </div>
                              {expandedSections.includes('colors') ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {expandedSections.includes('colors') && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 pl-4"
                              >
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Cor Primária</label>
                                  <input
                                    type="color"
                                    value={currentTheme.customColors.primary}
                                    onChange={(e) => handleThemeChange({
                                      customColors: {
                                        ...currentTheme.customColors,
                                        primary: e.target.value
                                      }
                                    })}
                                    className="w-full h-10 rounded-md border border-input"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Cor de Destaque</label>
                                  <input
                                    type="color"
                                    value={currentTheme.customColors.accent}
                                    onChange={(e) => handleThemeChange({
                                      customColors: {
                                        ...currentTheme.customColors,
                                        accent: e.target.value
                                      }
                                    })}
                                    className="w-full h-10 rounded-md border border-input"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Cor de Fundo</label>
                                  <input
                                    type="color"
                                    value={currentTheme.customColors.background}
                                    onChange={(e) => handleThemeChange({
                                      customColors: {
                                        ...currentTheme.customColors,
                                        background: e.target.value
                                      }
                                    })}
                                    className="w-full h-10 rounded-md border border-input"
                                  />
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Seção de Tipografia */}
                          <div className="space-y-3">
                            <Button
                              variant="ghost"
                              className="w-full justify-between p-2"
                              onClick={() => toggleSection('typography')}
                            >
                              <div className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                Tipografia
                              </div>
                              {expandedSections.includes('typography') ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {expandedSections.includes('typography') && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 pl-4"
                              >
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Tamanho da Fonte</label>
                                  <Slider
                                    value={[currentTheme.typography.fontSize]}
                                    onValueChange={([value]) => handleThemeChange({
                                      typography: {
                                        ...currentTheme.typography,
                                        fontSize: value
                                      }
                                    })}
                                    min={12}
                                    max={20}
                                    step={1}
                                    className="w-full"
                                  />
                                  <div className="text-xs text-muted-foreground">
                                    {currentTheme.typography.fontSize}px
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Altura da Linha</label>
                                  <Slider
                                    value={[currentTheme.typography.lineHeight]}
                                    onValueChange={([value]) => handleThemeChange({
                                      typography: {
                                        ...currentTheme.typography,
                                        lineHeight: value
                                      }
                                    })}
                                    min={1.2}
                                    max={2}
                                    step={0.1}
                                    className="w-full"
                                  />
                                  <div className="text-xs text-muted-foreground">
                                    {currentTheme.typography.lineHeight}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Seção de Efeitos */}
                          <div className="space-y-3">
                            <Button
                              variant="ghost"
                              className="w-full justify-between p-2"
                              onClick={() => toggleSection('effects')}
                            >
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Efeitos
                              </div>
                              {expandedSections.includes('effects') ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {expandedSections.includes('effects') && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 pl-4"
                              >
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium">Animações</label>
                                  <Switch
                                    checked={currentTheme.effects.animations}
                                    onCheckedChange={(checked) => handleThemeChange({
                                      effects: {
                                        ...currentTheme.effects,
                                        animations: checked
                                      }
                                    })}
                                  />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium">Sombras</label>
                                  <Switch
                                    checked={currentTheme.effects.shadows}
                                    onCheckedChange={(checked) => handleThemeChange({
                                      effects: {
                                        ...currentTheme.effects,
                                        shadows: checked
                                      }
                                    })}
                                  />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium">Gradientes</label>
                                  <Switch
                                    checked={currentTheme.effects.gradients}
                                    onCheckedChange={(checked) => handleThemeChange({
                                      effects: {
                                        ...currentTheme.effects,
                                        gradients: checked
                                      }
                                    })}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </TabsContent>
                      </div>

                      {/* Preview Area */}
                      <div className="flex-1 p-6 overflow-y-auto">
                        <div className="space-y-6">
                          <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold">Preview do Tema</h3>
                            <p className="text-muted-foreground">
                              Veja como ficará a aparência do sistema
                            </p>
                          </div>

                          {/* Preview Components */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Buttons Preview */}
                            <Card className="p-4 space-y-3">
                              <h4 className="font-medium">Botões</h4>
                              <div className="flex flex-wrap gap-2">
                                <Button>Primário</Button>
                                <Button variant="secondary">Secundário</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="ghost">Ghost</Button>
                              </div>
                            </Card>

                            {/* Cards Preview */}
                            <Card className="p-4 space-y-3">
                              <h4 className="font-medium">Cartões</h4>
                              <Card className="p-3">
                                <h5 className="font-medium">Cartão de Exemplo</h5>
                                <p className="text-sm text-muted-foreground">
                                  Este é um exemplo de cartão com o tema aplicado.
                                </p>
                              </Card>
                            </Card>

                            {/* Typography Preview */}
                            <Card className="p-4 space-y-3">
                              <h4 className="font-medium">Tipografia</h4>
                              <div className="space-y-2">
                                <h1 className="text-2xl font-bold">Título Principal</h1>
                                <h2 className="text-xl font-semibold">Subtítulo</h2>
                                <p className="text-base">Texto normal para leitura.</p>
                                <p className="text-sm text-muted-foreground">
                                  Texto secundário em tamanho menor.
                                </p>
                              </div>
                            </Card>

                            {/* Colors Preview */}
                            <Card className="p-4 space-y-3">
                              <h4 className="font-medium">Paleta de Cores</h4>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="space-y-1">
                                  <div 
                                    className="w-full h-8 rounded border"
                                    style={{ backgroundColor: currentTheme.customColors.primary }}
                                  />
                                  <p className="text-xs">Primária</p>
                                </div>
                                <div className="space-y-1">
                                  <div 
                                    className="w-full h-8 rounded border"
                                    style={{ backgroundColor: currentTheme.customColors.accent }}
                                  />
                                  <p className="text-xs">Destaque</p>
                                </div>
                                <div className="space-y-1">
                                  <div 
                                    className="w-full h-8 rounded border"
                                    style={{ backgroundColor: currentTheme.customColors.muted }}
                                  />
                                  <p className="text-xs">Muted</p>
                                </div>
                                <div className="space-y-1">
                                  <div 
                                    className="w-full h-8 rounded border"
                                    style={{ backgroundColor: currentTheme.customColors.border }}
                                  />
                                  <p className="text-xs">Border</p>
                                </div>
                              </div>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tabs>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={resetTheme}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resetar
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportTheme}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <label>
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Importar
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importTheme}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => {
                      applyThemeToDocument(currentTheme)
                      setIsOpen(false)
                    }}>
                      Aplicar Tema
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 