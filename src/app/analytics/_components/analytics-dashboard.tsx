'use client'

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, UserPlus, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsSummary {
  totalPatients: number;
  appointmentsThisMonth: number;
  newPatientsThisMonth: number;
  appointmentStatusDistribution: { status: string; count: number }[];
}

const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await fetch('/api/analytics/summary');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
);

export default function AnalyticsDashboard() {
  const { data, isLoading, error } = useQuery<AnalyticsSummary>({
    queryKey: ['analyticsSummary'],
    queryFn: fetchAnalyticsSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Erro ao carregar o dashboard: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Analytics</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Pacientes" value={data?.totalPatients ?? 0} icon={Users} />
        <StatCard title="Atendimentos no Mês" value={data?.appointmentsThisMonth ?? 0} icon={Calendar} />
        <StatCard title="Novos Pacientes no Mês" value={data?.newPatientsThisMonth ?? 0} icon={UserPlus} />
        <StatCard title="Status Geral" value="Ativo" icon={Activity} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral dos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data?.appointmentStatusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1d4ed8" name="Total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
           <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
           </CardHeader>
           <CardContent>
             {/* Placeholder for recent activity feed */}
             <p className="text-sm text-muted-foreground">O feed de atividade recente será implementado aqui.</p>
           </CardContent>
        </Card>
      </div>
    </div>
  );
} 