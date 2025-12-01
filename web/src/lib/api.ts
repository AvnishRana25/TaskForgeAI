import { supabase } from './supabaseClient'
import type {
  Task,
  Evaluation,
  Payment,
  TaskWithDetails,
  NewTaskFormData,
  EvaluateTaskResponse,
  CreateCheckoutResponse,
} from './types'

// Get the Supabase functions URL from the client
const getFunctionsUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  // Convert project URL to functions URL
  // e.g., https://xxx.supabase.co -> https://xxx.supabase.co/functions/v1
  return `${supabaseUrl}/functions/v1`
}

// Helper to get auth headers
async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  }
}

// ============ TASKS ============

export async function createTask(data: NewTaskFormData): Promise<Task> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description,
      code_url: data.code_url || null,
      code_submission: data.code_submission || null,
      repo_url: data.repo_url || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return task as Task
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Task[]
}

export async function getTask(taskId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(error.message)
  }
  return data as Task
}

export async function getTaskWithDetails(
  taskId: string
): Promise<TaskWithDetails | null> {
  // Get task
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (taskError) {
    if (taskError.code === 'PGRST116') return null
    throw new Error(taskError.message)
  }

  // Get latest evaluation for this task
  const { data: evaluations, error: evalError } = await supabase
    .from('evaluations')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (evalError) throw new Error(evalError.message)

  // Get payment status for this task
  const { data: payments, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (paymentError) throw new Error(paymentError.message)

  return {
    ...task,
    evaluation: evaluations?.[0] ?? null,
    payment: payments?.[0] ?? null,
  } as TaskWithDetails
}

// ============ EVALUATIONS ============

export async function getEvaluation(
  taskId: string
): Promise<Evaluation | null> {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data as Evaluation
}

export async function evaluateTask(
  taskId: string
): Promise<EvaluateTaskResponse> {
  const headers = await getAuthHeaders()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const response = await fetch(`${getFunctionsUrl()}/evaluate-task`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ taskId, userId: user.id }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Evaluation failed: ${response.status}`)
  }

  return response.json()
}

// Alias for backward compatibility
export const runEvaluation = evaluateTask

// ============ PAYMENTS ============

export async function getPayment(taskId: string): Promise<Payment | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data as Payment
}

export async function createCheckoutSession(
  taskId: string
): Promise<CreateCheckoutResponse> {
  const headers = await getAuthHeaders()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const response = await fetch(`${getFunctionsUrl()}/create-checkout-session`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ taskId, userId: user.id }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `Checkout creation failed: ${response.status}`)
  }

  return response.json()
}

// ============ REPORTS ============

export async function getTasksWithPaymentStatus(): Promise<TaskWithDetails[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get all tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (tasksError) throw new Error(tasksError.message)

  // Get all evaluations for user's tasks
  const taskIds = tasks.map((t: Task) => t.id)
  
  const { data: evaluations, error: evalError } = await supabase
    .from('evaluations')
    .select('*')
    .in('task_id', taskIds)

  if (evalError) throw new Error(evalError.message)

  // Get all payments for user's tasks
  const { data: payments, error: paymentError } = await supabase
    .from('payments')
    .select('*')
    .in('task_id', taskIds)

  if (paymentError) throw new Error(paymentError.message)

  // Combine data
  return tasks.map((task: Task) => ({
    ...task,
    evaluation:
      evaluations?.find((e: Evaluation) => e.task_id === task.id) ?? null,
    payment: payments?.find((p: Payment) => p.task_id === task.id) ?? null,
  }))
}
