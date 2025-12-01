// Database types matching Supabase schema

export interface Task {
  id: string
  user_id: string
  title: string
  description: string
  code_url: string | null
  code_submission: string | null
  repo_url: string | null
  status: 'pending' | 'evaluated' | 'error'
  created_at: string
}

export interface Evaluation {
  id: string
  task_id: string
  model: string | null
  score_overall: number | null
  strengths: string | null
  improvements: string | null
  detailed_feedback: string | null
  raw_response: Record<string, unknown> | null
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  task_id: string
  provider: string
  provider_session_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed'
  created_at: string
}

// API response types
export interface EvaluateTaskResponse {
  id: string
  score_overall: number
  strengths: string
  improvements: string
  detailed_feedback: string
}

export interface CreateCheckoutResponse {
  url: string
}

// Combined view types
export interface TaskWithDetails extends Task {
  evaluation?: Evaluation | null
  payment?: Payment | null
}

// Form types
export interface NewTaskFormData {
  title: string
  description: string
  code_url?: string
  code_submission?: string
  repo_url?: string
}

// Auth types
export interface AuthUser {
  id: string
  email: string
}
