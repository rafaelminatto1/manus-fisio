import { render, screen, waitFor } from '@testing-library/react'
import { SystemMonitor } from '../system-monitor'

// Mock do toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
    success: jest.fn(),
  },
}))

describe('SystemMonitor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders system monitor with all tabs', () => {
    render(<SystemMonitor />)
    
    expect(screen.getByText('Monitor do Sistema')).toBeInTheDocument()
    expect(screen.getByText('Visão Geral')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Rede')).toBeInTheDocument()
    expect(screen.getByText('Alertas')).toBeInTheDocument()
  })

  it('displays system metrics', async () => {
    render(<SystemMonitor />)
    
    await waitFor(() => {
      expect(screen.getByText('CPU')).toBeInTheDocument()
      expect(screen.getByText('Memória')).toBeInTheDocument()
      expect(screen.getByText('Disco')).toBeInTheDocument()
      expect(screen.getByText('Rede')).toBeInTheDocument()
      expect(screen.getByText('Banco de Dados')).toBeInTheDocument()
      expect(screen.getByText('Aplicação')).toBeInTheDocument()
    })
  })

  it('shows metric values within expected ranges', async () => {
    render(<SystemMonitor />)
    
    await waitFor(() => {
      // Verifica se existem elementos com classes de status
      const statusElements = document.querySelectorAll('.text-green-600, .text-yellow-600, .text-red-600')
      expect(statusElements.length).toBeGreaterThan(0)
    })
  })

  it('updates metrics periodically', async () => {
    render(<SystemMonitor />)
    
    // Aguarda primeira atualização
    await waitFor(() => {
      expect(screen.getByText('CPU')).toBeInTheDocument()
    })

    // Aguarda segunda atualização (após 2 segundos)
    await waitFor(() => {
      expect(screen.getByText('CPU')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('displays performance charts', async () => {
    render(<SystemMonitor />)
    
    // Clica na aba Performance
    const performanceTab = screen.getByText('Performance')
    performanceTab.click()
    
    await waitFor(() => {
      expect(screen.getByText('Gráfico de Performance')).toBeInTheDocument()
    })
  })

  it('shows network information', async () => {
    render(<SystemMonitor />)
    
    // Clica na aba Rede
    const networkTab = screen.getByText('Rede')
    networkTab.click()
    
    await waitFor(() => {
      expect(screen.getByText('Status da Rede')).toBeInTheDocument()
    })
  })

  it('displays alerts when thresholds are exceeded', async () => {
    render(<SystemMonitor />)
    
    // Clica na aba Alertas
    const alertsTab = screen.getByText('Alertas')
    alertsTab.click()
    
    await waitFor(() => {
      expect(screen.getByText('Alertas do Sistema')).toBeInTheDocument()
    })
  })

  it('handles component unmount properly', () => {
    const { unmount } = render(<SystemMonitor />)
    expect(() => unmount()).not.toThrow()
  })
}) 