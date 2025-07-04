/**
 * Sistema de Cache Avançado para Manus Fisio
 * Implementa cache em memória, localStorage e sessionStorage
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live em milliseconds
  key: string
  version?: string
  tags?: string[]
}

interface CacheConfig {
  defaultTTL: number
  maxSize: number
  enablePersistent: boolean
  enableSessionStorage: boolean
  version: string
}

export class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutos
      maxSize: 100,
      enablePersistent: typeof window !== 'undefined',
      enableSessionStorage: typeof window !== 'undefined',
      version: '1.0.0',
      ...config
    }

    // Cleanup automático a cada minuto
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup()
      }, 60 * 1000)
    }
  }

  /**
   * Armazena dados no cache
   */
  set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number
      persistent?: boolean
      sessionOnly?: boolean
      tags?: string[]
    } = {}
  ): void {
    const ttl = options.ttl || this.config.defaultTTL
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
      version: this.config.version,
      tags: options.tags
    }

    // Cache em memória
    this.memoryCache.set(key, entry)

    // Gerenciar tamanho do cache
    if (this.memoryCache.size > this.config.maxSize) {
      this.evictOldest()
    }

    // Cache persistente
    if (options.persistent && this.config.enablePersistent) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
      } catch (error) {
        console.warn('Failed to save to localStorage:', error)
      }
    }

    // Cache de sessão
    if (options.sessionOnly && this.config.enableSessionStorage) {
      try {
        sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry))
      } catch (error) {
        console.warn('Failed to save to sessionStorage:', error)
      }
    }
  }

  /**
   * Recupera dados do cache
   */
  get<T>(key: string): T | null {
    // Verificar cache em memória primeiro
    const memoryEntry = this.memoryCache.get(key)
    if (memoryEntry && this.isValid(memoryEntry)) {
      return memoryEntry.data
    }

    // Verificar localStorage
    if (this.config.enablePersistent) {
      try {
        const stored = localStorage.getItem(`cache_${key}`)
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored)
          if (this.isValid(entry)) {
            // Recarregar no cache em memória
            this.memoryCache.set(key, entry)
            return entry.data
          } else {
            localStorage.removeItem(`cache_${key}`)
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error)
      }
    }

    // Verificar sessionStorage
    if (this.config.enableSessionStorage) {
      try {
        const stored = sessionStorage.getItem(`cache_${key}`)
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored)
          if (this.isValid(entry)) {
            this.memoryCache.set(key, entry)
            return entry.data
          } else {
            sessionStorage.removeItem(`cache_${key}`)
          }
        }
      } catch (error) {
        console.warn('Failed to read from sessionStorage:', error)
      }
    }

    return null
  }

  /**
   * Verifica se uma entrada existe e é válida
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Remove uma entrada específica
   */
  delete(key: string): boolean {
    const deleted = this.memoryCache.delete(key)
    
    if (this.config.enablePersistent) {
      localStorage.removeItem(`cache_${key}`)
    }
    
    if (this.config.enableSessionStorage) {
      sessionStorage.removeItem(`cache_${key}`)
    }
    
    return deleted
  }

  /**
   * Remove todas as entradas com tags específicas
   */
  deleteByTags(tags: string[]): number {
    let deletedCount = 0
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        this.delete(key)
        deletedCount++
      }
    }
    
    return deletedCount
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.memoryCache.clear()
    
    if (this.config.enablePersistent) {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    }
    
    if (this.config.enableSessionStorage) {
      try {
        const keys = Object.keys(sessionStorage)
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            sessionStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.warn('Failed to clear sessionStorage:', error)
      }
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): {
    memorySize: number
    memoryEntries: number
    hitRate: number
    oldestEntry: number | null
  } {
    const entries = Array.from(this.memoryCache.values())
    const now = Date.now()
    
    return {
      memorySize: this.memoryCache.size,
      memoryEntries: entries.length,
      hitRate: this.calculateHitRate(),
      oldestEntry: entries.length > 0 
        ? Math.min(...entries.map(e => e.timestamp))
        : null
    }
  }

  /**
   * Cleanup automático de entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now()
    const toDelete: string[] = []
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        toDelete.push(key)
      }
    }
    
    toDelete.forEach(key => this.delete(key))
  }

  /**
   * Remove a entrada mais antiga quando o cache está cheio
   */
  private evictOldest(): void {
    let oldestKey = ''
    let oldestTime = Date.now()
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }
    
    if (oldestKey) {
      this.delete(oldestKey)
    }
  }

  /**
   * Verifica se uma entrada é válida
   */
  private isValid(entry: CacheEntry<any>): boolean {
    const now = Date.now()
    const isExpired = now - entry.timestamp > entry.ttl
    const isWrongVersion = entry.version !== this.config.version
    
    return !isExpired && !isWrongVersion
  }

  /**
   * Calcula taxa de acerto (simplificado)
   */
  private calculateHitRate(): number {
    // Em uma implementação real, você manteria contadores
    return 0.85 // Placeholder
  }

  /**
   * Cleanup ao destruir
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

// Instância global do cache
export const globalCache = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutos
  maxSize: 200,
  enablePersistent: true,
  enableSessionStorage: true,
  version: '1.0.0'
})

// Cache especializado para dados de pacientes
export const patientCache = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10 minutos
  maxSize: 50,
  enablePersistent: true,
  version: '1.0.0'
})

// Cache para respostas de IA
export const aiCache = new CacheManager({
  defaultTTL: 30 * 60 * 1000, // 30 minutos
  maxSize: 100,
  enablePersistent: true,
  version: '1.0.0'
})

// Cache para dados de analytics
export const analyticsCache = new CacheManager({
  defaultTTL: 15 * 60 * 1000, // 15 minutos
  maxSize: 30,
  enablePersistent: false, // Dados sensíveis não persistem
  enableSessionStorage: true,
  version: '1.0.0'
})

/**
 * Hook React para usar cache com invalidação automática
 */
export const useCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    cacheInstance?: CacheManager
    tags?: string[]
    enabled?: boolean
  } = {}
) => {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  
  const cache = options.cacheInstance || globalCache
  const enabled = options.enabled !== false

  const fetchData = React.useCallback(async () => {
    if (!enabled) return

    // Verificar cache primeiro
    const cached = cache.get<T>(key)
    if (cached) {
      setData(cached)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      cache.set(key, result, {
        ttl: options.ttl,
        tags: options.tags
      })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, cache, options.ttl, options.tags, enabled])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const invalidate = React.useCallback(() => {
    cache.delete(key)
    fetchData()
  }, [cache, key, fetchData])

  return {
    data,
    loading,
    error,
    invalidate,
    refetch: fetchData
  }
}

/**
 * Utilitários para cache de consultas específicas
 */
export const cacheUtils = {
  // Cache para lista de pacientes
  getPatients: (filters?: any) => {
    const key = `patients_${JSON.stringify(filters || {})}`
    return patientCache.get(key)
  },

  setPatients: (patients: any[], filters?: any) => {
    const key = `patients_${JSON.stringify(filters || {})}`
    patientCache.set(key, patients, {
      ttl: 10 * 60 * 1000,
      tags: ['patients']
    })
  },

  // Cache para dados de um paciente específico
  getPatient: (id: string) => {
    return patientCache.get(`patient_${id}`)
  },

  setPatient: (id: string, patient: any) => {
    patientCache.set(`patient_${id}`, patient, {
      ttl: 15 * 60 * 1000,
      tags: ['patients', `patient_${id}`]
    })
  },

  // Invalidar cache de pacientes
  invalidatePatients: () => {
    patientCache.deleteByTags(['patients'])
  },

  // Cache para respostas de IA
  getAIResponse: (prompt: string, context?: any) => {
    const key = `ai_${btoa(prompt)}_${JSON.stringify(context || {})}`
    return aiCache.get(key)
  },

  setAIResponse: (prompt: string, response: any, context?: any) => {
    const key = `ai_${btoa(prompt)}_${JSON.stringify(context || {})}`
    aiCache.set(key, response, {
      ttl: 30 * 60 * 1000,
      tags: ['ai_responses']
    })
  },

  // Cache para analytics
  getAnalytics: (type: string, params?: any) => {
    const key = `analytics_${type}_${JSON.stringify(params || {})}`
    return analyticsCache.get(key)
  },

  setAnalytics: (type: string, data: any, params?: any) => {
    const key = `analytics_${type}_${JSON.stringify(params || {})}`
    analyticsCache.set(key, data, {
      ttl: 15 * 60 * 1000,
      tags: ['analytics', `analytics_${type}`],
      sessionOnly: true
    })
  }
}

export default globalCache

// Importar React para o hook
import React from 'react' 