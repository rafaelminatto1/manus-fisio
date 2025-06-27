import { Metadata } from 'next'
import { CollaborationPanel } from '@/components/ui/collaboration-panel'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export const metadata: Metadata = {
  title: 'Colaboração - Manus Fisio',
  description: 'Colabore em tempo real com sua equipe',
}

export default function CollaborationPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Colaboração</h1>
          <p className="text-muted-foreground">
            Colabore em tempo real com comentários, versões e controle de usuários
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Área principal do documento */}
            <div className="bg-card rounded-lg border p-6 min-h-[600px]">
              <h2 className="text-xl font-semibold mb-4">Documento de Exemplo</h2>
              <div className="prose prose-sm max-w-none">
                <p>
                  Este é um exemplo de documento colaborativo. Aqui você pode ver como funciona
                  o sistema de comentários e versionamento em tempo real.
                </p>
                <h3>Avaliação do Paciente</h3>
                <p>
                  O paciente João Silva, 45 anos, apresenta dor lombar crônica há 6 meses.
                  Durante a avaliação inicial, foram observados:
                </p>
                <ul>
                  <li>Limitação de movimento na flexão lombar</li>
                  <li>Tensão muscular na região paravertebral</li>
                  <li>Fraqueza do core</li>
                </ul>
                <h3>Plano de Tratamento</h3>
                <p>
                  Baseado na avaliação, o plano de tratamento incluirá:
                </p>
                <ol>
                  <li>Exercícios de fortalecimento do core</li>
                  <li>Alongamentos para a cadeia posterior</li>
                  <li>Técnicas de mobilização articular</li>
                  <li>Educação postural</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <CollaborationPanel 
              documentId="doc-exemplo-001"
              documentTitle="Avaliação - João Silva"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 