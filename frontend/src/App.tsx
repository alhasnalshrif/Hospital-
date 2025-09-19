import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/layouts/Layout'
import { LoginPage } from './components/pages/LoginPage'
import { DashboardPage } from './components/pages/DashboardPage'
import { PatientsPage } from './components/pages/PatientsPage'
import { AppointmentsPage } from './components/pages/AppointmentsPage'
import { MedicalRecordsPage } from './components/pages/MedicalRecordsPage'
import { BillingPage } from './components/pages/BillingPage'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { ErrorBoundary } from './components/common/ErrorBoundary'

function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-50">
        {isAuthenticated ? (
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/medical-records" element={<MedicalRecordsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        ) : (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default App