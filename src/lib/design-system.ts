// 🎨 DESIGN SYSTEM PREMIUM - MANUS FISIO
// Sistema completo de design tokens, animações e utilitários

export const designTokens = {
  // 🎨 PALETA DE CORES PREMIUM
  colors: {
    // Cores primárias da marca
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Azul principal
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    
    // Cores médicas/fisioterapia
    medical: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Azul médico
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },
    
    // Cores de sucesso
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Verde principal
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    
    // Cores de alerta
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Amarelo principal
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    // Cores de erro
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Vermelho principal
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    // Cores neutras premium
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a'
    },
    
    // Gradientes especiais
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      medical: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
      success: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
      sunset: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
      ocean: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
      aurora: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #06b6d4 100%)'
    }
  },

  // 📐 TIPOGRAFIA PREMIUM
  typography: {
    fontFamilies: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Playfair Display', 'serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
    },
    
    fontSizes: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }]
    },
    
    fontWeights: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    }
  },

  // 📏 ESPAÇAMENTOS E DIMENSÕES
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem'
  },

  // 🌟 SOMBRAS PREMIUM
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    
    // Sombras coloridas
    glow: {
      primary: '0 0 20px rgb(59 130 246 / 0.5)',
      medical: '0 0 20px rgb(14 165 233 / 0.5)',
      success: '0 0 20px rgb(34 197 94 / 0.5)',
      warning: '0 0 20px rgb(245 158 11 / 0.5)',
      error: '0 0 20px rgb(239 68 68 / 0.5)'
    }
  },

  // 🔄 BORDAS E RAIOS
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },

  // ⚡ TRANSIÇÕES E ANIMAÇÕES
  transitions: {
    durations: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
      slowest: '1000ms'
    },
    
    easings: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      
      // Easings customizados premium
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      dramatic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
  },

  // 📱 BREAKPOINTS RESPONSIVOS
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // 🎯 Z-INDEX LAYERS
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
}

// 🎬 SISTEMA DE ANIMAÇÕES PREMIUM
export const animations = {
  // Animações de entrada
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  
  slideInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Animações de micro-interação
  bounce: {
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse' as const
      }
    }
  },
  
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  },
  
  wiggle: {
    animate: {
      rotate: [0, -3, 3, -3, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  },
  
  // Animações de hover
  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  hoverLift: {
    whileHover: { y: -2, boxShadow: designTokens.shadows.lg },
    whileTap: { y: 0 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Animações de loading
  spin: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity
      }
    }
  },
  
  // Animações de lista
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  }
}

// 🎨 VARIANTES DE COMPONENTES
export const componentVariants = {
  button: {
    primary: {
      backgroundColor: designTokens.colors.primary[500],
      color: designTokens.colors.neutral[0],
      boxShadow: designTokens.shadows.md,
      '&:hover': {
        backgroundColor: designTokens.colors.primary[600],
        boxShadow: designTokens.shadows.lg
      }
    },
    
    secondary: {
      backgroundColor: designTokens.colors.neutral[100],
      color: designTokens.colors.neutral[900],
      border: `1px solid ${designTokens.colors.neutral[300]}`,
      '&:hover': {
        backgroundColor: designTokens.colors.neutral[200]
      }
    },
    
    ghost: {
      backgroundColor: 'transparent',
      color: designTokens.colors.neutral[700],
      '&:hover': {
        backgroundColor: designTokens.colors.neutral[100]
      }
    }
  },
  
  card: {
    default: {
      backgroundColor: designTokens.colors.neutral[0],
      borderRadius: designTokens.borderRadius.lg,
      boxShadow: designTokens.shadows.base,
      border: `1px solid ${designTokens.colors.neutral[200]}`
    },
    
    elevated: {
      backgroundColor: designTokens.colors.neutral[0],
      borderRadius: designTokens.borderRadius.xl,
      boxShadow: designTokens.shadows.xl,
      border: 'none'
    },
    
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderRadius: designTokens.borderRadius.xl,
      border: `1px solid ${designTokens.colors.neutral[200]}`
    }
  }
}

// 🌈 TEMAS PERSONALIZÁVEIS
export const themes = {
  light: {
    background: designTokens.colors.neutral[0],
    foreground: designTokens.colors.neutral[900],
    muted: designTokens.colors.neutral[100],
    mutedForeground: designTokens.colors.neutral[500],
    border: designTokens.colors.neutral[200],
    accent: designTokens.colors.primary[500]
  },
  
  dark: {
    background: designTokens.colors.neutral[950],
    foreground: designTokens.colors.neutral[50],
    muted: designTokens.colors.neutral[800],
    mutedForeground: designTokens.colors.neutral[400],
    border: designTokens.colors.neutral[800],
    accent: designTokens.colors.primary[400]
  },
  
  medical: {
    background: designTokens.colors.neutral[0],
    foreground: designTokens.colors.neutral[900],
    muted: designTokens.colors.medical[50],
    mutedForeground: designTokens.colors.medical[600],
    border: designTokens.colors.medical[200],
    accent: designTokens.colors.medical[500]
  }
}

// 🛠️ UTILITÁRIOS DO DESIGN SYSTEM
export const designUtils = {
  // Função para gerar classes CSS dinâmicas
  cn: (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ')
  },
  
  // Função para aplicar variantes
  applyVariant: (base: string, variant: keyof typeof componentVariants, type: string) => {
    const variantStyles = componentVariants[variant as keyof typeof componentVariants]
    if (variantStyles && variantStyles[type as keyof typeof variantStyles]) {
      return `${base} ${variantStyles[type as keyof typeof variantStyles]}`
    }
    return base
  },
  
  // Função para responsividade
  responsive: (value: string | number, breakpoint: keyof typeof designTokens.breakpoints) => {
    return `${breakpoint}:${value}`
  },
  
  // Função para animações
  withAnimation: (element: any, animationType: keyof typeof animations) => {
    return {
      ...element,
      ...animations[animationType]
    }
  }
}

export default {
  tokens: designTokens,
  animations,
  variants: componentVariants,
  themes,
  utils: designUtils
} 