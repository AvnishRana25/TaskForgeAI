import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useEffect, useState } from 'react'

export function LandingPage() {
  const { user, loading } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="mesh-gradient" />
      <div className="grid-pattern" />

      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] orb" />
        <div className="absolute top-40 right-[15%] w-96 h-96 bg-violet-500/15 rounded-full blur-[120px] orb orb-delay-1" />
        <div className="absolute bottom-20 left-[20%] w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] orb orb-delay-2" />
        <div className="absolute bottom-40 right-[25%] w-64 h-64 bg-purple-500/15 rounded-full blur-[80px] orb orb-delay-3" />
      </div>

      {/* Spotlight effect following mouse */}
      <div 
        className="fixed inset-0 pointer-events-none z-10 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.06), transparent 40%)`
        }}
      />

      {/* Header */}
      <header className="relative z-20 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-xl group-hover:bg-emerald-500/50 transition-all duration-500" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm tracking-tight">TF</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-lg text-zinc-100">Task</span>
                <span className="font-bold text-lg gradient-text">Forge</span>
                <span className="font-medium text-lg text-zinc-500 ml-1">AI</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="group relative px-5 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <span className="relative">Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-emerald-500/30 text-sm font-medium mb-8 animate-entrance">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-emerald-400">AI-Powered Code Analysis</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">Built with Gemini</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-50 leading-[1.1] tracking-tight animate-entrance" style={{ animationDelay: '0.1s' }}>
              Evaluate Your
            </h1>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mt-2 animate-entrance" style={{ animationDelay: '0.2s' }}>
              <span className="gradient-text-animated">Coding Tasks</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-entrance" style={{ animationDelay: '0.3s' }}>
              Get instant AI-powered feedback on your coding assignments. 
              <span className="text-zinc-300"> Identify strengths</span>, 
              <span className="text-zinc-300"> discover improvements</span>, and 
              <span className="text-emerald-400"> level up your skills</span>.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-entrance" style={{ animationDelay: '0.4s' }}>
              <Link
                to="/signup"
                className="group relative w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                <span className="relative flex items-center justify-center gap-2">
                  Get Started Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/login"
                className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold glass text-zinc-200 rounded-2xl hover:bg-zinc-800/80 transition-all border border-zinc-700/50 hover:border-zinc-600 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Log In
              </Link>
            </div>

            {/* Trust indicators - Using SVG icons instead of emojis */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4 animate-entrance" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-zinc-800/50 text-zinc-400 text-sm">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-zinc-800/50 text-zinc-400 text-sm">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Instant feedback</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-zinc-800/50 text-zinc-400 text-sm">
                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure & private</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-zinc-800/50 text-zinc-400 text-sm">
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Powered by Gemini AI</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-32 grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div
              className="group glass rounded-2xl p-8 border border-zinc-800/50 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 animate-entrance"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-3">AI-Powered Analysis</h3>
              <p className="text-zinc-400 leading-relaxed">
                Advanced Gemini AI evaluates your code quality, patterns, and best practices with detailed insights.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="group glass rounded-2xl p-8 border border-zinc-800/50 hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1 animate-entrance"
              style={{ animationDelay: '0.7s' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-3">Detailed Scoring</h3>
              <p className="text-zinc-400 leading-relaxed">
                Get a comprehensive 0-100 score with visual breakdowns of strengths and areas for improvement.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="group glass rounded-2xl p-8 border border-zinc-800/50 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 animate-entrance"
              style={{ animationDelay: '0.8s' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-3">Instant Feedback</h3>
              <p className="text-zinc-400 leading-relaxed">
                Receive actionable insights within seconds to improve your code quality immediately.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-32 animate-entrance" style={{ animationDelay: '0.9s' }}>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full glass border border-zinc-700/50 text-zinc-400 text-sm font-medium mb-4">
                Simple Process
              </span>
              <h2 className="text-4xl font-bold text-zinc-100 mb-4">How it works</h2>
              <p className="text-zinc-400 max-w-xl mx-auto">Get your code evaluated in three simple steps</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection lines */}
              <div className="hidden md:block absolute top-10 left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-0.5">
                <div className="h-full bg-gradient-to-r from-emerald-500/50 via-violet-500/50 to-amber-500/50 rounded-full" />
              </div>
              
              {/* Step 1 */}
              <div className="relative group text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl glass border border-emerald-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-9 h-9 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <span className="text-xs font-bold text-white">01</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-3">Submit Your Task</h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
                  Describe your coding task and paste your code or repository link
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative group text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl glass border border-violet-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-9 h-9 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="text-xs font-bold text-white">02</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-3">AI Analyzes</h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
                  Our AI reviews your code for quality, patterns, and best practices
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative group text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl glass border border-amber-500/30 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-9 h-9 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <span className="text-xs font-bold text-white">03</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-3">Get Feedback</h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
                  Receive detailed scores, strengths, and improvement suggestions
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-32 animate-entrance" style={{ animationDelay: '1s' }}>
            <div className="glass rounded-3xl p-12 border border-zinc-800/50 relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-violet-500/5" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
                  Ready to improve your code?
                </h2>
                <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                  Join developers who use TaskForge AI to get instant feedback and level up their coding skills.
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
                >
                  Start Evaluating Now
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">TF</span>
              </div>
              <p className="text-zinc-500 text-sm">
                © 2024 TaskForge AI. Built for the Gen-AI Developer Hiring Challenge.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                All systems operational
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1">
                Made with
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                and AI
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
