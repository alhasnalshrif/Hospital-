import { useQuery } from '@tanstack/react-query'
import { 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Activity
} from 'lucide-react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { apiService } from '../../services/api'
import { DashboardStats } from '../../types'
import { formatCurrency, formatDate } from '../../utils/cn'

export function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats(),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  })

  if (isLoading) {
    return (
      <div className="container-fluid py-8">
        <div className="mb-8">
          <div className="skeleton-title mb-4"></div>
          <div className="skeleton-text w-1/2"></div>
        </div>
        <div className="grid-responsive">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-fluid py-8">
        <div className="bg-error-50 border border-error-200 rounded-md p-4">
          <p className="text-error-800">
            Failed to load dashboard data. Please try again.
          </p>
        </div>
      </div>
    )
  }

  const overview = stats?.overview || {}
  const monthlyTrends = stats?.monthlyTrends || []

  const statsCards = [
    {
      title: 'Total Patients',
      value: overview.totalPatients || 0,
      icon: Users,
      color: 'primary',
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      title: "Today's Appointments",
      value: overview.todaysAppointments || 0,
      icon: Calendar,
      color: 'success',
      change: '+5%',
      changeType: 'increase' as const,
    },
    {
      title: 'Recent Records',
      value: overview.recentRecords || 0,
      icon: FileText,
      color: 'warning',
      change: '+8%',
      changeType: 'increase' as const,
    },
    {
      title: 'Pending Bills',
      value: formatCurrency(overview.pendingBills?.totalAmount || 0),
      icon: CreditCard,
      color: 'error',
      change: '-3%',
      changeType: 'decrease' as const,
      subtitle: `${overview.pendingBills?.count || 0} bills`,
    },
  ]

  return (
    <div className="container-fluid py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Dashboard
        </h1>
        <p className="text-neutral-600">
          Welcome back! Here's what's happening at your hospital today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive mb-8">
        {statsCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and detailed views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trends */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Trends</h3>
          </div>
          <div className="card-content">
            {monthlyTrends.length > 0 ? (
              <div className="space-y-4">
                {monthlyTrends.slice(-6).map((trend, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        {formatDate(trend.month, 'long')}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {trend.visits} visits
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900">
                        {formatCurrency(trend.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                <p className="text-neutral-600">No trend data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <QuickActionButton
                icon={Users}
                title="Add New Patient"
                description="Register a new patient"
                color="primary"
              />
              <QuickActionButton
                icon={Calendar}
                title="Schedule Appointment"
                description="Book a new appointment"
                color="success"
              />
              <QuickActionButton
                icon={FileText}
                title="Create Medical Record"
                description="Add patient record"
                color="warning"
              />
              <QuickActionButton
                icon={CreditCard}
                title="Generate Bill"
                description="Create new bill"
                color="error"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="card-content">
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <p className="text-neutral-600">No recent activity</p>
            <p className="text-xs text-neutral-500">
              Activity will appear here as users interact with the system
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color: 'primary' | 'success' | 'warning' | 'error'
  change?: string
  changeType?: 'increase' | 'decrease'
  subtitle?: string
}

function StatCard({ title, value, icon: Icon, color, change, changeType, subtitle }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
  }

  return (
    <div className="card hover:shadow-medium transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-neutral-900">{value}</p>
            {change && (
              <span className={`ml-2 flex items-center text-xs font-medium ${
                changeType === 'increase' ? 'text-success-600' : 'text-error-600'
              }`}>
                {changeType === 'increase' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {change}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-neutral-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: 'primary' | 'success' | 'warning' | 'error'
}

function QuickActionButton({ icon: Icon, title, description, color }: QuickActionButtonProps) {
  const colorClasses = {
    primary: 'text-primary-600 bg-primary-50 hover:bg-primary-100',
    success: 'text-success-600 bg-success-50 hover:bg-success-100',
    warning: 'text-warning-600 bg-warning-50 hover:bg-warning-100',
    error: 'text-error-600 bg-error-50 hover:bg-error-100',
  }

  return (
    <button className={`w-full p-3 rounded-lg border-2 border-transparent hover:border-current transition-all duration-200 ${colorClasses[color]}`}>
      <div className="flex items-center text-left">
        <Icon className="h-5 w-5 mr-3" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs opacity-75">{description}</p>
        </div>
      </div>
    </button>
  )
}