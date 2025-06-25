# Arquitetura do Sistema - Gestão de Tarefas e Equipe para Clínica de Fisioterapia

**Autor:** Manus AI  
**Data:** 25 de junho de 2025  
**Versão:** 1.0

## Sumário Executivo

Este documento apresenta a arquitetura técnica completa para o sistema de gestão de tarefas e equipe desenvolvido especificamente para uma clínica de fisioterapia. O sistema será construído aproveitando a base sólida do projeto Notion Spark Studio existente, adaptando suas funcionalidades avançadas para atender às necessidades específicas do ambiente clínico.

A arquitetura proposta combina as melhores práticas de desenvolvimento moderno com funcionalidades específicas para gestão de equipes médicas, documentação de procedimentos, colaboração em tempo real e auditoria completa de atividades. O sistema suportará uma equipe de 7 pessoas (1 administrador, 2 fisioterapeutas e 4 estagiários) com potencial de escalabilidade para crescimento futuro.

## 1. Visão Geral da Arquitetura

### 1.1 Princípios Arquiteturais

A arquitetura do sistema baseia-se em cinco princípios fundamentais que garantem robustez, escalabilidade e manutenibilidade:

**Modularidade e Separação de Responsabilidades**: O sistema é estruturado em módulos independentes e bem definidos, cada um responsável por um conjunto específico de funcionalidades. Esta abordagem facilita a manutenção, testes e evolução do sistema, permitindo que diferentes partes sejam desenvolvidas e atualizadas independentemente.

**Performance e Responsividade**: Todas as decisões arquiteturais priorizam a experiência do usuário através de carregamento rápido, interações fluidas e sincronização em tempo real. O sistema utiliza técnicas avançadas como lazy loading, code splitting, cache inteligente e otimizações específicas para dispositivos móveis.

**Segurança e Conformidade**: Considerando o contexto médico, a arquitetura implementa múltiplas camadas de segurança, incluindo autenticação multifator, controle de acesso granular, criptografia de dados e auditoria completa de atividades, garantindo conformidade com a LGPD e padrões de segurança para dados de saúde.

**Escalabilidade Horizontal e Vertical**: A arquitetura suporta crescimento tanto em número de usuários quanto em volume de dados, utilizando tecnologias cloud-native que permitem escalonamento automático conforme a demanda.

**Experiência do Usuário Centrada**: Cada componente é projetado priorizando a usabilidade, acessibilidade e eficiência operacional específica para profissionais de saúde, com interfaces intuitivas e workflows otimizados para o contexto clínico.

### 1.2 Stack Tecnológico

A escolha do stack tecnológico baseia-se na necessidade de aproveitar o projeto existente enquanto garante performance, segurança e manutenibilidade:

**Frontend Framework**: Next.js 14 com App Router oferece renderização híbrida (SSR/SSG/CSR), otimizações automáticas de performance, roteamento avançado e excelente experiência de desenvolvimento. A escolha mantém compatibilidade com o projeto base enquanto oferece recursos modernos como Server Components e streaming.

**Linguagem de Programação**: TypeScript fornece tipagem estática que reduz bugs, melhora a experiência de desenvolvimento e facilita refatorações em um sistema complexo. A tipagem é especialmente importante em um contexto médico onde precisão é crítica.

**Interface de Usuário**: shadcn/ui baseado em Radix UI oferece componentes acessíveis, customizáveis e bem testados. Tailwind CSS permite estilização eficiente e consistente, com design system facilmente adaptável para a identidade visual da clínica.

**Backend e Banco de Dados**: Supabase fornece PostgreSQL gerenciado com recursos avançados como Row Level Security, real-time subscriptions, autenticação integrada e APIs automáticas. Esta escolha elimina a necessidade de gerenciar infraestrutura de banco de dados enquanto oferece recursos enterprise.

**Deploy e Hospedagem**: Vercel oferece deploy automático, CDN global, edge computing e otimizações específicas para Next.js. A integração nativa com GitHub permite CI/CD automático e preview deployments para cada pull request.

### 1.3 Arquitetura de Alto Nível

O sistema segue uma arquitetura de três camadas com separação clara de responsabilidades:

**Camada de Apresentação (Frontend)**: Responsável pela interface do usuário, interações, validações client-side e experiência do usuário. Implementada como uma Single Page Application (SPA) com Progressive Web App (PWA) capabilities para funcionalidade offline.

**Camada de Aplicação (API Layer)**: Gerencia a lógica de negócio, autenticação, autorização, validações server-side e orquestração de serviços. Implementada através de Next.js API Routes e Supabase Edge Functions.

**Camada de Dados (Database Layer)**: Responsável pelo armazenamento, recuperação e integridade dos dados. Utiliza PostgreSQL com Row Level Security para controle de acesso granular e triggers para automações.

## 2. Arquitetura do Frontend

### 2.1 Estrutura de Componentes

A arquitetura do frontend segue o padrão de componentes modulares com hierarquia bem definida:

**Componentes de Layout**: Responsáveis pela estrutura geral da aplicação, incluindo navegação, sidebar, header e footer. Estes componentes são reutilizados em todas as páginas e mantêm estado global da aplicação.

**Componentes de Página**: Representam as diferentes telas do sistema (dashboard, projetos, tarefas, equipe). Cada página é um componente de alto nível que orquestra componentes menores e gerencia estado específico da página.

**Componentes de Funcionalidade**: Implementam funcionalidades específicas como editor de texto, sistema de comentários, calendário, gráficos e formulários. São reutilizáveis e podem ser compostos para criar interfaces complexas.

**Componentes de UI Base**: Elementos fundamentais como botões, inputs, modais, tooltips baseados no design system. Garantem consistência visual e comportamental em toda a aplicação.

### 2.2 Gerenciamento de Estado

O gerenciamento de estado utiliza uma abordagem híbrida que combina diferentes estratégias conforme a necessidade:

**Estado Local**: Gerenciado através de React hooks (useState, useReducer) para estado específico de componentes que não precisa ser compartilhado.

**Estado Global**: Implementado através de React Context API para dados que precisam ser acessados por múltiplos componentes, como informações do usuário logado, configurações da aplicação e estado de colaboração.

**Estado do Servidor**: Gerenciado através de React Query (TanStack Query) para cache inteligente de dados do servidor, sincronização automática, invalidação de cache e otimistic updates.

**Estado de Tempo Real**: Implementado através de Supabase real-time subscriptions para sincronização automática de dados entre usuários, incluindo edição colaborativa e notificações em tempo real.

### 2.3 Roteamento e Navegação

O sistema de roteamento utiliza o App Router do Next.js 14 com as seguintes características:

**Roteamento Baseado em Arquivos**: Estrutura intuitiva onde a organização de pastas reflete a estrutura de URLs da aplicação.

**Layouts Aninhados**: Permite reutilização de componentes de layout em diferentes níveis da aplicação, otimizando performance e experiência do usuário.

**Loading States**: Implementação de estados de carregamento granulares que melhoram a percepção de performance.

**Error Boundaries**: Tratamento de erros em diferentes níveis da aplicação com fallbacks apropriados.

### 2.4 Progressive Web App (PWA)

A implementação PWA garante experiência nativa em dispositivos móveis:

**Service Worker**: Implementa cache inteligente, sincronização em background e funcionalidade offline.

**App Manifest**: Define metadados da aplicação para instalação em dispositivos móveis.

**Push Notifications**: Sistema de notificações push para alertas importantes mesmo quando a aplicação não está aberta.

**Offline Capability**: Funcionalidade básica disponível mesmo sem conexão com internet, com sincronização automática quando a conexão é restaurada.

## 3. Arquitetura do Backend

### 3.1 Supabase como Backend-as-a-Service

A escolha do Supabase como backend oferece vantagens significativas para o projeto:

**PostgreSQL Gerenciado**: Banco de dados relacional robusto com recursos avançados como JSON support, full-text search, triggers e stored procedures.

**Autenticação Integrada**: Sistema completo de autenticação com suporte a múltiplos provedores, MFA, e integração nativa com Row Level Security.

**APIs Automáticas**: Geração automática de APIs REST e GraphQL baseadas no schema do banco de dados.

**Real-time Subscriptions**: Sincronização em tempo real de dados entre clientes através de WebSockets.

**Edge Functions**: Execução de código server-side próximo aos usuários para melhor performance.

### 3.2 Arquitetura de Dados

O design do banco de dados segue princípios de normalização e otimização para o contexto clínico:

**Entidades Principais**: Users, Projects, Tasks, Documents, Comments, Notifications, Audit_Logs.

**Relacionamentos**: Definidos através de foreign keys com constraints apropriadas para garantir integridade referencial.

**Índices**: Estrategicamente posicionados para otimizar queries frequentes, especialmente busca e filtros.

**Triggers**: Implementam lógica de negócio no banco de dados para auditoria, notificações e validações.

### 3.3 Segurança e Controle de Acesso

A segurança é implementada em múltiplas camadas:

**Row Level Security (RLS)**: Controle de acesso granular implementado diretamente no banco de dados.

**Políticas de Segurança**: Definidas para cada tabela baseadas em roles de usuário e contexto de acesso.

**Auditoria Completa**: Todas as operações são registradas para compliance e rastreabilidade.

**Criptografia**: Dados sensíveis são criptografados tanto em trânsito quanto em repouso.

## 4. Integração e APIs

### 4.1 APIs Internas

O sistema expõe APIs internas para comunicação entre frontend e backend:

**REST APIs**: Para operações CRUD básicas e endpoints específicos de funcionalidades.

**GraphQL**: Para queries complexas e otimização de transferência de dados.

**WebSocket APIs**: Para comunicação em tempo real e colaboração.

### 4.2 Integrações Externas

O sistema suporta integrações com serviços externos relevantes para o contexto clínico:

**Calendário**: Integração com Google Calendar e Outlook para sincronização de agendamentos.

**Email**: Sistema de notificações por email através de provedores como SendGrid ou Resend.

**Armazenamento de Arquivos**: Integração com Supabase Storage para upload e gestão de documentos.

**Backup**: Integração com serviços de backup automático para garantir continuidade do negócio.

## 5. Performance e Otimização

### 5.1 Estratégias de Performance

O sistema implementa múltiplas estratégias para garantir performance otimizada:

**Code Splitting**: Divisão do código em chunks menores carregados sob demanda.

**Lazy Loading**: Carregamento tardio de componentes e recursos não críticos.

**Image Optimization**: Otimização automática de imagens através do Next.js Image component.

**Caching**: Múltiplas camadas de cache incluindo browser cache, CDN cache e application cache.

### 5.2 Monitoramento e Métricas

Sistema completo de monitoramento para garantir performance consistente:

**Core Web Vitals**: Monitoramento de métricas de performance do usuário.

**Error Tracking**: Captura e análise de erros em produção.

**Performance Monitoring**: Métricas de performance do servidor e banco de dados.

**User Analytics**: Análise de comportamento do usuário para otimizações futuras.

## 6. Segurança e Compliance

### 6.1 Segurança da Aplicação

Implementação de múltiplas camadas de segurança:

**Autenticação Multifator**: Obrigatória para todos os usuários.

**Controle de Sessão**: Gestão segura de sessões com timeout automático.

**Validação de Input**: Sanitização e validação de todos os inputs do usuário.

**Headers de Segurança**: Implementação de headers HTTP de segurança.

### 6.2 Compliance LGPD

Conformidade com a Lei Geral de Proteção de Dados:

**Consentimento**: Gestão de consentimento para coleta e processamento de dados.

**Direitos do Titular**: Implementação de funcionalidades para exercício de direitos.

**Minimização de Dados**: Coleta apenas de dados necessários para a funcionalidade.

**Auditoria**: Log completo de acesso e modificação de dados pessoais.

## 7. Deployment e DevOps

### 7.1 Pipeline de CI/CD

Implementação de pipeline automatizado para deploy:

**Integração Contínua**: Testes automáticos em cada commit.

**Deploy Automático**: Deploy automático para staging e produção.

**Preview Deployments**: Ambientes temporários para cada pull request.

**Rollback**: Capacidade de rollback rápido em caso de problemas.

### 7.2 Monitoramento de Produção

Sistema completo de monitoramento para ambiente de produção:

**Health Checks**: Verificações automáticas de saúde da aplicação.

**Alertas**: Sistema de alertas para problemas críticos.

**Logs**: Centralização e análise de logs da aplicação.

**Backup**: Estratégia de backup automático e recovery.

---

*Este documento será expandido nas próximas seções com detalhes específicos de modelagem de dados, especificações técnicas e guias de implementação.*


## 8. Modelagem Detalhada do Banco de Dados

### 8.1 Visão Geral do Modelo de Dados

O modelo de dados foi projetado especificamente para atender às necessidades de uma clínica de fisioterapia, incorporando conceitos de gestão de projetos, colaboração em equipe e documentação médica. A estrutura relacional garante integridade dos dados enquanto permite flexibilidade para diferentes tipos de projetos e workflows clínicos.

O banco de dados utiliza PostgreSQL como sistema de gerenciamento, aproveitando recursos avançados como tipos de dados JSON para flexibilidade, full-text search para busca semântica, triggers para automações e Row Level Security para controle de acesso granular. Esta escolha tecnológica permite que o sistema evolua conforme as necessidades da clínica sem comprometer performance ou segurança.

### 8.2 Entidades Principais e Relacionamentos

#### 8.2.1 Tabela Users (Usuários)

A tabela Users representa todos os profissionais da clínica e é o núcleo do sistema de autenticação e autorização:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'estagiario',
    specialties TEXT[],
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TYPE user_role AS ENUM ('admin', 'fisioterapeuta', 'estagiario');
```

Esta estrutura suporta os três tipos de usuários da clínica: administrador (proprietário), fisioterapeutas e estagiários. O campo `specialties` permite armazenar múltiplas especialidades para cada profissional, enquanto `metadata` oferece flexibilidade para armazenar informações adicionais específicas como certificações, experiência ou preferências de trabalho.

#### 8.2.2 Tabela Projects (Projetos)

A tabela Projects representa os projetos clínicos, que podem variar desde tratamentos individuais até iniciativas de melhoria de processos:

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    priority project_priority DEFAULT 'medium',
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    patient_info JSONB,
    treatment_protocol JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE
);

CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
```

O design flexível permite que projetos representem diferentes tipos de trabalho clínico. O campo `patient_info` pode armazenar informações relevantes do paciente (respeitando LGPD), enquanto `treatment_protocol` pode conter protocolos específicos de tratamento. A estrutura de tags facilita categorização e busca.

#### 8.2.3 Tabela Project_Members (Membros do Projeto)

Esta tabela implementa o relacionamento many-to-many entre usuários e projetos, definindo roles específicos dentro de cada projeto:

```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role member_role NOT NULL,
    permissions TEXT[],
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, user_id)
);

CREATE TYPE member_role AS ENUM ('owner', 'responsible', 'participant', 'observer');
```

Esta estrutura permite que um usuário tenha diferentes roles em diferentes projetos. Por exemplo, um fisioterapeuta pode ser responsável por um projeto de reabilitação enquanto participa como colaborador em um projeto de pesquisa. O campo `permissions` permite controle granular de acesso por projeto.

#### 8.2.4 Tabela Tasks (Tarefas)

A tabela Tasks é o coração operacional do sistema, representando todas as atividades que precisam ser executadas:

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    checklist JSONB,
    attachments JSONB,
    custom_fields JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
```

A estrutura hierárquica através de `parent_task_id` permite decomposição de tarefas complexas em subtarefas. O campo `checklist` armazena listas de verificação específicas para procedimentos clínicos, enquanto `custom_fields` oferece flexibilidade para diferentes tipos de tarefas. O controle de tempo através de `estimated_hours` e `actual_hours` facilita análise de produtividade.

#### 8.2.5 Tabela Documents (Documentos)

A tabela Documents gerencia toda a documentação clínica e procedimentos:

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    content_type document_type DEFAULT 'markdown',
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    is_template BOOLEAN DEFAULT false,
    template_category VARCHAR(100),
    tags TEXT[],
    metadata JSONB,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE document_type AS ENUM ('markdown', 'rich_text', 'form', 'checklist', 'protocol');
```

Esta estrutura suporta diferentes tipos de documentos clínicos, desde protocolos de tratamento até formulários de avaliação. O versionamento através de `parent_document_id` mantém histórico de alterações, essencial para auditoria médica. O sistema de templates facilita padronização de procedimentos.

#### 8.2.6 Tabela Comments (Comentários)

Sistema de comunicação contextual integrado às tarefas e documentos:

```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    mentions UUID[],
    attachments JSONB,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);
```

O sistema de comentários permite comunicação contextual em projetos, tarefas e documentos. O campo `mentions` armazena IDs de usuários mencionados para notificações automáticas. O flag `is_internal` permite comentários privados da equipe separados de comunicações com pacientes.

#### 8.2.7 Tabela Notifications (Notificações)

Sistema completo de notificações para manter a equipe informada:

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE notification_type AS ENUM ('task_assigned', 'task_completed', 'comment_added', 'mention', 'deadline_approaching', 'project_updated', 'system');
```

O sistema de notificações suporta diferentes tipos de alertas relevantes para o contexto clínico. O campo `entity_type` e `entity_id` permitem linking direto para o objeto relacionado, facilitando navegação contextual.

#### 8.2.8 Tabela Activity_Logs (Logs de Atividade)

Auditoria completa de todas as ações no sistema:

```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Esta tabela mantém registro completo de todas as modificações no sistema, essencial para compliance médico e rastreabilidade. Os campos `old_values` e `new_values` permitem reconstruir o histórico completo de qualquer entidade.

### 8.3 Índices e Otimizações

Para garantir performance otimizada, especialmente com crescimento de dados, são implementados índices estratégicos:

```sql
-- Índices para queries frequentes
CREATE INDEX idx_projects_owner_status ON projects(owner_id, status);
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status);
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX idx_comments_entity ON comments(task_id, document_id, project_id);
CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id, is_read);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Índices para busca full-text
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_documents_search ON documents USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(content, '')));

-- Índices para arrays e JSONB
CREATE INDEX idx_projects_tags ON projects USING gin(tags);
CREATE INDEX idx_tasks_tags ON tasks USING gin(tags);
CREATE INDEX idx_documents_metadata ON documents USING gin(metadata);
```

### 8.4 Triggers e Automações

O sistema implementa triggers para automações críticas:

```sql
-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para log de atividades
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (
        current_setting('app.current_user_id', true)::uuid,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Aplicar trigger de auditoria
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON documents FOR EACH ROW EXECUTE FUNCTION log_activity();
```

### 8.5 Row Level Security (RLS)

Implementação de segurança granular baseada em roles e contexto:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para projetos
CREATE POLICY "Users can view projects they are members of" ON projects
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM project_members 
            WHERE project_id = projects.id
        )
    );

CREATE POLICY "Project owners can update their projects" ON projects
    FOR UPDATE USING (auth.uid() = owner_id);

-- Políticas para tarefas
CREATE POLICY "Users can view tasks in their projects" ON tasks
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Assigned users can update their tasks" ON tasks
    FOR UPDATE USING (
        auth.uid() = assignee_id OR 
        auth.uid() IN (
            SELECT user_id FROM project_members 
            WHERE project_id = tasks.project_id 
            AND role IN ('owner', 'responsible')
        )
    );

-- Políticas para notificações
CREATE POLICY "Users can only see their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);
```

### 8.6 Funções Auxiliares

Implementação de funções específicas para lógica de negócio:

```sql
-- Função para calcular progresso do projeto
CREATE OR REPLACE FUNCTION calculate_project_progress(project_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tasks 
    FROM tasks 
    WHERE project_id = project_uuid AND status != 'cancelled';
    
    SELECT COUNT(*) INTO completed_tasks 
    FROM tasks 
    WHERE project_id = project_uuid AND status = 'completed';
    
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN ROUND((completed_tasks::DECIMAL / total_tasks::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Função para obter carga de trabalho do usuário
CREATE OR REPLACE FUNCTION get_user_workload(user_uuid UUID)
RETURNS TABLE(
    active_projects INTEGER,
    assigned_tasks INTEGER,
    overdue_tasks INTEGER,
    this_week_tasks INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT project_id) FROM project_members WHERE user_id = user_uuid)::INTEGER,
        (SELECT COUNT(*) FROM tasks WHERE assignee_id = user_uuid AND status IN ('todo', 'in_progress'))::INTEGER,
        (SELECT COUNT(*) FROM tasks WHERE assignee_id = user_uuid AND due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled'))::INTEGER,
        (SELECT COUNT(*) FROM tasks WHERE assignee_id = user_uuid AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days')::INTEGER;
END;
$$ LANGUAGE plpgsql;
```

### 8.7 Views Materializadas

Para otimizar queries complexas frequentes:

```sql
-- View para dashboard de projetos
CREATE MATERIALIZED VIEW project_dashboard AS
SELECT 
    p.id,
    p.title,
    p.status,
    p.priority,
    p.owner_id,
    p.due_date,
    calculate_project_progress(p.id) as progress,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_tasks,
    COUNT(pm.user_id) as team_size
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN project_members pm ON p.id = pm.project_id
WHERE p.archived_at IS NULL
GROUP BY p.id, p.title, p.status, p.priority, p.owner_id, p.due_date;

-- Índice para a view materializada
CREATE UNIQUE INDEX idx_project_dashboard_id ON project_dashboard(id);

-- Função para refresh automático
CREATE OR REPLACE FUNCTION refresh_project_dashboard()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY project_dashboard;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para refresh automático
CREATE TRIGGER refresh_dashboard_on_project_change
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH STATEMENT EXECUTE FUNCTION refresh_project_dashboard();
```

Esta modelagem de dados robusta fornece a base sólida necessária para todas as funcionalidades do sistema, garantindo performance, segurança e flexibilidade para evolução futura conforme as necessidades da clínica.


## 9. Especificações de APIs e Integrações

### 9.1 Arquitetura de APIs

O sistema implementa uma arquitetura de APIs híbrida que combina REST, GraphQL e WebSocket para atender diferentes necessidades de comunicação. Esta abordagem garante flexibilidade, performance e experiência de usuário otimizada para diferentes tipos de operações.

**REST APIs** são utilizadas para operações CRUD básicas e endpoints específicos que seguem padrões convencionais. Esta escolha facilita integração com ferramentas externas e mantém compatibilidade com padrões da indústria. **GraphQL** é implementado para queries complexas que envolvem múltiplas entidades relacionadas, permitindo que o frontend solicite exatamente os dados necessários e reduzindo over-fetching. **WebSocket** é utilizado para comunicação em tempo real, incluindo colaboração simultânea, notificações push e sincronização de estado entre múltiplos usuários.

### 9.2 REST API Endpoints

#### 9.2.1 Autenticação e Usuários

```typescript
// Autenticação
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password

// Gestão de usuários
GET /api/users                    // Listar usuários (admin only)
GET /api/users/me                 // Perfil do usuário atual
PUT /api/users/me                 // Atualizar perfil
GET /api/users/:id                // Obter usuário específico
PUT /api/users/:id                // Atualizar usuário (admin only)
DELETE /api/users/:id             // Desativar usuário (admin only)
GET /api/users/:id/workload       // Carga de trabalho do usuário
```

#### 9.2.2 Projetos

```typescript
// CRUD de projetos
GET /api/projects                 // Listar projetos do usuário
POST /api/projects                // Criar novo projeto
GET /api/projects/:id             // Obter projeto específico
PUT /api/projects/:id             // Atualizar projeto
DELETE /api/projects/:id          // Arquivar projeto
GET /api/projects/:id/progress    // Progresso do projeto

// Membros do projeto
GET /api/projects/:id/members     // Listar membros
POST /api/projects/:id/members    // Adicionar membro
PUT /api/projects/:id/members/:userId  // Atualizar role do membro
DELETE /api/projects/:id/members/:userId  // Remover membro

// Templates de projeto
GET /api/projects/templates       // Listar templates disponíveis
POST /api/projects/templates      // Criar template
POST /api/projects/from-template/:templateId  // Criar projeto a partir de template
```

#### 9.2.3 Tarefas

```typescript
// CRUD de tarefas
GET /api/tasks                    // Listar tarefas (com filtros)
POST /api/tasks                   // Criar nova tarefa
GET /api/tasks/:id                // Obter tarefa específica
PUT /api/tasks/:id                // Atualizar tarefa
DELETE /api/tasks/:id             // Excluir tarefa
POST /api/tasks/:id/duplicate     // Duplicar tarefa

// Operações específicas
PUT /api/tasks/:id/assign         // Atribuir tarefa
PUT /api/tasks/:id/status         // Atualizar status
POST /api/tasks/:id/time-log      // Registrar tempo trabalhado
GET /api/tasks/:id/time-logs      // Histórico de tempo

// Subtarefas
GET /api/tasks/:id/subtasks       // Listar subtarefas
POST /api/tasks/:id/subtasks      // Criar subtarefa
```

#### 9.2.4 Documentos

```typescript
// CRUD de documentos
GET /api/documents                // Listar documentos
POST /api/documents               // Criar documento
GET /api/documents/:id            // Obter documento
PUT /api/documents/:id            // Atualizar documento
DELETE /api/documents/:id         // Excluir documento

// Versionamento
GET /api/documents/:id/versions   // Histórico de versões
POST /api/documents/:id/versions  // Criar nova versão
GET /api/documents/:id/versions/:version  // Obter versão específica

// Templates
GET /api/documents/templates      // Listar templates
POST /api/documents/templates     // Criar template
POST /api/documents/from-template/:templateId  // Criar documento a partir de template
```

#### 9.2.5 Comentários e Comunicação

```typescript
// Comentários
GET /api/comments                 // Listar comentários (por entidade)
POST /api/comments                // Criar comentário
PUT /api/comments/:id             // Atualizar comentário
DELETE /api/comments/:id          // Excluir comentário

// Notificações
GET /api/notifications            // Listar notificações do usuário
PUT /api/notifications/:id/read   // Marcar como lida
PUT /api/notifications/read-all   // Marcar todas como lidas
DELETE /api/notifications/:id     // Excluir notificação
```

#### 9.2.6 Relatórios e Analytics

```typescript
// Dashboard
GET /api/dashboard/overview       // Visão geral do dashboard
GET /api/dashboard/projects       // Métricas de projetos
GET /api/dashboard/tasks          // Métricas de tarefas
GET /api/dashboard/team           // Métricas da equipe

// Relatórios
GET /api/reports/productivity     // Relatório de produtividade
GET /api/reports/workload         // Relatório de carga de trabalho
GET /api/reports/project-timeline // Timeline de projetos
POST /api/reports/custom          // Relatório customizado
```

### 9.3 GraphQL Schema

O schema GraphQL é projetado para otimizar queries complexas e reduzir round-trips:

```graphql
type User {
  id: ID!
  email: String!
  fullName: String!
  role: UserRole!
  specialties: [String!]!
  avatar: String
  isActive: Boolean!
  projects: [ProjectMember!]!
  assignedTasks: [Task!]!
  createdTasks: [Task!]!
  workload: UserWorkload!
}

type Project {
  id: ID!
  title: String!
  description: String
  status: ProjectStatus!
  priority: ProjectPriority!
  owner: User!
  members: [ProjectMember!]!
  tasks: [Task!]!
  documents: [Document!]!
  progress: Float!
  startDate: Date
  dueDate: Date
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: TaskPriority!
  project: Project!
  assignee: User
  reporter: User!
  subtasks: [Task!]!
  parentTask: Task
  estimatedHours: Float
  actualHours: Float
  startDate: Date
  dueDate: Date
  completedAt: DateTime
  comments: [Comment!]!
  attachments: [Attachment!]!
  checklist: [ChecklistItem!]!
  customFields: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Document {
  id: ID!
  title: String!
  content: String!
  contentType: DocumentType!
  project: Project
  task: Task
  author: User!
  version: Int!
  parentDocument: Document
  isTemplate: Boolean!
  templateCategory: String
  tags: [String!]!
  metadata: JSON
  publishedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  project: Project
  task: Task
  document: Document
  parentComment: Comment
  replies: [Comment!]!
  mentions: [User!]!
  attachments: [Attachment!]!
  isInternal: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Queries principais
type Query {
  # Usuários
  me: User!
  user(id: ID!): User
  users(filter: UserFilter): [User!]!
  
  # Projetos
  projects(filter: ProjectFilter): [Project!]!
  project(id: ID!): Project
  projectTemplates: [ProjectTemplate!]!
  
  # Tarefas
  tasks(filter: TaskFilter): [Task!]!
  task(id: ID!): Task
  myTasks(status: TaskStatus): [Task!]!
  
  # Documentos
  documents(filter: DocumentFilter): [Document!]!
  document(id: ID!): Document
  documentTemplates(category: String): [DocumentTemplate!]!
  
  # Dashboard e relatórios
  dashboard: DashboardData!
  projectProgress(projectId: ID!): ProjectProgress!
  userWorkload(userId: ID!): UserWorkload!
  
  # Busca
  search(query: String!, type: SearchType): SearchResults!
}

# Mutations principais
type Mutation {
  # Projetos
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  archiveProject(id: ID!): Boolean!
  addProjectMember(projectId: ID!, userId: ID!, role: MemberRole!): ProjectMember!
  
  # Tarefas
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  assignTask(id: ID!, assigneeId: ID!): Task!
  updateTaskStatus(id: ID!, status: TaskStatus!): Task!
  logTime(taskId: ID!, hours: Float!, description: String): TimeLog!
  
  # Documentos
  createDocument(input: CreateDocumentInput!): Document!
  updateDocument(id: ID!, input: UpdateDocumentInput!): Document!
  publishDocument(id: ID!): Document!
  
  # Comentários
  addComment(input: AddCommentInput!): Comment!
  updateComment(id: ID!, content: String!): Comment!
  deleteComment(id: ID!): Boolean!
  
  # Notificações
  markNotificationAsRead(id: ID!): Boolean!
  markAllNotificationsAsRead: Boolean!
}

# Subscriptions para tempo real
type Subscription {
  taskUpdated(projectId: ID!): Task!
  commentAdded(entityType: String!, entityId: ID!): Comment!
  projectMemberAdded(projectId: ID!): ProjectMember!
  notificationReceived(userId: ID!): Notification!
  documentUpdated(documentId: ID!): Document!
}
```

### 9.4 WebSocket API

O sistema WebSocket implementa comunicação em tempo real para colaboração e notificações:

```typescript
// Eventos do cliente para servidor
interface ClientEvents {
  // Autenticação
  authenticate: (token: string) => void;
  
  // Colaboração em documentos
  join_document: (documentId: string) => void;
  leave_document: (documentId: string) => void;
  document_change: (documentId: string, delta: any) => void;
  cursor_position: (documentId: string, position: CursorPosition) => void;
  
  // Colaboração em projetos
  join_project: (projectId: string) => void;
  leave_project: (projectId: string) => void;
  
  // Presença
  user_status: (status: 'online' | 'away' | 'busy') => void;
}

// Eventos do servidor para cliente
interface ServerEvents {
  // Autenticação
  authenticated: (user: User) => void;
  authentication_error: (error: string) => void;
  
  // Colaboração em documentos
  document_changed: (documentId: string, delta: any, author: User) => void;
  user_cursor: (documentId: string, userId: string, position: CursorPosition) => void;
  user_joined_document: (documentId: string, user: User) => void;
  user_left_document: (documentId: string, userId: string) => void;
  
  // Atualizações em tempo real
  task_updated: (task: Task) => void;
  project_updated: (project: Project) => void;
  comment_added: (comment: Comment) => void;
  notification_received: (notification: Notification) => void;
  
  // Presença
  user_status_changed: (userId: string, status: string) => void;
  users_online: (users: OnlineUser[]) => void;
}
```

### 9.5 Integrações Externas

#### 9.5.1 Integração com Calendário

```typescript
// Google Calendar Integration
class CalendarIntegration {
  async syncEvents(userId: string): Promise<CalendarEvent[]> {
    // Sincronizar eventos do Google Calendar
    // Criar tarefas automaticamente para compromissos
    // Atualizar disponibilidade do usuário
  }
  
  async createEvent(task: Task): Promise<string> {
    // Criar evento no calendário para tarefa com prazo
    // Configurar lembretes automáticos
    // Sincronizar com equipe
  }
  
  async updateAvailability(userId: string, availability: Availability[]): Promise<void> {
    // Atualizar disponibilidade baseada no calendário
    // Considerar horários de atendimento da clínica
    // Integrar com sistema de agendamentos
  }
}
```

#### 9.5.2 Sistema de Notificações por Email

```typescript
// Email Notification Service
class EmailService {
  async sendTaskAssignment(task: Task, assignee: User): Promise<void> {
    const template = 'task-assignment';
    const data = {
      taskTitle: task.title,
      projectName: task.project.title,
      dueDate: task.dueDate,
      assigneeName: assignee.fullName,
      taskUrl: `${process.env.APP_URL}/tasks/${task.id}`
    };
    
    await this.sendEmail(assignee.email, template, data);
  }
  
  async sendDeadlineReminder(tasks: Task[]): Promise<void> {
    // Agrupar tarefas por usuário
    // Enviar resumo diário de tarefas próximas do prazo
    // Incluir links diretos para ação
  }
  
  async sendProjectUpdate(project: Project, update: ProjectUpdate): Promise<void> {
    // Notificar membros da equipe sobre atualizações importantes
    // Incluir resumo de progresso e próximos passos
    // Personalizar conteúdo baseado no role do usuário
  }
}
```

#### 9.5.3 Integração com Armazenamento de Arquivos

```typescript
// File Storage Integration
class FileStorageService {
  async uploadFile(file: File, context: UploadContext): Promise<FileMetadata> {
    // Upload para Supabase Storage
    // Gerar thumbnails para imagens
    // Extrair metadados (tipo, tamanho, etc.)
    // Aplicar políticas de segurança baseadas no contexto
    
    const metadata: FileMetadata = {
      id: generateId(),
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      url: await this.upload(file),
      thumbnailUrl: await this.generateThumbnail(file),
      uploadedBy: context.userId,
      projectId: context.projectId,
      taskId: context.taskId,
      createdAt: new Date()
    };
    
    return metadata;
  }
  
  async generateSignedUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    // Gerar URL assinada para acesso temporário
    // Verificar permissões do usuário
    // Aplicar políticas de acesso baseadas no contexto
  }
  
  async scanForVirus(file: File): Promise<ScanResult> {
    // Integração com serviço de antivírus
    // Quarentena automática de arquivos suspeitos
    // Notificação para administradores
  }
}
```

### 9.6 Middleware e Interceptors

#### 9.6.1 Middleware de Autenticação

```typescript
// Authentication Middleware
export async function authMiddleware(req: NextRequest): Promise<NextResponse> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 401 });
  }
  
  try {
    const { data: user, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Adicionar informações do usuário ao contexto da requisição
    req.user = user;
    
    // Verificar se usuário está ativo
    const { data: profile } = await supabase
      .from('users')
      .select('is_active, role')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_active) {
      return NextResponse.json({ error: 'User inactive' }, { status: 403 });
    }
    
    req.userProfile = profile;
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
```

#### 9.6.2 Middleware de Autorização

```typescript
// Authorization Middleware
export function requireRole(allowedRoles: UserRole[]) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const userRole = req.userProfile?.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    return NextResponse.next();
  };
}

// Project Access Middleware
export async function requireProjectAccess(req: NextRequest, projectId: string): Promise<NextResponse> {
  const userId = req.user?.id;
  
  const { data: membership } = await supabase
    .from('project_members')
    .select('role, permissions')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();
  
  if (!membership) {
    return NextResponse.json({ error: 'Project access denied' }, { status: 403 });
  }
  
  req.projectMembership = membership;
  return NextResponse.next();
}
```

#### 9.6.3 Middleware de Rate Limiting

```typescript
// Rate Limiting Middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const clientId = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const clientData = rateLimitMap.get(clientId);
    
    if (!clientData || clientData.resetTime < windowStart) {
      rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
      return NextResponse.next();
    }
    
    if (clientData.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((clientData.resetTime - now) / 1000).toString()
          }
        }
      );
    }
    
    clientData.count++;
    return NextResponse.next();
  };
}
```

### 9.7 Tratamento de Erros e Logging

```typescript
// Error Handler
export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Global Error Handler
export function errorHandler(error: Error, req: NextRequest): NextResponse {
  // Log do erro
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });
  
  // Tratamento específico por tipo de erro
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    );
  }
  
  // Erro genérico
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Request Logger
export function requestLogger(req: NextRequest): void {
  console.log('API Request:', {
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    userAgent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });
}
```

Esta arquitetura de APIs robusta garante comunicação eficiente, segura e escalável entre todas as partes do sistema, suportando tanto operações síncronas quanto colaboração em tempo real.


## 10. Segurança e Compliance

### 10.1 Arquitetura de Segurança Multicamadas

A segurança do sistema é implementada através de múltiplas camadas de proteção, garantindo que dados sensíveis de saúde sejam protegidos conforme os mais altos padrões da indústria. Esta abordagem de defesa em profundidade assegura que mesmo se uma camada for comprometida, outras camadas continuem protegendo o sistema.

**Camada de Rede**: Implementa proteção contra ataques DDoS, filtragem de tráfego malicioso e criptografia TLS 1.3 para todas as comunicações. O Vercel Edge Network fornece proteção automática contra ataques comuns e distribui o tráfego globalmente para melhor performance e resiliência.

**Camada de Aplicação**: Inclui validação rigorosa de inputs, sanitização de dados, proteção contra XSS e CSRF, e implementação de Content Security Policy (CSP). Todas as entradas do usuário são validadas tanto no frontend quanto no backend para prevenir injeção de código malicioso.

**Camada de Autenticação**: Sistema robusto de autenticação multifator obrigatório, gestão segura de sessões com rotação automática de tokens, e implementação de políticas de senha forte. O Supabase Auth fornece autenticação enterprise-grade com suporte a múltiplos provedores.

**Camada de Autorização**: Controle de acesso granular baseado em roles (RBAC) implementado tanto na aplicação quanto no banco de dados através de Row Level Security. Cada operação é verificada contra as permissões do usuário e contexto específico.

**Camada de Dados**: Criptografia de dados em repouso e em trânsito, backup criptografado automático, e auditoria completa de acesso a dados. O PostgreSQL implementa criptografia transparente e o Supabase fornece backup automático com retenção configurável.

### 10.2 Implementação LGPD

Considerando o contexto médico, o sistema implementa conformidade rigorosa com a Lei Geral de Proteção de Dados:

**Minimização de Dados**: O sistema coleta apenas dados estritamente necessários para as funcionalidades específicas. Campos opcionais são claramente marcados e a coleta é baseada em consentimento explícito.

**Consentimento Granular**: Interface dedicada para gestão de consentimentos, permitindo que usuários controlem exatamente quais dados são coletados e para quais finalidades. O sistema mantém registro detalhado de todos os consentimentos com timestamp e versão dos termos.

**Direitos do Titular**: Implementação completa dos direitos LGPD incluindo acesso, retificação, exclusão, portabilidade e oposição. Interface self-service permite que usuários exercitem seus direitos automaticamente quando possível.

**Auditoria e Rastreabilidade**: Log completo de todas as operações envolvendo dados pessoais, incluindo quem acessou, quando, de onde e qual ação foi realizada. Estes logs são imutáveis e mantidos pelo período legal exigido.

**Segurança por Design**: Princípios de privacy by design implementados desde a concepção, incluindo pseudonimização de dados quando apropriado, criptografia end-to-end para dados sensíveis, e minimização de exposição de dados.

### 10.3 Controles de Acesso Específicos

```typescript
// Sistema de Permissões Granulares
interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  conditions?: PermissionCondition[];
}

interface PermissionCondition {
  field: string;
  operator: 'equals' | 'in' | 'not_in' | 'contains';
  value: any;
}

// Definição de Roles Específicos para Clínica
const CLINIC_ROLES = {
  admin: {
    name: 'Administrador',
    permissions: [
      { resource: '*', action: 'manage' }, // Acesso total
    ]
  },
  fisioterapeuta: {
    name: 'Fisioterapeuta',
    permissions: [
      { resource: 'projects', action: 'create' },
      { resource: 'projects', action: 'read' },
      { resource: 'projects', action: 'update', conditions: [
        { field: 'owner_id', operator: 'equals', value: 'current_user' }
      ]},
      { resource: 'tasks', action: 'manage', conditions: [
        { field: 'project.members', operator: 'contains', value: 'current_user' }
      ]},
      { resource: 'documents', action: 'manage' },
      { resource: 'users', action: 'read', conditions: [
        { field: 'role', operator: 'in', value: ['fisioterapeuta', 'estagiario'] }
      ]}
    ]
  },
  estagiario: {
    name: 'Estagiário',
    permissions: [
      { resource: 'projects', action: 'read', conditions: [
        { field: 'members', operator: 'contains', value: 'current_user' }
      ]},
      { resource: 'tasks', action: 'read' },
      { resource: 'tasks', action: 'update', conditions: [
        { field: 'assignee_id', operator: 'equals', value: 'current_user' }
      ]},
      { resource: 'documents', action: 'read' },
      { resource: 'documents', action: 'create', conditions: [
        { field: 'type', operator: 'not_in', value: ['protocol', 'policy'] }
      ]}
    ]
  }
};
```

### 10.4 Monitoramento de Segurança

```typescript
// Sistema de Detecção de Anomalias
class SecurityMonitor {
  async detectAnomalousActivity(userId: string, action: string, context: any): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    
    // Detectar múltiplos logins de IPs diferentes
    const recentLogins = await this.getRecentLogins(userId, 24); // últimas 24h
    const uniqueIPs = new Set(recentLogins.map(login => login.ip));
    if (uniqueIPs.size > 3) {
      alerts.push({
        type: 'multiple_ip_logins',
        severity: 'medium',
        description: `Usuário ${userId} fez login de ${uniqueIPs.size} IPs diferentes nas últimas 24h`
      });
    }
    
    // Detectar acesso fora do horário normal
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 22) {
      alerts.push({
        type: 'off_hours_access',
        severity: 'low',
        description: `Acesso fora do horário comercial: ${currentHour}h`
      });
    }
    
    // Detectar tentativas de acesso a recursos não autorizados
    if (action.includes('unauthorized')) {
      alerts.push({
        type: 'unauthorized_access_attempt',
        severity: 'high',
        description: `Tentativa de acesso não autorizado a ${context.resource}`
      });
    }
    
    return alerts;
  }
  
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await supabase.from('security_logs').insert({
      user_id: event.userId,
      event_type: event.type,
      severity: event.severity,
      description: event.description,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      metadata: event.metadata,
      created_at: new Date()
    });
    
    // Notificar administradores para eventos de alta severidade
    if (event.severity === 'high') {
      await this.notifyAdministrators(event);
    }
  }
}
```

## 11. Performance e Otimização

### 11.1 Estratégias de Performance Frontend

**Code Splitting Inteligente**: Implementação de divisão de código baseada em rotas e funcionalidades, garantindo que apenas o código necessário seja carregado inicialmente. Componentes pesados como editor de texto rico e gráficos são carregados sob demanda.

**Lazy Loading de Componentes**: Componentes não críticos são carregados apenas quando necessários, reduzindo o tempo de carregamento inicial. Implementação de skeleton screens para melhorar a percepção de performance durante o carregamento.

**Otimização de Imagens**: Utilização do Next.js Image component para otimização automática de imagens, incluindo redimensionamento responsivo, formatos modernos (WebP, AVIF) e lazy loading nativo.

**Service Worker Inteligente**: Cache estratégico baseado no tipo de recurso e padrões de uso. Recursos estáticos são cached agressivamente, enquanto dados dinâmicos utilizam estratégias de cache mais conservadoras com invalidação automática.

**Virtual Scrolling**: Para listas grandes de tarefas ou documentos, implementação de virtual scrolling que renderiza apenas os itens visíveis, mantendo performance consistente independente do volume de dados.

### 11.2 Otimizações de Banco de Dados

```sql
-- Índices Compostos Otimizados
CREATE INDEX CONCURRENTLY idx_tasks_performance 
ON tasks(assignee_id, status, due_date) 
WHERE status IN ('todo', 'in_progress');

CREATE INDEX CONCURRENTLY idx_projects_active 
ON projects(owner_id, status, updated_at) 
WHERE archived_at IS NULL;

-- Particionamento para Logs de Auditoria
CREATE TABLE activity_logs_2025 PARTITION OF activity_logs
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Função para Limpeza Automática de Dados Antigos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Remover logs de atividade antigos (> 2 anos)
    DELETE FROM activity_logs 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Arquivar notificações antigas lidas (> 6 meses)
    UPDATE notifications 
    SET archived_at = NOW()
    WHERE is_read = true 
    AND read_at < NOW() - INTERVAL '6 months'
    AND archived_at IS NULL;
    
    -- Vacuum automático para recuperar espaço
    VACUUM ANALYZE;
END;
$$ LANGUAGE plpgsql;

-- Agendamento da limpeza (executar via cron)
SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_data();');
```

### 11.3 Cache e CDN

```typescript
// Estratégia de Cache Multicamadas
class CacheManager {
  private redis: Redis;
  private memoryCache: Map<string, CacheEntry>;
  
  async get<T>(key: string): Promise<T | null> {
    // 1. Verificar cache em memória (mais rápido)
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult && !this.isExpired(memoryResult)) {
      return memoryResult.data;
    }
    
    // 2. Verificar Redis (rápido, compartilhado)
    const redisResult = await this.redis.get(key);
    if (redisResult) {
      const data = JSON.parse(redisResult);
      // Atualizar cache em memória
      this.memoryCache.set(key, {
        data,
        expiry: Date.now() + 300000 // 5 minutos
      });
      return data;
    }
    
    return null;
  }
  
  async set<T>(key: string, data: T, ttl: number = 3600): Promise<void> {
    // Armazenar em ambos os caches
    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + Math.min(ttl * 1000, 300000) // Max 5 min em memória
    });
    
    await this.redis.setex(key, ttl, JSON.stringify(data));
  }
  
  // Cache específico para dados da clínica
  async cacheUserWorkload(userId: string): Promise<UserWorkload> {
    const cacheKey = `workload:${userId}`;
    let workload = await this.get<UserWorkload>(cacheKey);
    
    if (!workload) {
      workload = await this.calculateUserWorkload(userId);
      await this.set(cacheKey, workload, 1800); // 30 minutos
    }
    
    return workload;
  }
  
  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `workload:${userId}`,
      `tasks:${userId}:*`,
      `projects:${userId}:*`,
      `dashboard:${userId}`
    ];
    
    for (const pattern of patterns) {
      await this.redis.del(pattern);
      // Remover do cache em memória também
      for (const [key] of this.memoryCache) {
        if (key.includes(userId)) {
          this.memoryCache.delete(key);
        }
      }
    }
  }
}
```

### 11.4 Monitoramento de Performance

```typescript
// Sistema de Métricas de Performance
class PerformanceMonitor {
  async trackPageLoad(page: string, loadTime: number, userId?: string): Promise<void> {
    await supabase.from('performance_metrics').insert({
      metric_type: 'page_load',
      page,
      value: loadTime,
      user_id: userId,
      timestamp: new Date(),
      metadata: {
        user_agent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType
      }
    });
    
    // Alertar se performance degradar
    if (loadTime > 3000) { // > 3 segundos
      await this.sendPerformanceAlert(page, loadTime);
    }
  }
  
  async trackAPIResponse(endpoint: string, responseTime: number, status: number): Promise<void> {
    await supabase.from('api_metrics').insert({
      endpoint,
      response_time: responseTime,
      status_code: status,
      timestamp: new Date()
    });
  }
  
  async generatePerformanceReport(): Promise<PerformanceReport> {
    const [pageMetrics, apiMetrics, errorRates] = await Promise.all([
      this.getPageLoadMetrics(),
      this.getAPIMetrics(),
      this.getErrorRates()
    ]);
    
    return {
      averagePageLoad: pageMetrics.average,
      slowestPages: pageMetrics.slowest,
      apiResponseTimes: apiMetrics,
      errorRate: errorRates.overall,
      recommendations: this.generateRecommendations(pageMetrics, apiMetrics, errorRates)
    };
  }
}
```

## 12. Deployment e DevOps

### 12.1 Pipeline de CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CYPRESS_baseUrl: http://localhost:3000
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
      
      - name: Run database migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 12.2 Configuração de Ambiente

```typescript
// config/environment.ts
export const config = {
  app: {
    name: 'Sistema de Gestão - Clínica de Fisioterapia',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  },
  
  database: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600'),
    mfaRequired: process.env.MFA_REQUIRED === 'true'
  },
  
  email: {
    provider: process.env.EMAIL_PROVIDER || 'resend',
    apiKey: process.env.EMAIL_API_KEY!,
    fromAddress: process.env.EMAIL_FROM_ADDRESS!
  },
  
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || 'info',
    enableMetrics: process.env.ENABLE_METRICS === 'true'
  },
  
  features: {
    enableAI: process.env.ENABLE_AI_FEATURES === 'true',
    enableRealtime: process.env.ENABLE_REALTIME === 'true',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS === 'true'
  }
};

// Validação de configuração
export function validateConfig(): void {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'JWT_SECRET',
    'EMAIL_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

### 12.3 Monitoramento de Produção

```typescript
// monitoring/health-check.ts
export class HealthChecker {
  async checkSystemHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkExternalServices(),
      this.checkFileStorage(),
      this.checkMemoryUsage(),
      this.checkDiskSpace()
    ]);
    
    const results = checks.map((check, index) => ({
      name: ['database', 'external_services', 'file_storage', 'memory', 'disk'][index],
      status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
      details: check.status === 'fulfilled' ? check.value : check.reason
    }));
    
    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';
    
    return {
      status: overallStatus,
      timestamp: new Date(),
      checks: results,
      version: config.app.version
    };
  }
  
  private async checkDatabase(): Promise<DatabaseHealth> {
    const start = Date.now();
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      
      const responseTime = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime,
        connectionPool: await this.getConnectionPoolStatus()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - start
      };
    }
  }
  
  private async checkMemoryUsage(): Promise<MemoryHealth> {
    const usage = process.memoryUsage();
    const totalMemory = usage.heapTotal;
    const usedMemory = usage.heapUsed;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    
    return {
      status: memoryUsagePercent < 80 ? 'healthy' : 'warning',
      usagePercent: memoryUsagePercent,
      totalMB: Math.round(totalMemory / 1024 / 1024),
      usedMB: Math.round(usedMemory / 1024 / 1024)
    };
  }
}

// Endpoint de health check
export async function GET(): Promise<Response> {
  const healthChecker = new HealthChecker();
  const health = await healthChecker.checkSystemHealth();
  
  return Response.json(health, {
    status: health.status === 'healthy' ? 200 : 503
  });
}
```

### 12.4 Backup e Disaster Recovery

```typescript
// backup/strategy.ts
export class BackupManager {
  async createFullBackup(): Promise<BackupResult> {
    const timestamp = new Date().toISOString();
    const backupId = `backup_${timestamp.replace(/[:.]/g, '-')}`;
    
    try {
      // 1. Backup do banco de dados
      const dbBackup = await this.backupDatabase(backupId);
      
      // 2. Backup de arquivos
      const filesBackup = await this.backupFiles(backupId);
      
      // 3. Backup de configurações
      const configBackup = await this.backupConfigurations(backupId);
      
      // 4. Verificar integridade
      const integrity = await this.verifyBackupIntegrity(backupId);
      
      const result: BackupResult = {
        id: backupId,
        timestamp: new Date(),
        status: 'completed',
        components: {
          database: dbBackup,
          files: filesBackup,
          configurations: configBackup
        },
        integrity,
        size: dbBackup.size + filesBackup.size + configBackup.size
      };
      
      // Registrar backup no sistema
      await this.registerBackup(result);
      
      // Limpar backups antigos
      await this.cleanupOldBackups();
      
      return result;
    } catch (error) {
      await this.handleBackupFailure(backupId, error);
      throw error;
    }
  }
  
  async restoreFromBackup(backupId: string): Promise<RestoreResult> {
    // Implementar estratégia de restore com validações
    // Incluir rollback automático em caso de falha
    // Notificar administradores sobre processo de restore
  }
  
  private async cleanupOldBackups(): Promise<void> {
    // Manter backups diários por 30 dias
    // Manter backups semanais por 12 semanas
    // Manter backups mensais por 12 meses
    // Manter backups anuais indefinidamente
  }
}
```

Esta arquitetura completa fornece a base sólida necessária para implementar um sistema robusto, seguro e escalável que atende especificamente às necessidades de uma clínica de fisioterapia, aproveitando as melhores práticas da indústria e tecnologias modernas.

---

## Conclusão

A arquitetura apresentada neste documento estabelece uma base técnica robusta e escalável para o sistema de gestão de tarefas e equipe da clínica de fisioterapia. Aproveitando o projeto Notion Spark Studio existente como fundação, a solução proposta combina tecnologias modernas com funcionalidades específicas para o contexto médico.

Os principais benefícios desta arquitetura incluem:

- **Reutilização Inteligente**: Aproveitamento de 70% da infraestrutura já desenvolvida
- **Segurança Enterprise**: Conformidade LGPD e controles específicos para dados de saúde
- **Performance Otimizada**: Múltiplas camadas de cache e otimizações específicas
- **Escalabilidade**: Arquitetura cloud-native que cresce com a clínica
- **Manutenibilidade**: Código bem estruturado e documentado para evolução futura

A implementação desta arquitetura permitirá que a clínica tenha um sistema profissional, seguro e eficiente para gestão de sua equipe e projetos, com potencial de crescimento e adaptação conforme suas necessidades evoluem.

**Próximos Passos**: Avançar para a Fase 3 com documentação técnica detalhada e especificações de implementação.

