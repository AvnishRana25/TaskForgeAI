import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, ProtectedRoute } from './lib/auth'

// Routes
import { LandingPage } from './routes/LandingPage'
import { LoginPage } from './routes/LoginPage'
import { SignupPage } from './routes/SignupPage'
import { DashboardPage } from './routes/DashboardPage'
import { NewTaskPage } from './routes/NewTaskPage'
import { TaskDetailPage } from './routes/TaskDetailPage'
import { ReportsPage } from './routes/ReportsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task/new"
            element={
              <ProtectedRoute>
                <NewTaskPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task/:id"
            element={
              <ProtectedRoute>
                <TaskDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-surface-950 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-surface-700 mb-4">404</h1>
                  <p className="text-surface-400 mb-6">Page not found</p>
                  <a
                    href="/"
                    className="text-brand-400 hover:text-brand-300 underline"
                  >
                    Go home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

