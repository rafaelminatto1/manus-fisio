import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhysioAnalytics } from '@/components/ui/physio-analytics';
// Se existir, importar AnalyticsDashboard para gráficos gerais
// import AnalyticsDashboard from '@/components/ui/analytics-dashboard';

export default function PhysioDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Fisioterapia</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Cards de métricas rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">--</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avaliações Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">--</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Exercícios Mais Prescritos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">--</span>
          </CardContent>
        </Card>
      </div>
      {/* Gráficos e analytics específicos */}
      <div className="mb-8">
        <PhysioAnalytics />
      </div>
      {/* Placeholder para agenda do dia e pacientes recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Agenda do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-muted-foreground">(Em breve: lista de consultas do dia)</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pacientes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-muted-foreground">(Em breve: lista de pacientes recentes)</span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 