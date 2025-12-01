import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { LayoutShell } from '../components/LayoutShell'
import { EvaluationSummary } from '../components/EvaluationSummary'
import { EvaluationFull } from '../components/EvaluationFull'
import { PaymentStatusBadge } from '../components/PaymentStatusBadge'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth'
import { createCheckoutSession, evaluateTask } from '../lib/api'
import type { Task, Evaluation, Payment } from '../lib/types'
import { formatDate } from '../lib/formatting'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!id || !user) return

      try {
        // Fetch task
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single()

        if (taskError) throw taskError
        setTask(taskData)

        // Fetch evaluation
        const { data: evalData } = await supabase
          .from('evaluations')
          .select('*')
          .eq('task_id', id)
          .single()

        if (evalData) setEvaluation(evalData)

        // Fetch payment
        const { data: paymentData } = await supabase
          .from('payments')
          .select('*')
          .eq('task_id', id)
          .eq('user_id', user.id)
          .single()

        if (paymentData) setPayment(paymentData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user])

  const handleUnlock = async () => {
    if (!task) return
    setIsUnlocking(true)
    setError(null)

    try {
      const { url } = await createCheckoutSession(task.id)
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
      setIsUnlocking(false)
    }
  }

  const handleRetryEvaluation = async () => {
    if (!task) return
    setIsRetrying(true)
    setError(null)

    try {
      await evaluateTask(task.id)
      // Refresh the page to get new evaluation
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry evaluation')
      setIsRetrying(false)
    }
  }

  const isPaid = payment?.status === 'paid'

  if (loading) {
    return (
      <LayoutShell>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/3 rounded-lg loading-shimmer" />
            <div className="glass rounded-2xl p-8 border-zinc-800/50">
              <div className="space-y-4">
                <div className="h-6 w-2/3 rounded-lg loading-shimmer" />
                <div className="h-4 w-full rounded-lg loading-shimmer" />
                <div className="h-4 w-3/4 rounded-lg loading-shimmer" />
              </div>
            </div>
            <div className="glass rounded-2xl p-8 border-zinc-800/50">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full loading-shimmer" />
                <div className="space-y-3 flex-1">
                  <div className="h-8 w-1/4 rounded-lg loading-shimmer" />
                  <div className="h-4 w-1/2 rounded-lg loading-shimmer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutShell>
    )
  }

  if (error || !task) {
    return (
      <LayoutShell>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="glass rounded-2xl p-12 border-red-500/20 bg-red-500/5">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">Task not found</h2>
            <p className="text-zinc-400 mb-8">{error || 'The task you are looking for does not exist.'}</p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-200 rounded-xl hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </LayoutShell>
    )
  }

  return (
    <LayoutShell>
      <div className="max-w-4xl mx-auto page-enter">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-6 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700/50 flex-shrink-0">
                <svg className="w-7 h-7 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-1">{task.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(task.created_at)}
                  </span>
                  <span className="text-zinc-700">•</span>
                  <PaymentStatusBadge payment={payment} />
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              task.status === 'evaluated' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : task.status === 'pending'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {task.status === 'evaluated' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {task.status === 'pending' && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {task.status === 'error' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {task.status === 'evaluated' ? 'Evaluated' : task.status === 'pending' ? 'Pending' : 'Error'}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-entrance">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Task Details */}
        <div className="glass rounded-2xl p-6 border-zinc-800/50 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
              <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Task Description</h2>
              <p className="text-xs text-zinc-500">What this code should accomplish</p>
            </div>
          </div>
          <p className="text-zinc-300 leading-relaxed">{task.description}</p>
          
          {task.repo_url && (
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
              <a 
                href={task.repo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors group"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                View Repository
                <svg className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* Code Submission */}
        {task.code_submission && (
          <div className="glass rounded-2xl p-6 border-zinc-800/50 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">Code Submission</h2>
                  <p className="text-xs text-zinc-500">{task.code_submission.split('\n').length} lines</p>
                </div>
              </div>
            </div>
            <pre className="bg-zinc-900/80 rounded-xl p-5 overflow-x-auto text-sm font-mono text-zinc-300 border border-zinc-800/50 max-h-80 overflow-y-auto">
              <code>{task.code_submission}</code>
            </pre>
          </div>
        )}

        {/* Evaluation Section */}
        {task.status === 'pending' && (
          <div className="glass rounded-2xl p-12 border-amber-500/20 bg-amber-500/5 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                <svg className="w-10 h-10 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Evaluation in Progress</h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              Our AI is analyzing your code. This usually takes a few seconds. The page will update automatically when complete.
            </p>
          </div>
        )}

        {task.status === 'error' && (
          <div className="glass rounded-2xl p-12 border-red-500/20 bg-red-500/5 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Evaluation Failed</h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">
              There was an error evaluating your code. This might be a temporary issue.
            </p>
            <button
              onClick={handleRetryEvaluation}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50"
            >
              {isRetrying ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Retrying...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Evaluation
                </>
              )}
            </button>
          </div>
        )}

        {evaluation && (
          <div className="space-y-6">
            <EvaluationSummary evaluation={evaluation} />

            {/* Full Report Section */}
            {isPaid ? (
              <EvaluationFull evaluation={evaluation} />
            ) : (
              <div className="glass rounded-2xl border-zinc-800/50 overflow-hidden">
                {/* Blurred preview */}
                <div className="relative">
                  <div className="blur-content p-6">
                    <div className="space-y-4">
                      <div className="h-6 w-1/3 bg-zinc-700/50 rounded" />
                      <div className="h-4 w-full bg-zinc-700/50 rounded" />
                      <div className="h-4 w-2/3 bg-zinc-700/50 rounded" />
                      <div className="h-4 w-3/4 bg-zinc-700/50 rounded" />
                      <div className="h-4 w-1/2 bg-zinc-700/50 rounded" />
                    </div>
                  </div>
                  
                  {/* Unlock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-zinc-900/95 via-zinc-900/80 to-transparent">
                    <div className="text-center p-8">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl" />
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                          <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-zinc-100 mb-2">Unlock Full Report</h3>
                      <p className="text-zinc-400 mb-6 max-w-md">
                        Get detailed insights, specific code improvements, and actionable recommendations to enhance your code quality.
                      </p>
                      <div className="flex flex-col items-center gap-3">
                        <button
                          onClick={handleUnlock}
                          disabled={isUnlocking}
                          className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-emerald-400 to-cyan-400" />
                          <span className="relative flex items-center gap-2">
                            {isUnlocking ? (
                              <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                                Unlock Report - $4.99
                              </>
                            )}
                          </span>
                        </button>
                        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Secure payment via Stripe
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutShell>
  )
}
