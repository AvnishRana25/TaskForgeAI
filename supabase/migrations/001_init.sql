-- TaskForge AI Database Schema
-- This migration creates all tables, enables RLS, and sets up policies

-- ============================================================
-- TABLE: tasks
-- Stores coding tasks submitted by users for AI evaluation
-- ============================================================
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  code_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluated')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
-- Users can only see their own tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tasks
CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster user-based queries
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);

-- ============================================================
-- TABLE: evaluations
-- Stores AI evaluation results for tasks
-- ============================================================
CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  model text,
  score_overall int CHECK (score_overall >= 0 AND score_overall <= 100),
  strengths text,
  improvements text,
  raw_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for evaluations
-- Users can only view evaluations for tasks they own
CREATE POLICY "Users can view evaluations for own tasks"
  ON public.evaluations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = evaluations.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Service role can insert evaluations (edge functions use service role)
CREATE POLICY "Service role can insert evaluations"
  ON public.evaluations FOR INSERT
  WITH CHECK (true);

-- Index for faster task-based queries
CREATE INDEX idx_evaluations_task_id ON public.evaluations(task_id);
CREATE INDEX idx_evaluations_created_at ON public.evaluations(created_at DESC);

-- ============================================================
-- TABLE: payments
-- Stores payment records for unlocking full reports
-- ============================================================
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'stripe',
  provider_session_id text,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
-- Users can view their own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own payments (for creating pending payment records)
CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can update payments (for webhook updates)
CREATE POLICY "Service role can update payments"
  ON public.payments FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_task_id ON public.payments(task_id);
CREATE INDEX idx_payments_provider_session_id ON public.payments(provider_session_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- ============================================================
-- GRANT permissions to authenticated users and service role
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT ON public.evaluations TO authenticated;
GRANT SELECT, INSERT ON public.payments TO authenticated;

-- Service role needs full access for edge functions
GRANT ALL ON public.tasks TO service_role;
GRANT ALL ON public.evaluations TO service_role;
GRANT ALL ON public.payments TO service_role;

