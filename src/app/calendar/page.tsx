'use client'

import { AuthGuard } from '@/components/auth/auth-guard'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { CalendarView } from '@/components/calendar/calendar-view'

export default function CalendarPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <CalendarView />
      </DashboardLayout>
    </AuthGuard>
  )
}