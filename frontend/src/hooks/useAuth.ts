import { useState, useEffect, useCallback } from 'react'
import { User, AuthState, LoginCredentials } from '../types'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

// Authentication hook with optimized state management
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('hospital_token')
        const userStr = localStorage.getItem('hospital_user')
        
        if (token && userStr) {
          const user = JSON.parse(userStr) as User
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid stored data
        localStorage.removeItem('hospital_token')
        localStorage.removeItem('hospital_user')
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }))
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { user, token } = await apiService.login(credentials)
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })

      toast.success(`Welcome back, ${user.firstName}!`)
      return { success: true }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }))
      
      const errorMessage = error.message || 'Login failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await apiService.logout()
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })

      toast.success('Logged out successfully')
    } catch (error: any) {
      console.error('Logout error:', error)
      // Force logout even on error
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }, [])

  // Update user data
  const updateUser = useCallback((updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }))
    localStorage.setItem('hospital_user', JSON.stringify(updatedUser))
  }, [])

  // Check if user has specific role
  const hasRole = useCallback((role: string | string[]) => {
    if (!authState.user) return false
    
    if (Array.isArray(role)) {
      return role.includes(authState.user.role)
    }
    
    return authState.user.role === role
  }, [authState.user])

  // Check if user has admin privileges
  const isAdmin = useCallback(() => {
    return hasRole('admin')
  }, [hasRole])

  // Check if user can access specific department
  const canAccessDepartment = useCallback((department: string) => {
    if (!authState.user) return false
    
    // Admins can access all departments
    if (authState.user.role === 'admin') return true
    
    // Users can access their own department
    return authState.user.department === department
  }, [authState.user])

  return {
    ...authState,
    login,
    logout,
    updateUser,
    hasRole,
    isAdmin,
    canAccessDepartment,
  }
}