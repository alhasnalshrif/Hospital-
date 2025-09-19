import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Search,
  Settings
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { BaseComponentProps } from '../../types'
import { cn, formatName, getInitials } from '../../utils/cn'

interface LayoutProps extends BaseComponentProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
  requiredRoles?: string[]
}

export function Layout({ children, className }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, hasRole } = useAuth()
  const location = useLocation()

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Patients',
      href: '/patients',
      icon: Users,
    },
    {
      name: 'Appointments',
      href: '/appointments',
      icon: Calendar,
    },
    {
      name: 'Medical Records',
      href: '/medical-records',
      icon: FileText,
      requiredRoles: ['admin', 'doctor', 'nurse'],
    },
    {
      name: 'Billing',
      href: '/billing',
      icon: CreditCard,
      requiredRoles: ['admin', 'cashier', 'doctor'],
    },
  ]

  // Filter navigation based on user roles
  const filteredNavigation = navigation.filter(item => {
    if (!item.requiredRoles) return true
    return hasRole(item.requiredRoles)
  }).map(item => ({
    ...item,
    current: location.pathname === item.href
  }))

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className={cn('min-h-screen bg-neutral-50', className)}>
      {/* Mobile sidebar overlay */}
      <div className={cn(
        'fixed inset-0 z-40 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div 
          className="fixed inset-0 bg-neutral-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent 
          navigation={filteredNavigation}
          user={user}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent 
          navigation={filteredNavigation}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-neutral-200">
          <div className="flex h-16 justify-between items-center px-4 sm:px-6 lg:px-8">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Search bar */}
            <div className="flex-1 max-w-lg mx-4 lg:mx-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search patients, appointments..."
                  className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:placeholder-neutral-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 rounded-md">
                <Bell className="h-5 w-5" />
              </button>

              {/* Settings */}
              <button className="p-2 text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 rounded-md">
                <Settings className="h-5 w-5" />
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                    {user ? getInitials(user.firstName, user.lastName) : 'U'}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-neutral-900">
                    {user ? formatName(user.firstName, user.lastName) : 'User'}
                  </div>
                  <div className="text-xs text-neutral-500 capitalize">
                    {user?.role || 'Role'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  navigation: NavigationItem[]
  user: any
  onClose?: () => void
  onLogout: () => void
}

function SidebarContent({ navigation, user, onClose, onLogout }: SidebarContentProps) {
  return (
    <div className="flex flex-col flex-grow bg-white shadow-lg">
      {/* Logo and close button */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="ml-2 text-xl font-semibold text-neutral-900">HMS</span>
        </div>
        {onClose && (
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150',
                item.current
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              <Icon 
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  item.current
                    ? 'text-primary-600'
                    : 'text-neutral-400 group-hover:text-neutral-500'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-neutral-200 p-4">
        {user && (
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {formatName(user.firstName, user.lastName)}
              </p>
              <p className="text-xs text-neutral-500 truncate capitalize">
                {user.role} • {user.department}
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-neutral-100 hover:text-neutral-900 transition-colors duration-150"
        >
          <LogOut className="mr-3 h-5 w-5 text-neutral-400" />
          Sign out
        </button>
      </div>
    </div>
  )
}