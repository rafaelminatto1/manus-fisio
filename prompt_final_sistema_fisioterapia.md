# Prompt Final para Desenvolvimento de Sistema de Gestão de Clínica de Fisioterapia

## Contexto e Objetivo

Desenvolva um sistema completo de gestão para clínica de fisioterapia, inspirado nas melhores práticas do Lumi Dashboard e adaptado especificamente para as necessidades da fisioterapia. O sistema deve integrar gestão de pacientes, agendamento, biblioteca de exercícios, área do paciente, documentação legal, e recursos de inteligência artificial para otimização de tratamentos.

## Análise de Referência - Lumi Dashboard

Com base na análise detalhada do Lumi Dashboard, identificamos funcionalidades essenciais que devem ser adaptadas e expandidas para o contexto da fisioterapia:

### Funcionalidades Inspiradoras do Lumi Dashboard:
- Biblioteca de exercícios organizada por especialidades (29m 54s de conteúdo, 58 exercícios)
- Sistema de vídeos demonstrativos com duração específica
- Interface responsiva com navegação intuitiva
- Sistema de favoritos e personalização
- Documentação legal completa (termos de consentimento, declarações, recibos)
- Integração com ferramentas externas (WhatsApp, Canva, YouTube)
- Sistema de avaliação com feedback visual (emojis)
- Templates personalizáveis e editáveis
- Compliance com LGPD e proteção de dados

## Especificações Técnicas Detalhadas

### Arquitetura do Sistema
- **Backend**: Flask (Python) com arquitetura modular
- **Frontend**: HTML5, CSS3, JavaScript (responsivo)
- **Banco de Dados**: PostgreSQL para produção, SQLite para desenvolvimento
- **Autenticação**: Flask-Login com sessões seguras
- **Deploy**: Heroku com suporte a PostgreSQL
- **Integrações**: APIs para WhatsApp, YouTube, Google Drive

### Estrutura de Perfis e Permissões

#### 1. Administrador da Clínica
**Permissões completas:**
- Gestão de usuários e permissões
- Configuração do sistema e personalização
- Relatórios financeiros e gerenciais
- Backup e configurações de segurança
- Gestão de equipamentos e estoque

#### 2. Fisioterapeuta
**Permissões clínicas:**
- Gestão completa de pacientes
- Prescrição e acompanhamento de exercícios
- Criação e edição de prontuários
- Agendamento de consultas
- Geração de relatórios de evolução
- Acesso à biblioteca de exercícios

#### 3. Recepcionista
**Permissões administrativas:**
- Agendamento de consultas
- Cadastro básico de pacientes
- Gestão de pagamentos e recibos
- Comunicação com pacientes
- Relatórios básicos de agenda

#### 4. Paciente
**Permissões limitadas:**
- Visualização do próprio prontuário
- Acompanhamento de exercícios prescritos
- Registro de sintomas e evolução
- Comunicação com fisioterapeuta
- Agendamento de consultas (se habilitado)

## Módulos Funcionais Detalhados



### Módulo 1: Gestão de Pacientes e Prontuários Eletrônicos

#### Funcionalidades Essenciais:
**Cadastro Completo de Pacientes:**
- Dados pessoais, contato e documentos
- Histórico médico e patologias
- Informações de convênio e plano de saúde
- Anexo de documentos e exames (PDF, imagens)
- Sistema de busca avançada por múltiplos critérios

**Prontuário Eletrônico Específico para Fisioterapia:**
- Avaliação inicial padronizada por especialidade
- Escalas de dor (EVA, NPRS) com registro visual
- Testes funcionais específicos (Lasègue, Phalen, etc.)
- Goniometria e medidas antropométricas
- Registro fotográfico com consentimento
- Evolução diária com templates estruturados
- Objetivos de tratamento SMART
- Controle de alta e reavaliações

**Sistema de Documentação Legal:**
- Termo de consentimento para uso de imagens (baseado no Lumi)
- Declaração de comparecimento automática
- Atestados médicos personalizáveis
- Relatórios para convênios e perícias
- Certificados de conclusão de tratamento
- Receituários de exercícios

#### Especificações Técnicas:
```python
# Modelo de dados para pacientes
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True)
    birth_date = db.Column(db.Date)
    phone = db.Column(db.String(15))
    email = db.Column(db.String(100))
    address = db.Column(db.Text)
    medical_history = db.Column(db.Text)
    insurance_info = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    appointments = db.relationship('Appointment', backref='patient')
    medical_records = db.relationship('MedicalRecord', backref='patient')
    exercises = db.relationship('PatientExercise', backref='patient')
```

### Módulo 2: Biblioteca de Exercícios e Prescrição

#### Funcionalidades Inspiradas no Lumi Dashboard:
**Organização por Especialidades e Regiões Anatômicas:**
- Mobilização Neural
- Cervical (Rotação cervical, Retração cervical)
- Membros Superiores
- Tronco
- Membros Inferiores
- Mobilidade Geral

**Sistema de Vídeos Demonstrativos:**
- Vídeos curtos e específicos (20-30 segundos como no Lumi)
- Integração com YouTube para hospedagem
- Descrição detalhada de cada exercício
- Indicações e contraindicações
- Progressões e regressões
- Sistema de favoritos para fisioterapeutas

**Prescrição Personalizada:**
- Seleção de exercícios por paciente
- Definição de séries, repetições e frequência
- Progressão automática baseada na evolução
- Envio via WhatsApp (inspirado no Lumi)
- Impressão de fichas de exercícios
- QR Code para acesso mobile

#### Especificações Técnicas:
```python
# Modelo para biblioteca de exercícios
class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))  # Cervical, Membros Superiores, etc.
    subcategory = db.Column(db.String(50))
    description = db.Column(db.Text)
    video_url = db.Column(db.String(200))
    duration = db.Column(db.Integer)  # em segundos
    difficulty_level = db.Column(db.Integer)  # 1-5
    indications = db.Column(db.Text)
    contraindications = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
```

### Módulo 3: Agendamento e Gestão de Consultas

#### Funcionalidades Avançadas:
**Sistema de Agendamento Inteligente:**
- Calendário visual com disponibilidade em tempo real
- Agendamento online para pacientes (opcional)
- Bloqueio automático de horários conflitantes
- Notificações automáticas via WhatsApp/SMS
- Lista de espera automática
- Reagendamento simplificado

**Gestão de Consultas:**
- Check-in digital de pacientes
- Controle de tempo de atendimento
- Registro de faltas e atrasos
- Cobrança automática de taxas de cancelamento
- Relatórios de produtividade por profissional
- Integração com sistema financeiro

#### Especificações Técnicas:
```python
# Modelo para agendamentos
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    therapist_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    appointment_date = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, default=60)  # minutos
    status = db.Column(db.String(20), default='scheduled')
    notes = db.Column(db.Text)
    treatment_type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

### Módulo 4: Área do Paciente (Portal Web/Mobile)

#### Funcionalidades Específicas:
**Dashboard do Paciente:**
- Próximas consultas e histórico
- Exercícios prescritos com vídeos
- Registro de sintomas e dor (escala visual)
- Evolução gráfica do tratamento
- Comunicação direta com fisioterapeuta
- Documentos e relatórios pessoais

**Acompanhamento de Exercícios:**
- Lista de exercícios prescritos
- Vídeos demonstrativos integrados
- Registro de execução (feito/não feito)
- Feedback de dificuldade e dor
- Lembretes automáticos
- Progresso visual com gráficos

**Sistema de Feedback:**
- Avaliação diária de sintomas
- Escala de dor visual (0-10)
- Registro de observações pessoais
- Fotos de evolução (opcional)
- Questionários de satisfação
- Chat com fisioterapeuta

#### Especificações Técnicas:
```python
# Modelo para acompanhamento de exercícios
class PatientExercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'))
    prescribed_date = db.Column(db.DateTime, default=datetime.utcnow)
    sets = db.Column(db.Integer)
    repetitions = db.Column(db.Integer)
    frequency = db.Column(db.String(50))  # "2x por dia", "3x por semana"
    status = db.Column(db.String(20), default='active')
    
    # Registros de execução
    executions = db.relationship('ExerciseExecution', backref='prescription')
```

### Módulo 5: Gestão de Tarefas (Estilo Trello)

#### Funcionalidades Inspiradas no Lumi Dashboard:
**Quadro Kanban Personalizado:**
- Colunas configuráveis (Pendente, Em Andamento, Concluído)
- Tarefas com responsáveis e prazos
- Etiquetas coloridas por prioridade
- Filtros por responsável, data, tipo
- Notificações de vencimento
- Histórico de alterações

**Tipos de Tarefas Específicas:**
- Avaliações iniciais pendentes
- Reavaliações programadas
- Documentos para gerar
- Exercícios para prescrever
- Contatos com pacientes
- Tarefas administrativas

#### Especificações Técnicas:
```python
# Modelo para gestão de tarefas
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=True)
    status = db.Column(db.String(20), default='pending')
    priority = db.Column(db.String(10), default='medium')
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
```


### Módulo 6: Inteligência Artificial e Automação

#### Funcionalidades de IA Específicas para Fisioterapia:
**Sugestões Automáticas de Exercícios:**
- Análise do diagnóstico e histórico do paciente
- Recomendações baseadas em protocolos evidenciados
- Progressão automática baseada na evolução
- Alertas para exercícios contraindicados
- Otimização de frequência e intensidade

**Análise Preditiva de Evolução:**
- Predição de tempo de tratamento
- Identificação de pacientes em risco de abandono
- Análise de padrões de melhora
- Sugestões de ajustes no tratamento
- Alertas para reavaliações necessárias

**Assistente Virtual para Documentação:**
- Geração automática de relatórios de evolução
- Sugestões de objetivos de tratamento
- Preenchimento inteligente de formulários
- Análise de texto livre em prontuários
- Extração de informações relevantes

#### Especificações Técnicas de IA:
```python
# Sistema de recomendação de exercícios
class ExerciseRecommendationEngine:
    def __init__(self):
        self.protocols = self.load_evidence_based_protocols()
        self.patient_similarity_model = self.load_similarity_model()
    
    def recommend_exercises(self, patient_id, diagnosis, current_exercises):
        # Análise do perfil do paciente
        patient_profile = self.analyze_patient_profile(patient_id)
        
        # Busca por protocolos similares
        similar_cases = self.find_similar_cases(patient_profile)
        
        # Geração de recomendações
        recommendations = self.generate_recommendations(
            diagnosis, current_exercises, similar_cases
        )
        
        return recommendations
```

### Módulo 7: Sistema Financeiro e Marketing

#### Funcionalidades Financeiras:
**Gestão de Pagamentos:**
- Controle de valores por procedimento
- Emissão automática de recibos (inspirado no Lumi)
- Controle de convênios e reembolsos
- Relatórios financeiros detalhados
- Integração com sistemas de pagamento
- Controle de inadimplência

**Marketing e Relacionamento:**
- Campanhas automáticas via WhatsApp
- Newsletter para pacientes
- Pesquisas de satisfação
- Programa de fidelidade
- Indicações e referências
- Materiais educativos personalizados

#### Especificações Técnicas:
```python
# Modelo financeiro
class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'))
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointment.id'))
    amount = db.Column(db.Decimal(10, 2))
    payment_method = db.Column(db.String(20))
    status = db.Column(db.String(20), default='pending')
    due_date = db.Column(db.Date)
    paid_date = db.Column(db.Date)
    receipt_number = db.Column(db.String(20), unique=True)
```

### Módulo 8: Relatórios e Analytics

#### Funcionalidades de Relatórios:
**Relatórios Clínicos:**
- Evolução individual de pacientes
- Estatísticas de melhora por diagnóstico
- Efetividade de protocolos de tratamento
- Tempo médio de tratamento
- Taxa de alta por patologia

**Relatórios Gerenciais:**
- Produtividade por fisioterapeuta
- Ocupação de agenda
- Receita por período
- Análise de inadimplência
- Satisfação dos pacientes

**Dashboards Interativos:**
- Métricas em tempo real
- Gráficos de tendências
- Comparativos mensais/anuais
- Alertas automáticos
- Exportação em múltiplos formatos

## Especificações de Interface e Experiência do Usuário

### Design Responsivo (Inspirado no Lumi Dashboard)
**Princípios de Design:**
- Mobile-first approach
- Interface limpa e intuitiva
- Navegação por breadcrumbs
- Menu hambúrguer para mobile
- Sistema de cores consistente
- Tipografia legível e acessível

**Componentes de Interface:**
- Dashboard personalizado por perfil de usuário
- Cards informativos com métricas importantes
- Tabelas responsivas com filtros avançados
- Formulários inteligentes com validação
- Modais para ações rápidas
- Sistema de notificações não intrusivas

### Navegação e Usabilidade
**Estrutura de Navegação:**
```
Dashboard Principal
├── Pacientes
│   ├── Lista de Pacientes
│   ├── Cadastro Novo
│   └── Prontuário Individual
├── Agendamento
│   ├── Calendário
│   ├── Nova Consulta
│   └── Lista de Agendamentos
├── Exercícios
│   ├── Biblioteca
│   ├── Prescrições
│   └── Acompanhamento
├── Tarefas
│   ├── Quadro Kanban
│   ├── Minhas Tarefas
│   └── Relatórios
├── Financeiro
│   ├── Pagamentos
│   ├── Recibos
│   └── Relatórios
└── Configurações
    ├── Usuários
    ├── Personalização
    └── Integrações
```

## Integrações e APIs Externas

### Integrações Essenciais (Inspiradas no Lumi)
**WhatsApp Business API:**
- Envio de lembretes de consulta
- Compartilhamento de exercícios
- Comunicação com pacientes
- Notificações automáticas

**YouTube API:**
- Hospedagem de vídeos de exercícios
- Playlist personalizada por clínica
- Analytics de visualização
- Integração com biblioteca de exercícios

**Google Drive/Canva Integration:**
- Armazenamento de documentos
- Templates editáveis (como no Lumi)
- Backup automático
- Compartilhamento seguro

**APIs de Pagamento:**
- Mercado Pago / PagSeguro
- PIX automático
- Cartão de crédito/débito
- Boleto bancário

### Especificações de Segurança e Compliance

#### Proteção de Dados (LGPD)
**Medidas de Segurança:**
- Criptografia de dados sensíveis
- Controle de acesso baseado em roles
- Log de auditoria completo
- Backup automático e seguro
- Termo de consentimento detalhado (baseado no Lumi)

**Compliance Médico:**
- Prontuário eletrônico certificado
- Assinatura digital válida
- Rastreabilidade de alterações
- Retenção de dados conforme CFM
- Exportação de dados para pacientes

## Roadmap de Desenvolvimento

### Fase 1 - MVP (2-3 meses)
**Funcionalidades Essenciais:**
- Cadastro de pacientes e prontuários básicos
- Agendamento simples
- Biblioteca básica de exercícios
- Sistema de login e permissões
- Interface responsiva básica

### Fase 2 - Funcionalidades Avançadas (3-4 meses)
**Expansão do Sistema:**
- Área do paciente completa
- Sistema de tarefas estilo Kanban
- Relatórios básicos
- Integração com WhatsApp
- Documentação legal automática

### Fase 3 - IA e Automação (4-6 meses)
**Recursos Inteligentes:**
- Sistema de recomendação de exercícios
- Análise preditiva de evolução
- Automação de documentos
- Analytics avançado
- Integrações completas

### Fase 4 - Otimização e Escala (2-3 meses)
**Melhorias e Performance:**
- Otimização de performance
- Recursos avançados de IA
- Integrações adicionais
- Customização avançada
- Suporte multi-clínica

## Especificações Técnicas de Implementação

### Stack Tecnológico Recomendado
**Backend:**
```python
# requirements.txt
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Flask-Login==0.6.3
Flask-WTF==1.1.1
Flask-Mail==0.9.1
psycopg2-binary==2.9.7
gunicorn==21.2.0
python-dotenv==1.0.0
requests==2.31.0
Pillow==10.0.0
pandas==2.0.3
scikit-learn==1.3.0
```

**Frontend:**
- HTML5 semântico
- CSS3 com Flexbox/Grid
- JavaScript ES6+
- Bootstrap 5 ou Tailwind CSS
- Chart.js para gráficos
- FullCalendar.js para agendamento

**Banco de Dados:**
```sql
-- Estrutura básica das tabelas principais
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    birth_date DATE,
    phone VARCHAR(15),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    therapist_id INTEGER REFERENCES users(id),
    appointment_date TIMESTAMP NOT NULL,
    duration INTEGER DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Configuração de Deploy
**Heroku Configuration:**
```python
# wsgi.py
from src.main import app

if __name__ == "__main__":
    app.run()

# Procfile
web: gunicorn wsgi:app

# runtime.txt
python-3.11.0
```

**Variáveis de Ambiente:**
```bash
SECRET_KEY=sua_chave_secreta_super_segura
DATABASE_URL=postgresql://...
FLASK_APP=wsgi.py
FLASK_ENV=production
WHATSAPP_API_KEY=sua_chave_whatsapp
YOUTUBE_API_KEY=sua_chave_youtube
```

## Instruções de Uso do Prompt

### Para Claude AI / Cursor AI:
1. Cole este prompt completo
2. Adicione: "Desenvolva este sistema de gestão para clínica de fisioterapia seguindo todas as especificações detalhadas acima"
3. Especifique qual módulo deseja implementar primeiro
4. Solicite código completo e funcional

### Para Firebase Studio:
1. Cole este prompt completo
2. Adicione: "Implemente este sistema usando Firebase como backend e React como frontend"
3. Adapte as especificações de banco de dados para Firestore
4. Mantenha todas as funcionalidades descritas

### Para Gemini Studio:
1. Cole este prompt completo
2. Adicione: "Gere código Python/Flask completo para este sistema de gestão"
3. Inclua testes unitários e documentação
4. Priorize as funcionalidades inspiradas no Lumi Dashboard

## Critérios de Sucesso

### Métricas de Performance:
- Tempo de carregamento < 3 segundos
- Disponibilidade > 99.5%
- Suporte a 100+ usuários simultâneos
- Backup automático diário
- Conformidade com LGPD

### Métricas de Usabilidade:
- Interface intuitiva (< 5 cliques para qualquer ação)
- Responsividade em todos os dispositivos
- Acessibilidade WCAG 2.1 AA
- Tempo de treinamento < 2 horas
- Satisfação do usuário > 4.5/5

### Funcionalidades Obrigatórias:
- Todos os 8 módulos funcionais implementados
- Integração com WhatsApp funcionando
- Sistema de backup e recuperação
- Relatórios exportáveis em PDF/Excel
- Área do paciente totalmente funcional

---

**Autor:** Manus AI  
**Data:** 29/06/2025  
**Versão:** 2.0 - Atualizada com análise completa do Lumi Dashboard

