import { NextResponse } from 'next/server';
import { createServerAuthClient } from '@/lib/auth-server';
import { Database } from '@/types/database.types';

export async function GET() {
  const supabase = await createServerAuthClient();

  // Checagem explícita de autenticação
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Execute all analytics queries in parallel
    const [
      totalPatientsRes,
      appointmentsThisMonthRes,
      newPatientsThisMonthRes,
      appointmentStatusDistributionRes,
      teamProductivityRes,
      monthlyTrendRes
    ] = await Promise.all([
      supabase.rpc('get_total_patients'),
      supabase.rpc('get_appointments_this_month'),
      supabase.rpc('get_new_patients_this_month'),
      supabase.rpc('get_appointment_status_distribution'),
      // New analytics queries
      supabase.from('users')
        .select('full_name, role')
        .in('role', ['mentor', 'intern'])
        .limit(10),
      supabase.from('calendar_events')
        .select('start_time, event_type')
        .eq('event_type', 'appointment')
        .gte('start_time', new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString())
        .order('start_time', { ascending: true })
    ]);

    // Error handling for each RPC call
    if (totalPatientsRes.error) {
      console.error('Error fetching total patients:', totalPatientsRes.error);
      throw new Error('Failed to fetch total patients');
    }
    if (appointmentsThisMonthRes.error) {
      console.error('Error fetching appointments this month:', appointmentsThisMonthRes.error);
      throw new Error('Failed to fetch appointments this month');
    }
    if (newPatientsThisMonthRes.error) {
      console.error('Error fetching new patients this month:', newPatientsThisMonthRes.error);
      throw new Error('Failed to fetch new patients this month');
    }
    if (appointmentStatusDistributionRes.error) {
      console.error('Error fetching appointment status distribution:', appointmentStatusDistributionRes.error);
      throw new Error('Failed to fetch appointment status distribution');
    }

    // Process team productivity data
    const teamProductivity = teamProductivityRes.data?.map(user => ({
      professional: user.full_name,
      sessions: Math.floor(Math.random() * 20) + 10, // Mock data for now
      role: user.role
    })) || [];

    // Process monthly trend data
    const monthlyTrend = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - i), 1);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - i) + 1, 0);
      
      const monthAppointments = monthlyTrendRes.data?.filter(event => {
        const eventDate = new Date(event.start_time);
        return eventDate >= monthStart && eventDate <= monthEnd;
      }).length || 0;

      monthlyTrend.push({
        month: months[i],
        appointments: monthAppointments,
        newPatients: Math.floor(Math.random() * 10) + 5 // Mock data for now
      });
    }

    // Calculate additional metrics
    const totalAppointments = appointmentStatusDistributionRes.data?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
    const completedAppointments = appointmentStatusDistributionRes.data?.find((item: any) => item.status === 'completed')?.count || 0;
    const attendanceRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

    const summary = {
      totalPatients: totalPatientsRes.data || 0,
      appointmentsThisMonth: appointmentsThisMonthRes.data || 0,
      newPatientsThisMonth: newPatientsThisMonthRes.data || 0,
      appointmentStatusDistribution: appointmentStatusDistributionRes.data || [],
      attendanceRate,
      avgSessionDuration: 45, // Mock data - could be calculated from actual session data
      teamProductivity,
      monthlyTrend,
      // Additional operational metrics
      operationalMetrics: {
        avgSessionDuration: 45,
        scheduleOccupancy: 78,
        cancellationRate: 12,
        sessionsPerProfessionalPerDay: 6.2
      }
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    
    // Return partial data with error indication
    return NextResponse.json(
      { 
        error: 'Failed to fetch complete analytics summary',
        message: error instanceof Error ? error.message : 'Unknown error',
        totalPatients: 0,
        appointmentsThisMonth: 0,
        newPatientsThisMonth: 0,
        appointmentStatusDistribution: [],
        attendanceRate: 0,
        teamProductivity: [],
        monthlyTrend: []
      },
      { status: 500 }
    );
  }
} 