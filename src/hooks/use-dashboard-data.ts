import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/auth';

// Types for consolidated dashboard data
export interface DashboardStats {
  totalNotebooks: number
  totalProjects: number
  totalTasks: number
  completedTasks: number
  totalTeamMembers: number
  activeInterns: number
  upcomingEvents: number
  activeMentorships: number
  completionRate: number
}

export interface RecentActivity {
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

export interface UpcomingEvent {
  id: string
  title: string
  type: 'supervision' | 'appointment' | 'meeting' | 'evaluation'
  scheduled_for: string
  participants?: string[]
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const fetchDashboardData = async () => {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error('User not authenticated')
  }

  const [
    notebooksResult,
    projectsResult,
    tasksResult,
    mentorshipsResult,
    usersResult,
    activitiesResult,
    eventsResult,
  ] = await Promise.all([
    supabase.from('notebooks').select('id', { count: 'exact' }),
    supabase.from('projects').select('id, status', { count: 'exact' }),
    supabase.from('tasks').select('id, status', { count: 'exact' }),
    supabase.from('mentorships').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('users').select('id, role, is_active', { count: 'exact' }),
    supabase
      .from('activity_logs')
      .select(
        `
        id,
        action,
        resource_type,
        user_id,
        created_at,
        users:user_id (
          full_name,
          avatar_url
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('calendar_events')
      .select('*')
      .gte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(5),
  ]);

  if (notebooksResult.error) throw notebooksResult.error
  if (projectsResult.error) throw projectsResult.error
  if (tasksResult.error) throw tasksResult.error
  if (mentorshipsResult.error) throw mentorshipsResult.error
  if (usersResult.error) throw usersResult.error
  if (activitiesResult.error) throw activitiesResult.error
  if (eventsResult.error) throw eventsResult.error

  const totalNotebooks = notebooksResult.count || 0
  const totalProjects = projectsResult.count || 0
  const totalTasks = tasksResult.count || 0
  const completedTasks = tasksResult.data?.filter((t: any) => t.status === 'done').length || 0
  const totalTeamMembers = usersResult.count || 0
  const activeInterns = usersResult.data?.filter((u: any) => u.role === 'intern' && u.is_active !== false).length || 0
  const activeMentorships = mentorshipsResult.count || 0
  const upcomingEvents = eventsResult.data?.length || 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stats: DashboardStats = {
    totalNotebooks,
    totalProjects,
    totalTasks,
    completedTasks,
    totalTeamMembers,
    activeInterns,
    upcomingEvents,
    activeMentorships,
    completionRate,
  };

  const activities: RecentActivity[] = activitiesResult.data?.map((activity: any) => ({
    ...activity,
    user: activity.users,
  })) || [];

  const events: UpcomingEvent[] = eventsResult.data || [];

  return { stats, activities, events };
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
};

// Mantendo compatibilidade com o nome antigo
export const useDashboardQuery = useDashboardData;