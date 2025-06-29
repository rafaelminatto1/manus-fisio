-- CORREÇÕES URGENTES - MANUS FISIO
-- Baseado na análise dos MCPs Supabase

-- 1. SEGURANÇA CRÍTICA: Habilitar RLS em notification_settings
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Verificar se política já existe e recriar se necessário
DROP POLICY IF EXISTS "Users manage own settings" ON notification_settings;
CREATE POLICY "Users manage own settings" 
ON notification_settings 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid());

-- 2. PERFORMANCE CRÍTICA: Adicionar índice faltante
-- Verificar se índice já existe antes de criar
DROP INDEX IF EXISTS idx_calendar_events_created_by;
CREATE INDEX idx_calendar_events_created_by ON calendar_events(created_by);

-- 3. SEGURANÇA: Corrigir search_path das funções
-- ATENÇÃO: Usar CORRECOES_FUNCOES_DUPLICADAS.sql para funções com assinaturas duplicadas
-- Aqui apenas as funções únicas:
ALTER FUNCTION public.log_activity() SET search_path = '';
ALTER FUNCTION public.has_notebook_permission(notebook_uuid uuid, permission_level text) SET search_path = '';
ALTER FUNCTION public.has_project_permission(project_uuid uuid, permission_level text) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';

-- Para is_admin e is_mentor: Execute o arquivo CORRECOES_FUNCOES_DUPLICADAS.sql

-- 4. OTIMIZAR políticas RLS ineficientes (exemplo)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT TO authenticated 
USING ((SELECT auth.uid()) = id);

-- 5. REMOVER índices não utilizados
DROP INDEX IF EXISTS idx_comments_author_id;
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_notebooks_search;

-- 6. VERIFICAR resultado
ANALYZE;

/*
INSTRUÇÕES DE EXECUÇÃO:

PASSO 1: Execute este script principal no Supabase SQL Editor
PASSO 2: Execute separadamente o arquivo CRIAR_INDICES_CONCURRENTLY.sql
PASSO 3: No painel Supabase > Auth > Settings, ative "Leaked Password Protection"
PASSO 4: No código, remover NEXT_PUBLIC_MOCK_AUTH=true

ORDEM CORRETA:
1️⃣ CORRECOES_URGENTES_SUPABASE.sql (este arquivo)
2️⃣ CRIAR_INDICES_CONCURRENTLY.sql (comando por comando)
3️⃣ Configurações manuais no painel
4️⃣ Alterações no código frontend

IMPACTO ESPERADO:
✅ 4 vulnerabilidades críticas corrigidas
✅ Performance melhorada significativamente  
✅ Sistema pronto para produção

TEMPO TOTAL: 5-10 minutos
*/

-- CORREÇÃO URGENTE DE POLÍTICAS DE SEGURANÇA (RLS)
-- Data: 29 de junho de 2025
--
-- INSTRUÇÕES:
-- O script anterior falhou porque as tabelas já existiam.
-- Este script contém APENAS a criação das políticas de segurança (RLS) que estão faltando.
--
-- 1. Copie TODO o conteúdo deste arquivo.
-- 2. Cole no SQL Editor do seu projeto Supabase.
-- 3. Clique em "RUN".
--
-- =================================================================================================

-- Política para a tabela 'patients'
CREATE POLICY "Admins podem gerenciar todos os pacientes" ON public.patients
    FOR ALL USING (is_admin());

CREATE POLICY "Fisioterapeutas podem ver pacientes de seus projetos" ON public.patients
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM project_collaborators pc
        JOIN project_patients pp ON pc.project_id = pp.project_id
        WHERE pp.patient_id = public.patients.id AND pc.user_id = auth.uid()
    ));

CREATE POLICY "Fisioterapeutas podem criar pacientes" ON public.patients
    FOR INSERT WITH CHECK (is_mentor()); -- Reutilizando a função is_mentor() para 'fisioterapeuta'

-- Política para a tabela 'patient_records'
CREATE POLICY "Admins podem gerenciar todos os prontuários" ON public.patient_records
    FOR ALL USING (is_admin());

CREATE POLICY "Fisioterapeutas podem gerenciar prontuários de seus pacientes" ON public.patient_records
    FOR ALL USING (EXISTS (
        SELECT 1 FROM project_collaborators pc
        JOIN project_patients pp ON pc.project_id = pp.project_id
        WHERE pp.patient_id = public.patient_records.patient_id AND pc.user_id = auth.uid()
    ));

-- Política para a tabela 'project_patients'
CREATE POLICY "Membros do projeto podem ver as associações" ON public.project_patients
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM project_collaborators pc
        WHERE pc.project_id = public.project_patients.project_id AND pc.user_id = auth.uid()
    ));

CREATE POLICY "Admins e criadores de projetos podem gerenciar associações" ON public.project_patients
    FOR ALL USING (is_admin() OR has_project_permission(project_id, 'admin')); 