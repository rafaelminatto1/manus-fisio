import React from 'react'
import { Metadata } from 'next'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { SystemMonitor } from '@/components/ui/system-monitor'

export const metadata: Metadata = {
  title: 'Monitor do Sistema | Manus Fisio',
  description: 'Monitoramento em tempo real da saúde e performance do sistema',
}

export default function SystemMonitorPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <SystemMonitor />
      </div>
    </DashboardLayout>
  )
}
