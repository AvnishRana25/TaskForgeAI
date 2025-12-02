-- Add code_submission and repo_url columns to tasks table
-- This allows users to submit code directly or provide a repository URL

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS code_submission text,
ADD COLUMN IF NOT EXISTS repo_url text;

-- Add detailed_feedback column to evaluations table
ALTER TABLE public.evaluations
ADD COLUMN IF NOT EXISTS detailed_feedback text;

-- Update the status check constraint to include 'error' status
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('pending', 'evaluated', 'error'));

