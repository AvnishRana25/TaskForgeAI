import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutShell } from '../components/LayoutShell'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth'
import type { Task, Evaluation, Payment } from '../lib/types'
import { formatDate, formatScoreDisplay } from '../lib/formatting'

interface ReportData {
  task: Task
  evaluation: Evaluation | null
  payment: Payment | null
}

export function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReports() {
      if (!user) return

      try {
        // Fetch all tasks with evaluations
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'evaluated')
          .order('created_at', { ascending: false })

        if (tasksError) throw tasksError

        // Fetch evaluations and payments for each task
        const reportsData: ReportData[] = await Promise.all(
          (tasks || []).map(async (task) => {
            const [evalResult, paymentResult] = await Promise.all([
              supabase.from('evaluations').select('*').eq('task_id', task.id).single(),
              supabase.from('payments').select('*').eq('task_id', task.id).eq('user_id', user.id).single(),
            ])

            return {
              task,
              evaluation: evalResult.data,
              payment: paymentResult.data,
            }
          })
        )

        setReports(reportsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [user])

  // Calculate stats
  const stats = {
    total: reports.length,
    unlocked: reports.filter(r => r.payment?.status === 'paid').length,
    avgScore: reports.length > 0 
      ? Math.round(reports.reduce((sum, r) => sum + (r.evaluation?.score_overall || 0), 0) / reports.length)
      : 0,
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    if (score >= 50) return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    return 'text-red-400 bg-red-500/10 border-red-500/30'
  }

  return (
    <LayoutShell>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
                <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-100">Evaluation Reports</h1>
                <p className="text-zinc-400">View all your completed code evaluations</p>
              </div>
            </div>
            <Link
              to="/task/new"
              className="group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-emerald-400 to-cyan-400" />
              <span className="relative flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 stagger-fade-in">
            {[
              { 
                label: 'Total Reports', 
                value: stats.total,
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                gradient: 'from-violet-500/20 to-purple-500/20',
                borderColor: 'border-violet-500/30',
                textColor: 'text-violet-400',
              },
              { 
                label: 'Unlocked', 
                value: stats.unlocked,
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                ),
                gradient: 'from-emerald-500/20 to-teal-500/20',
                borderColor: 'border-emerald-500/30',
                textColor: 'text-emerald-400',
              },
              { 
                label: 'Average Score', 
                value: stats.avgScore,
                suffix: '/100',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                gradient: 'from-cyan-500/20 to-blue-500/20',
                borderColor: 'border-cyan-500/30',
                textColor: 'text-cyan-400',
              },
            ].map((stat) => (
              <div 
                key={stat.label}
                className={`glass rounded-2xl p-6 border-zinc-800/50 hover:${stat.borderColor} transition-all duration-300 card-interactive`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">{stat.label}</p>
                    <p className={`text-4xl font-bold ${stat.textColor} font-mono number-display`}>
                      {stat.value}
                      {stat.suffix && <span className="text-lg text-zinc-500">{stat.suffix}</span>}
                    </p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center ${stat.textColor} border ${stat.borderColor}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 border-zinc-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl loading-shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/3 rounded-lg loading-shimmer" />
                    <div className="h-4 w-1/4 rounded-lg loading-shimmer" />
                  </div>
                  <div className="h-10 w-20 rounded-lg loading-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-12 border-red-500/20 bg-red-500/5 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 font-medium mb-2">Error loading reports</p>
            <p className="text-zinc-500 text-sm">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="glass rounded-2xl p-12 border-zinc-800/50 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-2xl" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700/50">
                <svg className="w-10 h-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">No reports yet</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Submit a coding task to get your first AI-powered evaluation report.
            </p>
            <Link
              to="/task/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 btn-shine"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Task
            </Link>
          </div>
        ) : (
          <div className="space-y-4 stagger-fade-in">
            {reports.map((report, index) => {
              const score = report.evaluation?.score_overall ?? 0
              const scoreDisplay = formatScoreDisplay(score)
              const isPaid = report.payment?.status === 'paid'

              return (
                <Link
                  key={report.task.id}
                  to={`/task/${report.task.id}`}
                  className="group block glass rounded-2xl p-6 border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-300 card-interactive"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Score Circle */}
                      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border ${getScoreColor(score)}`}>
                        <span className="text-2xl font-bold font-mono">{score}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
                            {report.task.title}
                          </h3>
                          {isPaid && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                              Full
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(report.task.created_at)}
                          </span>
                          <span className="text-zinc-700">•</span>
                          <span className={`${score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                            {scoreDisplay.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-zinc-400 group-hover:text-emerald-400 transition-colors">
                        <span>View Report</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </LayoutShell>
  )
}
