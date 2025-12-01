import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutShell } from '../components/LayoutShell'
import { TaskCard } from '../components/TaskCard'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth'
import type { Task } from '../lib/types'

export function DashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTasks() {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setTasks(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [user])

  const stats = {
    total: tasks.length,
    evaluated: tasks.filter(t => t.status === 'evaluated').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  }

  const firstName = user?.email?.split('@')[0] || 'Developer'

  return (
    <LayoutShell>
      <div className="page-enter">
        {/* Welcome Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">👋</span>
                <h1 className="text-3xl font-bold text-zinc-100">
                  Welcome back, <span className="gradient-text">{firstName}</span>
                </h1>
              </div>
              <p className="text-zinc-400">
                {tasks.length === 0 
                  ? "Ready to get your first code evaluation?" 
                  : "Here's an overview of your coding tasks and evaluations."}
              </p>
            </div>
            <Link
              to="/task/new"
              className="group relative inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25"
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
        {tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 stagger-fade-in">
            {[
              { 
                label: 'Total Tasks', 
                value: stats.total, 
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                color: 'violet',
                gradient: 'from-violet-500/20 to-purple-500/20',
                borderColor: 'border-violet-500/30',
                textColor: 'text-violet-400',
              },
              { 
                label: 'Evaluated', 
                value: stats.evaluated, 
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: 'emerald',
                gradient: 'from-emerald-500/20 to-teal-500/20',
                borderColor: 'border-emerald-500/30',
                textColor: 'text-emerald-400',
              },
              { 
                label: 'Pending', 
                value: stats.pending, 
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: 'amber',
                gradient: 'from-amber-500/20 to-orange-500/20',
                borderColor: 'border-amber-500/30',
                textColor: 'text-amber-400',
              },
            ].map((stat) => (
              <div 
                key={stat.label}
                className={`glass rounded-2xl p-6 border-zinc-800/50 hover:${stat.borderColor} transition-all duration-300 card-interactive spotlight noise`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">{stat.label}</p>
                    <p className={`text-4xl font-bold ${stat.textColor} font-mono number-display`}>
                      {stat.value}
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

        {/* Tasks List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700/50">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-100">Your Tasks</h2>
                <p className="text-sm text-zinc-500">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
              </div>
            </div>
            {tasks.length > 0 && (
              <Link 
                to="/reports" 
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors group"
              >
                View all reports
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 border-zinc-800/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl loading-shimmer" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-1/3 rounded-lg loading-shimmer" />
                      <div className="h-4 w-2/3 rounded-lg loading-shimmer" />
                    </div>
                    <div className="h-8 w-24 rounded-lg loading-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="glass rounded-2xl p-8 border-red-500/20 bg-red-500/5 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-400 font-medium mb-2">Error loading tasks</p>
              <p className="text-zinc-500 text-sm">{error}</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="glass rounded-2xl p-12 border-zinc-800/50 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700/50">
                  <svg className="w-10 h-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">No tasks yet</h3>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Submit your first coding task to get instant AI-powered feedback and improve your skills.
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
            <div className="grid gap-4 stagger-fade-in">
              {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutShell>
  )
}
