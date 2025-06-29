# 🏛️ Especificação Funcional e Técnica - Módulo de Pacientes

**Versão:** 1.0  
**Data:** 28 de junho de 2025
**Status:** Para Desenvolvimento

## 1. Visão Geral

Esta especificação detalha a implementação do **Módulo de Pacientes e Prontuários Eletrônicos**, a evolução mais crítica do Sistema Manus Fisio. O objetivo é transformar a plataforma de um sistema de gestão de projetos para um sistema de gestão clínica completo, em total conformidade com a LGPD.

## 2. Requisitos Funcionais

- **RF01:** O sistema deve permitir o cadastro completo de pacientes, incluindo dados demográficos, de contato e histórico médico inicial.
- **RF02:** Fisioterapeutas e Admins devem poder visualizar uma lista de todos os pacientes, com ferramentas de busca e filtro.
- **RF03:** Para cada paciente, o sistema deve permitir a criação e gestão de registros de prontuário eletrônico (evoluções de sessão).
- **RF04:** Cada registro de prontuário deve utilizar o Editor Rico existente, permitindo a inclusão de texto formatado, imagens e checklists.
- **RF05:** O sistema deve garantir que apenas pessoal autorizado (Fisioterapeuta responsável, Admin) possa acessar os dados de um paciente.
- **RF06:** Deve ser possível associar um paciente a um ou mais `Projetos` existentes.

## 3. Estrutura de Dados (Schema do Banco)

Serão criadas duas novas tabelas principais e uma tabela de associação.

```sql
-- Tabela principal para armazenar os dados demográficos dos pacientes
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT,
    cpf TEXT UNIQUE, -- Dado sensível, requer criptografia em nível de aplicação
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    initial_medical_history TEXT, -- Um resumo do histórico inicial
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para os registros de prontuário (evoluções de cada sessão)
CREATE TABLE public.patient_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    content JSONB NOT NULL, -- Conteúdo da evolução, usando a estrutura do Editor Rico
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Fisioterapeuta que realizou a sessão
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de associação para vincular pacientes a projetos
CREATE TABLE public.project_patients (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, patient_id)
);
```

## 4. Endpoints da API (REST)

- `GET /api/patients`: Lista todos os pacientes com paginação e filtros.
- `POST /api/patients`: Cria um novo paciente.
- `GET /api/patients/{id}`: Retorna os detalhes de um paciente específico.
- `PUT /api/patients/{id}`: Atualiza os dados de um paciente.
- `GET /api/patients/{patientId}/records`: Lista todos os registros de prontuário de um paciente.
- `POST /api/patients/{patientId}/records`: Cria um novo registro de prontuário para um paciente.

## 5. Políticas de Segurança (Row Level Security)

- **Pacientes:**
    - Admins podem ver todos os pacientes.
    - Fisioterapeutas podem ver apenas os pacientes associados aos projetos em que são membros.
    - Um Fisioterapeuta pode criar um novo paciente.
- **Prontuários:**
    - Apenas o Fisioterapeuta que criou o registro ou um Admin pode ler ou modificar um registro de prontuário.

## 6. Componentes de Interface (UI)

- **Tela de Listagem de Pacientes:** Uma tabela ou grade com todos os pacientes, com uma barra de busca proeminente.
- **Página de Detalhes do Paciente:** Exibe as informações demográficas e uma lista cronológica de todos os registros de prontuário.
- **Formulário de Prontuário:** Um modal ou página dedicada que abre o Editor Rico para a criação de uma nova evolução de sessão.
