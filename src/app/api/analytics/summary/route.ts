import { NextResponse } from 'next/server';
import { createServerAuthClient } from '@/lib/auth-server';
import { Database } from '@/types/database.types';

export async function GET() {
  const supabase = await createServerAuthClient();

  try {
    const [
      totalPatientsRes,
      appointmentsThisMonthRes,
      newPatientsThisMonthRes,
      appointmentStatusDistributionRes
    ] = await Promise.all([
      supabase.rpc('get_total_patients'),
      supabase.rpc('get_appointments_this_month'),
      supabase.rpc('get_new_patients_this_month'),
      supabase.rpc('get_appointment_status_distribution')
    ]);

    // Error handling for each RPC call
    if (totalPatientsRes.error) throw totalPatientsRes.error;
    if (appointmentsThisMonthRes.error) throw appointmentsThisMonthRes.error;
    if (newPatientsThisMonthRes.error) throw newPatientsThisMonthRes.error;
    if (appointmentStatusDistributionRes.error) throw appointmentStatusDistributionRes.error;

    const summary = {
      totalPatients: totalPatientsRes.data,
      appointmentsThisMonth: appointmentsThisMonthRes.data,
      newPatientsThisMonth: newPatientsThisMonthRes.data,
      appointmentStatusDistribution: appointmentStatusDistributionRes.data,
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics summary' },
      { status: 500 }
    );
  }
} 