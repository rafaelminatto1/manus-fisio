
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/auth'

// Types for real data
interface DashboardStats {
  totalNotebooks: number
  totalProjects: number
  totalTasks: number
  completedTasks: number
  totalTeamMembers: number
  activeInterns: number
  upcomingEvents: number
  completionRate: number
}

interface RecentActivity {
  id: string
  action: string
  resource_type: string
  user_id: string
  created_at: string
  user?: {
    full_name: string
    avatar_url?: string
  }
}

interface UpcomingEvent {
  id: string
  title: string
  type: 'supervision' | 'appointment' | 'meeting' | 'evaluation'
  scheduled_for: string
  participants?: string[]
}

const fetchDashboardData = async () => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error('User not authenticated')
  }

  const [notebooksResult, projectsResult, usersResult, tasksResult, activityResult, eventsResult] = await Promise.all([
    supabase.from('notebooks').select('id', { count: 'exact' }),
    supabase.from('projects').select('id, status', { count: 'exact' }),
    supabase.from('users').select('id, role, is_active', { count: 'exact' }),
    supabase.from('tasks').select('id, status', { count: 'exact' }),
    supabase.from('activity_logs').select('id, action, resource_type, user_id, created_at, users:user_id(full_name)').order('created_at', { ascending: false }).limit(10),
    supabase.from('calendar_events').select('*').order('scheduled_for', { ascending: true }).limit(5) // Assuming a table for events
  ])

  if (notebooksResult.error) throw notebooksResult.error
  if (projectsResult.error) throw projectsResult.error
  if (usersResult.error) throw usersResult.error
  if (tasksResult.error) throw tasksResult.error
  if (activityResult.error) throw activityResult.error
  if (eventsResult.error) throw eventsResult.error

  const totalNotebooks = notebooksResult.count || 0
  const totalProjects = projectsResult.count || 0
  const completedProjects = projectsResult.data?.filter((p: any) => p.status === 'completed').length || 0
  const totalTasks = tasksResult.count || 0
  const completedTasks = tasksResult.data?.filter((t: any) => t.status === 'done').length || 0
  const totalTeamMembers = usersResult.count || 0
  const activeInterns = usersResult.data?.filter((u: any) => u.role === 'intern' && u.is_active !== false).length || 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stats: DashboardStats = {
    totalNotebooks,
    totalProjects,
    totalTasks,
    completedTasks,
    totalTeamMembers,
    activeInterns,
    upcomingEvents: eventsResult.data?.length || 0,
    completionRate
  }

  const activities: RecentActivity[] = activityResult.data || []
  const events: UpcomingEvent[] = eventsResult.data || []

  return { stats, activities, events }
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
  })
}
