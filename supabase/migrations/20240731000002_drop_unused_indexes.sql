-- Migration generated to drop unused indexes for database hygiene and minor performance gains on writes.
-- These indexes were identified by the Supabase Advisor as being unused.

-- Dropping unused indexes from the 'comments' table
DROP INDEX IF EXISTS public.idx_comments_page_id;
DROP INDEX IF EXISTS public.idx_comments_parent_id;
DROP INDEX IF EXISTS public.idx_comments_project_id;
DROP INDEX IF EXISTS public.idx_comments_task_id;
DROP INDEX IF EXISTS public.idx_comments_author_id;

-- Dropping unused indexes from the 'patients' and related tables
DROP INDEX IF EXISTS public.idx_patient_records_created_by;
DROP INDEX IF EXISTS public.idx_patients_created_by;
DROP INDEX IF EXISTS public.idx_patients_full_name;
DROP INDEX IF EXISTS public.idx_patient_records_patient_id;
DROP INDEX IF EXISTS public.idx_project_patients_project_id;
DROP INDEX IF EXISTS public.idx_project_patients_patient_id;

-- Dropping unused indexes from various other tables
DROP INDEX IF EXISTS public.idx_calendar_events_created_by;
DROP INDEX IF EXISTS public.idx_notebook_collaborators_user_id;
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_pages_created_by;
DROP INDEX IF EXISTS public.idx_pages_parent_id;
DROP INDEX IF EXISTS public.idx_project_collaborators_user_id;
DROP INDEX IF EXISTS public.idx_tasks_created_by;
DROP INDEX IF EXISTS public.idx_tasks_project_id;

-- End of migration. 