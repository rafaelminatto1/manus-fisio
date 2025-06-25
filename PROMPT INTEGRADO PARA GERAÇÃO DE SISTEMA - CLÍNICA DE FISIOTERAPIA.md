# PROMPT INTEGRADO PARA GERAÇÃO DE SISTEMA - CLÍNICA DE FISIOTERAPIA

**Versão:** 3.0 - Integrada e Aprimorada  
**Para:** Cursor AI, Lovable, v0.dev, Claude Artifacts  
**Contexto:** Sistema de Gestão Completo para Clínica de Fisioterapia

## 🎯 CONTEXTO E OBJETIVO

Preciso de um sistema completo de gestão para minha clínica de fisioterapia que combine as melhores funcionalidades do **Notion** (organização hierárquica), **Linear** (gestão de projetos), **Slack** (colaboração), e **Monday.com** (visualizações), mas específico para o contexto médico com conformidade LGPD e funcionalidades de mentoria fisioterapeuta-estagiário.

### Problema Atual
- Equipe usa ferramentas dispersas (WhatsApp, planilhas, papel)
- Falta de organização centralizada de protocolos e procedimentos
- Dificuldade de acompanhar progresso de estagiários
- Ausência de métricas de produtividade da equipe
- Necessidade de conformidade LGPD para dados de saúde

### Solução Desejada
Sistema integrado que combine organização de conhecimento, gestão de projetos, colaboração em tempo real, e analytics de produtividade, com interface moderna dark mode e funcionalidades específicas para fisioterapia.

## 🏗️ ARQUITETURA TÉCNICA OBRIGATÓRIA

### Stack Tecnológico (NÃO NEGOCIÁVEL)
```typescript
// Frontend
Framework: Next.js 14 + TypeScript
UI Library: shadcn/ui + Tailwind CSS
State Management: React Query + Zustand
PWA: Service Worker + Manifest

// Backend
Database: Supabase (PostgreSQL)
Authentication: Supabase Auth + MFA
Storage: Supabase Storage
Real-time: Supabase Realtime

// Deploy
Frontend: Vercel
Backend: Supabase Cloud
CI/CD: GitHub Actions
Monitoring: Sentry
```

### Tema Visual OBRIGATÓRIO
```css
/* Dark Mode Profissional */
:root {
  --background: #0f172a; /* slate-900 */
  --surface: #1e293b; /* slate-800 */
  --surface-hover: #334155; /* slate-700 */
  --primary: #3b82f6; /* blue-500 */
  --primary-hover: #2563eb; /* blue-600 */
  --success: #10b981; /* emerald-500 */
  --warning: #f59e0b; /* amber-500 */
  --error: #ef4444; /* red-500 */
  --text-primary: #f8fafc; /* slate-50 */
  --text-secondary: #cbd5e1; /* slate-300 */
  --border: #475569; /* slate-600 */
}

/* Tipografia */
font-family: 'Inter', sans-serif;
```

## 📚 ESTRUTURA HIERÁRQUICA OBRIGATÓRIA

### Organização Principal
```
🏥 Clínica (Root)
├── 📚 Notebooks (Categorias Principais)
│   ├── 📄 Pages (Tópicos Específicos)
│   │   └── 📝 Sub-pages (Detalhes Granulares)
│   └── 🎯 Projects (Projetos Clínicos)
│       └── ✅ Tasks (Tarefas e Subtarefas)
```

### Notebooks Específicos para Fisioterapia
1. **📋 Protocolos Clínicos**
   - Reabilitação Pós-Cirúrgica
   - Fisioterapia Neurológica
   - Fisioterapia Ortopédica
   - Fisioterapia Respiratória

2. **🎯 Projetos Ativos**
   - Projetos de Pesquisa
   - Casos Clínicos Complexos
   - Programas de Prevenção

3. **👨‍🏫 Mentoria e Ensino**
   - Planos de Estágio
   - Avaliações de Progresso
   - Material Didático

4. **📊 Gestão Operacional**
   - Procedimentos Administrativos
   - Métricas de Qualidade
   - Relatórios Regulatórios

## 👥 SISTEMA DE USUÁRIOS E PERMISSÕES

### Roles Específicos
```typescript
enum UserRole {
  ADMIN = 'admin',           // Acesso total
  FISIOTERAPEUTA = 'fisio',  // Gestão + Mentoria
  ESTAGIARIO = 'estagiario'  // Acesso limitado + Supervisão
}

// Permissões por Role
const PERMISSIONS = {
  admin: ['*'], // Tudo
  fisio: [
    'projects:create,read,update',
    'tasks:manage',
    'documents:manage',
    'mentorship:mentor',
    'analytics:view'
  ],
  estagiario: [
    'projects:read',
    'tasks:read,update_assigned',
    'documents:read,create_basic',
    'mentorship:mentee'
  ]
};
```

## ✨ FUNCIONALIDADES OBRIGATÓRIAS

### 1. Editor Rico (Prioridade Máxima)
```typescript
// Blocos Modulares Obrigatórios
interface Block {
  id: string;
  type: 'text' | 'heading' | 'image' | 'table' | 'checklist' | 'code' | 'embed';
  content: any;
  metadata: {
    created_by: string;
    created_at: Date;
    updated_at: Date;
  };
}

// Funcionalidades Essenciais
- Slash commands (/heading, /table, /checklist)
- Drag & drop para reorganizar blocos
- Colaboração em tempo real
- Templates específicos para fisioterapia
- Versionamento automático
```

### 2. Sistema de Projetos e Tarefas
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  owner_id: string;
  members: string[];
  due_date?: Date;
  created_at: Date;
}

interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string;
  due_date?: Date;
  parent_task_id?: string; // Para subtarefas
  checklist_items?: ChecklistItem[];
}

// Visualizações Obrigatórias
- Kanban Board (estilo Linear)
- Lista com filtros avançados
- Timeline/Gantt para planejamento
- Calendário para prazos
```

### 3. Sistema de Colaboração
```typescript
// Comentários Contextuais
interface Comment {
  id: string;
  content: string;
  author_id: string;
  target_type: 'page' | 'task' | 'project';
  target_id: string;
  parent_comment_id?: string; // Para threads
  mentions: string[]; // IDs dos usuários mencionados
  created_at: Date;
}

// Notificações Inteligentes
interface Notification {
  id: string;
  user_id: string;
  type: 'mention' | 'assignment' | 'deadline' | 'comment' | 'approval';
  title: string;
  content: string;
  action_url?: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
}
```

### 4. Sistema de Mentoria (ESPECÍFICO FISIOTERAPIA)
```typescript
interface Mentorship {
  id: string;
  mentor_id: string; // Fisioterapeuta
  mentee_id: string; // Estagiário
  start_date: Date;
  end_date?: Date;
  goals: string[];
  progress_notes: ProgressNote[];
  evaluations: Evaluation[];
}

interface ProgressNote {
  id: string;
  content: string;
  competencies: string[];
  next_steps: string[];
  created_by: string;
  created_at: Date;
}

// Dashboard de Mentoria
- Progresso do estagiário
- Competências desenvolvidas
- Feedback estruturado
- Plano de desenvolvimento
```

## 📊 DASHBOARD E ANALYTICS

### Métricas Obrigatórias
```typescript
// Dashboard Principal
interface DashboardMetrics {
  projects_active: number;
  tasks_pending: number;
  team_productivity: number;
  compliance_score: number;
  mentorship_progress: MentorshipMetric[];
}

// Analytics Específicos
- Produtividade por fisioterapeuta
- Progresso de estagiários
- Tempo médio de conclusão de tarefas
- Taxa de cumprimento de prazos
- Utilização de templates/protocolos
```

### Visualizações Obrigatórias
- Cards de métricas principais
- Gráficos de tendência (Chart.js ou Recharts)
- Heatmap de atividades
- Progress bars para projetos
- Timeline de atividades recentes

## 🔒 SEGURANÇA E COMPLIANCE LGPD

### Implementação Obrigatória
```sql
-- Row Level Security (RLS)
CREATE POLICY "Users can only see their own data" ON projects
  FOR ALL USING (
    owner_id = auth.uid() OR 
    auth.uid() = ANY(members)
  );

-- Auditoria Completa
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Funcionalidades LGPD
- Consentimento granular para cada funcionalidade
- Exportação de dados pessoais (JSON/PDF)
- Anonimização automática de dados antigos
- Log de acesso a dados sensíveis
- Interface para exercer direitos do titular

## 📱 PWA E MOBILE

### Funcionalidades Obrigatórias
```typescript
// Service Worker para Offline
- Cache de páginas visitadas recentemente
- Sincronização automática quando online
- Notificações push para tarefas urgentes
- Instalação como app nativo

// Otimizações Mobile
- Touch gestures para navegação
- Interface responsiva (mobile-first)
- Carregamento otimizado para 3G
- Modo offline para leitura
```

## 🎨 COMPONENTES UI ESPECÍFICOS

### Layout Principal
```tsx
// Estrutura Obrigatória
<div className="flex h-screen bg-slate-900">
  {/* Sidebar Expansível */}
  <Sidebar className="w-64 border-r border-slate-700">
    <Navigation />
    <NotebookTree />
    <QuickActions />
  </Sidebar>
  
  {/* Área Principal */}
  <main className="flex-1 flex flex-col">
    <Header className="border-b border-slate-700">
      <Breadcrumbs />
      <SearchGlobal />
      <UserMenu />
    </Header>
    
    <div className="flex-1 overflow-hidden">
      {/* Conteúdo Principal */}
      <ContentArea />
      
      {/* Painel Lateral (Opcional) */}
      <RightPanel />
    </div>
  </main>
</div>
```

### Componentes Específicos
```tsx
// Editor de Blocos
<BlockEditor
  blocks={blocks}
  onChange={handleBlocksChange}
  collaboration={true}
  templates={physiotherapyTemplates}
/>

// Kanban Board
<KanbanBoard
  columns={['Todo', 'Em Progresso', 'Revisão', 'Concluído']}
  tasks={tasks}
  onTaskMove={handleTaskMove}
  onTaskCreate={handleTaskCreate}
/>

// Dashboard de Mentoria
<MentorshipDashboard
  mentorships={mentorships}
  metrics={mentorshipMetrics}
  onProgressUpdate={handleProgressUpdate}
/>
```

## 📋 TEMPLATES ESPECÍFICOS FISIOTERAPIA

### Templates Obrigatórios
1. **Protocolo de Reabilitação**
   - Objetivos do tratamento
   - Exercícios prescritos
   - Progressão esperada
   - Critérios de alta

2. **Avaliação de Estagiário**
   - Competências técnicas
   - Habilidades interpessoais
   - Áreas de melhoria
   - Plano de desenvolvimento

3. **Plano de Tratamento**
   - Diagnóstico fisioterapêutico
   - Metas funcionais
   - Intervenções planejadas
   - Cronograma de reavaliação

4. **Relatório de Progresso**
   - Status atual do paciente
   - Evolução desde última avaliação
   - Ajustes no tratamento
   - Próximos passos

## 🚀 CRONOGRAMA DE IMPLEMENTAÇÃO

### Fase 1 - Core (Semanas 1-3)
- [ ] Setup Next.js 14 + TypeScript + Supabase
- [ ] Implementar design system dark mode
- [ ] Sistema de autenticação com MFA
- [ ] CRUD básico de notebooks/pages
- [ ] Editor básico com blocos modulares

### Fase 2 - Gestão (Semanas 4-6)
- [ ] Sistema completo de projetos e tarefas
- [ ] Kanban board interativo
- [ ] Sistema de permissões (RBAC)
- [ ] Dashboard básico com métricas
- [ ] Notificações em tempo real

### Fase 3 - Colaboração (Semanas 7-9)
- [ ] Comentários e menções
- [ ] Edição colaborativa em tempo real
- [ ] Sistema de mentoria fisio-estagiário
- [ ] Upload e gestão de arquivos
- [ ] Templates específicos fisioterapia

### Fase 4 - Otimização (Semanas 10-12)
- [ ] PWA com funcionalidades offline
- [ ] Analytics avançado e relatórios
- [ ] Otimizações de performance
- [ ] Compliance LGPD completo
- [ ] Testes e refinamentos finais

## ✅ CRITÉRIOS DE SUCESSO

### Técnicos
- [ ] Performance: Carregamento < 2s, FCP < 1s
- [ ] Segurança: Auditoria completa, RLS implementado
- [ ] Acessibilidade: WCAG 2.1 AA compliance
- [ ] Mobile: Funciona perfeitamente em dispositivos móveis
- [ ] Offline: Funcionalidades básicas disponíveis offline

### Funcionais
- [ ] Fisioterapeuta consegue criar e gerenciar projetos
- [ ] Estagiário consegue acompanhar tarefas e receber mentoria
- [ ] Admin consegue visualizar métricas e relatórios
- [ ] Colaboração em tempo real funciona sem conflitos
- [ ] Templates aceleram criação de conteúdo

### Negócio
- [ ] Redução de 50% no tempo de organização de informações
- [ ] Aumento de 30% na produtividade da equipe
- [ ] 100% de conformidade LGPD
- [ ] Satisfação do usuário > 4.5/5
- [ ] Adoção pela equipe > 90% em 30 dias

## 🎯 FOCO ESPECÍFICO PARA IMPLEMENTAÇÃO

### Prioridade Máxima (Implementar Primeiro)
1. **Sistema de Autenticação** com roles específicos
2. **Editor de Blocos** com templates fisioterapia
3. **Organização Hierárquica** (Notebooks → Pages)
4. **Kanban Board** para gestão de tarefas
5. **Dashboard** com métricas básicas

### Prioridade Alta (Segunda Iteração)
1. **Colaboração em Tempo Real** (comentários + edição)
2. **Sistema de Mentoria** fisio-estagiário
3. **Notificações Inteligentes**
4. **PWA** com funcionalidades offline
5. **Analytics** de produtividade

### Prioridade Média (Terceira Iteração)
1. **Templates Avançados** específicos fisioterapia
2. **Integração Calendário** para agendamentos
3. **Relatórios Automáticos** LGPD
4. **Otimizações Performance** avançadas
5. **Funcionalidades Admin** completas

---

## 💡 DICAS IMPORTANTES PARA IMPLEMENTAÇÃO

1. **Use o projeto base Notion Spark Studio** como ponto de partida (70% aproveitamento)
2. **Implemente RLS desde o início** - não deixe para depois
3. **Teste colaboração em tempo real** com múltiplos usuários
4. **Valide templates** com fisioterapeutas reais
5. **Monitore performance** desde o desenvolvimento

**Este prompt foi criado para gerar um sistema robusto, específico para fisioterapia, com foco em produtividade, colaboração e conformidade. Use-o como base e adapte conforme necessário para sua ferramenta específica.**

