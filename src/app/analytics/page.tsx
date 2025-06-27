import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AnalyticsDashboard } from '@/components/ui/analytics-dashboard'
import { Loading } from '@/components/ui/loading'

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <Suspense fallback={<Loading />}>
          <AnalyticsDashboard />
        </Suspense>
      </DashboardLayout>
    </AuthGuard>
  )
}

export const metadata = {
  title: 'Analytics - Manus Fisio',
  description: 'Dashboard de analytics e métricas do sistema',
} 