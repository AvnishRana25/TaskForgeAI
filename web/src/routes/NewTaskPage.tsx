import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutShell } from '../components/LayoutShell'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth'
import { evaluateTask } from '../lib/api'

export function NewTaskPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [codeSubmission, setCodeSubmission] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Create task
      const { data: task, error: createError } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title,
          description,
          code_submission: codeSubmission || null,
          repo_url: repoUrl || null,
          status: 'pending',
        })
        .select()
        .single()

      if (createError) throw createError

      // Trigger AI evaluation
      await evaluateTask(task.id)

      navigate(`/task/${task.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, title: 'Task Details', icon: '📝' },
    { number: 2, title: 'Code Submission', icon: '💻' },
    { number: 3, title: 'Review', icon: '✨' },
  ]

  const isStep1Valid = title.trim().length > 0 && description.trim().length > 0
  const isStep2Valid = codeSubmission.trim().length > 0 || repoUrl.trim().length > 0

  return (
    <LayoutShell>
      <div className="max-w-3xl mx-auto page-enter">
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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-100">New Task</h1>
              <p className="text-zinc-400">Submit your code for AI-powered evaluation</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${
                      currentStep >= step.number 
                        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30' 
                        : 'bg-zinc-800/50 border-zinc-700/50'
                    } border`}
                  >
                    {step.icon}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${currentStep >= step.number ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-px mx-4 transition-all duration-300 ${
                    currentStep > step.number ? 'bg-emerald-500/50' : 'bg-zinc-700/50'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3 animate-entrance">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Task Details */}
          <div className={`glass rounded-2xl p-6 border-zinc-800/50 transition-all duration-300 ${currentStep === 1 ? 'ring-2 ring-emerald-500/30' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">📝</span>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Task Details</h2>
                <p className="text-sm text-zinc-500">Describe what your code does</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-zinc-300">
                  Task Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setCurrentStep(1)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all input-glow"
                  placeholder="e.g., React Todo App Implementation"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onFocus={() => setCurrentStep(1)}
                  required
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all resize-none input-glow"
                  placeholder="Describe the task requirements, what the code should do, and any specific criteria..."
                />
              </div>
            </div>
          </div>

          {/* Step 2: Code Submission */}
          <div className={`glass rounded-2xl p-6 border-zinc-800/50 transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-emerald-500/30' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">💻</span>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Code Submission</h2>
                <p className="text-sm text-zinc-500">Paste your code or provide a repository URL</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="code" className="block text-sm font-medium text-zinc-300">
                  Code
                </label>
                <div className="relative">
                  <textarea
                    id="code"
                    value={codeSubmission}
                    onChange={(e) => setCodeSubmission(e.target.value)}
                    onFocus={() => setCurrentStep(2)}
                    rows={12}
                    className="w-full px-4 py-3.5 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all resize-none font-mono text-sm input-glow"
                    placeholder="// Paste your code here..."
                  />
                  {codeSubmission && (
                    <div className="absolute top-3 right-3 text-xs text-zinc-500 bg-zinc-800/80 px-2 py-1 rounded">
                      {codeSubmission.split('\n').length} lines
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-sm text-zinc-500 font-medium">OR</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <div className="space-y-2">
                <label htmlFor="repoUrl" className="block text-sm font-medium text-zinc-300">
                  Repository URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <input
                    id="repoUrl"
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onFocus={() => setCurrentStep(2)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all input-glow"
                    placeholder="https://github.com/username/repository"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Review & Submit */}
          <div className={`glass rounded-2xl p-6 border-zinc-800/50 transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-emerald-500/30' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl">✨</span>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Review & Submit</h2>
                <p className="text-sm text-zinc-500">Confirm your submission details</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isStep1Valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {isStep1Valid ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">1</span>
                  )}
                </div>
                <span className={isStep1Valid ? 'text-zinc-300' : 'text-zinc-500'}>Task details completed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isStep2Valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {isStep2Valid ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">2</span>
                  )}
                </div>
                <span className={isStep2Valid ? 'text-zinc-300' : 'text-zinc-500'}>Code or repository provided</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isStep1Valid || !isStep2Valid}
              onFocus={() => setCurrentStep(3)}
              className="group relative w-full py-4 px-6 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-emerald-400 to-cyan-400" />
              <span className="relative flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting & Evaluating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>Submit for AI Evaluation</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </LayoutShell>
  )
}
