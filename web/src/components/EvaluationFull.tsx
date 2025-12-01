import type { Evaluation } from '../lib/types'
import ReactMarkdown from 'react-markdown'

interface EvaluationFullProps {
  evaluation: Evaluation
}

export function EvaluationFull({ evaluation }: EvaluationFullProps) {
  const sections = [
    { 
      title: 'Strengths', 
      content: evaluation.strengths,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/5',
    },
    { 
      title: 'Areas for Improvement', 
      content: evaluation.improvements,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'amber',
      gradient: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/5',
    },
    { 
      title: 'Detailed Feedback', 
      content: evaluation.detailed_feedback,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'violet',
      gradient: 'from-violet-500/20 to-purple-500/20',
      borderColor: 'border-violet-500/30',
      textColor: 'text-violet-400',
      bgColor: 'bg-violet-500/5',
    },
  ]

  return (
    <div className="space-y-6 stagger-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border-zinc-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Full Evaluation Report</h2>
              <p className="text-xs text-zinc-500">Detailed AI-powered analysis of your code</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-emerald-400">Unlocked</span>
          </div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, index) => (
        <div 
          key={section.title}
          className={`glass rounded-2xl border-zinc-800/50 overflow-hidden ${section.bgColor}`}
          style={{ animationDelay: `${(index + 1) * 0.1}s` }}
        >
          {/* Section Header */}
          <div className={`flex items-center gap-3 px-6 py-4 border-b ${section.borderColor} bg-zinc-900/30`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center border ${section.borderColor} ${section.textColor}`}>
              {section.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">{section.title}</h3>
              <p className="text-xs text-zinc-500">
                {section.title === 'Strengths' && 'What you did well'}
                {section.title === 'Areas for Improvement' && 'Where you can grow'}
                {section.title === 'Detailed Feedback' && 'In-depth analysis'}
              </p>
            </div>
          </div>
          
          {/* Section Content */}
          <div className="p-6">
            <div className="markdown-content prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{section.content || 'No content available.'}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}

      {/* Summary Footer */}
      <div className="glass rounded-2xl p-6 border-zinc-800/50 bg-gradient-to-br from-zinc-900/50 to-zinc-800/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Need help understanding this feedback?</p>
              <p className="text-xs text-zinc-500">Review each section carefully and apply the suggestions to improve your code.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Generated by {evaluation.model || 'Gemini AI'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
