import { Metadata } from 'next';
import AnalyticsDashboard from './_components/analytics-dashboard';

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