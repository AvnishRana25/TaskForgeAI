import { ReactNode } from 'react'
import { NavBar } from './NavBar'

interface LayoutShellProps {
  children: ReactNode
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div className="mesh-gradient" />
      <div className="grid-pattern" />
      
      {/* Navigation */}
      <NavBar />
      
      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">TF</span>
              </div>
              <p className="text-zinc-500 text-sm">
                © 2024 TaskForge AI
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 status-pulse"></span>
                All systems operational
              </span>
              <span className="text-zinc-700">•</span>
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
