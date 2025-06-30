'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Calendar, UserPlus, Activity } from 'lucide-react';
import { Metadata } from 'next';
import AnalyticsDashboard from './_components/analytics-dashboard';

interface AnalyticsSummary {
  totalPatients: number;
  appointmentsThisMonth: number;
  newPatientsThisMonth: number;
  appointmentStatusDistribution: { status: string; count: number }[];
}

const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await fetch('/api/analytics/summary');
  if (!response.ok) {
    throw new Error('Falha ao buscar os dados de analytics');
  }
  return response.json();
};

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
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

export const metadata: Metadata = {
  title: 'Analytics e Relatórios - Manus Fisio',
  description: 'Visualize métricas de performance da clínica, acompanhe a evolução de pacientes e gere relatórios detalhados.',
  alternates: {
    canonical: '/analytics',
  },
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
} 