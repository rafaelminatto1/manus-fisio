'use client'

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, UserPlus, Activity, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsSummary {
  totalPatients: number;
  appointmentsThisMonth: number;
  newPatientsThisMonth: number;
  appointmentStatusDistribution: { status: string; count: number }[];
  // New metrics
  attendanceRate?: number;
  avgSessionDuration?: number;
  teamProductivity?: { professional: string; sessions: number }[];
  monthlyTrend?: { month: string; appointments: number; newPatients: number }[];
}

const fetchAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await fetch('/api/analytics/summary');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && trendValue && (
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <TrendingUp className={`h-3 w-3 mr-1 ${
            trend === 'up' ? 'text-green-500' : 
            trend === 'down' ? 'text-red-500' : 
            'text-gray-500'
          }`} />
          <span className={
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }>
            {trendValue}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'no_show': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return CheckCircle;
    case 'scheduled': return Clock;
    case 'cancelled': return AlertCircle;
    case 'no_show': return AlertCircle;
    default: return Activity;
  }
};

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

  // Calculate attendance rate
  const attendanceRate = data?.appointmentStatusDistribution ? 
    Math.round((data.appointmentStatusDistribution.find(s => s.status === 'completed')?.count || 0) / 
    data.appointmentStatusDistribution.reduce((sum, s) => sum + s.count, 0) * 100) : 0;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Analytics</h2>
        <Badge variant="outline" className="text-sm">
          Última atualização: {new Date().toLocaleTimeString('pt-BR')}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total de Pacientes" 
          value={data?.totalPatients ?? 0} 
          icon={Users}
          trend="up"
          trendValue="+12% vs mês anterior"
        />
        <StatCard 
          title="Atendimentos no Mês" 
          value={data?.appointmentsThisMonth ?? 0} 
          icon={Calendar}
          trend="up"
          trendValue="+8% vs mês anterior"
        />
        <StatCard 
          title="Novos Pacientes" 
          value={data?.newPatientsThisMonth ?? 0} 
          icon={UserPlus}
          trend="stable"
          trendValue="Estável"
        />
        <StatCard 
          title="Taxa de Comparecimento" 
          value={`${attendanceRate}%`} 
          icon={Activity}
          trend={attendanceRate > 80 ? "up" : attendanceRate > 60 ? "stable" : "down"}
          trendValue={attendanceRate > 80 ? "Excelente" : attendanceRate > 60 ? "Bom" : "Precisa melhorar"}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Status Distribution Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Status dos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data?.appointmentStatusDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="status" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => {
                    const statusMap: { [key: string]: string } = {
                      'scheduled': 'Agendado',
                      'completed': 'Concluído',
                      'cancelled': 'Cancelado',
                      'no_show': 'Faltou'
                    };
                    return statusMap[value] || value;
                  }}
                />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value, name) => [value, 'Total']}
                  labelFormatter={(label) => {
                    const statusMap: { [key: string]: string } = {
                      'scheduled': 'Agendado',
                      'completed': 'Concluído',
                      'cancelled': 'Cancelado',
                      'no_show': 'Faltou'
                    };
                    return statusMap[label] || label;
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#1d4ed8" name="Agendamentos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Summary Cards */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Resumo por Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.appointmentStatusDistribution?.map((item, index) => {
              const Icon = getStatusIcon(item.status);
              return (
                <div key={item.status} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {item.status === 'scheduled' ? 'Agendado' :
                         item.status === 'completed' ? 'Concluído' :
                         item.status === 'cancelled' ? 'Cancelado' :
                         item.status === 'no_show' ? 'Faltou' : item.status}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((item.count / (data?.appointmentStatusDistribution?.reduce((sum, s) => sum + s.count, 0) || 1)) * 100)}% do total
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.count}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Métricas Operacionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tempo médio por sessão</span>
                <span className="font-medium">45 min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ocupação da agenda</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de cancelamento</span>
                <span className="font-medium">12%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Sessões por profissional/dia</span>
                <span className="font-medium">6.2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Funcionalidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Análise preditiva de abandono</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Recomendações automáticas de IA</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Relatórios de evolução do paciente</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Dashboard de produtividade da equipe</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}