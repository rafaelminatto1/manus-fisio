'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Stethoscope, Activity, Target } from 'lucide-react'

export interface Template {
  id: string
  name: string
  description: string
  icon: any
  content: string
}

export const templates: Template[] = [
  {
    id: 'avaliacao',
    name: 'Avaliação Inicial',
    description: 'Template para primeira consulta',
    icon: Stethoscope,
    content: `<h1>Avaliação Fisioterapêutica</h1>
<h2>Dados do Paciente</h2>
<p><strong>Nome:</strong> </p>
<p><strong>Idade:</strong> </p>
<p><strong>Data:</strong> </p>

<h2>Queixa Principal</h2>
<p></p>

<h2>Exame Físico</h2>
<p></p>

<h2>Diagnóstico</h2>
<p></p>

<h2>Plano de Tratamento</h2>
<p></p>`
  },
  {
    id: 'evolucao',
    name: 'Evolução',
    description: 'Registro de progresso',
    icon: Activity,
    content: `<h1>Evolução Fisioterapêutica</h1>
<p><strong>Data:</strong> </p>
<p><strong>Sessão:</strong> </p>

<h2>Estado do Paciente</h2>
<p></p>

<h2>Técnicas Utilizadas</h2>
<p></p>

<h2>Progressos</h2>
<p></p>

<h2>Orientações</h2>
<p></p>`
  },
  {
    id: 'exercicios',
    name: 'Protocolo de Exercícios',
    description: 'Prescrição de exercícios',
    icon: Target,
    content: `<h1>Protocolo de Exercícios</h1>
<p><strong>Paciente:</strong> </p>
<p><strong>Data:</strong> </p>

<h2>Objetivos</h2>
<ul>
<li>Fortalecimento</li>
<li>Flexibilidade</li>
<li>Coordenação</li>
</ul>

<h2>Exercícios</h2>
<p></p>

<h2>Orientações</h2>
<p></p>`
  }
]

interface TemplateCardProps {
  template: Template
  onSelect: (template: Template) => void
}

const TemplateCard = ({ template, onSelect }: TemplateCardProps) => {
  const Icon = template.icon

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelect(template)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

interface TemplatesSelectorProps {
  onSelectTemplate: (template: Template) => void
  className?: string
}

export const TemplatesSelector = ({ onSelectTemplate, className = '' }: TemplatesSelectorProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">Templates de Fisioterapia</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map(template => (
          <TemplateCard 
            key={template.id} 
            template={template} 
            onSelect={onSelectTemplate} 
          />
        ))}
      </div>
    </div>
  )
}

export default TemplatesSelector
