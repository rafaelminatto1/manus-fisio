import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/auth';

// Types for real data
export interface DashboardStats {
  notebooks: number
  projects: number
  activeInterns: number
  completedTasks: number
  totalTasks: number
  activeMentorships: number
}

export interface RecentActivity {
  id: string
  action: string
  resource_type: string
  user_id: string
  created_at: string
  user?: {
    full_name: string
  }
}

const supabase = createClient();

const fetchDashboardData = async () => {
  const [
    notebooksResult,
    projectsResult,
    tasksResult,
    mentorshipsResult,
    usersResult,
    completedTasksResult,
    activitiesResult,
  ] = await Promise.all([
    supabase.from('notebooks').select('id', { count: 'exact' }),
    supabase.from('projects').select('id', { count: 'exact' }),
    supabase.from('tasks').select('id, status', { count: 'exact' }),
    supabase.from('mentorships').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('users').select('id', { count: 'exact' }).eq('role', 'intern').eq('is_active', true),
    supabase.from('tasks').select('id', { count: 'exact' }).eq('status', 'done'),
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
          full_name
        )
      `
      )
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const stats: DashboardStats = {
    notebooks: notebooksResult.count || 0,
    projects: projectsResult.count || 0,
    activeInterns: usersResult.count || 0,
    completedTasks: completedTasksResult.count || 0,
    totalTasks: tasksResult.count || 0,
    activeMentorships: mentorshipsResult.count || 0,
  };

  const activities: RecentActivity[] = activitiesResult.data?.map((activity: any) => ({
    ...activity,
    user: activity.users,
  })) || [];

  return { stats, activities };
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
  });
};