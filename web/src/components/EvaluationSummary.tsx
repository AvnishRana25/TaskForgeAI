import { useEffect, useState } from 'react'
import type { Evaluation } from '../lib/types'
import { formatScoreDisplay } from '../lib/formatting'

interface EvaluationSummaryProps {
  evaluation: Evaluation
}

export function EvaluationSummary({ evaluation }: EvaluationSummaryProps) {
  const scoreDisplay = formatScoreDisplay(evaluation.score_overall)
  const score = evaluation.score_overall ?? 0
  const [animatedScore, setAnimatedScore] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  
  // Animate score counting up
  useEffect(() => {
    setIsVisible(true)
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [score])
  
  // Calculate the stroke dashoffset for the circular progress
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const getScoreColor = () => {
    if (score >= 90) return { gradient: 'from-emerald-400 to-cyan-400', glow: 'rgba(16, 185, 129, 0.4)' }
    if (score >= 70) return { gradient: 'from-amber-400 to-yellow-400', glow: 'rgba(245, 158, 11, 0.4)' }
    if (score >= 50) return { gradient: 'from-orange-400 to-amber-400', glow: 'rgba(249, 115, 22, 0.4)' }
    return { gradient: 'from-red-400 to-rose-400', glow: 'rgba(239, 68, 68, 0.4)' }
  }

  const scoreColor = getScoreColor()

  return (
    <div className={`glass rounded-2xl p-8 border-zinc-800/50 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Evaluation Summary</h3>
            <p className="text-xs text-zinc-500">AI-powered code analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 status-pulse" />
          <span className="text-xs text-zinc-400 font-mono">{evaluation.model || 'gemini-2.0-flash'}</span>
        </div>
      </div>

      {/* Score Display with Circular Progress */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        <div className="relative group">
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl transition-all duration-500 group-hover:blur-3xl"
            style={{ background: scoreColor.glow, opacity: 0.5 }}
          />
          
          {/* Outer ring decoration */}
          <div className="absolute inset-[-8px] rounded-full border-2 border-dashed border-zinc-700/50 animate-spin" style={{ animationDuration: '20s' }} />
          
          {/* Circular progress */}
          <svg className="w-36 h-36 transform -rotate-90 relative">
            {/* Background circle with gradient */}
            <circle
              cx="72"
              cy="72"
              r="45"
              fill="none"
              stroke="url(#bgGradient)"
              strokeWidth="10"
              className="opacity-20"
            />
            {/* Progress circle */}
            <circle
              cx="72"
              cy="72"
              r="45"
              fill="none"
              stroke={`url(#scoreGradient-${score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor'})`}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out drop-shadow-lg"
              style={{ filter: `drop-shadow(0 0 10px ${scoreColor.glow})` }}
            />
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3f3f46" />
                <stop offset="100%" stopColor="#27272a" />
              </linearGradient>
              <linearGradient id="scoreGradient-good" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="scoreGradient-fair" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="scoreGradient-poor" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score text in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold font-mono bg-gradient-to-r ${scoreColor.gradient} bg-clip-text text-transparent number-display`}>
              {animatedScore}
            </span>
            <span className="text-sm text-zinc-500 font-medium">/ 100</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className={`text-3xl font-bold bg-gradient-to-r ${scoreColor.gradient} bg-clip-text text-transparent`}>
              {scoreDisplay.label}
            </span>
            {score >= 90 && <span className="text-2xl">🏆</span>}
            {score >= 70 && score < 90 && <span className="text-2xl">⭐</span>}
          </div>
          <p className="text-zinc-400 leading-relaxed max-w-md">
            {score >= 90 && "Outstanding work! Your code demonstrates exceptional quality and best practices."}
            {score >= 70 && score < 90 && "Great job! Your code is solid with minor areas for improvement."}
            {score >= 50 && score < 70 && "Good effort! There are some areas that could use improvement."}
            {score < 50 && "Keep practicing! Review the suggestions below to improve your code."}
          </p>
          
          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { label: 'Excellent', threshold: 90, color: 'emerald' },
              { label: 'Good', threshold: 70, color: 'amber' },
              { label: 'Fair', threshold: 50, color: 'orange' },
            ].map((tier) => (
              <div 
                key={tier.label}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all ${
                  score >= tier.threshold 
                    ? `bg-${tier.color}-500/20 text-${tier.color}-400 border border-${tier.color}-500/30` 
                    : 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${score >= tier.threshold ? `bg-${tier.color}-400` : 'bg-zinc-600'}`} />
                {tier.threshold}+ {tier.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          <span>Score Breakdown</span>
          <span>{animatedScore}%</span>
        </div>
        <div className="h-3 bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700/50">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ 
              width: `${animatedScore}%`,
              background: `linear-gradient(90deg, ${score >= 70 ? '#10b981, #06b6d4' : score >= 50 ? '#f59e0b, #f97316' : '#ef4444, #f43f5e'})`
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
        </div>
        
        {/* Threshold markers */}
        <div className="relative h-6 mt-1">
          {[50, 70, 90].map((threshold) => (
            <div 
              key={threshold}
              className="absolute flex flex-col items-center"
              style={{ left: `${threshold}%`, transform: 'translateX(-50%)' }}
            >
              <div className={`w-px h-2 ${score >= threshold ? 'bg-emerald-500/50' : 'bg-zinc-700'}`} />
              <span className={`text-[10px] ${score >= threshold ? 'text-emerald-400' : 'text-zinc-600'}`}>{threshold}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
