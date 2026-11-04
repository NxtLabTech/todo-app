-- Adds a priority level to todos. Safe to run more than once.
ALTER TABLE public.todos
  ADD COLUMN IF NOT EXISTS priority VARCHAR(10) NOT NULL DEFAULT 'medium'
  CHECK (priority IN ('high', 'medium', 'low'));
