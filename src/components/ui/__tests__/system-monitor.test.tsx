import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SystemMonitor } from '../system-monitor'

describe('SystemMonitor Component', () => {
  it('renders without crashing', () => {
    render(<SystemMonitor />)
    expect(screen.getByText('Monitor do Sistema')).toBeInTheDocument()
  })

  it('displays basic system metrics', () => {
    render(<SystemMonitor />)
    
    expect(screen.getByText('CPU')).toBeInTheDocument()
    expect(screen.getByText('Memória')).toBeInTheDocument()
    expect(screen.getByText('Disco')).toBeInTheDocument()
    expect(screen.getByText('Database')).toBeInTheDocument()
  })

  it('displays navigation tabs', () => {
    render(<SystemMonitor />)
    
    expect(screen.getByText('Visão Geral')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Rede')).toBeInTheDocument()
    expect(screen.getByText('Alertas')).toBeInTheDocument()
  })
}) 