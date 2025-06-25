# PROMPT PARA FERRAMENTAS DE GERAÇÃO DE SISTEMAS

## CONTEXTO DO PROJETO

Desenvolver um **Sistema de Gestão de Tarefas e Equipe** para uma clínica de fisioterapia com 7 pessoas (1 administrador, 2 fisioterapeutas, 4 estagiários). O sistema deve combinar funcionalidades do Evernote, Notion, Obsidian, Linear, Monday.com, ClickUp, Slack e Atlassian, adaptadas para o contexto médico.

## ESPECIFICAÇÕES TÉCNICAS

### Stack Tecnológico:
- **Frontend**: Next.js 14 + TypeScript + shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Deploy**: Vercel
- **Mobile**: PWA responsivo (iPhone 11+, iPad 10+, Windows)

### Projeto Base Existente:
- **Repositório**: https://github.com/rafaelminatto1/notion-spark-studio
- **Status**: Sistema avançado já implementado com IA, colaboração real-time, PWA
- **Recomendação**: ADAPTAR projeto existente ao invés de criar do zero

## REQUISITOS FUNCIONAIS

### 1. HIERARQUIA ORGANIZACIONAL
```
Workspace (Clínica)
├── Projetos
│   ├── Tarefas
│   │   ├── Subtarefas
│   │   └── Checklists
│   ├── Documentos/Procedimentos
│   └── Conversas/Comentários
├── Equipe
│   ├── Perfis e Especialidades
│   ├── Carga de Trabalho
│   └── Disponibilidade
└── Relatórios/Analytics
```

### 2. SISTEMA DE TAREFAS (PRIORIDADE MÁXIMA)
- **Criação/Edição**: Interface intuitiva para criar tarefas
- **Atribuição**: Responsáveis + participantes por tarefa/projeto
- **Status Customizáveis**: Pendente, Em Andamento, Concluída, Bloqueada, Revisão
- **Prazos e Lembretes**: Sistema de notificações automáticas
- **Subtarefas**: Decomposição hierárquica de tarefas complexas
- **Checklists**: Listas de verificação para procedimentos
- **Dependências**: Tarefas que dependem de outras
- **Templates**: Modelos para tipos recorrentes de projetos

### 3. DOCUMENTAÇÃO E PROCEDIMENTOS
- **Editor Rico**: Baseado no sistema atual (similar ao Notion)
- **Templates Médicos**: Protocolos de fisioterapia, formulários de avaliação
- **Versionamento**: Histórico de alterações em documentos
- **Linking**: Conexões entre documentos e tarefas (estilo Obsidian)
- **Busca Avançada**: Busca semântica em todo o conteúdo
- **Categorização**: Tags automáticas com IA

### 4. COMUNICAÇÃO E COLABORAÇÃO
- **Comentários**: Sistema de comentários em tarefas e documentos
- **Conversas por Projeto**: Threads organizados por contexto
- **Notificações Inteligentes**: Push, email, in-app
- **Menções**: @usuário para notificações diretas
- **Tempo Real**: Edição colaborativa e live cursors
- **Status de Presença**: Quem está online/trabalhando

### 5. DIÁRIO DE BORDO E AUDITORIA
- **Log de Atividades**: Histórico detalhado de todas as ações
- **Timeline de Projeto**: Visualização cronológica do progresso
- **Audit Trail**: Rastreabilidade completa para compliance
- **Relatórios de Progresso**: Automáticos e manuais
- **Métricas de Performance**: Tempo gasto, produtividade, gargalos

### 6. DASHBOARD E RELATÓRIOS
- **Dashboard Executivo**: Visão geral para o administrador
- **Dashboard Individual**: Tarefas pessoais e carga de trabalho
- **Métricas de Equipe**: Produtividade, distribuição de trabalho
- **Gráficos Visuais**: Gantt, Kanban, Timeline, Burndown
- **Relatórios Customizáveis**: Filtros avançados e exportação

### 7. GESTÃO DE EQUIPE
- **Perfis Detalhados**: Especialidades, certificações, experiência
- **Roles e Permissões**: Admin, Fisioterapeuta, Estagiário
- **Carga de Trabalho**: Visualização da capacidade de cada pessoa
- **Calendário Integrado**: Disponibilidade e agendamentos
- **Avaliação de Performance**: Métricas individuais

## REQUISITOS DE INTERFACE

### Design System:
- **Estilo**: Minimalista estilo Notion (branco/cinza claro)
- **Layout**: Sidebar esquerda + conteúdo principal
- **Cores**: 
  - Primária: #0066CC (azul profissional)
  - Sucesso: #28A745 (verde)
  - Atenção: #FD7E14 (laranja)
  - Neutro: #F8F9FA, #6C757D
- **Tipografia**: Inter ou System fonts
- **Ícones**: Lucide React + ícones médicos específicos

### Responsividade:
- **Desktop**: Layout completo com sidebar
- **Tablet (iPad 10+)**: Sidebar colapsável, touch-friendly
- **Mobile (iPhone 11+)**: Navigation bottom, gestos otimizados
- **PWA**: Instalável, offline-capable, push notifications

## FUNCIONALIDADES AVANÇADAS

### Inteligência Artificial (já implementada no projeto base):
- **Auto-tagging**: Categorização automática de conteúdo
- **Sugestões**: Próximas ações, conteúdo relacionado
- **Análise de Padrões**: Identificação de gargalos e otimizações
- **Busca Semântica**: Compreensão de contexto nas buscas

### Automações:
- **Workflows**: Automação de processos recorrentes
- **Notificações**: Alertas baseados em regras
- **Atribuições**: Auto-atribuição baseada em carga de trabalho
- **Relatórios**: Geração automática de relatórios periódicos

### Integrações:
- **Calendário**: Google Calendar, Outlook
- **Email**: Notificações e updates por email
- **Arquivos**: Upload e gestão de documentos
- **Backup**: Backup automático e versionamento

## CASOS DE USO ESPECÍFICOS

### Cenário 1: Novo Projeto de Reabilitação
1. Admin cria projeto "Reabilitação Pós-Cirúrgica - Paciente X"
2. Define fisioterapeuta responsável e estagiários participantes
3. Sistema sugere template de protocolo baseado em casos similares
4. Tarefas são criadas automaticamente: avaliação inicial, plano de tratamento, exercícios
5. Cada tarefa tem checklist específico e documentação associada
6. Progresso é acompanhado em tempo real no dashboard

### Cenário 2: Documentação de Procedimento
1. Fisioterapeuta documenta novo protocolo de tratamento
2. Sistema sugere tags e categorização automática
3. Documento é linkado a projetos relevantes
4. Equipe recebe notificação sobre novo procedimento
5. Comentários e feedback são coletados
6. Versão final é aprovada e vira template

### Cenário 3: Gestão de Carga de Trabalho
1. Admin visualiza dashboard de distribuição de tarefas
2. Identifica sobrecarga em um fisioterapeuta
3. Redistribui tarefas para estagiários disponíveis
4. Sistema notifica automaticamente os envolvidos
5. Métricas são atualizadas em tempo real

## CRITÉRIOS DE SUCESSO

### Performance:
- **Carregamento**: < 2 segundos na primeira visita
- **Interação**: < 100ms para ações básicas
- **Offline**: Funcionalidade básica sem internet
- **Sincronização**: < 1 segundo para updates em tempo real

### Usabilidade:
- **Curva de Aprendizado**: Máximo 1 hora para usuário básico
- **Eficiência**: Redução de 50% no tempo de gestão de projetos
- **Satisfação**: NPS > 8.0 após 30 dias de uso
- **Adoção**: 100% da equipe usando ativamente em 2 semanas

### Segurança:
- **Conformidade**: LGPD para dados de saúde
- **Autenticação**: MFA obrigatório
- **Auditoria**: Log completo de todas as ações
- **Backup**: Backup automático diário

## ENTREGÁVEIS ESPERADOS

1. **Código Fonte Completo**: Repositório GitHub com código documentado
2. **Deploy Funcional**: Sistema rodando em produção (Vercel)
3. **Documentação Técnica**: Arquitetura, APIs, banco de dados
4. **Manual do Usuário**: Guia completo para cada tipo de usuário
5. **Guia de Administração**: Configuração, manutenção, backup
6. **Testes**: Suite de testes automatizados (unit + integration)

## CRONOGRAMA SUGERIDO

### Fase 1 (4-6 semanas): Core System
- Adaptação do projeto base existente
- Sistema de tarefas completo
- Autenticação e permissões
- Interface básica responsiva

### Fase 2 (3-4 semanas): Advanced Features
- Dashboard e relatórios
- Sistema de busca avançada
- Notificações e comunicação
- Templates e automações

### Fase 3 (2-3 semanas): Polish & Deploy
- Otimizações de performance
- Testes completos
- Deploy em produção
- Documentação final

**TOTAL: 9-13 semanas**

## INSTRUÇÕES PARA A FERRAMENTA

1. **PRIORIZE** a adaptação do projeto existente ao invés de criar do zero
2. **FOQUE** primeiro no sistema de tarefas (funcionalidade crítica)
3. **MANTENHA** a arquitetura robusta já implementada (IA, real-time, PWA)
4. **ADAPTE** a interface para o contexto médico/clínico
5. **IMPLEMENTE** as funcionalidades em ordem de prioridade
6. **TESTE** cada funcionalidade antes de avançar
7. **DOCUMENTE** todas as customizações e adaptações

Este prompt deve ser usado com ferramentas como Cursor AI, Lovable, v0.dev, ou similar para gerar o sistema completo baseado nas especificações detalhadas acima.

